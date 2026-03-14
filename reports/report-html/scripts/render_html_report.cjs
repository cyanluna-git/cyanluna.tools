#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const DEFAULT_THEME = {
  primary: "#054E5A",
  primaryLight: "#0A6E7E",
  gray: "#A1A9B4",
  grayLight: "#DFE4E7",
  grayBg: "#F4F6F8",
  gold: "#E1B77E",
  goldDark: "#C89B5E",
  sage: "#5D7875",
  navy: "#123F6D",
  navyDark: "#06315B",
  coral: "#F68363",
  white: "#FFFFFF",
  text: "#2C3E50",
  textLight: "#5A6A7A",
  success: "#27AE60",
  danger: "#E74C3C",
  warning: "#F39C12",
  shadow: "0 22px 54px rgba(6, 49, 91, 0.10)",
  pageGlow: "rgba(10, 110, 126, 0.15)",
  pageBgStart: "#eef3f5",
  pageBgEnd: "#e6ecef",
  coverDark: "#043A44",
  coverGlow: "rgba(225,183,126,0.18)",
  coverPanelEnd: "#edf2f5",
  coverGridDot: "rgba(161,169,180,0.28)",
  coverSummaryShadow: "rgba(18, 63, 109, 0.08)",
  logoShadow: "rgba(0,0,0,0.12)",
};
const DEFAULT_PAGE = {
  format: "A4",
  landscape: false,
  marginTop: "12mm",
  marginRight: "12mm",
  marginBottom: "16mm",
  marginLeft: "12mm",
};

const LOCALES = {
  ko: {
    lang: "ko",
    metaLabels: {
      date: ["작성일"],
      purpose: ["목적"],
      audience: ["대상"],
    },
    sections: {},
    subsections: {},
    text: {
      docType: "Report",
      brand: "Project Report",
      departmentLabel: "Department",
      contentsTitle: "목차",
      contentsNote: "",
      sectionKicker: "Section",
      contentsKicker: "Contents",
      overviewKicker: "Overview",
      dateLabel: "작성일",
      purposeLabel: "목적",
      audienceLabel: "대상",
      sourceLabel: "Source",
      preparedLabel: "Prepared as a printable HTML/PDF report",
      footerLabel: "Project Report",
    },
  },
  en: {
    lang: "en",
    metaLabels: {
      date: ["Date"],
      purpose: ["Purpose"],
      audience: ["Audience"],
    },
    sections: {},
    subsections: {},
    text: {
      docType: "Report",
      brand: "Project Report",
      departmentLabel: "Department",
      contentsTitle: "Table of Contents",
      contentsNote: "",
      sectionKicker: "Section",
      contentsKicker: "Contents",
      overviewKicker: "Overview",
      dateLabel: "Date",
      purposeLabel: "Purpose",
      audienceLabel: "Audience",
      sourceLabel: "Source",
      preparedLabel: "Prepared as a printable HTML/PDF report",
      footerLabel: "Project Report",
    },
  },
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatInline(markdown) {
  let html = escapeHtml(markdown.trim());
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  return html;
}

function splitBlocks(lines) {
  const blocks = [];
  let current = [];

  const flush = () => {
    if (current.length) {
      blocks.push(current);
      current = [];
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      flush();
      continue;
    }
    current.push(line);
  }

  flush();
  return blocks;
}

function renderListBlock(lines) {
  let html = "";
  const stack = [];
  let openItem = false;

  const closeOneLevel = () => {
    if (openItem) {
      html += "</li>";
      openItem = false;
    }
    html += "</ul>";
    stack.pop();
  };

  for (const rawLine of lines) {
    const match = rawLine.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
    if (!match) {
      if (openItem) {
        html += `<div class="list-continuation">${formatInline(rawLine.trim())}</div>`;
      }
      continue;
    }

    const indent = match[1].replace(/\t/g, "    ").length;
    const text = match[3];

    while (stack.length && indent < stack[stack.length - 1]) {
      closeOneLevel();
    }

    if (!stack.length || indent > stack[stack.length - 1]) {
      html += '<ul class="report-list">';
      stack.push(indent);
      openItem = false;
    } else if (openItem) {
      html += "</li>";
    }

    html += `<li>${formatInline(text)}`;
    openItem = true;
  }

  while (stack.length) {
    closeOneLevel();
  }

  return html;
}

function renderBlocks(lines) {
  return splitBlocks(lines)
    .map((block) => {
      if (block.every((line) => /^(\s*)([-*]|\d+\.)\s+/.test(line))) {
        return renderListBlock(block);
      }
      return `<p>${block.map((line) => formatInline(line)).join(" ")}</p>`;
    })
    .join("\n");
}

function parseMarkdown(markdown) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const document = {
    title: "",
    meta: [],
    intro: [],
    sections: [],
  };

  let currentSection = null;
  let currentSubsection = null;

  function ensureSection(title) {
    currentSection = { title, content: [], subsections: [] };
    document.sections.push(currentSection);
    currentSubsection = null;
  }

  function ensureSubsection(title) {
    if (!currentSection) {
      ensureSection("Overview");
    }
    currentSubsection = { title, content: [] };
    currentSection.subsections.push(currentSubsection);
  }

  for (const line of lines) {
    const h1 = line.match(/^#\s+(.+)$/);
    if (h1) {
      document.title = h1[1].trim();
      continue;
    }

    const meta = line.match(/^\*\*(.+?):\*\*\s+(.+)$/);
    if (!currentSection && meta) {
      document.meta.push({ label: meta[1].trim(), value: meta[2].trim() });
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      ensureSection(h2[1].trim());
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      ensureSubsection(h3[1].trim());
      continue;
    }

    const h4 = line.match(/^####\s+(.+)$/);
    if (h4) {
      ensureSubsection(h4[1].trim());
      continue;
    }

    if (!currentSection) {
      document.intro.push(line);
    } else if (currentSubsection) {
      currentSubsection.content.push(line);
    } else {
      currentSection.content.push(line);
    }
  }

  return document;
}

function normalizeTitle(value) {
  return value
    .toLowerCase()
    .replace(/^\d+\.\s*/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLocale(document, sourcePath) {
  const labels = new Set(document.meta.map((item) => item.label));
  if (labels.has("Date") || /-en\.md$/i.test(sourcePath)) {
    return LOCALES.en;
  }
  return LOCALES.ko;
}

function loadJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function mergeDefined(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override || {})) {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

function parseArgs(argv) {
  const args = {
    inputPath: "",
    outputBase: undefined,
    configPath: undefined,
    logoPath: undefined,
    departmentName: undefined,
    brandName: undefined,
    docType: undefined,
    footerLabel: undefined,
    pageFormat: undefined,
    landscape: undefined,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--") && !args.inputPath) {
      args.inputPath = arg;
      continue;
    }

    if (arg === "--output-base") {
      args.outputBase = argv[++i] ?? "";
      continue;
    }

    if (arg === "--config") {
      args.configPath = argv[++i] ?? "";
      continue;
    }

    if (arg === "--logo") {
      args.logoPath = argv[++i] ?? "";
      continue;
    }

    if (arg === "--department") {
      args.departmentName = argv[++i] ?? "";
      continue;
    }

    if (arg === "--brand") {
      args.brandName = argv[++i] ?? "";
      continue;
    }

    if (arg === "--doc-type") {
      args.docType = argv[++i] ?? "";
      continue;
    }

    if (arg === "--footer") {
      args.footerLabel = argv[++i] ?? "";
      continue;
    }

    if (arg === "--page-format") {
      args.pageFormat = argv[++i] ?? "";
      continue;
    }

    if (arg === "--landscape") {
      args.landscape = true;
      continue;
    }

    if (arg === "--portrait") {
      args.landscape = false;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function resolveOptions(args) {
  const config = args.configPath ? loadJson(path.resolve(args.configPath)) : {};
  const branding = config.branding || {};
  const texts = config.text || {};
  const theme = mergeDefined(DEFAULT_THEME, config.theme || {});
  const page = mergeDefined(DEFAULT_PAGE, config.page || {});

  return {
    inputPath: args.inputPath,
    outputBase: args.outputBase,
    logoPath: args.logoPath ?? branding.logoPath ?? "",
    departmentName: args.departmentName ?? branding.departmentName ?? "",
    brandName: args.brandName ?? branding.brandName ?? "",
    docType: args.docType ?? branding.docType ?? "",
    footerLabel: args.footerLabel ?? branding.footerLabel ?? "",
    text: texts,
    theme,
    page: {
      ...page,
      format: args.pageFormat ?? page.format,
      landscape: args.landscape ?? page.landscape,
    },
  };
}

function getMetaAny(document, labels) {
  const normalizedLabels = labels.map((label) => normalizeTitle(label));
  return (
    document.meta.find((item) => normalizedLabels.includes(normalizeTitle(item.label)))?.value ?? ""
  );
}

function extractParagraphSummary(lines) {
  return splitBlocks(lines)
    .filter((block) => !block.every((line) => /^(\s*)([-*]|\d+\.)\s+/.test(line)))
    .slice(0, 2)
    .flat();
}

function buildToc(document) {
  return document.sections
    .map(
      (section, index) => `
        <li>
          <span class="toc-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="toc-title">${escapeHtml(section.title)}</span>
        </li>
      `
    )
    .join("");
}

function buildSectionCards(section, text) {
  const contentHtml = renderBlocks(section.content);
  const subsectionsHtml = section.subsections
    .map(
      (subsection) => `
        <article class="subcard">
          <h3>${escapeHtml(subsection.title)}</h3>
          ${renderBlocks(subsection.content)}
        </article>
      `
    )
    .join("");

  return `
    <section class="report-section">
      <div class="section-heading">
        <div class="section-kicker">${text.sectionKicker}</div>
        <h2>${escapeHtml(section.title)}</h2>
      </div>
      ${contentHtml ? `<div class="section-body">${contentHtml}</div>` : ""}
      ${subsectionsHtml ? `<div class="subcard-grid">${subsectionsHtml}</div>` : ""}
    </section>
  `;
}

function buildThemeCss(theme) {
  return [
    `--primary: ${escapeHtml(theme.primary)};`,
    `--primary-l: ${escapeHtml(theme.primaryLight)};`,
    `--gray: ${escapeHtml(theme.gray)};`,
    `--gray-light: ${escapeHtml(theme.grayLight)};`,
    `--gray-bg: ${escapeHtml(theme.grayBg)};`,
    `--gold: ${escapeHtml(theme.gold)};`,
    `--gold-dark: ${escapeHtml(theme.goldDark)};`,
    `--sage: ${escapeHtml(theme.sage)};`,
    `--navy: ${escapeHtml(theme.navy)};`,
    `--navy-dark: ${escapeHtml(theme.navyDark)};`,
    `--coral: ${escapeHtml(theme.coral)};`,
    `--white: ${escapeHtml(theme.white)};`,
    `--text: ${escapeHtml(theme.text)};`,
    `--text-light: ${escapeHtml(theme.textLight)};`,
    `--success: ${escapeHtml(theme.success)};`,
    `--danger: ${escapeHtml(theme.danger)};`,
    `--warning: ${escapeHtml(theme.warning)};`,
    `--shadow: ${escapeHtml(theme.shadow)};`,
    `--page-glow: ${escapeHtml(theme.pageGlow)};`,
    `--page-bg-start: ${escapeHtml(theme.pageBgStart)};`,
    `--page-bg-end: ${escapeHtml(theme.pageBgEnd)};`,
    `--cover-dark: ${escapeHtml(theme.coverDark)};`,
    `--cover-glow: ${escapeHtml(theme.coverGlow)};`,
    `--cover-panel-end: ${escapeHtml(theme.coverPanelEnd)};`,
    `--cover-grid-dot: ${escapeHtml(theme.coverGridDot)};`,
    `--cover-summary-shadow: ${escapeHtml(theme.coverSummaryShadow)};`,
    `--logo-shadow: ${escapeHtml(theme.logoShadow)};`,
  ].join("\n        ");
}

function buildHtml(document, sourcePath, options) {
  const locale = detectLocale(document, sourcePath);
  const text = mergeDefined(locale.text, options.text || {});
  const themeCss = buildThemeCss(options.theme || DEFAULT_THEME);
  const isLandscape = Boolean(options.page?.landscape);
  const logoSrc = options.logoPath && fs.existsSync(options.logoPath) ? pathToFileURL(options.logoPath).href : "";
  const brandName = options.brandName || text.brand;
  const docType = options.docType || text.docType;
  const departmentName = options.departmentName || "";
  const purpose = getMetaAny(document, locale.metaLabels.purpose);
  const audience = getMetaAny(document, locale.metaLabels.audience);
  const writtenAt = getMetaAny(document, locale.metaLabels.date);
  const introHtml = renderBlocks(extractParagraphSummary(document.intro));

  return `<!doctype html>
<html lang="${locale.lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(document.title)}</title>
    <style>
      :root {
        ${themeCss}
      }

      * { box-sizing: border-box; }

      html, body {
        margin: 0;
        padding: 0;
        background:
          radial-gradient(circle at top left, var(--page-glow), transparent 24rem),
          linear-gradient(180deg, var(--page-bg-start) 0%, var(--page-bg-end) 100%);
        color: var(--text);
        font-family: "Segoe UI", "Noto Sans KR", "Pretendard", system-ui, -apple-system, sans-serif;
      }

      body {
        padding: 32px;
      }

      .report-shell {
        max-width: 1080px;
        margin: 0 auto;
      }

      body.page-landscape .report-shell {
        max-width: 1460px;
      }

      .page {
        position: relative;
        background: var(--white);
        border-radius: 24px;
        box-shadow: var(--shadow);
        margin-bottom: 28px;
        overflow: hidden;
      }

      .page::before {
        content: "";
        position: absolute;
        inset: 0 0 auto 0;
        height: 8px;
        background: linear-gradient(90deg, var(--primary) 0%, var(--primary-l) 45%, var(--gold) 100%);
      }

      .page-inner {
        padding: 42px 44px 40px;
      }

      body.page-landscape .page-inner {
        padding: 30px 34px 28px;
      }

      .cover {
        background: linear-gradient(180deg, var(--white) 0%, #fbfcfd 100%);
      }

      .cover-hero {
        display: grid;
        grid-template-columns: 0.95fr 1.05fr;
        min-height: 460px;
      }

      body.page-landscape .cover-hero {
        grid-template-columns: 0.82fr 1.18fr;
        min-height: 330px;
      }

      .cover-left {
        position: relative;
        padding: 52px 42px 44px;
        background: linear-gradient(180deg, var(--cover-dark) 0%, var(--primary) 46%, var(--primary-l) 100%);
        color: var(--white);
      }

      body.page-landscape .cover-left,
      body.page-landscape .cover-right {
        padding: 32px 30px 28px;
      }

      .cover-left::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 6px;
        background: linear-gradient(180deg, var(--gold) 0%, rgba(225,183,126,0) 65%);
      }

      .cover-left::after {
        content: "";
        position: absolute;
        right: -120px;
        bottom: -120px;
        width: 320px;
        height: 320px;
        border-radius: 50%;
        border: 1px solid rgba(225,183,126,0.12);
      }

      .brand {
        color: var(--gold);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.24em;
        text-transform: uppercase;
      }

      .brand-lockup {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        margin-bottom: 18px;
      }

      .brand-logo {
        width: 190px;
        height: auto;
        display: block;
        filter: drop-shadow(0 6px 12px var(--logo-shadow));
      }

      .brand-copy {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-top: 8px;
      }

      .doc-type {
        display: inline-flex;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.12);
        border: 1px solid rgba(255,255,255,0.18);
        color: rgba(255,255,255,0.88);
        font-size: 12px;
        font-weight: 600;
      }

      .department-line {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255,255,255,0.82);
        font-size: 13px;
        font-weight: 600;
        line-height: 1.5;
      }

      .department-line strong {
        color: var(--white);
        font-weight: 700;
      }

      .cover-left h1 {
        margin: 44px 0 18px;
        font-size: 42px;
        line-height: 1.12;
        letter-spacing: -0.04em;
      }

      body.page-landscape .cover-left h1 {
        margin: 26px 0 12px;
        font-size: 34px;
      }

      .cover-intro p {
        margin: 0 0 12px;
        color: rgba(255,255,255,0.78);
        font-size: 16px;
        line-height: 1.72;
      }

      body.page-landscape .cover-intro p {
        font-size: 14px;
        line-height: 1.58;
      }

      .cover-divider {
        width: 70px;
        height: 4px;
        margin: 18px 0 22px;
        border-radius: 999px;
        background: var(--gold);
      }

      body.page-landscape .cover-divider {
        margin: 12px 0 16px;
      }

      .cover-left-footer {
        position: absolute;
        left: 42px;
        bottom: 38px;
        color: rgba(255,255,255,0.52);
        font-size: 13px;
        line-height: 1.5;
      }

      body.page-landscape .cover-left-footer {
        left: 30px;
        bottom: 22px;
        font-size: 12px;
      }

      .cover-right {
        position: relative;
        padding: 52px 44px 40px;
        background:
          radial-gradient(circle at top right, var(--cover-glow), transparent 18rem),
          linear-gradient(180deg, var(--gray-bg) 0%, var(--cover-panel-end) 100%);
      }

      .cover-right::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: radial-gradient(var(--cover-grid-dot) 1px, transparent 1px);
        background-size: 22px 22px;
        opacity: 0.26;
        pointer-events: none;
      }

      .cover-panel {
        position: relative;
        z-index: 1;
      }

      .section-tag {
        color: var(--gray);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 20px;
      }

      .cover-summary {
        background: rgba(255,255,255,0.92);
        border-radius: 16px;
        border-left: 4px solid var(--gold);
        padding: 20px 22px;
        box-shadow: 0 10px 28px var(--cover-summary-shadow);
      }

      body.page-landscape .cover-summary {
        padding: 16px 18px;
      }

      .cover-summary p {
        margin: 0 0 12px;
        font-size: 15px;
        line-height: 1.72;
        color: var(--text);
      }

      body.page-landscape .cover-summary p {
        font-size: 13px;
        line-height: 1.56;
      }

      .cover-summary p:last-child {
        margin-bottom: 0;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        padding: 24px 44px 40px;
        background: var(--white);
      }

      body.page-landscape .meta-grid {
        gap: 12px;
        padding: 18px 34px 26px;
      }

      .meta-card,
      .subcard {
        background: var(--white);
        border-radius: 14px;
        border: 1px solid var(--gray-light);
      }

      .meta-card {
        padding: 18px 18px 20px;
      }

      body.page-landscape .meta-card {
        padding: 14px 14px 15px;
      }

      .meta-card:nth-child(1) { border-top: 4px solid var(--primary); }
      .meta-card:nth-child(2) { border-top: 4px solid var(--gold); }
      .meta-card:nth-child(3) { border-top: 4px solid var(--sage); }

      .meta-label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--gray);
        margin-bottom: 10px;
      }

      .meta-value {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.45;
        color: var(--navy-dark);
      }

      .page-header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        margin-bottom: 24px;
      }

      body.page-landscape .page-header {
        margin-bottom: 18px;
      }

      .page-kicker {
        color: var(--primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        margin-bottom: 8px;
      }

      .page-title {
        margin: 0;
        color: var(--navy-dark);
        font-size: 34px;
        line-height: 1.18;
        letter-spacing: -0.03em;
      }

      body.page-landscape .page-title {
        font-size: 28px;
      }

      .page-title-bar {
        width: 82px;
        height: 4px;
        border-radius: 999px;
        background: var(--gold);
        margin-top: 10px;
      }

      .page-note {
        max-width: 320px;
        color: var(--text-light);
        font-size: 15px;
        line-height: 1.66;
      }

      body.page-landscape .page-note {
        max-width: 380px;
        font-size: 13px;
        line-height: 1.5;
      }

      .toc {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px 28px;
      }

      body.page-landscape .toc {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px 22px;
      }

      .toc li {
        display: flex;
        align-items: baseline;
        gap: 14px;
        padding: 12px 0;
        border-bottom: 1px solid var(--gray-light);
      }

      body.page-landscape .toc li {
        padding: 8px 0;
      }

      .toc-index {
        min-width: 28px;
        color: var(--coral);
        font-size: 13px;
        font-weight: 800;
      }

      .toc-title {
        color: var(--text);
        font-size: 17px;
        line-height: 1.48;
      }

      body.page-landscape .toc-title {
        font-size: 14px;
        line-height: 1.34;
      }

      .section-heading {
        margin-bottom: 18px;
      }

      .section-kicker {
        display: inline-flex;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(5, 78, 90, 0.08);
        color: var(--primary);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }

      .report-section h2 {
        margin: 14px 0 0;
        color: var(--navy-dark);
        font-size: 28px;
        line-height: 1.2;
        letter-spacing: -0.03em;
      }

      body.page-landscape .report-section h2 {
        font-size: 24px;
      }

      .section-body p,
      .subcard p {
        margin: 0 0 14px;
        color: var(--text);
        font-size: 15px;
        line-height: 1.76;
      }

      body.page-landscape .section-body p,
      body.page-landscape .subcard p {
        margin: 0 0 10px;
        font-size: 13px;
        line-height: 1.5;
      }

      .report-list {
        margin: 0;
        padding-left: 20px;
      }

      .report-list > li {
        margin: 0 0 10px;
        color: var(--text);
        font-size: 15px;
        line-height: 1.7;
      }

      body.page-landscape .report-list > li {
        margin: 0 0 7px;
        font-size: 13px;
        line-height: 1.46;
      }

      .report-list > li::marker {
        color: var(--primary);
      }

      .list-continuation {
        margin-top: 8px;
        color: var(--text-light);
      }

      .subcard-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
        margin-top: 18px;
      }

      .subcard {
        padding: 22px;
      }

      body.page-landscape .subcard {
        padding: 16px;
      }

      .subcard h3 {
        margin: 0 0 12px;
        color: var(--navy-dark);
        font-size: 18px;
        letter-spacing: -0.02em;
      }

      body.page-landscape .subcard h3 {
        margin: 0 0 10px;
        font-size: 16px;
      }

      .source {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        padding: 16px 44px 28px;
        border-top: 1px solid var(--gray-light);
        color: var(--gray);
        font-size: 12px;
        font-weight: 600;
      }

      code {
        background: rgba(18, 63, 109, 0.08);
        border-radius: 6px;
        padding: 2px 6px;
        font-size: 0.92em;
      }

      strong {
        color: var(--navy-dark);
      }

      @media print {
        @page {
          size: ${options.page?.format || "A4"} ${isLandscape ? "landscape" : "portrait"};
          margin: 0;
        }

        body {
          padding: 0;
          background: #ffffff;
        }

        .report-shell {
          max-width: none;
        }

        body.page-landscape .report-shell {
          max-width: none;
        }

        .page {
          border-radius: 0;
          box-shadow: none;
          margin: 0;
          page-break-after: always;
          break-after: page;
        }

        .page:last-child {
          page-break-after: auto;
          break-after: auto;
        }
      }
    </style>
  </head>
  <body class="${isLandscape ? "page-landscape" : "page-portrait"}">
    <main class="report-shell">
      <section class="page cover">
        <div class="cover-hero">
          <div class="cover-left">
            <div class="brand-lockup">
              ${logoSrc ? `<img class="brand-logo" src="${logoSrc}" alt="Brand logo" />` : ""}
              <div class="brand-copy">
                <div class="brand">${brandName}</div>
                <div class="doc-type">${docType}</div>
                ${
                  departmentName
                    ? `<div class="department-line">
                         <span>${text.departmentLabel}</span>
                         <strong>${escapeHtml(departmentName)}</strong>
                       </div>`
                    : ""
                }
              </div>
            </div>
            <h1>${escapeHtml(document.title)}</h1>
            <div class="cover-divider"></div>
            <div class="cover-intro">${introHtml}</div>
            <div class="cover-left-footer">
              <div>${text.preparedLabel}</div>
              <div>${escapeHtml(path.basename(sourcePath))}</div>
            </div>
          </div>
          <div class="cover-right">
            <div class="cover-panel">
              <div class="section-tag">${text.overviewKicker}</div>
              <div class="cover-summary">${introHtml}</div>
            </div>
          </div>
        </div>
        <div class="meta-grid">
          <div class="meta-card">
            <div class="meta-label">${text.dateLabel}</div>
            <div class="meta-value">${formatInline(writtenAt)}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">${text.purposeLabel}</div>
            <div class="meta-value">${formatInline(purpose)}</div>
          </div>
          <div class="meta-card">
            <div class="meta-label">${text.audienceLabel}</div>
            <div class="meta-value">${formatInline(audience)}</div>
          </div>
        </div>
        <div class="source">
          <div>${text.sourceLabel}: ${escapeHtml(path.basename(sourcePath))}</div>
          <div>${text.preparedLabel}</div>
        </div>
      </section>

      <section class="page">
        <div class="page-inner">
          <div class="page-header">
            <div>
              <div class="page-kicker">${text.contentsKicker}</div>
              <h2 class="page-title">${text.contentsTitle}</h2>
              <div class="page-title-bar"></div>
            </div>
            <div class="page-note">${text.contentsNote}</div>
          </div>
          <ul class="toc">${buildToc(document)}</ul>
        </div>
      </section>

      ${document.sections
        .map(
          (section) => `
            <section class="page">
              <div class="page-inner">${buildSectionCards(section, text)}</div>
            </section>
          `
        )
        .join("\n")}
    </main>
  </body>
</html>`;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  if (!parsedArgs.inputPath) {
    console.error("Usage: render_html_report.cjs <input-markdown-path> [--config path] [--output-base path] [--logo path] [--department text] [--brand text] [--doc-type text] [--footer text] [--page-format A4] [--landscape|--portrait]");
    process.exit(1);
  }

  const args = resolveOptions(parsedArgs);
  const absoluteInput = path.resolve(args.inputPath);
  const markdown = fs.readFileSync(absoluteInput, "utf8");
  const document = parseMarkdown(markdown);
  const outputBase = args.outputBase ? path.resolve(args.outputBase) : absoluteInput.replace(/\.md$/i, "");
  const htmlPath = outputBase.toLowerCase().endsWith(".html") ? outputBase : `${outputBase}.html`;
  const html = buildHtml(document, absoluteInput, args);

  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, html, "utf8");

  console.log(`HTML: ${htmlPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
