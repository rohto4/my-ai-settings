import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const progressPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-bulk-edit-progress.json');
const reviewPath = path.join(repoRoot, 'docs', 'review', 'upstream-skill-improvement-proposals-2026-07-17.csv');
const resultPaths = [
  'docs/imp/upstream-skill-target-results-ecc-a-g.json',
  'docs/imp/upstream-skill-target-results-ecc-h-x.json',
  'docs/imp/upstream-skill-target-results-codex.json',
  'docs/imp/upstream-skill-target-results-plugin.json',
];

function parseCsv(text) {
  const parsed = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(field); field = ''; }
    else if (char === '\n') { row.push(field.replace(/\r$/u, '')); parsed.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/u, '')); parsed.push(row); }
  const [headers, ...values] = parsed.filter((item) => item.some((value) => value.length));
  return values.map((valueRow) => Object.fromEntries(headers.map((header, index) => [header, valueRow[index] ?? ''])));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function targetKey(value) {
  const normalized = String(value ?? '').trim().replaceAll('\\', '/').replace(/\/+$/u, '').replace(/\/SKILL\.md$/iu, '');
  return normalized.startsWith('plugin:') ? normalized : `${normalized}/`;
}

function requireOneLine(value, field, target) {
  if (typeof value !== 'string' || value.trim() === '' || /[\r\n]/u.test(value)) throw new Error(`Invalid ${field}: ${target}`);
}

const progress = readJson(progressPath);
const reviewRows = parseCsv(fs.readFileSync(reviewPath, 'utf8'));
const reviewById = new Map(reviewRows.map((row) => [row.id, row]));
const skillRegistry = parseCsv(fs.readFileSync(path.join(repoRoot, 'registry', 'skills-registry.csv'), 'utf8'));
const lineageRegistry = parseCsv(fs.readFileSync(path.join(repoRoot, 'registry', 'skill-lineage.csv'), 'utf8'));
const pluginRegistry = parseCsv(fs.readFileSync(path.join(repoRoot, 'registry', 'plugin-skill-adoptions.csv'), 'utf8'));
const skillRegistryNames = new Set(skillRegistry.map((row) => row.skill_name));
const codexLineageNames = new Set(lineageRegistry.filter((row) => row.group === 'codex').map((row) => row.skill_name));
const pluginRegistryKeys = new Set(pluginRegistry.map((row) => `${row.plugin}\u0000${row.skill_name}`));

if (Object.keys(progress.entries).length !== 968) throw new Error(`Source entry count is not 968: ${Object.keys(progress.entries).length}`);
const unresolvedSources = Object.entries(progress.entries).filter(([, entry]) => !['handoff_confirmed', 'manual_review'].includes(entry.source_stage));
if (unresolvedSources.length) throw new Error(`Unresolved sources remain: ${unresolvedSources.length}`);

const results = [];
for (const relativePath of resultPaths) {
  const filePath = path.join(repoRoot, relativePath);
  if (!fs.existsSync(filePath)) throw new Error(`Target result file is missing: ${relativePath}`);
  const values = readJson(filePath);
  if (!Array.isArray(values)) throw new Error(`Target result file is not an array: ${relativePath}`);
  results.push(...values);
}

const expectedTargets = new Set(Object.keys(progress.targets));
const seenTargets = new Set();
const statusCounts = {};
let localSkillTargets = 0;
let installedPluginTargets = 0;

for (const result of results) {
  const target = targetKey(result.target_path ?? result.target);
  if (!expectedTargets.has(target)) throw new Error(`Unknown result target: ${target}`);
  if (seenTargets.has(target)) throw new Error(`Duplicate result target: ${target}`);
  seenTargets.add(target);
  if (!['integrated', 'no_change_needed', 'blocked'].includes(result.status)) throw new Error(`Invalid result status: ${target} / ${result.status}`);
  requireOneLine(result.integration_summary, 'integration_summary', target);
  requireOneLine(result.verification, 'verification', target);
  statusCounts[result.status] = (statusCounts[result.status] ?? 0) + 1;

  const progressTarget = progress.targets[target];
  if (progressTarget.status !== result.status) throw new Error(`Progress/result status mismatch: ${target} / ${progressTarget.status} / ${result.status}`);

  if (target.startsWith('skills/')) {
    const folder = path.join(repoRoot, target);
    const skillPath = path.join(folder, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      if (result.status === 'no_change_needed' && target.startsWith('skills/codex/')) continue;
      throw new Error(`Final local target has no SKILL.md: ${target}`);
    }
    localSkillTargets += 1;
    const source = fs.readFileSync(skillPath, 'utf8');
    if (/\[TODO(?:[:\]])/u.test(source)) throw new Error(`Template TODO remains: ${target}`);
    const folderName = path.basename(folder);
    const frontmatterName = source.match(/^name:\s*["']?([^\r\n"']+)/mu)?.[1]?.trim() ?? '';
    if (frontmatterName !== folderName) throw new Error(`Skill name/folder mismatch: ${target} / ${frontmatterName}`);
    if (target.startsWith('skills/codex/') && result.status === 'integrated') {
      if (!fs.existsSync(path.join(folder, 'LICENSE.txt'))) throw new Error(`Codex target license is missing: ${target}`);
      if (!fs.existsSync(path.join(folder, 'agents', 'openai.yaml'))) throw new Error(`Codex target openai.yaml is missing: ${target}`);
      if (!skillRegistryNames.has(folderName)) throw new Error(`Codex target skills-registry row is missing: ${target}`);
      if (!codexLineageNames.has(folderName)) throw new Error(`Codex target lineage row is missing: ${target}`);
    }
  } else if (target.startsWith('plugin:')) {
    const [, plugin, disposition] = target.split(':');
    if (disposition === 'installed') installedPluginTargets += 1;
    for (const sourceId of progressTarget.expected_source_ids) {
      const row = reviewById.get(sourceId);
      if (row?.id.startsWith('openai-plugins--') && !pluginRegistryKeys.has(`${plugin}\u0000${row.skill_name}`)) {
        throw new Error(`Plugin registry row is missing: ${plugin} / ${row.skill_name}`);
      }
    }
  }
}

const missingTargets = [...expectedTargets].filter((target) => !seenTargets.has(target));
if (missingTargets.length || seenTargets.size !== 358) throw new Error(`Target result coverage mismatch: ${seenTargets.size}/358, missing ${missingTargets.length}`);

console.log(JSON.stringify({
  sources: Object.keys(progress.entries).length,
  source_manual_review: Object.values(progress.entries).filter((entry) => entry.source_stage === 'manual_review').length,
  targets: seenTargets.size,
  target_status: statusCounts,
  local_skill_targets: localSkillTargets,
  installed_plugin_targets: installedPluginTargets,
  plugin_registry_rows: pluginRegistry.length,
}, null, 2));
