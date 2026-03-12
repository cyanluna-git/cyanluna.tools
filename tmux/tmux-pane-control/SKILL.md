---
name: tmux-pane-control
description: Inspect tmux panes, send input to a specific pane, capture recent output, and target another agent or log stream safely. Use when the user wants to message a pane, read another pane's terminal output, tail scrollback, or run a command in a chosen tmux pane.
---

# Tmux Pane Control

Use this skill when the job is to interact with an existing tmux pane.

## Quick Start

List panes with path and current command:

```bash
bash scripts/list_panes.sh
```

Send text to a pane and press Enter:

```bash
bash scripts/send_to_pane.sh --target 0:1.3 --text 'status 알려줘' --enter
```

Capture the last 80 lines from a pane:

```bash
bash scripts/capture_pane.sh --target 0:1.3 --lines 80
```

## Workflow

### 1. Resolve the target pane

Always inspect first:

```bash
bash scripts/list_panes.sh
```

Do not guess pane targets when more than one plausible pane exists.

### 2. Check current pane state

Before sending input, inspect:
- `pane_current_command`
- `pane_current_path`
- whether the pane is active or already busy

### 3. Send input deliberately

Use `scripts/send_to_pane.sh` for:
- asking another agent a question
- starting a process in a selected pane
- sending a short follow-up prompt

Use `--enter` only when you intend to execute immediately.

### 4. Capture only recent output

Use `scripts/capture_pane.sh` with a bounded line count.

Prefer:
- 40 lines for short checks
- 80 to 120 lines for agent replies or logs

## Rules

- Never send destructive commands unless the user explicitly asked for them.
- Prefer path or title hints to identify the correct pane.
- Capture recent output instead of dumping a full scrollback.
- Verify the target pane after layout changes because pane indices can shift.

## Resources

### `scripts/list_panes.sh`

Lists panes with session, window, pane index, title, current command, and path.

### `scripts/send_to_pane.sh`

Sends text to a target pane, with optional Enter.

### `scripts/capture_pane.sh`

Captures recent pane output with a line limit.

