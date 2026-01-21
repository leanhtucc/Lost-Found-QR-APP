# Git Hooks Setup

## Option 1: Manual Copy (Windows)

Copy pre-commit script to git hooks:

```bash
# Copy pre-commit hook
copy scripts\pre-commit .git\hooks\pre-commit

# Make it executable (Git Bash)
chmod +x .git/hooks/pre-commit
```

## Option 2: Using Husky (Recommended)

### Install Husky

```bash
npm install --save-dev husky
npx husky install
```

### Create pre-commit hook

```bash
npx husky add .git/hooks/pre-commit "npm run validate"
```

### Auto-enable in package.json

Add to `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

## Option 3: Manual Validation

If hooks don't work, manually run before commit:

```bash
npm run validate
```

## Testing Hook

```bash
# Try to commit something
git add .
git commit -m "test"

# Hook should run automatically
```

## Disable Hook (Temporary)

```bash
# Skip hook for one commit
git commit --no-verify -m "emergency fix"
```
