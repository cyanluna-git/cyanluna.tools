---
name: pptx-generator
description: Generate editable PPTX presentations from a scenario markdown file using python-pptx. Input a slide scenario (.md) with optional template.pptx and screenshots, output a fully editable .pptx file.
---

# PPTX Generator Skill

Generates editable PowerPoint (.pptx) files from structured scenario markdown using python-pptx.
Uses a two-layer architecture: fixed helper library + Claude-generated build script.

## When to Use

- "PPT 만들어줘" / "프레젠테이션 생성해줘"
- "시나리오 기반으로 PPTX 만들어줘"
- Any request to generate editable PowerPoint slides programmatically

## Model Recommendation

This skill generates complex Python code. For best results:
- Use `claude-opus-4-6` (run `/model opus` before invoking)
- Or ensure fast mode is OFF

## Core Workflow

### Step 1: Gather Inputs

Identify and validate:

1. **Scenario file** (required): `슬라이드시나리오.md` or similar — see format below
2. **Template** (optional): `template.pptx` — for company branding/fonts
3. **Screenshots** (optional): folder with .png/.jpg files referenced in scenario

Dependency check:
```bash
python3 -c "import pptx; print('python-pptx OK:', pptx.__version__)"
```
If missing: `pip3 install python-pptx`

### Step 2: Parse Scenario

Read the scenario markdown file. Extract:

**YAML Frontmatter** — project settings:
```yaml
project: "my-project"
output: "output/result.pptx"
template: "template.pptx"       # optional
font: "Segoe UI"                # optional, default: Segoe UI
screenshots_dir: "screenshots/" # optional
colors:
  primary: "#054E5A"
  accent: "#E1B77E"
  secondary: "#123F6D"
  success: "#27AE60"
  danger: "#E74C3C"
  text: "#2C3E50"
  text_light: "#5A6A7A"
  gray_bg: "#F4F6F8"
```

**Slide Sections** — each `## Slide N:` block defines a slide with:
- `layout:` — layout type (see supported layouts below)
- `title:` — slide title
- `page_num:` — page number
- Content fields vary by layout type

### Step 3: Generate Build Script

Create `build_ppt_{project}.py` in the scenario file's directory.

**CRITICAL RULES for code generation:**

1. Import pptx_helper from the skill directory:
```python
import sys, os
# Resolve the skill directory (adjust if installed elsewhere)
SKILL_DIR = os.path.expanduser("~/Dev/skills/cyanluna.tools/pptx/pptx-generator")
sys.path.insert(0, SKILL_DIR)
from pptx_helper import *
```

2. Define colors from frontmatter at module level:
```python
PRIMARY = hex_to_rgb("#054E5A")
ACCENT = hex_to_rgb("#E1B77E")
# ... etc
```

3. One function per slide: `build_slide_N(prs, blank)`

4. Main function pattern:
```python
def main():
    prs = load_presentation(TEMPLATE_PATH)
    blank = get_blank_layout(prs)
    build_slide_1(prs, blank)
    build_slide_2(prs, blank)
    # ...
    prs.save(OUTPUT_PATH)
    print(f"Saved: {OUTPUT_PATH} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    main()
```

5. Use pptx_helper functions exclusively — do NOT redefine helpers.

6. Always include `import os` at the top (already available from sys import line).

7. For screenshots:
```python
img_path = os.path.join(SCREENSHOTS_DIR, "dashboard.png")
if os.path.exists(img_path):
    slide.shapes.add_picture(img_path, left, top, width, height)
```

### Step 4: Execute

```bash
python3 build_ppt_{project}.py
```

If it fails:
- Read the error traceback
- Fix the specific `build_slide_N()` function
- Re-run — do NOT start over

### Step 5: Verify and Report

```bash
python3 -c "
from pptx import Presentation
import os
p = Presentation('{output_path}')
size = os.path.getsize('{output_path}')
print(f'Slides: {len(p.slides)}')
print(f'Size: {size/1024:.1f} KB')
print(f'Dimensions: {p.slide_width}x{p.slide_height}')
"
```

Report to user:
- Number of slides generated
- File size
- Output file path
- Remind that all elements are editable in PowerPoint

## Supported Layout Types

Use these patterns when generating `build_slide_N()` functions:

### `cover` — Cover Slide
Split left (dark panel with title, stats) / right (feature cards or content).
```python
def build_slide_cover(prs, blank):
    slide = prs.slides.add_slide(blank)
    # Left dark panel
    add_shape(slide, Emu(0), Emu(0), Emu(5800000), Emu(6858000), fill_color=PRIMARY)
    # Title, subtitle, stats on left
    # Content cards on right
```

### `two_column` — Two Column (50/50)
Standard content slide with left and right sections.
```python
def build_slide_two_col(prs, blank):
    slide = prs.slides.add_slide(blank)
    top_bar(slide, color=PRIMARY)
    page_title(slide, "Title", color=NAVY_DARK, accent_color=ACCENT)
    L, MID, W = Emu(500000), Emu(6200000), Emu(5500000)
    # Left content at L
    # Right content at MID
    footer_line(slide)
    page_num(slide, N)
```

### `screenshot_right` — Text Left, Screenshot Right
```python
def build_slide_ss_right(prs, blank):
    slide = prs.slides.add_slide(blank)
    top_bar(slide, color=PRIMARY)
    page_title(slide, "Title")
    # Left: tables, text at Emu(500000)
    # Right: screenshot at Emu(6200000)
    img = os.path.join(SCREENSHOTS_DIR, "screen.png")
    if os.path.exists(img):
        slide.shapes.add_picture(img, Emu(6200000), Emu(2000000), Emu(5600000), Emu(3400000))
    footer_line(slide)
    page_num(slide, N)
```

### `screenshot_left` — Screenshot Left, Text Right
Mirror of screenshot_right.

### `full_content` — Full Width Single Column
```python
def build_slide_full(prs, blank):
    slide = prs.slides.add_slide(blank)
    top_bar(slide, color=PRIMARY)
    page_title(slide, "Title")
    # Full-width content from Emu(500000) to Emu(11700000)
    footer_line(slide)
    page_num(slide, N)
```

### `section_divider` — Section Divider
Minimal slide with centered section title.
```python
def build_slide_divider(prs, blank):
    slide = prs.slides.add_slide(blank)
    add_shape(slide, Emu(0), Emu(0), SLIDE_W, SLIDE_H, fill_color=PRIMARY)
    add_shape(slide, Emu(0), Emu(3200000), SLIDE_W, Emu(5000), fill_color=ACCENT)
    textbox(slide, "SECTION TITLE", Emu(1000000), Emu(2600000), Emu(10000000), Emu(600000),
            size=36, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
    textbox(slide, "Subtitle here", Emu(1000000), Emu(3400000), Emu(10000000), Emu(400000),
            size=16, color=RGBColor(0xBB, 0xD5, 0xDD), align=PP_ALIGN.CENTER)
```

### `closing` — Closing Slide
Contact info, summary, call-to-action.
```python
def build_slide_closing(prs, blank):
    slide = prs.slides.add_slide(blank)
    top_bar(slide, color=PRIMARY)
    page_title(slide, "Summary & Next Steps")
    # Key message callout
    callout(slide, "Main takeaway message here.",
            Emu(500000), Emu(900000), Emu(11200000), Emu(600000),
            bg=PRIMARY, color=WHITE, size=16, bold=True)
    # Content area — bullet points, timeline, etc.
    # Footer bar with contact info
    add_shape(slide, Emu(0), Emu(6500000), SLIDE_W, Emu(358000), fill_color=PRIMARY)
    textbox(slide, "Contact: team@company.com | Demo: demo.company.com",
            Emu(0), Emu(6540000), SLIDE_W, Emu(250000),
            size=10, color=WHITE, align=PP_ALIGN.CENTER)
```

### `custom` — Free-form
Claude generates the entire slide layout from the scenario description.

## Available Helper Functions (pptx_helper.py)

### Shapes
- `add_shape(slide, left, top, width, height, fill_color=None, line_color=None)` — Rectangle
- `add_rounded_rect(slide, left, top, width, height, fill_color=None, line_color=None)` — Rounded rect

### Text
- `set_text(shape, text, size, bold, color, align, font)` — Set shape text (clears existing)
- `add_para(tf, text, size, bold, color, align, font, space_before)` — Add paragraph to text frame
- `textbox(slide, text, left, top, width, height, size, bold, color, align, font)` — Add text box

### Tables
- `add_table(slide, rows, cols, left, top, width, height)` — Returns Table object
- `cell(table, r, c, text, size, bold, color, bg, align, font)` — Format a cell
- `header_row(table, headers, size, bg_color, text_color)` — Format header row
- `data_row(table, r, data, size, colors, bolds, alt_bg)` — Format data row with alternating bg

### Page Furniture
- `top_bar(slide, color)` — Thin accent bar at top
- `page_title(slide, text, y, color, accent_color, font)` — Title with underline accent
- `subtitle(slide, text, left, top, width, color, font)` — Section subtitle
- `page_num(slide, num, color)` — Bottom-right page number
- `footer_line(slide, color)` — Thin horizontal separator
- `callout(slide, text, left, top, width, height, bg, color, size, bold, border_color)` — Callout box

### Utility
- `hex_to_rgb("#054E5A")` — HEX string to RGBColor
- `load_presentation(template_path)` — Load template + clear slides
- `get_blank_layout(prs)` — Find Blank layout

### Constants
- `SLIDE_W`, `SLIDE_H` — 16:9 slide dimensions (Emu)
- `WHITE`, `BLACK` — Common RGBColor constants

## Template Analysis (pptx_inspector.py)

When a template.pptx is provided, **always run the inspector first** to extract theme colors, fonts, and available layouts:

```bash
python3 {SKILL_DIR}/pptx_inspector.py template.pptx
```

This outputs:
- **Theme colors** — all 12 theme color roles with HEX values
- **Recommended color map** — ready-to-paste YAML for scenario frontmatter
- **Font scheme** — heading + body fonts from the template theme
- **Layout catalog** — all available slide layouts with placeholder details
- **Layout mapping** — which template layouts map to scenario layout types

### How to use inspector output

1. **Colors**: Use the `Recommended Color Map` section directly in the scenario frontmatter `colors:` block
2. **Fonts**: Use the recommended font for the `font:` frontmatter field
3. **Layouts**: When generating `build_ppt_{project}.py`, the inspector tells you which template layouts are available — but the generator still uses `Blank` layout with custom shapes (not template placeholders) for maximum control

### JSON mode for programmatic use

```bash
python3 {SKILL_DIR}/pptx_inspector.py template.pptx --json
```

## Color Strategy

**Priority order:**
1. Scenario frontmatter `colors:` section (most reliable)
2. If template.pptx exists → run `pptx_inspector.py` to extract theme colors, then confirm with user
3. Default fallback: professional defaults (teal/gold/navy)

## Coordinate Reference (16:9 Slide)

```
Slide: 12,192,000 x 6,858,000 Emu
       ~13.33" x 7.5"

Common positions:
  Left margin:   Emu(500000)   ~0.55"
  Right column:  Emu(6200000)  ~6.8"
  Column width:  Emu(5500000)  ~6.0"
  Full width:    Emu(11200000) ~12.3"
  Top bar height: Emu(54000)
  Title Y:       Emu(280000)
  Content start: Emu(850000)
  Footer Y:      Emu(6400000)
  Page num Y:    Emu(6500000)
```

## Scenario File Format Reference

See `example/scenario-template.md` for the complete format specification.

## Error Recovery

Common issues and fixes:
- **`ModuleNotFoundError: pptx`** — Run `pip3 install python-pptx`
- **`FileNotFoundError` for screenshot** — Check `screenshots_dir` path; code uses `os.path.exists()` guard
- **Text overflow** — Reduce font size or text length in the build function
- **Template layout not found** — `get_blank_layout()` auto-falls back to first layout
