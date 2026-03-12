#!/usr/bin/env bash

set -euo pipefail

port=""

usage() {
  cat <<'EOF'
Usage:
  check_port.sh --port 3000
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --port)
      port="${2:-}"
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

if ! printf '%s' "$port" | grep -Eq '^[0-9]+$'; then
  usage >&2
  exit 1
fi

if command -v lsof >/dev/null 2>&1; then
  lsof -nP -iTCP:"$port" -sTCP:LISTEN || true
else
  ss -ltnp "( sport = :$port )" || true
fi

