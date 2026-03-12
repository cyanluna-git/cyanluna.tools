#!/usr/bin/env bash

set -euo pipefail

target=""
workdir=""
command_text=""
require_bash=0

usage() {
  cat <<'EOF'
Usage:
  start_run_command.sh --target SESSION:WINDOW.PANE --command 'pnpm dev' [--workdir DIR] [--require-bash]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      target="${2:-}"
      shift 2
      ;;
    --workdir)
      workdir="${2:-}"
      shift 2
      ;;
    --command)
      command_text="${2:-}"
      shift 2
      ;;
    --require-bash)
      require_bash=1
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

if [ -z "$target" ] || [ -z "$command_text" ]; then
  usage >&2
  exit 1
fi

pane_command="$(tmux display-message -p -t "$target" '#{pane_current_command}')"

if [ "$require_bash" -eq 1 ] && [ "$pane_command" != "bash" ] && [ "$pane_command" != "zsh" ] && [ "$pane_command" != "fish" ]; then
  echo "Target pane is running '$pane_command', not an interactive shell." >&2
  exit 1
fi

if [ -n "$workdir" ]; then
  workdir="${workdir/#\~/$HOME}"
  tmux send-keys -t "$target" "cd $workdir" Enter
fi

tmux send-keys -t "$target" "$command_text" Enter

