#!/usr/bin/env bash

set -euo pipefail

session_name=""
output_path=""

usage() {
  cat <<'EOF'
Usage:
  snapshot_tmux_state.sh [--session NAME] [--output /path/to/file.txt]
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --session)
      session_name="${2:-}"
      shift 2
      ;;
    --output)
      output_path="${2:-}"
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

timestamp="$(date '+%Y%m%d-%H%M%S')"

if [ -z "$output_path" ]; then
  output_path="$HOME/tmux-snapshot-$timestamp.txt"
fi

output_path="${output_path/#\~/$HOME}"
mkdir -p "$(dirname "$output_path")"

{
  printf 'tmux snapshot\n'
  printf 'generated_at=%s\n' "$(date -Is)"
  printf '\n'

  printf '[sessions]\n'
  if [ -n "$session_name" ]; then
    tmux list-sessions -F 'session=#{session_name} windows=#{session_windows} attached=#{session_attached} created=#{t:session_created}' |
      grep -E "^session=${session_name} "
  else
    tmux list-sessions -F 'session=#{session_name} windows=#{session_windows} attached=#{session_attached} created=#{t:session_created}'
  fi
  printf '\n'

  printf '[windows]\n'
  if [ -n "$session_name" ]; then
    tmux list-windows -t "$session_name" \
      -F '#{session_name}:#{window_index} name=#{window_name} active=#{window_active} panes=#{window_panes} layout=#{window_layout}'
  else
    tmux list-windows -a \
      -F '#{session_name}:#{window_index} name=#{window_name} active=#{window_active} panes=#{window_panes} layout=#{window_layout}'
  fi
  printf '\n'

  printf '[panes]\n'
  if [ -n "$session_name" ]; then
    tmux list-panes -t "$session_name" -a \
      -F '#{session_name}:#{window_index}.#{pane_index} active=#{pane_active} title=#{pane_title} cmd=#{pane_current_command} path=#{pane_current_path} left=#{pane_left} top=#{pane_top} width=#{pane_width} height=#{pane_height}'
  else
    tmux list-panes -a \
      -F '#{session_name}:#{window_index}.#{pane_index} active=#{pane_active} title=#{pane_title} cmd=#{pane_current_command} path=#{pane_current_path} left=#{pane_left} top=#{pane_top} width=#{pane_width} height=#{pane_height}'
  fi
} > "$output_path"

printf '%s\n' "$output_path"
