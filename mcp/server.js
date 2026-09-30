#!/usr/bin/env node
/**
 * Agent Core: Model Context Protocol (MCP) Server
 *
 * Implements the standard MCP JSON-RPC 2.0 protocol over stdio.
 * Active Verification Engine for AI Coding & Software Engineering Agents.
 * Zero external dependencies, runs directly on Node.js 18+.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const SERVER_NAME = 'agent-core';
const SERVER_VERSION = '1.1.0';
const PROTOCOL_VERSION = '2024-11-05';

function readReference(name) {
  const candidates = [
    path.join(__dirname, '..', 'skills', 'agent-core', 'references', `${name}.md`),
    path.join(__dirname, '..', 'references', `${name}.md`),
    path.join(__dirname, 'references', `${name}.md`),
    path.join(process.cwd(), 'skills', 'agent-core', 'references', `${name}.md`),
    path.join(process.cwd(), 'references', `${name}.md`)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return fs.readFileSync(candidate, 'utf8');
    }
  }
  return null;
}

// -------------------------------------------------------------
// Tool Definitions
// -------------------------------------------------------------

const TOOLS = [
  {
    name: 'get_principles',
    description: 'Retrieve Agent Core behavioral principles to guide thinking, avoid hallucinations, enforce surgical changes, and preserve user intent.',
    inputSchema: {
      type: 'object',
      properties: {
        focus_area: {
          type: 'string',
          description: 'Optional focus filter: thinking, simplicity, surgical, honesty, or verification.'
        }
      }
    }
  },
  {
    name: 'create_execution_plan',
    description: 'Generate an eight-phase execution checklist (Understand, Inspect, Define Success, Plan, Execute, Checkpoint, Validate, Complete) for a software engineering task.',
    inputSchema: {
      type: 'object',
      properties: {
        goal: {
          type: 'string',
          description: 'The core goal or task description.'
        },
        constraints: {
          type: 'string',
          description: 'Known constraints, tech stack limitations, or explicit scope boundaries.'
        }
      },
      required: ['goal']
    }
  },
  {
    name: 'create_checkpoint',
    description: 'Create a non-destructive safety snapshot patch before executing risky or destructive code modifications. Does NOT stash or disrupt working tree.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Label or brief message describing the checkpoint.'
        },
        target_path: {
          type: 'string',
          description: 'Optional directory path to checkpoint. Defaults to current directory.'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'run_audit',
    description: 'Generate an active defect-hunting checklist to uncover regressions, edge cases, and unverified completion claims.',
    inputSchema: {
      type: 'object',
      properties: {
        scope: {
          type: 'string',
          description: 'Summary of what was changed, created, or completed.'
        },
        checklist: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional specific criteria to actively challenge.'
        }
      },
      required: ['scope']
    }
  },
  {
    name: 'verify_outcome',
    description: 'Active verification engine. Executes real commands (tests/builds) or inspects artifacts on disk. Rejects unverified text claims without execution proof.',
    inputSchema: {
      type: 'object',
      properties: {
        requirement: {
          type: 'string',
          description: 'The specific requirement or acceptance criterion being verified.'
        },
        command: {
          type: 'string',
          description: 'Live shell command to execute for direct proof (e.g. npm test, pytest, cargo test, node script.js).'
        },
        file_path: {
          type: 'string',
          description: 'Artifact file path to inspect on disk (verifies file exists, size > 0, and scans for placeholder patterns).'
        },
        cwd: {
          type: 'string',
          description: 'Optional working directory for command execution.'
        },
        evidence: {
          type: 'string',
          description: 'Supplemental text notes. Note: text alone without command or file_path yields UNVERIFIED.'
        }
      },
      required: ['requirement']
    }
  }
];

// -------------------------------------------------------------
// Tool Handlers
// -------------------------------------------------------------

function handleGetPrinciples(args) {
  const content = readReference('principles') || `
Core Agent Principles:
1. Think before acting: Inspect real files first. Clarify ambiguity.
2. Simplicity first: Choose the most direct path. Avoid premature abstractions.
3. Surgical changes: Touch only what is required. Preserve conventions.
4. Goal-driven execution: Define observable success criteria first.
5. Zero fabrication: Never invent facts, tool runs, or test outputs.
6. Preserve user intent: Adhere strictly to constraints and requested scope.
7. Verify before completion: Complete only when confirmed by evidence.
`;
  const focus = (args && args.focus_area ? args.focus_area.toLowerCase() : '');
  if (!focus) {
    return content;
  }
  return `Focus: ${focus}\n\n` + content;
}

function handleCreateExecutionPlan(args) {
  const goal = args.goal;
  const constraints = args.constraints || 'None specified';
  
  return `# Execution Plan: ${goal}

## Constraints & Scope
${constraints}

## Eight-Phase Loop
- [ ] 1. Understand: Confirm user intent and required deliverables.
- [ ] 2. Inspect: Check existing workspace, dependencies, and git state.
- [ ] 3. Define Success: Map requirements to observable, testable criteria.
- [ ] 4. Plan: Outline surgical, proportional steps.
- [ ] 5. Execute: Implement planned changes minimally.
- [ ] 6. Checkpoint: Save clean working state before risky actions.
- [ ] 7. Validate: Run tests and inspect outputs after milestones.
- [ ] 8. Complete: Verify all success criteria with direct evidence.

## Recovery Rule
If a regression occurs: STOP -> Roll back to checkpoint -> Reassess diagnosis -> Apply revised fix.`;
}

function handleCreateCheckpoint(args) {
  const name = (args && args.name ? args.name.trim() : 'checkpoint');
  const targetDir = (args && args.target_path ? path.resolve(args.target_path) : process.cwd());
  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const timestamp = Date.now();
  const checkpointDir = path.join(targetDir, '.agent-core', 'checkpoints');

  try {
    fs.mkdirSync(checkpointDir, { recursive: true });
    const isGit = fs.existsSync(path.join(targetDir, '.git'));
    if (isGit) {
      const diffOutput = execSync('git diff HEAD', { cwd: targetDir, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const patchFile = path.join(checkpointDir, `${sanitized}-${timestamp}.patch`);
      if (diffOutput.trim()) {
        fs.writeFileSync(patchFile, diffOutput, 'utf8');
        return `Non-destructive checkpoint "${name}" created successfully.\n- Patch snapshot saved: ${patchFile}\n- Working tree was NOT modified.\n- To restore this checkpoint: git apply "${patchFile}"`;
      } else {
        return `Checkpoint "${name}": Working tree is already clean (HEAD matches working directory). No uncommitted diffs to capture.`;
      }
    } else {
      const noteFile = path.join(checkpointDir, `${sanitized}-${timestamp}.json`);
      fs.writeFileSync(noteFile, JSON.stringify({ name, timestamp, targetDir }, null, 2), 'utf8');
      return `Checkpoint "${name}" noted in non-git directory: ${noteFile}`;
    }
  } catch (err) {
    return `Checkpoint creation note: ${err.message}`;
  }
}

function handleRunAudit(args) {
  const scope = args.scope;
  const items = args.checklist || [
    'Are there any unhandled errors or missing edge cases?',
    'Did changes introduce broken imports, syntax errors, or regressions?',
    'Do actual outputs match 100% of user constraints?',
    'Are all claims backed by execution evidence rather than assumptions?'
  ];
  
  let report = `# Agent Core Active Audit\n\n**Scope:** ${scope}\n\n## Audit Questions\n`;
  items.forEach((item, idx) => {
    report += `${idx + 1}. [ ] ${item}\n`;
  });
  report += `\n**Rule:** Assume nothing. Actively hunt for defects. If errors are found, fix and re-audit.`;
  return report;
}

function handleVerifyOutcome(args) {
  const req = args.requirement;
  const command = args.command ? args.command.trim() : null;
  const filePath = args.file_path ? args.file_path.trim() : null;
  const evidenceText = args.evidence ? args.evidence.trim() : null;

  // Case 1: Live Command Execution Verification
  if (command) {
    const cwd = args.cwd ? path.resolve(args.cwd) : process.cwd();
    const startTime = Date.now();
    try {
      const output = execSync(command, {
        cwd: cwd,
        encoding: 'utf8',
        timeout: 20000,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      const duration = Date.now() - startTime;
      return JSON.stringify({
        requirement: req,
        status: 'PASS',
        verification_method: 'live_command_execution',
        command: command,
        exit_code: 0,
        duration_ms: duration,
        evidence: (output || '(Command completed with exit code 0 and no output)').slice(0, 1000),
        reasoning: 'Command executed directly by Agent Core MCP server and terminated with exit code 0.'
      }, null, 2);
    } catch (err) {
      const duration = Date.now() - startTime;
      const stdout = err.stdout ? err.stdout.toString() : '';
      const stderr = err.stderr ? err.stderr.toString() : '';
      const exitCode = err.status !== undefined ? err.status : 1;
      return JSON.stringify({
        requirement: req,
        status: 'FAIL',
        verification_method: 'live_command_execution',
        command: command,
        exit_code: exitCode,
        duration_ms: duration,
        error_output: (stderr || stdout || err.message).slice(0, 1000),
        reasoning: `Command failed with exit code ${exitCode}. Direct execution disproved completion claim.`
      }, null, 2);
    }
  }

  // Case 2: Artifact Integrity Verification
  if (filePath) {
    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      return JSON.stringify({
        requirement: req,
        status: 'FAIL',
        verification_method: 'artifact_integrity_check',
        file_path: resolvedPath,
        reasoning: `Target artifact does not exist on disk at ${resolvedPath}. Completion claim rejected.`
      }, null, 2);
    }

    const stats = fs.statSync(resolvedPath);
    if (stats.size === 0) {
      return JSON.stringify({
        requirement: req,
        status: 'FAIL',
        verification_method: 'artifact_integrity_check',
        file_path: resolvedPath,
        reasoning: 'Target artifact exists but is 0 bytes (empty file). Completion claim rejected.'
      }, null, 2);
    }

    // Inspect content for placeholder patterns (comments or stubs indicating incomplete work)
    const content = fs.readFileSync(resolvedPath, 'utf8');
    const stubPattern = /\b(TODO|FIXME|XXX|REPLACE_ME|INSERT_CODE_HERE|NOT_YET_IMPLEMENTED)\b/;
    const stubMatch = content.match(stubPattern);
    if (stubMatch) {
      return JSON.stringify({
        requirement: req,
        status: 'PARTIAL',
        verification_method: 'artifact_integrity_check',
        file_path: resolvedPath,
        size_bytes: stats.size,
        warning: `Detected placeholder string: "${stubMatch[0]}"`,
        reasoning: 'File exists with content, but contains placeholder patterns indicating incomplete work.'
      }, null, 2);
    }

    return JSON.stringify({
      requirement: req,
      status: 'PASS',
      verification_method: 'artifact_integrity_check',
      file_path: resolvedPath,
      size_bytes: stats.size,
      reasoning: 'Artifact verified on filesystem: exists, non-empty, and free of placeholder patterns.'
    }, null, 2);
  }

  // Case 3: Only text provided without verification vector
  return JSON.stringify({
    requirement: req,
    status: 'UNVERIFIED',
    verification_method: 'unverified_text_assertion',
    reasoning: 'Text claims alone cannot verify outcome. Provide "command" to execute a live test runner or "file_path" to verify artifact on disk.',
    provided_text: evidenceText ? evidenceText.slice(0, 200) : null
  }, null, 2);
}

// -------------------------------------------------------------
// JSON-RPC Request Dispatcher
// -------------------------------------------------------------

function processRequest(msg) {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: {
          tools: {},
          resources: {},
          prompts: {}
        },
        serverInfo: {
          name: SERVER_NAME,
          version: SERVER_VERSION
        }
      }
    };
  }

  if (method === 'notifications/initialized') {
    return null;
  }

  if (method === 'ping') {
    return { jsonrpc: '2.0', id: id, result: {} };
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        tools: TOOLS
      }
    };
  }

  if (method === 'tools/call') {
    const toolName = params && params.name;
    const args = (params && params.arguments) || {};
    let textResult = '';

    switch (toolName) {
      case 'get_principles':
        textResult = handleGetPrinciples(args);
        break;
      case 'create_execution_plan':
        textResult = handleCreateExecutionPlan(args);
        break;
      case 'create_checkpoint':
        textResult = handleCreateCheckpoint(args);
        break;
      case 'run_audit':
        textResult = handleRunAudit(args);
        break;
      case 'verify_outcome':
        textResult = handleVerifyOutcome(args);
        break;
      default:
        return {
          jsonrpc: '2.0',
          id: id,
          error: {
            code: -32601,
            message: `Tool '${toolName}' not found`
          }
        };
    }

    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        content: [
          {
            type: 'text',
            text: textResult
          }
        ]
      }
    };
  }

  if (method === 'resources/list') {
    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        resources: [
          {
            uri: 'agent-core://principles',
            name: 'Agent Core Principles',
            mimeType: 'text/markdown',
            description: 'Universal behavioral rules and thinking discipline'
          },
          {
            uri: 'agent-core://execution',
            name: 'Universal Execution',
            mimeType: 'text/markdown',
            description: '8-phase task execution guide'
          },
          {
            uri: 'agent-core://verification',
            name: 'Universal Verification',
            mimeType: 'text/markdown',
            description: 'Active verification, evidence hierarchy, and defect audit'
          }
        ]
      }
    };
  }

  if (method === 'resources/read') {
    const uri = params && params.uri;
    let text = '';
    if (uri === 'agent-core://principles') text = readReference('principles') || '';
    else if (uri === 'agent-core://execution') text = readReference('execution') || '';
    else if (uri === 'agent-core://verification') text = readReference('verification') || '';
    else {
      return {
        jsonrpc: '2.0',
        id: id,
        error: { code: -32602, message: `Resource '${uri}' not found` }
      };
    }

    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        contents: [
          {
            uri: uri,
            mimeType: 'text/markdown',
            text: text
          }
        ]
      }
    };
  }

  if (method === 'prompts/list') {
    return {
      jsonrpc: '2.0',
      id: id,
      result: {
        prompts: [
          {
            name: 'agent-core-session',
            description: 'Start an autonomous coding session enforcing Agent Core principles.'
          },
          {
            name: 'agent-core-audit',
            description: 'Perform an active audit on recent software engineering changes.'
          }
        ]
      }
    };
  }

  if (method === 'prompts/get') {
    const promptName = params && params.name;
    if (promptName === 'agent-core-session') {
      return {
        jsonrpc: '2.0',
        id: id,
        result: {
          description: 'Agent Core Session Starter',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Begin coding task following Agent Core principles: think before acting, surgical changes, and evidence-based verification before completion.'
              }
            }
          ]
        }
      };
    }
    if (promptName === 'agent-core-audit') {
      return {
        jsonrpc: '2.0',
        id: id,
        result: {
          description: 'Agent Core Active Audit',
          messages: [
            {
              role: 'user',
              content: {
                type: 'text',
                text: 'Perform an active audit: assume nothing, inspect actual outputs, hunt for broken edge cases, and report verified evidence.'
              }
            }
          ]
        }
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id: id,
    error: {
      code: -32601,
      message: `Method '${method}' not implemented`
    }
  };
}

// -------------------------------------------------------------
// Stdio Message Loop
// -------------------------------------------------------------

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  try {
    const msg = JSON.parse(trimmed);
    const response = processRequest(msg);
    if (response) {
      process.stdout.write(JSON.stringify(response) + '\n');
    }
  } catch (err) {
    const errResp = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error: invalid JSON'
      }
    };
    process.stdout.write(JSON.stringify(errResp) + '\n');
  }
});
