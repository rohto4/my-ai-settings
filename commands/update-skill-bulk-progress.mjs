import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reviewCsvPath = path.join(repoRoot, 'docs', 'review', 'upstream-skill-improvement-proposals-2026-07-17.csv');
const reviewHtmlPath = path.join(repoRoot, 'docs', 'review', 'upstream-skill-improvement-proposals-2026-07-17.html');
const statePath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-bulk-edit-progress.json');
const htmlPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-bulk-edit-progress-2026-07-17.html');
const candidatePath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-handoff-candidates.json');
const statusLabels = {
  not_started: '未着手',
  in_progress: '作業中',
  completed: '完了',
  blocked: '停止',
  failed: '要修正',
  selection_pending: '正本選定待ち',
};
const sourceStageLabels = {
  not_started: '未確定',
  in_progress: '引継ぎ整理中',
  handoff_confirmed: '引継ぎ確定',
  manual_review: '手動判断済み',
  blocked: '停止',
};
const targetStatusLabels = {
  waiting_sources: 'source待ち',
  ready: '統合可能',
  in_progress: '統合中',
  integrated: '統合済み',
  no_change_needed: '変更不要',
  blocked: '停止',
};
const readingRank = { S: 0, A: 1, B: 2, C: 3 };

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
    else if (char === '\n') { row.push(field.replace(/\r$/, '')); parsed.push(row); row = []; field = ''; }
    else field += char;
  }
  if (field.length || row.length) { row.push(field.replace(/\r$/, '')); parsed.push(row); }
  const [headers, ...values] = parsed.filter((item) => item.some((value) => value.length));
  return values.map((valueRow) => Object.fromEntries(headers.map((header, index) => [header, valueRow[index] ?? ''])));
}

function htmlEscape(value) {
  return String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

function recommendationJa(value) {
  return ({
    candidate_for_adaptation: '私用版候補', merge_compare_with_active: 'activeへ差分統合',
    compare_duplicate_sources: '上流を比較', use_installed_plugin: '導入済pluginを利用',
    evaluate_plugin_if_needed: '必要時にplugin採用判断', evaluate_as_plugin_bundle: 'plugin単位で採用判断',
    reference_only_deprecated: '非推奨・参照のみ', reference_only_license: 'license上参照のみ',
    exclude_fixture: 'fixture除外',
  })[value] ?? value;
}

const rows = parseCsv(fs.readFileSync(reviewCsvPath, 'utf8')).sort((left, right) =>
  readingRank[left.reading_priority] - readingRank[right.reading_priority]
  || Number(right.reading_score) - Number(left.reading_score)
  || left.skill_name.localeCompare(right.skill_name, 'ja'));
const rowById = new Map(rows.map((row) => [row.id, row]));

function normalizeTarget(value) {
  let normalized = String(value ?? '').trim().replaceAll('\\', '/').replace(/^\.\/+/, '').replace(/\/+$/, '');
  if (!normalized) return '';
  if (normalized.startsWith('plugin:')) return normalized;
  normalized = normalized.replace(/\/SKILL\.md$/iu, '');
  return `${normalized}/`;
}

function integrationTargetFor(row) {
  if (row.recommendation === 'use_installed_plugin') return `plugin:${row.plugin}:installed`;
  if (row.recommendation === 'evaluate_as_plugin_bundle') return `plugin:${row.plugin}:candidate`;
  if (row.recommendation === 'evaluate_plugin_if_needed') return `plugin:${row.plugin}:deferred`;
  if (row.active_overlap_skill) return normalizeTarget(`skills/ecc/${row.active_overlap_skill}`);
  if (row.recommendation === 'candidate_for_adaptation') return normalizeTarget(`skills/codex/${row.skill_name}`);
  return '';
}

function aliasTargetFor(row) {
  return row.recommendation === 'compare_duplicate_sources' ? 'plugin:superpowers:candidate' : '';
}

function expectedTargets() {
  const targets = {};
  for (const row of rows) {
    const target = integrationTargetFor(row) || aliasTargetFor(row);
    if (!target) continue;
    targets[target] ??= { expected_source_ids: [], mapped_count: 0, status: 'waiting_sources', integration_summary: '', verification: '', updated_at: '' };
    targets[target].expected_source_ids.push(row.id);
  }
  return targets;
}

function normalizeElements(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  const text = String(value ?? '').trim();
  return text ? [text] : [];
}

function defaultHandoffDecision(row, target, alias) {
  if (alias) return 'source_alias';
  if (row.recommendation === 'merge_compare_with_active') return 'merge_into_active';
  if (row.recommendation === 'candidate_for_adaptation') return 'adapt_into_codex';
  if (row.recommendation === 'use_installed_plugin') return 'use_installed_plugin';
  if (row.recommendation === 'evaluate_as_plugin_bundle') return 'evaluate_plugin_bundle';
  if (row.recommendation === 'evaluate_plugin_if_needed') return 'defer_plugin_evaluation';
  if (row.recommendation === 'reference_only_license' || row.recommendation === 'reference_only_deprecated') return 'reference_only';
  if (row.recommendation === 'exclude_fixture') return 'exclude_fixture';
  return target ? 'integrate' : 'no_target_needed';
}

function initialState() {
  const now = new Date().toISOString();
  return {
    schema_version: 2,
    source_review: path.relative(repoRoot, reviewCsvPath).replaceAll('\\', '/'),
    baseline_commit: '7d2a7a0',
    created_at: now,
    updated_at: now,
    entries: Object.fromEntries(rows.map((row, index) => [row.id, {
      sequence: index + 1,
      status: 'not_started',
      progress: 0,
      source_stage: 'not_started',
      handoff_decision: '',
      handoff_target: '',
      handoff_elements: [],
      action: '',
      result: '',
      target_path: '',
      verification: '',
      updated_at: '',
    }])),
    targets: expectedTargets(),
    batch_log: [],
    milestones_reported: [],
  };
}

function refreshTargets(state) {
  const expected = expectedTargets();
  const previous = state.targets ?? {};
  state.targets = Object.fromEntries(Object.entries(expected).map(([targetPath, target]) => {
    const prior = previous[targetPath] ?? {};
    const mapped = target.expected_source_ids.filter((id) => {
      const entry = state.entries[id];
      return entry.source_stage === 'handoff_confirmed' && normalizeTarget(entry.handoff_target) === targetPath;
    }).length;
    const manualReview = target.expected_source_ids.some((id) => state.entries[id].source_stage === 'manual_review');
    const ready = mapped === target.expected_source_ids.length;
    let status = targetStatusLabels[prior.status] ? prior.status : 'waiting_sources';
    if (manualReview) status = 'blocked';
    else if (!ready && status !== 'blocked') status = 'waiting_sources';
    if (ready && status === 'waiting_sources') status = 'ready';
    return [targetPath, {
      expected_source_ids: target.expected_source_ids,
      mapped_count: mapped,
      status,
      integration_summary: String(prior.integration_summary ?? ''),
      verification: String(prior.verification ?? ''),
      updated_at: String(prior.updated_at ?? ''),
    }];
  }));
}

function migrateState(state) {
  if (Number(state.schema_version ?? 1) > 2) throw new Error(`Unsupported schema version: ${state.schema_version}`);
  const legacy = Number(state.schema_version ?? 1) < 2;
  let changed = legacy;
  for (const row of rows) {
    const entry = state.entries?.[row.id];
    if (!entry) continue;
    const wasSelectionPending = entry.status === 'selection_pending';
    const completed = entry.status === 'completed';
    const target = integrationTargetFor(row);
    const alias = aliasTargetFor(row);
    if (wasSelectionPending) {
      entry.status = 'not_started';
      entry.progress = 0;
      changed = true;
    }
    if (legacy) {
      entry.source_stage = completed ? 'handoff_confirmed' : 'not_started';
      entry.handoff_decision = completed ? defaultHandoffDecision(row, target, alias) : '';
      entry.handoff_target = completed ? (target || alias) : '';
      entry.handoff_elements = completed && (entry.result || entry.action) ? [entry.result || entry.action] : [];
    } else {
      if (!('source_stage' in entry)) { entry.source_stage = completed ? 'handoff_confirmed' : 'not_started'; changed = true; }
      if (!('handoff_decision' in entry)) { entry.handoff_decision = completed ? defaultHandoffDecision(row, target, alias) : ''; changed = true; }
      if (!('handoff_target' in entry)) { entry.handoff_target = completed ? (target || alias) : ''; changed = true; }
      if (!('handoff_elements' in entry)) { entry.handoff_elements = completed && (entry.result || entry.action) ? [entry.result || entry.action] : []; changed = true; }
    }
    entry.handoff_elements = normalizeElements(entry.handoff_elements);
    if (entry.source_stage !== 'handoff_confirmed' && (entry.handoff_decision || entry.handoff_target || entry.handoff_elements.length)) {
      entry.handoff_decision = '';
      entry.handoff_target = '';
      entry.handoff_elements = [];
      changed = true;
    }
  }
  state.schema_version = 2;
  refreshTargets(state);
  if (changed) state.updated_at = new Date().toISOString();
  return state;
}

function validateState(state) {
  if (state.schema_version !== 2) throw new Error(`Progress schema must be v2: ${state.schema_version}`);
  const ids = Object.keys(state.entries ?? {});
  if (ids.length !== rows.length) throw new Error(`Progress entry count mismatch: ${ids.length} / ${rows.length}`);
  for (const row of rows) {
    const entry = state.entries[row.id];
    if (!entry) throw new Error(`Missing progress entry: ${row.id}`);
    if (!(entry.status in statusLabels)) throw new Error(`Invalid status for ${row.id}: ${entry.status}`);
    if (!Number.isInteger(entry.progress) || entry.progress < 0 || entry.progress > 100) throw new Error(`Invalid progress for ${row.id}: ${entry.progress}`);
    if (entry.status === 'completed' && entry.progress !== 100) throw new Error(`Completed row is not 100%: ${row.id}`);
    if (!(entry.source_stage in sourceStageLabels)) throw new Error(`Invalid source stage for ${row.id}: ${entry.source_stage}`);
    if (!Array.isArray(entry.handoff_elements)) throw new Error(`handoff_elements must be an array: ${row.id}`);
    if (['handoff_confirmed', 'manual_review'].includes(entry.source_stage) && entry.status !== 'completed') throw new Error(`Assessed source must be completed: ${row.id}`);
    if (entry.status === 'completed' && !['handoff_confirmed', 'manual_review'].includes(entry.source_stage)) throw new Error(`Completed source is not assessed: ${row.id}`);
  }
  const expected = expectedTargets();
  if (Object.keys(state.targets ?? {}).length !== Object.keys(expected).length) throw new Error('Target count mismatch.');
  for (const [targetPath, target] of Object.entries(state.targets)) {
    if (!(target.status in targetStatusLabels)) throw new Error(`Invalid target status: ${targetPath} / ${target.status}`);
    if (JSON.stringify(target.expected_source_ids) !== JSON.stringify(expected[targetPath]?.expected_source_ids)) throw new Error(`Target source set mismatch: ${targetPath}`);
    const mapped = target.expected_source_ids.filter((id) => state.entries[id].source_stage === 'handoff_confirmed' && normalizeTarget(state.entries[id].handoff_target) === targetPath).length;
    if (target.mapped_count !== mapped) throw new Error(`Target mapped count mismatch: ${targetPath}`);
    if (['ready', 'in_progress', 'integrated', 'no_change_needed'].includes(target.status) && mapped !== target.expected_source_ids.length) throw new Error(`Target is not ready: ${targetPath}`);
  }
}

function countsFor(state) {
  const counts = Object.fromEntries(Object.keys(statusLabels).map((status) => [status, 0]));
  for (const entry of Object.values(state.entries)) counts[entry.status] += 1;
  return counts;
}

function validateManifest(manifest, allowPartial) {
  if (!Array.isArray(manifest) || manifest.length === 0 || manifest.length > 10) throw new Error('Manifest must contain 1 to 10 entries.');
  if (!allowPartial && manifest.length !== 10) throw new Error('A normal progress update must contain exactly 10 entries.');
  return manifest;
}

function readManifest(manifestPath, allowPartial) {
  return validateManifest(JSON.parse(fs.readFileSync(path.resolve(manifestPath), 'utf8')), allowPartial);
}

function sourcePhaseComplete(state) {
  return rows.every((row) => ['handoff_confirmed', 'manual_review'].includes(state.entries[row.id].source_stage));
}

function applyManifest(state, manifestPath, allowPartial, suppliedManifest = null) {
  const manifest = suppliedManifest === null
    ? readManifest(manifestPath, allowPartial)
    : validateManifest(suppliedManifest, allowPartial);
  const unique = new Set(manifest.map((item) => item.id));
  if (unique.size !== manifest.length) throw new Error('Manifest contains duplicate ids.');
  const now = new Date().toISOString();
  const completedBefore = countsFor(state).completed;
  for (const update of manifest) {
    const row = rowById.get(update.id);
    if (!row) throw new Error(`Unknown row id: ${update.id}`);
    if (!['handoff_confirmed', 'manual_review', 'in_progress', 'blocked'].includes(update.source_stage)) throw new Error(`Invalid source_stage: ${update.id} / ${update.source_stage}`);
    const expectedTarget = integrationTargetFor(row);
    const expectedAlias = aliasTargetFor(row);
    const elements = normalizeElements(update.handoff_elements);
    let status = update.source_stage;
    let progress = Number(update.progress ?? state.entries[update.id].progress);
    let handoffDecision = '';
    let handoffTarget = '';
    if (update.source_stage === 'handoff_confirmed') {
      status = 'completed'; progress = 100;
      handoffDecision = String(update.handoff_decision ?? '');
      const suppliedTarget = String(update.handoff_target ?? '').trim();
      handoffTarget = expectedTarget || expectedAlias || suppliedTarget;
      if ((expectedTarget || expectedAlias) && normalizeTarget(suppliedTarget) !== normalizeTarget(handoffTarget)) throw new Error(`Handoff target mismatch: ${update.id} / expected ${handoffTarget || '(none)'}`);
      const targetDecisions = ['integrate', 'merge_into_active', 'adapt_into_codex', 'use_installed_plugin', 'evaluate_plugin_bundle', 'defer_plugin_evaluation', 'reference_only', 'no_unique_elements'];
      const noTargetDecisions = ['reference_only', 'exclude_fixture', 'no_target_needed', 'no_unique_elements', 'no_change_needed'];
      if (expectedTarget && !targetDecisions.includes(handoffDecision)) throw new Error(`Invalid target handoff decision: ${update.id} / ${handoffDecision}`);
      if (expectedAlias && handoffDecision !== 'source_alias') throw new Error(`Alias source requires source_alias: ${update.id}`);
      if (!expectedTarget && !expectedAlias && !noTargetDecisions.includes(handoffDecision)) throw new Error(`Invalid no-target handoff decision: ${update.id} / ${handoffDecision}`);
      if (!['no_unique_elements', 'no_target_needed', 'no_change_needed'].includes(handoffDecision) && elements.length === 0) throw new Error(`Handoff decision requires elements: ${update.id} / ${handoffDecision}`);
      if (handoffDecision === 'no_unique_elements' && elements.length !== 0) throw new Error(`no_unique_elements must not carry elements: ${update.id}`);
    } else if (update.source_stage === 'manual_review') {
      status = 'completed'; progress = 100;
      handoffDecision = 'manual_review';
      handoffTarget = expectedTarget || expectedAlias || String(update.handoff_target ?? '').trim();
      if ((expectedTarget || expectedAlias) && normalizeTarget(String(update.handoff_target ?? handoffTarget)) !== normalizeTarget(handoffTarget)) throw new Error(`Manual-review target mismatch: ${update.id}`);
      if (elements.length === 0) throw new Error(`manual_review requires a reason in handoff_elements: ${update.id}`);
    } else {
      status = update.source_stage === 'blocked' ? 'blocked' : 'in_progress';
      if (!Number.isInteger(progress) || progress < 0 || progress >= 100) throw new Error(`Unfinished source progress must be 0..99: ${update.id}`);
    }
    state.entries[update.id] = {
      ...state.entries[update.id],
      status,
      progress,
      source_stage: update.source_stage,
      handoff_decision: handoffDecision,
      handoff_target: handoffTarget,
      handoff_elements: ['handoff_confirmed', 'manual_review'].includes(update.source_stage) ? elements : [],
      action: String(update.action ?? ''),
      result: String(update.result ?? ''),
      target_path: String(update.target_path ?? ''),
      verification: String(update.verification ?? ''),
      updated_at: now,
    };
  }
  refreshTargets(state);
  validateState(state);
  const completedAfter = countsFor(state).completed;
  state.updated_at = now;
  state.batch_log.push({ phase: 'source_handoff', updated_at: now, size: manifest.length, ids: [...unique], completed_before: completedBefore, completed_after: completedAfter });
  for (let milestone = 50; milestone <= completedAfter; milestone += 50) {
    if (!state.milestones_reported.includes(milestone)) state.milestones_reported.push(milestone);
  }
}

function applyCandidateBatch(state, allowPartial) {
  const candidates = JSON.parse(fs.readFileSync(candidatePath, 'utf8')).entries ?? [];
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const pendingRows = rows.filter((row) => state.entries[row.id].source_stage === 'not_started').slice(0, 10);
  if (pendingRows.length === 0) throw new Error('No not_started source remains.');
  const manifest = pendingRows.map((row) => {
    const candidate = candidateById.get(row.id);
    if (!candidate) throw new Error(`Handoff candidate is missing: ${row.id}`);
    return {
      id: row.id,
      source_stage: candidate.needs_manual_review ? 'manual_review' : 'handoff_confirmed',
      handoff_decision: candidate.handoff_decision,
      handoff_target: candidate.handoff_target,
      handoff_elements: candidate.handoff_elements,
      action: candidate.needs_manual_review ? '手動判断へ保留' : 'review判定から引継ぎを確定',
      result: candidate.rationale,
      target_path: candidate.handoff_target,
      verification: `候補生成規則 ${candidate.confidence} / review recommendation ${candidate.recommendation}`,
    };
  });
  applyManifest(state, '', allowPartial, manifest);
}

function applyTargetManifest(state, manifestPath, allowPartial, suppliedManifest = null) {
  if (!sourcePhaseComplete(state)) throw new Error('All 968 sources must be assessed before apply-target-manifest.');
  const manifest = suppliedManifest === null
    ? readManifest(manifestPath, allowPartial)
    : validateManifest(suppliedManifest, allowPartial);
  const unique = new Set(manifest.map((item) => normalizeTarget(item.target_path ?? item.target)));
  if (unique.size !== manifest.length) throw new Error('Target manifest contains duplicate targets.');
  const now = new Date().toISOString();
  refreshTargets(state);
  for (const update of manifest) {
    const targetPath = normalizeTarget(update.target_path ?? update.target);
    const target = state.targets[targetPath];
    if (!target) throw new Error(`Unknown target: ${targetPath}`);
    if (!['ready', 'in_progress', 'blocked'].includes(target.status)) throw new Error(`Only ready, in-progress, or resolved blocked targets can be advanced: ${targetPath} / ${target.status}`);
    if (!['in_progress', 'integrated', 'no_change_needed', 'blocked'].includes(update.status)) throw new Error(`Invalid target status: ${targetPath} / ${update.status}`);
    const summary = String(update.integration_summary ?? '').trim();
    const verification = String(update.verification ?? '').trim();
    if (['integrated', 'no_change_needed'].includes(update.status) && (!summary || !verification)) throw new Error(`Completed target requires integration_summary and verification: ${targetPath}`);
    target.status = update.status;
    target.integration_summary = summary;
    target.verification = verification;
    target.updated_at = now;
  }
  state.updated_at = now;
  state.batch_log.push({ phase: 'target_integration', updated_at: now, size: manifest.length, targets: [...unique] });
  validateState(state);
}

function applyTargetResultBatch(state, resultPath, allowPartial) {
  const results = JSON.parse(fs.readFileSync(path.resolve(resultPath), 'utf8'));
  if (!Array.isArray(results)) throw new Error('Target result file must contain an array.');
  const pendingResults = results.filter((result) => {
    const target = state.targets[normalizeTarget(result.target_path ?? result.target)];
    return target && ['ready', 'in_progress', 'blocked'].includes(target.status);
  }).slice(0, 10);
  if (pendingResults.length === 0) throw new Error(`No ready target remains in result file: ${resultPath}`);
  applyTargetManifest(state, '', allowPartial, pendingResults);
}

function optionList(values) {
  return values.map((value) => `<option value="${htmlEscape(value)}">${htmlEscape(value)}</option>`).join('');
}

function render(state) {
  const sourceHtml = fs.readFileSync(reviewHtmlPath, 'utf8');
  const sourceCss = sourceHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
  const counts = countsFor(state);
  const target = rows.length;
  const percent = target ? (counts.completed / target * 100).toFixed(1) : '0.0';
  const targetCounts = Object.fromEntries(Object.keys(targetStatusLabels).map((status) => [status, 0]));
  for (const item of Object.values(state.targets)) targetCounts[item.status] += 1;
  const tableRows = rows.map((row) => {
    const entry = state.entries[row.id];
    const integrationTarget = integrationTargetFor(row);
    const handoffTarget = entry.handoff_target || integrationTarget || aliasTargetFor(row);
    const targetKey = integrationTarget || aliasTargetFor(row);
    const targetStatus = targetKey ? state.targets[targetKey]?.status ?? 'waiting_sources' : '';
    const statusClass = `work-${entry.status.replaceAll('_', '-')}`;
    const tags = [row.license || 'license不明', row.claude_specific === 'true' ? 'Claude前提' : '', row.codex_specific === 'true' ? 'Codex前提' : '', `${row.line_count}行`].filter(Boolean);
    const resultDetail = [entry.action && `<strong>処理:</strong> ${htmlEscape(entry.action)}`, entry.result && `<strong>結果:</strong> ${htmlEscape(entry.result)}`, entry.target_path && `<strong>対象:</strong> <code>${htmlEscape(entry.target_path)}</code>`, entry.verification && `<strong>検証:</strong> ${htmlEscape(entry.verification)}`].filter(Boolean).join('<br>');
    return `<tr id="${htmlEscape(row.id)}" class="${statusClass}" data-status="${entry.status}" data-progress="${entry.progress}" data-read-state="unread" data-reading="${row.reading_priority}" data-score="${row.reading_score}" data-repository="${htmlEscape(row.repository)}" data-skill="${htmlEscape(row.skill_name)}" data-importance="${htmlEscape(row.importance_ja)}" data-frequency="${htmlEscape(row.frequency_ja)}" data-difficulty="${htmlEscape(row.difficulty_ja)}" data-attribute="${htmlEscape(row.skill_attribute_ja)}" data-handling="${htmlEscape(row.recommendation)}" data-handoff-target="${htmlEscape(handoffTarget)}" data-handoff-elements="${htmlEscape(entry.handoff_elements.join(' '))}" data-target-status="${htmlEscape(targetStatus)}" data-search="${htmlEscape(`${row.skill_name} ${row.repository} ${row.plugin} ${row.usage_summary} ${row.effect_summary} ${row.proposal_ja} ${entry.action} ${entry.result} ${handoffTarget} ${entry.handoff_elements.join(' ')}`.toLowerCase())}">
      <td class="progress-cell"><strong>${entry.progress}%</strong><span class="progress-track"><span style="width:${entry.progress}%"></span></span></td>
      <td class="status-cell"><span class="status-badge ${statusClass}">${statusLabels[entry.status]}</span>${resultDetail ? `<details><summary>処理結果</summary><p>${resultDetail}</p></details>` : ''}</td>
      <td><code>${htmlEscape(handoffTarget || '-')}</code><br><small>${htmlEscape(sourceStageLabels[entry.source_stage])}</small></td>
      <td>${entry.handoff_elements.length ? htmlEscape(entry.handoff_elements.join(' / ')) : 'なし'}</td>
      <td>${targetStatus ? htmlEscape(targetStatusLabels[targetStatus]) : '-'}</td>
      <td><button class="read-state" type="button" data-row-id="${htmlEscape(row.id)}">未読</button></td>
      <td class="reading-cell"><span class="read-priority read-${row.reading_priority.toLowerCase()}">${row.reading_priority}</span><strong>${row.reading_score}</strong></td>
      <td><a class="skill-link" href="${htmlEscape(row.preview_file_url)}" target="_blank" rel="noopener">${htmlEscape(row.skill_name)}</a><br><small>${htmlEscape(row.repository_short)}${row.plugin ? ` / ${htmlEscape(row.plugin)}` : ''}</small><br><code>${htmlEscape(row.source_path)}</code></td>
      <td class="usage-cell" title="${htmlEscape(row.description)}"><span class="usage-scene">${htmlEscape(row.usage_summary)}</span><span class="usage-effect"><strong>効果:</strong> ${htmlEscape(row.effect_summary)}</span></td>
      <td class="axis-cell">${htmlEscape(row.importance_ja)}</td><td class="axis-cell">${htmlEscape(row.frequency_ja)}</td><td class="axis-cell">${htmlEscape(row.difficulty_ja)}</td>
      <td><span class="attribute">${htmlEscape(row.skill_attribute_ja)}</span></td>
      <td>${htmlEscape(recommendationJa(row.recommendation))}</td>
      <td class="proposal">${htmlEscape(row.proposal_ja)}</td>
      <td class="risk-tags"><span class="priority-badge ${row.priority.toLowerCase()}">${row.priority}</span><div class="chips">${tags.map((tag) => `<span>${htmlEscape(tag)}</span>`).join('')}</div></td>
      <td class="detail-cell"><details><summary>根拠と詳細</summary><p>${htmlEscape(row.reading_reason_ja)}</p><p>${htmlEscape(row.proposal_detail_ja)}</p></details></td>
    </tr>`;
  }).join('');
  const repositories = [...new Set(rows.map((row) => row.repository))].sort();
  const attributes = [...new Set(rows.map((row) => row.skill_attribute_ja))].sort();
  const handling = [...new Set(rows.map((row) => row.recommendation))].sort();
  const handoffTargets = [...new Set(rows.map((row) => integrationTargetFor(row) || aliasTargetFor(row)).filter(Boolean))].sort();
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>上流skill一括編集 進捗レビュー</title><style>${sourceCss}
body{font-size:13px}.progress-overview{display:grid;grid-template-columns:repeat(6,minmax(120px,1fr));gap:6px}.progress-overview .metric{min-height:58px}.progress-overview .metric strong{font-size:1.35rem}.progress-table{min-width:2900px}.progress-cell{width:92px;min-width:92px;white-space:nowrap}.progress-track{display:block;width:76px;height:5px;margin-top:4px;background:#23343b}.progress-track span{display:block;height:100%;background:#73e2a7}.status-cell{width:190px;min-width:190px}.status-badge{display:inline-block;padding:2px 6px;border:1px solid #7898a4;border-radius:2px;font-weight:800;white-space:nowrap}.work-completed.status-badge{border-color:#73e2a7;color:#b9f6d7}.work-selection-pending.status-badge{border-color:#ffd166;color:#ffd166}.work-failed.status-badge,.work-blocked.status-badge{border-color:#ff8d7d;color:#ffb4a8}.work-in-progress.status-badge{background:#4a3c17;color:#fff2c1}.progress-table tr.work-completed{background:#102a24}.progress-table tr.work-selection-pending{background:#332a14}.progress-table tr.work-failed,.progress-table tr.work-blocked{background:#3b2020}.progress-filter{width:100%;min-height:24px;padding:2px 4px;border:1px solid #7898a4;border-radius:2px;color:#fff;background:#06151b;font:inherit;font-size:10px}@media(max-width:1100px){.progress-overview{grid-template-columns:repeat(3,minmax(120px,1fr))}}@media(max-width:650px){.progress-overview{grid-template-columns:repeat(2,minmax(120px,1fr))}}</style></head>
<body><header><div class="eyebrow">AI SETTINGS / BULK SKILL REVISION / 2026-07-17</div><h1>上流skill一括編集 進捗レビュー</h1><p>大編集前baseline <code>7d2a7a0</code>。全968 sourceの引継ぎ確定後にtarget統合へ進む二相処理です。</p></header><main>
<section class="panel"><h2>全体進捗</h2><div class="progress-overview"><article class="metric"><span>source対象</span><strong>${target}</strong><small>全件</small></article><article class="metric"><span>assessment済み</span><strong>${counts.completed}</strong><small>${percent}%</small></article><article class="metric"><span>作業中</span><strong>${counts.in_progress}</strong><small>現在のbatch</small></article><article class="metric"><span>未着手</span><strong>${counts.not_started}</strong><small>残り</small></article><article class="metric"><span>要確認</span><strong>${counts.blocked + counts.failed}</strong><small>停止＋要修正</small></article><article class="metric"><span>旧選定待ち</span><strong>${counts.selection_pending}</strong><small>migration後は通常0</small></article></div><p class="result-line">source phase: ${sourcePhaseComplete(state) ? '完了・target manifest解禁' : '継続中・target manifest禁止'} / 更新: ${htmlEscape(state.updated_at)} / 10件batch: ${state.batch_log.length}回 / 50件報告点: ${state.milestones_reported.length ? state.milestones_reported.join(', ') : '未到達'}</p></section>
<section class="panel"><h2>target summary</h2><div class="progress-overview">${Object.entries(targetStatusLabels).map(([status,label]) => `<article class="metric"><span>${htmlEscape(label)}</span><strong>${targetCounts[status]}</strong><small>${status}</small></article>`).join('')}</div><p class="result-line">target総数 ${Object.keys(state.targets).length} / mapped source ${Object.values(state.targets).reduce((sum,item)=>sum+item.mapped_count,0)} / expected ${Object.values(state.targets).reduce((sum,item)=>sum+item.expected_source_ids.length,0)}</p></section>
<section class="panel"><h2>全968件の進捗とステータス</h2><p>元の読む順reviewと同じ情報へ、進捗と作業ステータスを追加しています。</p><div class="result-line"><strong id="visibleCount">${rows.length}</strong> / ${rows.length}件を表示</div><div class="table-wrap"><table id="progressTable" class="progress-table"><thead>
<tr class="column-titles"><th><button class="sort-button" data-sort="progress">進捗 <span class="sort-mark"></span></button></th><th><button class="sort-button" data-sort="status">ステータス <span class="sort-mark"></span></button></th><th>引継ぎ先</th><th>残す要素</th><th>統合先状態</th><th><button class="sort-button" data-sort="readState">読書状態 <span class="sort-mark"></span></button></th><th><button class="sort-button" data-sort="reading">読む順 <span class="sort-mark">▲</span></button></th><th><button class="sort-button" data-sort="skill">skill / source <span class="sort-mark"></span></button></th><th>使用場面／効果</th><th>重要度</th><th>頻度</th><th>難度</th><th>属性</th><th>扱い</th><th>改善要約</th><th>risk / タグ</th><th>根拠と詳細</th></tr>
<tr class="column-filters"><th></th><th><select id="statusFilter" class="progress-filter"><option value="">全status</option>${Object.entries(statusLabels).map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></th><th><select id="handoffTargetFilter" class="progress-filter"><option value="">全引継ぎ先</option>${optionList(handoffTargets)}</select></th><th><input id="handoffElementsFilter" class="progress-filter" type="search" placeholder="残す要素"></th><th><select id="targetStatusFilter" class="progress-filter"><option value="">全統合先状態</option>${Object.entries(targetStatusLabels).map(([value,label]) => `<option value="${value}">${label}</option>`).join('')}</select></th><th><select id="readStateFilter" class="progress-filter"><option value="">全て</option><option value="unread">未読</option><option value="progress">検討中</option><option value="done">読了</option></select></th><th><select id="readingFilter" class="progress-filter"><option value="">全順</option>${optionList(['S','A','B','C'])}</select></th><th><input id="searchFilter" class="progress-filter" type="search" placeholder="skillを検索"><select id="repoFilter" class="progress-filter"><option value="">全source</option>${optionList(repositories)}</select></th><th></th><th></th><th></th><th></th><th><select id="attributeFilter" class="progress-filter"><option value="">全属性</option>${optionList(attributes)}</select></th><th><select id="handlingFilter" class="progress-filter"><option value="">全扱い</option>${handling.map((value) => `<option value="${htmlEscape(value)}">${htmlEscape(recommendationJa(value))}</option>`).join('')}</select></th><th></th><th></th><th><button id="resetFilters" class="progress-filter" type="button">解除</button></th></tr>
</thead><tbody>${tableRows}</tbody></table></div></section></main>
<script>(()=>{const rows=[...document.querySelectorAll('#progressTable tbody tr')];const body=document.querySelector('#progressTable tbody');const controls={status:document.querySelector('#statusFilter'),handoffTarget:document.querySelector('#handoffTargetFilter'),handoffElements:document.querySelector('#handoffElementsFilter'),targetStatus:document.querySelector('#targetStatusFilter'),readState:document.querySelector('#readStateFilter'),reading:document.querySelector('#readingFilter'),search:document.querySelector('#searchFilter'),repository:document.querySelector('#repoFilter'),attribute:document.querySelector('#attributeFilter'),handling:document.querySelector('#handlingFilter')};function apply(){const q=controls.search.value.trim().toLowerCase(),elements=controls.handoffElements.value.trim().toLowerCase();let count=0;for(const row of rows){const show=(!controls.status.value||row.dataset.status===controls.status.value)&&(!controls.handoffTarget.value||row.dataset.handoffTarget===controls.handoffTarget.value)&&(!elements||row.dataset.handoffElements.toLowerCase().includes(elements))&&(!controls.targetStatus.value||row.dataset.targetStatus===controls.targetStatus.value)&&(!controls.readState.value||row.dataset.readState===controls.readState.value)&&(!controls.reading.value||row.dataset.reading===controls.reading.value)&&(!q||row.dataset.search.includes(q))&&(!controls.repository.value||row.dataset.repository===controls.repository.value)&&(!controls.attribute.value||row.dataset.attribute===controls.attribute.value)&&(!controls.handling.value||row.dataset.handling===controls.handling.value);row.hidden=!show;if(show)count+=1}document.querySelector('#visibleCount').textContent=String(count)}Object.values(controls).forEach(control=>control.addEventListener('input',apply));document.querySelector('#resetFilters').addEventListener('click',()=>{Object.values(controls).forEach(control=>{control.value=''});apply()});const states=[['unread','未読',''],['progress','検討中','state-progress'],['done','読了','state-done']];document.querySelectorAll('.read-state').forEach(button=>{const row=button.closest('tr');const key='ai-settings-upstream-audit:v1:'+button.dataset.rowId;let current=localStorage.getItem(key)||'unread';function render(){const state=states.find(item=>item[0]===current)||states[0];button.textContent=state[1];row.dataset.readState=state[0];row.classList.remove('state-progress','state-done');if(state[2])row.classList.add(state[2])}render();button.addEventListener('click',()=>{const index=states.findIndex(item=>item[0]===current);current=states[(index+1)%states.length][0];localStorage.setItem(key,current);render();apply()})});const statusRank={selection_pending:0,blocked:1,failed:2,in_progress:3,not_started:4,completed:5};const stateRank={unread:0,progress:1,done:2};const collator=new Intl.Collator('ja',{numeric:true});let active='reading';let direction='asc';function value(row,key){if(key==='progress')return Number(row.dataset.progress);if(key==='status')return statusRank[row.dataset.status]??9;if(key==='readState')return stateRank[row.dataset.readState]??9;if(key==='reading')return ({S:0,A:1,B:2,C:3})[row.dataset.reading]*100-Number(row.dataset.score);if(key==='skill')return row.dataset.skill;return ''}function sort(key){direction=active===key&&direction==='asc'?'desc':'asc';active=key;const factor=direction==='asc'?1:-1;rows.sort((a,b)=>{const av=value(a,key),bv=value(b,key);const compared=typeof av==='number'?av-bv:collator.compare(String(av),String(bv));return compared*factor});rows.forEach(row=>body.append(row));document.querySelectorAll('.sort-button').forEach(button=>{button.querySelector('.sort-mark').textContent=button.dataset.sort===key?(direction==='asc'?'▲':'▼'):''})}document.querySelectorAll('.sort-button').forEach(button=>button.addEventListener('click',()=>sort(button.dataset.sort)));apply()})();</script></body></html>`;
  fs.writeFileSync(htmlPath, html, 'utf8');
  return { htmlPath, counts, target, completedPercent: percent };
}

const [command = 'render', ...args] = process.argv.slice(2);
let state;
if (command === 'init') {
  if (fs.existsSync(statePath) && !args.includes('--force')) throw new Error(`Progress state already exists: ${statePath}`);
  state = initialState();
} else {
  if (!fs.existsSync(statePath)) throw new Error('Progress state is missing. Run init first.');
  state = migrateState(JSON.parse(fs.readFileSync(statePath, 'utf8')));
  if (command === 'apply-manifest') {
    const manifestPath = args.find((arg) => !arg.startsWith('--'));
    if (!manifestPath) throw new Error('Manifest path is required.');
    applyManifest(state, manifestPath, args.includes('--allow-partial'));
  } else if (command === 'apply-candidate-batch') {
    applyCandidateBatch(state, args.includes('--allow-partial'));
  } else if (command === 'apply-target-manifest') {
    const manifestPath = args.find((arg) => !arg.startsWith('--'));
    if (!manifestPath) throw new Error('Target manifest path is required.');
    applyTargetManifest(state, manifestPath, args.includes('--allow-partial'));
  } else if (command === 'apply-target-results-batch') {
    const resultPath = args.find((arg) => !arg.startsWith('--'));
    if (!resultPath) throw new Error('Target result path is required.');
    applyTargetResultBatch(state, resultPath, args.includes('--allow-partial'));
  } else if (command !== 'render') throw new Error(`Unknown command: ${command}`);
}
validateState(state);
fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(render(state), null, 2));
