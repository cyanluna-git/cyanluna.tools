#!/usr/bin/env bash

set -euo pipefail

url=""
method="GET"
timeout_seconds="5"

usage() {
  cat <<'EOF'
Usage:
  healthcheck.sh --url http://localhost:3000 [--method GET] [--timeout 5]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --url)
      url="${2:-}"
      shift 2
      ;;
    --method)
      method="${2:-}"
      shift 2
      ;;
    --timeout)
      timeout_seconds="${2:-}"
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

if [ -z "$url" ]; then
  usage >&2
  exit 1
fi

curl --silent --show-error \
  --output /dev/null \
  --write-out 'status=%{http_code} connect=%{time_connect}s starttransfer=%{time_starttransfer}s total=%{time_total}s\n' \
  --request "$method" \
  --max-time "$timeout_seconds" \
  "$url"

