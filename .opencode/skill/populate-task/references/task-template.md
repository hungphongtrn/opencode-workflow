# Task Description Template

**CRITICAL**: Every beads issue MUST include ALL of these sections.

```markdown
## Summary
<1-2 sentence overview of what this task accomplishes and why it matters>

## Background
<Context a junior developer needs to understand:>
- What problem does this solve?
- How does this fit into the larger feature?
- Any relevant business logic or domain knowledge

## Step-by-Step Implementation

### Step 1: <First action>
<Detailed instructions with exact commands or code patterns>

### Step 2: <Second action>
<Detailed instructions with exact commands or code patterns>

### Step 3: <Continue as needed>
...

## Files to Create/Modify

| File | Action | What to Do |
|------|--------|------------|
| `src/path/to/file.ts` | CREATE | <Detailed description of file purpose and contents> |
| `src/path/to/existing.ts` | MODIFY | <Exact changes: add function X, update import Y> |

## Code Examples

### Example 1: <What this example shows>
```typescript
// Provide actual code the developer can reference or copy
// Include imports, types, and implementation
```

### Example 2: <Pattern to follow>
```typescript
// Show existing patterns in the codebase they should match
// Reference: src/existing/similar-feature.ts
```

## Dependencies & Imports
- Import X from `package-name`
- This task depends on: <list any beads IDs or completed work>
- This task blocks: <list any downstream tasks>

## Testing Requirements
- [ ] Unit test: <specific test case to write>
- [ ] Integration test: <if applicable>
- [ ] Manual verification: <steps to manually verify>

## Acceptance Criteria
- [ ] <Specific, measurable criterion 1>
- [ ] <Specific, measurable criterion 2>
- [ ] <Specific, measurable criterion 3>
- [ ] Code passes linting (`npm run lint` or equivalent)
- [ ] All tests pass (`npm test` or equivalent)

## Common Pitfalls to Avoid
- <Mistake 1 and how to avoid it>
- <Mistake 2 and how to avoid it>

## References
- Spec: openspec/changes/<change-id>/specs/<capability>/spec.md
- Design: openspec/changes/<change-id>/design.md
- Similar code: <path to existing similar implementation>
- Docs: <link to relevant documentation>

## Questions? Ask About
- <Topic 1 that might need clarification>
- <Topic 2 that might need clarification>
```

## Example: Well-Written Task

```markdown
## Summary
Create the JWT authentication middleware that validates tokens on protected API routes.
This is the foundation for all authenticated endpoints in the application.

## Background
We're adding user authentication to the app. This middleware will:
- Run before protected route handlers
- Extract JWT from Authorization header
- Validate token signature and expiration
- Attach user info to the request object

The login endpoint (separate task) will issue these tokens.

## Step-by-Step Implementation

### Step 1: Create the middleware file
Create `src/middleware/auth.ts` with the basic structure.

### Step 2: Implement token extraction
Parse the Authorization header to get the Bearer token.

### Step 3: Implement token validation
Use jsonwebtoken library to verify the token.

### Step 4: Attach user to request
Add the decoded user payload to `req.user`.

### Step 5: Export and integrate
Export the middleware and add to route definitions.

## Files to Create/Modify

| File | Action | What to Do |
|------|--------|------------|
| `src/middleware/auth.ts` | CREATE | Main middleware implementation |
| `src/middleware/index.ts` | MODIFY | Add export for auth middleware |
| `src/types/express.d.ts` | MODIFY | Extend Request type with user property |

## Code Examples

### Example 1: Middleware structure
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Example 2: Type extension pattern (follow existing pattern)
```typescript
// src/types/express.d.ts
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      email: string;
    };
  }
}
```

## Dependencies & Imports
- `jsonwebtoken` - already in package.json
- `JWT_SECRET` env var - defined in .env.example
- This task blocks: proj-ghi (Add JWT validation to routes)

## Testing Requirements
- [ ] Unit test: Valid token passes and attaches user
- [ ] Unit test: Missing token returns 401
- [ ] Unit test: Invalid token returns 401
- [ ] Unit test: Expired token returns 401

## Acceptance Criteria
- [ ] Middleware exported from `src/middleware/auth.ts`
- [ ] Correctly extracts Bearer token from header
- [ ] Validates token using JWT_SECRET
- [ ] Attaches decoded user to `req.user`
- [ ] Returns 401 with JSON error for invalid/missing tokens
- [ ] TypeScript compiles without errors
- [ ] All tests pass

## Common Pitfalls to Avoid
- Don't forget to handle the case where JWT_SECRET is undefined
- Remember to call `next()` after successful validation
- The token is after "Bearer " (with space), use substring(7) not split

## References
- Spec: openspec/changes/add-user-auth/specs/auth/spec.md
- Design: openspec/changes/add-user-auth/design.md
- Similar: src/middleware/logging.ts (middleware pattern)
- Docs: https://github.com/auth0/node-jsonwebtoken

## Questions? Ask About
- Token expiration duration (currently 24h, see design.md)
- Whether to support refresh tokens (out of scope for this task)
```