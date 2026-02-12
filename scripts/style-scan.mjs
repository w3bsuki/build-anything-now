import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2];
const scope = process.argv[3] ?? "all";

const SOURCE_ROOT = "src";
const DEFAULT_INCLUDE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const EXCLUDE_PATHS = [/^src\/components\/ui\//];
const TRUST_CRITICAL_SCOPES = [
  "src/pages/AnimalProfile.tsx",
  "src/pages/CreateCase.tsx",
  "src/pages/CreateCaseAi.tsx",
  "src/pages/CreateAdoption.tsx",
  "src/pages/MyDonations.tsx",
  "src/pages/DonationHistory.tsx",
  "src/pages/Community.tsx",
  "src/pages/CommunityPost.tsx",
  "src/pages/CommunityMembers.tsx",
  "src/pages/CommunityActivity.tsx",
  "src/pages/community/",
  "src/components/donations/",
  "src/components/trust/",
  "src/layouts/CommunityMobileShellLayout.tsx",
  "src/components/CaseCard.tsx",
  "src/components/StatusBadge.tsx",
  "src/components/VerificationBadge.tsx",
  "src/components/ProgressBar.tsx",
  "src/components/UpdatesTimeline.tsx",
];

const SCOPES = {
  all: () => true,
  "trust-critical": (relativePath) => TRUST_CRITICAL_SCOPES.some((prefix) => relativePath.startsWith(prefix)),
};

const scans = {
  palette: {
    description: "palette color classes",
    includeExtensions: DEFAULT_INCLUDE_EXTENSIONS,
    pattern:
      /\b(?:bg|text|border|ring|fill|stroke)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b|\b(?:bg|text|border|ring|fill|stroke)-(?:black|white|transparent)(?:\/\d{1,3})?\b/g,
  },
  arbitrary: {
    description: "forbidden arbitrary color classes",
    includeExtensions: DEFAULT_INCLUDE_EXTENSIONS,
    pattern: /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-\[[^\]]+\]\b/g,
  },
  gradients: {
    description: "gradient utility classes",
    includeExtensions: DEFAULT_INCLUDE_EXTENSIONS,
    pattern:
      /\bbg-(?:gradient|linear|radial)-to-(?:t|tr|r|br|b|bl|l|tl)\b|\bbg-gradient-to-(?:t|tr|r|br|b|bl|l|tl)\b|\b(?:from|via|to)-\[[^\]]+\]|\b(?:from|via|to)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white|transparent)(?:\/\d{1,3})?\b/g,
  },
  inline: {
    description: "hardcoded inline color literals",
    includeExtensions: new Set([".ts", ".tsx", ".js", ".jsx"]),
    pattern: /(?:hsl|hsla|rgb|rgba)\([^)]+\)|#[0-9a-fA-F]{3,8}\b/g,
  },
  status: {
    description: "direct status class literals",
    includeExtensions: new Set([".ts", ".tsx", ".js", ".jsx"]),
    pattern: /\bbadge-(?:critical|urgent|recovering|adopted)\b/g,
  },
  motion: {
    description: "hover/active lift+zoom transforms",
    includeExtensions: new Set([".ts", ".tsx", ".js", ".jsx"]),
    pattern:
      /\b(?:hover|active|group-hover):(?:-)?translate-(?:x|y)-[^\s"'`]+\b|\b(?:hover|active|group-hover):scale-(?:\[[^\]]+\]|\d{2,3})\b/g,
  },
};

if (!mode || !(mode in scans)) {
  console.error("Usage: node scripts/style-scan.mjs <palette|arbitrary|gradients|inline|status|motion> [all|trust-critical]");
  process.exit(2);
}

if (!(scope in SCOPES)) {
  console.error("Invalid scope. Use one of: all, trust-critical.");
  process.exit(2);
}

const root = process.cwd();
const sourceRootPath = path.join(root, SOURCE_ROOT);
const results = [];
const scan = scans[mode];
const includeExtensions = scan.includeExtensions ?? DEFAULT_INCLUDE_EXTENSIONS;
const scopeMatcher = SCOPES[scope];

const normalizePath = (value) => value.split(path.sep).join("/");

function collectFiles(dir, files) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(absolutePath, files);
      continue;
    }
    if (!entry.isFile()) {
      continue;
    }
    if (!includeExtensions.has(path.extname(entry.name))) {
      continue;
    }
    const relativePath = normalizePath(path.relative(root, absolutePath));
    if (EXCLUDE_PATHS.some((rule) => rule.test(relativePath))) {
      continue;
    }
    if (!scopeMatcher(relativePath)) {
      continue;
    }
    files.push(relativePath);
  }
}

const targetFiles = [];
if (fs.existsSync(sourceRootPath)) {
  collectFiles(sourceRootPath, targetFiles);
}

for (const relativeFile of targetFiles) {
  const filePath = path.join(root, relativeFile);
  const source = fs.readFileSync(filePath, "utf8");
  const lines = source.split(/\r?\n/);
  const matcher = scan.pattern;

  lines.forEach((line, index) => {
    const matches = [...line.matchAll(matcher)].map((match) => match[0].trim());
    if (matches.length === 0) {
      return;
    }

    results.push({
      file: relativeFile,
      line: index + 1,
      content: line.trim(),
      matches: matches.join(", "),
    });
  });
}

if (results.length > 0) {
  console.error(`Style scan failed for ${scans[mode].description}.`);
  for (const match of results) {
    console.error(`- ${match.file}:${match.line} [${match.matches}] ${match.content}`);
  }
  process.exit(1);
}

console.log(`Style scan passed: no ${scans[mode].description} found in src scope "${scope}" (excluding src/components/ui).`);
