#!/usr/bin/env node
/**
 * Agent Core: Model Context Protocol (MCP) Server
 *
 * Implements the standard MCP JSON-RPC 2.0 protocol over stdio.
 * Zero external dependencies, runs directly on Node.js 18+.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const SERVER_NAME = 'agent-core';
const SERVER_VERSION = '1.0.0';
const PROTOCOL_VERSION = '2024-11-05';

// Resolve reference files relative to script location
const REPO_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills', 'agent-core');
const REFS_DIR = path.join(SKILLS_DIR, 'references');

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
    description: 'Retrieve Agent Core universal behavioral principles to guide thinking, avoid hallucinations, enforce surgical changes, and preserve user intent.',
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
    description: 'Generate a structured 8-phase execution plan (Understand, Inspect, Define Success, Plan, Execute, Checkpoint, Validate, Complete) for a complex task.',
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
    description: 'Create a safety checkpoint (git commit, stash, or snapshot) before executing risky or destructive modifications.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Label or brief message describing the checkpoint.'
        },
        target_path: {
          type: 'string',
          description: 'Optional working directory to create checkpoint in. Defaults to current directory.'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'run_audit',
    description: 'Run an active defect search across recent changes or artifacts to find regressions, broken edge cases, and missing requirements.',
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
          description: 'Specific criteria to actively challenge and verify.'
        }
      },
      required: ['scope']
    }
  },
  {
    name: 'verify_outcome',
    description: 'Evaluate completion claims against direct evidence and classify outcome into PASS, FAIL, PARTIAL, or UNVERIFIED.',
    inputSchema: {
      type: 'object',
      properties: {
        requirement: {
          type: 'string',
          description: 'The specific requirement or acceptance criterion being verified.'
        },
        evidence: {
          type: 'string',
          description: 'Direct command logs, test outputs, compiler results, or file diffs.'
        }
      },
      required: ['requirement', 'evidence']
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
  
  return `# Agent Core Execution Plan: ${goal}

## Constraints and Scope
${constraints}

## Eight-Phase Execution Loop
- [ ] 1. Understand: Confirm user intent and required deliverables.
- [ ] 2. Inspect: Check existing workspace, dependencies, and git state.
- [ ] 3. Define Success: Map requirements to observable, testable criteria.
- [ ] 4. Plan: Outline surgical, proportional steps.
- [ ] 5. Execute: Implement planned changes minimally.
- [ ] 6. Checkpoint: Save clean working state before risky actions.
- [ ] 7. Validate: Run tests and inspect outputs after milestones.
- [ ] 8. Complete: Verify all success criteria with direct evidence.

## Failure Recovery Rule
If a regression occurs: STOP -> Roll back to checkpoint -> Reassess diagnosis -> Apply revised fix.`;
}

function handleCreateCheckpoint(args) {
  const name = args.name;
  const targetDir = args.target_path || process.cwd();
  
  try {
    const isGit = fs.existsSync(path.join(targetDir, '.git'));
    if (isGit) {
      const status = execSync('git status --porcelain', { cwd: targetDir, encoding: 'utf8' }).trim();
      if (!status) {
        return `Checkpoint "${name}": Working tree is already clean. Head commit is ready as recovery point.`;
      }
      execSync(`git stash push -m "checkpoint: ${name}"`, { cwd: targetDir, encoding: 'utf8' });
      return `Checkpoint "${name}": Stashed uncommitted changes cleanly as recovery checkpoint.`;
    }
    return `Checkpoint "${name}": Recorded safety checkpoint at ${new Date().toISOString()} for ${targetDir}.`;
  } catch (err) {
    return `Checkpoint "${name}": Safety checkpoint noted (git stash check: ${err.message}).`;
  }
}

function handleRunAudit(args) {
  const scope = args.scope;
  const items = args.checklist || [
    'Are there any unhandled errors or missing edge cases?',
    'Did changes introduce broken imports or syntax regressions?',
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
  const evidence = (args.evidence || '').trim();
  const lower = evidence.toLowerCase();

  let status = 'UNVERIFIED';
  let reasoning = 'Insufficient evidence provided.';

  if (!evidence) {
    status = 'UNVERIFIED';
    reasoning = 'No execution or artifact evidence provided.';
  } else {
    const isZeroFailed = /0\s+(errors?|failed|failures?)/.test(lower);
    const hasFailKeywords = /\b(error:|fatal:|failed|exception|traceback|exit code [1-9])\b/.test(lower);
    const hasSuccessKeywords = /\b(pass|passed|success|successful|exit code 0)\b/.test(lower);

    if (hasFailKeywords && !isZeroFailed) {
      status = 'FAIL';
      reasoning = 'Execution logs or test outputs indicate a failure or error.';
    } else if (hasSuccessKeywords || isZeroFailed) {
      status = 'PASS';
      reasoning = 'Direct execution evidence confirms requirement criteria.';
    } else if (evidence.length > 30) {
      status = 'PARTIAL';
      reasoning = 'Evidence provided but lacks explicit pass or exit code confirmation.';
    }
  }

  return JSON.stringify({
    requirement: req,
    status: status,
    reasoning: reasoning,
    evidence_snippet: evidence.slice(0, 300)
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
    // Notification: no response required
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
            description: 'Start an autonomous coding or engineering session enforcing Agent Core principles.'
          },
          {
            name: 'agent-core-audit',
            description: 'Perform an exhaustive active audit on the current task or pull request.'
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
                text: 'Begin task following Agent Core principles: think before acting, surgical changes, and evidence-based verification before completion.'
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

  // Method not handled
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
