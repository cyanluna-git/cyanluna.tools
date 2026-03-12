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
  report-html -> ~/Dev/skills/cyanluna.tools/reports/report-html
  report-pdf-print -> ~/Dev/skills/cyanluna.tools/reports/report-pdf-print
  report-pipeline -> ~/Dev/skills/cyanluna.tools/reports/report-pipeline
  report-pptx -> ~/Dev/skills/cyanluna.tools/reports/report-pptx
  report-pptx-refine -> ~/Dev/skills/cyanluna.tools/reports/report-pptx-refine
  report-pptx-generator -> ~/Dev/skills/cyanluna.tools/reports/report-pptx-generator
  tmux-router -> ~/Dev/skills/cyanluna.tools/tmux/tmux-router
  tmux-layout -> ~/Dev/skills/cyanluna.tools/tmux/tmux-layout
  tmux-pane-control -> ~/Dev/skills/cyanluna.tools/tmux/tmux-pane-control
  tmux-agent-bridge -> ~/Dev/skills/cyanluna.tools/tmux/tmux-agent-bridge
  tmux-run-ops -> ~/Dev/skills/cyanluna.tools/tmux/tmux-run-ops
  tmux-snapshot -> ~/Dev/skills/cyanluna.tools/tmux/tmux-snapshot
  kanban -> ~/Dev/skills/cyanluna.skills/kanban
  ...

~/.claude/skills/
  report-html -> ~/.skills/report-html
  report-pipeline -> ~/.skills/report-pipeline
  ...

~/.codex/skills/
  .system/                # keep as-is
  report-html -> ~/.skills/report-html
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
ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-html ~/.skills/report-html
ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-pdf-print ~/.skills/report-pdf-print

ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-pptx ~/.skills/report-pptx
ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-pptx-refine ~/.skills/report-pptx-refine
ln -sfn ~/Dev/skills/cyanluna.tools/reports/report-pptx-generator ~/.skills/report-pptx-generator

ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-router ~/.skills/tmux-router
ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-layout ~/.skills/tmux-layout
ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-pane-control ~/.skills/tmux-pane-control
ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-agent-bridge ~/.skills/tmux-agent-bridge
ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-run-ops ~/.skills/tmux-run-ops
ln -sfn ~/Dev/skills/cyanluna.tools/tmux/tmux-snapshot ~/.skills/tmux-snapshot

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

For the report skill subset only, you can also use:

```bash
bash ~/Dev/skills/cyanluna.tools/reports/scripts/install_shared_report_skills.sh
```

## Register For Claude

Point Claude to the shared registry for the shared skills:

```bash
ln -sfn ~/.skills/report-pipeline ~/.claude/skills/report-pipeline
ln -sfn ~/.skills/report-html ~/.claude/skills/report-html
ln -sfn ~/.skills/report-pdf-print ~/.claude/skills/report-pdf-print

ln -sfn ~/.skills/report-pptx ~/.claude/skills/report-pptx
ln -sfn ~/.skills/report-pptx-refine ~/.claude/skills/report-pptx-refine
ln -sfn ~/.skills/report-pptx-generator ~/.claude/skills/report-pptx-generator

ln -sfn ~/.skills/tmux-router ~/.claude/skills/tmux-router
ln -sfn ~/.skills/tmux-layout ~/.claude/skills/tmux-layout
ln -sfn ~/.skills/tmux-pane-control ~/.claude/skills/tmux-pane-control
ln -sfn ~/.skills/tmux-agent-bridge ~/.claude/skills/tmux-agent-bridge
ln -sfn ~/.skills/tmux-run-ops ~/.claude/skills/tmux-run-ops
ln -sfn ~/.skills/tmux-snapshot ~/.claude/skills/tmux-snapshot

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
ln -sfn ~/.skills/report-html ~/.codex/skills/report-html
ln -sfn ~/.skills/report-pdf-print ~/.codex/skills/report-pdf-print

ln -sfn ~/.skills/report-pptx ~/.codex/skills/report-pptx
ln -sfn ~/.skills/report-pptx-refine ~/.codex/skills/report-pptx-refine
ln -sfn ~/.skills/report-pptx-generator ~/.codex/skills/report-pptx-generator

ln -sfn ~/.skills/tmux-router ~/.codex/skills/tmux-router
ln -sfn ~/.skills/tmux-layout ~/.codex/skills/tmux-layout
ln -sfn ~/.skills/tmux-pane-control ~/.codex/skills/tmux-pane-control
ln -sfn ~/.skills/tmux-agent-bridge ~/.codex/skills/tmux-agent-bridge
ln -sfn ~/.skills/tmux-run-ops ~/.codex/skills/tmux-run-ops
ln -sfn ~/.skills/tmux-snapshot ~/.codex/skills/tmux-snapshot

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
ln -sfn ~/.skills/report-html ~/.copilot/skills/report-html
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
- `report-html`
- `report-pdf-print`
- `report-pptx`
- `report-pptx-refine`
- `report-pptx-generator`
- `tmux-router`
- `tmux-layout`
- `tmux-pane-control`
- `tmux-agent-bridge`
- `tmux-run-ops`
- `tmux-snapshot`
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
