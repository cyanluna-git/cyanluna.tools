# 2026-03-12 Report Skill Split

## Goal

Split the old report skill into two reusable skills with clearer responsibilities:

- `reports/html-report` for markdown to branded HTML
- `reports/pdf-print` for HTML or URL to printable PDF

## Changes

- Moved the old report skill from `reports/html-report-pdf` to `reports/html-report`
- Renamed the renderer entrypoint to `scripts/render_html_report.cjs`
- Removed PDF generation responsibility from the HTML renderer
- Added `reports/pdf-print` with `scripts/print_to_pdf.cjs`
- Updated the OQC wrapper to call HTML generation first and PDF printing second
- Updated root repository documentation to advertise the split skills
- Replaced the old Codex skill symlink with:
  - `~/.codex/skills/html-report`
  - `~/.codex/skills/pdf-print`

## Validation

Skill validation:

```bash
python3 /home/edwards/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /home/edwards/Dev/skills/cyanluna.tools/reports/html-report

python3 /home/edwards/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /home/edwards/Dev/skills/cyanluna.tools/reports/pdf-print
```

Both returned `Skill is valid!`

End-to-end OQC rendering:

```bash
node /home/edwards/Dev/edwards.oqc.infra/scripts/reporting/render-status-report.cjs \
  /home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.md
```

Observed outputs:

- HTML: `/home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.html`
- PDF: `/home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.pdf`

PDF verification:

```text
/home/edwards/Dev/edwards.oqc.infra/docs/status/2026-03-12-pm-alignment-confluence-en.pdf: PDF document, version 1.4, 8 page(s)
```

## Result

The report pipeline is now easier to reuse and maintain:

- HTML layout and branding live in one skill
- PDF printing is reusable for any HTML document
- Repository wrappers can stay thin and compose the two skills
