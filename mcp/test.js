#!/usr/bin/env node
/**
 * Agent Core: MCP Integration Test Suite
 *
 * Spawns mcp/server.js as a child process and communicates via JSON-RPC 2.0 over stdio.
 * Verifies protocol handshake, tool registry, and behavioral outcome verification.
 */

const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');
const fs = require('fs');

const SERVER_PATH = path.join(__dirname, 'server.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`PASS: ${message}`);
    passedTests++;
  }
}

async function runTests() {
  console.log('======================================================');
  console.log('       AGENT CORE MCP SERVER INTEGRATION TESTS');
  console.log('======================================================');

  const child = spawn(process.execPath, [SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const rl = readline.createInterface({
    input: child.stdout,
    terminal: false
  });

  const pendingRequests = new Map();

  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const response = JSON.parse(trimmed);
      const resolver = pendingRequests.get(response.id);
      if (resolver) {
        pendingRequests.delete(response.id);
        resolver(response);
      }
    } catch (err) {
      console.error('Failed to parse line from MCP server:', trimmed, err);
    }
  });

  let requestId = 0;
  function sendRequest(method, params = {}) {
    requestId++;
    const id = requestId;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pendingRequests.delete(id);
        reject(new Error(`Timeout waiting for response to request #${id} (${method})`));
      }, 10000);

      pendingRequests.set(id, (res) => {
        clearTimeout(timer);
        resolve(res);
      });

      child.stdin.write(payload);
    });
  }

  try {
    // 1. Initialize Handshake
    const initRes = await sendRequest('initialize', { protocolVersion: '2024-11-05' });
    assert(initRes && initRes.result, 'initialize response received');
    assert(initRes.result.serverInfo && initRes.result.serverInfo.name === 'agent-core', 'server name is agent-core');
    assert(initRes.result.protocolVersion === '2024-11-05', 'protocol version matches 2024-11-05');

    // 2. Discover Tools
    const toolsRes = await sendRequest('tools/list');
    assert(toolsRes && toolsRes.result && Array.isArray(toolsRes.result.tools), 'tools/list returned tool array');
    const toolNames = toolsRes.result.tools.map(t => t.name);
    assert(toolNames.includes('get_principles'), 'tool get_principles registered');
    assert(toolNames.includes('create_execution_plan'), 'tool create_execution_plan registered');
    assert(toolNames.includes('create_checkpoint'), 'tool create_checkpoint registered');
    assert(toolNames.includes('run_audit'), 'tool run_audit registered');
    assert(toolNames.includes('verify_outcome'), 'tool verify_outcome registered');

    // 3. Call get_principles
    const principlesRes = await sendRequest('tools/call', {
      name: 'get_principles',
      arguments: { focus_area: 'surgical' }
    });
    assert(principlesRes.result && principlesRes.result.content, 'get_principles returned content');
    const principlesText = principlesRes.result.content[0].text;
    assert(principlesText.includes('surgical') || principlesText.includes('Surgical'), 'get_principles contains surgical guidance');

    // 4. Call create_execution_plan
    const planRes = await sendRequest('tools/call', {
      name: 'create_execution_plan',
      arguments: { goal: 'Refactor test suite', constraints: 'Zero external dependencies' }
    });
    assert(planRes.result && planRes.result.content, 'create_execution_plan returned content');
    const planText = planRes.result.content[0].text;
    assert(planText.includes('Refactor test suite'), 'plan contains specified goal');
    assert(planText.includes('Eight-Phase Loop'), 'plan contains Eight-Phase Loop');

    // 5. Call create_checkpoint (Non-destructive patch snapshot)
    const checkpointRes = await sendRequest('tools/call', {
      name: 'create_checkpoint',
      arguments: { name: 'ci_test_checkpoint' }
    });
    assert(checkpointRes.result && checkpointRes.result.content, 'create_checkpoint returned content');
    const checkpointText = checkpointRes.result.content[0].text;
    assert(checkpointText.includes('checkpoint'), 'checkpoint response confirms operation');

    // 6. Call run_audit
    const auditRes = await sendRequest('tools/call', {
      name: 'run_audit',
      arguments: { scope: 'Updated MCP server', checklist: ['Check zero dependencies', 'Check exit codes'] }
    });
    assert(auditRes.result && auditRes.result.content, 'run_audit returned content');
    const auditText = auditRes.result.content[0].text;
    assert(auditText.includes('Active Audit') && auditText.includes('Audit Questions'), 'audit response contains Active Audit');

    // 7. verify_outcome: Live command passing
    const passCmdRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Process exits cleanly',
        command: 'node -e "process.exit(0)"'
      }
    });
    assert(passCmdRes.result && passCmdRes.result.content, 'verify_outcome (command pass) returned result');
    const passCmdData = JSON.parse(passCmdRes.result.content[0].text);
    assert(passCmdData.status === 'PASS', 'verify_outcome command exit 0 gives PASS status');
    assert(passCmdData.exit_code === 0, 'verify_outcome command reports exit_code 0');

    // 8. verify_outcome: Live command failing
    const failCmdRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Process failure detection',
        command: 'node -e "process.exit(1)"'
      }
    });
    assert(failCmdRes.result && failCmdRes.result.content, 'verify_outcome (command fail) returned result');
    const failCmdData = JSON.parse(failCmdRes.result.content[0].text);
    assert(failCmdData.status === 'FAIL', 'verify_outcome command exit 1 gives FAIL status');
    assert(failCmdData.exit_code === 1, 'verify_outcome command reports exit_code 1');

    // 9. verify_outcome: Artifact verification (existing non-empty file)
    const pkgPath = path.join(__dirname, 'package.json');
    const filePassRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Package manifest exists and is valid',
        file_path: pkgPath
      }
    });
    assert(filePassRes.result && filePassRes.result.content, 'verify_outcome (file pass) returned result');
    const filePassData = JSON.parse(filePassRes.result.content[0].text);
    assert(filePassData.status === 'PASS', 'verify_outcome existing clean file gives PASS status');
    assert(filePassData.size_bytes > 0, 'verify_outcome existing file reports non-zero byte size');

    // 10. verify_outcome: Artifact verification (stub detected -> PARTIAL)
    const tempStubFile = path.join(__dirname, 'temp_stub_test.txt');
    fs.writeFileSync(tempStubFile, '// TODO: implement feature later\n', 'utf8');
    const filePartialRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Stub file detection',
        file_path: tempStubFile
      }
    });
    fs.unlinkSync(tempStubFile);
    assert(filePartialRes.result && filePartialRes.result.content, 'verify_outcome (file stub) returned result');
    const filePartialData = JSON.parse(filePartialRes.result.content[0].text);
    assert(filePartialData.status === 'PARTIAL', 'verify_outcome stub file returns PARTIAL status');
    assert(filePartialData.warning && filePartialData.warning.includes('TODO'), 'verify_outcome flags TODO warning');

    // 11. verify_outcome: Artifact verification (missing file)
    const fileFailRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Missing file rejection',
        file_path: path.join(__dirname, 'definitely_nonexistent_file_12345.txt')
      }
    });
    assert(fileFailRes.result && fileFailRes.result.content, 'verify_outcome (missing file) returned result');
    const fileFailData = JSON.parse(fileFailRes.result.content[0].text);
    assert(fileFailData.status === 'FAIL', 'verify_outcome missing file gives FAIL status');

    // 12. verify_outcome: Pure text assertion rejected as UNVERIFIED
    const textOnlyRes = await sendRequest('tools/call', {
      name: 'verify_outcome',
      arguments: {
        requirement: 'Agent claims all tests passed verbally',
        evidence: 'I ran all unit tests and everything was successful 100%'
      }
    });
    assert(textOnlyRes.result && textOnlyRes.result.content, 'verify_outcome (text only) returned result');
    const textOnlyData = JSON.parse(textOnlyRes.result.content[0].text);
    assert(textOnlyData.status === 'UNVERIFIED', 'verify_outcome pure text claim returns UNVERIFIED');
    assert(textOnlyData.verification_method === 'unverified_text_assertion', 'verification method flagged as unverified_text_assertion');

    // Cleanup checkpoint test artifacts
    const cpDir = path.join(process.cwd(), '.agent-core', 'checkpoints');
    if (fs.existsSync(cpDir)) {
      const files = fs.readdirSync(cpDir);
      for (const file of files) {
        if (file.startsWith('ci_test_checkpoint')) {
          try { fs.unlinkSync(path.join(cpDir, file)); } catch (e) {}
        }
      }
    }

    console.log('------------------------------------------------------');
    console.log(`Summary: All ${passedTests}/${totalTests} integration tests passed successfully.`);
    console.log('======================================================');

    child.kill();
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed with error:', err);
    child.kill();
    process.exit(1);
  }
}

runTests();
