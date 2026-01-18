# Codebase Concerns

**Analysis Date:** 2026-01-18

## Tech Debt

**Main Installer Script Complexity:**
- Issue: Single monolithic file with 569 lines handling multiple responsibilities
- Files: `get-shit-done/bin/install.js`
- Impact: Difficult to maintain, test, and extend. High risk of merge conflicts.
- Fix approach: Break into modular modules (fileOperations.js, hookManager.js, validation.js)

**Incomplete Placeholder Logic:**
- Issue: Functions returning empty objects or null without clear intent
- Files: `get-shit-done/bin/install.js:53`, `get-shit-done/bin/install.js:111`, `get-shit-done/bin/install.js:114`
- Impact: Unclear error handling behavior, potential runtime issues
- Fix approach: Add proper error handling with thrown exceptions or documented edge cases

**Unused TODO Items:**
- Issue: Skill creator templates contain unfilled TODO placeholders
- Files: `.opencode/skill/skill-creator/scripts/init_skill.py`
- Impact: Incomplete skill templates may confuse users
- Fix approach: Complete template documentation or remove TODO markers

## Code Quality Issues

**Long Functions (>50 lines):**
- `get-shit-done/bin/install.js:install()` - ~165 lines, handles entire installation flow
- `get-shit-done/bin/install.js:handleStatusline()` - ~51 lines, could be decomposed
- `get-shit-done/bin/install.js:promptLocation()` - ~53 lines, prompts for user input
- `update_agents.js:updateAgentFile()` - 49 lines, approaching threshold
- Impact: Difficult to test in isolation, violates single responsibility principle
- Fix approach: Extract helper functions for file verification, output formatting, and input validation

**Deeply Nested Conditionals:**
- `get-shit-done/bin/install.js:lines 185-200` - Hook filtering logic with 4+ levels
- `get-shit-done/bin/install.js:lines 549-567` - Installation decision tree
- `get-shit-done/hooks/statusline.js:lines 32-40` - Context usage color determination
- Impact: Reduced readability, increased cyclomatic complexity
- Fix approach: Use early returns, guard clauses, or extract boolean logic to named predicates

**Magic Numbers Without Constants:**
- `get-shit-done/hooks/statusline.js:50, 65, 80` - Percentage thresholds for coloring
- `get-shit-done/hooks/statusline.js:10` - Progress bar segments
- `get-shit-done/hooks/statusline.js:10000` - Timeout in milliseconds
- `get-shit-done/hooks/gsd-check-update.js:10000` - Timeout value
- `get-shit-done/hooks/gsd-check-update.js:1000` - Timestamp conversion divisor
- `get-shit-done/bin/install.js:2` - JSON indentation
- `update_agents.js:"0.0.0"` - Default version string
- Impact: Unclear meaning, error-prone to modify, hard to maintain
- Fix approach: Define named constants (LOW_THRESHOLD, HIGH_THRESHOLD, DEFAULT_TIMEOUT_MS)

**Duplicate Verification Patterns:**
- `get-shit-done/bin/install.js:verifyInstalled()` and `verifyFileInstalled()` - Repeated logic
- Impact: Code duplication, inconsistent behavior risk
- Fix approach: Create shared utility function in `lib/verify.js`

## Security Considerations

**Safe State - No Critical Vulnerabilities Found:**
- No hardcoded API keys, passwords, or secrets detected
- No SQL injection risks (no database queries)
- No XSS vulnerabilities (no HTML rendering, React, or dangerouslySetInnerHTML)
- No command injection (exec uses hardcoded commands, not user input)
- No path traversal issues (paths derived from controlled sources)

**Environment Variable Exposure:**
- Files: `get-shit-done/bin/install.js:250`, `get-shit-done/bin/install.js:525`
- Pattern: `process.env.CLAUDE_CONFIG_DIR`
- Current mitigation: Used for configuration discovery only, not sensitive data
- Recommendation: Add validation for path existence and type before use

**File System Operations:**
- Files: Multiple scripts require fs module
- Pattern: Direct file read/write without explicit permission checks
- Current mitigation: Works within Claude Code's permission system
- Recommendation: Add explicit error handling for permission denied scenarios

## Performance Bottlenecks

**Synchronous File Operations:**
- Files: All scripts use synchronous fs operations (readFileSync, writeFileSync)
- Impact: May block event loop during large file operations
- Location: `get-shit-done/bin/install.js`, `get-shit-done/hooks/statusline.js`, `update_agents.js`
- Fix approach: Consider async alternatives for non-blocking operations

**Update Check on Every Hook Invocation:**
- File: `get-shit-done/hooks/gsd-check-update.js`
- Issue: Runs `npm view get-shit-done-cc version` on every Claude Code command
- Impact: Network latency on every command, unnecessary npm registry calls
- Fix approach: Cache results with TTL (e.g., 24 hours), use background process with timeout

## Fragile Areas

**Main Install Function:**
- File: `get-shit-done/bin/install.js:install()`
- Why fragile: Handles 10+ responsibilities, complex branching, many edge cases
- Safe modification: Add early returns for error cases, extract helpers for each responsibility
- Test coverage: None detected (integration testing only)

**Statusline Hook Processing:**
- File: `get-shit-done/hooks/statusline.js`
- Why fragile: Depends on stdin JSON format, file system state, percentage calculations
- Safe modification: Validate JSON schema before processing, add defensive null checks
- Test coverage: None detected

**Agent Update Script:**
- File: `update_agents.js`
- Why fragile: Parses frontmatter, makes assumptions about file structure
- Safe modification: Add schema validation for frontmatter, graceful error handling
- Test coverage: None detected

## Missing Critical Features

**No Automated Tests:**
- Impact: No regression detection, refactoring risk is high
- Missing: Unit tests, integration tests, lint enforcement
- Fix approach: Add Jest/Vitest configuration, write tests for core functions

**No CI/CD Pipeline:**
- Impact: No automated quality gates, manual verification required
- Missing: GitHub Actions or similar for lint, test, build verification
- Fix approach: Add workflow for PR validation

## Test Coverage Gaps

**Untested Core Functions:**
- `install.js:install()` - Entire installation logic
- `install.js:promptLocation()` - User input handling
- `install.js:handleStatusline()` - Hook configuration
- `update_agents.js:updateAgentFile()` - Agent file parsing
- `statusline.js` - All functions
- Risk: Changes may break critical workflows without detection
- Priority: High (blocks safe refactoring)

**No Test Infrastructure:**
- What's missing: Test runner configuration, assertion library, mocking framework
- Risk: Cannot add tests without infrastructure
- Priority: High

---

*Concerns audit: 2026-01-18*
