---
name: tmux-run-ops
description: Operate local development servers from tmux run panes with explicit start, port check, health check, and stop workflows. Use when the user wants to run localhost services in a controlled tmux window, inspect which process owns a port, stop a dev server safely, or keep logs and server control separated from agent panes.
---

# Tmux Run Ops

Use this skill when the job is to operate local dev servers from a dedicated tmux `runs` window.

## Quick Start

Start a dev server in a chosen pane:

```bash
bash scripts/start_run_command.sh \
  --target 0:2.1 \
  --workdir ~/Dev/unify \
  --command 'pnpm dev'
```

Check who owns a port:

```bash
bash scripts/check_port.sh --port 3000
```

Health-check a localhost endpoint:

```bash
bash scripts/healthcheck.sh --url http://localhost:3000
```

Stop the process listening on a port:

```bash
bash scripts/stop_port.sh --port 3000
```

## Workflow

### 1. Use the `runs` window deliberately

Recommended roles:
- `run.dev`: start the main dev server
- `run.shell`: port checks, curl, git, process inspection
- `run.logs`: app or container logs
- `run.watch`: tests, typecheck, or watchers

### 2. Check before you start

Before launching a server, verify:

```bash
bash scripts/check_port.sh --port 3000
```

If a process is already bound, stop or reuse it instead of starting another copy.

### 3. Start in a known pane

Use `scripts/start_run_command.sh` to start the server in a specific run pane with an explicit working directory.

Do not mix agent prompts and dev-server commands in the same pane.

### 4. Verify the service

After start, use:

```bash
bash scripts/healthcheck.sh --url http://localhost:3000
```

If the app needs more time, retry after a short wait instead of immediately spawning another server.

### 5. Stop cleanly

Prefer:
- `Ctrl+C` if you own the terminal
- `scripts/stop_port.sh --port <port>` if you need a clean external stop

Use `--signal KILL` only when the process ignores `TERM`.

## Rules

- Never start a second dev server on the same port without checking first.
- Keep server start, logs, and diagnostics in separate panes when possible.
- Prefer targeting a specific pane over opening new random panes.
- If the user did not specify a port, detect it from project docs or common defaults, but state the assumption.

## Resources

### `scripts/start_run_command.sh`

Send a command to a target tmux pane with optional working directory and Enter.

### `scripts/check_port.sh`

Show listeners and owning processes for a local port.

### `scripts/healthcheck.sh`

Run an HTTP health check against a localhost URL and print status details.

### `scripts/stop_port.sh`

Send `TERM` or another signal to the process listening on a port.

