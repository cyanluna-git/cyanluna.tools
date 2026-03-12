# Print Options

## Common usage

```bash
node scripts/print_to_pdf.cjs report.html
node scripts/print_to_pdf.cjs report.html --landscape
node scripts/print_to_pdf.cjs report.html --config report-config.json
```

## Shared config reuse

If a repository already has a report config for `$report-html`, reuse the same file here.

Relevant config keys:

```json
{
  "branding": {
    "footerLabel": "Project Report"
  },
  "page": {
    "format": "A4",
    "landscape": true,
    "marginTop": "10mm",
    "marginRight": "10mm",
    "marginBottom": "12mm",
    "marginLeft": "10mm"
  }
}
```

## Override order

1. Built-in defaults
2. `--config`
3. Explicit CLI flags such as `--landscape` and `--footer`

## Responsibility boundary

If the PDF looks wrong because sections overflow or cards are too dense, fix the HTML source in `$report-html`.

Use `$report-pdf-print` only to control:
- paper size
- orientation
- margins
- footer label
