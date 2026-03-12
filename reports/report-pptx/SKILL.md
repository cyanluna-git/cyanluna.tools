---
name: report-pptx
description: Route report and presentation requests to the right PPTX workflow for scenario refinement or editable slide generation. Use when the user wants a report turned into slides, asks for a PPTX from existing material, or refers generally to "report-pptx" without specifying whether they need scenario refinement or final PPTX generation.
---

# Report PPTX

Use this skill when the request is broadly about turning reports or source documents into `.pptx` slides.

## Route Map

Use:
- `$report-pptx-refine` when the user has source material and needs a slide scenario first
- `$report-pptx-generator` when the user already has a scenario markdown and wants the final editable `.pptx`

## Routing Rules

### Refine-first requests

Route to `$report-pptx-refine` when the user provides:
- reports
- meeting notes
- outlines
- specs
- mixed folders of source material

Examples:
- "이 보고서로 발표 자료 만들어줘"
- "이 문서들을 PPT 시나리오로 정리해줘"
- "자료 모아놨으니 슬라이드 구조부터 잡아줘"

### Direct generation requests

Route to `$report-pptx-generator` when the user provides:
- `scenario.md`
- a mostly complete slide scenario
- a request to render an editable `.pptx` immediately

Examples:
- "scenario.md로 PPTX 만들어줘"
- "이 슬라이드 시나리오를 발표자료로 렌더해줘"

## Combination Rule

For end-to-end work:
1. Use `$report-pptx-refine`
2. Review or adjust the scenario
3. Use `$report-pptx-generator`

## Safety Rule

If the user mentions a template, screenshots, or branding, pass them through the chosen lower-level skill instead of handling those details here.
