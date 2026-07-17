import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const upstreamRoot = path.join(repoRoot, 'upstream');
const reportDir = path.join(repoRoot, 'docs', 'review');
const reportDate = '2026-07-17';
const csvPath = path.join(reportDir, `upstream-skill-improvement-proposals-${reportDate}.csv`);
const htmlPath = path.join(reportDir, `upstream-skill-improvement-proposals-${reportDate}.html`);
const summaryPath = path.join(reportDir, `upstream-skill-audit-summary-${reportDate}.json`);
const previewDir = path.join(repoRoot, 'runtime', 'skill-previews', reportDate);

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
const previousReviewRows = parseCsv(readText(path.join(repoRoot, 'registry', 'skills-retention-review.csv')));
const previousReviewByName = new Map(previousReviewRows.map((row) => [row['スキル名'].toLowerCase(), row]));
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
      source_file_url: pathToFileURL(skillPath).href,
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

const assessmentRatings = new Set(['高', '中', '低']);
const adoptionDispositionLabels = {
  continue: '継続利用',
  retire: '実質廃止',
  select: '正本選定待ち',
};

function adoptionDisposition(recommendation) {
  if (['candidate_for_adaptation', 'use_installed_plugin'].includes(recommendation)) return 'continue';
  if (recommendation === 'compare_duplicate_sources') return 'select';
  return 'retire';
}

const languageFrameworkPattern = /(?:^|[^a-z])(?:android|kotlin|swift|swiftui|ios|flutter|dart|java|spring|jpa|quarkus|python|django|fastapi|flask|javascript|typescript|react|vue|angular|next\.?js|nuxt|svelte|solid(?:js)?|node\.?js|bun|golang|rust|cargo|cpp|c\+\+|csharp|fsharp|f#|scala|elixir|erlang|haskell|ocaml|groovy|powershell|shell|bash|\.net|dotnet|php|laravel|perl|ruby|rails)(?:$|[^a-z])/i;
const qualityPattern = /quality|test|testing|tdd|verification|validate|validation|review|lint|security|hardening|performance|benchmark|debug|eval|assessment|audit|design|architecture|research|writing|documentation|diagram|visual|report|analysis|brand|presentation|accessibility/i;
const procedurePattern = /workflow|process|procedure|setup|install|deploy|migration|git|ops|runbook|triage|manage|management|planning|plan|scheduler|automation|launch|onboarding|connector|integration|implementation|create|build|configure|publish|release/i;
const highValuePattern = /security-review|security-and-hardening|verification|testing|tdd|code-review|git-workflow|context|task|planning|documentation|architecture-decision|api-design|debug|knowledge|research|browser|frontend-design|backend-pattern|cloudflare|aws|agent-eval|agentic-engineering|ai-regression|deployment|performance/i;
const highFrequencyPattern = /git|code-review|verification|test|tdd|debug|context|task|plan|documentation|knowledge|browser|api-design|backend-pattern|frontend-design|cloudflare|aws/i;
const specializedPattern = /twilio|zoom|life-science|ngs-|daloopa|moody|boltz|chronograph|morningstar|nvidia|genomics|clinical|pharma|billing|carrier|customs|energy-procurement|healthcare|hipaa|logistics|nutrient|x402|defi|trading|kubernetes|mailtrap|uspto|ito-data-atlas/i;

function skillAttribute(row) {
  const value = `${row.skill_name} ${row.folder_name} ${row.description} ${row.plugin} ${row.source_path}`;
  if (languageFrameworkPattern.test(value)) return '言語・FW専用';
  if (qualityPattern.test(value)) return '成果品質';
  if (procedurePattern.test(value)) return '手順・運用';
  return 'その他・専門';
}

function previousAssessment(row, overlap) {
  const direct = previousReviewByName.get(row.skill_name.toLowerCase())
    || previousReviewByName.get(row.folder_name.toLowerCase());
  const related = overlap.type === 'exact' || overlap.type === 'alias'
    ? previousReviewByName.get(overlap.name.toLowerCase())
    : null;
  const source = direct || related;
  if (!source) return null;
  const importance = source['重要度（pj-generalでの推定）'];
  const difficulty = source['タスク難易度（pj-generalでの推定）'];
  const frequency = source['使用頻度（pj-generalでの推定）'];
  if (![importance, difficulty, frequency].every((value) => assessmentRatings.has(value))) return null;
  return {
    importance,
    difficulty,
    frequency,
    source: direct ? 'ECC既存評価' : 'active対応評価',
  };
}

function assessReadingValue(row, overlap, recommendation) {
  const attribute = skillAttribute(row);
  const identity = `${row.skill_name} ${row.folder_name} ${row.plugin}`;
  const value = `${identity} ${row.description} ${row.source_path}`;
  const previous = previousAssessment(row, overlap);
  const situationalPlugin = row.repository === 'openai-plugins'
    && !['installed', 'system_source'].includes(row.plugin_state)
    && !['superpowers', 'openai-developers'].includes(row.plugin);
  const specialized = specializedPattern.test(identity) || situationalPlugin;

  let importance = previous?.importance ?? '中';
  let difficulty = previous?.difficulty ?? '中';
  let frequency = previous?.frequency ?? '中';
  if (!previous) {
    if (specialized || attribute === '言語・FW専用') importance = '低';
    else if (highValuePattern.test(identity)) importance = '高';

    if (row.destructive_command || row.external_mutation || row.scripts_count > 0 || row.line_count > 500
      || /security|architecture|migration|deploy|infrastructure|database|agentic|autonomous/i.test(value)) difficulty = '高';
    else if (row.line_count < 120 && !row.action_like) difficulty = '低';

    if (specialized || attribute === '言語・FW専用') frequency = '低';
    else if (highFrequencyPattern.test(identity)) frequency = '高';
  }

  const importancePoints = { 高: 35, 中: 22, 低: 8 }[importance];
  const frequencyPoints = { 高: 30, 中: 16, 低: 4 }[frequency];
  const difficultyPoints = { 高: 12, 中: 8, 低: 4 }[difficulty];
  const attributePoints = { 成果品質: 5, '手順・運用': 3, 'その他・専門': 0, '言語・FW専用': -6 }[attribute];
  const handlingPoints = {
    candidate_for_adaptation: 8,
    merge_compare_with_active: 8,
    use_installed_plugin: 6,
    evaluate_as_plugin_bundle: -8,
    compare_duplicate_sources: 2,
    evaluate_plugin_if_needed: -5,
    reference_only_deprecated: -20,
    reference_only_license: -25,
    exclude_fixture: -35,
  }[recommendation] ?? 0;
  const readingScore = Math.max(0, Math.min(100,
    importancePoints + frequencyPoints + difficultyPoints + attributePoints + handlingPoints));
  const readingPriority = readingScore >= 85 ? 'S' : readingScore >= 70 ? 'A' : readingScore >= 45 ? 'B' : 'C';
  const actionLabel = ({
    candidate_for_adaptation: '私用版候補',
    merge_compare_with_active: 'active統合候補',
    compare_duplicate_sources: '正本比較が必要',
    use_installed_plugin: 'pluginで利用',
    evaluate_plugin_if_needed: '必要時だけ評価',
    evaluate_as_plugin_bundle: 'plugin単位で評価',
    reference_only_deprecated: '後継だけ参照',
    reference_only_license: 'コピー不可・参照のみ',
    exclude_fixture: '採用対象外',
  })[recommendation] ?? recommendation;
  return {
    importance,
    difficulty,
    frequency,
    attribute,
    readingScore,
    readingPriority,
    assessmentSource: previous?.source ?? '静的推定',
    readingReason: `重要度${importance}・頻度${frequency}の${attribute}。${actionLabel}。`,
  };
}

function summarizeProposal(row, recommendation, overlap, issues) {
  const issueCodes = new Set(issues.map((issue) => issue.code));
  const parts = [];
  const base = ({
    candidate_for_adaptation: '私用版候補。',
    merge_compare_with_active: `${overlap.name}へ統合。`,
    compare_duplicate_sources: '上流を比較し正本を選ぶ。',
    use_installed_plugin: `${row.plugin} pluginを利用。`,
    evaluate_plugin_if_needed: `必要時だけ${row.plugin} pluginを評価。`,
    evaluate_as_plugin_bundle: `${row.plugin}をplugin単位で評価。`,
    reference_only_deprecated: '採用せず後継を参照。',
    reference_only_license: 'コピーせず要件のみ参照。',
    exclude_fixture: '採用対象外。',
  })[recommendation] ?? '採用方法を確認。';
  parts.push(base);

  if (issueCodes.has('destructive_without_approval') || issueCodes.has('mutation_without_approval')) {
    parts.push('破壊・外部操作を承認制にする。');
  }
  if (issueCodes.has('claude_assumption') && issueCodes.has('unix_only')) {
    parts.push('Claude・Unix前提をCodex／PowerShellへ置換。');
  } else if (issueCodes.has('claude_assumption')) {
    parts.push('Claude前提をCodexへ置換。');
  } else if (issueCodes.has('unix_only')) {
    parts.push('PowerShell手順を追加。');
  }
  if (parts.length < 3 && issueCodes.has('secret_boundary_missing')) parts.push('secret管理を分離。');
  if (parts.length < 3 && issueCodes.has('missing_local_resource')) parts.push('参照切れを修正。');
  if (parts.length < 3 && (issueCodes.has('frontmatter_invalid') || issueCodes.has('metadata_incomplete') || issueCodes.has('name_folder_mismatch'))) parts.push('metadataを修正。');
  if (parts.length < 3 && issueCodes.has('missing_dry_run')) parts.push('dry-runを追加。');
  if (parts.length < 3 && issueCodes.has('verification_missing')) parts.push('検証手順を追加。');
  if (parts.length < 3 && (issueCodes.has('task_state_missing') || issueCodes.has('completion_boundary_missing'))) parts.push('状態・完了条件を明記。');
  if (parts.length < 3 && issueCodes.has('progressive_disclosure')) parts.push('本文を分割。');
  if (parts.length < 3 && (issueCodes.has('trigger_boundary_missing') || issueCodes.has('non_trigger_boundary_missing'))) parts.push('発火境界を明記。');
  return parts.slice(0, 3).join(' ');
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

  const reading = assessReadingValue(row, overlap, recommendation);
  const proposalSummary = summarizeProposal(row, recommendation, overlap, issues);
  const disposition = adoptionDisposition(recommendation);

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
    adoption_disposition: disposition,
    adoption_disposition_ja: adoptionDispositionLabels[disposition],
    importance_ja: reading.importance,
    difficulty_ja: reading.difficulty,
    frequency_ja: reading.frequency,
    skill_attribute_ja: reading.attribute,
    reading_priority: reading.readingPriority,
    reading_score: reading.readingScore,
    reading_reason_ja: reading.readingReason,
    assessment_source_ja: reading.assessmentSource,
    proposal_ja: proposalSummary,
    proposal_detail_ja: proposals.join(' / '),
  });
}

function compactText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function shortenAtWord(value, limit) {
  const text = compactText(value);
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace >= Math.floor(limit * 0.65) ? lastSpace : limit).trim()}…`;
}

const explicitJapaneseUsage = new Map(Object.entries({
  'api-and-interface-design': 'APIやモジュール間の公開インターフェースを設計するとき',
  'code-review-and-quality': 'マージ前にコードの品質を多角的にレビューするとき',
  'security-and-hardening': '入力・認証・保存・外部連携の安全性を強化するとき',
  'api-design': 'REST APIの契約・命名・エラー・ページングを設計するとき',
  'security-review': '認証・秘密情報・決済などの実装を安全性から確認するとき',
  'writing-plans': '要件から複数段階の実装計画を作るとき',
  'postgres-patterns': 'PostgreSQLのスキーマ・インデックス・クエリを設計・改善するとき',
  'sandbox-sdk': '信頼できないコードを隔離環境で安全に実行するとき',
  'building-ai-agent-on-cloudflare': 'Cloudflare上で状態を持つAIエージェントを構築するとき',
  'building-mcp-server-on-cloudflare': 'Cloudflare Workers上でリモートMCPサーバーを構築するとき',
  cloudflare: 'Cloudflareの機能を使って開発・設計・運用するとき',
  wrangler: 'Wrangler CLIでCloudflare資源を開発・配備・管理するとき',
  'notion-research-documentation': '複数のNotion情報を調査し、根拠付き文書へまとめるとき',
  'planning-and-task-breakdown': '要件を着手可能な順序付きタスクへ分解するとき',
  'browser-testing-with-devtools': '実ブラウザでDOM・コンソール・ネットワーク・表示を検証するとき',
  'test-driven-development': '機能追加・不具合修正・挙動変更をテスト駆動で進めるとき',
  'browser-qa': 'ブラウザ操作と画面表示を自動で受入確認するとき',
  'codebase-onboarding': '初めて触るコードベースの構造・入口・規約を把握するとき',
  'coding-standards': '実装・レビューで共通のコーディング規約を適用するとき',
  'e2e-testing': 'Playwrightで主要なE2E動線を検証するとき',
  'tdd-workflow': '機能追加・修正・リファクタリングをテスト先行で進めるとき',
  'verification-loop': '作業結果を段階的に検証し、完了根拠を残すとき',
  'systematic-debugging': '不具合やテスト失敗の原因を体系的に切り分けるとき',
  'debugging-and-error-recovery': 'ビルド失敗や想定外挙動の根本原因を調査・復旧するとき',
  'verification-before-completion': '完了・修正済みと報告する前に実行結果を確認するとき',
  'frontend-design-direction': 'Web UIの視覚方針とプロダクトらしさを定めるとき',
  'product-capability': 'PRDや要望を実装可能な機能・制約・判断へ具体化するとき',
  'receiving-code-review': 'コードレビューの指摘を検証してから反映するとき',
  'requesting-code-review': '大きな変更の完了時やマージ前にレビューを依頼するとき',
  'workers-best-practices': 'Cloudflare Workersの実装を本番運用基準で確認するとき',
  'durable-objects': 'Durable Objectsで状態を持つ協調処理を実装・レビューするとき',
  'web-perf': 'Webページの表示速度とCore Web Vitalsを調査・改善するとき',
  'idea-refine': '曖昧なアイデアを広げ、前提を検証して具体化するとき',
  'search-first': '実装前に既存ツール・ライブラリ・パターンを調査するとき',
}));

const japaneseTopicTokens = new Map(Object.entries({
  api: 'API', ai: 'AI', aws: 'AWS', mcp: 'MCP', sdk: 'SDK', cli: 'CLI', ui: 'UI', ux: 'UX', html: 'HTML', css: 'CSS',
  ios: 'iOS', android: 'Android', java: 'Java', javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', rust: 'Rust',
  go: 'Go', golang: 'Go', csharp: 'C#', cpp: 'C++', php: 'PHP', kotlin: 'Kotlin', dart: 'Dart', flutter: 'Flutter',
  react: 'React', nextjs: 'Next.js', nuxt: 'Nuxt', vue: 'Vue', nodejs: 'Node.js', bun: 'Bun', laravel: 'Laravel', django: 'Django',
  postgres: 'PostgreSQL', postgresql: 'PostgreSQL', sql: 'SQL', cloudflare: 'Cloudflare', workers: 'Workers', wrangler: 'Wrangler',
  figma: 'Figma', notion: 'Notion', slack: 'Slack', gmail: 'Gmail', google: 'Google', github: 'GitHub', git: 'Git', chrome: 'Chrome',
  browser: 'ブラウザ', frontend: 'フロントエンド', backend: 'バックエンド', web: 'Web', mobile: 'モバイル', app: 'アプリ', application: 'アプリ',
  cloud: 'クラウド', server: 'サーバー', agent: 'エージェント', agents: 'エージェント', security: 'セキュリティ', hardening: '堅牢化',
  code: 'コード', coding: 'コーディング', review: 'レビュー', quality: '品質', testing: 'テスト', test: 'テスト', tdd: 'TDD', e2e: 'E2E',
  design: '設計', interface: 'インターフェース', architecture: 'アーキテクチャ', planning: '計画', plan: '計画', task: 'タスク',
  documentation: '文書化', document: '文書', documents: '文書', docs: '文書', writing: '文書作成', research: '調査', data: 'データ',
  analytics: '分析', analysis: '分析', performance: 'パフォーマンス', optimization: '最適化', migration: '移行', workflow: 'ワークフロー',
  automation: '自動化', monitoring: '監視', observability: '可観測性', debugging: 'デバッグ', error: 'エラー', recovery: '復旧',
  deployment: 'デプロイ', deploy: 'デプロイ', release: 'リリース', content: 'コンテンツ', email: 'メール', calendar: 'カレンダー',
  spreadsheet: 'スプレッドシート', spreadsheets: 'スプレッドシート', slides: 'スライド', pdf: 'PDF', finance: '財務', market: '市場',
  customer: '顧客', sales: '営業', billing: '請求', payment: '決済', payments: '決済', inventory: '在庫', logistics: '物流',
  healthcare: '医療', compliance: 'コンプライアンス', product: 'プロダクト', capability: '機能', database: 'データベース', patterns: 'パターン',
  pattern: 'パターン', strategy: '戦略', operations: '運用', management: '管理', integration: '連携', connector: 'コネクタ',
  image: '画像', video: '動画', audio: '音声', search: '検索', report: 'レポート', dashboard: 'ダッシュボード', metrics: '指標',
  evaluation: '評価', eval: '評価', benchmark: 'ベンチマーク', prompt: 'プロンプト', context: 'コンテキスト', memory: 'メモリ',
  native: 'Native', cron: '定期実行', jobs: 'ジョブ', job: 'ジョブ', index: 'インデックス', setup: 'セットアップ', dna: 'DNA', ngs: 'NGS',
  variant: '変異', calling: '検出', engineering: 'エンジニアリング', zoom: 'Zoom', cobrowse: '共同閲覧', ecc: 'ECC', recipes: 'レシピ',
  shopify: 'Shopify', admin: '管理', outlook: 'Outlook', meeting: '会議', prep: '準備', view: 'View', refactor: 'リファクタリング',
  vercel: 'Vercel', opentargets: 'OpenTargets', expo: 'Expo', module: 'モジュール', daily: '日次', brief: '要約', boltz: 'Boltz',
  protein: 'タンパク質', screen: 'スクリーニング', improve: '改善', intelligence: 'インテリジェンス', ktor: 'Ktor', executing: '実行',
  plans: '計画', skill: 'スキル', skills: 'スキル', framework: 'フレームワーク', library: 'ライブラリ', package: 'パッケージ',
}));

function japaneseSkillTopic(skillName) {
  const ignored = new Set(['and', 'or', 'the', 'for', 'with', 'from', 'to', 'of', 'on', 'using', 'use', 'build', 'building', 'create', 'creating', 'manage', 'managing', 'best']);
  const tokens = String(skillName ?? '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
  const translated = tokens.filter((token) => !ignored.has(token)).map((token) => japaneseTopicTokens.get(token) ?? token);
  return (translated.join('・') || skillName || 'このスキル')
    .replace(/React・Native/g, 'React Native')
    .replace(/Google・カレンダー/g, 'Google カレンダー')
    .replace(/Outlook・カレンダー/g, 'Outlook カレンダー')
    .replace(/Notion・会議/g, 'Notion会議')
    .replace(/Cloudflare・Workers/g, 'Cloudflare Workers');
}

function usageSummary(row) {
  const explicit = explicitJapaneseUsage.get(String(row.skill_name ?? '').toLowerCase());
  if (explicit) return explicit;
  const topic = japaneseSkillTopic(row.skill_name);
  const signal = String(row.skill_name ?? '').toLowerCase();
  let summary;
  if (/security|hardening|vulnerab|authentication|authorization|credential|secret/.test(signal)) summary = `${topic}の安全性を確認・改善するとき`;
  else if (/review|quality|lint|style check/.test(signal)) summary = `${topic}で成果物をレビュー・改善するとき`;
  else if (/test|verification|\bqa\b|benchmark|\beval\b/.test(signal)) summary = `${topic}で動作や品質を検証するとき`;
  else if (/debug|error|troubleshoot|recovery|failure/.test(signal)) summary = `${topic}の問題原因を調査・解消するとき`;
  else if (/deploy|release|ship|publish|launch/.test(signal)) summary = `${topic}を導入・公開するとき`;
  else if (/research|analysis|analyz|audit|investigat/.test(signal)) summary = `${topic}を調査・分析するとき`;
  else if (/plan|planning|breakdown|roadmap|strategy/.test(signal)) summary = `${topic}の方針や実行計画を整理するとき`;
  else if (/design|architecture|blueprint|schema/.test(signal)) summary = `${topic}を設計・見直すとき`;
  else if (/migrat|upgrade|refactor|moderniz/.test(signal)) summary = `${topic}を移行・改善するとき`;
  else if (/document|writing|article|content/.test(signal)) summary = `${topic}を作成・整理するとき`;
  else if (/monitor|observability|telemetry|watch/.test(signal)) summary = `${topic}を監視・確認するとき`;
  else if (/install|setup|config|configure/.test(signal)) summary = `${topic}を設定・導入するとき`;
  else if (/build|create|implement|develop|coding|author/.test(signal)) summary = `${topic}を実装・作成するとき`;
  else if (/manage|operations|workflow|automation|process/.test(signal)) summary = `${topic}を運用・自動化するとき`;
  else if (row.skill_attribute_ja === '成果品質') summary = `${topic}で成果物の品質を高めたいとき`;
  else if (row.skill_attribute_ja === '手順・運用') summary = `${topic}の手順を実行・運用するとき`;
  else if (row.skill_attribute_ja === '言語・FW専用') summary = `${topic}を使って実装・検証するとき`;
  else summary = `${topic}に関する専門的な作業・判断をするとき`;
  return shortenAtWord(summary, 90);
}

const explicitJapaneseEffect = new Map(Object.entries({
  'api-and-interface-design': '境界の曖昧さを減らし、変更時の互換性を保ちやすくする',
  'code-review-and-quality': '欠陥を早期発見し、マージ後の手戻りを減らす',
  'security-and-hardening': '脆弱性と情報漏えいのリスクを下げる',
  'api-design': 'APIの一貫性を高め、利用側の実装を容易にする',
  'security-review': '危険な実装を公開前に発見し、事故を防ぎやすくする',
  'writing-plans': '着手順と完了条件を明確にし、手戻りを減らす',
  'postgres-patterns': '性能劣化とデータ設計の手戻りを減らす',
  'sandbox-sdk': '危険なコードの影響範囲を隔離する',
  'building-ai-agent-on-cloudflare': '状態管理とリアルタイム処理を一貫して実装しやすくする',
  'building-mcp-server-on-cloudflare': '認証付きMCPを安全に公開・運用しやすくする',
  cloudflare: '適切な機能選定と構成判断を速める',
  wrangler: 'CLI操作ミスを減らし、配備を再現しやすくする',
  'notion-research-documentation': '情報の散在を減らし、根拠付き判断をしやすくする',
  'planning-and-task-breakdown': '着手可能な単位を明確にし、作業停滞を減らす',
  'browser-testing-with-devtools': '実行時だけ現れる表示・通信・コンソール問題を発見する',
  'test-driven-development': '変更による回帰を早期発見し、実装の信頼性を高める',
  'browser-qa': '画面上の崩れや操作不能を利用者より先に発見する',
  'codebase-onboarding': '調査時間を短縮し、安全に変更を始めやすくする',
  'coding-standards': '実装のばらつきを減らし、レビューを速める',
  'e2e-testing': '主要動線の回帰を利用者視点で検出する',
  'tdd-workflow': '期待挙動を先に固定し、回帰と手戻りを減らす',
  'verification-loop': '完了判断の精度を高め、未検証の見落としを減らす',
  'systematic-debugging': '推測修正を減らし、原因特定を速める',
  'debugging-and-error-recovery': '復旧までの試行錯誤と再発リスクを減らす',
  'verification-before-completion': '誤った完了報告を防ぎ、成果の信頼性を高める',
  'frontend-design-direction': '画面の一貫性とプロダクトらしさを高める',
  'product-capability': '曖昧な要望による実装漏れと再設計を減らす',
  'receiving-code-review': '誤解した修正や不適切な追従を防ぐ',
  'requesting-code-review': '見落としを減らし、マージ判断の信頼性を高める',
  'workers-best-practices': '本番障害につながるWorkers固有の実装ミスを減らす',
  'durable-objects': '状態競合を減らし、協調処理を安定させる',
  'web-perf': '表示待ちと操作遅延を減らし、利用体験を改善する',
  'idea-refine': '早すぎる決め打ちを防ぎ、計画の質を高める',
  'search-first': '再実装を避け、実績ある選択肢を使いやすくする',
}));

function effectSummary(row) {
  const explicit = explicitJapaneseEffect.get(String(row.skill_name ?? '').toLowerCase());
  if (explicit) return explicit;
  const signal = String(row.skill_name ?? '').toLowerCase();
  let effect;
  if (/security|hardening|vulnerab|auth|credential|secret/.test(signal)) effect = '脆弱性と情報漏えいのリスクを下げる';
  else if (/review|quality|lint/.test(signal)) effect = '欠陥を早期発見し、成果物の品質を高める';
  else if (/test|verification|\bqa\b|benchmark|\beval\b/.test(signal)) effect = '回帰や見落としを減らし、変更の信頼性を高める';
  else if (/debug|error|troubleshoot|recovery|failure/.test(signal)) effect = '原因特定を速め、復旧までの試行錯誤を減らす';
  else if (/deploy|release|ship|publish|launch/.test(signal)) effect = '公開時の操作漏れを減らし、配備を安定させる';
  else if (/research|analysis|analyz|audit|investigat|search/.test(signal)) effect = '判断材料を整理し、重要な見落としを減らす';
  else if (/plan|planning|breakdown|roadmap|strategy/.test(signal)) effect = '着手順と完了条件を明確にし、手戻りを減らす';
  else if (/design|architecture|blueprint|schema/.test(signal)) effect = '境界と方針を明確にし、変更時の混乱を減らす';
  else if (/migrat|upgrade|refactor|moderniz/.test(signal)) effect = '互換性リスクと移行時の手戻りを減らす';
  else if (/document|writing|article|content/.test(signal)) effect = '情報を再利用しやすくし、共有コストを下げる';
  else if (/monitor|observability|telemetry|watch/.test(signal)) effect = '異常を早期発見し、復旧判断を速める';
  else if (/install|setup|config|configure/.test(signal)) effect = '設定漏れを減らし、導入を再現しやすくする';
  else if (/build|create|creator|implement|develop|coding|author/.test(signal)) effect = '実装の抜け漏れを減らし、作業効率を高める';
  else if (/manage|operations|workflow|automation|process/.test(signal)) effect = '定型作業と判断のばらつきを減らし、運用を安定させる';
  else if (row.skill_attribute_ja === '成果品質') effect = '成果物の品質と一貫性を高める';
  else if (row.skill_attribute_ja === '手順・運用') effect = '手順の抜け漏れを減らし、作業を再現しやすくする';
  else if (row.skill_attribute_ja === '言語・FW専用') effect = '該当技術の実装精度と検証効率を高める';
  else effect = '専門判断の精度を高め、調査の手戻りを減らす';
  return shortenAtWord(effect, 70);
}

function localPreviewHref(rawHref, sourcePath) {
  const value = String(rawHref ?? '').trim().replace(/^<|>$/g, '');
  if (!value || /^(?:https?:|mailto:|file:|#)/i.test(value)) return value || '#';
  const hashIndex = value.indexOf('#');
  const target = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const fragment = hashIndex >= 0 ? value.slice(hashIndex) : '';
  try {
    return `${pathToFileURL(path.resolve(path.dirname(sourcePath), decodeURIComponent(target))).href}${fragment}`;
  } catch {
    return `${pathToFileURL(path.resolve(path.dirname(sourcePath), target)).href}${fragment}`;
  }
}

function renderInlineMarkdown(value, sourcePath) {
  const tokens = [];
  const protect = (html) => {
    const token = `\u0000INLINE${tokens.length}\u0000`;
    tokens.push(html);
    return token;
  };
  let text = String(value ?? '');
  text = text.replace(/`([^`]+)`/g, (_, code) => protect(`<code>${htmlEscape(code)}</code>`));
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, alt, href) => {
    const resolved = localPreviewHref(href, sourcePath);
    return protect(`<img src="${htmlEscape(resolved)}" alt="${htmlEscape(alt)}">`);
  });
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, label, href) => {
    const resolved = localPreviewHref(href, sourcePath);
    return protect(`<a href="${htmlEscape(resolved)}">${htmlEscape(label)}</a>`);
  });
  text = htmlEscape(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
    .replace(/~~([^~]+)~~/g, '<del>$1</del>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_]+)_/g, '$1<em>$2</em>');
  tokens.forEach((html, index) => {
    text = text.replace(`\u0000INLINE${index}\u0000`, html);
  });
  return text;
}

function splitMarkdownTableRow(line) {
  return line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());
}

function renderMarkdown(markdown, sourcePath) {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  const output = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }
    const fence = line.match(/^\s*(`{3,}|~{3,})\s*([^\s]*)\s*$/);
    if (fence) {
      const marker = fence[1][0];
      const length = fence[1].length;
      const language = fence[2] ? ` class="language-${htmlEscape(fence[2])}"` : '';
      const code = [];
      index += 1;
      while (index < lines.length && !new RegExp(`^\\s*${marker}{${length},}\\s*$`).test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      output.push(`<pre><code${language}>${htmlEscape(code.join('\n'))}</code></pre>`);
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${renderInlineMarkdown(heading[2], sourcePath)}</h${level}>`);
      index += 1;
      continue;
    }
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      output.push('<hr>');
      index += 1;
      continue;
    }
    if (line.includes('|') && index + 1 < lines.length && /^\s*\|?\s*:?-{3,}/.test(lines[index + 1]) && lines[index + 1].includes('|')) {
      const headers = splitMarkdownTableRow(line);
      index += 2;
      const bodyRows = [];
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        bodyRows.push(splitMarkdownTableRow(lines[index]));
        index += 1;
      }
      output.push(`<div class="md-table-wrap"><table><thead><tr>${headers.map((cell) => `<th>${renderInlineMarkdown(cell, sourcePath)}</th>`).join('')}</tr></thead><tbody>${bodyRows.map((cells) => `<tr>${cells.map((cell) => `<td>${renderInlineMarkdown(cell, sourcePath)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^\s*>\s?/, ''));
        index += 1;
      }
      output.push(`<blockquote>${quote.map((item) => renderInlineMarkdown(item, sourcePath)).join('<br>')}</blockquote>`);
      continue;
    }
    const unordered = line.match(/^\s*[-+*]\s+(.+)$/);
    if (unordered) {
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*[-+*]\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      output.push(`<ul>${items.map((item) => `<li>${renderInlineMarkdown(item, sourcePath)}</li>`).join('')}</ul>`);
      continue;
    }
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      const items = [];
      while (index < lines.length) {
        const match = lines[index].match(/^\s*\d+[.)]\s+(.+)$/);
        if (!match) break;
        items.push(match[1]);
        index += 1;
      }
      output.push(`<ol>${items.map((item) => `<li>${renderInlineMarkdown(item, sourcePath)}</li>`).join('')}</ol>`);
      continue;
    }
    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()
      && !/^\s*(`{3,}|~{3,}|#{1,6}\s|>|[-+*]\s+|\d+[.)]\s+)/.test(lines[index])) {
      if (lines[index].includes('|') && index + 1 < lines.length && lines[index + 1].includes('|') && /-{3,}/.test(lines[index + 1])) break;
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInlineMarkdown(paragraph.join(' '), sourcePath)}</p>`);
  }
  return output.join('\n');
}

function renderSkillPreview(row, sourcePath) {
  const parsed = parseFrontmatter(readText(sourcePath));
  const reportHref = `${pathToFileURL(htmlPath).href}#${encodeURIComponent(row.id)}`;
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${htmlEscape(row.skill_name)} — SKILL Markdown preview</title>
<style>
:root{color-scheme:dark;--bg:#071218;--panel:#0d2028;--ink:#f5fbff;--muted:#bfd2db;--line:#5c7f8d;--link:#ffd166;--code:#b9f6d7}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:linear-gradient(135deg,#050c10,#10252d 58%,#07151b);color:var(--ink);font-family:Inter,"Noto Sans JP","Yu Gothic UI",system-ui,sans-serif;font-size:15px;line-height:1.65}a{color:var(--link);text-underline-offset:3px}a:visited{color:#f5b7ff}header{padding:20px clamp(18px,4vw,56px);border-bottom:1px solid var(--line);background:#081c24}header small{display:block;color:var(--muted)}header h1{margin:3px 0 6px;font-size:clamp(1.65rem,4vw,2.5rem);line-height:1.15}.actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}.actions a{padding:5px 9px;border:1px solid #8daab5;border-radius:2px;color:#fff;background:#102a34;text-decoration:none}.actions a:hover{background:var(--link);color:#172027}main{max-width:1120px;margin:0 auto;padding:20px 18px 60px}.summary{margin:0 0 14px;padding:10px 12px;border-left:4px solid #7ee8ff;background:#0a1b22;color:#e9f4f8}.markdown{padding:22px clamp(18px,4vw,46px);border:1px solid var(--line);background:rgba(13,32,40,.96)}h1,h2,h3,h4{line-height:1.3;color:#fff}h1,h2{padding-bottom:.25em;border-bottom:1px solid #426572}h2{margin-top:1.8em}h3{margin-top:1.55em}p,li{max-width:92ch}code{color:var(--code);font-family:Consolas,"Cascadia Code",monospace}pre{overflow:auto;padding:14px;border:1px solid #3f626f;background:#041016}pre code{color:#eef8fb}blockquote{margin:1em 0;padding:.45em 1em;border-left:4px solid #7aa6b5;background:#0a1a20;color:#d6e8ee}.md-table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:7px 9px;border:1px solid var(--line);text-align:left;vertical-align:top}th{background:#244b59}img{max-width:100%;height:auto}hr{border:0;border-top:1px solid var(--line)}.source-path{overflow-wrap:anywhere;font-family:Consolas,monospace;color:var(--muted)}@media(max-width:650px){body{font-size:14px}.markdown{padding:16px 13px}}
</style>
</head>
<body data-preview-source="${htmlEscape(row.source_path)}">
<header><small>SKILL MARKDOWN PREVIEW / ${htmlEscape(row.repository_short)}</small><h1>${htmlEscape(row.skill_name)}</h1><div class="source-path">${htmlEscape(row.source_path)}</div><div class="actions"><a href="${htmlEscape(reportHref)}">レビュー表の該当行へ戻る</a><a href="${htmlEscape(row.source_file_url)}">原文SKILL.md</a><a href="${htmlEscape(row.source_url)}">固定commitの原文</a></div></header>
<main><p class="summary"><strong>使用場面:</strong> ${htmlEscape(row.usage_summary)}<br><strong>効果:</strong> ${htmlEscape(row.effect_summary)}</p><article class="markdown">${renderMarkdown(parsed.body, sourcePath)}</article></main>
</body>
</html>`;
}

rows.sort((left, right) =>
  right.reading_score - left.reading_score
  || priorityRank[left.priority] - priorityRank[right.priority]
  || left.repository.localeCompare(right.repository)
  || left.plugin.localeCompare(right.plugin)
  || left.skill_name.localeCompare(right.skill_name));

fs.mkdirSync(previewDir, { recursive: true });
const previewFileNames = new Set();
for (const row of rows) {
  row.usage_summary = usageSummary(row);
  row.effect_summary = effectSummary(row);
  const sourcePath = fileURLToPath(row.source_file_url);
  const previewFileName = `${createHash('sha256').update(`${row.repository}\n${row.source_path}`).digest('hex').slice(0, 20)}.html`;
  if (previewFileNames.has(previewFileName)) throw new Error(`Preview filename collision: ${row.id}`);
  previewFileNames.add(previewFileName);
  const previewPath = path.join(previewDir, previewFileName);
  row.preview_relative_path = normalizePath(path.relative(repoRoot, previewPath));
  row.preview_file_url = pathToFileURL(previewPath).href;
  fs.writeFileSync(previewPath, renderSkillPreview(row, sourcePath), 'utf8');
}

const columns = [
  'id', 'reading_priority', 'reading_score', 'importance_ja', 'difficulty_ja', 'frequency_ja', 'skill_attribute_ja',
  'reading_reason_ja', 'assessment_source_ja', 'priority', 'repository', 'plugin', 'skill_name', 'usage_summary', 'effect_summary', 'source_path', 'source_file_url', 'preview_relative_path', 'preview_file_url',
  'recommendation', 'adoption_disposition', 'adoption_disposition_ja',
  'license', 'license_category', 'plugin_state', 'active_overlap_type', 'active_overlap_skill',
  'upstream_duplicate_count', 'line_count', 'frontmatter_valid', 'name_matches_folder', 'has_trigger_boundary',
  'has_non_trigger_boundary', 'missing_resource_count', 'claude_specific', 'codex_specific', 'subagent_assumption',
  'external_mutation', 'destructive_command', 'explicit_user_boundary', 'dry_run_boundary', 'secret_reference',
  'secret_boundary', 'verification_boundary', 'completion_boundary', 'task_state_boundary', 'unix_only_assumption',
  'issue_count', 'issue_codes', 'issue_summary_ja', 'proposal_ja', 'proposal_detail_ja', 'description', 'source_url', 'repository_commit',
];

fs.mkdirSync(reportDir, { recursive: true });
writeCsv(rows, columns, csvPath);

function countBy(items, key) {
  const counts = {};
  for (const item of items) counts[item[key]] = (counts[item[key]] ?? 0) + 1;
  return counts;
}

const adoptionDispositionByReadingPriority = Object.fromEntries(
  ['S', 'A', 'B', 'C'].map((priority) => [
    priority,
    countBy(rows.filter((row) => row.reading_priority === priority), 'adoption_disposition'),
  ]),
);

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
  reading_priority_counts: countBy(rows, 'reading_priority'),
  importance_counts: countBy(rows, 'importance_ja'),
  difficulty_counts: countBy(rows, 'difficulty_ja'),
  frequency_counts: countBy(rows, 'frequency_ja'),
  skill_attribute_counts: countBy(rows, 'skill_attribute_ja'),
  assessment_source_counts: countBy(rows, 'assessment_source_ja'),
  priority_counts: countBy(rows, 'priority'),
  recommendation_counts: countBy(rows, 'recommendation'),
  adoption_disposition_counts: countBy(rows, 'adoption_disposition'),
  adoption_disposition_by_reading_priority: adoptionDispositionByReadingPriority,
  license_category_counts: countBy(rows, 'license_category'),
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
    skill_previews: normalizePath(path.relative(repoRoot, previewDir)),
    skill_preview_count: previewFileNames.size,
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
const attributeOptions = ['成果品質', '手順・運用', 'その他・専門', '言語・FW専用'];
const ratingOptions = ['高', '中', '低'];
const readingPriorityOptions = ['S', 'A', 'B', 'C'];

function adoptionSummaryRow(label, total, counts) {
  const continuing = counts.continue ?? 0;
  const retired = counts.retire ?? 0;
  const selecting = counts.select ?? 0;
  const retiredPercent = total ? (retired / total * 100).toFixed(1) : '0.0';
  return `<tr class="adoption-summary-row"><th>${label}</th><td>${total}</td><td class="continue-count">${continuing}</td><td class="retire-count">${retired} <small>(${retiredPercent}%)</small></td><td class="select-count">${selecting}</td></tr>`;
}

const adoptionSummaryHtml = [
  ...readingPriorityOptions.map((priority) => adoptionSummaryRow(
    priority,
    summary.reading_priority_counts[priority] ?? 0,
    summary.adoption_disposition_by_reading_priority[priority] ?? {},
  )),
  adoptionSummaryRow('合計', summary.audit_units, summary.adoption_disposition_counts),
].join('');

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

const topReadingRows = rows.filter((row) => row.reading_priority === 'S');

const topReadingHtml = topReadingRows.map((row, index) => `<tr data-read-state="unread" data-adoption-disposition="${htmlEscape(row.adoption_disposition)}">
    <td>${index + 1}</td>
    <td><button class="read-state top-read-state" type="button" data-row-id="${htmlEscape(row.id)}" aria-label="読書状態を変更">未読</button></td>
    <td><a class="skill-link" href="${htmlEscape(row.preview_file_url)}" target="_blank" rel="noopener" title="Markdown previewを開く">${htmlEscape(row.skill_name)}</a> <a class="row-jump" href="#${htmlEscape(row.id)}">一覧位置</a><br><small>${htmlEscape(row.repository_short)}${row.plugin ? ` / ${htmlEscape(row.plugin)}` : ''}</small></td>
    <td class="usage-cell" title="${htmlEscape(row.description)}"><span class="usage-scene">${htmlEscape(row.usage_summary)}</span><span class="usage-effect"><strong>効果:</strong> ${htmlEscape(row.effect_summary)}</span></td>
    <td><span class="read-priority read-${row.reading_priority.toLowerCase()}">${row.reading_priority}</span> <strong>${row.reading_score}</strong></td>
    <td class="axis-cell">${htmlEscape(row.importance_ja)}</td>
    <td class="axis-cell">${htmlEscape(row.frequency_ja)}</td>
    <td class="axis-cell">${htmlEscape(row.difficulty_ja)}</td>
    <td>${htmlEscape(row.skill_attribute_ja)}</td>
    <td>${htmlEscape(recommendationJa(row.recommendation))}</td>
    <td>${htmlEscape(row.proposal_ja)}</td>
  </tr>`).join('');

function evidenceTags(row) {
  const tags = [];
  if (row.license === 'MIT') tags.push({ key: 'license:mit', label: 'MIT', title: 'MIT License。条件を守れば私用編集・再配布を検討できる' });
  else if (row.license_category === 'restricted') tags.push({ key: 'license:restricted', label: `再配布不可（${row.license}）`, title: '独自・制限付きlicense。本文を私用repoへコピーしない' });
  else if (row.license_category === 'unknown') tags.push({ key: 'license:unknown', label: 'license要確認', title: 'license根拠が不足しているため採用を止める' });
  else if (row.license_category === 'conditional') tags.push({ key: 'license:conditional', label: '表示条件あり', title: `複合または条件付きlicense（${row.license}）` });
  else tags.push({ key: `license:${row.license_category}`, label: row.license, title: `license: ${row.license}` });
  if (row.claude_specific) tags.push({ key: 'platform:claude', label: 'Claude前提', title: 'Claude Code固有のtool名・path・hookが含まれる' });
  if (row.codex_specific) tags.push({ key: 'platform:codex', label: 'Codex前提', title: 'Codex、AGENTS.md、.codexの記述が含まれる' });
  if (row.line_count < 250) tags.push({ key: 'length:under-250', label: '250行未満', title: `${row.line_count}行` });
  else tags.push({ key: 'length:250-plus', label: '250行以上', title: `${row.line_count}行。長めのskill` });
  if (row.line_count >= 500) tags.push({ key: 'length:500-plus', label: '500行以上', title: `${row.line_count}行。分割して読む候補` });
  if (row.verification_boundary) tags.push({ key: 'verification:present', label: '検証手順あり', title: 'test・check・evidence等の検証指示が本文にある' });
  else tags.push({ key: 'verification:missing', label: '検証手順なし', title: '完了確認や検証方法の記載が見つからない' });
  return tags;
}

const rowHtml = rows.map((row) => {
  const tags = evidenceTags(row);
  const tagKeys = tags.map((tag) => tag.key);
  return `<tr id="${htmlEscape(row.id)}" data-repository="${htmlEscape(row.repository)}" data-priority="${row.priority}" data-recommendation="${htmlEscape(row.recommendation)}" data-adoption-disposition="${htmlEscape(row.adoption_disposition)}" data-reading-priority="${row.reading_priority}" data-reading-score="${row.reading_score}" data-skill="${htmlEscape(row.skill_name)}" data-usage="${htmlEscape(`${row.usage_summary} ${row.effect_summary}`)}" data-importance="${htmlEscape(row.importance_ja)}" data-difficulty="${htmlEscape(row.difficulty_ja)}" data-frequency="${htmlEscape(row.frequency_ja)}" data-attribute="${htmlEscape(row.skill_attribute_ja)}" data-handling="${htmlEscape(recommendationJa(row.recommendation))}" data-proposal="${htmlEscape(row.proposal_ja)}" data-read-state="unread" data-tags="${htmlEscape(tagKeys.join('|'))}" data-search="${htmlEscape(`${row.skill_name} ${row.plugin} ${row.usage_summary} ${row.effect_summary} ${row.description} ${row.issue_codes} ${row.proposal_ja} ${row.proposal_detail_ja} ${tags.map((tag) => tag.label).join(' ')}`.toLowerCase())}">
    <td><button class="read-state" type="button" data-row-id="${htmlEscape(row.id)}" aria-label="読書状態を変更">未読</button></td>
    <td class="reading-cell"><button class="read-priority read-${row.reading_priority.toLowerCase()} cell-filter" type="button" data-filter-key="readingPriority" data-filter-value="${row.reading_priority}" aria-pressed="false" title="読む順 ${row.reading_priority} だけ表示">${row.reading_priority}</button><strong>${row.reading_score}</strong></td>
    <td><a class="skill-link" href="${htmlEscape(row.preview_file_url)}" target="_blank" rel="noopener" title="Markdown previewを開く">${htmlEscape(row.skill_name)}</a> <a class="row-jump" href="#${htmlEscape(row.id)}">行リンク</a><br><span class="source-dot source-${row.repository_color}"></span><button class="source-filter cell-filter" type="button" data-filter-key="repository" data-filter-value="${htmlEscape(row.repository)}" aria-pressed="false" title="${htmlEscape(row.repository_short)} だけ表示">${htmlEscape(row.repository_short)}${row.plugin ? ` / ${htmlEscape(row.plugin)}` : ''}</button><br><code>${htmlEscape(row.source_path)}</code></td>
    <td class="usage-cell" title="${htmlEscape(row.description)}"><span class="usage-scene">${htmlEscape(row.usage_summary)}</span><span class="usage-effect"><strong>効果:</strong> ${htmlEscape(row.effect_summary)}</span></td>
    <td class="axis-cell"><button class="axis-filter cell-filter" type="button" data-filter-key="importance" data-filter-value="${htmlEscape(row.importance_ja)}" aria-pressed="false" title="重要度 ${htmlEscape(row.importance_ja)} だけ表示">${htmlEscape(row.importance_ja)}</button></td>
    <td class="axis-cell"><button class="axis-filter cell-filter" type="button" data-filter-key="frequency" data-filter-value="${htmlEscape(row.frequency_ja)}" aria-pressed="false" title="頻度 ${htmlEscape(row.frequency_ja)} だけ表示">${htmlEscape(row.frequency_ja)}</button></td>
    <td class="axis-cell"><button class="axis-filter cell-filter" type="button" data-filter-key="difficulty" data-filter-value="${htmlEscape(row.difficulty_ja)}" aria-pressed="false" title="難易度 ${htmlEscape(row.difficulty_ja)} だけ表示">${htmlEscape(row.difficulty_ja)}</button></td>
    <td><button class="attribute cell-filter" type="button" data-filter-key="attribute" data-filter-value="${htmlEscape(row.skill_attribute_ja)}" aria-pressed="false" title="${htmlEscape(row.skill_attribute_ja)} だけ表示">${htmlEscape(row.skill_attribute_ja)}</button></td>
    <td><button class="handling-filter cell-filter" type="button" data-filter-key="recommendation" data-filter-value="${htmlEscape(row.recommendation)}" aria-pressed="false" title="${htmlEscape(recommendationJa(row.recommendation))} だけ表示">${htmlEscape(recommendationJa(row.recommendation))}</button></td>
    <td class="proposal">${htmlEscape(row.proposal_ja)}</td>
    <td class="risk-tags"><button class="priority-badge ${row.priority.toLowerCase()} cell-filter" type="button" data-filter-key="priority" data-filter-value="${row.priority}" aria-pressed="false" title="risk ${row.priority} だけ表示">${row.priority}</button><div class="chips">${tags.map((tag) => `<button type="button" class="tag-filter" data-tag="${htmlEscape(tag.key)}" title="${htmlEscape(tag.title)}">${htmlEscape(tag.label)}</button>`).join('')}</div></td>
    <td class="detail-cell"><details><summary>根拠と詳細</summary><p><strong>評価元:</strong> ${htmlEscape(row.assessment_source_ja)}</p><p><strong>役割:</strong> ${htmlEscape(row.description || 'descriptionなし')}</p><p><strong>読む理由:</strong> ${htmlEscape(row.reading_reason_ja)}</p><p><strong>検出:</strong> ${htmlEscape(row.issue_summary_ja || '重大な不足は未検出')}</p><p><strong>詳細提案:</strong> ${htmlEscape(row.proposal_detail_ja)}</p><p><a href="${htmlEscape(row.source_url)}">固定commitの原文を開く</a></p></details></td>
  </tr>`;
}).join('');

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>上流skill全件 読む順レビュー</title>
<style>
:root{color-scheme:light;--bg:#f3f6fa;--panel:#fff;--ink:#162033;--muted:#5e6b7c;--line:#d8e0ea;--shadow:0 10px 30px rgba(27,43,68,.08);--focus:#155eef}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--bg);color:var(--ink);font-family:"Yu Gothic UI","Noto Sans JP",system-ui,sans-serif;line-height:1.55}a{color:#1358b0}code{font-family:Consolas,monospace;font-size:.82em;overflow-wrap:anywhere}header{padding:42px clamp(18px,5vw,72px) 30px;background:linear-gradient(135deg,#102447,#183e6e);color:#fff}header .eyebrow{letter-spacing:.12em;font-size:.78rem;color:#a8c7f2}header h1{max-width:1000px;margin:.25rem 0;font-size:clamp(2rem,5vw,4.2rem);line-height:1.1}header p{max-width:900px;color:#d9e7fa}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}nav a{color:#fff;text-decoration:none;border:1px solid #ffffff55;border-radius:999px;padding:7px 12px;background:#ffffff12}main{max-width:1800px;margin:auto;padding:26px clamp(14px,3vw,40px) 80px}.panel{background:var(--panel);border:1px solid var(--line);border-radius:18px;box-shadow:var(--shadow);padding:clamp(18px,3vw,30px);margin:0 0 22px}.panel h2{margin-top:0;font-size:1.5rem}.overview-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}.metric{border:1px solid var(--line);border-radius:14px;padding:16px;background:#fafcff}.metric span,.metric small{display:block;color:var(--muted)}.metric strong{display:block;font-size:2rem}.priority-p0{border-left:6px solid #b42318}.priority-p1{border-left:6px solid #d97706}.priority-p2{border-left:6px solid #2563eb}.priority-p3{border-left:6px solid #667085}.conclusion{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-top:18px}.callout{padding:16px;border-radius:12px;background:#eef5ff;border:1px solid #c9dcfa}.callout.warn{background:#fff7e8;border-color:#f2d293}.callout.stop{background:#fff0ee;border-color:#efc0bb}.batch-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}.batch{border:1px solid var(--line);border-radius:14px;padding:16px}.batch b{display:block;margin-bottom:6px}.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:14px;background:#fff}table{border-collapse:separate;border-spacing:0;width:100%;min-width:1100px}th,td{padding:11px 12px;text-align:left;vertical-align:top;border-bottom:1px solid var(--line)}th{position:sticky;top:0;z-index:2;background:#eef3f9;font-size:.82rem}tbody tr:hover{background:#f8fbff}tbody tr.state-done{background:#f1f4f7;color:#697586}tbody tr.state-progress{background:#fffaf0}.repo-table{min-width:900px}.source-dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px}.source-blue{background:#2463b5}.source-violet{background:#7c3fb0}.source-amber{background:#c57a07}.source-slate{background:#667085}.source-green{background:#16865c}.priority-badge{display:inline-block;min-width:36px;text-align:center;border-radius:7px;padding:3px 7px;font-weight:700}.priority-badge.p0{background:#fee4e2;color:#912018}.priority-badge.p1{background:#fef0c7;color:#93370d}.priority-badge.p2{background:#dbeafe;color:#1849a9}.priority-badge.p3{background:#eaecf0;color:#344054}.chips{display:flex;flex-wrap:wrap;gap:4px}.chips span{font-size:.73rem;border:1px solid #cad4e0;border-radius:999px;padding:2px 7px;background:#f8fafc}.proposal{min-width:340px}.skill-link{font-weight:700}.read-state{border:1px solid #9fb0c5;background:#fff;border-radius:8px;padding:5px 8px;min-width:66px;cursor:pointer}.filters{display:grid;grid-template-columns:minmax(240px,2fr) repeat(5,minmax(130px,1fr));gap:8px;margin:14px 0}.filters input,.filters select,.filters button{min-height:40px;border:1px solid #aebdce;border-radius:9px;background:#fff;padding:7px 9px}.filters button{cursor:pointer}.result-line{color:var(--muted);margin:8px 0}details{margin-top:7px}details p{max-width:780px}.flash{animation:flash 1s ease-out}@keyframes flash{0%,100%{outline:0 solid transparent}25%{outline:5px solid #fbbf24;outline-offset:-5px}}.scope-list li{margin:.4rem 0}.footer-note{color:var(--muted);font-size:.9rem}@media(max-width:1100px){.filters{grid-template-columns:1fr 1fr}.filters input{grid-column:1/-1}}@media(max-width:650px){header{padding-top:28px}.filters{grid-template-columns:1fr}main{padding-left:9px;padding-right:9px}.panel{border-radius:12px;padding:14px}}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.flash{animation:none;outline:4px solid #fbbf24}}
/* Reading priority, attributes, compact proposal and filter layout. */
.read-priority{display:inline-grid;place-items:center;min-width:34px;height:30px;border-radius:9px;font-weight:800}.read-s{background:#d1fadf;color:#05603a}.read-a{background:#dbeafe;color:#1849a9}.read-b{background:#fef0c7;color:#93370d}.read-c{background:#eaecf0;color:#344054}.attribute{display:inline-block;border:1px solid #b9c7d8;border-radius:999px;padding:3px 8px;background:#f7f9fc;font-size:.82rem;white-space:nowrap}.axis-guide{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:16px}.axis-guide>div{border-left:4px solid #6487b4;background:#f7faff;padding:12px;border-radius:8px}.risk-strip{margin-top:14px;padding:12px 14px;border:1px solid #efc0bb;border-radius:10px;background:#fff5f3}.top-table{min-width:1050px}.top-table td:last-child{min-width:260px}.proposal{min-width:260px;max-width:380px}.filters{grid-template-columns:minmax(240px,2fr) repeat(4,minmax(120px,1fr))}.filters .wide{min-width:160px}tbody tr.state-done{background:#aeb6c2;color:#4b5563;filter:grayscale(1);opacity:.58}tbody tr.state-done:hover{background:#a7b0bc;opacity:.72}.chips button{font:inherit;font-size:.73rem;border:1px solid #cad4e0;border-radius:999px;padding:3px 8px;background:#f8fafc}.tag-filter{cursor:pointer}.tag-filter.active{outline:2px solid #155eef;background:#dbeafe}.row-jump{font-size:.72rem;white-space:nowrap}@media(max-width:1250px){.filters{grid-template-columns:repeat(3,1fr)}.filters input{grid-column:1/-1}}
/* Dense review-table appearance based on the accepted design-documentation review artifact. */
:root{color-scheme:dark;--bg:#050c10;--panel:#0d1d24;--ink:#f7fbff;--muted:#c5d5dc;--line:#668895;--link:#ffd166;--link-hover:#fff1ad;--active:#ffd166;--active-ink:#172027;--shadow:none;--focus:#7ee8ff}
body{background:linear-gradient(135deg,#050c10,#10252d 58%,#07151b);color:var(--ink);font-family:Inter,"Noto Sans JP","Yu Gothic UI",system-ui,sans-serif;font-size:13px;line-height:1.38}a{color:var(--link);text-decoration-thickness:1px;text-underline-offset:2px}a:hover{color:var(--link-hover);background:#3b3216}a:visited{color:#f5b7ff}code{color:#b9f6d7;font-size:11px}small{color:var(--muted)}header{padding:20px 24px 14px;background:#081c24;border-bottom:1px solid var(--line)}header .eyebrow{font-size:10px;color:#b9d8e4}header h1{margin:2px 0 4px;font-family:"BIZ UDPGothic","Yu Gothic UI",sans-serif;font-size:clamp(1.15rem,1.8vw,1.55rem);font-weight:700;line-height:1.2;letter-spacing:.02em;white-space:nowrap}header p{max-width:1100px;margin:4px 0;color:#e0edf2;font-size:12px}nav{gap:4px;margin-top:10px}nav a{padding:4px 7px;border:1px solid #8daab5;border-radius:2px;background:#102a34;color:#fff;font-size:11px;text-decoration:none}nav a:hover{background:var(--active);color:var(--active-ink)}
main{max-width:none;padding:12px 14px 36px}.panel{margin:0 0 10px;padding:12px;border:1px solid var(--line);border-radius:0;box-shadow:none;background:rgba(13,29,36,.96)}.panel h2{margin:0 0 6px;color:#fff;font-size:1.1rem}.panel>p{margin:4px 0 8px;color:#d9e8ed}.overview-grid{gap:6px}.metric{min-height:64px;padding:8px;border-radius:0;background:#081820}.metric strong{color:#fff;font-size:1.45rem}.axis-guide{gap:6px;margin-top:8px}.axis-guide>div{padding:7px;border-left-width:3px;border-radius:0;background:#081820}.risk-strip{margin-top:7px;padding:7px 9px;border-radius:0;background:#332a14;color:#fff2c1}.batch-list{gap:6px}.batch{padding:8px;border-radius:0;background:#081820}.batch b{margin-bottom:2px;color:#fff}
.table-wrap{overflow:auto;border:1px solid var(--line);border-radius:0;background:#061218}table{border-collapse:collapse;border-spacing:0}#proposalTable{min-width:2250px}.top-table{min-width:1780px}.repo-table{min-width:900px}th,td{padding:6px 7px;border-right:1px solid rgba(102,136,149,.8);border-bottom:1px solid rgba(102,136,149,.8);font-size:12px;line-height:1.3}td{color:#f1f7f9}th{background:#28505e;color:#fff;font-size:11px;white-space:nowrap}tbody tr:nth-child(even){background:#091a21}tbody tr:hover{background:#18404c}tbody tr.state-progress{background:#4a3c17}tbody tr.state-done{background:#263238;color:#829397;filter:grayscale(1);opacity:.46}tbody tr.state-done:hover{background:#34454c;opacity:.62}.column-titles th{top:0;z-index:4}.column-filters th{top:27px;z-index:3;padding:3px;background:#12323d}
.sort-button{display:flex;align-items:center;gap:4px;width:100%;padding:0;border:0;color:#fff;background:transparent;font:inherit;font-weight:800;text-align:left;cursor:pointer}.sort-button:hover{color:var(--active);background:transparent}.sort-button:focus-visible,.cell-filter:focus-visible,.column-filter:focus-visible{outline:2px solid var(--focus);outline-offset:1px}.sort-mark{display:inline-block;min-width:10px;color:var(--active)}.axis-head,.axis-cell{width:58px;min-width:58px;text-align:center;white-space:nowrap}.axis-cell{font-weight:800;font-size:13px}.reading-cell{white-space:nowrap}.reading-cell strong{margin-left:5px;color:#fff}.read-state{min-width:55px;padding:3px 6px;border:1px solid #8daab5;border-radius:2px;color:#fff;background:#081820;font-size:11px}.cell-filter{border:1px solid #7195a2;border-radius:2px;color:#fff;background:#0a2028;font:inherit;font-weight:700;cursor:pointer}.cell-filter:hover{border-color:var(--active);background:#26434a;color:#fff}.cell-filter.active{border-color:var(--active);background:var(--active);color:var(--active-ink);box-shadow:0 0 0 1px var(--active)}.read-priority{min-width:26px;height:22px;border-radius:2px}.axis-filter{min-width:28px;padding:2px 5px}.attribute,.handling-filter,.source-filter{padding:2px 5px;font-size:11px}.source-filter{max-width:260px;text-align:left}.priority-badge{min-width:29px;padding:2px 5px;border:1px solid currentColor;border-radius:2px;cursor:pointer}.chips{gap:2px;margin-top:3px}.chips button{padding:1px 5px;border-color:#7195a2;border-radius:2px;color:#eff8fb;background:#081820;font-size:10px;line-height:1.35}.chips button:hover{border-color:var(--active);color:var(--active)}.tag-filter.active{outline:1px solid var(--active);background:var(--active);color:var(--active-ink)}.row-jump{font-size:10px}.source-dot{width:8px;height:8px}.proposal{min-width:280px;max-width:none}.risk-tags{min-width:285px}.detail-cell{min-width:420px}.detail-cell details{margin:0}.detail-cell summary{cursor:pointer;color:var(--link);font-weight:700;white-space:nowrap}.detail-cell p{max-width:none;margin:4px 0}.skill-link{font-weight:800}
.usage-cell{width:390px;min-width:390px;max-width:390px;color:#e4f0f4}.usage-scene,.usage-effect{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.usage-effect{margin-top:2px;color:#b9f6d7;font-size:11px}.usage-effect strong{color:#e8fff4}.filter-stack{display:grid;gap:2px}.column-filter{width:100%;min-width:0;min-height:24px;padding:2px 4px;border:1px solid #7898a4;border-radius:2px;color:#fff;background:#06151b;font:inherit;font-size:10px}.column-filter:hover{border-color:var(--active)}.column-filter::placeholder{color:#aec2ca}.reset-filter{cursor:pointer}.reset-filter:hover{background:var(--active);color:var(--active-ink)}.result-line{margin:4px 0;color:#d9e8ed;font-size:11px}.result-line strong{color:#fff}.scope-list li{margin:2px 0}.footer-note{color:#c5d5dc;font-size:10px}@media(max-width:650px){header{padding:14px 10px 10px}header h1{font-size:1.15rem}main{padding:8px}.panel{padding:8px}}
.adoption-summary{display:grid;grid-template-columns:minmax(720px,900px) minmax(260px,1fr);gap:6px;margin-top:7px}.adoption-table{width:100%;min-width:700px}.adoption-table th,.adoption-table td{position:static;text-align:right;white-space:nowrap}.adoption-table th:first-child{text-align:left}.adoption-table thead th{background:#214551}.adoption-table tbody tr:last-child{border-top:2px solid var(--active);background:#102a34}.adoption-table .continue-count{color:#b9f6d7;font-weight:800}.adoption-table .retire-count{color:#ffb4a8;font-weight:800}.adoption-table .select-count{color:#ffd166;font-weight:800}.adoption-actions{padding:8px;border:1px solid var(--line);background:#081820}.adoption-actions p{margin:3px 0 7px;color:#d9e8ed}.focus-button{width:100%;padding:5px 8px;border:1px solid #8daab5;border-radius:2px;color:#fff;background:#102a34;font:inherit;font-weight:800;cursor:pointer}.focus-button:hover{border-color:var(--active);color:var(--active)}.focus-button:focus-visible{outline:2px solid var(--focus);outline-offset:1px}.focus-button[aria-pressed="true"]{border-color:var(--active);background:var(--active);color:var(--active-ink)}body.focus-continuing tr[data-adoption-disposition="retire"],body.focus-continuing tr[data-adoption-disposition="select"]{background:#1c2529!important;color:#708188;filter:grayscale(1);opacity:.28}body.focus-continuing tr[data-adoption-disposition="retire"]:hover,body.focus-continuing tr[data-adoption-disposition="select"]:hover{background:#2b3a40!important;opacity:.58}@media(max-width:1000px){.adoption-summary{grid-template-columns:1fr}}
#overview{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"title title" "metrics steps" "adoption adoption";column-gap:6px;row-gap:7px}#overview>h2{grid-area:title}#overview>.overview-grid{grid-area:metrics;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}#overview>.axis-guide{grid-area:steps;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:0}#overview>.adoption-summary{grid-area:adoption;margin-top:0}.adoption-table{table-layout:fixed}.adoption-table th:nth-child(1),.adoption-table td:nth-child(1){width:10%}.adoption-table th:nth-child(2),.adoption-table td:nth-child(2){width:12%}.adoption-table th:nth-child(n+3),.adoption-table td:nth-child(n+3){width:26%}.adoption-action-buttons{display:grid;gap:5px}@media(max-width:1250px){#overview{grid-template-columns:1fr;grid-template-areas:"title" "metrics" "steps" "adoption"}#overview>.overview-grid{grid-template-columns:repeat(4,minmax(140px,1fr))}#overview>.axis-guide{grid-template-columns:repeat(3,minmax(180px,1fr))}}@media(max-width:800px){#overview>.overview-grid{grid-template-columns:repeat(2,minmax(140px,1fr))}#overview>.axis-guide{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <div class="eyebrow">AI SETTINGS / FULL UPSTREAM STOCKTAKE / ${reportDate}</div>
  <h1>上流skill全件 読む順レビュー</h1>
  <p>${summary.audit_units}件すべてに、重要度・難易度・使用頻度・スキル属性と「読む順」を割り当てました。P0～P3はおすすめ度ではなく、採用時のriskとして分離しています。</p>
  <nav><a href="#overview">全体概要</a><a href="#top-reading">先に読む${topReadingRows.length}件</a><a href="#criteria">評価基準</a><a href="#all-proposals">全件一覧</a><a href="#sources">母集団</a><a href="#scope">監査境界</a></nav>
</header>
<main>
<section id="overview" class="panel">
  <h2>全体概要</h2>
  <div class="overview-grid">
    <article class="metric"><span>監査単位</span><strong>${summary.audit_units}</strong><small>全件に4軸を付与</small></article>
    <article class="metric"><span>重要度 高</span><strong>${summary.importance_counts['高'] ?? 0}</strong><small>利用価値の推定</small></article>
    <article class="metric"><span>成果品質</span><strong>${summary.skill_attribute_counts['成果品質'] ?? 0}</strong><small>結果を良くするskill</small></article>
    <article class="metric"><span>言語・FW専用</span><strong>${summary.skill_attribute_counts['言語・FW専用'] ?? 0}</strong><small>該当技術の採用時に読む</small></article>
  </div>
  <div class="axis-guide"><div><strong>まず読む順 S → A</strong><br>重要度・頻度・難易度と、今扱える候補かを合成。</div><div><strong>属性で用途を選ぶ</strong><br>成果品質、手順・運用、その他・専門、言語・FW専用。</div><div><strong>改善要約を読む</strong><br>調整をする場合コメントを入力</div></div>
  <div class="adoption-summary">
    <div class="table-wrap"><table class="adoption-table"><thead><tr><th>読む順</th><th>全体</th><th>継続利用</th><th>実質廃止</th><th>正本選定待ち</th></tr></thead><tbody>${adoptionSummaryHtml}</tbody></table></div>
    <aside class="adoption-actions"><strong>おすすめをすべて適用した後</strong><p>継続利用は「私用版へ編集して採用」または「導入済みpluginから利用」。実質廃止は、この上流監査行を独立skillとして残さないという意味です。ファイルを削除する操作ではありません。</p><div class="adoption-action-buttons"><button id="focusContinuing" class="focus-button" type="button" aria-pressed="false">継続利用以外をグレーアウト</button><button id="showSelectingOnly" class="focus-button" type="button" aria-pressed="false">正本選定待ちだけ表示（${summary.adoption_disposition_counts.select ?? 0}件）</button></div><p><small>グレーアウト対象: ${(summary.adoption_disposition_counts.retire ?? 0) + (summary.adoption_disposition_counts.select ?? 0)}件（実質廃止＋正本選定待ち）</small></p></aside>
  </div>
</section>

<section id="top-reading" class="panel">
  <h2>先に読む${topReadingRows.length}件</h2>
  <p>読む順Sに判定された全件です。skill名は整形済みMarkdown previewを別タブで開きます。</p>
  <div class="table-wrap"><table class="top-table"><thead><tr><th>#</th><th>読書状態</th><th>skill</th><th>使用場面／効果</th><th>読む順</th><th class="axis-head">重要度</th><th class="axis-head">頻度</th><th class="axis-head">難易度</th><th>属性</th><th>扱い</th><th>改善要約</th></tr></thead><tbody>${topReadingHtml}</tbody></table></div>
</section>

<section id="sources" class="panel">
  <h2>母集団とlicense境界</h2>
  <div class="table-wrap"><table class="repo-table"><thead><tr><th>source</th><th>監査単位</th><th>固定commit</th><th>license境界</th><th>扱い</th></tr></thead><tbody>${repositoryTable}</tbody></table></div>
</section>

<section id="criteria" class="panel">
  <h2>評価基準</h2>
  <div class="batch-list">
    <div class="batch"><b>重要度</b>複数PJへの影響、失敗時の影響、利用価値を高・中・低で推定。</div>
    <div class="batch"><b>使用頻度</b>現在のCodex作業で使う見込み。実測起動回数ではなく高・中・低の推定。</div>
    <div class="batch"><b>難易度</b>理解・編集・検証の難しさ。外部変更、安全性、script、長さも加味。</div>
    <div class="batch"><b>スキル属性</b>言語・FW専用／手順・運用／成果品質／その他・専門の主用途を1つ付与。</div>
    <div class="batch"><b>読む順 S / A / B / C</b>3指標に、属性と今の扱いやすさを加えた読む順。Sから確認する。</div>
    <div class="batch"><b>risk P0～P3</b>license・破壊操作・不足事項の停止/修正優先度。使用価値とは別。</div>
  </div>
</section>

<section id="all-proposals" class="panel">
  <h2>全${summary.audit_units}件の読む順と改善要約</h2>
  <p>skill名は整形済みMarkdown previewを別タブで開きます。「行リンク」はこの一覧位置を共有します。タグをクリックすると同じ条件で絞り込みます。</p>
  <div class="result-line"><strong id="visibleCount">${summary.audit_units}</strong> / ${summary.audit_units} 件を表示 <span id="activeTag"></span></div>
  <div class="table-wrap"><table id="proposalTable"><thead>
    <tr class="column-titles"><th aria-sort="none"><button class="sort-button" type="button" data-sort="state">読書状態<span class="sort-mark"></span></button></th><th aria-sort="descending"><button class="sort-button" type="button" data-sort="reading">読む順<span class="sort-mark">▼</span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="skill">skill / source<span class="sort-mark"></span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="usage">使用場面／効果<span class="sort-mark"></span></button></th><th class="axis-head" aria-sort="none"><button class="sort-button" type="button" data-sort="importance">重要度<span class="sort-mark"></span></button></th><th class="axis-head" aria-sort="none"><button class="sort-button" type="button" data-sort="frequency">頻度<span class="sort-mark"></span></button></th><th class="axis-head" aria-sort="none"><button class="sort-button" type="button" data-sort="difficulty">難易度<span class="sort-mark"></span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="attribute">属性<span class="sort-mark"></span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="handling">扱い<span class="sort-mark"></span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="proposal">改善要約<span class="sort-mark"></span></button></th><th aria-sort="none"><button class="sort-button" type="button" data-sort="risk">risk / タグ<span class="sort-mark"></span></button></th><th>根拠と詳細</th></tr>
    <tr class="column-filters">
      <th><select id="readStateFilter" class="column-filter" aria-label="読書状態"><option value="">全て</option><option value="unread">未読</option><option value="progress">検討中</option><option value="done">読了</option></select></th>
      <th><select id="readingPriorityFilter" class="column-filter" aria-label="読む順"><option value="">全て</option>${optionList(readingPriorityOptions)}</select></th>
      <th><div class="filter-stack"><input id="search" class="column-filter" type="search" placeholder="検索" aria-label="全文検索"><select id="repoFilter" class="column-filter" aria-label="repository"><option value="">全source</option>${optionList(repositoryOptions)}</select></div></th>
      <th></th>
      <th><select id="importanceFilter" class="column-filter" aria-label="重要度"><option value="">全て</option>${optionList(ratingOptions)}</select></th>
      <th><select id="frequencyFilter" class="column-filter" aria-label="使用頻度"><option value="">全て</option>${optionList(ratingOptions)}</select></th>
      <th><select id="difficultyFilter" class="column-filter" aria-label="難易度"><option value="">全て</option>${optionList(ratingOptions)}</select></th>
      <th><select id="attributeFilter" class="column-filter" aria-label="スキル属性"><option value="">全て</option>${optionList(attributeOptions)}</select></th>
      <th><select id="recommendationFilter" class="column-filter" aria-label="扱い"><option value="">全て</option>${recommendationOptions.map((value) => `<option value="${htmlEscape(value)}">${htmlEscape(recommendationJa(value))}</option>`).join('')}</select></th>
      <th></th>
      <th><select id="priorityFilter" class="column-filter" aria-label="risk"><option value="">全て</option>${optionList(['P0','P1','P2','P3'])}</select></th>
      <th><button id="resetFilters" class="column-filter reset-filter" type="button">解除</button></th>
    </tr>
  </thead><tbody>${rowHtml}</tbody></table></div>
</section>

<section id="scope" class="panel">
  <h2>監査方法と境界</h2>
  <ul class="scope-list">
    <li>ECCはcanonicalな <code>skills/*/SKILL.md</code> 278件を監査し、519件の多言語docsコピーは別skillとして重複計上していません。</li>
    <li>OpenAI Pluginsは <code>.agents</code> と <code>plugins</code> 配下の全 <code>SKILL.md</code> 608件を監査し、明示的なplugin-eval fixtureも「除外すべき証拠」として一覧に含めています。</li>
    <li>license判定はclone内のroot LICENSE、個別LICENSE.txt、plugin manifestの宣言に限定します。法的助言ではなく、本文をコピーしてよいと推測しないための停止判定です。</li>
    <li>active重複はfolder/nameの完全一致、明示alias、name/description tokenの高一致から算出します。conceptual一致は人の最終判断が必要です。</li>
    <li>重要度・難易度・使用頻度はECCの既存評価を優先し、未評価skillは名前・description・操作境界から静的推定します。使用頻度は実測起動回数ではありません。</li>
    <li>skill名のlocal file linkは、原文SKILL.mdから生成した <code>runtime/skill-previews/${reportDate}/*.html</code> を別タブで開きます。サーバーやCodex固有schemeに依存しません。</li>
    <li>proposalは静的証拠から生成した一次監査です。外部API実行、plugin install、skill本文の私用編集はこの段階では行っていません。</li>
  </ul>
  <p class="footer-note">CSV: <code>${htmlEscape(normalizePath(path.relative(repoRoot, csvPath)))}</code> / Summary JSON: <code>${htmlEscape(normalizePath(path.relative(repoRoot, summaryPath)))}</code> / Generated: ${htmlEscape(summary.generated_at)}</p>
</section>
</main>
<script>
(() => {
  const rows = [...document.querySelectorAll('#proposalTable tbody tr')];
  const topRows = [...document.querySelectorAll('.top-table tbody tr')];
  const controls = {
    search: document.querySelector('#search'),
    readState: document.querySelector('#readStateFilter'),
    repository: document.querySelector('#repoFilter'),
    priority: document.querySelector('#priorityFilter'),
    recommendation: document.querySelector('#recommendationFilter'),
    readingPriority: document.querySelector('#readingPriorityFilter'),
    importance: document.querySelector('#importanceFilter'),
    difficulty: document.querySelector('#difficultyFilter'),
    frequency: document.querySelector('#frequencyFilter'),
    attribute: document.querySelector('#attributeFilter'),
  };
  const visibleCount = document.querySelector('#visibleCount');
  const activeTagLabel = document.querySelector('#activeTag');
  const focusContinuingButton = document.querySelector('#focusContinuing');
  const showSelectingOnlyButton = document.querySelector('#showSelectingOnly');
  let selectedTag = '';
  let showSelectingOnly = false;
  focusContinuingButton.addEventListener('click', () => {
    const active = focusContinuingButton.getAttribute('aria-pressed') !== 'true';
    document.body.classList.toggle('focus-continuing', active);
    focusContinuingButton.setAttribute('aria-pressed', String(active));
    focusContinuingButton.textContent = active ? 'グレーアウトを解除' : '継続利用以外をグレーアウト';
  });
  function renderSelectingOnly() {
    showSelectingOnlyButton.setAttribute('aria-pressed', String(showSelectingOnly));
    showSelectingOnlyButton.textContent = showSelectingOnly
      ? '正本選定待ちだけ表示を解除'
      : '正本選定待ちだけ表示（${summary.adoption_disposition_counts.select ?? 0}件）';
    topRows.forEach((row) => { row.hidden = showSelectingOnly && row.dataset.adoptionDisposition !== 'select'; });
  }
  showSelectingOnlyButton.addEventListener('click', () => {
    showSelectingOnly = !showSelectingOnly;
    renderSelectingOnly();
    applyFilters();
    document.querySelector('#all-proposals').scrollIntoView({ block: 'start' });
  });
  function syncCellFilterState(filterKey = '') {
    const selector = filterKey ? '.cell-filter[data-filter-key="' + filterKey + '"]' : '.cell-filter';
    document.querySelectorAll(selector).forEach((button) => {
      const control = controls[button.dataset.filterKey];
      const active = Boolean(control) && control.value === button.dataset.filterValue;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function applyFilters() {
    const query = controls.search.value.trim().toLowerCase();
    let visible = 0;
    for (const row of rows) {
      const show = (!query || row.dataset.search.includes(query))
        && (!controls.readState.value || row.dataset.readState === controls.readState.value)
        && (!controls.repository.value || row.dataset.repository === controls.repository.value)
        && (!controls.priority.value || row.dataset.priority === controls.priority.value)
        && (!controls.recommendation.value || row.dataset.recommendation === controls.recommendation.value)
        && (!controls.readingPriority.value || row.dataset.readingPriority === controls.readingPriority.value)
        && (!controls.importance.value || row.dataset.importance === controls.importance.value)
        && (!controls.difficulty.value || row.dataset.difficulty === controls.difficulty.value)
        && (!controls.frequency.value || row.dataset.frequency === controls.frequency.value)
        && (!controls.attribute.value || row.dataset.attribute === controls.attribute.value)
        && (!selectedTag || row.dataset.tags.split('|').includes(selectedTag))
        && (!showSelectingOnly || row.dataset.adoptionDisposition === 'select');
      row.hidden = !show;
      if (show) visible += 1;
    }
    visibleCount.textContent = String(visible);
    activeTagLabel.textContent = selectedTag ? ' / タグ: ' + selectedTag : '';
  }
  Object.entries(controls).forEach(([key, control]) => control.addEventListener('input', () => {
    applyFilters();
    if (key !== 'search' && key !== 'readState') syncCellFilterState(key);
  }));
  document.querySelector('#resetFilters').addEventListener('click', () => {
    Object.values(controls).forEach((control) => { control.value = ''; });
    selectedTag = '';
    showSelectingOnly = false;
    renderSelectingOnly();
    document.querySelectorAll('.tag-filter.active').forEach((button) => button.classList.remove('active'));
    applyFilters();
    syncCellFilterState();
  });
  document.querySelectorAll('.tag-filter').forEach((button) => {
    button.addEventListener('click', () => {
      selectedTag = selectedTag === button.dataset.tag ? '' : button.dataset.tag;
      document.querySelectorAll('.tag-filter').forEach((item) => item.classList.toggle('active', Boolean(selectedTag) && item.dataset.tag === selectedTag));
      applyFilters();
      document.querySelector('#all-proposals').scrollIntoView({ block: 'start' });
    });
  });
  document.querySelectorAll('.cell-filter').forEach((button) => {
    button.addEventListener('click', () => {
      const control = controls[button.dataset.filterKey];
      if (!control) return;
      control.value = control.value === button.dataset.filterValue ? '' : button.dataset.filterValue;
      applyFilters();
      syncCellFilterState(button.dataset.filterKey);
    });
  });

  const tableBody = document.querySelector('#proposalTable tbody');
  const sortButtons = [...document.querySelectorAll('.sort-button')];
  const ratingRank = { '高': 3, '中': 2, '低': 1 };
  const stateRank = { unread: 1, progress: 2, done: 3 };
  const riskRank = { P0: 4, P1: 3, P2: 2, P3: 1 };
  const defaultSortDirection = {
    state: 'asc', reading: 'desc', skill: 'asc', importance: 'desc', frequency: 'desc', difficulty: 'desc',
    usage: 'asc', attribute: 'asc', handling: 'asc', proposal: 'asc', risk: 'desc',
  };
  let activeSortKey = 'reading';
  let activeSortDirection = 'desc';
  const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' });
  function sortValue(row, key) {
    if (key === 'state') return stateRank[row.dataset.readState] || 0;
    if (key === 'reading') return Number(row.dataset.readingScore);
    if (key === 'importance') return ratingRank[row.dataset.importance] || 0;
    if (key === 'frequency') return ratingRank[row.dataset.frequency] || 0;
    if (key === 'difficulty') return ratingRank[row.dataset.difficulty] || 0;
    if (key === 'risk') return riskRank[row.dataset.priority] || 0;
    if (key === 'skill') return row.dataset.skill;
    if (key === 'usage') return row.dataset.usage;
    if (key === 'attribute') return row.dataset.attribute;
    if (key === 'handling') return row.dataset.handling;
    if (key === 'proposal') return row.dataset.proposal;
    return '';
  }
  function sortRows(key, direction) {
    const factor = direction === 'asc' ? 1 : -1;
    rows.sort((left, right) => {
      const leftValue = sortValue(left, key);
      const rightValue = sortValue(right, key);
      const compared = typeof leftValue === 'number'
        ? leftValue - rightValue
        : collator.compare(String(leftValue), String(rightValue));
      return compared === 0 ? collator.compare(left.dataset.skill, right.dataset.skill) : compared * factor;
    });
    rows.forEach((row) => tableBody.append(row));
    sortButtons.forEach((button) => {
      const selected = button.dataset.sort === key;
      button.querySelector('.sort-mark').textContent = selected ? (direction === 'asc' ? '▲' : '▼') : '';
      button.parentElement.setAttribute('aria-sort', selected ? (direction === 'asc' ? 'ascending' : 'descending') : 'none');
    });
  }
  sortButtons.forEach((button) => {
    button.title = 'クリックで昇順・降順を切替';
    button.addEventListener('click', () => {
      const key = button.dataset.sort;
      activeSortDirection = activeSortKey === key
        ? (activeSortDirection === 'asc' ? 'desc' : 'asc')
        : defaultSortDirection[key];
      activeSortKey = key;
      sortRows(activeSortKey, activeSortDirection);
    });
  });

  const states = [
    { key: 'unread', label: '未読', className: '' },
    { key: 'progress', label: '検討中', className: 'state-progress' },
    { key: 'done', label: '読了', className: 'state-done' },
  ];
  const stateButtonsByRow = new Map();
  document.querySelectorAll('.read-state').forEach((button) => {
    const rowId = button.dataset.rowId;
    if (!stateButtonsByRow.has(rowId)) stateButtonsByRow.set(rowId, []);
    stateButtonsByRow.get(rowId).push(button);
  });
  stateButtonsByRow.forEach((buttons, rowId) => {
    const storageKey = 'ai-settings-upstream-audit:v1:' + rowId;
    function render(stateKey) {
      const state = states.find((item) => item.key === stateKey) || states[0];
      buttons.forEach((button) => {
        const row = button.closest('tr');
        button.textContent = state.label;
        row.dataset.readState = state.key;
        row.classList.remove('state-progress', 'state-done');
        if (state.className) row.classList.add(state.className);
      });
    }
    let current = localStorage.getItem(storageKey) || 'unread';
    render(current);
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const index = states.findIndex((item) => item.key === current);
        current = states[(index + 1) % states.length].key;
        localStorage.setItem(storageKey, current);
        render(current);
        applyFilters();
        if (activeSortKey === 'state') sortRows(activeSortKey, activeSortDirection);
      });
    });
  });
  renderSelectingOnly();
  applyFilters();

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
const invalidAssessmentRows = rows.filter((row) =>
  !assessmentRatings.has(row.importance_ja)
  || !assessmentRatings.has(row.difficulty_ja)
  || !assessmentRatings.has(row.frequency_ja)
  || !attributeOptions.includes(row.skill_attribute_ja)
  || !readingPriorityOptions.includes(row.reading_priority));
const validAdoptionDispositions = new Set(Object.keys(adoptionDispositionLabels));
const invalidAdoptionDispositionRows = rows.filter((row) => !validAdoptionDispositions.has(row.adoption_disposition));
const adoptionDispositionTotal = Object.values(summary.adoption_disposition_counts).reduce((total, count) => total + count, 0);
const adoptionRankTotalMismatches = readingPriorityOptions.filter((priority) => {
  const dispositionTotal = Object.values(summary.adoption_disposition_by_reading_priority[priority] ?? {})
    .reduce((total, count) => total + count, 0);
  return dispositionTotal !== (summary.reading_priority_counts[priority] ?? 0);
});
const maxProposalLength = Math.max(...rows.map((row) => row.proposal_ja.length));
const overlongProposalRows = rows.filter((row) => row.proposal_ja.length > 90);
const missingSourceFiles = rows.filter((row) => !fs.existsSync(fileURLToPath(row.source_file_url)));
const emptyUsageSummaryRows = rows.filter((row) => !row.usage_summary);
const nonJapaneseUsageRows = rows.filter((row) => !/[ぁ-んァ-ヶ一-龯]/.test(row.usage_summary));
const maxUsageSummaryLength = Math.max(...rows.map((row) => row.usage_summary.length));
const emptyEffectSummaryRows = rows.filter((row) => !row.effect_summary);
const nonJapaneseEffectRows = rows.filter((row) => !/[ぁ-んァ-ヶ一-龯]/.test(row.effect_summary));
const maxEffectSummaryLength = Math.max(...rows.map((row) => row.effect_summary.length));
const uniquePreviewUrls = new Set(rows.map((row) => row.preview_file_url));
const missingPreviewFiles = rows.filter((row) => !fs.existsSync(fileURLToPath(row.preview_file_url)));
const invalidPreviewFiles = rows.filter((row) => {
  if (!fs.existsSync(fileURLToPath(row.preview_file_url))) return false;
  const preview = readText(fileURLToPath(row.preview_file_url));
  return !preview.includes('<article class="markdown">') || !preview.includes('SKILL MARKDOWN PREVIEW') || /<script\b/i.test(preview);
});
const skillPreviewLinkCount = [...html.matchAll(/class="skill-link" href="file:\/\/\/[^"\s]+\.html"/g)].length;
const rawSkillLinkCount = [...html.matchAll(/class="skill-link" href="[^"]*SKILL\.md"/g)].length;
const usageCellCount = [...html.matchAll(/class="usage-cell"/g)].length;
const usageEffectLineCount = [...html.matchAll(/class="usage-effect"/g)].length;
const tagButtonCount = [...html.matchAll(/class="tag-filter" data-tag=/g)].length;
const sortButtonCount = [...html.matchAll(/class="sort-button"/g)].length;
const axisCellCount = [...html.matchAll(/class="axis-cell"/g)].length;
const riskTagCellCount = [...html.matchAll(/class="risk-tags"/g)].length;
const detailCellCount = [...html.matchAll(/class="detail-cell"/g)].length;
const legacyAxisLabelCount = [...html.matchAll(/重要度 \/ 頻度 \/ 難易度/g)].length;
const columnFilterRowCount = [...html.matchAll(/class="column-filters"/g)].length;
const columnFilterControlCount = [...html.matchAll(/class="column-filter(?: |")/g)].length;
const cellFilterButtonCount = [...html.matchAll(/<button[^>]*class="[^"]*\bcell-filter\b/g)].length;
const legacyFilterBandCount = [...html.matchAll(/<div class="filters">/g)].length;
const titleHeaderColumnCount = [...(html.match(/<tr class="column-titles">([\s\S]*?)<\/tr>/)?.[1] ?? '').matchAll(/<th\b/g)].length;
const filterHeaderColumnCount = [...(html.match(/<tr class="column-filters">([\s\S]*?)<\/tr>/)?.[1] ?? '').matchAll(/<th\b/g)].length;
const topHeaderColumnCount = [...(html.match(/<table class="top-table"><thead><tr>([\s\S]*?)<\/tr>/)?.[1] ?? '').matchAll(/<th\b/g)].length;
const readStateButtonCount = [...html.matchAll(/class="[^"]*\bread-state\b[^"]*"/g)].length;
const topReadStateButtonCount = [...html.matchAll(/class="[^"]*\btop-read-state\b[^"]*"/g)].length;
const legacyReadStateLabelCount = [...html.matchAll(/(?:label: '検討済'|value="done">検討済<\/option>)/g)].length;
const reportTitleHtml = html.match(/<header>[\s\S]*?<h1>([\s\S]*?)<\/h1>/)?.[1] ?? '';
const reportTitleBreakCount = [...reportTitleHtml.matchAll(/<br\b/g)].length;
const overviewTitleCount = [...html.matchAll(/<h2>全体概要<\/h2>/g)].length;
const improvementGuideTitleCount = [...html.matchAll(/<strong>改善要約を読む<\/strong>/g)].length;
const improvementGuideNoteCount = [...html.matchAll(/調整をする場合コメントを入力<\/div>/g)].length;
const adoptionDispositionAttributeCount = [...html.matchAll(/<tr[^>]*data-adoption-disposition="(?:continue|retire|select)"/g)].length;
const continuingDispositionAttributeCount = [...html.matchAll(/<tr[^>]*data-adoption-disposition="continue"/g)].length;
const retiredDispositionAttributeCount = [...html.matchAll(/<tr[^>]*data-adoption-disposition="retire"/g)].length;
const selectingDispositionAttributeCount = [...html.matchAll(/<tr[^>]*data-adoption-disposition="select"/g)].length;
const adoptionSummaryRowCount = [...html.matchAll(/class="adoption-summary-row"/g)].length;
const adoptionSummaryHeaderColumnCount = [...(html.match(/<table class="adoption-table"><thead><tr>([\s\S]*?)<\/tr>/)?.[1] ?? '').matchAll(/<th\b/g)].length;
const readingPriorityMetricCount = [...html.matchAll(/<article class="metric"><span>読む順 S<\/span>/g)].length;
const grayOutSummaryColumnCount = [...html.matchAll(/<th>グレーアウト対象<\/th>/g)].length;
const focusContinuingButtonCount = [...html.matchAll(/id="focusContinuing"/g)].length;
const showSelectingOnlyButtonCount = [...html.matchAll(/id="showSelectingOnly"/g)].length;
const overviewRiskStripCount = [...html.matchAll(/class="risk-strip"/g)].length;
const overviewRiskExplanationCount = [...html.matchAll(/<strong>riskは別軸:<\/strong>/g)].length;
const selectingOnlyFilterConditionCount = [...html.matchAll(/showSelectingOnly \|\| row\.dataset\.adoptionDisposition === 'select'/g)].length;
const overviewHalfLayoutCount = html.includes('grid-template-areas:"title title" "metrics steps" "adoption adoption"') ? 1 : 0;
const overviewMetricGridCount = html.includes('#overview>.overview-grid{grid-area:metrics;grid-template-columns:repeat(4,minmax(0,1fr))') ? 1 : 0;
const overviewStepGridCount = html.includes('#overview>.axis-guide{grid-area:steps;grid-template-columns:repeat(3,minmax(0,1fr))') ? 1 : 0;
const equalAdoptionStatusWidthCount = html.includes('.adoption-table th:nth-child(n+3),.adoption-table td:nth-child(n+3){width:26%}') ? 1 : 0;
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
  complete_reading_assessments: rows.length - invalidAssessmentRows.length,
  invalid_reading_assessment_ids: invalidAssessmentRows.map((row) => row.id),
  complete_adoption_dispositions: rows.length - invalidAdoptionDispositionRows.length,
  invalid_adoption_disposition_ids: invalidAdoptionDispositionRows.map((row) => row.id),
  adoption_disposition_total: adoptionDispositionTotal,
  adoption_rank_total_mismatches: adoptionRankTotalMismatches,
  max_proposal_summary_length: maxProposalLength,
  overlong_proposal_summary_ids: overlongProposalRows.map((row) => row.id),
  missing_source_file_ids: missingSourceFiles.map((row) => row.id),
  complete_usage_summaries: rows.length - emptyUsageSummaryRows.length,
  empty_usage_summary_ids: emptyUsageSummaryRows.map((row) => row.id),
  japanese_usage_summaries: rows.length - nonJapaneseUsageRows.length,
  non_japanese_usage_summary_ids: nonJapaneseUsageRows.map((row) => row.id),
  max_usage_summary_length: maxUsageSummaryLength,
  complete_effect_summaries: rows.length - emptyEffectSummaryRows.length,
  empty_effect_summary_ids: emptyEffectSummaryRows.map((row) => row.id),
  japanese_effect_summaries: rows.length - nonJapaneseEffectRows.length,
  non_japanese_effect_summary_ids: nonJapaneseEffectRows.map((row) => row.id),
  max_effect_summary_length: maxEffectSummaryLength,
  unique_skill_preview_urls: uniquePreviewUrls.size,
  missing_skill_preview_ids: missingPreviewFiles.map((row) => row.id),
  invalid_skill_preview_ids: invalidPreviewFiles.map((row) => row.id),
  local_skill_preview_links: skillPreviewLinkCount,
  raw_skill_md_links: rawSkillLinkCount,
  usage_cells: usageCellCount,
  usage_effect_lines: usageEffectLineCount,
  tag_filter_buttons: tagButtonCount,
  sortable_headers: sortButtonCount,
  independent_axis_cells: axisCellCount,
  risk_tag_cells: riskTagCellCount,
  detail_cells: detailCellCount,
  legacy_combined_axis_labels: legacyAxisLabelCount,
  column_filter_rows: columnFilterRowCount,
  column_filter_controls: columnFilterControlCount,
  title_header_columns: titleHeaderColumnCount,
  filter_header_columns: filterHeaderColumnCount,
  top_header_columns: topHeaderColumnCount,
  clickable_value_filters: cellFilterButtonCount,
  legacy_filter_bands: legacyFilterBandCount,
  top_reading_rows: topReadingRows.length,
  read_state_buttons: readStateButtonCount,
  top_read_state_buttons: topReadStateButtonCount,
  legacy_read_state_labels: legacyReadStateLabelCount,
  report_title_breaks: reportTitleBreakCount,
  overview_titles: overviewTitleCount,
  improvement_guide_titles: improvementGuideTitleCount,
  improvement_guide_notes: improvementGuideNoteCount,
  adoption_disposition_attributes: adoptionDispositionAttributeCount,
  continuing_disposition_attributes: continuingDispositionAttributeCount,
  retired_disposition_attributes: retiredDispositionAttributeCount,
  selecting_disposition_attributes: selectingDispositionAttributeCount,
  adoption_summary_rows: adoptionSummaryRowCount,
  adoption_summary_header_columns: adoptionSummaryHeaderColumnCount,
  reading_priority_metrics: readingPriorityMetricCount,
  gray_out_summary_columns: grayOutSummaryColumnCount,
  focus_continuing_buttons: focusContinuingButtonCount,
  show_selecting_only_buttons: showSelectingOnlyButtonCount,
  overview_risk_strips: overviewRiskStripCount,
  overview_risk_explanations: overviewRiskExplanationCount,
  selecting_only_filter_conditions: selectingOnlyFilterConditionCount,
  overview_half_layouts: overviewHalfLayoutCount,
  overview_metric_four_column_grids: overviewMetricGridCount,
  overview_step_three_column_grids: overviewStepGridCount,
  equal_adoption_status_width_rules: equalAdoptionStatusWidthCount,
  missing_fragment_targets: missingFragmentTargets,
  embedded_javascript_syntax: embeddedScriptSyntax,
};
if (
  expectedAuditUnits !== rows.length
  || uniqueIds.size !== rows.length
  || csvRoundTrip.length !== rows.length
  || htmlAuditRows !== rows.length
  || invalidAssessmentRows.length
  || invalidAdoptionDispositionRows.length
  || adoptionDispositionTotal !== rows.length
  || adoptionRankTotalMismatches.length
  || overlongProposalRows.length
  || missingSourceFiles.length
  || emptyUsageSummaryRows.length
  || nonJapaneseUsageRows.length
  || maxUsageSummaryLength > 90
  || emptyEffectSummaryRows.length
  || nonJapaneseEffectRows.length
  || maxEffectSummaryLength > 70
  || uniquePreviewUrls.size !== rows.length
  || missingPreviewFiles.length
  || invalidPreviewFiles.length
  || skillPreviewLinkCount !== rows.length + topReadingRows.length
  || rawSkillLinkCount !== 0
  || usageCellCount !== rows.length + topReadingRows.length
  || usageEffectLineCount !== rows.length + topReadingRows.length
  || tagButtonCount < rows.length * 3
  || sortButtonCount !== 11
  || axisCellCount !== (rows.length + topReadingRows.length) * 3
  || riskTagCellCount !== rows.length
  || detailCellCount !== rows.length
  || legacyAxisLabelCount !== 0
  || columnFilterRowCount !== 1
  || columnFilterControlCount !== 11
  || titleHeaderColumnCount !== 12
  || filterHeaderColumnCount !== 12
  || topHeaderColumnCount !== 11
  || cellFilterButtonCount !== rows.length * 8
  || legacyFilterBandCount !== 0
  || topReadingRows.length !== (summary.reading_priority_counts.S ?? 0)
  || readStateButtonCount !== rows.length + topReadingRows.length
  || topReadStateButtonCount !== topReadingRows.length
  || legacyReadStateLabelCount !== 0
  || reportTitleBreakCount !== 0
  || overviewTitleCount !== 1
  || improvementGuideTitleCount !== 1
  || improvementGuideNoteCount !== 1
  || adoptionDispositionAttributeCount !== rows.length + topReadingRows.length
  || continuingDispositionAttributeCount !== (summary.adoption_disposition_counts.continue ?? 0) + (summary.adoption_disposition_by_reading_priority.S?.continue ?? 0)
  || retiredDispositionAttributeCount !== (summary.adoption_disposition_counts.retire ?? 0) + (summary.adoption_disposition_by_reading_priority.S?.retire ?? 0)
  || selectingDispositionAttributeCount !== (summary.adoption_disposition_counts.select ?? 0) + (summary.adoption_disposition_by_reading_priority.S?.select ?? 0)
  || adoptionSummaryRowCount !== readingPriorityOptions.length + 1
  || adoptionSummaryHeaderColumnCount !== 5
  || readingPriorityMetricCount !== 0
  || grayOutSummaryColumnCount !== 0
  || focusContinuingButtonCount !== 1
  || showSelectingOnlyButtonCount !== 1
  || overviewRiskStripCount !== 0
  || overviewRiskExplanationCount !== 0
  || selectingOnlyFilterConditionCount !== 1
  || overviewHalfLayoutCount !== 1
  || overviewMetricGridCount !== 1
  || overviewStepGridCount !== 1
  || equalAdoptionStatusWidthCount !== 1
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
  previewDir,
  summaryPath,
  priorityCounts: summary.priority_counts,
  recommendationCounts: summary.recommendation_counts,
  repositoryCounts: summary.repository_counts,
  validation,
}, null, 2));
