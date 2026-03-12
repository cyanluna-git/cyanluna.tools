# cyanluna.tools Repository Restructure

## Overview
Reorganized the local skills repository from a PPTX-only layout into a shared multi-domain tools repository named `cyanluna.tools`.

The new structure groups skills by domain inside one repository while preserving flat symlink exposure through `~/.codex/skills`.

## Changes Made

### 1. Renamed the local repository directory
- Old path: `/home/edwards/Dev/skills/cyanluna.pptx.skills`
- New path: `/home/edwards/Dev/skills/cyanluna.tools`

### 2. Reorganized skills by domain
- PPTX skills moved under:
  - `/home/edwards/Dev/skills/cyanluna.tools/pptx/pptx-generator`
  - `/home/edwards/Dev/skills/cyanluna.tools/pptx/pptx-refine`
- Report skill moved under:
  - `/home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf`

### 3. Updated internal references
- Updated PPTX skill path examples to the new repository layout.
- Updated the repository `README.md` to describe the repo as a multi-tool skill collection.
- Updated installation examples to use `~/.codex/skills` symlinks and the new folder structure.
- Updated OQC’s shared report wrapper to use the new report skill path.

### 4. Reconnected symlinks
- `/home/edwards/.codex/skills/html-report-pdf -> /home/edwards/Dev/skills/cyanluna.tools/reports/html-report-pdf`
- `/home/edwards/.codex/skills/pptx-generator -> /home/edwards/Dev/skills/cyanluna.tools/pptx/pptx-generator`
- `/home/edwards/.codex/skills/pptx-refine -> /home/edwards/Dev/skills/cyanluna.tools/pptx/pptx-refine`

### 5. Renamed the GitHub repository and updated remotes
- Renamed the GitHub repository with `gh`:
  - `cyanluna-git/cyanluna.pptx.skills -> cyanluna-git/cyanluna.tools`
- `origin` now points to:
  - `https://github.com/cyanluna-git/cyanluna.tools.git`
- Verified the new remote with `git ls-remote origin HEAD`

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

## Note
The old repository URL now redirects to the new one on GitHub, but the local repository keeps only a single `origin` remote to avoid confusion.
