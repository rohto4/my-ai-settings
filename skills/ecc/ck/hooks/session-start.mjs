#!/usr/bin/env node
/**
 * ck — Context Keeper v2
 * session-start.mjs — inject compact project context on session start.
 *
 * Injects ~100 tokens (not ~2,500 like v1).
 * SKILL.md is injected separately (still small at ~50 lines).
 *
 * Features:
 * - Compact 5-line summary for registered projects
 * - Unsaved session detection with an explicit $ck save reminder
 * - Git activity since last session
 * - Goal mismatch detection vs PROJECT.md
 * - Mini portfolio for unregistered directories
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';
import { spawnSync } from 'child_process';

const CODEX_HOME      = process.env.CODEX_HOME
  ? resolve(process.env.CODEX_HOME)
  : resolve(homedir(), '.codex');
const CK_HOME         = resolve(CODEX_HOME, 'ck');
const PROJECTS_FILE   = resolve(CK_HOME, 'projects.json');
const CURRENT_SESSION = resolve(CK_HOME, 'current-session.json');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

function daysAgo(dateStr) {
  if (!dateStr) return 'unknown';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86_400_000);
  if (diff === 0) return 'today';
  if (diff === 1) return '1 day ago';
  return `${diff} days ago`;
}

function stalenessIcon(dateStr) {
  if (!dateStr) return '○';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86_400_000);
  return diff < 1 ? '●' : diff <= 5 ? '◐' : '○';
}

function gitLogSince(projectPath, sinceDate) {
  if (!sinceDate || !existsSync(resolve(projectPath, '.git'))) return null;
  try {
    const result = spawnSync(
      'git',
      ['-C', projectPath, 'log', '--oneline', `--since=${sinceDate}`],
      { timeout: 3000, stdio: 'pipe', encoding: 'utf8' },
    );
    if (result.status !== 0) return null;
    const output = result.stdout.trim();
    const commits = output.split('\n').filter(Boolean).length;
    return commits > 0 ? `${commits} commit${commits !== 1 ? 's' : ''} since last session` : null;
  } catch { return null; }
}

function extractProjectGoal(projectPath) {
  const p = resolve(projectPath, 'PROJECT.md');
  if (!existsSync(p)) return null;
  try {
    const md = readFileSync(p, 'utf8');
    const m = md.match(/## (?:Current Goal|目的)\n([\s\S]*?)(?=\n## |$)/);
    return m ? m[1].trim().split('\n')[0].trim() : null;
  } catch { return null; }
}

// ─── Session ID from stdin ────────────────────────────────────────────────────

function readHookInput() {
  try {
    const raw = readFileSync(0, 'utf8');
    return JSON.parse(raw);
  } catch { return {}; }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const input = readHookInput();
  const cwd = input.cwd || process.cwd();
  const sessionId = input.session_id || null;

  const projects = readJson(PROJECTS_FILE) || {};
  const entry = projects[cwd];

  // Read previous session BEFORE overwriting current-session.json
  const prevSession = readJson(CURRENT_SESSION);

  // Write current-session.json
  try {
    writeFileSync(CURRENT_SESSION, JSON.stringify({
      sessionId,
      projectPath: cwd,
      projectName: entry?.name || null,
      startedAt: new Date().toISOString(),
    }, null, 2), 'utf8');
  } catch { /* non-fatal */ }

  const parts = [];
  // ── REGISTERED PROJECT ────────────────────────────────────────────────────
  if (entry?.contextDir) {
    const contextFile = resolve(CK_HOME, 'contexts', entry.contextDir, 'context.json');
    const context = readJson(contextFile);

    if (context) {
      const latest = context.sessions?.[context.sessions.length - 1] || {};
      const sessionDate = latest.date || context.createdAt;
      const sessionCount = context.sessions?.length || 0;
      const displayName = context.displayName ?? context.name;

      // ── Compact summary block (~100 tokens) ──────────────────────────────
      const summaryLines = [
        `ck: ${displayName} | ${daysAgo(sessionDate)} | ${sessionCount} session${sessionCount !== 1 ? 's' : ''}`,
        `Goal: ${context.goal || '—'}`,
        latest.leftOff ? `Left off: ${latest.leftOff.split('\n')[0]}` : null,
        latest.nextSteps?.length ? `Next: ${latest.nextSteps.slice(0, 2).join(' · ')}` : null,
      ].filter(Boolean);

      // ── Unsaved session detection ─────────────────────────────────────────
      if (prevSession?.sessionId && prevSession.sessionId !== sessionId) {
        // Check if previous session ID exists in sessions array
        const alreadySaved = context.sessions?.some(s => s.id === prevSession.sessionId);
        if (!alreadySaved) {
          summaryLines.push(`WARNING Last session wasn't saved — use $ck to capture it`);
        }
      }

      // ── Git activity ──────────────────────────────────────────────────────
      const gitLine = gitLogSince(cwd, sessionDate);
      if (gitLine) summaryLines.push(`Git: ${gitLine}`);

      // ── Goal mismatch detection ───────────────────────────────────────────
      const projectGoal = extractProjectGoal(cwd);
      if (projectGoal && context.goal &&
          projectGoal.toLowerCase().trim() !== context.goal.toLowerCase().trim()) {
        summaryLines.push(`WARNING Goal mismatch — ck: "${context.goal.slice(0, 40)}" · PROJECT.md: "${projectGoal.slice(0, 40)}"`);
        summaryLines.push(`   Use $ck with the updated goal to synchronize it`);
      }

      parts.push([
        `---`,
        `## ck: ${displayName}`,
        ``,
        summaryLines.join('\n'),
      ].join('\n'));

      // Ask Codex to display the compact briefing at session start.
      parts.push([
        `---`,
        `## ck: SESSION START`,
        ``,
        `IMPORTANT: Display the following as your FIRST message, verbatim:`,
        ``,
        '```',
        summaryLines.join('\n'),
        '```',
        ``,
        `After the block, add one line: "Ready — what are we working on?"`,
        `If you see WARNING lines above, mention them briefly after the block.`,
      ].join('\n'));

      return parts;
    }
  }

  // ── NOT IN A REGISTERED PROJECT ────────────────────────────────────────────
  const entries = Object.entries(projects);
  if (entries.length === 0) return parts;

  // Load and sort by most recent
  const recent = entries
    .map(([path, info]) => {
      const ctx = readJson(resolve(CK_HOME, 'contexts', info.contextDir, 'context.json'));
      const latest = ctx?.sessions?.[ctx.sessions.length - 1] || {};
      return { name: info.name, path, lastDate: latest.date || '', summary: latest.summary || '—', ctx };
    })
    .sort((a, b) => (b.lastDate > a.lastDate ? 1 : -1))
    .slice(0, 3);

  const miniRows = recent.map(p => {
    const icon = stalenessIcon(p.lastDate);
    const when = daysAgo(p.lastDate);
    const name = p.name.padEnd(16).slice(0, 16);
    const whenStr = when.padEnd(12).slice(0, 12);
    const summary = p.summary.slice(0, 32);
    return `  ${name}  ${icon}  ${whenStr}  ${summary}`;
  });

  const miniStatus = [
    `ck — recent projects:`,
    `  ${'PROJECT'.padEnd(16)}  S  ${'LAST SEEN'.padEnd(12)}  LAST SESSION`,
    `  ${'─'.repeat(68)}`,
    ...miniRows,
    ``,
    `Use $ck to list, resume, or register project context`,
  ].join('\n');

  parts.push([
    `---`,
    `## ck: SESSION START`,
    ``,
    `IMPORTANT: Display the following as your FIRST message, verbatim:`,
    ``,
    '```',
    miniStatus,
    '```',
  ].join('\n'));

  return parts;
}

const parts = main();
if (parts.length > 0) {
  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext: parts.join('\n\n---\n\n'),
    },
  }));
}
