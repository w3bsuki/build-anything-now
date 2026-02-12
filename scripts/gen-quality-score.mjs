#!/usr/bin/env node

/**
 * gen-quality-score.mjs
 *
 * Generates docs/generated/quality-score.md using deterministic repository signals.
 *
 * Usage:
 *   node scripts/gen-quality-score.mjs
 *   node scripts/gen-quality-score.mjs --check
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "docs");
const OUTPUT_PATH = join(ROOT, "docs", "generated", "quality-score.md");

const IGNORE_PREFIXES = ["docs/generated/", "docs/archive/"];
const HEADER_FIELDS = ["Owner", "Status", "Last updated"];
const LEGACY_REF_REGEX = /(?<![A-Za-z0-9_-])docs\/(features|systems|design|product)\//g;
const REQUIRED_SECTIONS = [
  "## Purpose",
  "## User Stories",
  "## Functional Requirements",
  "## Data Model",
  "## API Surface",
  "## UI Surfaces",
  "## Edge Cases & Abuse",
  "## Non-Functional Requirements",
  "## Acceptance Criteria",
  "## Open Questions",
];

function collectFiles(dir, results = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, results);
      continue;
    }
    if (entry.isFile() && extname(entry.name) === ".md") results.push(full);
  }
  return results;
}

function collectFilesWithExt(dir, extension, results = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFilesWithExt(full, extension, results);
      continue;
    }
    if (entry.isFile() && extname(entry.name) === extension) results.push(full);
  }
  return results;
}

function extractHeaderValue(content, label) {
  const lines = content.split("\n").slice(0, 30);
  const regex = new RegExp(`^> \\*\\*${label}:\\*\\*\\s*(.+)$`, "i");
  for (const line of lines) {
    const match = line.trimEnd().match(regex);
    if (match) return match[1].trim();
  }
  return null;
}

function hasAllSections(content) {
  return REQUIRED_SECTIONS.every((section) => content.includes(section));
}

function grade(score) {
  if (score >= 95) return "A";
  if (score >= 85) return "B";
  if (score >= 70) return "C";
  return "D";
}

function collectLegacyRefs() {
  const targets = ["AGENTS.md", "README.md", "PRD.md", "TASKS.md", "DESIGN.md", "DECISIONS.md"];
  const refs = [];
  const files = [];

  for (const target of targets) {
    const path = join(ROOT, target);
    if (existsSync(path)) files.push(path);
  }

  const docsFiles = collectFiles(join(ROOT, "docs"));
  const scriptFiles = collectFilesWithExt(join(ROOT, "scripts"), ".mjs");
  files.push(...docsFiles, ...scriptFiles);

  for (const file of files) {
    try {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (IGNORE_PREFIXES.some((prefix) => rel.startsWith(prefix))) continue;

      const content = readFileSync(file, "utf-8");
      const matches = content.match(LEGACY_REF_REGEX);
      if (!matches) continue;
      refs.push({ file: rel, count: matches.length });
    } catch {
      // ignore unreadable paths
    }
  }

  return refs;
}

function main() {
  const checkMode = process.argv.includes("--check");
  const files = collectFiles(DOCS_DIR);

  let considered = 0;
  let headerPass = 0;
  let featureSpecCount = 0;
  let featureSpecWithPrdRef = 0;
  let missionSpecCount = 0;
  let missionSpecTemplatePass = 0;

  for (const file of files) {
    const rel = relative(ROOT, file).replace(/\\/g, "/");
    if (IGNORE_PREFIXES.some((prefix) => rel.startsWith(prefix))) continue;
    considered += 1;

    const content = readFileSync(file, "utf-8");
    const hasHeader = HEADER_FIELDS.every((field) => Boolean(extractHeaderValue(content, field)));
    if (hasHeader) headerPass += 1;

    const isFeatureSpec =
      rel.startsWith("docs/product-specs/features/") && rel.endsWith("-spec.md");
    const isMissionSpec =
      rel.startsWith("docs/product-specs/missions/") && rel.endsWith("-spec.md");

    if (isFeatureSpec) {
      featureSpecCount += 1;
      if (extractHeaderValue(content, "PRD Ref")) featureSpecWithPrdRef += 1;
    }

    if (isMissionSpec) {
      missionSpecCount += 1;
      if (hasAllSections(content)) missionSpecTemplatePass += 1;
    }
  }

  const headerMissing = considered - headerPass;
  const featurePrdMissing = featureSpecCount - featureSpecWithPrdRef;

  const legacyRefs = collectLegacyRefs();
  const legacyRefCount = legacyRefs.reduce((sum, entry) => sum + entry.count, 0);

  const requiredGenerated = [
    join(ROOT, "docs", "generated", "feature-index.md"),
    join(ROOT, "docs", "generated", "taskset.md"),
  ];
  const missingGenerated = requiredGenerated.filter((p) => {
    try {
      readFileSync(p, "utf-8");
      return false;
    } catch {
      return true;
    }
  }).length;

  let score = 100;
  score -= headerMissing * 2;
  score -= featurePrdMissing * 2;
  score -= legacyRefCount * 5;
  score -= missingGenerated * 10;
  score = Math.max(0, Math.min(100, score));

  const output = `# Documentation Quality Score

> **Owner:** OPUS + Human  
> **Status:** final  
> **Last updated:** 2026-02-12  
> **Auto-generated:** \`node scripts/gen-quality-score.mjs\`

## Score

- Score: **${score}/100**
- Grade: **${grade(score)}**

## Signals

| Signal | Value |
|--------|-------|
| Docs files considered (excluding generated/archive) | ${considered} |
| Header coverage | ${headerPass}/${considered} |
| Feature specs with PRD Ref | ${featureSpecWithPrdRef}/${featureSpecCount} |
| Mission specs with 10-section template | ${missionSpecTemplatePass}/${missionSpecCount} |
| Legacy path references (docs/features|systems|design|product) | ${legacyRefCount} |
| Missing generated artifacts (feature-index, taskset) | ${missingGenerated} |

## Notes

- This score is heuristic and deterministic.
- Target state is zero legacy path references and full header/template compliance.
`;

  if (checkMode) {
    let existing = "";
    try {
      existing = readFileSync(OUTPUT_PATH, "utf-8");
    } catch {
      console.error("docs/generated/quality-score.md is missing.");
      console.error("Run: pnpm -s docs:quality");
      process.exit(1);
    }

    if (existing !== output) {
      console.error("docs/generated/quality-score.md is out of date.");
      console.error("Run: pnpm -s docs:quality");
      process.exit(1);
    }

    console.log("docs/generated/quality-score.md is up to date.");
    return;
  }

  writeFileSync(OUTPUT_PATH, output, "utf-8");
  console.log(`Generated ${OUTPUT_PATH}.`);
}

main();
