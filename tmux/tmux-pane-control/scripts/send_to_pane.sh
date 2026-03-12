#!/usr/bin/env bash

set -euo pipefail

target=""
text=""
press_enter=0

usage() {
  cat <<'EOF'
Usage:
  send_to_pane.sh --target SESSION:WINDOW.PANE --text 'message' [--enter]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      target="${2:-}"
      shift 2
      ;;
    --text)
      text="${2:-}"
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

if [ -z "$target" ] || [ -z "$text" ]; then
  usage >&2
  exit 1
fi

tmux send-keys -t "$target" "$text"

if [ "$press_enter" -eq 1 ]; then
  tmux send-keys -t "$target" Enter
fi
