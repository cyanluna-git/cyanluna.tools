#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEFAULT_PAGE = {
  format: "A4",
  landscape: false,
  marginTop: "12mm",
  marginRight: "12mm",
  marginBottom: "16mm",
  marginLeft: "12mm",
};

function getAncestorDirs(startPath) {
  const dirs = [];
  let current = path.resolve(startPath);

  while (true) {
    dirs.push(current);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }

  return dirs;
}

function resolvePlaywright(searchRoots = []) {
  const localCandidates = searchRoots.flatMap((root) => [
    path.join(root, "node_modules/playwright"),
    path.join(root, "e2e/node_modules/playwright"),
  ]);

  const moduleCandidates = [
    process.env.PLAYWRIGHT_MODULE_PATH,
    ...localCandidates,
    path.join(process.cwd(), "node_modules/playwright"),
    path.join(process.cwd(), "e2e/node_modules/playwright"),
    "playwright",
  ].filter(Boolean);

  for (const candidate of moduleCandidates) {
    try {
      return require(candidate);
    } catch {}
  }

  throw new Error(
    "Unable to resolve Playwright. Set PLAYWRIGHT_MODULE_PATH or run this where playwright is installed."
  );
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
  const page = mergeDefined(DEFAULT_PAGE, config.page || {});

  return {
    inputPath: args.inputPath,
    outputBase: args.outputBase,
    footerLabel: args.footerLabel ?? branding.footerLabel ?? "",
    page: {
      ...page,
      format: args.pageFormat ?? page.format,
      landscape: args.landscape ?? page.landscape,
    },
  };
}

function isUrl(value) {
  return /^(https?:|file:)/i.test(value);
}

function toPageUrl(inputPath) {
  if (isUrl(inputPath)) return inputPath;
  return `file://${path.resolve(inputPath)}`;
}

function inferOutputBase(inputPath, explicitOutputBase) {
  if (explicitOutputBase) return path.resolve(explicitOutputBase);

  if (isUrl(inputPath)) {
    return path.resolve(process.cwd(), "printed-page");
  }

  const absoluteInput = path.resolve(inputPath);
  if (absoluteInput.toLowerCase().endsWith(".html")) {
    return absoluteInput.slice(0, -5);
  }
  return absoluteInput;
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  if (!parsedArgs.inputPath) {
    console.error("Usage: print_to_pdf.cjs <input-html-or-url> [--config path] [--output-base path] [--footer text] [--page-format A4] [--landscape|--portrait]");
    process.exit(1);
  }

  const args = resolveOptions(parsedArgs);
  const outputBase = inferOutputBase(args.inputPath, args.outputBase);
  const pdfPath = outputBase.toLowerCase().endsWith(".pdf") ? outputBase : `${outputBase}.pdf`;
  const pageUrl = toPageUrl(args.inputPath);
  const searchRoots = isUrl(args.inputPath) ? [process.cwd()] : getAncestorDirs(path.dirname(path.resolve(args.inputPath)));
  const { chromium } = resolvePlaywright(searchRoots);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(pageUrl, { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.evaluate(() => document.fonts.ready);

  fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
  await page.pdf({
    path: pdfPath,
    format: args.page.format,
    landscape: Boolean(args.page.landscape),
    printBackground: true,
    margin: {
      top: args.page.marginTop,
      right: args.page.marginRight,
      bottom: args.page.marginBottom,
      left: args.page.marginLeft,
    },
    displayHeaderFooter: true,
    headerTemplate: "<div></div>",
    footerTemplate: `
      <div style="width:100%; font-size:9px; color:#7f8b96; padding:0 12mm; display:flex; justify-content:space-between; align-items:center;">
        <span>${args.footerLabel}</span>
        <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();
  console.log(`PDF: ${pdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
