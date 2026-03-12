# HTML Report PDF Skill

## Overview
Created a reusable Codex skill for generating branded HTML reports and printable PDFs from markdown source documents.

The skill lives under `/home/edwards/Dev/skills` and is exposed to Codex through a symlink in `~/.codex/skills`, matching the workflow requested by the user.

## Files Added
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/SKILL.md`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/agents/openai.yaml`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/scripts/render_report.cjs`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/references/source-format.md`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/references/branding-notes.md`

## Implementation Notes
- Used `skill-creator`'s `init_skill.py` to scaffold the skill.
- Wrote a focused `SKILL.md` describing when to trigger the skill and how to use the bundled renderer.
- Bundled a reusable Node renderer script that:
  - parses markdown status/alignment documents
  - generates styled HTML
  - prints to PDF with Playwright
  - accepts branding arguments like `--logo`, `--department`, `--brand`, and `--footer`
- Raised abstraction by removing project-specific defaults from the shared renderer:
  - no built-in Edwards or OQC branding
  - no hardcoded repository Playwright path
  - branding/theme/text now support config-driven injection
- Added reference files for markdown normalization and branding adaptation.
- Added config-oriented references:
  - `references/config-format.md`
  - `references/report-config.example.json`
- Created a symlink:
  - `/home/edwards/.codex/skills/html-report-pdf -> /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf`
- Updated the skill guidance to explicitly recommend the wrapper pattern:
  - project repositories should keep only thin forwarding scripts
  - the skill renderer remains the single source of truth
- Optimized the prompt layer after review:
  - broadened frontmatter trigger coverage to include wrapper/config setup tasks
  - removed OQC- and PCAS-specific examples from SKILL.md and config docs
  - replaced absolute local path examples with reusable relative examples
  - updated `agents/openai.yaml` to better describe the renderer's reusable role

## Validation

### Skill validation
```bash
python3 /home/edwards/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf
```

Result:
```text
Skill is valid!
```

### Smoke test
```bash
node /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/scripts/render_report.cjs \
  /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.md \
  --output-base /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-en \
  --logo /home/edwards/Dev/edwards.oqc.infra/apps/server-frontend/public/edwards-logo.png \
  --department "PCAS IS Software Team"
```

Generated:
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-en.html`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-en.pdf`

PDF verification:
```text
/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-en.pdf: PDF document, version 1.4, 8 page(s)
```

### Wrapper verification
```bash
node /home/edwards/Dev/edwards.oqc.infra/scripts/reporting/render-status-report.cjs \
  /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.md
```

Result:
```text
HTML: /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.html
PDF: /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.pdf
```

### Config-driven renderer verification
```bash
node /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/scripts/render_report.cjs \
  /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.md \
  --config /home/edwards/Dev/edwards.oqc.infra/scripts/reporting/render-status-report.config.json \
  --output-base /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-config
```

Result:
```text
HTML: /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-config.html
PDF: /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf/example/oqc-alignment-config.pdf
```
