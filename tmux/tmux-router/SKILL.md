---
name: tmux-router
description: Route general tmux workspace requests to the right tmux skill for layout setup, pane control, agent bridging, run operations, or snapshots. Use when the user says things like "tmux로 정리해줘", "pane 하나 더 열어줘", "다른 pane에 메시지 보내줘", "runs에서 localhost 띄워줘", or "현재 tmux 상태 저장해줘" without naming the specific tmux sub-skill.
---

# Tmux Router

Purpose: take broad tmux requests and dispatch them to the smallest tmux skill set that fits the job.

## Route Map

Use:
- `$tmux-layout` for session, window, pane, and header layout work
- `$tmux-pane-control` for reading panes, sending input, and capturing recent output
- `$tmux-agent-bridge` for forwarding one pane's output to another pane for critique, verification, or summary
- `$tmux-run-ops` for localhost servers, ports, health checks, and clean stops in `runs`
- `$tmux-snapshot` for recording current tmux state to a file

## Routing Rules

### Layout requests

Route to `$tmux-layout` when the user wants:
- a new pane or window
- a repeated pane structure like 2x2
- pane header or window naming changes
- persistent default workspace layout

Examples:
- "오른쪽 pane 하나 더 열어줘"
- "runs 창도 똑같이 맞춰줘"
- "재시작해도 유지되게 저장해줘"

### Pane interaction requests

Route to `$tmux-pane-control` when the user wants:
- a specific pane listed
- a command sent to a pane
- another pane's recent output read
- a quick targeted pane action

Examples:
- "3번 pane에 메시지 보내줘"
- "저 pane 최근 로그 읽어와"
- "오른쪽 pane에서 이 명령 실행해줘"

### Multi-agent coordination requests

Route to `$tmux-agent-bridge` when the user wants:
- one agent to review another
- output from one pane relayed into another pane
- structured debate, critique, verification, or summary across panes

Examples:
- "이 답변을 다른 pane Claude에게 보내"
- "A가 초안 쓰고 B가 검토하게 해"
- "두 에이전트 토론시켜"

### Localhost and run-pane requests

Route to `$tmux-run-ops` when the user wants:
- a dev server started in `runs`
- a port owner checked
- localhost verified
- a server stopped safely

Examples:
- "runs에서 pnpm dev 띄워줘"
- "3000 포트 누가 쓰는지 봐줘"
- "로컬호스트 응답 확인해줘"

### Snapshot requests

Route to `$tmux-snapshot` when the user wants:
- current tmux state saved
- session inventory exported
- current workspace recorded before changes

Examples:
- "현재 tmux 상태 저장해줘"
- "레이아웃 백업해줘"

## Combination Rules

Use the minimum sequence that fits:
- layout change, then pane action: `$tmux-layout` -> `$tmux-pane-control`
- pane output handed to another pane: `$tmux-pane-control` -> `$tmux-agent-bridge`
- start server and verify port: `$tmux-run-ops`
- snapshot before risky layout change: `$tmux-snapshot` -> `$tmux-layout`

## Safety Rules

- Prefer inspecting current tmux state before acting.
- Do not kill panes, windows, sessions, or processes unless the user asked for it.
- Do not dump large scrollback by default.
- If the user already named a specific tmux sub-skill, use it directly instead of this router.
