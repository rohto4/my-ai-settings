# Standards And Evidence Baseline

Read this reference when selecting a standard, mapping a finding, or planning accessibility evidence. Recheck the linked primary source before relying on status, wording, or platform behavior that may have changed.

## Verified Primary Baseline

Verified on 2026-07-17:

| Source | Version and publication status | Use |
| --- | --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | W3C Recommendation, 12 December 2024 | Normative web conformance requirements; use the project's required level and scope. |
| [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/) | W3C Recommendation, 6 June 2023 | Normative ARIA roles, states, and properties. Native HTML semantics remain the first choice. |
| [Accessibility Conformance Testing overview](https://www.w3.org/WAI/standards-guidelines/act/) | ACT Rules Format 1.1 is a W3C Recommendation published February 2026; overview updated 5 February 2026 | Defines transparent automated, semi-automated, and manual test-rule formats; not a substitute for WCAG conformance evaluation. |
| [All ACT Rules](https://www.w3.org/WAI/standards-guidelines/act/rules/) | Living W3C list, accessed 2026-07-17 | Informative approved/proposed/deprecated rules and implementation types. A rule or tool pass is not conformance proof. |
| [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/) | Living WAI guidance, accessed 2026-07-17 | Informative interaction patterns and examples; verify against WAI-ARIA and project behavior. |

Only WCAG's technical standard contains WCAG requirements. Understanding documents, techniques, ACT Rules, and APG patterns are supporting or informative unless the project contract adopts them separately.

For native targets, record the exact platform and SDK version, then use current official [Apple Accessibility](https://developer.apple.com/documentation/accessibility) or [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility) documentation with an access date. Do not claim WCAG alone fully defines native-platform conformance.

## Evidence Matrix

| Surface | Minimum evidence | Common limitation |
| --- | --- | --- |
| Automated rules | tool/version, target ref/URL, rule, result, affected node, raw artifact | cannot judge all context, content quality, reading/focus order, usability, or every state |
| Keyboard | exact journey and state, keystrokes, focus order/visibility, operation and escape/recovery | mouse-driven automation can miss keyboard-specific behavior |
| Screen reader | named screen reader/browser/OS versions, announcements, navigation mode, focus and dynamic updates | accessibility-tree inspection alone is not screen-reader evidence |
| Contrast | computed colors, ratio, text size/weight or non-text role, state, criterion, screenshot/calculation | scanners can sample the wrong layer or miss gradients/images/transparency |
| Zoom/reflow | viewport, zoom/text scale, orientation, clipping/overlap/loss of function | responsive screenshots do not prove text resize or keyboard access |
| Touch/gesture | device/emulation, target dimensions/spacing, gestures and alternatives | emulation does not fully reproduce motor or assistive-input use |
| Content/errors | labels, instructions, validation, status, recovery, language and ambiguity review | syntactic correctness does not establish understandable content |

Record “not tested” and the reason whenever evidence is unavailable. Do not convert absence of an automated finding into a pass for manual requirements.
