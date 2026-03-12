#!/usr/bin/env bash

set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tmux_root="$(cd "$script_dir/.." && pwd)"

registry_root="$HOME/.skills"
claude_root="$HOME/.claude/skills"
codex_root="$HOME/.codex/skills"
link_claude=1
link_codex=1
dry_run=0

skills=(
  tmux-router
  tmux-layout
  tmux-pane-control
  tmux-agent-bridge
  tmux-run-ops
  tmux-snapshot
)

usage() {
  cat <<'EOF'
Usage:
  install_shared_tmux_skills.sh [options]

Options:
  --registry-root DIR   Shared registry root. Default: ~/.skills
  --claude-root DIR     Claude skills directory. Default: ~/.claude/skills
  --codex-root DIR      Codex skills directory. Default: ~/.codex/skills
  --skip-claude         Do not link tmux skills into Claude
  --skip-codex          Do not link tmux skills into Codex
  --dry-run             Print actions without modifying anything
  -h, --help            Show help
EOF
}

log() {
  printf '%s\n' "$*"
}

run() {
  if [ "$dry_run" -eq 1 ]; then
    printf '[dry-run] %s\n' "$*"
  else
    eval "$@"
  fi
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --registry-root)
      registry_root="${2:-}"
      shift 2
      ;;
    --claude-root)
      claude_root="${2:-}"
      shift 2
      ;;
    --codex-root)
      codex_root="${2:-}"
      shift 2
      ;;
    --skip-claude)
      link_claude=0
      shift
      ;;
    --skip-codex)
      link_codex=0
      shift
      ;;
    --dry-run)
      dry_run=1
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

registry_root="${registry_root/#\~/$HOME}"
claude_root="${claude_root/#\~/$HOME}"
codex_root="${codex_root/#\~/$HOME}"

run "mkdir -p \"$registry_root\""

if [ "$link_claude" -eq 1 ]; then
  run "mkdir -p \"$claude_root\""
fi

if [ "$link_codex" -eq 1 ]; then
  run "mkdir -p \"$codex_root\""
fi

for skill in "${skills[@]}"; do
  source_dir="$tmux_root/$skill"
  registry_link="$registry_root/$skill"

  if [ ! -d "$source_dir" ]; then
    echo "Missing skill directory: $source_dir" >&2
    exit 1
  fi

  run "ln -sfn \"$source_dir\" \"$registry_link\""
  log "registry: $registry_link -> $source_dir"

  if [ "$link_claude" -eq 1 ]; then
    run "ln -sfn \"$registry_link\" \"$claude_root/$skill\""
    log "claude:   $claude_root/$skill -> $registry_link"
  fi

  if [ "$link_codex" -eq 1 ]; then
    run "ln -sfn \"$registry_link\" \"$codex_root/$skill\""
    log "codex:    $codex_root/$skill -> $registry_link"
  fi
done
