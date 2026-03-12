---
name: report-pptx-refine
description: Refine various documents (reports, specs, meeting notes, outlines, etc.) into a structured slide scenario markdown that report-pptx-generator can consume. Explores user documents, interviews for gaps, and outputs a ready-to-use scenario.md.
---

# PPTX Refine — Document to Scenario Converter

Takes messy, unstructured documents and refines them into a clean `scenario.md` file for the `report-pptx-generator` skill.

## When to Use

- "이 문서로 PPT 시나리오 만들어줘"
- "보고서를 프레젠테이션으로 정리해줘"
- "이 자료들 PPT 시나리오로 변환해줘"
- User provides documents/files and wants a presentation scenario

## Accepted Input Types

| Type | Examples |
|------|----------|
| Reports | .md, .txt summaries, technical reports |
| Specs | PRD, feature specs, architecture docs |
| Meeting notes | Minutes, action items, decision logs |
| Outlines | Bullet-point drafts, brainstorm notes |
| Data | Tables, CSV summaries, metrics |
| Existing slides | .pptx to restructure (read via python-pptx) |
| Screenshots | .png/.jpg — will be catalogued for slide references |
| Mixed | Folder with multiple files of varying types |

## Procedure

```
Step 1  COLLECT — Identify all input documents
Step 2  EXPLORE — Deep-read and extract key information
Step 3  STRUCTURE — Propose slide outline
Step 4  INTERVIEW — Fill gaps with user
Step 5  GENERATE — Output final scenario.md
Step 6  HANDOFF — Guide user to report-pptx-generator
```

### Step 1: COLLECT

Identify what the user provided:

```
a) Single file path  → read it
b) Directory path    → scan and catalogue all files
c) Pasted text       → treat as inline document
d) Multiple paths    → read all in parallel
e) template.pptx     → run inspector (see Step 1b)
```

Also ask for (if not provided):
- **template.pptx** path (optional — for branding)
- **screenshots/** directory (optional)
- **Target audience** — who will see this presentation?
- **Presentation goal** — inform? persuade? report? propose?
- **Preferred language** — Korean / English / Mixed

### Step 1b: INSPECT TEMPLATE (if template.pptx provided)

Run the template inspector to extract theme, colors, fonts, and available layouts:

```bash
SKILL_DIR=$(python3 -c "import os; print(os.path.expanduser('~/Dev/skills/cyanluna.tools/reports/report-pptx-generator'))")
python3 "$SKILL_DIR/pptx_inspector.py" /path/to/template.pptx
```

The inspector outputs:
- **Theme name & color scheme** — the corporate identity embedded in the template
- **12 theme colors** with HEX values and semantic roles (primary, accent, secondary, etc.)
- **Font scheme** — heading and body fonts the template was designed with
- **49+ slide layouts** — every available layout with placeholder details
- **Layout mapping** — which template layouts match standard scenario types

**Present to user for confirmation:**
```
Template: "Atlas Copco Group 2023"

Extracted colors:
  primary:   #054E5A (teal)
  accent:    #E1B77E (gold)
  secondary: #123F6D (navy)
  coral:     #F68363

Fonts: Segoe UI Semibold (headings) / Segoe UI (body)

Available layouts: cover, section_divider, screenshot_right,
  screenshot_left, full_content, grid, infographic, closing, ...

Use these? (or specify custom colors)
```

**Why this matters:**
- Colors match the template theme perfectly — no guessing
- Fonts are consistent with the corporate standard
- Layout mapping tells the AI what's available beyond the basic set
- User gets Beautiful.ai-like intelligence from their own template

### Step 2: EXPLORE

Deep-read every document. For each, extract:

**Content Inventory:**
- Key themes / topics
- Data points, metrics, numbers
- Problems described
- Solutions proposed
- Comparisons (before/after, us/them)
- Timeline / roadmap items
- Action items / next steps
- Quotes or key phrases worth highlighting

**Visual Assets:**
- Screenshots found → list with brief description
- Tables in documents → note for potential slide tables
- Diagrams described → note for potential custom slides

**Narrative Arc Detection:**
Identify the natural story flow:
```
Context/Problem → Solution → Evidence → Impact → Next Steps
```
or
```
Introduction → Features → Comparison → Results → Proposal
```
or
```
Status Update → Achievements → Challenges → Plan
```

Present findings as a structured summary to the user before proceeding.

### Step 3: STRUCTURE

Propose a slide outline based on the narrative arc.

**Output format:**
```
Proposed Slide Structure (N slides):

1. [Cover] — Title, subtitle, key stats
2. [Two Column] — Problem statement / current challenges
3. [Screenshot Right] — Feature overview with demo screenshot
4. [Two Column] — Before vs After comparison
5. [Full Content] — Key metrics and results
6. [Section Divider] — Next Steps
7. [Closing] — Roadmap and contact

Estimated: N slides, ~M minutes presentation
```

**Layout selection heuristics:**
| Content pattern | Recommended layout |
|----------------|-------------------|
| Title + stats + value props | `cover` |
| Two parallel topics or compare | `two_column` |
| Feature + screenshot | `screenshot_right` or `screenshot_left` |
| Single topic deep-dive | `full_content` |
| Topic transition | `section_divider` |
| Summary + CTA + contact | `closing` |
| Unique/complex content | `custom` |

### Step 4: INTERVIEW

Use AskUserQuestion to fill gaps. Common questions:

**Presentation context:**
- "발표 대상은 누구인가요? (경영진 / 팀원 / 고객 / 외부)"
- "발표 목적은? (보고 / 제안 / 교육 / 설득)"
- "발표 시간은 얼마나 되나요?"

**Content gaps:**
- "이 섹션에 구체적인 수치가 있나요? (예: 개선율, 비용 절감)"
- "Before/After 비교에 추가할 항목이 있나요?"
- "스크린샷 중 특별히 강조할 화면이 있나요?"

**Design preferences** (skip if inspector already extracted from template):
- "기업 브랜드 컬러가 있나요? (HEX 코드 또는 컬러 이름)"
- "template.pptx 파일이 있나요?"
- "선호하는 폰트가 있나요? (기본: Segoe UI)"

**Rules:**
- 1-4 questions per round, max 3 rounds
- Skip what's already clear from documents
- Offer concrete options, not open-ended questions
- Stop early if user says "충분해" or "이대로 진행"

### Step 5: GENERATE

Write the final `scenario.md` file using the report-pptx-generator format.

**File location:** Same directory as the primary input document, or user-specified path.
**Filename:** `slide-scenario.md` (default) or `{project}-scenario.md`

**Generation rules:**

1. **Frontmatter** — Complete YAML block:
```yaml
---
project: "{project-name}"
output: "output/{project-name}.pptx"
template: "{template-path-if-provided}"
font: "{font}"
screenshots_dir: "{screenshots-path}"
colors:
  primary: "{color}"
  accent: "{color}"
  secondary: "{color}"
  success: "#27AE60"
  danger: "#E74C3C"
  text: "#2C3E50"
  text_light: "#5A6A7A"
  gray_bg: "#F4F6F8"
---
```

2. **Color selection** — Priority order:
   - **Inspector output** (if template was analyzed in Step 1b) — use `recommended_colors` directly
   - User-provided brand colors (override inspector if specified)
   - Professional defaults by audience (no template):
     - Corporate: Navy `#1A365D` + Gold `#D4A853`
     - Tech: Teal `#054E5A` + Amber `#E1B77E`
     - Creative: Deep Purple `#4A1D96` + Coral `#FF6B6B`
     - Medical: Blue `#0066CC` + Green `#00A86B`

3. **Slide sections** — One `## Slide N:` block per slide:
   - Include `layout:` matching the proposed structure
   - Populate all content fields from extracted information
   - Reference screenshots by filename
   - Keep table data concise (max 6-7 rows per table)
   - Keep text blocks brief (presentation != document)

4. **Content condensation rules:**
   - Document paragraph → 1-2 sentence summary
   - Long lists → top 4-6 most impactful items
   - Detailed data → key metrics only
   - Technical details → audience-appropriate abstractions
   - Full sentences → punchy phrases for slides

5. **Slide count guidance:**
   - 5-minute presentation: 5-7 slides
   - 10-minute presentation: 8-12 slides
   - 20-minute presentation: 12-18 slides
   - Status report: 4-6 slides
   - Proposal: 7-10 slides

6. **Self-validation checklist** before saving:
   - [ ] Frontmatter has `project`, `output`, `colors` (minimum: primary + accent)
   - [ ] Every slide has `layout:` and `title:`
   - [ ] All referenced screenshots exist in `screenshots_dir`
   - [ ] Tables have matching header/row column counts
   - [ ] No slide has more than 2 tables (readability limit)

### Step 6: HANDOFF

After generating the scenario file:

```
Scenario file saved: {path}/slide-scenario.md

To generate the PPTX:
1. Review and edit the scenario if needed
2. Run /report-pptx-generator with this scenario file
   (or ask me to generate the PPTX now)

Scenario summary:
- {N} slides
- Layout: {layout types used}
- Screenshots: {N} referenced
- Colors: {primary} / {accent}
```

Ask user:
- "이대로 바로 PPTX 생성할까요?"
- "시나리오를 먼저 검토/수정하시겠어요?"

If user wants immediate generation, proceed to invoke the report-pptx-generator workflow directly.

## Existing PPTX Reading

When the user provides a .pptx file to restructure:

```python
from pptx import Presentation
from pptx.util import Emu

prs = Presentation("input.pptx")
for i, slide in enumerate(prs.slides):
    print(f"\n--- Slide {i+1} ---")
    for shape in slide.shapes:
        if shape.has_text_frame:
            print(f"  Text: {shape.text[:100]}")
        if shape.has_table:
            table = shape.table
            print(f"  Table: {table.rows.__len__()}x{len(table.columns)}")
        if shape.shape_type == 13:  # Picture
            print(f"  Image: {shape.width}x{shape.height}")
```

Extract text and structure, then follow the normal refine flow.

## Example: Report to Scenario

**Input:** A 3-page project status report (markdown)

**Step 2 output:**
```
Content Inventory:
- Project: Operation Board (resource management platform)
- Key metrics: 50+ users, 30s daily input, 12mo forecast
- Problems: manual Excel, no data for decisions, days to compile reports
- Solutions: real-time dashboard, AI worklog, automated cost classification
- Screenshots available: dashboard.png, worklogs.png, resource-matrix.png
- Narrative arc: Problem → Solution → Features → Results → Expansion proposal
```

**Step 3 output:**
```
Proposed Slide Structure (7 slides):

1. [Cover] — Operation Board: Engineering Resource Platform
2. [Two Column] — Current Problems vs Design Principles
3. [Screenshot Right] — Input Features with worklog screenshot
4. [Two Column] — Dashboard + Resource Matrix screenshots
5. [Full Content] — Before/After comparison with metrics
6. [Section Divider] — Expansion Plan
7. [Closing] — Roadmap & Next Steps

Estimated: 7 slides, ~10 minutes presentation
```

## Scenario Format Reference

The output must conform to the format defined in the report-pptx-generator skill:
`reports/report-pptx-generator/example/scenario-template.md` (in the same repo)

### Supported Layouts
| layout | When to use |
|--------|------------|
| `cover` | First slide — title, stats, value props |
| `two_column` | Compare, parallel topics, left/right content |
| `screenshot_right` | Feature explanation with demo on right |
| `screenshot_left` | Feature explanation with demo on left |
| `full_content` | Single topic needing full width |
| `section_divider` | Topic transition marker |
| `closing` | Final slide — summary, CTA, contact |
| `custom` | Anything that doesn't fit standard layouts |
