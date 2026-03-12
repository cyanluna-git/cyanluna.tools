---
name: tmux-snapshot
description: Capture the current tmux sessions, windows, panes, commands, and paths into a reusable snapshot file for inspection or manual recovery. Use when the user wants to inventory the current tmux state, save a workspace snapshot, compare layouts, or record enough detail to reconstruct a tmux session later.
---

# Tmux Snapshot

Use this skill when the job is to record the current tmux state in a compact, reusable form.

## Quick Start

Write a snapshot to the default timestamped file:

```bash
bash scripts/snapshot_tmux_state.sh
```

Write to a specific file:

```bash
bash scripts/snapshot_tmux_state.sh --output ~/tmux-snapshots/workspace-01.txt
```

Capture a single session only:

```bash
bash scripts/snapshot_tmux_state.sh --session 0 --output ~/tmux-snapshots/session-0.txt
```

## Workflow

### 1. Decide the scope

Use:
- all sessions when the user wants a full environment snapshot
- `--session` when only one workspace matters

### 2. Record state before risky changes

Take a snapshot before:
- layout rewrites
- pane cleanup
- server restarts
- agent debate experiments

### 3. Include only practical recovery detail

The snapshot includes:
- sessions and attached state
- windows and names
- panes with indices, titles, paths, and current commands
- pane geometry

This is enough to inspect or manually rebuild the workspace without dumping huge scrollback by default.

### 4. Optionally capture recent pane output

If the user explicitly wants terminal context as well, use:

```bash
bash ../tmux-pane-control/scripts/capture_pane.sh --target 0:1.2 --lines 80
```

Keep snapshot inventory and pane output capture separate unless the user asks for both.

## Rules

- Prefer timestamped snapshot files for repeated use.
- Do not capture full pane scrollback unless explicitly requested.
- Keep the snapshot text-readable so it works across machines and editors.

## Resources

### `scripts/snapshot_tmux_state.sh`

Writes a plain-text snapshot of current tmux sessions, windows, and panes.

