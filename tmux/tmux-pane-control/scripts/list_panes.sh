#!/usr/bin/env bash

set -euo pipefail

target="${1:-}"

if [ -n "$target" ]; then
  tmux list-panes -t "$target" -F '#{session_name}:#{window_index}.#{pane_index} active=#{pane_active} title=#{pane_title} cmd=#{pane_current_command} path=#{pane_current_path}'
else
  tmux list-panes -a -F '#{session_name}:#{window_index}.#{pane_index} active=#{pane_active} title=#{pane_title} cmd=#{pane_current_command} path=#{pane_current_path}'
fi
