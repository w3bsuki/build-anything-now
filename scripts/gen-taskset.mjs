#!/usr/bin/env node

/**
 * gen-taskset.mjs
 *
 * Generates docs/generated/taskset.md from TASKS.md.
 *
 * Usage:
 *   node scripts/gen-taskset.mjs
 *   node scripts/gen-taskset.mjs --check
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const TASKS_PATH = join(ROOT, "TASKS.md");
const OUTPUT_PATH = join(ROOT, "docs", "generated", "taskset.md");

const CHECKBOX_REGEX = /^- \[(x|~| )\]\s+/;
const TOP_LEVEL_TASK_REGEX = /^- \[(x|~| )\]\s+\*\*(.+?)\*\*/;

function extractLastUpdated(markdown) {
  const match = markdown.match(/^> \*\*Last updated:\*\*\s*(.+)\s*$/im);
  return match ? match[1].trim() : "unknown";
}

function collectSectionTasks(lines, heading) {
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return [];

  const tasks = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.startsWith("## ")) break;
    const match = line.match(TOP_LEVEL_TASK_REGEX);
    if (match) tasks.push({ state: match[1], title: match[2].trim() });
  }

  return tasks;
}

function formatTask(task) {
  const state =
    task.state === "x" ? "done" : task.state === "~" ? "partial" : "open";
  return `- [${state}] ${task.title}`;
}

function buildOutput(tasksMd) {
  const lines = tasksMd.split("\n");
  const lastUpdated = extractLastUpdated(tasksMd);

  let total = 0;
  let done = 0;
  let partial = 0;
  let open = 0;

  for (const line of lines) {
    const match = line.match(CHECKBOX_REGEX);
    if (!match) continue;
    total += 1;
    if (match[1] === "x") done += 1;
    else if (match[1] === "~") partial += 1;
    else open += 1;
  }

  const inProgress = collectSectionTasks(lines, "## In Progress");
  const backlog = collectSectionTasks(lines, "## Backlog (Post Current Sprint)");

  return `# Taskset Snapshot

> **Owner:** Product + Engineering  
> **Status:** final  
> **Last updated:** ${lastUpdated}  
> **Auto-generated:** \`node scripts/gen-taskset.mjs\`

## Summary (from TASKS.md)

| Metric | Value |
|--------|-------|
| Total checklist items | ${total} |
| Done \`[x]\` | ${done} |
| Partial \`[~]\` | ${partial} |
| Open \`[ ]\` | ${open} |

## In Progress (Top-Level)

${inProgress.length > 0 ? inProgress.map(formatTask).join("\n") : "- none"}

## Backlog (Top-Level)

${backlog.length > 0 ? backlog.map(formatTask).join("\n") : "- none"}

## Notes

- Source of truth for execution is \`TASKS.md\`.
- This file is a generated snapshot for quick agent/operator orientation.
`;
}

function main() {
  const checkMode = process.argv.includes("--check");
  const tasksMd = readFileSync(TASKS_PATH, "utf-8");
  const output = buildOutput(tasksMd);

  if (checkMode) {
    let existing = "";
    try {
      existing = readFileSync(OUTPUT_PATH, "utf-8");
    } catch {
      console.error("docs/generated/taskset.md is missing.");
      console.error("Run: pnpm -s docs:taskset");
      process.exit(1);
    }

    if (existing !== output) {
      console.error("docs/generated/taskset.md is out of date.");
      console.error("Run: pnpm -s docs:taskset");
      process.exit(1);
    }

    console.log("docs/generated/taskset.md is up to date.");
    return;
  }

  writeFileSync(OUTPUT_PATH, output, "utf-8");
  console.log(`Generated ${OUTPUT_PATH}.`);
}

main();
