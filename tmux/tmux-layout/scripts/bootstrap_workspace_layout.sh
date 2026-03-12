#!/usr/bin/env bash

set -euo pipefail

session_name=""
target_session=""
root_dir="$HOME"
pane_labels="path"
agents_window="agents"
runs_window="runs"

usage() {
  cat <<'EOF'
Usage:
  bootstrap_workspace_layout.sh --session NAME [--root DIR] [--pane-labels path|fixed]
  bootstrap_workspace_layout.sh --target-session NAME [--root DIR] [--pane-labels path|fixed]

Examples:
  bootstrap_workspace_layout.sh --session work --root ~/Dev
  bootstrap_workspace_layout.sh --target-session 0 --root ~/Dev --pane-labels path
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --session)
      session_name="${2:-}"
      shift 2
      ;;
    --target-session)
      target_session="${2:-}"
      shift 2
      ;;
    --root)
      root_dir="${2:-}"
      shift 2
      ;;
    --pane-labels)
      pane_labels="${2:-}"
      shift 2
      ;;
    --agents-window)
      agents_window="${2:-}"
      shift 2
      ;;
    --runs-window)
      runs_window="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ -n "$session_name" ] && [ -n "$target_session" ]; then
  echo "Use either --session or --target-session, not both." >&2
  exit 1
fi

if [ -z "$session_name" ] && [ -z "$target_session" ]; then
  echo "A target session is required." >&2
  usage >&2
  exit 1
fi

if [ "$pane_labels" != "path" ] && [ "$pane_labels" != "fixed" ]; then
  echo "--pane-labels must be 'path' or 'fixed'." >&2
  exit 1
fi

root_dir="${root_dir/#\~/$HOME}"

if [ -n "$session_name" ]; then
  if ! tmux has-session -t "$session_name" 2>/dev/null; then
    tmux new-session -d -s "$session_name" -c "$root_dir"
  fi
  target_session="$session_name"
fi

window_exists() {
  tmux list-windows -t "$target_session" -F '#{window_name}' | grep -Fxq "$1"
}

window_target_by_name() {
  tmux list-windows -t "$target_session" -F '#{window_name} #{window_index}' | awk -v name="$1" '$1 == name { print $2 }'
}

pane_count() {
  tmux list-panes -t "$1" 2>/dev/null | wc -l | tr -d ' '
}

ensure_four_panes() {
  local window_target="$1"
  local count

  count="$(pane_count "$window_target")"

  if [ "$count" -eq 1 ]; then
    tmux split-window -h -t "${window_target}.1" -c "$root_dir"
    tmux split-window -v -t "${window_target}.1" -c "$root_dir"
    tmux split-window -v -t "${window_target}.2" -c "$root_dir"
  elif [ "$count" -eq 2 ]; then
    tmux split-window -v -t "${window_target}.1" -c "$root_dir"
    tmux split-window -v -t "${window_target}.2" -c "$root_dir"
  elif [ "$count" -eq 3 ]; then
    tmux split-window -v -t "${window_target}.2" -c "$root_dir"
  fi

  tmux select-layout -t "$window_target" tiled >/dev/null
}

ensure_window() {
  local window_name="$1"

  if ! window_exists "$window_name"; then
    tmux new-window -d -t "${target_session}:" -n "$window_name" -c "$root_dir"
  fi

  printf '%s:%s' "$target_session" "$(window_target_by_name "$window_name")"
}

apply_pane_labels() {
  local window_target="$1"
  local prefix="$2"

  if [ "$pane_labels" = "fixed" ]; then
    tmux select-pane -t "${window_target}.1" -T "${prefix}.1"
    tmux select-pane -t "${window_target}.2" -T "${prefix}.2"
    tmux select-pane -t "${window_target}.3" -T "${prefix}.3"
    tmux select-pane -t "${window_target}.4" -T "${prefix}.4"
  fi
}

tmux setw -t "$target_session" automatic-rename off
tmux set -t "$target_session" pane-border-status top

if [ "$pane_labels" = "path" ]; then
  tmux set -t "$target_session" pane-border-format ' #P: #{b:pane_current_path} [#{pane_current_command}] '
else
  tmux set -t "$target_session" pane-border-format ' #P: #T [#{pane_current_command}] '
fi

agents_target="$(ensure_window "$agents_window")"
ensure_four_panes "$agents_target"
apply_pane_labels "$agents_target" "agent"

runs_target="$(ensure_window "$runs_window")"
ensure_four_panes "$runs_target"
apply_pane_labels "$runs_target" "run"

tmux select-window -t "$agents_target"
tmux list-windows -t "$target_session" -F '#{window_index}:#{window_name}'
