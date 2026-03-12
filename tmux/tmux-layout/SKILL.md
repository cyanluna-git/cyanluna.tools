---
name: tmux-layout
description: Create or normalize tmux session layouts with named windows, predictable pane splits, current-path pane headers, and reusable workspace defaults. Use when setting up agent panes, run/log panes, persistent tmux workspaces, or mirroring a standard multi-window layout across machines.
---

# Tmux Layout

Use this skill when the job is to create or standardize a tmux workspace layout.

## Quick Start

Create the standard `agents` + `runs` layout in an existing session:

```bash
bash scripts/bootstrap_workspace_layout.sh --target-session 0 --root ~/Dev
```

Create a new session and apply the same layout:

```bash
bash scripts/bootstrap_workspace_layout.sh --session work --root ~/Dev
```

Use pane headers based on current path:

```bash
bash scripts/bootstrap_workspace_layout.sh --target-session 0 --root ~/Dev --pane-labels path
```

## Workflow

### 1. Inspect current tmux state

Always start with:

```bash
tmux list-sessions
tmux list-windows -a
tmux list-panes -a -F '#{session_name}:#{window_index}.#{pane_index} path=#{pane_current_path}'
```

### 2. Pick the minimum layout change

Prefer updating an existing session over creating extra sessions.

Use `scripts/bootstrap_workspace_layout.sh` when the user wants:
- a standard `agents` and `runs` split
- repeated 2x2 pane layouts
- pane-border headers that show the current folder
- consistent window names across machines

### 3. Apply headers and layout

The script sets:
- `pane-border-status top`
- `pane-border-format` using either pane path or fixed titles
- `automatic-rename off`

It then ensures:
- window `agents` with 4 panes
- window `runs` with 4 panes

### 4. Verify

After changing layout, confirm:

```bash
tmux list-windows -t <session>
tmux list-panes -t <session>:1 -F '#{pane_index}:#{pane_current_path}'
tmux list-panes -t <session>:2 -F '#{pane_index}:#{pane_current_path}'
```

## Rules

- Do not kill panes, windows, or sessions unless the user asked for it.
- Prefer `--target-session` when a session already exists.
- Keep the root directory explicit with `--root`.
- Prefer `--pane-labels path` unless the user specifically wants fixed titles.

## Resources

### `scripts/bootstrap_workspace_layout.sh`

Creates or normalizes a standard two-window tmux layout.

