#!/usr/bin/env node

/**
 * validate-docs.mjs
 *
 * Lints documentation conventions:
 * - Required headers (Owner, Status, Last updated) on docs markdown files
 * - Allowed status values: draft | review | final
 * - Feature specs must include PRD Ref and canonical 10 required sections
 *
 * Usage: node scripts/validate-docs.mjs
 */

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DOCS_DIR = join(ROOT, "docs");

const REQUIRED_FEATURE_SECTIONS = [
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

const ALLOWED_STATUS = new Set(["draft", "review", "final"]);

function collectMarkdownFiles(dir, results = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, results);
      continue;
    }
    if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(fullPath);
    }
  }
  return results;
}

function readHeaderLines(content) {
  return content.split("\n").slice(0, 24);
}

function extractHeaderValue(lines, label) {
  const regex = new RegExp(`^> \\*\\*${label}:\\*\\*\\s*(.+)$`, "i");
  for (const line of lines) {
    const match = line.trimEnd().match(regex);
    if (match) return match[1].trim();
  }
  return null;
}

function findSectionIndexes(content, sections) {
  const lines = content.split("\n");
  const indexes = new Map();
  lines.forEach((line, idx) => {
    if (sections.includes(line.trim()) && !indexes.has(line.trim())) {
      indexes.set(line.trim(), idx);
    }
  });
  return indexes;
}

function main() {
  const files = collectMarkdownFiles(DOCS_DIR);
  const errors = [];

  for (const filePath of files) {
    const relPath = relative(ROOT, filePath).replace(/\\/g, "/");
    const content = readFileSync(filePath, "utf-8");
    const header = readHeaderLines(content);

    const owner = extractHeaderValue(header, "Owner");
    const status = extractHeaderValue(header, "Status");
    const lastUpdated = extractHeaderValue(header, "Last updated");

    if (!owner) errors.push(`${relPath}: missing header field "Owner"`);
    if (!status) errors.push(`${relPath}: missing header field "Status"`);
    if (!lastUpdated) errors.push(`${relPath}: missing header field "Last updated"`);

    if (status && !ALLOWED_STATUS.has(status)) {
      errors.push(
        `${relPath}: invalid status "${status}" (allowed: draft | review | final)`,
      );
    }

    if (!relPath.startsWith("docs/features/") || !relPath.endsWith("-spec.md")) {
      continue;
    }

    const prdRef = extractHeaderValue(header, "PRD Ref");
    if (!prdRef) {
      errors.push(`${relPath}: missing header field "PRD Ref"`);
    }

    const indexes = findSectionIndexes(content, REQUIRED_FEATURE_SECTIONS);
    for (const section of REQUIRED_FEATURE_SECTIONS) {
      if (!indexes.has(section)) {
        errors.push(`${relPath}: missing required section "${section}"`);
      }
    }

  }

  if (errors.length > 0) {
    console.error("Documentation validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Documentation validation passed for ${files.length} markdown files.`);
}

main();
