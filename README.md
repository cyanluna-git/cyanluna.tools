# PPTX Skills for Claude Code

Claude Code skills that generate editable PowerPoint presentations from documents and structured scenarios.

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
Documents  ──>  pptx-refine  ──>  scenario.md  ──>  pptx-generator  ──>  .pptx
(reports,        (analyze,         (structured       (python-pptx        (editable in
 specs,           inspect,          slide plan        code gen)           PowerPoint)
 notes)           interview)        + colors/fonts)
```

## Skills

### `/pptx-refine` -- Document to Scenario

Takes various input documents and refines them into a structured slide scenario through analysis and user interview.

**Accepts:** Markdown, text, outlines, meeting notes, CSV, existing .pptx, screenshots
**Outputs:** `slide-scenario.md` ready for pptx-generator

**Workflow:**
1. **Collect** -- Gather all input files
2. **Inspect Template** -- If template.pptx provided, run `pptx_inspector.py` to extract theme colors, fonts, and 49+ available layouts
3. **Explore** -- Deep-read, extract themes, metrics, narrative arc
4. **Structure** -- Propose slide outline with layout recommendations
5. **Interview** -- Fill content gaps with focused questions (skip design questions if inspector already extracted theme)
6. **Generate** -- Write scenario.md with frontmatter + slide sections
7. **Handoff** -- Offer immediate PPTX generation or review first

### `/pptx-generator` -- Scenario to PPTX

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

## Template Inspector

The `pptx_inspector.py` analyzes any `.pptx` template and extracts everything AI needs to generate on-brand presentations -- similar to how Beautiful.ai or Gamma analyze your uploaded templates.

```bash
python3 pptx-generator/pptx_inspector.py your-template.pptx
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

See [`pptx-generator/example/scenario-template.md`](pptx-generator/example/scenario-template.md) for the full format reference with all 8 layout types.

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
cd pptx-generator/example
python3 create_sample_template.py   # creates sample-template.pptx
python3 ../pptx_inspector.py sample-template.pptx  # verify theme extraction
```

Or bring your own `template.pptx` -- the inspector handles any PowerPoint template.

## Installation

### Prerequisites

```bash
pip install python-pptx lxml
```

### Register as Claude Code Skills

```bash
# Clone
git clone https://github.com/user/cyanluna.pptx.skills.git ~/dev/cyanluna.pptx.skills

# Register skills (symlink to Claude Code skills directory)
ln -s ~/dev/cyanluna.pptx.skills/pptx-generator ~/.claude/skills/pptx-generator
ln -s ~/dev/cyanluna.pptx.skills/pptx-refine ~/.claude/skills/pptx-refine
```

### Verify

```bash
# Helper library
python3 -c "
import sys; sys.path.insert(0, 'pptx-generator')
from pptx_helper import *
print('pptx_helper OK')
print('hex_to_rgb:', hex_to_rgb('#054E5A'))
"

# Inspector (optional — only needed if using templates)
python3 pptx-generator/pptx_inspector.py --help 2>/dev/null || echo "Usage: python3 pptx_inspector.py <template.pptx> [--json]"
```

## Project Structure

```
cyanluna.pptx.skills/
├── README.md
├── pptx-generator/
│   ├── SKILL.md                    # Generator skill definition
│   ├── pptx_helper.py              # Verified helper library (19 functions)
│   ├── pptx_inspector.py           # Template analyzer (colors, fonts, layouts)
│   └── example/
│       ├── create_sample_template.py   # Generates sample-template.pptx
│       ├── sample-template.pptx        # Ready-to-use modern template
│       └── scenario-template.md        # Scenario format reference
└── pptx-refine/
    └── SKILL.md                    # Refine skill definition
```

## License

MIT
