#!/usr/bin/env node

import { createHash, randomBytes } from 'crypto';
import {
  appendFileSync, closeSync, mkdirSync, openSync, readFileSync, renameSync,
  statSync, unlinkSync, writeFileSync,
} from 'fs';
import { homedir } from 'os';
import { dirname, basename, resolve } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(skillDir, 'config.json');
const codexHome = process.env.CODEX_HOME
  ? resolve(process.env.CODEX_HOME)
  : resolve(homedir(), '.codex');
const stateRoot = resolve(codexHome, 'continuous-learning-v2');

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function git(args, cwd) {
  try {
    const result = spawnSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8', timeout: 3000, windowsHide: true,
    });
    return result.status === 0 ? result.stdout.trim() : '';
  } catch {
    return '';
  }
}

function projectFor(cwd) {
  const root = git(['rev-parse', '--show-toplevel'], cwd);
  if (!root) return null;
  const remote = git(['remote', 'get-url', 'origin'], root);
  const identity = remote || resolve(root);
  return {
    id: createHash('sha256').update(identity).digest('hex').slice(0, 12),
    name: basename(root),
  };
}

function shortHash(value) {
  if (value === null || value === undefined || value === '') return null;
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function safeKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.keys(value).map((key) => {
    const bounded = String(key).slice(0, 80);
    return /authorization|cookie|credential|password|passwd|private|secret|token|api[_-]?key/i.test(bounded)
      ? '[sensitive-key]'
      : bounded;
  }).sort();
}

function responseMetadata(value) {
  if (value === null || value === undefined) return { type: 'null' };
  if (Array.isArray(value)) return { type: 'array', length: value.length };
  if (typeof value === 'object') {
    const metadata = { type: 'object', keys: safeKeys(value) };
    if (typeof value.isError === 'boolean') metadata.is_error = value.isError;
    return metadata;
  }
  return { type: typeof value };
}

function sleep(milliseconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function withStateLock(action) {
  mkdirSync(stateRoot, { recursive: true });
  const lockPath = resolve(stateRoot, '.observe.lock');
  const deadline = Date.now() + 3000;
  let descriptor;

  while (descriptor === undefined) {
    try {
      descriptor = openSync(lockPath, 'wx', 0o600);
    } catch (error) {
      if (error?.code !== 'EEXIST') return false;
      try {
        if (Date.now() - statSync(lockPath).mtimeMs > 30000) unlinkSync(lockPath);
      } catch {
        // Another process may have released or replaced the lock.
      }
      if (Date.now() >= deadline) return false;
      sleep(25);
    }
  }

  try {
    action();
    return true;
  } finally {
    try { closeSync(descriptor); } catch {}
    try { unlinkSync(lockPath); } catch {}
  }
}

function writeJsonAtomic(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp.${process.pid}.${randomBytes(6).toString('hex')}`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, path);
}

const config = readJson(configPath);
if (config?.observation?.enabled !== true || config.observation.capture_payloads !== false) {
  process.exit(0);
}

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}

if (!['PreToolUse', 'PostToolUse'].includes(input.hook_event_name)) process.exit(0);

const cwd = resolve(input.cwd || process.cwd());
const project = projectFor(cwd);
const observation = {
  schema_version: 1,
  observed_at: new Date().toISOString(),
  event: input.hook_event_name,
  session_ref: shortHash(input.session_id),
  turn_ref: shortHash(input.turn_id),
  model: input.model || null,
  cwd_scope: project ? 'project' : 'unscoped',
  tool_name: input.tool_name || null,
  tool_use_ref: shortHash(input.tool_use_id),
  input_keys: safeKeys(input.tool_input),
  response: input.hook_event_name === 'PostToolUse'
    ? responseMetadata(input.tool_response)
    : null,
  project_id: project?.id || null,
  project_name: project?.name || null,
};

withStateLock(() => {
  let observationsFile = resolve(stateRoot, 'observations.jsonl');
  if (project) {
    const projectDir = resolve(stateRoot, 'projects', project.id);
    mkdirSync(projectDir, { recursive: true });
    const projectRecord = { ...project, last_seen: observation.observed_at };
    writeJsonAtomic(resolve(projectDir, 'project.json'), projectRecord);
    observationsFile = resolve(projectDir, 'observations.jsonl');

    const registryPath = resolve(stateRoot, 'projects.json');
    const registry = readJson(registryPath) || {};
    registry[project.id] = { ...(registry[project.id] || {}), ...projectRecord };
    writeJsonAtomic(registryPath, registry);
  }

  mkdirSync(dirname(observationsFile), { recursive: true });
  appendFileSync(observationsFile, `${JSON.stringify(observation)}\n`, { encoding: 'utf8', mode: 0o600 });
});
