---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git commit:*)
description: Commit staged files using conventional commits format
---

## Context

- Staged changes: !`git diff --cached --stat`
- Staged diff: !`git diff --cached`
- Recent commits (for style reference): !`git log --oneline -10`

## Your task

Create a git commit for the **staged files only**. Do NOT stage any new files.

### Conventional Commits Specification

The commit message MUST follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Allowed types:**
- `feat`: A new feature (correlates with MINOR in semver)
- `fix`: A bug fix (correlates with PATCH in semver)
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (whitespace, formatting)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools

**Rules:**
1. Type is required and must be lowercase
2. **Scope is optional and should ONLY be used if the user explicitly specifies it in their input** (e.g., `/commit use "backend" as scope`). Do NOT infer or add scopes automatically.
3. Description must be concise, imperative mood ("add" not "added")
4. Body provides additional context if needed (separated by blank line)
5. Footer contains references like `BREAKING CHANGE:` or issue refs

### Instructions

1. If there are no staged changes, inform the user and stop
2. Analyze the staged diff to understand what changed
3. Check if the user explicitly requested a scope in their input (e.g., `use "backend" as scope`)
4. Generate a conventional commit message based on the changes:
   - Include scope ONLY if explicitly requested by the user
   - Otherwise, use format `<type>: <description>` without scope
5. **Ask for confirmation before committing:**
   - Display the proposed commit message
   - List the files that will be committed
   - Use AskUserQuestion to ask the user to confirm or reject the commit
6. Only if the user confirms, create the commit using the generated message
7. Show the commit result

If the user provides arguments ($ARGUMENTS), use them as guidance for the commit message but ensure it follows conventional commits format.

User input: $ARGUMENTS
