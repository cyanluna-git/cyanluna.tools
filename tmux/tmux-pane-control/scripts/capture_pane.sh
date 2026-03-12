#!/usr/bin/env bash

set -euo pipefail

target=""
lines="80"

usage() {
  cat <<'EOF'
Usage:
  capture_pane.sh --target SESSION:WINDOW.PANE [--lines 80]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --target)
      target="${2:-}"
      shift 2
      ;;
    --lines)
      lines="${2:-}"
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

if [ -z "$target" ]; then
  usage >&2
  exit 1
fi

if ! printf '%s' "$lines" | grep -Eq '^[0-9]+$'; then
  echo "--lines must be a non-negative integer." >&2
  exit 1
fi

tmux capture-pane -p -t "$target" -S "-$lines"
