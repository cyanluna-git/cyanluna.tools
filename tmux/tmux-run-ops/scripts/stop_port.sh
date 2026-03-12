#!/usr/bin/env bash

set -euo pipefail

port=""
signal_name="TERM"

usage() {
  cat <<'EOF'
Usage:
  stop_port.sh --port 3000 [--signal TERM]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --port)
      port="${2:-}"
      shift 2
      ;;
    --signal)
      signal_name="${2:-}"
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

if ! command -v lsof >/dev/null 2>&1; then
  echo "lsof is required for stop_port.sh." >&2
  exit 1
fi

pids="$(lsof -t -nP -iTCP:"$port" -sTCP:LISTEN | sort -u)"

if [ -z "$pids" ]; then
  echo "No listening process found on port $port."
  exit 0
fi

printf '%s\n' "$pids" | xargs kill "-$signal_name"
printf 'Sent %s to port %s listener(s): %s\n' "$signal_name" "$port" "$(printf '%s' "$pids" | tr '\n' ' ')"
