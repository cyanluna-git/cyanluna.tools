# Branding Notes

## Default visual direction

The bundled renderer uses a management-report layout with:
- dark teal cover panel
- light gray content pages
- gold accent bars
- navy headings
- rounded cards and section summaries

Default palette:

- `--primary: #054E5A`
- `--primary-l: #0A6E7E`
- `--gray-bg: #F4F6F8`
- `--gold: #E1B77E`
- `--gold-dark: #C89B5E`
- `--sage: #5D7875`
- `--navy: #123F6D`
- `--navy-dark: #06315B`
- `--coral: #F68363`

## What to customize first

When adapting the skill for another team or company, change in this order:

1. Logo via `--logo`
2. Department name via `--department`
3. Brand title via `--brand`
4. Document chip text via `--doc-type`
5. Footer label via `--footer`
6. CSS color tokens inside `scripts/render_html_report.cjs`

## When to inspect external design files

If the user references files like:
- `slides.html`
- a company landing page
- a Figma export
- an existing PPT template

Open the source and reuse:
- palette
- typography direction
- cover composition
- spacing rhythm

Do not blindly overwrite the parser. Usually only the CSS token block and a few structural classes need to change.

Treat the default palette as a neutral starter, not as a house brand requirement.
