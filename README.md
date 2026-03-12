# cyanluna.tools

Shared skill repository for presentation, report, document-generation, and tmux workspace workflows.

Machine setup guide:
- [`docs/macos-shared-skill-registry.md`](docs/macos-shared-skill-registry.md)

Currently included:
- `reports/report-pipeline`
- `reports/report-html`
- `reports/report-pdf-print`
- `reports/report-pptx`
- `reports/report-pptx-refine`
- `reports/report-pptx-generator`
- `tmux/tmux-router`
- `tmux/tmux-layout`
- `tmux/tmux-pane-control`
- `tmux/tmux-agent-bridge`
- `tmux/tmux-run-ops`
- `tmux/tmux-snapshot`

```
                                    +------------------+
                                    | template.pptx    |
                                    +--------+---------+
                                             |
                                    pptx_inspector.py
                                    (theme, colors, fonts,
                                     layouts extracted)
                                             |
                                             v
Documents  ──>  report-pptx  ──>  report-pptx-refine  ──>  scenario.md  ──>  report-pptx-generator  ──>  .pptx
(reports,        (route)            (analyze,             (structured       (python-pptx               (editable in
 specs,                              inspect,              slide plan        code gen)                  PowerPoint)
 notes)                              interview)            + colors/fonts)
```

```text
markdown report  ──>  report-pipeline  ──>  report-html  ──>  html
                        (orchestrate)       (layout)
                                                    |
                                                    v
                                             report-pdf-print  ──>  pdf
                                             (print)
```

```text
general tmux request  ──>  tmux-router  ──>  tmux-layout
                           (dispatch)          tmux-pane-control
                                               tmux-agent-bridge
                                               tmux-run-ops
                                               tmux-snapshot
```

## Skills

### `/report-pptx` -- PPTX Workflow Router

Routes broad report-to-slides requests to the right lower-level PPTX workflow.

**Accepts:** presentation requests, report-to-slides requests, vague "PPTX 만들어줘" requests
**Outputs:** the right `report-pptx-*` skill selection

**Workflow:**
1. **Route** -- choose `report-pptx-refine` when the user has source documents
2. **Route** -- choose `report-pptx-generator` when the user already has `scenario.md`
3. **Chain** -- use refine first, then generator for end-to-end slide creation

### `/report-pptx-refine` -- Document to Scenario

Takes various input documents and refines them into a structured slide scenario through analysis and user interview.

**Accepts:** Markdown, text, outlines, meeting notes, CSV, existing .pptx, screenshots
**Outputs:** `slide-scenario.md` ready for `report-pptx-generator`

**Workflow:**
1. **Collect** -- Gather all input files
2. **Inspect Template** -- If template.pptx provided, run `pptx_inspector.py` to extract theme colors, fonts, and 49+ available layouts
3. **Explore** -- Deep-read, extract themes, metrics, narrative arc
4. **Structure** -- Propose slide outline with layout recommendations
5. **Interview** -- Fill content gaps with focused questions (skip design questions if inspector already extracted theme)
6. **Generate** -- Write scenario.md with frontmatter + slide sections
7. **Handoff** -- Offer immediate PPTX generation or review first

### `/report-pptx-generator` -- Scenario to PPTX

Generates editable .pptx from a scenario markdown file using python-pptx.

**Accepts:** `scenario.md` + optional `template.pptx` + screenshots
**Outputs:** Fully editable `.pptx` file

**Architecture -- Two Layers:**
- **Layer 1 (fixed):** `pptx_helper.py` -- 19 verified helper functions for shapes, text, tables, and page furniture
- **Layer 2 (dynamic):** Claude generates `build_ppt_{project}.py` per scenario, importing helpers

**Workflow:**
1. **Gather** -- Validate scenario, template, screenshots, dependencies
2. **Parse** -- Extract YAML frontmatter (colors, font, paths) + slide sections
3. **Generate** -- Create Python build script with one function per slide
4. **Execute** -- Run the script, fix errors if any
5. **Verify** -- Confirm slide count, file size, dimensions

### `/report-pipeline` -- End-to-End Report Workflow

Coordinates shared report-generation workflows by composing the lower-level report skills instead of duplicating their logic.

**Accepts:** markdown reports, repository integration requests, report wrapper/config tasks
**Outputs:** reusable report pipeline setup, plus `.html` and `.pdf` when executed end to end

**Workflow:**
1. **Choose** -- decide whether the task is HTML-only, PDF-only, or full pipeline
2. **Compose** -- call `report-html` for layout and `report-pdf-print` for final PDF
3. **Integrate** -- keep repository-specific wrappers thin and config-driven
4. **Verify** -- confirm output files and wrapper wiring

### `/report-html` -- Markdown Report to HTML

Generates branded HTML reports from markdown source documents.

**Accepts:** markdown reports, status notes, alignment docs, project updates
**Outputs:** styled `.html`

**Workflow:**
1. **Read** -- inspect markdown structure and metadata
2. **Brand** -- gather logo, department, config, or design reference
3. **Render** -- run the shared HTML renderer with config or direct branding args
4. **Verify** -- inspect output files and optionally screenshot the cover
5. **Integrate** -- keep repository-specific wrappers thin and forward to the shared renderer

### `/report-pdf-print` -- HTML to PDF

Prints existing HTML files or URLs to PDF with shared page settings, orientation, and footer control.

**Accepts:** local `.html`, `file://` URLs, `http://` or `https://` URLs
**Outputs:** printable `.pdf`

**Workflow:**
1. **Confirm** -- verify the HTML source already exists
2. **Configure** -- reuse page and footer settings from shared config when available
3. **Print** -- run the Playwright-based PDF printer
4. **Verify** -- inspect the generated PDF and compare against the HTML when layout matters
5. **Pair** -- use this after `report-html` instead of re-implementing report layout in a second place

### `/tmux-router` -- General Tmux Request Router

Routes broad tmux requests to the right underlying tmux skill.

**Accepts:** general tmux workspace, pane, localhost, and snapshot requests
**Outputs:** the right `tmux-*` skill selection, optionally chaining more than one

**Routing targets:**
- `tmux-layout` -- workspace layout, window names, pane splits, default setup
- `tmux-pane-control` -- inspect panes, send input, capture recent output
- `tmux-agent-bridge` -- relay output from one pane to another for review or debate
- `tmux-run-ops` -- run localhost services in `runs`, inspect ports, health-check, stop cleanly
- `tmux-snapshot` -- save current tmux state to a text snapshot

### `/tmux-layout` -- Standardize Tmux Layouts

Creates or normalizes reusable tmux workspaces with named windows and predictable pane splits.

**Accepts:** session names, root paths, requests like `agents/runs` layout or 2x2 pane structure
**Outputs:** normalized tmux sessions with consistent windows and pane headers

**Workflow:**
1. **Inspect** -- list current tmux sessions, windows, and panes
2. **Choose** -- decide whether to reuse a session or create a new one
3. **Apply** -- create `agents` and `runs` windows with standard pane structure
4. **Label** -- set pane-border headers using current path or fixed titles
5. **Verify** -- confirm window names, pane counts, and pane paths

### `/tmux-pane-control` -- Targeted Pane Actions

Interacts with an existing tmux pane without changing the broader layout.

**Accepts:** pane targets, short commands, prompt text, recent-output requests
**Outputs:** pane listings, injected input, or bounded captured output

**Workflow:**
1. **Resolve** -- identify the right pane by index, path, title, or current command
2. **Check** -- inspect current pane state before injecting input
3. **Send** -- write text or commands to the pane deliberately
4. **Capture** -- read only the most recent lines needed for the task

### `/tmux-agent-bridge` -- Multi-Agent Handoffs

Relays recent output from one tmux pane to another pane as a structured handoff.

**Accepts:** source pane, target pane, instruction, recent-output line count
**Outputs:** a review, critique, verification request, or summary prompt delivered to another agent pane

**Workflow:**
1. **Identify** -- choose source and target panes
2. **Bound** -- capture only the recent output needed
3. **Relay** -- paste structured context and an explicit instruction into the target pane
4. **Follow up** -- capture the target pane's response if needed

### `/tmux-run-ops` -- Localhost Run Window Operations

Runs and controls local development services from dedicated tmux run panes.

**Accepts:** target pane, working directory, run command, port number, localhost URL
**Outputs:** started dev servers, port ownership info, health-check results, clean stops

**Workflow:**
1. **Check** -- verify whether a target port is already in use
2. **Start** -- run the server in an explicit `runs` pane
3. **Verify** -- health-check the localhost endpoint
4. **Stop** -- terminate the listener on a port when requested

### `/tmux-snapshot` -- Save Current Tmux State

Writes the current tmux inventory to a plain-text snapshot file.

**Accepts:** optional session filter and output path
**Outputs:** snapshot text with sessions, windows, panes, commands, paths, and geometry

**Workflow:**
1. **Scope** -- capture one session or all sessions
2. **Record** -- write session, window, and pane metadata to a file
3. **Reuse** -- inspect or manually reconstruct a workspace later from the snapshot

## Template Inspector

The `pptx_inspector.py` analyzes any `.pptx` template and extracts everything AI needs to generate on-brand presentations -- similar to how Beautiful.ai or Gamma analyze your uploaded templates.

```bash
python3 reports/report-pptx-generator/pptx_inspector.py your-template.pptx
```

**Extracts:**
- Theme name and color scheme (all 12 OOXML theme roles)
- **Design colors from shapes** -- for Canva/Slidesgo-style templates that use default Office theme but embed real colors in shapes
- Recommended color map (ready-to-paste YAML for scenario frontmatter)
- Font scheme (heading + body, Latin + East Asian)
- All slide layouts with placeholder details
- Layout mapping (template layouts -> scenario layout types)

**Handles two template types:**

| Type | Examples | How colors are detected |
|------|----------|------------------------|
| **Custom theme** | Corporate templates | Reads OOXML theme color roles directly |
| **Default Office theme** | Canva, Slidesgo, SlidesCarnival | Scans shape-level `srgbClr` values, classifies by luminance |

**Example output (corporate template):**
```
## Theme
- Name: Atlas Copco Group 2023
- Color scheme: ACG_2023
- Heading font: Segoe UI Semibold
- Body font: Segoe UI

## Recommended Color Map (for scenario frontmatter)
colors:
  primary: "#054E5A"
  accent: "#E1B77E"
  secondary: "#123F6D"
  sage: "#5D7875"
  coral: "#F68363"
```

**Example output (Canva/Slidesgo template):**
```
## Design Colors (from slide shapes)
Custom theme: No (default Office → colors extracted from shapes)
| HEX      | Count |
|----------|-------|
| #FFD699  | 168   |
| #1E1A1B  | 78    |
| #2DCD9D  | 26    |

## Recommended Color Map (for scenario frontmatter)
colors:
  text: "#1E1A1B"
  primary: "#2DCD9D"
  gray_bg: "#FFD699"
  accent: "#D3FFF2"
```

JSON mode: `python3 pptx_inspector.py template.pptx --json`

## Scenario Format

```markdown
---
project: "my-project"
output: "output/result.pptx"
template: "template.pptx"          # optional
font: "Segoe UI"                   # optional
screenshots_dir: "screenshots/"    # optional
colors:
  primary: "#054E5A"
  accent: "#E1B77E"
  secondary: "#123F6D"
  text: "#2C3E50"
---

## Slide 1: Cover
layout: cover
title: "Presentation Title"
subtitle: "Subtitle"
date: "March 2026"
stats:
  - value: "50+"
    label: "Users"

---

## Slide 2: Two Column -- Problem & Solution
layout: two_column
title: "Background"
page_num: 2

left:
  subtitle: "The Problem"
  table:
    headers: ["Issue", "Impact"]
    rows:
      - ["Manual process", "Hours wasted"]

right:
  subtitle: "Our Solution"
  content: |
    Automated dashboard with real-time data.
```

See [`report-pptx-generator/example/scenario-template.md`](reports/report-pptx-generator/example/scenario-template.md) for the full format reference with all 8 layout types.

### Supported Layouts

| Layout | Description |
|--------|-------------|
| `cover` | Title slide with stats and value cards |
| `two_column` | 50/50 split for comparisons or parallel content |
| `screenshot_right` | Text left, screenshot right |
| `screenshot_left` | Screenshot left, text right |
| `full_content` | Single column, full width |
| `section_divider` | Centered section transition |
| `closing` | Summary, CTA, contact info |
| `custom` | Free-form layout |

## Helper Library

`pptx_helper.py` provides building blocks extracted from a production PPTX generator:

```python
from pptx_helper import *

# Colors
PRIMARY = hex_to_rgb("#054E5A")

# Presentation setup
prs = load_presentation("template.pptx")  # loads + clears template slides
blank = get_blank_layout(prs)

# Slide building
slide = prs.slides.add_slide(blank)
top_bar(slide, color=PRIMARY)
page_title(slide, "My Title", accent_color=hex_to_rgb("#E1B77E"))
subtitle(slide, "Section", Emu(500000), Emu(850000))

# Tables
t = add_table(slide, 4, 3, Emu(500000), Emu(1200000), Emu(5500000), Emu(1500000))
header_row(t, ["Col A", "Col B", "Col C"], bg_color=PRIMARY)
data_row(t, 1, ["data", "data", "data"])

# Callouts
callout(slide, "Key insight here.", Emu(500000), Emu(3000000),
        Emu(5500000), Emu(500000), bg=hex_to_rgb("#E8F5E9"))

prs.save("output.pptx")
```

### Function Reference

| Category | Functions |
|----------|-----------|
| **Shapes** | `add_shape`, `add_rounded_rect` |
| **Text** | `set_text`, `add_para`, `textbox` |
| **Tables** | `add_table`, `cell`, `header_row`, `data_row` |
| **Page** | `top_bar`, `page_title`, `subtitle`, `page_num`, `footer_line`, `callout` |
| **Utility** | `hex_to_rgb`, `load_presentation`, `get_blank_layout` |
| **Inspector** | `pptx_inspector.py` -- standalone CLI + importable module |
| **Constants** | `SLIDE_W`, `SLIDE_H`, `WHITE`, `BLACK` |

All functions accept keyword arguments with sensible defaults. Colors default to a professional teal/navy/gold scheme.

## Sample Template

A bundled sample template (`sample-template.pptx`) demonstrates the full pipeline without requiring a corporate template. It features:

- **"Slate & Teal" color theme** -- modern palette with 12 colors
- **3 demo slides** -- cover, content layout, section divider
- **Embedded font scheme** -- Inter / Segoe UI
- **32 KB** -- lightweight, clean starting point

Generate it yourself:
```bash
cd reports/report-pptx-generator/example
python3 create_sample_template.py   # creates sample-template.pptx
python3 ../pptx_inspector.py sample-template.pptx  # verify theme extraction
```

Or bring your own `template.pptx` -- the inspector handles any PowerPoint template.

## Installation

### Prerequisites

```bash
pip install python-pptx lxml
```

### Register Report Skills

```bash
bash reports/scripts/install_shared_report_skills.sh
```

Use `--dry-run`, `--skip-claude`, or `--skip-codex` when needed.

### Manual Registration For Codex

```bash
# Clone
git clone https://github.com/cyanluna-git/cyanluna.tools.git ~/Dev/skills/cyanluna.tools

# Register skills (symlink to Codex skills directory)
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pipeline ~/.codex/skills/report-pipeline
ln -s ~/Dev/skills/cyanluna.tools/reports/report-html ~/.codex/skills/report-html
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pdf-print ~/.codex/skills/report-pdf-print
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx ~/.codex/skills/report-pptx
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx-refine ~/.codex/skills/report-pptx-refine
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx-generator ~/.codex/skills/report-pptx-generator
```

### Manual Registration For Claude

```bash
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pipeline ~/.claude/skills/report-pipeline
ln -s ~/Dev/skills/cyanluna.tools/reports/report-html ~/.claude/skills/report-html
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pdf-print ~/.claude/skills/report-pdf-print
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx ~/.claude/skills/report-pptx
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx-refine ~/.claude/skills/report-pptx-refine
ln -s ~/Dev/skills/cyanluna.tools/reports/report-pptx-generator ~/.claude/skills/report-pptx-generator
```

### Verify

```bash
# Helper library
python3 -c "
import sys; sys.path.insert(0, 'reports/report-pptx-generator')
from pptx_helper import *
print('pptx_helper OK')
print('hex_to_rgb:', hex_to_rgb('#054E5A'))
"

# Inspector (optional — only needed if using templates)
python3 reports/report-pptx-generator/pptx_inspector.py --help 2>/dev/null || echo "Usage: python3 pptx_inspector.py <template.pptx> [--json]"
```

## Project Structure

```text
cyanluna.tools/
├── README.md
├── reports/
│   ├── report-pipeline/
│   │   ├── SKILL.md
│   │   └── agents/
│   ├── report-html/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   ├── references/
│   │   └── agents/
│   ├── report-pdf-print/
│       ├── SKILL.md
│       ├── scripts/
│       ├── references/
│       └── agents/
│   ├── report-pptx/
│   │   ├── SKILL.md
│   │   └── agents/
│   ├── report-pptx-refine/
│   │   ├── SKILL.md
│   │   └── agents/
│   ├── report-pptx-generator/
│   │   ├── SKILL.md
│   │   ├── agents/
│   │   ├── pptx_helper.py
│   │   ├── pptx_inspector.py
│   │   └── example/
│   └── scripts/
│       └── install_shared_report_skills.sh
└── workthrough/
```

## License

MIT
