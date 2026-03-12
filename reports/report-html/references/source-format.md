# Source Format

## Expected shape

The renderer works best when the markdown has:

```md
# Report Title

**Date:** March 12, 2026
**Purpose:** Alignment document for PM discussion
**Audience:** Project Manager, stakeholders

## 1. Purpose of This Document
Paragraphs...

## 2. Current Project Status

### Current execution snapshot
- Kanban status: **90 done**, **1 in implementation review**, **21 in todo**

### Core capabilities already in place
- Capability A
- Capability B
```

## Section heuristics

The renderer recognizes a few status-report patterns to build summary pages:

- Purpose / Document Purpose
- Current Project Status
- Pilot Objective / Pilot Goal
- Proposed Roadmap
- PM role / reporting sections
- Key Alignment Message

The exact headings can be Korean or English. Number prefixes such as `## 2. Current Project Status` are safe.

## Normalization tips

If the input is messy:
- convert the title to one `#` heading
- move date/purpose/audience into bold metadata lines
- keep major sections at `##`
- keep subtopics at `###`
- convert comparable items into bullet lists

## Limits

This renderer is tuned for management reports, not arbitrary long-form books or research papers.

If the markdown is deeply nested or uses tables heavily:
- simplify the structure first, or
- adjust the renderer before generating the final PDF
