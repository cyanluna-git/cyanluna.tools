---
project: "sample-demo"
output: "output/sample-demo.pptx"
template: "sample-template.pptx"
font: "Segoe UI"
screenshots_dir: "screenshots/"
colors:
  primary: "#0F766E"
  accent: "#F59E0B"
  secondary: "#1E40AF"
  indigo: "#6366F1"
  coral: "#E11D48"
  success: "#059669"
  danger: "#DC2626"
  text: "#1E293B"
  text_light: "#64748B"
  gray_bg: "#F8FAFC"
  gray_light: "#E2E8F0"
---

# Sample Demo Presentation

## Slide 1: Cover
layout: cover
title: "Project Name"
subtitle: "Subtitle goes here"
badge: "Live — In Production"
date: "March 2026"
team: "Team Name"
stats:
  - value: "50+"
    label: "Active Users"
  - value: "30s"
    label: "Daily Input"
  - value: "12mo"
    label: "Forecast Range"
right_cards:
  - title: "Key Feature 1"
    desc: "Brief description of what this delivers."
    accent: primary
  - title: "Key Feature 2"
    desc: "Brief description of second value proposition."
    accent: accent

---

## Slide 2: Two Column — Background & Problem
layout: two_column
title: "Background & Problem Statement"
page_num: 2

left:
  subtitle: "Current Challenges"
  table:
    headers: ["Situation", "Current Method", "Impact"]
    rows:
      - ["Question A", "Manual Excel", "Half a day"]
      - ["Question B", "Ask each PM", "Several days"]
      - ["Question C", "SharePoint pivot", "Hours"]

right:
  subtitle: "Design Principles"
  table:
    headers: ["Aspect", "Before", "After"]
    rows:
      - ["Input", "8-10 clicks, 2-3 min", "2-3 clicks, 30 sec"]
      - ["Visibility", "Black hole", "Instant dashboard"]
  callout:
    text: "Easy to input, rich in output"
    bg: "#ECFDF5"
    color: "#065F46"

---

## Slide 3: Screenshot Right — Feature Overview
layout: screenshot_right
title: "System Overview — Key Features"
page_num: 3
screenshot: "dashboard.png"
screenshot_caption: "Live dashboard showing real-time metrics and team allocation."

left:
  subtitle: "Feature Highlights"
  table:
    headers: ["Feature", "Description"]
    rows:
      - ["Smart Defaults", "Auto-selects primary project & recent activities"]
      - ["One-click Copy", "Copy last week's entries for recurring tasks"]
      - ["AI Input", "Natural language: 'morning meeting, afternoon design'"]
  callout:
    text: "Input: 'meeting AM, design PM'\n-> AI: MEET/4h + DESIGN/4h"
    bg: "#ECFDF5"
    color: "#065F46"

---

## Slide 4: Two Column — Analytics & Forecasting
layout: two_column
title: "Management & Analytics"
page_num: 4

left:
  subtitle: "Personal Dashboard"
  screenshot: "dashboard.png"
  callout:
    text: "Login -> instant overview: allocation, plan vs. actual, overload alerts."

right:
  subtitle: "Resource Forecasting"
  table:
    headers: ["Name", "Apr", "May", "Jun", "Status"]
    rows:
      - ["A. Kim", "0.8", "0.8", "0.5", "Normal"]
      - ["B. Lee", "1.0", "1.0", "1.0", "Caution"]
      - ["C. Park", "0.6", "0.9", "1.2", "Alert"]
  callout:
    text: "Jun Gap: -0.7 FTE — hiring must start now."
    bg: "#FEF2F2"
    color: "#DC2626"

---

## Slide 5: Full Content — Value Proposition
layout: full_content
title: "Core Value for Decision Makers"
page_num: 5

content: |
  Before vs. After comparison with data-driven resource justification.

  Key metrics:
  - 80% faster report preparation
  - 6-month historical trend data
  - 95%+ cost classification accuracy

table:
  headers: ["", "Before", "After"]
  rows:
    - ["Resource Request", "We need more people", "Avg FTE 1.15, 12h OT/mo"]
    - ["Manager Response", "Everyone says busy", "Data is solid, start hiring"]
    - ["Data Prep", "Days of Excel cleanup", "Screen share, instant"]

---

## Slide 6: Section Divider
layout: section_divider
title: "Next Steps"
subtitle: "Rollout plan and support"

---

## Slide 7: Closing — Roadmap & Proposal
layout: closing
title: "Roadmap & Next Steps"
page_num: 7

content: |
  Phase 1 (Complete): Core features live
  Phase 2 (3-6 months): Team dashboard, alerts, mobile
  Phase 3 (6-12 months): Simulation, analytics, integration

  Contact: team@company.com
  Demo: demo.company.com

footer_text: "Access: system-url | Demo: guest@company.com | Contact: Team Name"
