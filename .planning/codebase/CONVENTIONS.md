# Coding Conventions

**Analysis Date:** 2026-01-18

## Naming Patterns

**Files:**
- Pattern: kebab-case with `.js` extension
- Examples: `gsd-check-update.js`, `statusline.js`, `install.js`
- No uppercase letters, no underscores

**Functions:**
- Pattern: camelCase
- Examples: `parseConfigDirArg`, `expandTilde`, `readSettings`, `verifyInstalled`
- Descriptive names with action verbs for functions that perform operations

**Variables:**
- Pattern: camelCase
- Examples: `homeDir`, `cacheDir`, `configDir`, `statuslineCommand`, `hasGlobal`
- Avoid single-letter variable names except for simple loop counters
- Use descriptive names that indicate purpose

**Constants:**
- Pattern: camelCase (no UPPER_SNAKE_CASE)
- Examples: `pkg` (for package.json imports), standard variable naming
- No strict convention for constants; use clear variable names instead

## Code Style

**Formatting:**
- Indentation: 2 spaces (no tabs)
- Line endings: Unix-style (LF)
- No strict line length limit, but keep lines readable

**Semicolons:**
- Always used (JavaScript ASI pitfalls avoided)

**Quotes:**
- Single quotes for string literals: `'string value'`
- Template literals for string interpolation: `` `value: ${variable}` ``

**Braces:**
- Same-line opening braces for functions and blocks:
```javascript
function functionName() {
  if (condition) {
    // code
  }
}
```

**Template Literals:**
- Used for dynamic string construction with variable interpolation
- Examples in `get-shit-done/bin/install.js`:
```javascript
const banner = `
${cyan}   ██████╗${reset}
   Get Shit Done ${dim}v${pkg.version}${reset}
`;

const locationLabel = isGlobal
  ? claudeDir.replace(os.homedir(), '~')
  : claudeDir.replace(process.cwd(), '.');
```

## Import Organization

**Pattern:**
1. Node.js built-in modules first (alphabetical within group)
2. Destructured imports from built-ins
3. Local relative imports

**Examples from `get-shit-done/bin/install.js`:**
```javascript
// Built-in modules (alphabetical)
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Destructured from built-ins
const { execSync, spawn } = require('child_process');

// Local relative imports
const pkg = require('../package.json');
```

**No ES6 modules:** This codebase uses CommonJS (`require`/`module.exports`) exclusively.

## Error Handling

**Pattern 1: Silent catch with fallback (non-critical operations)**
```javascript
try {
  installed = fs.readFileSync(versionFile, 'utf8').trim();
} catch (e) {}
// Result variable already initialized to safe default
```

**Pattern 2: Explicit validation with return values (functions)**
```javascript
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory not created`);
    return false;
  }
  return true;
}
```

**Pattern 3: Fatal errors exit process (CLI validation)**
```javascript
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
}
```

**Pattern 4: try/catch with explicit error handling**
```javascript
try {
  return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
} catch (e) {
  return {};
}
```

**Error styling:** Use colored console output with ANSI escape codes:
```javascript
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
console.log(`  ${green}✓${reset} Installed commands/gsd`);
```

## Logging

**Console output with colors:**
```javascript
// Success
console.log(`  ${green}✓${reset} Installed commands/gsd`);

// Warning
console.log(`  ${yellow}⚠${reset} Existing statusline detected`);

// Error
console.error(`  ${yellow}✗${reset} Failed to install ${description}`);

// Informational
console.log(banner);
```

**No structured logging framework:** Uses plain `console.log`, `console.error` with ANSI color codes.

## Comments

**JSDoc:**
- Used for all function definitions
- Includes description and parameter/return documentation
- Example from `get-shit-done/bin/install.js`:
```javascript
/**
 * Expand ~ to home directory (shell doesn't expand in env vars passed to node)
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Read and parse settings.json, returning empty object if doesn't exist
 */
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}
```

**Inline comments:**
- Explain complex logic or edge cases
- Short, clear explanations
- Example:
```javascript
// Clean install: remove existing destination to prevent orphaned files
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true });
}
```

**Block comments:** Rarely used; prefer JSDoc and inline comments.

**Shebang:**
- Executable scripts start with: `#!/usr/bin/env node`

## Function Design

**Size:** Functions tend to be focused and single-purpose. Helper functions extracted for repeated logic.

**Parameters:**
- Use clear parameter names
- Validate early with explicit error messages
- Example:
```javascript
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`--config-dir requires a path argument`);
      process.exit(1);
    }
    return nextArg;
  }
  return null;
}
```

**Return Values:**
- Explicit return statements
- Return early for guard clauses
- Return booleans for validation functions

**Arrow functions:**
- Used for callbacks and short anonymous functions
- Example:
```javascript
rl.question(`  Choice [1]: `, (answer) => {
  answered = true;
  rl.close();
  // ...
});
```

## Module Design

**Exports:**
- Not applicable (this is a CLI tool, not a library)
- Uses `bin` field in package.json for executable entry point

**Barrel files:** Not used (no ES6 modules)

## File Operations

**Synchronous methods:**
- `fs.readFileSync()` for file reads
- `fs.writeFileSync()` for file writes
- `fs.existsSync()` for existence checks
- `fs.mkdirSync()` for directory creation
- `fs.rmSync()` for directory removal
- `fs.copyFileSync()` for file copying
- `fs.unlinkSync()` for file deletion
- `fs.readdirSync()` for directory listing

**Cross-platform path handling:**
- Use `path.join()` for path construction
- Use `path.join(os.homedir(), ...)` for home directory paths
- Expand `~` manually: `path.join(os.homedir(), filePath.slice(2))`

**JSON handling:**
```javascript
// Read and parse with fallback
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

// Write with formatting
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
```

## Child Process Execution

**Synchronous:**
```javascript
const { execSync, spawn } = require('child_process');
execSync('npm view get-shit-done-cc version', { encoding: 'utf8', timeout: 10000 }).trim();
```

**Asynchronous (spawned for background tasks):**
```javascript
const child = spawn(process.execPath, ['-e', script], {
  detached: true,
  stdio: 'ignore'
});
child.unref();
```

## CLI Patterns

**Argument parsing:**
```javascript
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
```

**Flag detection:**
```javascript
const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');
```

**Argument with value:**
```javascript
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`--config-dir requires a path argument`);
      process.exit(1);
    }
    return nextArg;
  }
  return null;
}
```

**Interactive prompts:**
```javascript
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`  Choice [1]: `, (answer) => {
  rl.close();
  // handle answer
});
```

## Color Output

**ANSI escape codes defined as constants:**
```javascript
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Usage
console.log(`  ${green}✓${reset} Installed commands/gsd`);
console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
```

## Key Files

- `get-shit-done/bin/install.js` - Main installer, comprehensive examples of all patterns
- `get-shit-done/hooks/gsd-check-update.js` - Background update checker
- `get-shit-done/hooks/statusline.js` - Status line display hook
- `get-shit-done/package.json` - Package metadata (no scripts, bin entry only)

---

*Convention analysis: 2026-01-18*
