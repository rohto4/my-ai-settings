import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const reviewPath = path.join(
  repoRoot,
  'docs',
  'review',
  'upstream-skill-improvement-proposals-2026-07-17.csv',
);
const pluginRegistryPath = path.join(repoRoot, 'registry', 'plugin-skill-adoptions.csv');
const progressPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-bulk-edit-progress.json');
const outputPath = path.join(repoRoot, 'docs', 'imp', 'upstream-skill-handoff-candidates.json');

const EXPECTED_TOTAL_ROWS = 968;
const EXPECTED_TARGET_ROWS = 968;
const EXPECTED_RESOLVED_ALIASES = 9;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  if (!headers) {
    return [];
  }

  return records
    .filter((record) => record.some((value) => value !== ''))
    .map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])));
}

function oneLine(value) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
}

function stripTerminalPunctuation(value) {
  return oneLine(value).replace(/[。．.!！]+$/u, '');
}

const genericClausePatterns = [
  /^active「[^」]+」を残し、この上流版はdiff材料として扱う$/u,
  /^新規追加せず、active「[^」]+」との差分を取り、有益な規則だけを正本側へ統合する$/u,
  /^active採用する場合だけagents\/openai\.yamlを追加し、default promptとskill名の一致を検証する$/u,
  /^permissive licenseを確認済みの候補として、Codex・Windows・承認・証拠契約を適用した私用版を別名または明確な正本で作る$/u,
  /^似たskillとの境界が分かる非trigger・対象外・引継ぎ先を追加する$/u,
  /^descriptionへ具体的な利用場面とtriggerを追加し、広すぎる自動発火を防ぐ$/u,
];

const compactClauseMap = new Map([
  [
    '外部変更経路へdry-runまたはfake境界を追加し、実token・live API・deployを別gateに分ける',
    '外部変更経路をfake/dry-run既定にし、実token・live API・deployを別gate化',
  ],
  [
    'push・deploy・送信・外部更新はread-only/dry-runを既定にし、実行直前にユーザーの明示承認を要求する',
    'push・deploy・送信・外部更新はread-only/dry-run既定、実行直前に明示承認',
  ],
  [
    'token・Cookie・credentialを本文やrepoへ書かず、環境変数またはsecret storeから注入し、ログではmaskする規則を追加する',
    'token・Cookie・credentialは環境変数またはsecret storeから注入し、ログでmask',
  ],
  [
    '削除・reset等は対象絶対pathの確認と明示承認を必須にし、既定をread-only診断へ変更する',
    '削除・resetは対象絶対path確認と明示承認を必須にし、既定はread-only診断',
  ],
  [
    'Windows + PowerShellの同等手順、LiteralPath、drive-letter、同一shell内での安全確認を追加する',
    'Windows/PowerShell同等手順とLiteralPath・drive-letter・同一shell内の安全確認',
  ],
  [
    '完了条件、実行したcheck/test、観測結果、未検証範囲を出力契約へ追加する',
    '完了条件・check/test・観測結果・未検証範囲を出力契約化',
  ],
  [
    '開始条件・停止条件・handoff・完了判定を明文化し、会話要約だけで再開しない',
    '開始・停止・handoff・完了条件を明文化し、会話要約だけで再開しない',
  ],
  [
    '長期作業ではAGENTS.md/PROJECT.mdとdocs/impの現行taskを実体から読み、進行中と完了証拠を分離する規則を追加する',
    '長期作業はAGENTS.md/PROJECT.mdとdocs/impを実体再読し、進行中と完了証拠を分離',
  ],
]);

function proposalClauses(value) {
  return oneLine(value)
    .split(/\s+\/\s+/u)
    .map(stripTerminalPunctuation)
    .filter(Boolean);
}

function isGenericClause(clause) {
  return genericClausePatterns.some((pattern) => pattern.test(clause));
}

function summarizeHandoffElements(row) {
  const detailClauses = proposalClauses(row.proposal_detail_ja)
    .filter((clause) => !isGenericClause(clause))
    .map((clause) => compactClauseMap.get(clause) ?? clause);

  const fallbackClauses = stripTerminalPunctuation(row.proposal_ja)
    .split(/。\s*/u)
    .map(stripTerminalPunctuation)
    .filter(Boolean)
    .filter((clause) => !/^(?:私用版候補|採用対象外|上流を比較し正本を選ぶ)$/u.test(clause))
    .filter((clause) => !/^[a-z0-9-]+へ統合$/u.test(clause));

  const selected = detailClauses.length > 0 ? detailClauses : fallbackClauses;
  const unique = [];
  const seen = new Set();

  for (const clause of selected) {
    const normalized = oneLine(clause);
    if (normalized && !seen.has(normalized)) {
      unique.push(normalized);
      seen.add(normalized);
    }
  }

  return unique.join(' / ');
}

function capabilityFallback(row) {
  const usage = stripTerminalPunctuation(row.usage_summary);
  const effect = stripTerminalPunctuation(row.effect_summary);
  const description = stripTerminalPunctuation(row.description);
  if (usage && effect) return `${usage} / 効果: ${effect}`;
  return usage || effect || description;
}

function pluginCapability(row, activeTarget = '') {
  const capability = capabilityFallback(row) || `plugin skill「${row.skill_name}」の能力`;
  return activeTarget ? `${capability} / active引継ぎ候補: ${activeTarget}` : capability;
}

function registryKey(plugin, skillName) {
  return `${plugin}\u0000${skillName}`;
}

function forwardSlashes(value) {
  return value.split(path.sep).join('/');
}

function resolveActiveTarget(activeSkill) {
  const matches = ['ecc', 'codex', 'original']
    .map((group) => path.join(repoRoot, 'skills', group, activeSkill, 'SKILL.md'))
    .filter((candidate) => fs.existsSync(candidate));

  if (matches.length !== 1) {
    return '';
  }

  return forwardSlashes(path.relative(repoRoot, matches[0]));
}

function referenceTarget(row) {
  if (row.plugin) {
    return `reference_only:plugin/${row.plugin}`;
  }
  return `reference_only:${row.repository}`;
}

function makeCandidate(row, progressEntry, registryEntry) {
  const base = {
    id: oneLine(row.id),
    sequence: progressEntry.sequence,
    recommendation: oneLine(row.recommendation),
    source_skill: oneLine(row.skill_name),
  };

  if (row.recommendation === 'compare_duplicate_sources') {
    const elements = summarizeHandoffElements(row) || capabilityFallback(row);
    return {
      ...base,
      handoff_decision: 'source_alias',
      handoff_target: 'plugin:superpowers:candidate',
      handoff_elements: `同名の現行plugin sourceへalias / ${elements}`,
      rationale: 'ユーザー指定の命名基準によりsource authorityの再選定を省き、同名の現行plugin sourceと同じbundle nodeへ統合する。',
      confidence: 'medium',
      needs_manual_review: false,
    };
  }

  const activeTarget = row.active_overlap_skill ? resolveActiveTarget(row.active_overlap_skill) : '';
  if (row.active_overlap_skill && !activeTarget) {
    return {
      ...base,
      handoff_decision: 'manual_review',
      handoff_target: `manual_review:active/${row.active_overlap_skill}`,
      handoff_elements: 'active targetの所属を一意に解決できないため要手動確認',
      rationale: `reviewのactive_overlap_skill「${row.active_overlap_skill}」に対応するactive targetが一意でない。`,
      confidence: 'low',
      needs_manual_review: true,
    };
  }

  if (row.recommendation === 'merge_compare_with_active') {
    const elements = summarizeHandoffElements(row);
    if (!elements) {
      return {
        ...base,
        handoff_decision: 'no_unique_elements',
        handoff_target: activeTarget,
        handoff_elements: '',
        rationale: 'reviewのactive比較対象だが、重複prefixとgeneric metadataを除くと固有の引継ぎ要素が残らない。',
        confidence: 'high',
        needs_manual_review: false,
      };
    }
    return {
      ...base,
      handoff_decision: 'merge_into_active',
      handoff_target: activeTarget,
      handoff_elements: elements,
      rationale: `reviewのmerge_compare_with_active判断とactive_overlap_skill「${row.active_overlap_skill}」をそのまま引き継ぐ。`,
      confidence: 'medium',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'candidate_for_adaptation') {
    const elements = summarizeHandoffElements(row) || capabilityFallback(row);
    const target = row.skill_name ? `skills/codex/${row.skill_name}/SKILL.md` : '';
    if (!target || !elements) {
      return {
        ...base,
        handoff_decision: 'manual_review',
        handoff_target: target || 'manual_review:codex-target',
        handoff_elements: elements || 'Codex版へ残す要素を一意に要約できないため要手動確認',
        rationale: 'reviewのcandidate_for_adaptation判断は維持するが、targetまたは内容が曖昧である。',
        confidence: 'low',
        needs_manual_review: true,
      };
    }
    return {
      ...base,
      handoff_decision: 'adapt_into_codex',
      handoff_target: target,
      handoff_elements: elements,
      rationale: 'reviewのcandidate_for_adaptation判断を維持し、source skill名のCodex targetへ引き継ぐ。',
      confidence: 'medium',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'use_installed_plugin') {
    const registryEvidence = registryEntry?.adoption_status === 'installed_plugin'
      ? 'plugin adoption registryのinstalled_pluginでも確認済み'
      : 'reviewのplugin_state=installedで確定済み';
    if (!row.plugin || !row.skill_name) {
      return {
        ...base,
        handoff_decision: 'manual_review',
        handoff_target: 'manual_review:installed-plugin',
        handoff_elements: 'plugin targetを一意に解決できないため要手動確認',
        rationale: 'use_installed_plugin判断に必要なplugin名またはskill名がない。',
        confidence: 'low',
        needs_manual_review: true,
      };
    }
    return {
      ...base,
      handoff_decision: 'use_installed_plugin',
      handoff_target: `plugin:${row.plugin}:installed`,
      handoff_elements: `本文を複製せず導入済みpluginを利用 / ${pluginCapability(row)}`,
      rationale: `reviewのuse_installed_plugin判断を維持し、${registryEvidence}。`,
      confidence: 'high',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'evaluate_as_plugin_bundle') {
    const evaluated = registryEntry?.adoption_status === 'evaluated_not_adopted';
    const elements = summarizeHandoffElements(row);
    return {
      ...base,
      handoff_decision: 'evaluate_plugin_bundle',
      handoff_target: `plugin:${row.plugin}:candidate`,
      handoff_elements: elements || pluginCapability(row, activeTarget),
      rationale: evaluated
        ? 'plugin単位の不採用判断を維持しつつ、reviewで残した能力またはactive引継ぎ候補をbundle nodeへ集約する。'
        : 'reviewのevaluate_as_plugin_bundle判断を維持し、全sourceをplugin単位の採用判断へ集約する。',
      confidence: evaluated ? 'medium' : 'high',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'evaluate_plugin_if_needed') {
    return {
      ...base,
      handoff_decision: 'defer_plugin_evaluation',
      handoff_target: `plugin:${row.plugin}:deferred`,
      handoff_elements: `具体需要が出た場合だけplugin単位で採用判断 / ${pluginCapability(row)}`,
      rationale: 'reviewのevaluate_plugin_if_needed判断を維持し、本文を複製せずplugin単位のdeferred nodeへ集約する。',
      confidence: 'high',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'reference_only_license' || row.recommendation === 'reference_only_deprecated') {
    return {
      ...base,
      handoff_decision: 'reference_only',
      handoff_target: activeTarget || referenceTarget(row),
      handoff_elements: row.recommendation === 'reference_only_license'
        ? '参照のみ（本文を複製せず、要件抽出またはlicense確認に限定）'
        : '参照のみ（非推奨sourceは履歴比較に限定）',
      rationale: `reviewの${row.recommendation}かつretire判断をそのまま引き継ぐ。`,
      confidence: 'high',
      needs_manual_review: false,
    };
  }

  if (row.recommendation === 'exclude_fixture') {
    return {
      ...base,
      handoff_decision: 'exclude_fixture',
      handoff_target: 'excluded_fixture',
      handoff_elements: '固有要素なし（監査fixtureとしてのみ保持）',
      rationale: 'reviewのexclude_fixtureかつretire判断をそのまま引き継ぐ。',
      confidence: 'high',
      needs_manual_review: false,
    };
  }

  return {
    ...base,
    handoff_decision: 'manual_review',
    handoff_target: 'manual_review:unmapped-recommendation',
    handoff_elements: '既存recommendationの変換規則がないため要手動確認',
    rationale: `既存recommendation「${row.recommendation}」を機械変換できない。`,
    confidence: 'low',
    needs_manual_review: true,
  };
}

function countBy(entries, field) {
  const counts = new Map();
  for (const entry of entries) {
    const key = String(entry[field]);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Object.fromEntries(
    [...counts.entries()].sort(([leftKey, leftCount], [rightKey, rightCount]) => {
      if (leftCount !== rightCount) {
        return rightCount - leftCount;
      }
      return leftKey.localeCompare(rightKey, 'ja');
    }),
  );
}

function validateOutput(reviewRows, progress, entries) {
  if (reviewRows.length !== EXPECTED_TOTAL_ROWS) {
    throw new Error(`Review row count mismatch: expected ${EXPECTED_TOTAL_ROWS}, got ${reviewRows.length}`);
  }

  const progressEntries = Object.entries(progress.entries ?? {});
  if (progressEntries.length !== EXPECTED_TOTAL_ROWS) {
    throw new Error(`Progress entry count mismatch: expected ${EXPECTED_TOTAL_ROWS}, got ${progressEntries.length}`);
  }

  if (entries.length !== EXPECTED_TOTAL_ROWS) {
    throw new Error(`Output entry count mismatch: expected ${EXPECTED_TOTAL_ROWS}, got ${entries.length}`);
  }

  const selectionPending = entries.filter((entry) => entry.handoff_decision === 'selection_pending');
  const resolvedAliases = entries.filter((entry) => entry.handoff_decision === 'source_alias');
  const targetRows = entries.length - selectionPending.length;
  if (targetRows !== EXPECTED_TARGET_ROWS || selectionPending.length !== 0 || resolvedAliases.length !== EXPECTED_RESOLVED_ALIASES) {
    throw new Error(
      `Target/alias count mismatch: expected ${EXPECTED_TARGET_ROWS}/0/${EXPECTED_RESOLVED_ALIASES}, got ${targetRows}/${selectionPending.length}/${resolvedAliases.length}`,
    );
  }

  const requiredStringFields = [
    'id',
    'recommendation',
    'source_skill',
    'handoff_decision',
    'handoff_target',
    'rationale',
    'confidence',
  ];
  const seenIds = new Set();
  const seenSequences = new Set();

  for (const entry of entries) {
    for (const field of requiredStringFields) {
      if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
        throw new Error(`Blank required field ${field}: ${entry.id || '(missing id)'}`);
      }
      if (/[\r\n]/u.test(entry[field])) {
        throw new Error(`Multiline field ${field}: ${entry.id}`);
      }
    }
    if (typeof entry.handoff_elements !== 'string' || /[\r\n]/u.test(entry.handoff_elements)) {
      throw new Error(`Invalid handoff_elements: ${entry.id}`);
    }
    if (entry.handoff_decision !== 'no_unique_elements' && entry.handoff_elements.trim() === '') {
      throw new Error(`Blank handoff_elements: ${entry.id}`);
    }

    if (!Number.isInteger(entry.sequence) || entry.sequence < 1 || entry.sequence > EXPECTED_TOTAL_ROWS) {
      throw new Error(`Invalid sequence for ${entry.id}: ${entry.sequence}`);
    }
    if (typeof entry.needs_manual_review !== 'boolean') {
      throw new Error(`Invalid needs_manual_review for ${entry.id}`);
    }
    if (!['high', 'medium', 'low'].includes(entry.confidence)) {
      throw new Error(`Invalid confidence for ${entry.id}: ${entry.confidence}`);
    }
    if (seenIds.has(entry.id) || seenSequences.has(entry.sequence)) {
      throw new Error(`Duplicate id or sequence: ${entry.id}/${entry.sequence}`);
    }
    seenIds.add(entry.id);
    seenSequences.add(entry.sequence);

    const targetChecks = {
      merge_into_active: entry.handoff_target.startsWith('skills/'),
      adapt_into_codex: entry.handoff_target.startsWith('skills/codex/'),
      use_installed_plugin: entry.handoff_target.startsWith('plugin:'),
      evaluate_plugin_bundle: entry.handoff_target.startsWith('plugin:') && entry.handoff_target.endsWith(':candidate'),
      defer_plugin_evaluation: entry.handoff_target.startsWith('plugin:') && entry.handoff_target.endsWith(':deferred'),
      no_unique_elements: entry.handoff_target.startsWith('skills/'),
      no_change_needed: entry.handoff_target === 'no_change_needed' || entry.handoff_target.startsWith('skills/') || entry.handoff_target.startsWith('plugin:'),
      reference_only: entry.handoff_target.startsWith('reference_only:') || entry.handoff_target.startsWith('skills/'),
      exclude_fixture: entry.handoff_target === 'excluded_fixture',
      source_alias: entry.handoff_target.startsWith('plugin:'),
      selection_pending: entry.handoff_target === 'selection_pending',
      manual_review: entry.handoff_target.startsWith('manual_review:')
        || entry.handoff_elements.includes('要手動確認'),
    };
    if (!targetChecks[entry.handoff_decision]) {
      throw new Error(`Target/decision mismatch for ${entry.id}: ${entry.handoff_decision}/${entry.handoff_target}`);
    }

    const ambiguity = entry.handoff_decision === 'selection_pending' || entry.handoff_decision === 'manual_review';
    if (entry.needs_manual_review !== ambiguity) {
      throw new Error(`Manual-review flag is not limited to ambiguous target/content: ${entry.id}`);
    }
  }

  const reviewAliasIds = new Set(
    reviewRows
      .filter((row) => row.recommendation === 'compare_duplicate_sources')
      .map((row) => row.id),
  );
  const outputAliasIds = new Set(resolvedAliases.map((entry) => entry.id));
  if (
    reviewAliasIds.size !== EXPECTED_RESOLVED_ALIASES
    || [...reviewAliasIds].some((id) => !outputAliasIds.has(id))
  ) {
    throw new Error('Resolved source-alias ids do not match the compare_duplicate_sources review rows.');
  }
}

const reviewRows = parseCsv(fs.readFileSync(reviewPath, 'utf8'));
const registryRows = parseCsv(fs.readFileSync(pluginRegistryPath, 'utf8'));
const progress = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
const registryBySkill = new Map(
  registryRows.map((row) => [registryKey(row.plugin, row.skill_name), row]),
);

const entries = reviewRows
  .map((row) => {
    const progressEntry = progress.entries?.[row.id];
    if (!progressEntry) {
      throw new Error(`Progress entry is missing for review id: ${row.id}`);
    }
    return makeCandidate(
      row,
      progressEntry,
      registryBySkill.get(registryKey(row.plugin, row.skill_name)),
    );
  })
  .sort((left, right) => left.sequence - right.sequence);

validateOutput(reviewRows, progress, entries);

const selectionPending = entries.filter((entry) => entry.handoff_decision === 'selection_pending').length;
const output = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  source_files: {
    review: forwardSlashes(path.relative(repoRoot, reviewPath)),
    plugin_adoption_registry: forwardSlashes(path.relative(repoRoot, pluginRegistryPath)),
    progress: forwardSlashes(path.relative(repoRoot, progressPath)),
  },
  counts: {
    total_rows: entries.length,
    target_rows: entries.length - selectionPending,
    selection_pending: selectionPending,
    resolved_source_aliases: entries.filter((entry) => entry.handoff_decision === 'source_alias').length,
    manual_review: entries.filter((entry) => entry.needs_manual_review).length,
  },
  summary: {
    by_handoff_decision: countBy(entries, 'handoff_decision'),
    by_confidence: countBy(entries, 'confidence'),
    by_handoff_target: countBy(entries, 'handoff_target'),
  },
  entries,
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ output: forwardSlashes(path.relative(repoRoot, outputPath)), ...output.counts }));
