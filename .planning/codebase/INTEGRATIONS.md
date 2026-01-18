# External Integrations

**Analysis Date:** 2026-01-18

## AI/LLM Providers

The system integrates with multiple AI model providers through OpenCode configuration.

**Anthropic:**
- **Claude Opus 4.5 (2025-1101)** - Used for Sisyphus orchestrator and spec planning
  - Model ID: `anthropic/claude-opus-4-5-20251101`
  - Temperature: 0.1 (orchestrator), 0.2 (planning)
  - Configuration: `.opencode/oh-my-opencode.json`
  
- **Claude Sonnet 4.5 (2025-0514)** - Used for task execution
  - Model ID: `anthropic/claude-sonnet-4-5-20250514`
  - Temperature: 0.1
  - Configuration: `.opencode/oh-my-opencode.json` (task-execution category)

**Google:**
- **Gemini 3 Flash** - Used for librarian, explore, document-writer, and multimodal agents
  - Model ID: `google/gemini-3-flash`
  - Configuration: `.opencode/oh-my-opencode.json`
  
- **Gemini 3 Pro High** - Used for frontend/UI/UX engineering
  - Model ID: `google/gemini-3-pro-high`
  - Configuration: `.opencode/oh-my-opencode.json`

**OpenCode:**
- **Grok Code** - Used for explore agent
  - Model ID: `opencode/grok-code`
  - Configuration: `.opencode/oh-my-opencode.json`
  
- **GLM-4.7** - Used for OpenCode-Builder (execution agent)
  - Model ID: `opencode/glm-4.7`
  - Temperature: 0.1
  - Configuration: `.opencode/oh-my-opencode.json`

## External Tools & CLI

**Beads (bd)** - AI-native issue tracking system
- **Purpose**: Task/issue tracking and synchronization
- **Installation**: Via beads CLI
- **Repository**: https://github.com/steveyegge/beads
- **Usage**: `bd init`, `bd sync`, `bd update`, `bd close`
- **Files**: `.beads/issues.jsonl` (issue storage)

**Beads Viewer (bv)** - Graph-aware triage engine
- **Purpose**: Task prioritization, planning, and dependency visualization
- **Commands**:
  - `bv --robot-triage` - Get recommendations
  - `bv --robot-plan` - Get parallel execution tracks
  - `bv --robot-insights` - Full graph analysis
  - `bv --robot-next` - Single top pick
- **Configuration**: `.bv/` directory (local config and caches)

**OpenSpec CLI** - Spec-driven development framework
- **Purpose**: Specification management, validation, and change tracking
- **Installation**: Via OpenSpec CLI
- **Commands**:
  - `openspec init` - Initialize project
  - `openspec list` - List active changes
  - `openspec list --specs` - List existing specs
  - `openspec validate <id> --strict` - Validate change
  - `openspec archive <id> --yes` - Archive completed change
- **Location**: `openspec/` directory
- **Project context**: `openspec/project.md`

**Git** - Version control with worktree support
- **Purpose**: Source control and parallel task isolation
- **Worktrees**: Each parallel task runs in isolated worktree
  - Location: `.worktrees/worktree-<task-id>`
  - Branch: `task/<id>`
- **Hooks**: GSD installs git hooks for beads synchronization
  - Location: `get-shit-done/hooks/`

## Agent Communication

**MCP Agent Mail** - Multi-agent coordination server
- **Purpose**: Agent-to-agent communication, file reservation, and coordination
- **Type**: Remote MCP server
- **URL**: `http://127.0.0.1:8765/mcp/`
- **Authentication**: Bearer token
  - Token: `a085cb1ee93715c86e93afb804812c131381f748101b35ee25c3bcc8f5352459`
- **Configuration**: `.opencode/opencode.json`
- **Capabilities**:
  - File reservation (prevent conflicts in parallel execution)
  - Message passing between agents
  - Task status updates
  - Orchestrator coordination

## Code Hosting & Repositories

**GitHub:**
- **Main repository**: https://github.com/glittercowboy/get-shit-done
- **Changelog URL**: `https://raw.githubusercontent.com/glittercowboy/get-shit-done/main/CHANGELOG.md`
- **Beads repository**: https://github.com/steveyegge/beads
- **Oh-My-OpenCode schema**: `https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json`

## Package Registries

**npm (Node Package Manager):**
- **get-shit-done-cc** - The meta-prompting system
  - Registry: https://npmjs.com/package/get-shit-done-cc
  - Latest version: 1.6.4
  - Installation: `npx get-shit-done-cc@latest`
  - Version check: `npm view get-shit-done-cc version`

## Deployment Platforms (Referenced in Templates)

**Vercel:**
- **Usage**: Deployment target for web applications
- **Examples in templates**:
  - `https://myapp-abc123.vercel.app`
  - `https://myapp.vercel.app`
- **Local development**: `http://localhost:3000`

## External Services (Referenced in Templates)

**Authentication:**
- **Auth0** - Authentication provider
  - Documentation: https://github.com/auth0/node-jsonwebtoken
  - Used for JWT token handling patterns
  
**Payments:**
- **Stripe** - Payment processing
  - Dashboard: https://dashboard.stripe.com/register
  - Webhook endpoint: `https://[your-domain]/api/webhooks/stripe`
  - Events: `checkout.session.completed`, `customer.subscription.*`
  - Checkout examples: `https://checkout.stripe.com/pay/cs_test_abc123`

**Database:**
- **Supabase** - Backend-as-a-Service
  - Dashboard: https://supabase.com/dashboard/new
  - Used for database patterns in templates

**Email:**
- **SendGrid** - Email delivery service
  - Signup: https://signup.sendgrid.com/

## Documentation & Schema References

**JSON Schemas:**
- OpenCode config: `https://opencode.ai/config.json`
- Oh-My-OpenCode: `https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json`
- npm package: `https://json.schemastore.org/package.json`

## Environment Configuration

**Environment Variables:**
- `CLAUDE_CONFIG_DIR` - Custom Claude configuration directory
  - Used when `~/.claude/` tilde expansion fails (Docker/container environments)
  - Priority: Command line `--config-dir` > `CLAUDE_CONFIG_DIR` > Default

**Configuration Locations:**
- Global install: `~/.claude/`
- Local install: `./.claude/`
- Cache: `~/.claude/cache/`
- Todos: `~/.claude/todos/`
- GSD version: `~/.claude/get-shit-done/VERSION`

**Required External Services:**
- MCP Agent Mail server (http://127.0.0.1:8765/mcp/)
- Git repository
- npm registry (for version checks)

## Webhooks & Callbacks

**Outgoing Webhooks (templates reference):**
- Stripe webhooks: `https://[your-domain]/api/webhooks/stripe`
- Local testing: `http://localhost:3000/api/webhooks/stripe`

## CI/CD & Integration

**GitHub Actions (referenced in templates):**
- Workflows location: `.github/workflows/ci.yml`

**Beads Integration:**
- Sync branch: `beads-sync`
- Hooks: Installed via `bd hooks install`
- Merge strategy: Custom merge driver for `.beads/issues.jsonl`

---

*Integration audit: 2026-01-18*
