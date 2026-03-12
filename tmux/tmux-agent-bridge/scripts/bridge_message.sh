#!/usr/bin/env bash

set -euo pipefail

source_pane=""
target_pane=""
instruction=""
lines="80"
press_enter=0
buffer_name="tmux-agent-bridge.$$"

usage() {
  cat <<'EOF'
Usage:
  bridge_message.sh --source SESSION:WINDOW.PANE --target SESSION:WINDOW.PANE \
    --instruction 'review this' [--lines 80] [--enter]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --source)
      source_pane="${2:-}"
      shift 2
      ;;
    --target)
      target_pane="${2:-}"
      shift 2
      ;;
    --instruction)
      instruction="${2:-}"
      shift 2
      ;;
    --lines)
      lines="${2:-}"
      shift 2
      ;;
    --enter)
      press_enter=1
      shift
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

if [ -z "$source_pane" ] || [ -z "$target_pane" ] || [ -z "$instruction" ]; then
  usage >&2
  exit 1
fi

if ! printf '%s' "$lines" | grep -Eq '^[0-9]+$'; then
  echo "--lines must be a non-negative integer." >&2
  exit 1
fi

source_path="$(tmux display-message -p -t "$source_pane" '#{pane_current_path}')"
source_cmd="$(tmux display-message -p -t "$source_pane" '#{pane_current_command}')"
captured_output="$(tmux capture-pane -p -t "$source_pane" -S "-$lines")"

payload="$(cat <<EOF
[tmux-agent-bridge]
Source: $source_pane
Path: $source_path
Command: $source_cmd

Recent output:
$captured_output

Instruction:
$instruction

EOF
)"

printf '%s' "$payload" | tmux load-buffer -b "$buffer_name" -
tmux paste-buffer -b "$buffer_name" -t "$target_pane"
tmux delete-buffer -b "$buffer_name"

if [ "$press_enter" -eq 1 ]; then
  tmux send-keys -t "$target_pane" Enter
fi
