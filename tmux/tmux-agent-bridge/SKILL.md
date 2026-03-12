---
name: tmux-agent-bridge
description: Relay prompts and recent terminal context between tmux panes so one agent can critique, verify, extend, or summarize another agent's output. Use when coordinating multiple agent panes, running structured debates, handing work from one pane to another, or asking one pane to review another pane's result.
---

# Tmux Agent Bridge

Use this skill when the job is to coordinate multiple agents running in different tmux panes.

## Quick Start

Relay the last 80 lines from one pane to another with a review prompt:

```bash
bash scripts/bridge_message.sh \
  --source 0:1.2 \
  --target 0:1.3 \
  --instruction '아래 내용을 검토하고 핵심 문제만 짧게 답해줘.' \
  --lines 80 \
  --enter
```

Ask one pane to summarize another pane's recent output:

```bash
bash scripts/bridge_message.sh \
  --source 0:1.3 \
  --target 0:1.4 \
  --instruction '최근 작업 완료 내용을 3줄 이내로 요약해줘.' \
  --lines 60 \
  --enter
```

## Workflow

### 1. Resolve source and target panes

Start by checking current pane state:

```bash
bash ../tmux-pane-control/scripts/list_panes.sh
```

Use pane path and current command to confirm the right source and target.

### 2. Keep the context bounded

Capture only recent output.

Recommended defaults:
- 40 lines for a short follow-up
- 80 lines for agent review or critique
- 120 lines when the source pane contains a long answer or log chunk

### 3. Send a structured handoff

Use `scripts/bridge_message.sh` to send:
- source pane id
- source path and command
- recent output block
- explicit instruction for the target pane

This avoids vague prompts like "review that" or "respond to the other agent."

### 4. Prefer role-based debate

Use fixed roles instead of free-form back-and-forth:
- drafter
- critic
- verifier
- summarizer

Better pattern:
- Pane A writes the draft
- Pane B critiques
- Pane C verifies facts or code
- Pane D writes the final answer

## Rules

- Do not auto-loop panes into each other.
- Do not forward full scrollback unless the user explicitly asks.
- Keep each bridge message scoped to one instruction.
- Re-check pane indices after layout changes because pane numbers can shift.
- If a pane is running a destructive or interactive command, confirm before injecting input.

## Resources

### `scripts/bridge_message.sh`

Captures recent output from a source pane and pastes a structured handoff into a target pane.

