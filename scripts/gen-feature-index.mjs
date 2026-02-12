#!/usr/bin/env node

/**
 * gen-feature-index.mjs
 *
 * Auto-generates docs/generated/feature-index.md by scanning feature spec headers and
 * deriving implementation progress from PRD.md checklist items.
 *
 * Usage: node scripts/gen-feature-index.mjs
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const FEATURES_DIR = join(ROOT, "docs", "product-specs", "features");
const INDEX_PATH = join(ROOT, "docs", "generated", "feature-index.md");
const PRD_PATH = join(ROOT, "PRD.md");

const CHECKLIST_REGEX = /^- \[(x|~| )\]\s+(.+)$/;
const SPEC_LINK_REGEX = /\[spec\]\((docs\/product-specs\/features\/[^)]+)\)/gi;

function normalizeIsoDate(raw) {
  const value = String(raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function maxIsoDate(values) {
  const dates = values.map(normalizeIsoDate).filter(Boolean);
  if (dates.length === 0) return null;
  return dates.reduce((max, current) => (current > max ? current : max), dates[0]);
}

function normalizeStatus(raw) {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("draft")) return "draft";
  if (value.startsWith("review")) return "review";
  if (value.startsWith("final")) return "final";
  return "unknown";
}

function extractHeader(content) {
  const lines = content.split("\n");
  const title = (lines[0] || "").replace(/^#\s+/, "").trim();

  let status = "unknown";
  let owner = "unknown";
  let lastUpdated = "unknown";
  let prdRef = "—";

  for (const line of lines.slice(0, 24)) {
    const statusMatch = line.match(/\*\*Status:\*\*\s*(.+)/i);
    if (statusMatch) status = normalizeStatus(statusMatch[1]);

    const ownerMatch = line.match(/\*\*Owner:\*\*\s*(.+)/i);
    if (ownerMatch) owner = ownerMatch[1].trim();

    const dateMatch = line.match(/\*\*Last updated:\*\*\s*(.+)/i);
    if (dateMatch) lastUpdated = dateMatch[1].trim();

    const prdRefMatch = line.match(/\*\*PRD Ref:\*\*\s*(.+)/i);
    if (prdRefMatch) prdRef = prdRefMatch[1].trim();
  }

  return { title, status, owner, lastUpdated, prdRef };
}

function extractPrdLastUpdated(content) {
  const match = content.match(/^> \*\*Last updated:\*\*\s*(.+)\s*$/im);
  return match ? normalizeIsoDate(match[1]) : null;
}

function parsePrdChecklist(content) {
  const bySpec = new Map();
  const summary = {
    total: 0,
    shipped: 0,
    partial: 0,
    notStarted: 0,
  };

  const lines = content.split("\n");
  for (const line of lines) {
    const normalizedLine = line.trimEnd();
    const match = normalizedLine.match(CHECKLIST_REGEX);
    if (!match) continue;

    const marker = match[1];
    const itemText = match[2].trim();

    let state = "not_started";
    if (marker === "x") state = "shipped";
    if (marker === "~") state = "partial";

    summary.total += 1;
    if (state === "shipped") summary.shipped += 1;
    if (state === "partial") summary.partial += 1;
    if (state === "not_started") summary.notStarted += 1;

    for (const specMatch of itemText.matchAll(SPEC_LINK_REGEX)) {
      const specPath = specMatch[1];
      const specName = basename(specPath);
      const label = itemText.split("→ [spec]")[0].trim();

      if (!bySpec.has(specName)) bySpec.set(specName, []);
      bySpec.get(specName).push({ state, label });
    }
  }

  return { bySpec, summary };
}

function formatPrdState(entries) {
  if (!entries || entries.length === 0) return "—";

  let shipped = 0;
  let partial = 0;
  let notStarted = 0;

  for (const entry of entries) {
    if (entry.state === "shipped") shipped += 1;
    if (entry.state === "partial") partial += 1;
    if (entry.state === "not_started") notStarted += 1;
  }

  const parts = [];
  if (shipped > 0) parts.push(`x${shipped}`);
  if (partial > 0) parts.push(`~${partial}`);
  if (notStarted > 0) parts.push(`[]${notStarted}`);

  return parts.join(" / ");
}

function main() {
  const checkMode = process.argv.includes("--check");

  const specFiles = readdirSync(FEATURES_DIR)
    .filter((file) => file.endsWith("-spec.md"))
    .sort();

  const prdContent = readFileSync(PRD_PATH, "utf-8");
  const prdLastUpdated = extractPrdLastUpdated(prdContent);
  const { bySpec, summary } = parsePrdChecklist(prdContent);

  const specHeaderDates = [];
  const rows = specFiles.map((file) => {
    const content = readFileSync(join(FEATURES_DIR, file), "utf-8");
    const { title, status, owner, lastUpdated, prdRef } = extractHeader(content);
    specHeaderDates.push(lastUpdated);
    const prdState = formatPrdState(bySpec.get(file));
    return `| [${title}](../product-specs/features/${file}) | ${status} | ${prdRef} | ${prdState} | ${owner} | ${lastUpdated} |`;
  });

  const lastUpdated = maxIsoDate([prdLastUpdated, ...specHeaderDates]) ?? "unknown";

  const output = `# Feature Specs Index

> **Owner:** Product + OPUS  
> **Status:** final  
> **Last updated:** ${lastUpdated}  
> **Auto-generated:** \`node scripts/gen-feature-index.mjs\`

## Implementation Snapshot (from PRD.md)

| Metric | Value |
|--------|-------|
| Total checklist items | ${summary.total} |
| Shipped \`[x]\` | ${summary.shipped} |
| Partial \`[~]\` | ${summary.partial} |
| Not started \`[ ]\` | ${summary.notStarted} |

## Registry

| Spec | Spec Status | PRD Ref (from spec) | PRD State (from PRD) | Owner | Last Updated |
|------|-------------|----------------------|----------------------|-------|--------------|
${rows.join("\n")}

## Notes

- \`PRD State\` is derived from \`PRD.md\` checklist links and is the canonical implementation signal.
- \`Spec Status\` reflects document maturity (\`draft/review/final\`), not shipped state.
`;

  if (checkMode) {
    let existing = "";
    try {
      existing = readFileSync(INDEX_PATH, "utf-8");
    } catch {
      console.error("docs/generated/feature-index.md is missing.");
      console.error("Run: pnpm -s docs:index");
      process.exit(1);
    }

    if (existing !== output) {
      console.error("docs/generated/feature-index.md is out of date.");
      console.error("Run: pnpm -s docs:index");
      process.exit(1);
    }

    console.log(`docs/generated/feature-index.md is up to date (${specFiles.length} specs).`);
    return;
  }

  writeFileSync(INDEX_PATH, output, "utf-8");
  console.log(`Generated ${INDEX_PATH} with ${specFiles.length} specs.`);
  console.log(
    `PRD snapshot: total=${summary.total}, shipped=${summary.shipped}, partial=${summary.partial}, notStarted=${summary.notStarted}`,
  );
}

main();
