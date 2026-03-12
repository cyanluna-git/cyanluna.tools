---
name: html-report
description: Generate branded HTML reports from markdown source documents and set up reusable HTML report-rendering workflows around that renderer. Use when converting status reports, alignment notes, Confluence exports, project updates, internal briefs, or similar markdown files into polished HTML deliverables with a cover page, section cards, branding, and print-aware CSS, or when creating project wrappers/configs that should delegate to a shared HTML renderer.
---

# HTML Report

Use this skill when the user wants a markdown report turned into a designed HTML document, or when a repository needs a reusable wrapper/config around a shared HTML report renderer.

## Quick Start

1. Identify the source markdown file and any branding inputs.
2. If the user references an existing design source such as `slides.html`, open it first and extract the palette and layout cues.
3. Generate HTML with the bundled renderer:

```bash
node scripts/render_html_report.cjs \
  /path/to/report.md \
  --config /path/to/report-config.json
```

Or pass settings directly:

```bash
node scripts/render_html_report.cjs \
  /path/to/report.md \
  --logo /path/to/logo.png \
  --department "Engineering Systems Team"
```

4. Verify the generated `.html`.
5. If the user also needs a PDF, hand the generated HTML to `$pdf-print` instead of rebuilding layout logic in a second place.

This renderer is the single source of truth for report layout and branding. Repository-specific commands should stay as thin wrappers around `scripts/render_html_report.cjs`.

## Workflow

### 1. Read the source structure

Expect markdown shaped roughly like this:
- `#` report title
- bold metadata lines near the top such as `**Date:**`, `**Purpose:**`, `**Audience:**`
- `##` main sections
- `###` and `####` subsections
- bullet lists for scope, risks, roadmap items, or decisions

The renderer is optimized for status/alignment documents and will create:
- a branded cover page
- a contents page
- summary pages for current status / roadmap / operating model when matching sections exist
- detailed section pages for the rest of the document

If the markdown shape is unusual, read [references/source-format.md](references/source-format.md) and normalize the headings first.

### 2. Gather branding inputs

Before rendering, check whether the user provided:
- a logo path
- department or team name
- an existing HTML/CSS/PPT design reference
- preferred document language

If a design reference exists, reuse its palette and visual logic. The default renderer already ships with a management-report layout, but project-specific visual direction should come from the referenced design source or the config file.

### 3. Render the report

Supported renderer options:

```bash
node scripts/render_html_report.cjs input.md \
  --config ./report-config.json \
  --output-base /tmp/my-report \
  --landscape \
  --logo /path/to/logo.png \
  --department "Engineering Systems Team" \
  --brand "Quarterly Program Report" \
  --doc-type "Management Brief"
```

Notes:
- `--config` points to a JSON file with reusable branding/theme/text/page settings
- `--output-base` controls the HTML filename: `<base>.html`
- `--landscape` and `--portrait` change the print-aware CSS mode used by the HTML
- `--page-format` overrides the paper size used in print CSS
- omit `--logo` if no logo is needed
- omit `--department` if the cover should not show a department line
- the script auto-detects Korean vs English from the markdown metadata
- CLI arguments override config file values

### 4. Verify outputs

Always check:

```bash
ls -lh /path/to/output.html
```

If the report is visually important, take a browser screenshot of the generated HTML cover and inspect:
- logo fit and scale
- cover text overflow
- summary cards
- print layout density

### 5. Pair with PDF printing when needed

If the user needs a PDF:

1. Generate HTML here first
2. Invoke `$pdf-print` on that HTML file

This keeps layout responsibility in one place and print responsibility in another.

## Wrapper Pattern

If a repository already has its own report command, do not duplicate the full renderer there.

Use this pattern instead:

1. Keep the HTML layout logic here in `scripts/render_html_report.cjs`
2. Let the project-side script pass repository-specific defaults such as:
   - config file path
   - optional CLI overrides
3. If PDF output is needed, call `$pdf-print` on the generated HTML

## Resources

### `scripts/render_html_report.cjs`

Reusable renderer that converts markdown into a branded HTML report.

### `references/source-format.md`

What markdown structure the renderer expects and how to normalize documents before rendering.

### `references/branding-notes.md`

Branding and layout conventions for this report style, including the default palette and customization points.

### `references/config-format.md`

Configuration file format for repository-specific branding, theme, and page overrides.

### `references/report-config.example.json`

Example JSON config to copy into a consuming repository.
