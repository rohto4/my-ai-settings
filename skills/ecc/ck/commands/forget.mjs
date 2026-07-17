#!/usr/bin/env node
/**
 * ck — Context Keeper v2
 * forget.mjs — remove a project's context and registry entry
 *
 * Usage: node forget.mjs [name|number] --confirm [registered-name]
 * stdout: confirmation or error
 * exit 0: success  exit 1: not found
 *
 * Requires an explicit confirmation value matching the registered project.
 */

import { rmSync } from 'fs';
import { resolve, sep } from 'path';
import { resolveContext, readProjects, writeProjects, CONTEXTS_DIR } from './shared.mjs';

const arg = process.argv[2];
const cwd = process.cwd();

const resolved = resolveContext(arg, cwd);
if (!resolved) {
  const hint = arg ? `No project matching "${arg}".` : 'This directory is not registered.';
  console.log(`${hint}`);
  process.exit(1);
}

const { name, contextDir, projectPath } = resolved;

const confirmIndex = process.argv.indexOf('--confirm');
const confirmation = confirmIndex >= 0 ? process.argv[confirmIndex + 1] || '' : '';
if (![name, contextDir].some(value => value?.toLowerCase() === confirmation.toLowerCase())) {
  console.log(`ck: refusing to remove '${name}' without --confirm '${name}'.`);
  process.exit(1);
}

// Remove context directory
const contextDirPath = resolve(CONTEXTS_DIR, contextDir);
const contextsRoot = resolve(CONTEXTS_DIR);
if (!contextDirPath.startsWith(`${contextsRoot}${sep}`)) {
  console.log(`ck: refusing deletion outside contexts root: ${contextDirPath}`);
  process.exit(1);
}
try {
  rmSync(contextDirPath, { recursive: true, force: true });
} catch (e) {
  console.log(`ck: could not remove context directory — ${e.message}`);
  process.exit(1);
}

// Remove from projects.json
const projects = readProjects();
delete projects[projectPath];
writeProjects(projects);

console.log(`✓ Context for '${name}' removed.`);
