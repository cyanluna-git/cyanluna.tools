---
name: report-pdf-print
description: Print local HTML files or URLs to PDF using Playwright with explicit page size, orientation, margins, and footer control. Use when a styled HTML document already exists and the task is to generate a printable PDF without rebuilding the layout layer.
---

# PDF Print

Use this skill when the user already has an HTML file or page and wants a PDF version with controlled print settings.

## Quick Start

```bash
node scripts/print_to_pdf.cjs /path/to/report.html
```

With reusable config:

```bash
node scripts/print_to_pdf.cjs /path/to/report.html \
  --config /path/to/report-config.json
```

For explicit output and orientation:

```bash
node scripts/print_to_pdf.cjs /path/to/report.html \
  --output-base /tmp/report \
  --landscape \
  --footer "Quarterly Program Report"
```

## Workflow

### 1. Confirm the HTML source

Accept either:
- a local HTML file
- a `file://` URL
- an `http://` or `https://` URL

If the task started from markdown, prefer `$report-html` first and then run `$report-pdf-print` on the generated HTML.

### 2. Apply print settings

The script supports:
- `--config` for shared page/footer settings
- `--output-base` for choosing the PDF path
- `--page-format` such as `A4`
- `--landscape` or `--portrait`
- `--footer` for the printed footer label

When a shared report config already exists, reuse it instead of duplicating print settings in multiple places.

### 3. Generate the PDF

```bash
node scripts/print_to_pdf.cjs /path/to/report.html \
  --config ./report-config.json
```

The output defaults to:
- `report.html` -> `report.pdf`

### 4. Verify the result

Always check:

```bash
file /path/to/output.pdf
ls -lh /path/to/output.pdf
```

If layout quality matters, compare the HTML and PDF visually after generation.

## Pairing Rule

Keep responsibilities separate:
- `$report-html` owns report layout and branding
- `$report-pdf-print` owns final PDF printing

Do not move report composition logic into `$report-pdf-print`.

## Resources

### `scripts/print_to_pdf.cjs`

Playwright-based PDF printer for HTML files and URLs.

### `references/print-options.md`

Print settings and config reuse guidance.
