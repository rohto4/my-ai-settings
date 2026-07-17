import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const progressPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-bulk-edit-progress.json');
const reviewPath = path.join(repoRoot, 'docs', 'review', 'upstream-skill-improvement-proposals-2026-07-17.csv');
const registryPath = path.join(repoRoot, 'registry', 'plugin-skill-adoptions.csv');
const upstreamRegistryPath = path.join(repoRoot, 'registry', 'upstreams.csv');
const resultPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-target-results-plugin.json');
const upstreamPluginRoot = path.join(repoRoot, 'upstream', 'openai-plugins', 'plugins');
const installedCacheRoot = 'C:/Users/unibe/.codex/plugins/cache/openai-curated-remote';

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

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\r\n]/u.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(','), ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(','))];
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pluginManifest(plugin, root = upstreamPluginRoot) {
  const filePath = path.join(root, plugin, '.codex-plugin', 'plugin.json');
  if (!fs.existsSync(filePath)) throw new Error(`Plugin manifest is missing: ${filePath}`);
  return readJson(filePath);
}

function installedPlugin(plugin) {
  const pluginRoot = path.join(installedCacheRoot, plugin);
  if (!fs.existsSync(pluginRoot)) return null;
  const versions = fs.readdirSync(pluginRoot, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort();
  if (versions.length !== 1) throw new Error(`Installed plugin version is not unique: ${plugin} / ${versions.join(', ')}`);
  const version = versions[0];
  const root = path.join(pluginRoot, version);
  const manifest = readJson(path.join(root, '.codex-plugin', 'plugin.json'));
  const skillNames = new Set();
  const walk = (directory) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const child = path.join(directory, item.name);
      if (item.isDirectory()) walk(child);
      else if (item.name === 'SKILL.md') {
        const source = fs.readFileSync(child, 'utf8');
        const name = source.match(/^name:\s*["']?([^\r\n"']+)/mu)?.[1]?.trim() || path.basename(path.dirname(child));
        skillNames.add(name);
      }
    }
  };
  walk(path.join(root, 'skills'));
  return { version, manifest, skillNames };
}

const progress = readJson(progressPath);
if (Object.values(progress.entries).some((entry) => !['handoff_confirmed', 'manual_review'].includes(entry.source_stage))) {
  throw new Error('Plugin targets cannot be finalized before the global source gate.');
}

const reviewRows = parseCsv(fs.readFileSync(reviewPath, 'utf8'));
const reviewById = new Map(reviewRows.map((row) => [row.id, row]));
const upstreamRows = parseCsv(fs.readFileSync(upstreamRegistryPath, 'utf8'));
const upstream = upstreamRows.find((row) => row.upstream_key === 'openai-plugins');
if (!upstream?.commit) throw new Error('openai-plugins upstream commit is missing.');

const headers = ['plugin', 'plugin_version', 'skill_name', 'source_repository', 'source_commit', 'license', 'adoption_status', 'verified_at', 'verification_evidence', 'notes'];
const registryRows = parseCsv(fs.readFileSync(registryPath, 'utf8'));
const registryByKey = new Map(registryRows.map((row) => [`${row.plugin}\u0000${row.skill_name}`, row]));
const pluginTargets = Object.entries(progress.targets).filter(([target]) => target.startsWith('plugin:')).sort(([left], [right]) => left.localeCompare(right, 'ja'));
const results = [];

for (const [targetPath, target] of pluginTargets) {
  const [, plugin, disposition] = targetPath.split(':');
  const manifest = pluginManifest(plugin);
  const installed = disposition === 'installed' ? installedPlugin(plugin) : null;
  let genericFallbackCount = 0;
  const sourceRows = target.expected_source_ids.map((id) => {
    const row = reviewById.get(id);
    if (!row) throw new Error(`Review row is missing: ${id}`);
    return row;
  });
  const upstreamSkillRows = sourceRows.filter((row) => row.id.startsWith('openai-plugins--'));

  if (disposition === 'installed') {
    if (!installed) throw new Error(`Installed plugin cache is missing: ${plugin}`);
    const missing = upstreamSkillRows.filter((row) => !installed.skillNames.has(row.skill_name));
    if (missing.length && !installed.skillNames.has(plugin)) throw new Error(`Installed plugin skills are missing without a generic capability: ${plugin} / ${missing.map((row) => row.skill_name).join(', ')}`);
    genericFallbackCount = missing.length;
  }

  const adoptionStatus = disposition === 'installed'
    ? 'installed_plugin'
    : disposition === 'deferred'
      ? 'deferred_until_needed'
      : 'evaluated_not_adopted';
  const version = installed?.version ?? manifest.version ?? '';
  const license = manifest.license ?? 'license-not-declared';
  const evidence = disposition === 'installed'
    ? 'Codex plugin cache discovery plus pinned upstream manifest and license'
    : disposition === 'deferred'
      ? 'Review recommendation plus pinned plugin manifest; explicit connected-app need required'
      : 'Plugin-bundle review plus pinned manifest/license; no current profile or connected-app need';
  const notes = disposition === 'installed'
    ? '本文を複製せず導入済みpluginから利用'
    : disposition === 'deferred'
      ? '具体需要とconnector利用の明示依頼が出るまで未導入を維持'
      : '現行profileへ一律導入せず、具体需要が出た場合だけplugin単位で再評価';

  for (const row of upstreamSkillRows) {
    const key = `${plugin}\u0000${row.skill_name}`;
    if (!registryByKey.has(key)) {
      const exactInstalledSkill = installed?.skillNames.has(row.skill_name) ?? false;
      const registryRow = {
        plugin,
        plugin_version: version,
        skill_name: row.skill_name,
        source_repository: 'https://github.com/openai/plugins',
        source_commit: upstream.commit,
        license,
        adoption_status: adoptionStatus,
        verified_at: '2026-07-17',
        verification_evidence: disposition === 'installed' && !exactInstalledSkill
          ? `${evidence}; generic ${plugin} capability discovered instead of a workflow-specific skill`
          : evidence,
        notes: disposition === 'installed' && !exactInstalledSkill
          ? `個別workflow skillはcacheにないため、導入済みgeneric ${plugin} capabilityから利用`
          : notes,
      };
      registryRows.push(registryRow);
      registryByKey.set(key, registryRow);
    }
  }

  results.push({
    target_path: targetPath,
    status: disposition === 'installed' ? 'integrated' : 'no_change_needed',
    integration_summary: disposition === 'installed'
      ? `導入済み${plugin} pluginを正本として${sourceRows.length} sourceを利用し、本文は複製しない。`
      : disposition === 'deferred'
        ? `${plugin} pluginは具体需要とconnector利用の明示依頼まで未導入とする。`
        : `${plugin} plugin bundleを評価し、現行profileへは採用せず上流参照を維持する。`,
    verification: `${plugin} ${version} / ${license} / openai/plugins@${upstream.commit.slice(0, 12)} / registry ${upstreamSkillRows.length} source${genericFallbackCount ? ` / generic fallback ${genericFallbackCount}` : ''}`,
  });
}

registryRows.sort((left, right) => left.plugin.localeCompare(right.plugin, 'ja') || left.skill_name.localeCompare(right.skill_name, 'ja'));
writeCsv(registryPath, headers, registryRows);
fs.writeFileSync(resultPath, `${JSON.stringify(results, null, 2)}\n`, 'utf8');

const counts = results.reduce((accumulator, result) => {
  accumulator[result.status] = (accumulator[result.status] ?? 0) + 1;
  return accumulator;
}, {});
console.log(JSON.stringify({ targets: results.length, registry_rows: registryRows.length, ...counts }));
