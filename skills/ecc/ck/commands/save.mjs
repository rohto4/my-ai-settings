#!/usr/bin/env node
/**
 * ck — Context Keeper v2
 * save.mjs — write session data to context.json and regenerate CONTEXT.md.
 *
 * Usage (regular save):
 *   echo '<json>' | node save.mjs
 *   JSON schema: { summary, leftOff, nextSteps[], decisions[{what,why}], blockers[], goal? }
 *
 * Usage (init — first registration):
 *   echo '<json>' | node save.mjs --init
 *   JSON schema: { name, path, description, stack[], goal, constraints[], repo? }
 *
 * stdout: confirmation message
 * exit 0: success  exit 1: error
 */

import { createHash } from 'crypto';
import { readFileSync } from 'fs';
import {
  readProjects, writeProjects, loadContext, saveContext,
  today, shortId, gitSummary,
  CURRENT_SESSION,
} from './shared.mjs';

const isInit = process.argv.includes('--init');
const cwd    = process.cwd();

// ── Read JSON from stdin ──────────────────────────────────────────────────────
let input;
try {
  const raw = readFileSync(0, 'utf8').trim();
  if (!raw) throw new Error('empty stdin');
  input = JSON.parse(raw);
} catch (e) {
  console.error(`ck save: invalid JSON on stdin — ${e.message}`);
  console.log('Expected schema (save):  {"summary":"...","leftOff":"...","nextSteps":["..."],"decisions":[{"what":"...","why":"..."}],"blockers":["..."]}');
  console.log('Expected schema (--init): {"name":"...","path":"...","description":"...","stack":["..."],"goal":"...","constraints":["..."]}');
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT MODE: first-time project registration
// ─────────────────────────────────────────────────────────────────────────────
if (isInit) {
  const { name, path: projectPath, description, stack, goal, constraints, repo } = input;

  if (!name || !projectPath) {
    console.log('ck init: name and path are required.');
    process.exit(1);
  }

  const projects = readProjects();

  // Derive contextDir (lowercase, spaces→dashes, deduplicate)
  let contextDir = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (!contextDir) {
    contextDir = `project-${createHash('sha256').update(String(projectPath)).digest('hex').slice(0, 12)}`;
  }
  let suffix = 2;
  const existingDirs = Object.values(projects).map(p => p.contextDir);
  while (existingDirs.includes(contextDir) && projects[projectPath]?.contextDir !== contextDir) {
    contextDir = `${contextDir.replace(/-\d+$/, '')}-${suffix++}`;
  }

  const context = {
    version: 2,
    name: contextDir,
    displayName: name,
    path: projectPath,
    description: description || null,
    stack: Array.isArray(stack) ? stack : (stack ? [stack] : []),
    goal: goal || null,
    constraints: Array.isArray(constraints) ? constraints : [],
    repo: repo || null,
    createdAt: today(),
    sessions: [],
  };

  saveContext(contextDir, context);

  // Update projects.json
  projects[projectPath] = {
    name,
    contextDir,
    lastUpdated: today(),
  };
  writeProjects(projects);

  console.log(`✓ Project '${name}' registered.`);
  console.log(`  Use $ck to save session state and reload it next time.`);
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE MODE: record a session
// ─────────────────────────────────────────────────────────────────────────────
const projects = readProjects();
const projectEntry = projects[cwd];

if (!projectEntry) {
  console.log("This project isn't registered yet. Use $ck to register it first.");
  process.exit(1);
}

const { contextDir } = projectEntry;
let context = loadContext(contextDir);

if (!context) {
  console.log(`ck: context.json not found for '${contextDir}'. The install may be corrupted.`);
  process.exit(1);
}

// Get session ID from current-session.json
let sessionId;
try {
  const sess = JSON.parse(readFileSync(CURRENT_SESSION, 'utf8'));
  sessionId = sess.sessionId || shortId();
} catch {
  sessionId = shortId();
}

// Check for duplicate (re-save of same session)
const existingIdx = context.sessions.findIndex(s => s.id === sessionId);

const { summary, leftOff, nextSteps, decisions, blockers, goal } = input;

// Capture git activity since the last session
const lastSessionDate = context.sessions?.[context.sessions.length - 1]?.date;
const gitActivity = gitSummary(cwd, lastSessionDate);

const session = {
  id: sessionId,
  date: today(),
  summary: summary || 'Session saved',
  leftOff: leftOff || null,
  nextSteps: Array.isArray(nextSteps) ? nextSteps : (nextSteps ? [nextSteps] : []),
  decisions: Array.isArray(decisions) ? decisions : [],
  blockers: Array.isArray(blockers) ? blockers.filter(Boolean) : [],
  ...(gitActivity ? { gitActivity } : {}),
};

if (existingIdx >= 0) {
  // Update existing session (re-save)
  context.sessions[existingIdx] = session;
} else {
  context.sessions.push(session);
}

// Update goal if provided
if (goal && goal !== context.goal) {
  context.goal = goal;
}

// Save context.json + regenerate CONTEXT.md
saveContext(contextDir, context);

// Update projects.json timestamp
projects[cwd].lastUpdated = today();
writeProjects(projects);

console.log(`✓ Saved. Session: ${sessionId.slice(0, 8)}`);
if (gitActivity) console.log(`  Git: ${gitActivity}`);
console.log(`  See you next time.`);
