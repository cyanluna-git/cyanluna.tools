# macOS Shared Skill Registry Setup

This document explains how to reproduce the current multi-LLM skill setup on another Mac after pulling the repositories.

Goal:

- keep actual skill sources under `~/Dev/skills/...`
- expose a shared flat registry at `~/.skills`
- let each LLM (`~/.claude/skills`, `~/.codex/skills`, and optionally others) point to `~/.skills`
- keep agent-specific private folders such as `~/.codex/skills/.system` untouched

## Target Layout

```text
~/Dev/skills/
  cyanluna.tools/          # repo: report/pptx skills
  cyanluna.skills/         # repo: kanban skills
  local.skills/            # machine-local skills not stored in the repos

~/.skills/
  html-report -> ~/Dev/skills/cyanluna.tools/reports/html-report
  pdf-print -> ~/Dev/skills/cyanluna.tools/reports/pdf-print
  report-pipeline -> ~/Dev/skills/cyanluna.tools/reports/report-pipeline
  pptx-generator -> ~/Dev/skills/cyanluna.tools/pptx/pptx-generator
  pptx-refine -> ~/Dev/skills/cyanluna.tools/pptx/pptx-refine
  kanban -> ~/Dev/skills/cyanluna.skills/kanban
  ...

~/.claude/skills/
  html-report -> ~/.skills/html-report
  report-pipeline -> ~/.skills/report-pipeline
  ...

~/.codex/skills/
  .system/                # keep as-is
  html-report -> ~/.skills/html-report
  report-pipeline -> ~/.skills/report-pipeline
  ...
```

## Repositories To Pull

Clone or pull the repositories first:

```bash
mkdir -p ~/Dev/skills
cd ~/Dev/skills

git clone https://github.com/cyanluna-git/cyanluna.tools.git
git clone https://github.com/cyanluna-git/cyanluna.skills.git
```

If they already exist:

```bash
git -C ~/Dev/skills/cyanluna.tools pull --ff-only
git -C ~/Dev/skills/cyanluna.skills pull --ff-only
```

## Create The Shared Registry

```bash
mkdir -p ~/.skills
mkdir -p ~/.claude/skills
mkdir -p ~/.codex/skills
mkdir -p ~/Dev/skills/local.skills
```

`local.skills` is for machine-local skills that are not part of the shared git repositories.

## Register Shared Skills

Create shared registry links:

```bash
ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-pipeline ~/.skills/report-pipeline
ln -sfn ~/Dev/skills/cyanluna.tools/reports/html-report ~/.skills/html-report
ln -sfn ~/Dev/skills/cyanluna.tools/reports/pdf-print ~/.skills/pdf-print

ln -sfn ~/Dev/skills/cyanluna.tools/pptx/pptx-generator ~/.skills/pptx-generator
ln -sfn ~/Dev/skills/cyanluna.tools/pptx/pptx-refine ~/.skills/pptx-refine

ln -sfn ~/Dev/skills/cyanluna.skills/kanban ~/.skills/kanban
ln -sfn ~/Dev/skills/cyanluna.skills/kanban-batch-run ~/.skills/kanban-batch-run
ln -sfn ~/Dev/skills/cyanluna.skills/kanban-explore ~/.skills/kanban-explore
ln -sfn ~/Dev/skills/cyanluna.skills/kanban-init ~/.skills/kanban-init
ln -sfn ~/Dev/skills/cyanluna.skills/kanban-refine ~/.skills/kanban-refine
ln -sfn ~/Dev/skills/cyanluna.skills/kanban-run ~/.skills/kanban-run

ln -sfn ~/Dev/skills/local.skills/javis-init ~/.skills/javis-init
ln -sfn ~/Dev/skills/local.skills/javis-review-pr ~/.skills/javis-review-pr
ln -sfn ~/Dev/skills/local.skills/javis-story ~/.skills/javis-story
ln -sfn ~/Dev/skills/local.skills/landing-page-guide-v2 ~/.skills/landing-page-guide-v2
ln -sfn ~/Dev/skills/local.skills/web-search ~/.skills/web-search
ln -sfn ~/Dev/skills/local.skills/web-to-markdown ~/.skills/web-to-markdown

ln -sfn ~/.agents/skills/supabase-postgres-best-practices ~/.skills/supabase-postgres-best-practices
ln -sfn ~/.agents/skills/vercel-composition-patterns ~/.skills/vercel-composition-patterns
ln -sfn ~/.agents/skills/vercel-react-best-practices ~/.skills/vercel-react-best-practices
ln -sfn ~/.agents/skills/vercel-react-native-skills ~/.skills/vercel-react-native-skills
ln -sfn ~/.agents/skills/web-design-guidelines ~/.skills/web-design-guidelines
```

Adjust the `local.skills` entries if your local-only skills live somewhere else.

## Register For Claude

Point Claude to the shared registry for the shared skills:

```bash
ln -sfn ~/.skills/report-pipeline ~/.claude/skills/report-pipeline
ln -sfn ~/.skills/html-report ~/.claude/skills/html-report
ln -sfn ~/.skills/pdf-print ~/.claude/skills/pdf-print

ln -sfn ~/.skills/pptx-generator ~/.claude/skills/pptx-generator
ln -sfn ~/.skills/pptx-refine ~/.claude/skills/pptx-refine

ln -sfn ~/.skills/kanban ~/.claude/skills/kanban
ln -sfn ~/.skills/kanban-batch-run ~/.claude/skills/kanban-batch-run
ln -sfn ~/.skills/kanban-explore ~/.claude/skills/kanban-explore
ln -sfn ~/.skills/kanban-init ~/.claude/skills/kanban-init
ln -sfn ~/.skills/kanban-refine ~/.claude/skills/kanban-refine
ln -sfn ~/.skills/kanban-run ~/.claude/skills/kanban-run

ln -sfn ~/.skills/javis-init ~/.claude/skills/javis-init
ln -sfn ~/.skills/javis-review-pr ~/.claude/skills/javis-review-pr
ln -sfn ~/.skills/javis-story ~/.claude/skills/javis-story

ln -sfn ~/.skills/landing-page-guide-v2 ~/.claude/skills/landing-page-guide-v2
ln -sfn ~/.skills/web-search ~/.claude/skills/web-search
ln -sfn ~/.skills/web-to-markdown ~/.claude/skills/web-to-markdown

ln -sfn ~/.skills/supabase-postgres-best-practices ~/.claude/skills/supabase-postgres-best-practices
ln -sfn ~/.skills/vercel-composition-patterns ~/.claude/skills/vercel-composition-patterns
ln -sfn ~/.skills/vercel-react-best-practices ~/.claude/skills/vercel-react-best-practices
ln -sfn ~/.skills/vercel-react-native-skills ~/.claude/skills/vercel-react-native-skills
ln -sfn ~/.skills/web-design-guidelines ~/.claude/skills/web-design-guidelines
```

## Register For Codex

Keep Codex private/system entries intact, especially:

- `~/.codex/skills/.system`
- any Codex-only helper that should not be shared

Then link the shared skills:

```bash
ln -sfn ~/.skills/report-pipeline ~/.codex/skills/report-pipeline
ln -sfn ~/.skills/html-report ~/.codex/skills/html-report
ln -sfn ~/.skills/pdf-print ~/.codex/skills/pdf-print

ln -sfn ~/.skills/pptx-generator ~/.codex/skills/pptx-generator
ln -sfn ~/.skills/pptx-refine ~/.codex/skills/pptx-refine

ln -sfn ~/.skills/kanban ~/.codex/skills/kanban
ln -sfn ~/.skills/kanban-batch-run ~/.codex/skills/kanban-batch-run
ln -sfn ~/.skills/kanban-explore ~/.codex/skills/kanban-explore
ln -sfn ~/.skills/kanban-init ~/.codex/skills/kanban-init
ln -sfn ~/.skills/kanban-refine ~/.codex/skills/kanban-refine
ln -sfn ~/.skills/kanban-run ~/.codex/skills/kanban-run

ln -sfn ~/.skills/javis-init ~/.codex/skills/javis-init
ln -sfn ~/.skills/javis-review-pr ~/.codex/skills/javis-review-pr
ln -sfn ~/.skills/javis-story ~/.codex/skills/javis-story

ln -sfn ~/.skills/landing-page-guide-v2 ~/.codex/skills/landing-page-guide-v2
ln -sfn ~/.skills/web-search ~/.codex/skills/web-search
ln -sfn ~/.skills/web-to-markdown ~/.codex/skills/web-to-markdown

ln -sfn ~/.skills/supabase-postgres-best-practices ~/.codex/skills/supabase-postgres-best-practices
ln -sfn ~/.skills/vercel-composition-patterns ~/.codex/skills/vercel-composition-patterns
ln -sfn ~/.skills/vercel-react-best-practices ~/.codex/skills/vercel-react-best-practices
ln -sfn ~/.skills/vercel-react-native-skills ~/.codex/skills/vercel-react-native-skills
ln -sfn ~/.skills/web-design-guidelines ~/.codex/skills/web-design-guidelines
```

## Optional: Other LLMs

If another tool supports a skills folder, use the same pattern:

```bash
mkdir -p ~/.copilot/skills
ln -sfn ~/.skills/html-report ~/.copilot/skills/html-report
```

The important rule is:

- shared skills point to `~/.skills`
- `~/.skills` points to the real skill source
- agent-private/system folders stay local to that agent

## Verification

Check a few representative links:

```bash
ls -l ~/.skills/report-pipeline
ls -l ~/.claude/skills/report-pipeline
ls -l ~/.codex/skills/report-pipeline
```

You want this shape:

```text
~/.claude/skills/report-pipeline -> ~/.skills/report-pipeline
~/.codex/skills/report-pipeline  -> ~/.skills/report-pipeline
~/.skills/report-pipeline        -> ~/Dev/skills/cyanluna.tools/reports/report-pipeline
```

If the tools were already running, restart them after changing links.

## Current Keep Set

This is the currently curated skill set for this environment:

- `javis-*`
- `kanban*`
- `report-pipeline`
- `html-report`
- `pdf-print`
- `pptx-refine`
- `pptx-generator`
- `landing-page-guide-v2`
- `web-search`
- `web-to-markdown`
- `supabase-postgres-best-practices`
- `vercel-composition-patterns`
- `vercel-react-best-practices`
- `vercel-react-native-skills`
- `web-design-guidelines`

## Notes

- `~/.skills` is a machine-level registry, not a git repo.
- `~/Dev/skills/local.skills` is for personal/local-only skills.
- `cyanluna.tools` and `cyanluna.skills` remain the main git-backed skill sources.
- Do not replace `~/.codex/skills` entirely with `~/.skills`; keep Codex-specific folders such as `.system`.
