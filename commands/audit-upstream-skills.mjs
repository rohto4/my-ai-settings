import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const upstreamRoot = path.join(repoRoot, 'upstream');
const reportDir = path.join(repoRoot, 'docs', 'review');
const reportDate = '2026-07-17';
const csvPath = path.join(reportDir, `upstream-skill-improvement-proposals-${reportDate}.csv`);
const htmlPath = path.join(reportDir, `upstream-skill-improvement-proposals-${reportDate}.html`);
const summaryPath = path.join(reportDir, `upstream-skill-audit-summary-${reportDate}.json`);

const installedPlugins = new Set([
  'cloudflare',
  'codex-security',
  'data-analytics',
  'figma',
  'github',
  'gmail',
  'google-calendar',
  'google-drive',
  'notion',
  'slack',
]);
const availableNotInstalledPlugins = new Set([
  'atlassian-rovo',
  'box',
  'outlook-calendar',
  'outlook-email',
  'sharepoint',
  'teams',
]);

const repositories = [
  {
    key: 'ecc-everything-claude-code',
    short: 'ECC current',
    root: path.join(upstreamRoot, 'ecc-everything-claude-code'),
    mode: 'direct-skills',
    color: 'blue',
  },
  {
    key: 'obra-superpowers',
    short: 'Superpowers',
    root: path.join(upstreamRoot, 'obra-superpowers'),
    mode: 'direct-skills',
    color: 'violet',
  },
  {
    key: 'addyosmani-agent-skills',
    short: 'Addy skills',
    root: path.join(upstreamRoot, 'addyosmani-agent-skills'),
    mode: 'direct-skills',
    color: 'amber',
  },
  {
    key: 'openai-skills',
    short: 'OpenAI skills (deprecated)',
    root: path.join(upstreamRoot, 'openai-skills'),
    mode: 'recursive-skills',
    color: 'slate',
  },
  {
    key: 'openai-plugins',
    short: 'OpenAI plugins',
    root: path.join(upstreamRoot, 'openai-plugins'),
    mode: 'all-skills',
    color: 'green',
  },
];

function normalizePath(value) {
  return value.split(path.sep).join('/');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function walkFiles(root, predicate) {
  const results = [];
  if (!fs.existsSync(root)) return results;
  const stack = [root];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === '.git') continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(fullPath);
      else if (entry.isFile() && predicate(fullPath, entry)) results.push(fullPath);
    }
  }
  return results.sort((a, b) => a.localeCompare(b));
}

function collectSkillFiles(repository) {
  if (repository.mode === 'direct-skills') {
    const root = path.join(repository.root, 'skills');
    return fs.readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name, 'SKILL.md'))
      .filter(fs.existsSync)
      .sort((a, b) => a.localeCompare(b));
  }
  if (repository.mode === 'recursive-skills') {
    return walkFiles(path.join(repository.root, 'skills'), (filePath) => path.basename(filePath) === 'SKILL.md');
  }
  return [
    ...walkFiles(path.join(repository.root, '.agents'), (filePath) => path.basename(filePath) === 'SKILL.md'),
    ...walkFiles(path.join(repository.root, 'plugins'), (filePath) => path.basename(filePath) === 'SKILL.md'),
  ].sort((a, b) => a.localeCompare(b));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else field += char;
  }
  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ''));
    rows.push(row);
  }
  const [headers, ...values] = rows.filter((item) => item.some((value) => value.length));
  return values.map((valueRow) => Object.fromEntries(headers.map((header, index) => [header, valueRow[index] ?? ''])));
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function writeCsv(rows, columns, outputPath) {
  const lines = [columns.join(',')];
  for (const row of rows) lines.push(columns.map((column) => csvEscape(row[column])).join(','));
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

function parseFrontmatter(text) {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) return { valid: false, name: '', description: '', body: text };
  const frontmatter = match[1];
  const lines = frontmatter.split(/\r?\n/);
  function readField(key) {
    const index = lines.findIndex((line) => new RegExp(`^${key}:\\s*`).test(line));
    if (index < 0) return '';
    const raw = lines[index].replace(new RegExp(`^${key}:\\s*`), '');
    if (/^[>|][-+]?\s*$/.test(raw)) {
      const block = [];
      for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
        if (/^[A-Za-z0-9_-]+:\s*/.test(lines[cursor])) break;
        block.push(lines[cursor].replace(/^\s+/, ''));
      }
      return block.join(' ').replace(/\s+/g, ' ').trim();
    }
    return raw.trim().replace(/^(["'])([\s\S]*)\1$/, '$2');
  }
  return {
    valid: true,
    name: readField('name'),
    description: readField('description'),
    body: text.slice(match[0].length),
  };
}

function classifyLicenseText(text) {
  if (/Figma Developer Terms/i.test(text)) return { label: 'LicenseRef-Figma-Developer-Terms', category: 'restricted' };
  if (/Copyright\s+\d{4}\s+Notion Labs/i.test(text)) return { label: 'LicenseRef-Notion', category: 'restricted' };
  if (/MIT License/i.test(text)) return { label: 'MIT', category: 'permissive' };
  if (/Apache License/i.test(text)) return { label: 'Apache-2.0', category: 'permissive' };
  if (/proprietary/i.test(text)) return { label: 'Proprietary', category: 'restricted' };
  return { label: 'Custom-or-unknown', category: 'unknown' };
}

function classifyManifestLicense(value) {
  const label = value || 'not-declared';
  if (/^MIT$/i.test(label) || /^Apache-2\.0$/i.test(label)) return { label, category: 'permissive' };
  if (/CC-BY|\bAND\b/i.test(label)) return { label, category: 'conditional' };
  if (/Proprietary|UNLICENSED|LicenseRef/i.test(label)) return { label, category: 'restricted' };
  return { label, category: 'unknown' };
}

function pluginContext(repository, skillPath) {
  if (repository.key !== 'openai-plugins') return { plugin: '', pluginState: 'not_applicable', license: null };
  const relative = normalizePath(path.relative(repository.root, skillPath));
  if (relative.startsWith('.agents/')) {
    return {
      plugin: '.agents',
      pluginState: 'system_source',
      license: { label: 'not-declared-at-repository-root', category: 'unknown' },
    };
  }
  const segments = relative.split('/');
  const plugin = segments[0] === 'plugins' ? segments[1] : 'unknown';
  const manifestPath = path.join(repository.root, 'plugins', plugin, '.codex-plugin', 'plugin.json');
  let manifestLicense = '';
  if (fs.existsSync(manifestPath)) {
    try {
      manifestLicense = JSON.parse(readText(manifestPath)).license ?? '';
    } catch {
      manifestLicense = '';
    }
  }
  const pluginState = installedPlugins.has(plugin)
    ? 'installed'
    : availableNotInstalledPlugins.has(plugin)
      ? 'available_not_installed'
      : 'not_installed_or_external';
  return { plugin, pluginState, license: classifyManifestLicense(manifestLicense) };
}

function licenseFor(repository, skillPath, context) {
  if (context.license) return context.license;
  if (['ecc-everything-claude-code', 'obra-superpowers', 'addyosmani-agent-skills'].includes(repository.key)) {
    return { label: 'MIT', category: 'permissive' };
  }
  const licensePath = path.join(path.dirname(skillPath), 'LICENSE.txt');
  if (!fs.existsSync(licensePath)) return { label: 'missing-LICENSE.txt', category: 'unknown' };
  return classifyLicenseText(readText(licensePath));
}

function localResourceIssues(skillPath, text) {
  const missing = [];
  const linkPattern = /\]\(([^)]+)\)/g;
  for (const match of text.matchAll(linkPattern)) {
    let target = match[1].trim().replace(/^<|>$/g, '');
    if (!target || /^(?:https?:|mailto:|#|[A-Za-z]:[\\/]|\/)/i.test(target)) continue;
    target = target.split('#', 1)[0].split('?', 1)[0];
    if (!target || /[{}]/.test(target)) continue;
    try {
      target = decodeURIComponent(target);
    } catch {
      // Keep the original text when it is not URI encoded.
    }
    if (!/^(?:references?|scripts?|assets?|agents?)[\\/]/i.test(target)) continue;
    const resolved = path.resolve(path.dirname(skillPath), target);
    if (!fs.existsSync(resolved)) missing.push(target);
  }
  return [...new Set(missing)];
}

function countFiles(root) {
  return walkFiles(root, () => true).length;
}

function activeSkills() {
  const results = [];
  for (const group of ['ecc', 'codex', 'original']) {
    const groupRoot = path.join(repoRoot, 'skills', group);
    if (!fs.existsSync(groupRoot)) continue;
    for (const entry of fs.readdirSync(groupRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(groupRoot, entry.name, 'SKILL.md');
      if (!fs.existsSync(skillPath)) continue;
      const text = readText(skillPath);
      const frontmatter = parseFrontmatter(text);
      results.push({
        name: frontmatter.name || entry.name,
        folder: entry.name,
        description: frontmatter.description,
        group,
        text,
        lines: text.split(/\r?\n/).length,
      });
    }
  }
  return results;
}

const tokenStopWords = new Set([
  'and', 'the', 'for', 'with', 'from', 'that', 'this', 'when', 'use', 'using', 'skill', 'skills', 'agent', 'agents',
  'code', 'best', 'practices', 'workflow', 'workflows', 'create', 'build', 'manage', 'development', 'implementation',
]);

function tokens(value) {
  return new Set(
    value.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length >= 3 && !tokenStopWords.has(token)),
  );
}

function overlapScore(left, right) {
  if (!left.size || !right.size) return { score: 0, intersection: 0 };
  const intersection = [...left].filter((token) => right.has(token)).length;
  return { score: intersection / Math.min(left.size, right.size), intersection };
}

const explicitOverlapAliases = new Map(Object.entries({
  'test-driven-development': 'tdd-workflow',
  'systematic-debugging': 'verification-loop',
  'verification-before-completion': 'verification-loop',
  'writing-plans': 'prp-create-plan',
  'planning-and-task-breakdown': 'prp-create-plan',
  brainstorming: 'product-lens',
  'idea-refine': 'product-lens',
  'git-workflow-and-versioning': 'git-workflow',
  'documentation-and-adrs': 'architecture-decision-records',
  'context-engineering': 'context-budget',
  'security-and-hardening': 'security-review',
  'api-and-interface-design': 'api-design',
}));

const upstreamRows = parseCsv(readText(path.join(repoRoot, 'registry', 'upstreams.csv')));
const upstreamByKey = new Map(upstreamRows.map((row) => [row.upstream_key, row]));
const active = activeSkills();
const activeByName = new Map();
for (const item of active) {
  activeByName.set(item.name.toLowerCase(), item);
  activeByName.set(item.folder.toLowerCase(), item);
}
const activeTokenRows = active.map((item) => ({ item, tokens: tokens(`${item.name} ${item.description}`) }));

const rows = [];
for (const repository of repositories) {
  if (!fs.existsSync(repository.root)) throw new Error(`Missing clone: ${repository.root}`);
  const metadata = upstreamByKey.get(repository.key);
  if (!metadata) throw new Error(`Missing upstream registry row: ${repository.key}`);
  const skillFiles = collectSkillFiles(repository);
  for (const skillPath of skillFiles) {
    const text = readText(skillPath);
    const frontmatter = parseFrontmatter(text);
    const relativePath = normalizePath(path.relative(repository.root, skillPath));
    const folderName = path.basename(path.dirname(skillPath));
    const displayName = frontmatter.name || folderName;
    const context = pluginContext(repository, skillPath);
    const license = licenseFor(repository, skillPath, context);
    const missingResources = localResourceIssues(skillPath, text);
    const lines = text.split(/\r?\n/).length;
    const description = frontmatter.description;
    const combined = `${description}\n${text}`;
    const directSkillRoot = path.dirname(skillPath);
    const scriptsRoot = path.join(directSkillRoot, 'scripts');
    const hasTrigger = /\b(?:use when|when the user|trigger(?:s|ed)? when|use this skill)\b/i.test(description);
    const hasNonTrigger = /\b(?:do not use|don't use|not for|do not trigger|non-trigger|avoid using)\b/i.test(combined);
    const claudeSpecific = /Claude Code|~[\\/]\.claude|\.claude[\\/]|TodoWrite|AskUserQuestion|Task tool|Bash tool|CLAUDE_SESSION_ID/i.test(combined);
    const codexSpecific = /Codex|AGENTS\.md|\.codex[\\/]/i.test(combined);
    const subagent = /sub[- ]?agents?|parallel agents?|dispatching agents?|Task tool/i.test(combined);
    const explicitUserBoundary = /explicit(?:ly)?[^.\n]{0,40}(?:user|approval|authori[sz]ation)|ask (?:the )?user|confirm with (?:the )?user|only when the user|do not[^.\n]{0,50}without[^.\n]{0,30}(?:approval|permission)/i.test(combined);
    const externalMutation = /\bgit push\b|\bgh pr create\b|\bdeploy(?:ing|ment)?\b|\bpublish(?:ing)?\b|\bsend (?:an? )?(?:email|message)\b|\bcreate (?:an? )?(?:issue|pull request)\b|\bdelete\b|\bupdate (?:an? )?(?:ticket|issue|record|calendar|task)\b/i.test(combined);
    const destructive = /rm\s+-rf|git\s+reset\s+--hard|git\s+clean\s+-[a-z]*f|Remove-Item[^\n]{0,80}-Recurse|DROP\s+DATABASE|terraform\s+destroy|kubectl\s+delete/i.test(combined);
    const dryRunBoundary = /dry[- ]?run|read[- ]only|WhatIf|fake HTTP|fake LLM|mock(?:ed|ing)?/i.test(combined);
    const secretReference = /API key|access token|credential|client secret|Cookie|\bsecrets?\b/i.test(combined);
    const secretBoundary = /never[^.\n]{0,40}(?:secret|token|credential)|do not[^.\n]{0,40}(?:commit|write)[^.\n]{0,30}(?:secret|token)|environment variable|secret store|redact|mask(?:ed|ing)?/i.test(combined);
    const verification = /verif(?:y|ication)|\btests?\b|\bcheck(?:s|ed|ing)?\b|evidence|validat(?:e|ion)|acceptance|proof/i.test(combined);
    const completion = /completion|done|finish(?:ed|ing)?|stop condition|exit criteria|success criteria|handoff|definition of done/i.test(combined);
    const taskState = /AGENTS\.md|PROJECT\.md|imp-tasks|imp-comp|task state|context compaction|handoff|source of truth/i.test(combined);
    const windowsSupport = /PowerShell|Windows|[A-Za-z]:\\/i.test(combined);
    const unixAssumption = /\/tmp\/|\$HOME|~\/|\b(?:bash|zsh)\b|\.sh\b/i.test(combined) && !windowsSupport;
    const openAiMetadata = fs.existsSync(path.join(directSkillRoot, 'agents', 'openai.yaml'));
    const isFixture = /(?:^|\/)fixtures?\//i.test(relativePath);
    const actionLike = /deploy|ship|git|migrat|implement|develop|workflow|debug|test|security|build|setup|install|create|update|send|manage|triage|fix|launch/i.test(`${displayName} ${description}`);
    const lifecycleLike = /plan|implement|migrat|launch|workflow|autonomous|agent|project|task|development/i.test(`${displayName} ${description}`);
    const links = [...text.matchAll(/https?:\/\/[^\s)>"]+/g)].length;

    rows.push({
      id: `${repository.key}--${relativePath.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
      repository: repository.key,
      repository_short: repository.short,
      repository_color: repository.color,
      repository_url: metadata.repository,
      repository_commit: metadata.commit,
      source_path: relativePath,
      source_url: `${metadata.repository}/blob/${metadata.commit}/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
      plugin: context.plugin,
      plugin_state: context.pluginState,
      skill_name: displayName,
      folder_name: folderName,
      description,
      line_count: lines,
      character_count: text.length,
      frontmatter_valid: frontmatter.valid,
      name_matches_folder: displayName === folderName,
      has_trigger_boundary: hasTrigger,
      has_non_trigger_boundary: hasNonTrigger,
      missing_resources: missingResources.join(' | '),
      missing_resource_count: missingResources.length,
      scripts_count: fs.existsSync(scriptsRoot) ? countFiles(scriptsRoot) : 0,
      openai_metadata: openAiMetadata,
      claude_specific: claudeSpecific,
      codex_specific: codexSpecific,
      subagent_assumption: subagent,
      explicit_user_boundary: explicitUserBoundary,
      external_mutation: externalMutation,
      destructive_command: destructive,
      dry_run_boundary: dryRunBoundary,
      secret_reference: secretReference,
      secret_boundary: secretBoundary,
      verification_boundary: verification,
      completion_boundary: completion,
      task_state_boundary: taskState,
      unix_only_assumption: unixAssumption,
      external_links: links,
      action_like: actionLike,
      lifecycle_like: lifecycleLike,
      fixture: isFixture,
      license: license.label,
      license_category: license.category,
    });
  }
}

const duplicateByName = new Map();
for (const row of rows) {
  const key = row.skill_name.toLowerCase();
  if (!duplicateByName.has(key)) duplicateByName.set(key, []);
  duplicateByName.get(key).push(row);
}

function findActiveOverlap(row) {
  const direct = activeByName.get(row.skill_name.toLowerCase()) || activeByName.get(row.folder_name.toLowerCase());
  if (direct) return { type: 'exact', name: direct.folder, score: 1 };
  const alias = explicitOverlapAliases.get(row.skill_name.toLowerCase()) || explicitOverlapAliases.get(row.folder_name.toLowerCase());
  if (alias && activeByName.has(alias)) return { type: 'alias', name: activeByName.get(alias).folder, score: 0.95 };
  const rowTokens = tokens(`${row.skill_name} ${row.description}`);
  let best = null;
  for (const candidate of activeTokenRows) {
    const result = overlapScore(rowTokens, candidate.tokens);
    if (result.intersection < 2 || result.score < 0.72) continue;
    if (!best || result.score > best.score) best = { type: 'conceptual', name: candidate.item.folder, score: result.score };
  }
  return best || { type: 'none', name: '', score: 0 };
}

const priorityRank = { P0: 0, P1: 1, P2: 2, P3: 3 };
function addIssue(issues, priority, code, label, proposal) {
  issues.push({ priority, code, label, proposal });
}

function userFit(row) {
  const value = `${row.skill_name} ${row.description} ${row.plugin}`;
  if (/codex|agent|skill|context|task|plan|document|git|test|debug|verify|security|cloudflare|aws|web|browser|frontend|backend|api|database|architecture|knowledge|research|automation|workflow|migration|performance|deploy/i.test(value)) return 'high';
  if (/twilio|zoom|life-science|ngs-|daloopa|moody|boltz|chronograph|morningstar|nvidia|genomics|clinical|pharma/i.test(value)) return 'specialized';
  return 'medium';
}

for (const row of rows) {
  const issues = [];
  const overlap = findActiveOverlap(row);
  const duplicateRows = duplicateByName.get(row.skill_name.toLowerCase()) ?? [];
  const duplicateRepositories = [...new Set(duplicateRows.map((item) => item.repository))];

  if (row.license_category === 'restricted') {
    addIssue(issues, 'P0', 'license_restricted', '再配布制約', `licenseが「${row.license}」のため本文をコピー・再登録しない。利用規約を個別確認し、必要なら要件だけを抽出して独立実装する。`);
  } else if (row.license_category === 'unknown') {
    addIssue(issues, 'P0', 'license_unknown', 'license不明', `license根拠が「${row.license}」で確定できない。本文採用を止め、pluginまたはskill単位の許諾を確認する。`);
  } else if (row.license_category === 'conditional') {
    addIssue(issues, 'P1', 'license_conditional', '複合license', `license「${row.license}」のNOTICE・表示・派生物条件を確認し、台帳へ義務を明記してから扱う。`);
  }
  if (row.repository === 'openai-skills') {
    addIssue(issues, 'P1', 'deprecated_repository', '非推奨上流', '非推奨repoからactive採用せず、現行openai/pluginsの同名・後継skillと差分を取るための履歴参照に限定する。');
  }
  if (row.fixture) {
    addIssue(issues, 'P2', 'fixture_not_candidate', 'fixture', '評価用fixtureとして採用候補から除外し、監査コマンドのテストデータとしてだけ扱う。');
  }
  if (!row.frontmatter_valid) {
    addIssue(issues, 'P0', 'frontmatter_invalid', 'frontmatter不正', 'YAML frontmatterをAgent Skills discovery契約に合わせ、nameとdescriptionを検証可能な形で追加する。');
  }
  if (!row.skill_name || !row.description || /\bTODO\b|complete and informative explanation/i.test(row.description)) {
    addIssue(issues, 'P0', 'metadata_incomplete', 'metadata不足', 'name/descriptionのplaceholderを除去し、機能、起動条件、対象外を一読で判定できるdescriptionへ書き換える。');
  }
  if (row.frontmatter_valid && !row.name_matches_folder) {
    addIssue(issues, 'P1', 'name_folder_mismatch', 'name不一致', `frontmatter name「${row.skill_name}」とfolder「${row.folder_name}」の不一致を解消し、Codex discovery時の識別を一意にする。`);
  }
  if (row.missing_resource_count > 0) {
    addIssue(issues, 'P0', 'missing_local_resource', '参照切れ', `不足local resource（${row.missing_resources}）を復元するかlinkを削除し、skill単体で検証可能にする。`);
  }
  if (row.destructive_command && !row.explicit_user_boundary) {
    addIssue(issues, 'P0', 'destructive_without_approval', '破壊操作の承認不足', '削除・reset等は対象絶対pathの確認と明示承認を必須にし、既定をread-only診断へ変更する。');
  }
  if (row.external_mutation && !row.explicit_user_boundary) {
    addIssue(issues, 'P1', 'mutation_without_approval', '外部変更の承認不足', 'push・deploy・送信・外部更新はread-only/dry-runを既定にし、実行直前にユーザーの明示承認を要求する。');
  }
  if (row.external_mutation && !row.dry_run_boundary) {
    addIssue(issues, 'P1', 'missing_dry_run', 'dry-run不足', '外部変更経路へdry-runまたはfake境界を追加し、実token・live API・deployを別gateに分ける。');
  }
  if (row.secret_reference && !row.secret_boundary) {
    addIssue(issues, 'P1', 'secret_boundary_missing', 'secret境界不足', 'token・Cookie・credentialを本文やrepoへ書かず、環境変数またはsecret storeから注入し、ログではmaskする規則を追加する。');
  }
  if (row.claude_specific) {
    addIssue(issues, 'P1', 'claude_assumption', 'Claude固有前提', 'Claude Codeのtool名・hook・.claude pathをCodexのtool/approval/commentary契約へ置換し、必要ならlegacy referenceへ分離する。');
  }
  if (row.subagent_assumption && !row.explicit_user_boundary) {
    addIssue(issues, 'P1', 'subagent_without_user_gate', 'subagent自動起動', 'subagentやparallel agentを既定起動せず、ユーザーまたはPJ方針が明示した場合だけ使うgateを追加する。');
  }
  if (row.unix_only_assumption) {
    addIssue(issues, 'P1', 'unix_only', 'Windows経路不足', 'Windows + PowerShellの同等手順、LiteralPath、drive-letter、同一shell内での安全確認を追加する。');
  }
  if (row.action_like && !row.verification_boundary) {
    addIssue(issues, 'P1', 'verification_missing', '完了証拠不足', '完了条件、実行したcheck/test、観測結果、未検証範囲を出力契約へ追加する。');
  }
  if (row.lifecycle_like && !row.task_state_boundary) {
    addIssue(issues, 'P2', 'task_state_missing', 'PJ状態復元不足', '長期作業ではAGENTS.md/PROJECT.mdとdocs/impの現行taskを実体から読み、進行中と完了証拠を分離する規則を追加する。');
  }
  if (row.lifecycle_like && !row.completion_boundary) {
    addIssue(issues, 'P2', 'completion_boundary_missing', '停止条件不足', '開始条件・停止条件・handoff・完了判定を明文化し、会話要約だけで再開しない。');
  }
  if (row.line_count > 500) {
    addIssue(issues, 'P2', 'progressive_disclosure', '本文過大', `${row.line_count}行の本文を入口、判断表、referencesへ分割し、最初に読む文脈量を抑える。`);
  }
  if (!row.has_trigger_boundary) {
    addIssue(issues, 'P2', 'trigger_boundary_missing', '起動条件不足', 'descriptionへ具体的な利用場面とtriggerを追加し、広すぎる自動発火を防ぐ。');
  }
  if (!row.has_non_trigger_boundary) {
    addIssue(issues, 'P2', 'non_trigger_boundary_missing', '対象外不足', '似たskillとの境界が分かる非trigger・対象外・引継ぎ先を追加する。');
  }
  if (overlap.type !== 'none') {
    addIssue(issues, 'P2', 'active_overlap', 'active重複', `新規追加せず、active「${overlap.name}」との差分を取り、有益な規則だけを正本側へ統合する。`);
  }
  if (duplicateRepositories.length > 1) {
    addIssue(issues, 'P2', 'cross_upstream_duplicate', '上流間重複', `同名skillが${duplicateRepositories.join(' / ')}にある。原著・現行Codex packaging・commit差分を比較して正本を1つに決める。`);
  }
  if (!row.openai_metadata && row.repository !== 'openai-plugins') {
    addIssue(issues, 'P3', 'openai_metadata_missing', 'Codex UI metadata不足', 'active採用する場合だけagents/openai.yamlを追加し、default promptとskill名の一致を検証する。');
  }

  issues.sort((left, right) => priorityRank[left.priority] - priorityRank[right.priority] || left.code.localeCompare(right.code));
  const fit = userFit(row);
  let recommendation = 'candidate_for_adaptation';
  if (row.fixture) recommendation = 'exclude_fixture';
  else if (row.repository === 'openai-skills') recommendation = 'reference_only_deprecated';
  else if (row.license_category === 'restricted' || row.license_category === 'unknown') recommendation = 'reference_only_license';
  else if (row.repository === 'openai-plugins' && row.plugin_state === 'installed') recommendation = 'use_installed_plugin';
  else if (row.repository === 'openai-plugins' && row.plugin_state === 'available_not_installed') recommendation = 'evaluate_plugin_if_needed';
  else if (row.repository === 'openai-plugins') recommendation = 'evaluate_as_plugin_bundle';
  else if (overlap.type !== 'none') recommendation = 'merge_compare_with_active';
  else if (duplicateRepositories.length > 1) recommendation = 'compare_duplicate_sources';

  const proposals = [];
  if (recommendation === 'use_installed_plugin') proposals.push(`plugin「${row.plugin}」で既に提供されるため本文をrepoへ複製せず、採用状態とversionだけをprofile/registryで管理する。`);
  else if (recommendation === 'evaluate_plugin_if_needed') proposals.push(`plugin「${row.plugin}」は利用可能だが未導入。必要性が生じた時だけplugin単位で評価し、skill単体をコピーしない。`);
  else if (recommendation === 'evaluate_as_plugin_bundle') proposals.push(`skill単体ではなくplugin「${row.plugin}」のmanifest・MCP/app・license・認証境界を一体で評価する。`);
  else if (recommendation === 'reference_only_deprecated') proposals.push('履歴比較用に保持し、採用元は現行openai/pluginsまたは原著repoへ切り替える。');
  else if (recommendation === 'reference_only_license') proposals.push('本文の私用再登録を止め、license確認または独立実装の要件抽出だけを行う。');
  else if (recommendation === 'exclude_fixture') proposals.push('採用一覧から除外し、監査fixtureとしてのみ保持する。');
  else if (recommendation === 'merge_compare_with_active') proposals.push(`active「${overlap.name}」を残し、この上流版はdiff材料として扱う。`);
  else proposals.push('permissive licenseを確認済みの候補として、Codex・Windows・承認・証拠契約を適用した私用版を別名または明確な正本で作る。');
  for (const issue of issues) {
    if (!proposals.includes(issue.proposal)) proposals.push(issue.proposal);
    if (proposals.length >= 6) break;
  }
  if (issues.length === 0) proposals.push('現状の構造を維持し、採用時に小さなfixtureと再現checkだけを追加する。');

  let score = 50;
  if (fit === 'high') score += 20;
  if (row.license_category === 'permissive') score += 15;
  if (row.verification_boundary) score += 8;
  if (row.has_trigger_boundary) score += 5;
  if (overlap.type !== 'none') score += 5;
  if (row.license_category === 'restricted' || row.license_category === 'unknown') score -= 35;
  if (row.repository === 'openai-skills' || row.fixture) score -= 25;
  if (row.claude_specific) score -= 12;
  if (row.external_mutation && !row.explicit_user_boundary) score -= 12;
  if (row.line_count > 500) score -= 8;
  score = Math.max(0, Math.min(100, score));

  Object.assign(row, {
    priority: issues[0]?.priority ?? 'P3',
    issue_count: issues.length,
    issue_codes: issues.map((issue) => issue.code).join(' | '),
    issue_summary_ja: issues.map((issue) => `${issue.priority} ${issue.label}`).join(' / '),
    active_overlap_type: overlap.type,
    active_overlap_skill: overlap.name,
    active_overlap_score: overlap.score.toFixed(2),
    upstream_duplicate_count: duplicateRows.length,
    upstream_duplicate_repositories: duplicateRepositories.join(' | '),
    recommendation,
    user_fit: fit,
    fit_score: score,
    proposal_ja: proposals.join(' / '),
  });
}

rows.sort((left, right) =>
  priorityRank[left.priority] - priorityRank[right.priority]
  || right.fit_score - left.fit_score
  || left.repository.localeCompare(right.repository)
  || left.plugin.localeCompare(right.plugin)
  || left.skill_name.localeCompare(right.skill_name));

const columns = [
  'id', 'priority', 'repository', 'plugin', 'skill_name', 'source_path', 'recommendation', 'user_fit', 'fit_score',
  'license', 'license_category', 'plugin_state', 'active_overlap_type', 'active_overlap_skill',
  'upstream_duplicate_count', 'line_count', 'frontmatter_valid', 'name_matches_folder', 'has_trigger_boundary',
  'has_non_trigger_boundary', 'missing_resource_count', 'claude_specific', 'codex_specific', 'subagent_assumption',
  'external_mutation', 'destructive_command', 'explicit_user_boundary', 'dry_run_boundary', 'secret_reference',
  'secret_boundary', 'verification_boundary', 'completion_boundary', 'task_state_boundary', 'unix_only_assumption',
  'issue_count', 'issue_codes', 'issue_summary_ja', 'proposal_ja', 'description', 'source_url', 'repository_commit',
];

fs.mkdirSync(reportDir, { recursive: true });
writeCsv(rows, columns, csvPath);

function countBy(items, key) {
  const counts = {};
  for (const item of items) counts[item[key]] = (counts[item[key]] ?? 0) + 1;
  return counts;
}

const activeMetrics = {
  total: active.length,
  claude_specific: active.filter((item) => /Claude Code|~[\\/]\.claude|\.claude[\\/]PRP|TodoWrite|Task tool/i.test(item.text)).length,
  over_500_lines: active.filter((item) => item.lines > 500).length,
};
const eccRows = rows.filter((row) => row.repository === 'ecc-everything-claude-code');
const activeEccNames = new Set(active.filter((item) => item.group === 'ecc').map((item) => item.folder));
const currentEccNames = new Set(eccRows.map((row) => row.folder_name));
const eccComparison = {
  active: activeEccNames.size,
  current_upstream: currentEccNames.size,
  name_matches: [...activeEccNames].filter((name) => currentEccNames.has(name)).length,
  active_only: [...activeEccNames].filter((name) => !currentEccNames.has(name)).sort(),
  upstream_only: [...currentEccNames].filter((name) => !activeEccNames.has(name)).sort(),
};
const superpowerNames = new Set(rows.filter((row) => row.repository === 'obra-superpowers').map((row) => row.skill_name));
const openAiSuperpowerNames = new Set(rows.filter((row) => row.repository === 'openai-plugins' && row.plugin === 'superpowers').map((row) => row.skill_name));
const superpowersPackagingOverlap = [...superpowerNames].filter((name) => openAiSuperpowerNames.has(name)).length;

const summary = {
  generated_at: new Date().toISOString(),
  report_date: reportDate,
  audit_units: rows.length,
  repository_counts: countBy(rows, 'repository'),
  priority_counts: countBy(rows, 'priority'),
  recommendation_counts: countBy(rows, 'recommendation'),
  license_category_counts: countBy(rows, 'license_category'),
  user_fit_counts: countBy(rows, 'user_fit'),
  exact_active_overlaps: rows.filter((row) => row.active_overlap_type === 'exact').length,
  any_active_overlaps: rows.filter((row) => row.active_overlap_type !== 'none').length,
  claude_specific: rows.filter((row) => row.claude_specific).length,
  external_mutation_without_approval: rows.filter((row) => row.external_mutation && !row.explicit_user_boundary).length,
  missing_resources: rows.filter((row) => row.missing_resource_count > 0).length,
  active_metrics: activeMetrics,
  ecc_comparison: eccComparison,
  superpowers_packaging_overlap: superpowersPackagingOverlap,
  outputs: {
    csv: normalizePath(path.relative(repoRoot, csvPath)),
    html: normalizePath(path.relative(repoRoot, htmlPath)),
  },
};
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

function htmlEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function optionList(values) {
  return values.map((value) => `<option value="${htmlEscape(value)}">${htmlEscape(value)}</option>`).join('');
}

function recommendationJa(value) {
  return ({
    candidate_for_adaptation: '私用版候補',
    merge_compare_with_active: 'activeへ差分統合',
    compare_duplicate_sources: '上流を比較',
    use_installed_plugin: '導入済pluginを利用',
    evaluate_plugin_if_needed: '必要時にplugin評価',
    evaluate_as_plugin_bundle: 'plugin単位で評価',
    reference_only_deprecated: '非推奨・参照のみ',
    reference_only_license: 'license上参照のみ',
    exclude_fixture: 'fixture除外',
  })[value] ?? value;
}

const repositoryOptions = [...new Set(rows.map((row) => row.repository))].sort();
const recommendationOptions = [...new Set(rows.map((row) => row.recommendation))].sort();
const licenseOptions = [...new Set(rows.map((row) => row.license_category))].sort();
const priorityCards = ['P0', 'P1', 'P2', 'P3'].map((priority) => `<article class="metric priority-${priority.toLowerCase()}">
    <span>${priority}</span><strong>${summary.priority_counts[priority] ?? 0}</strong><small>${priority === 'P0' ? '採用停止・契約/安全' : priority === 'P1' ? '先に修正' : priority === 'P2' ? '統合・文脈削減' : '仕上げ'}</small>
  </article>`).join('');

const repositoryTable = repositories.map((repository) => {
  const metadata = upstreamByKey.get(repository.key);
  const count = summary.repository_counts[repository.key] ?? 0;
  return `<tr>
    <td><span class="source-dot source-${repository.color}"></span><strong>${htmlEscape(repository.short)}</strong><br><code>${htmlEscape(repository.key)}</code></td>
    <td>${count}</td>
    <td><code>${htmlEscape(metadata.commit.slice(0, 10))}</code><br><small>${htmlEscape(metadata.commit_date)}</small></td>
    <td>${htmlEscape(metadata.license_scope)}<br><small>${htmlEscape(metadata.license_evidence)}</small></td>
    <td>${htmlEscape(metadata.status)}<br><small>${htmlEscape(metadata.notes)}</small></td>
  </tr>`;
}).join('');

const rowHtml = rows.map((row) => {
  const evidence = [
    row.license,
    row.claude_specific ? 'Claude前提' : '',
    row.external_mutation ? '外部変更' : '',
    row.verification_boundary ? '検証あり' : '検証なし',
    row.line_count > 500 ? `${row.line_count}行` : '',
    row.active_overlap_skill ? `active:${row.active_overlap_skill}` : '',
    row.upstream_duplicate_count > 1 ? `上流重複:${row.upstream_duplicate_count}` : '',
  ].filter(Boolean);
  return `<tr id="${htmlEscape(row.id)}" data-repository="${htmlEscape(row.repository)}" data-priority="${row.priority}" data-recommendation="${htmlEscape(row.recommendation)}" data-license="${htmlEscape(row.license_category)}" data-fit="${htmlEscape(row.user_fit)}" data-search="${htmlEscape(`${row.skill_name} ${row.plugin} ${row.description} ${row.issue_codes} ${row.proposal_ja}`.toLowerCase())}">
    <td><button class="read-state" type="button" data-row-id="${htmlEscape(row.id)}" aria-label="読書状態を変更">未読</button></td>
    <td><span class="priority-badge ${row.priority.toLowerCase()}">${row.priority}</span><br><small>fit ${row.fit_score}</small></td>
    <td><span class="source-dot source-${row.repository_color}"></span>${htmlEscape(row.repository_short)}${row.plugin ? `<br><small>${htmlEscape(row.plugin)} / ${htmlEscape(row.plugin_state)}</small>` : ''}</td>
    <td><a class="skill-link" href="#${htmlEscape(row.id)}">${htmlEscape(row.skill_name)}</a><br><code>${htmlEscape(row.source_path)}</code><details><summary>説明と証拠</summary><p>${htmlEscape(row.description || 'descriptionなし')}</p><p><strong>検出:</strong> ${htmlEscape(row.issue_summary_ja || '重大な不足は未検出')}</p><p><strong>issue codes:</strong> <code>${htmlEscape(row.issue_codes || 'none')}</code></p><p><a href="${htmlEscape(row.source_url)}">固定commitの原文を開く</a></p></details></td>
    <td><strong>${htmlEscape(recommendationJa(row.recommendation))}</strong><br><small>${htmlEscape(row.user_fit)} / ${htmlEscape(row.license_category)}</small></td>
    <td><div class="chips">${evidence.map((item) => `<span>${htmlEscape(item)}</span>`).join('')}</div></td>
    <td class="proposal">${htmlEscape(row.proposal_ja)}</td>
  </tr>`;
}).join('');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>上流skill全件 改善提案レビュー</title>
<style>
:root{color-scheme:light;--bg:#f3f6fa;--panel:#fff;--ink:#162033;--muted:#5e6b7c;--line:#d8e0ea;--shadow:0 10px 30px rgba(27,43,68,.08);--focus:#155eef}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Yu Gothic UI","Noto Sans JP",system-ui,sans-serif;line-height:1.55}a{color:#1358b0}code{font-family:Consolas,monospace;font-size:.82em;overflow-wrap:anywhere}header{padding:42px clamp(18px,5vw,72px) 30px;background:linear-gradient(135deg,#102447,#183e6e);color:#fff}header .eyebrow{letter-spacing:.12em;font-size:.78rem;color:#a8c7f2}header h1{max-width:1000px;margin:.25rem 0;font-size:clamp(2rem,5vw,4.2rem);line-height:1.1}header p{max-width:900px;color:#d9e7fa}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}nav a{color:#fff;text-decoration:none;border:1px solid #ffffff55;border-radius:999px;padding:7px 12px;background:#ffffff12}main{max-width:1800px;margin:auto;padding:26px clamp(14px,3vw,40px) 80px}.panel{background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:clamp(18px,3vw,30px);margin:0 0 22px}.panel h2{margin-top:0;font-size:1.5rem}.overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.metric{border:1px solid var(--line);border-radius:14px;padding:16px;background:#fafcff}.metric span,.metric small{display:block;color:var(--muted)}.metric strong{display:block;font-size:2rem}.priority-p0{border-left:6px solid #b42318}.priority-p1{border-left:6px solid #d97706}.priority-p2{border-left:6px solid #2563eb}.priority-p3{border-left:6px solid #667085}.conclusion{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:18px}.callout{padding:16px;border-radius:12px;background:#eef5ff;border:1px solid #c9dcfa}.callout.warn{background:#fff7e8;border-color:#f2d293}.callout.stop{background:#fff0ee;border-color:#efc0bb}.batch-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.batch{border:1px solid var(--line);border-radius:14px;padding:16px}.batch b{display:block;margin-bottom:6px}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px;background:#fff}table{border-collapse:separate;border-spacing:0;width:100%;min-width:1100px}th,td{padding:11px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}th{position:sticky;top:0;z-index:2;background:#eef3f9;font-size:.82rem}tbody tr:hover{background:#f8fbff}tbody tr.state-done{background:#f1f4f7;color:#697586}tbody tr.state-progress{background:#fffaf0}.repo-table{min-width:900px}.source-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px}.source-blue{background:#2463b5}.source-violet{background:#7c3fb0}.source-amber{background:#c57a07}.source-slate{background:#667085}.source-green{background:#16865c}.priority-badge{display:inline-block;min-width:36px;text-align:center;border-radius:7px;padding:3px 7px;font-weight:700}.priority-badge.p0{background:#fee4e2;color:#912018}.priority-badge.p1{background:#fef0c7;color:#93370d}.priority-badge.p2{background:#dbeafe;color:#1849a9}.priority-badge.p3{background:#eaecf0;color:#344054}.chips{display:flex;flex-wrap:wrap;gap:4px}.chips span{font-size:.73rem;border:1px solid #cad4e0;border-radius:999px;padding:2px 7px;background:#f8fafc}.proposal{min-width:340px}.skill-link{font-weight:700}.read-state{border:1px solid #9fb0c5;background:#fff;border-radius:8px;padding:5px 8px;min-width:66px;cursor:pointer}.filters{display:grid;grid-template-columns:minmax(240px,2fr) repeat(5,minmax(130px,1fr));gap:8px;margin:14px 0}.filters input,.filters select,.filters button{min-height:40px;border:1px solid #aebdce;border-radius:9px;background:#fff;padding:7px 9px}.filters button{cursor:pointer}.result-line{color:var(--muted);margin:8px 0}details{margin-top:7px}details p{max-width:780px}.flash{animation:flash 1s ease-out}@keyframes flash{0%,100%{outline:0 solid transparent}25%{outline:5px solid #fbbf24;outline-offset:-5px}}.scope-list li{margin:.4rem 0}.footer-note{color:var(--muted);font-size:.9rem}@media(max-width:1100px){.filters{grid-template-columns:1fr 1fr}.filters input{grid-column:1/-1}}@media(max-width:650px){header{padding-top:28px}.filters{grid-template-columns:1fr}main{padding-left:9px;padding-right:9px}.panel{border-radius:12px;padding:14px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.flash{animation:none;outline:4px solid #fbbf24}}
</style>
</head>
<body>
<header>
  <div class="eyebrow">AI SETTINGS / FULL UPSTREAM STOCKTAKE / ${reportDate}</div>
  <h1>上流skill全件<br>改善提案レビュー</h1>
  <p>cloneした5リポジトリの独立採用単位${summary.audit_units}件を、license・安全境界・Codex適合性・Windows対応・active重複・読込コストで全件確認した一覧です。これは採用結果ではなく、私用編集を始める順序と止める条件を決める資料です。</p>
  <nav><a href="#overview">30秒概要</a><a href="#sources">母集団</a><a href="#batches">改善バッチ</a><a href="#all-proposals">全件一覧</a><a href="#scope">監査境界</a></nav>
</header>
<main>
<section id="overview" class="panel">
  <h2>30秒で分かる結論</h2>
  <div class="overview-grid">
    <article class="metric"><span>監査単位</span><strong>${summary.audit_units}</strong><small>5 repositories</small></article>
    <article class="metric"><span>activeと重複</span><strong>${summary.any_active_overlaps}</strong><small>exact / alias / conceptual</small></article>
    <article class="metric"><span>license restricted/unknown</span><strong>${(summary.license_category_counts.restricted ?? 0) + (summary.license_category_counts.unknown ?? 0)}</strong><small>本文再登録を止める</small></article>
    ${priorityCards}
  </div>
  <div class="conclusion">
    <div class="callout stop"><strong>一括importしない</strong><br>OpenAI Pluginsは${summary.repository_counts['openai-plugins']} skillを含みますが、pluginごとにruntimeとlicenseが異なります。skill本文だけのコピーは契約・認証・MCP境界を壊します。</div>
    <div class="callout warn"><strong>openai/skillsは履歴参照</strong><br>上流READMEで非推奨です。44件は個別licenseの比較材料に留め、現行参照はopenai/pluginsへ寄せます。</div>
    <div class="callout"><strong>ECCは差分更新として扱う</strong><br>active ${eccComparison.active}件に対し現行上流は${eccComparison.current_upstream}件。同名${eccComparison.name_matches}件、active側だけ${eccComparison.active_only.length}件、上流追加${eccComparison.upstream_only.length}件です。</div>
    <div class="callout"><strong>Superpowersは二重取得しない</strong><br>原著14件のうちOpenAI Pluginsのsuperpowers packagingにも${superpowersPackagingOverlap}件あります。原著とCodex配布形態を比較して正本を1つにします。</div>
  </div>
</section>

<section id="sources" class="panel">
  <h2>母集団とlicense境界</h2>
  <div class="table-wrap"><table class="repo-table"><thead><tr><th>source</th><th>監査単位</th><th>固定commit</th><th>license境界</th><th>扱い</th></tr></thead><tbody>${repositoryTable}</tbody></table></div>
</section>

<section id="batches" class="panel">
  <h2>先に着手する改善バッチ</h2>
  <div class="batch-list">
    <div class="batch"><b>Batch 0 — P0を採用停止</b>license不明・制限、frontmatter不正、参照切れ、承認なし破壊操作を先に隔離する。本文編集ではなく、採用しない境界を確定する。</div>
    <div class="batch"><b>Batch 1 — active正本へ統合</b>active重複${summary.any_active_overlaps}件は新規skillを増やさず、固定commitとの差分から有益な規則だけを既存正本へ移す。</div>
    <div class="batch"><b>Batch 2 — 既存ECCをCodex化</b>active ${activeMetrics.total}件のうちClaude固有前提${activeMetrics.claude_specific}件、500行超${activeMetrics.over_500_lines}件を、承認契約とprogressive disclosureへ直す。</div>
    <div class="batch"><b>Batch 3 — pluginはbundle評価</b>導入済pluginは本文を複製せずversionを管理する。未導入pluginは用途が生じた時だけmanifest・MCP/app・license・認証を一体で評価する。</div>
    <div class="batch"><b>Batch 4 — 新規候補を小分け採用</b>high fit・permissive license・P1以下の候補だけを5〜10件単位で私用編集し、Test-AgentSet、dry-run、hash同期を通す。</div>
  </div>
</section>

<section id="all-proposals" class="panel">
  <h2>全${summary.audit_units}件の改善提案</h2>
  <p>skill名を押すと対象行をURL fragmentで示します。状態ボタンは「未読 → 検討中 → 検討済」をlocalStorageへ保存します。</p>
  <div class="filters">
    <input id="search" type="search" placeholder="skill、plugin、issue、提案を検索" aria-label="全文検索">
    <select id="repoFilter" aria-label="repository"><option value="">全source</option>${optionList(repositoryOptions)}</select>
    <select id="priorityFilter" aria-label="priority"><option value="">全priority</option>${optionList(['P0','P1','P2','P3'])}</select>
    <select id="recommendationFilter" aria-label="recommendation"><option value="">全扱い</option>${recommendationOptions.map((value) => `<option value="${htmlEscape(value)}">${htmlEscape(recommendationJa(value))}</option>`).join('')}</select>
    <select id="licenseFilter" aria-label="license"><option value="">全license</option>${optionList(licenseOptions)}</select>
    <select id="fitFilter" aria-label="user fit"><option value="">全fit</option>${optionList(['high','medium','specialized'])}</select>
    <button id="resetFilters" type="button">絞り込み解除</button>
  </div>
  <div class="result-line"><strong id="visibleCount">${summary.audit_units}</strong> / ${summary.audit_units} 件を表示</div>
  <div class="table-wrap"><table id="proposalTable"><thead><tr><th>読書状態</th><th>優先</th><th>source / plugin</th><th>skill / 原文</th><th>扱い</th><th>証拠</th><th>改善提案</th></tr></thead><tbody>${rowHtml}</tbody></table></div>
</section>

<section id="scope" class="panel">
  <h2>監査方法と境界</h2>
  <ul class="scope-list">
    <li>ECCはcanonicalな <code>skills/*/SKILL.md</code> 278件を監査し、519件の多言語docsコピーは別skillとして重複計上していません。</li>
    <li>OpenAI Pluginsは <code>.agents</code> と <code>plugins</code> 配下の全 <code>SKILL.md</code> 608件を監査し、明示的なplugin-eval fixtureも「除外すべき証拠」として一覧に含めています。</li>
    <li>license判定はclone内のroot LICENSE、個別LICENSE.txt、plugin manifestの宣言に限定します。法的助言ではなく、本文をコピーしてよいと推測しないための停止判定です。</li>
    <li>active重複はfolder/nameの完全一致、明示alias、name/description tokenの高一致から算出します。conceptual一致は人の最終判断が必要です。</li>
    <li>proposalは静的証拠から生成した一次監査です。外部API実行、plugin install、skill本文の私用編集はこの段階では行っていません。</li>
  </ul>
  <p class="footer-note">CSV: <code>${htmlEscape(normalizePath(path.relative(repoRoot, csvPath)))}</code> / Summary JSON: <code>${htmlEscape(normalizePath(path.relative(repoRoot, summaryPath)))}</code> / Generated: ${htmlEscape(summary.generated_at)}</p>
</section>
</main>
<script>
(() => {
  const rows = [...document.querySelectorAll('#proposalTable tbody tr')];
  const controls = {
    search: document.querySelector('#search'),
    repository: document.querySelector('#repoFilter'),
    priority: document.querySelector('#priorityFilter'),
    recommendation: document.querySelector('#recommendationFilter'),
    license: document.querySelector('#licenseFilter'),
    fit: document.querySelector('#fitFilter'),
  };
  const visibleCount = document.querySelector('#visibleCount');
  function applyFilters() {
    const query = controls.search.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const show = (!query || row.dataset.search.includes(query))
        && (!controls.repository.value || row.dataset.repository === controls.repository.value)
        && (!controls.priority.value || row.dataset.priority === controls.priority.value)
        && (!controls.recommendation.value || row.dataset.recommendation === controls.recommendation.value)
        && (!controls.license.value || row.dataset.license === controls.license.value)
        && (!controls.fit.value || row.dataset.fit === controls.fit.value);
      row.hidden = !show;
      if (show) visible += 1;
    }
    visibleCount.textContent = String(visible);
  }
  Object.values(controls).forEach((control) => control.addEventListener('input', applyFilters));
  document.querySelector('#resetFilters').addEventListener('click', () => {
    Object.values(controls).forEach((control) => { control.value = ''; });
    applyFilters();
  });

  const states = [
    { key: 'unread', label: '未読', className: '' },
    { key: 'progress', label: '検討中', className: 'state-progress' },
    { key: 'done', label: '検討済', className: 'state-done' },
  ];
  document.querySelectorAll('.read-state').forEach((button) => {
    const storageKey = 'ai-settings-upstream-audit:v1:' + button.dataset.rowId;
    const row = button.closest('tr');
    function render(stateKey) {
      const state = states.find((item) => item.key === stateKey) || states[0];
      button.textContent = state.label;
      row.classList.remove('state-progress', 'state-done');
      if (state.className) row.classList.add(state.className);
    }
    let current = localStorage.getItem(storageKey) || 'unread';
    render(current);
    button.addEventListener('click', () => {
      const index = states.findIndex((item) => item.key === current);
      current = states[(index + 1) % states.length].key;
      localStorage.setItem(storageKey, current);
      render(current);
    });
  });

  function flashTarget() {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    target.classList.remove('flash');
    void target.offsetWidth;
    target.classList.add('flash');
    setTimeout(() => target.classList.remove('flash'), 1100);
  }
  addEventListener('hashchange', flashTarget);
  flashTarget();
})();
</script>
</body>
</html>`;

fs.writeFileSync(htmlPath, html, 'utf8');

const expectedAuditUnits = upstreamRows.reduce((total, row) => total + Number(row.audit_units || 0), 0);
const uniqueIds = new Set(rows.map((row) => row.id));
const csvRoundTrip = parseCsv(readText(csvPath));
const htmlIds = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
const fragmentTargets = [...html.matchAll(/href="#([^"]+)"/g)].map((match) => match[1]);
const missingFragmentTargets = [...new Set(fragmentTargets.filter((target) => !htmlIds.has(target)))];
const htmlAuditRows = [...html.matchAll(/<tr id="[^"]+" data-repository=/g)].length;
const embeddedScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? '';
let embeddedScriptSyntax = 'passed';
try {
  Function(embeddedScript);
} catch (error) {
  embeddedScriptSyntax = `failed: ${error.message}`;
}
const validation = {
  expected_audit_units: expectedAuditUnits,
  generated_rows: rows.length,
  unique_ids: uniqueIds.size,
  csv_round_trip_rows: csvRoundTrip.length,
  html_audit_rows: htmlAuditRows,
  missing_fragment_targets: missingFragmentTargets,
  embedded_javascript_syntax: embeddedScriptSyntax,
};
if (
  expectedAuditUnits !== rows.length
  || uniqueIds.size !== rows.length
  || csvRoundTrip.length !== rows.length
  || htmlAuditRows !== rows.length
  || missingFragmentTargets.length
  || embeddedScriptSyntax !== 'passed'
) {
  throw new Error(`Report validation failed: ${JSON.stringify(validation)}`);
}
summary.validation = validation;
fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  auditUnits: rows.length,
  csvPath,
  htmlPath,
  summaryPath,
  priorityCounts: summary.priority_counts,
  recommendationCounts: summary.recommendation_counts,
  repositoryCounts: summary.repository_counts,
  validation,
}, null, 2));
