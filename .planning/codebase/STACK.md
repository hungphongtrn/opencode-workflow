# Technology Stack

**Analysis Date:** 2026-01-18

## Languages

**Primary:**
- **JavaScript (Node.js)** - Main implementation language for the system
- **TypeScript** - Used in @opencode-ai packages for type safety
- **Python 3** - Used in skill creation scripts

**Secondary:**
- **Markdown** - Skills, agents, and documentation are defined in Markdown
- **JSON** - Configuration files and data interchange
- **YAML** - OpenSpec specifications and workflow definitions

## Runtime

**Environment:**
- **Node.js** >= 16.7.0 - Primary runtime for GSD system
- **Python 3** - Runtime for skill creation and validation scripts
- **Claude Code** - Execution environment (the system runs within Claude Code)

**Package Manager:**
- **npm** - Primary package manager
- Lockfile: `bun.lock` in `.opencode/` directory
- Installation via npx: `npx get-shit-done-cc`

## Frameworks

**Core:**
- **OpenCode CLI** - Base framework for the orchestration system
  - Configuration: `.opencode/opencode.json`
  - Agent configuration: `.opencode/oh-my-opencode.json`
  - Skills: Markdown-based workflow definitions in `.opencode/skill/`
  
- **@opencode-ai/plugin** (1.1.25) - OpenCode AI plugin integration
  - Provides tool abstractions for agent execution
  - Location: `.opencode/node_modules/@opencode-ai/plugin/`
  
- **@opencode-ai/sdk** (1.1.25) - OpenCode AI SDK
  - Client/server implementations for OpenCode API
  - Location: `.opencode/node_modules/@opencode-ai/sdk/`

**Build/Dev:**
- **TypeScript** (5.8.2) - Type checking and compilation
  - Configured in @opencode-ai packages
- **tsc** - TypeScript compiler
- **tsgo** - TypeScript Go tool for type checking

## Key Dependencies

**Critical:**
- **zod** (4.1.8) - Schema validation library
  - Used in @opencode-ai/plugin for input validation
  - Location: `.opencode/node_modules/zod/`
  
**Infrastructure:**
- **get-shit-done-cc** (1.6.4) - The meta-prompting system itself
  - Installed as npm package
  - Entry point: `bin/install.js`
  - Published to npm: https://npmjs.com/package/get-shit-done-cc

**Build Tools:**
- **typescript** (5.8.2) - TypeScript compiler and type checker
- **@tsconfig/node22** (22.0.2) - TypeScript config for Node 22
- **@hey-api/openapi-ts** (0.90.4) - OpenAPI TypeScript generator (in devDependencies)

## Configuration

**Environment:**
- **CLAUDE_CONFIG_DIR** - Environment variable for Claude config directory
  - Default: `~/.claude/`
  - Overridden by `--config-dir` or `--global` flags
  - Used in: `get-shit-done/bin/install.js`

**Configuration Files:**
- `.opencode/opencode.json` - MCP server configuration
  - Schema: `https://opencode.ai/config.json`
  - Contains MCP Agent Mail settings
  
- `.opencode/oh-my-opencode.json` - Agent and category configuration
  - Schema: `https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json`
  - Defines AI model providers and agent settings
  
- `.claude/settings.json` - Claude Code session hooks
  - SessionStart hook for update checking
  - StatusLine hook for real-time context display
  
- `.claude/hooks/gsd-check-update.js` - GSD update checker (background process)
- `.claude/hooks/statusline.js` - Real-time status display

**Node.js Configuration:**
- Node >= 16.7.0 required
- Type: ESM (`"type": "module"` in @opencode-ai packages)

## Platform Requirements

**Development:**
- Node.js >= 16.7.0
- Python 3 (for skill creation scripts)
- npm or bun package manager
- Git with worktree support
- Claude Code CLI

**Production:**
- Node.js runtime
- Git repository
- MCP Agent Mail server (http://127.0.0.1:8765/mcp/)
- Beads CLI (bd) for issue tracking
- OpenSpec CLI for spec validation

## Directory Structure

```
/Users/phong/Workspace/opencode-workflow/
├── .opencode/                    # OpenCode configuration
│   ├── agents/                   # Agent definitions (Markdown)
│   ├── command/                  # Slash command definitions
│   ├── skill/                    # Skill definitions (Markdown)
│   ├── node_modules/             # Dependencies
│   ├── opencode.json            # MCP configuration
│   └── oh-my-opencode.json      # Agent configuration
├── .claude/                      # Claude Code hooks
│   ├── hooks/                    # Session hooks
│   └── settings.json            # Hook configuration
├── get-shit-done/               # GSD system
│   ├── bin/                     # Executables
│   ├── commands/                # Command definitions
│   ├── agents/                  # Agent implementations
│   ├── hooks/                   # Git hooks
│   └── package.json             # Package manifest
├── openspec/                    # OpenSpec specifications
│   ├── specs/                   # Spec definitions
│   └── project.md               # Project context
└── .planning/                   # Planning artifacts
    └── codebase/                # This documentation
```

## Key Files

**Entry Points:**
- `get-shit-done/bin/install.js` - GSD installer and setup
- `.claude/hooks/gsd-check-update.js` - Update checker
- `.claude/hooks/statusline.js` - Status display

**Configuration:**
- `.opencode/opencode.json` - MCP Agent Mail configuration
- `.opencode/oh-my-opencode.json` - AI model and agent settings
- `.claude/settings.json` - Session hooks

**Skills (Markdown-based workflows):**
- `.opencode/skill/orchestrator/` - Main orchestrator skill
- `.opencode/skill/spec-planner/` - Specification planning skill
- `.opencode/skill/task-execution/` - Task execution skill
- `.opencode/skill/batch-orchestration/` - Parallel execution skill
- `.opencode/skill/populate-task/` - Task population skill
- `.opencode/skill/populator/` - Phase population skill
- `.opencode/skill/merge-coordinator/` - Worktree merging skill
- `.opencode/skill/task-populator/` - Single phase population skill
- `.opencode/skill/skill-creator/` - Skill creation framework

---

*Stack analysis: 2026-01-18*
