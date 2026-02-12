#!/usr/bin/env node
/**
 * check-doc-links.mjs — Validates all markdown internal links resolve to real files.
 *
 * Usage:  node scripts/check-doc-links.mjs [--fix]
 *
 * Scans all .md files in the repo (excluding node_modules, .git, android, ios,
 * convex/_generated). For each [text](path) link where path is a relative file
 * path (not http/https/mailto/#anchor-only), verifies the target file exists.
 *
 * Exit code 0 = all links valid.  Exit code 1 = broken links found.
 */

import { readdir, readFile } from "node:fs/promises";
import { join, dirname, resolve, extname } from "node:path";
import { existsSync } from "node:fs";

const ROOT = resolve(import.meta.dirname, "..");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "android",
  "ios",
  "convex/_generated",
  "dist",
  ".vercel",
]);

/** Recursively collect all .md files */
async function collectMdFiles(dir, results = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = join(dir, entry.name).replace(ROOT + "\\", "").replace(ROOT + "/", "");
    if (IGNORE_DIRS.has(rel.split(/[\\/]/)[0]) || IGNORE_DIRS.has(rel)) continue;
    if (entry.isDirectory()) {
      await collectMdFiles(join(dir, entry.name), results);
    } else if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(join(dir, entry.name));
    }
  }
  return results;
}

/** Extract markdown links from content: [text](path) */
function extractLinks(content) {
  const links = [];
  // Match [text](path) but not ![alt](img)
  const regex = /(?<!!)\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  let lineNum = 0;
  const lines = content.split("\n");
  for (const line of lines) {
    lineNum++;
    regex.lastIndex = 0;
    while ((match = regex.exec(line)) !== null) {
      const target = match[2].trim();
      links.push({ text: match[1], target, line: lineNum });
    }
  }
  return links;
}

/** Check if a link target is an internal file path (not URL/anchor/etc) */
function isInternalLink(target) {
  if (target.startsWith("http://") || target.startsWith("https://")) return false;
  if (target.startsWith("mailto:")) return false;
  if (target.startsWith("#")) return false; // anchor-only
  if (target.startsWith("data:")) return false;
  return true;
}

async function main() {
  const files = await collectMdFiles(ROOT);
  let broken = 0;
  let checked = 0;

  for (const filePath of files) {
    const content = await readFile(filePath, "utf-8");
    const links = extractLinks(content);
    const fileDir = dirname(filePath);

    for (const { text, target, line } of links) {
      if (!isInternalLink(target)) continue;

      // Strip anchor fragments
      const pathPart = target.split("#")[0];
      if (!pathPart) continue; // was just #anchor

      checked++;
      const resolved = resolve(fileDir, pathPart);

      if (!existsSync(resolved)) {
        broken++;
        const rel = filePath.replace(ROOT + "\\", "").replace(ROOT + "/", "");
        console.log(`BROKEN: ${rel}:${line} → [${text}](${target})`);
        console.log(`        resolved to: ${resolved}`);
        console.log();
      }
    }
  }

  console.log(`\n--- Link Check Summary ---`);
  console.log(`Files scanned: ${files.length}`);
  console.log(`Links checked: ${checked}`);
  console.log(`Broken links:  ${broken}`);

  if (broken > 0) {
    console.log(`\n❌ ${broken} broken link(s) found.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All links valid.`);
    process.exit(0);
  }
}

main();
