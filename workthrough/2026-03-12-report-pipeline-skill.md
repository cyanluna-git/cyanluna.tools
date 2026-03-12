# 2026-03-12 Report Pipeline Skill

## Goal

Add a top-level orchestration skill for report generation so users can request an end-to-end report workflow without manually choosing between the lower-level HTML and PDF skills every time.

## Added Skill

- `reports/report-pipeline`

Purpose:

- choose between HTML-only, PDF-only, and full markdown-to-HTML-to-PDF flows
- coordinate `html-report` and `pdf-print`
- define the wrapper/config pattern for repository integrations

## Files

- `/home/edwards/Dev/skills/cyanluna.tools/reports/report-pipeline/SKILL.md`
- `/home/edwards/Dev/skills/cyanluna.tools/reports/report-pipeline/agents/openai.yaml`
- `/home/edwards/Dev/skills/cyanluna.tools/README.md`

## Codex Registration

Created symlink:

- `/home/edwards/.codex/skills/report-pipeline -> /home/edwards/Dev/skills/cyanluna.tools/reports/report-pipeline`

## Validation

```bash
python3 /home/edwards/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  /home/edwards/Dev/skills/cyanluna.tools/reports/report-pipeline
```

Result:

```text
Skill is valid!
```

## Result

The report skill stack now has three layers:

- `report-pipeline` for orchestration
- `html-report` for branded HTML generation
- `pdf-print` for final PDF output

This keeps the low-level responsibilities clean while making the common end-to-end workflow easier to trigger and reuse.
