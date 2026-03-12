# Config Format

Use `--config /path/to/report-config.json` to keep project-specific branding outside the shared renderer.

## Supported shape

```json
{
  "branding": {
    "logoPath": "/abs/path/logo.png",
    "departmentName": "Engineering Systems Team",
    "brandName": "Quarterly Program Report",
    "docType": "Management Brief",
    "footerLabel": "Quarterly Program Report"
  },
  "page": {
    "format": "A4",
    "landscape": true,
    "marginTop": "10mm",
    "marginRight": "10mm",
    "marginBottom": "12mm",
    "marginLeft": "10mm"
  },
  "theme": {
    "primary": "#054E5A",
    "primaryLight": "#0A6E7E",
    "gold": "#E1B77E",
    "navyDark": "#06315B",
    "pageBgStart": "#eef3f5",
    "pageBgEnd": "#e6ecef"
  },
  "text": {
    "preparedLabel": "Prepared as a printable HTML/PDF report"
  }
}
```

## Rules

- All paths should be absolute when possible.
- Keep repository-specific values in this file, not in the shared skill renderer.
- Use `branding` for logo and cover labels.
- Use `page` for PDF paper size, orientation, and margins.
- Use `theme` for palette and visual tokens.
- Use `text` only when the built-in locale copy needs to be overridden.

## Override order

1. Shared renderer defaults
2. `--config` JSON
3. Explicit CLI flags such as `--logo` and `--brand`

This keeps the renderer reusable while still allowing project wrappers to enforce local branding.
