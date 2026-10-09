#!/usr/bin/env node

import { startServer } from '../src/server/index.js';
import { fetchUrlMetadata } from '../src/core/parser.js';
import { auditMetadata } from '../src/core/auditor.js';
import { generateAllFormats } from '../src/core/generator.js';
import { PRESETS, getPreset } from '../src/core/presets.js';
import { writeFile } from 'node:fs/promises';

const ARGS = process.argv.slice(2);
const COMMAND = ARGS[0] || 'ui';

// Terminal Colors (ANSI escapes, zero dependency)
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgSky: '\x1b[46m\x1b[30m'
};

async function main() {
  if (COMMAND === '--help' || COMMAND === '-h' || COMMAND === 'help') {
    printHelp();
    process.exit(0);
  }

  if (COMMAND === '--version' || COMMAND === '-v' || COMMAND === 'version') {
    console.log('meta-craft v1.0.0 (30 Repos in 30 Days — Day 18)');
    process.exit(0);
  }

  if (COMMAND === 'ui' || COMMAND === 'serve' || (!COMMAND.startsWith('-') && !['inspect', 'audit', 'generate', 'presets'].includes(COMMAND))) {
    const portArgIdx = ARGS.indexOf('--port');
    const port = portArgIdx !== -1 ? Number(ARGS[portArgIdx + 1]) : 3018;
    await runServer(port);
    return;
  }

  if (COMMAND === 'inspect' || COMMAND === 'audit') {
    const url = ARGS[1];
    if (!url) {
      console.error(`${C.red}Error: Please provide a target URL to inspect.${C.reset}`);
      console.log(`Example: ${C.cyan}meta-craft inspect https://github.com${C.reset}`);
      process.exit(1);
    }
    const isJson = ARGS.includes('--json');
    await runInspect(url, isJson);
    return;
  }

  if (COMMAND === 'generate') {
    await runGenerate();
    return;
  }

  if (COMMAND === 'presets') {
    printPresets();
    return;
  }

  console.error(`${C.red}Unknown command: "${COMMAND}".${C.reset}`);
  printHelp();
  process.exit(1);
}

async function runServer(port) {
  printBanner();
  try {
    const instance = await startServer({ port });
    console.log(`  ${C.green}●${C.reset} Web Studio running at:  ${C.cyan}${C.bold}${instance.url}${C.reset}`);
    console.log(`  ${C.green}●${C.reset} Local API endpoint:     ${C.dim}${instance.url}/api${C.reset}`);
    console.log(`  ${C.dim}Press Ctrl+C to terminate the server${C.reset}\n`);

    const shutdown = async () => {
      console.log(`\n${C.yellow}Shutting down MetaCraft Web Studio...${C.reset}`);
      await instance.close();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error(`${C.red}Failed to start server on port ${port}:${C.reset}`, err.message);
    process.exit(1);
  }
}

async function runInspect(url, isJson) {
  if (!isJson) {
    console.log(`\n${C.cyan}🔍 Inspecting metadata for:${C.reset} ${C.bold}${url}${C.reset}`);
  }

  try {
    const metadata = await fetchUrlMetadata(url);
    const audit = auditMetadata(metadata);

    if (isJson) {
      console.log(JSON.stringify({ metadata, audit }, null, 2));
      return;
    }

    console.log(`\n${C.bold}--- Metadata Summary ---${C.reset}`);
    console.log(`  ${C.bold}Title:${C.reset}       ${metadata.title || C.dim + '(missing)' + C.reset} (${metadata.title.length} chars)`);
    console.log(`  ${C.bold}Description:${C.reset} ${metadata.description || C.dim + '(missing)' + C.reset} (${metadata.description.length} chars)`);
    console.log(`  ${C.bold}OG Image:${C.reset}    ${metadata.ogImage || C.dim + '(missing)' + C.reset}`);
    console.log(`  ${C.bold}Canonical:${C.reset}   ${metadata.canonical || C.dim + '(missing)' + C.reset}`);
    console.log(`  ${C.bold}Twitter Card:${C.reset}${metadata.twitterCard || C.dim + '(missing)' + C.reset}`);
    console.log(`  ${C.bold}Robots:${C.reset}     ${metadata.robots || C.dim + '(missing)' + C.reset}`);

    console.log(`\n${C.bold}--- Audit & SEO Score ---${C.reset}`);
    let scoreColor = C.green;
    if (audit.score < 60) scoreColor = C.red;
    else if (audit.score < 80) scoreColor = C.yellow;

    console.log(`  Overall Score: ${scoreColor}${C.bold}${audit.score}/100 [Grade ${audit.grade}]${C.reset}`);
    console.log(`  Passed: ${C.green}${audit.passedCount}${C.reset} | Warnings: ${C.yellow}${audit.warningCount}${C.reset} | Errors: ${C.red}${audit.errorCount}${C.reset}\n`);

    console.log(`${C.bold}Check Details:${C.reset}`);
    for (const check of audit.checks) {
      let icon = `${C.green}✓${C.reset}`;
      if (check.status === 'warning') icon = `${C.yellow}⚠${C.reset}`;
      else if (check.status === 'error') icon = `${C.red}✗${C.reset}`;

      console.log(`  ${icon} ${C.bold}${check.label}:${C.reset} ${check.message} (${check.points}/${check.maxPoints} pts)`);
      if (check.status !== 'success') {
        console.log(`    ${C.dim}↳ ${check.recommendation}${C.reset}`);
      }
    }
    console.log();
  } catch (err) {
    console.error(`\n${C.red}Inspection failed:${C.reset} ${err.message}`);
    process.exit(1);
  }
}

async function runGenerate() {
  const getFlag = (flag) => {
    const idx = ARGS.indexOf(flag);
    return idx !== -1 ? ARGS[idx + 1] : undefined;
  };

  const preset = getFlag('--preset');
  let meta = preset ? { ...getPreset(preset) } : {};

  if (getFlag('--title')) meta.title = getFlag('--title');
  if (getFlag('--description')) meta.description = getFlag('--description');
  if (getFlag('--image')) meta.ogImage = getFlag('--image');
  if (getFlag('--url')) meta.canonical = getFlag('--url');
  if (getFlag('--site-name')) meta.ogSiteName = getFlag('--site-name');
  if (getFlag('--twitter')) meta.twitterSite = getFlag('--twitter');

  const format = (getFlag('--format') || 'html').toLowerCase();
  const outFile = getFlag('--out');

  const formats = generateAllFormats(meta);
  const code = formats[format] || formats.html;

  if (outFile) {
    await writeFile(outFile, code, 'utf8');
    console.log(`${C.green}✓ Exported ${format.toUpperCase()} meta tags to ${outFile}${C.reset}`);
  } else {
    console.log(code);
  }
}

function printPresets() {
  console.log(`\n${C.cyan}${C.bold}Available MetaCraft Presets:${C.reset}\n`);
  for (const [key, p] of Object.entries(PRESETS)) {
    console.log(`  ${C.bold}${key}${C.reset} — ${p.name}`);
    console.log(`    ${C.dim}${p.description}${C.reset}`);
    console.log(`    Title: "${p.title.slice(0, 50)}..."\n`);
  }
}

function printBanner() {
  console.log(`
${C.cyan}${C.bold}  __  __      _          ____            __ _   
 |  \\/  | ___| |_ __ _  / ___|_ __ __ _ / _| |_ 
 | |\\/| |/ _ \\ __/ _\` | | |   | '__/ _\` | |_| __|
 | |  | |  __/ || (_| | | |___| | | (_| |  _| |_ 
 |_|  |_|\\___|\\__\\__,_|  \\____|_|  \\__,_|_|  \\__|${C.reset}
  ${C.dim}Social Share Preview Studio & Meta Tag Generator (Day 18/30)${C.reset}
`);
}

function printHelp() {
  printBanner();
  console.log(`
${C.bold}USAGE:${C.reset}
  meta-craft [command] [options]

${C.bold}COMMANDS:${C.reset}
  ${C.cyan}ui, serve${C.reset}              Launch interactive Web Studio (default, port 3018)
  ${C.cyan}inspect <url>${C.reset}          Scrape and audit metadata from a live website
  ${C.cyan}generate [options]${C.reset}     Generate HTML, Next.js, Nuxt, or JSON-LD tags
  ${C.cyan}presets${C.reset}                List built-in metadata templates

${C.bold}OPTIONS:${C.reset}
  ${C.dim}--port <number>${C.reset}        Specify port for Web Studio (default: 3018)
  ${C.dim}--format <type>${C.reset}        Code format: html | nextjs | nuxt | jsonld (default: html)
  ${C.dim}--preset <name>${C.reset}        Base metadata on preset (saas, blog, portfolio, opensource)
  ${C.dim}--title <str>${C.reset}          Page title
  ${C.dim}--description <str>${C.reset}    Meta description
  ${C.dim}--image <url>${C.reset}          Open Graph image URL
  ${C.dim}--url <url>${C.reset}            Canonical URL
  ${C.dim}--out <file>${C.reset}           Write output to file instead of stdout
  ${C.dim}--json${C.reset}                 Output inspect report in raw JSON format
  ${C.dim}-h, --help${C.reset}             Show this help message
  ${C.dim}-v, --version${C.reset}          Show version number

${C.bold}EXAMPLES:${C.reset}
  meta-craft ui --port 3018
  meta-craft inspect https://github.com
  meta-craft generate --preset saas --format nextjs
  meta-craft generate --title "My App" --image "https://img.com/og.png" --out meta.html
`);
}

main().catch(err => {
  console.error(`${C.red}Fatal error:${C.reset}`, err);
  process.exit(1);
});
