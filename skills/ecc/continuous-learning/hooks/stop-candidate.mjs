#!/usr/bin/env node

import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { dirname, resolve, sep } from 'path';
import { fileURLToPath } from 'url';

const skillDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(skillDir, 'config.json');
const codexHome = process.env.CODEX_HOME
  ? resolve(process.env.CODEX_HOME)
  : resolve(homedir(), '.codex');

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function redact(text) {
  return text
    .replace(/\b(?:sk|sess|pat)-[A-Za-z0-9_-]{12,}\b/g, '[REDACTED_TOKEN]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, 'Bearer [REDACTED]')
    .replace(/((?:password|passwd|token|secret|api[_-]?key)\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}

function safePart(value, fallback) {
  const normalized = String(value || fallback).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40);
  return normalized || fallback;
}

const config = readJson(configPath, {});
let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.stdout.write('{}\n');
  process.exit(0);
}

const enabled = config.enabled === true || process.env.CODEX_CONTINUOUS_LEARNING === '1';
if (!enabled || input.hook_event_name !== 'Stop' || input.stop_hook_active) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const rawMessage = typeof input.last_assistant_message === 'string'
  ? input.last_assistant_message.trim()
  : '';
const minChars = Number.isInteger(config.min_message_chars) ? config.min_message_chars : 160;
if (rawMessage.length < minChars) {
  process.stdout.write('{}\n');
  process.exit(0);
}

const maxChars = Number.isInteger(config.max_message_chars) ? config.max_message_chars : 6000;
const redactedMessage = redact(rawMessage);
const message = redactedMessage.slice(0, Math.max(1, maxChars));
const createdAt = new Date().toISOString();
const storageSubdir = typeof config.storage_subdir === 'string'
  ? config.storage_subdir
  : 'continuous-learning/candidates';
const storageDir = resolve(codexHome, storageSubdir);
if (storageDir !== codexHome && !storageDir.startsWith(`${codexHome}${sep}`)) {
  process.stdout.write('{}\n');
  process.exit(0);
}
mkdirSync(storageDir, { recursive: true });

const session = safePart(input.session_id, 'session');
const turn = safePart(input.turn_id, 'turn');
const stamp = createdAt.replace(/[:.]/g, '-');
const candidate = {
  schema_version: 1,
  created_at: createdAt,
  session_id: input.session_id || null,
  turn_id: input.turn_id || null,
  cwd: input.cwd || process.cwd(),
  model: input.model || null,
  message_sha256: createHash('sha256').update(message).digest('hex'),
  redaction_applied: rawMessage !== redactedMessage,
  message_truncated: redactedMessage.length > message.length,
  last_assistant_message: message,
  review_status: 'pending',
};

writeFileSync(
  resolve(storageDir, `${stamp}-${session}-${turn}.json`),
  `${JSON.stringify(candidate, null, 2)}\n`,
  { encoding: 'utf8', mode: 0o600 },
);
process.stdout.write('{}\n');
