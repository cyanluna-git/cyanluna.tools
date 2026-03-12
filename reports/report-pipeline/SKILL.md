---
name: report-pipeline
description: Coordinate reusable markdown-report workflows by composing report-html and report-pdf-print, and set up thin repository wrappers/configs around those shared skills. Use when the user wants an end-to-end report pipeline, such as markdown to branded HTML plus PDF, shared report-generation setup for a repository, or a repeatable reporting workflow that should stay modular instead of duplicating renderer logic.
---

# Report Pipeline

Use this skill when the task is bigger than a single render step:
- markdown report to HTML and PDF
- repository-level report export setup
- reusable wrapper/config design around the shared report skills

If the user only needs one stage, use the lower-level skill directly:
- `$report-html` for markdown to HTML
- `$report-pdf-print` for HTML to PDF

## Workflow

### 1. Pick the right entry point

Use this decision rule:

- Source is markdown and output is HTML only: use `$report-html`
- Source is markdown and output is HTML plus PDF: use `$report-html`, then `$report-pdf-print`
- Source is already HTML or a URL and output is PDF only: use `$report-pdf-print`
- Source is a repository request like "set up report generation here": use this skill and wire the lower-level skills together with config and a thin wrapper

This skill exists to keep those choices consistent.

### 2. Keep responsibility boundaries clean

Follow these ownership rules:

- `$report-html` owns report layout, branding, and print-aware HTML/CSS
- `$report-pdf-print` owns final PDF printing from existing HTML
- project wrappers own only repository-specific defaults such as config path, logo path, and output naming

Do not duplicate the report renderer inside a repository wrapper.
Do not move report layout logic into `$report-pdf-print`.

## Standard Flows

### Markdown to HTML and PDF

1. Identify the source markdown and optional branding inputs
2. Generate HTML through `$report-html`
3. Print the generated HTML through `$report-pdf-print`
4. Verify both outputs

Conceptually:

```bash
node reports/report-html/scripts/render_html_report.cjs report.md --config report-config.json
node reports/report-pdf-print/scripts/print_to_pdf.cjs report.html --config report-config.json
```

### Repository Integration

When a repository wants its own command such as `render-status-report.cjs`, keep it thin:

1. Store repository branding and page settings in a local config JSON
2. Call the shared HTML renderer
3. If PDF is required, call the shared PDF printer on the generated HTML
4. Forward user overrides without re-implementing shared layout logic

The wrapper should be orchestration only.

### Design Refresh

If the user references a design source such as `slides.html`, a landing page, or a corporate template:

1. Read the design source first
2. Apply palette and branding changes in the shared report config or HTML renderer inputs
3. Reuse the same HTML plus PDF pipeline instead of forking a one-off implementation

## Verification

For end-to-end report tasks, verify:

- the generated `.html` exists
- the generated `.pdf` exists when requested
- the PDF page count and orientation are plausible
- wrappers still point to the shared skill paths

Prefer validating the lower-level skills independently if the pipeline behavior is unclear.

## When Not To Use This Skill

Do not use this skill when:

- the task is only "render this markdown as HTML" with no pipeline design question
- the task is only "print this HTML to PDF"
- the task is really about slide generation, presentation design, or `.pptx`

In those cases, call the focused skill directly.
