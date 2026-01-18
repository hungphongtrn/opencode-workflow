#!/usr/bin/env node

/**
 * install_gsd_opencode.js
 *
 * OpenCode port installer for GSD, kept OUTSIDE the upstream `get-shit-done` submodule
 * so the submodule can stay clean and be updated independently.
 *
 * Installs into:
 * - Local:  ./.opencode/...
 * - Global: ~/.config/opencode/... (or $XDG_CONFIG_HOME/opencode), override with --opencode-config-dir
 *
 * Sources are read from the GSD submodule (default ./get-shit-done), override with --gsd-dir
 *
 * Docs:
 * - Commands: https://opencode.ai/docs/commands/
 * - Tools (tool IDs used in agent frontmatter): https://opencode.ai/docs/tools/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors (terminal)
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

function readPkgVersion(gsdDir) {
  try {
    const pkgPath = path.join(gsdDir, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function parseArgValue(flagLong, flagShort) {
  const args = process.argv.slice(2);

  const idx = args.findIndex(a => a === flagLong || (flagShort && a === flagShort));
  if (idx !== -1) {
    const next = args[idx + 1];
    if (!next || next.startsWith('-')) {
      console.error(`  ${yellow}${flagLong} requires a path argument${reset}`);
      process.exit(1);
    }
    return next;
  }

  const eq = args.find(a => a.startsWith(`${flagLong}=`) || (flagShort && a.startsWith(`${flagShort}=`)));
  if (eq) return eq.split('=')[1];
  return null;
}

function hasFlag(flagLong, flagShort) {
  const args = process.argv.slice(2);
  return args.includes(flagLong) || (flagShort ? args.includes(flagShort) : false);
}

function expandTilde(p) {
  if (p && p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function safeRm(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function isTextFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.md' || ext === '.txt' || ext === '.json' || ext === '.yaml' || ext === '.yml';
}

function readUtf8(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeUtf8(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content);
}

function rewriteContent(content, { pathPrefix }) {
  let out = content;

  // Paths: Claude -> OpenCode
  out = out.replace(/~\/\.claude\//g, pathPrefix);
  out = out.replace(/\.claude\//g, '.opencode/');

  // Command naming: /gsd:foo -> /gsd-foo
  out = out.replace(/\/gsd:([a-z0-9-]+)/gi, '/gsd-$1');

  return out;
}

function convertCommandMarkdown(srcContent) {
  // Claude-style command files have YAML frontmatter we want to strip down.
  const fmMatch = srcContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) {
    return `---\ndescription: GSD command\n---\n\n${srcContent.trim()}\n`;
  }

  const fmBody = fmMatch[1];
  const body = fmMatch[2];
  const descLine = fmBody.split('\n').find(l => l.trim().startsWith('description:'));
  const desc = descLine ? descLine.replace(/^description:\s*/, '').trim() : 'GSD command';

  return `---\ndescription: ${desc}\n---\n\n${body.trim()}\n`;
}

function normalizeOpenCodeTools(toolsLine) {
  // OpenCode tool IDs:
  // https://opencode.ai/docs/tools/
  if (!toolsLine) return [];

  const raw = toolsLine
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const map = {
    Read: 'read',
    Write: 'write',
    Edit: 'edit',
    Bash: 'bash',
    Grep: 'grep',
    Glob: 'glob',
    List: 'list',
    Patch: 'patch',
    WebFetch: 'webfetch',
    AskUserQuestion: 'question',
    Question: 'question',
    TodoWrite: 'todowrite',
    TodoRead: 'todoread',
    Skill: 'skill',
    LSP: 'lsp',
  };

  const allowed = new Set([
    'bash',
    'edit',
    'write',
    'read',
    'grep',
    'glob',
    'list',
    'lsp',
    'patch',
    'skill',
    'todowrite',
    'todoread',
    'webfetch',
    'question',
  ]);

  const out = [];
  const seen = new Set();

  for (const token of raw) {
    if (token.startsWith('mcp__')) {
      if (!seen.has(token)) {
        seen.add(token);
        out.push(token);
      }
      continue;
    }

    const mapped = map[token] || null;
    if (!mapped) continue;
    if (!allowed.has(mapped)) continue;
    if (seen.has(mapped)) continue;
    seen.add(mapped);
    out.push(mapped);
  }

  return out;
}

function normalizeHexColor(colorValue) {
  if (!colorValue) return null;
  const v = colorValue.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();

  const named = v.toLowerCase();
  const map = {
    green: '#22c55e',
    yellow: '#eab308',
    cyan: '#06b6d4',
    blue: '#3b82f6',
    purple: '#a855f7',
    red: '#ef4444',
    orange: '#f97316',
    gray: '#64748b',
    grey: '#64748b',
    white: '#ffffff',
    black: '#000000',
  };
  return map[named] || null;
}

function convertAgentMarkdown(srcContent) {
  const fmMatch = srcContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!fmMatch) return srcContent;

  const fmBody = fmMatch[1];
  const body = fmMatch[2];
  const lines = fmBody.split('\n');

  const getScalar = (key) => {
    const line = lines.find(l => l.trim().startsWith(`${key}:`));
    if (!line) return null;
    return line.replace(new RegExp(`^${key}:\\s*`), '').trim();
  };

  const name = getScalar('name');
  const desc = getScalar('description') || 'GSD agent';
  const toolsLine = getScalar('tools');
  const colorLine = getScalar('color');

  const tools = normalizeOpenCodeTools(toolsLine);
  const colorHex = normalizeHexColor(colorLine);

  const fmOut = [];
  fmOut.push('---');
  if (name) fmOut.push(`name: ${name}`);
  fmOut.push(`description: ${desc}`);
  fmOut.push('mode: subagent');
  if (tools.length > 0) {
    fmOut.push('tools:');
    for (const t of tools) fmOut.push(`  - ${t}`);
  }
  if (colorHex) fmOut.push(`color: "${colorHex}"`);
  fmOut.push('---');

  return `${fmOut.join('\n')}\n\n${body.trim()}\n`;
}

function copyDirWithRewrite(srcDir, destDir, { pathPrefix }) {
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirWithRewrite(srcPath, destPath, { pathPrefix });
    } else if (entry.isFile()) {
      if (isTextFile(srcPath)) {
        let content = readUtf8(srcPath);
        content = rewriteContent(content, { pathPrefix });
        writeUtf8(destPath, content);
      } else {
        ensureDir(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

function defaultGlobalBase(explicitConfigDir) {
  const xdg = process.env.XDG_CONFIG_HOME ? expandTilde(process.env.XDG_CONFIG_HOME) : null;
  const base = xdg ? path.join(xdg, 'opencode') : path.join(os.homedir(), '.config', 'opencode');
  return explicitConfigDir ? expandTilde(explicitConfigDir) : base;
}

function install({ gsdDir, isGlobal, globalBase }) {
  const targetRoot = isGlobal ? globalBase : path.join(process.cwd(), '.opencode');

  const locationLabel = isGlobal
    ? targetRoot.replace(os.homedir(), '~')
    : targetRoot.replace(process.cwd(), '.');

  const pathPrefix = isGlobal ? `${targetRoot}/` : './.opencode/';

  console.log(`  Installing to ${cyan}${locationLabel}${reset}\n`);

  // Clean only what we own
  const commandsDir = path.join(targetRoot, 'commands');
  if (fs.existsSync(commandsDir)) {
    for (const file of fs.readdirSync(commandsDir)) {
      if (file.startsWith('gsd-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(commandsDir, file));
      }
    }
  }

  const agentsDir = path.join(targetRoot, 'agents');
  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir)) {
      if (file.startsWith('gsd-') && file.endsWith('.md')) {
        fs.unlinkSync(path.join(agentsDir, file));
      }
    }
  }

  const libDest = path.join(targetRoot, 'get-shit-done');
  safeRm(libDest);

  // Install library
  const libSrc = path.join(gsdDir, 'get-shit-done');
  if (!fs.existsSync(libSrc)) {
    console.error(`  ${yellow}✗${reset} Missing source directory: ${libSrc}`);
    process.exit(1);
  }
  copyDirWithRewrite(libSrc, libDest, { pathPrefix });
  console.log(`  ${green}✓${reset} Installed get-shit-done library`);

  // Install commands
  const commandsSrcDir = path.join(gsdDir, 'commands', 'gsd');
  if (!fs.existsSync(commandsSrcDir)) {
    console.error(`  ${yellow}✗${reset} Missing source directory: ${commandsSrcDir}`);
    process.exit(1);
  }

  ensureDir(commandsDir);
  const commandFiles = fs.readdirSync(commandsSrcDir).filter(f => f.endsWith('.md'));
  for (const file of commandFiles) {
    const srcPath = path.join(commandsSrcDir, file);
    const cmdName = file.replace(/\.md$/, '');
    const destPath = path.join(commandsDir, `gsd-${cmdName}.md`);

    const src = readUtf8(srcPath);
    const converted = convertCommandMarkdown(src);
    const rewritten = rewriteContent(converted, { pathPrefix });
    writeUtf8(destPath, rewritten);
  }
  console.log(`  ${green}✓${reset} Installed ${commandFiles.length} commands`);

  // Install agents
  const agentsSrcDir = path.join(gsdDir, 'agents');
  if (fs.existsSync(agentsSrcDir)) {
    ensureDir(agentsDir);
    const agentFiles = fs.readdirSync(agentsSrcDir).filter(f => f.endsWith('.md'));
    for (const file of agentFiles) {
      const srcPath = path.join(agentsSrcDir, file);
      const destPath = path.join(agentsDir, file);
      const src = readUtf8(srcPath);
      const converted = convertAgentMarkdown(src);
      const rewritten = rewriteContent(converted, { pathPrefix });
      writeUtf8(destPath, rewritten);
    }
    console.log(`  ${green}✓${reset} Installed ${fs.readdirSync(agentsSrcDir).filter(f => f.endsWith('.md')).length} agents`);
  } else {
    console.log(`  ${yellow}⚠${reset} No agents directory found, skipping`);
  }

  // Remove hooks if present (we never install them for OpenCode)
  const hooksDir = path.join(targetRoot, 'hooks');
  if (fs.existsSync(hooksDir)) {
    safeRm(hooksDir);
    console.log(`  ${green}✓${reset} Removed hooks (not used for OpenCode)`);
  }

  console.log(`\n  ${green}Done!${reset} In OpenCode, run ${cyan}/gsd-help${reset}.\n`);
}

// Main
const projectRoot = path.resolve(__dirname, '..');
const gsdDirArg = parseArgValue('--gsd-dir');
const gsdDir = expandTilde(gsdDirArg || path.join(projectRoot, 'get-shit-done'));

const isGlobal = hasFlag('--global', '-g');
const isLocal = hasFlag('--local', '-l');
const hasHelp = hasFlag('--help', '-h');

const explicitOpenCodeConfigDir = parseArgValue('--opencode-config-dir', '-c');
const globalBase = defaultGlobalBase(explicitOpenCodeConfigDir);

const version = readPkgVersion(gsdDir);
const banner = `
${cyan}  GSD OpenCode Installer${reset} ${dim}v${version}${reset}
  (kept outside the upstream submodule)
`;
console.log(banner);

if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} node bin/install_gsd_opencode.js [options]

  ${yellow}Options:${reset}
    ${cyan}--local, -l${reset}                       Install into ./.opencode (default)
    ${cyan}--global, -g${reset}                      Install into ~/.config/opencode
    ${cyan}--opencode-config-dir, -c <path>${reset}  Override global OpenCode config dir
    ${cyan}--gsd-dir <path>${reset}                  Path to get-shit-done (submodule) directory
    ${cyan}--help, -h${reset}                        Show help

  ${yellow}Examples:${reset}
    ${dim}# Project-local install${reset}
    node bin/install_gsd_opencode.js --local

    ${dim}# Global install${reset}
    node bin/install_gsd_opencode.js --global

    ${dim}# If your submodule lives elsewhere${reset}
    node bin/install_gsd_opencode.js --gsd-dir ./vendor/get-shit-done --local
`);
  process.exit(0);
}

if (isGlobal && isLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
}

if (!fs.existsSync(gsdDir)) {
  console.error(`  ${yellow}GSD directory not found:${reset} ${gsdDir}`);
  console.error(`  Expected submodule at ${dim}${path.join(projectRoot, 'get-shit-done')}${reset}`);
  process.exit(1);
}

install({ gsdDir, isGlobal, globalBase });


