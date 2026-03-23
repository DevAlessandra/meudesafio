# Security Audit Report

## Issue: Database Credentials Leaked in Git History

**Severity:** CRITICAL
**Date discovered:** 2026-03-23
**Status:** Credentials still in git history - manual remediation required

### What was exposed

The `.env` file was committed to the repository across multiple commits, exposing:

| Field | Leaked Value |
|-------|-------------|
| Database User | `meudesafio_db_user` |
| Database Password | `YdG92gWHJ9IZK76tDod9K4ptrNiXsI20` |
| Database Host | `dpg-d6rnnsv5gffc7385pnh0-a.oregon-postgres.render.com` |
| Database Name | `meudesafio_db` |
| JWT Secret | `segredo_super_forte_123` |

### Commits that contained credentials

- `1bd821d` - ".env modificado" (first commit with real Render DB URL)
- `71bd796` - ".env"
- `f34f1bc` - "VITE_API"
- `5de6bc7` - "deploy"
- `291c883` - "alteracao layout"

### Current state

- `.env` is listed in `.gitignore` (correct)
- `.env.example` contains only placeholder values (correct)
- `db.js` reads from `process.env.DATABASE_URL` (correct, no hardcoded values)
- **However, the credentials remain in git history and must be cleaned**

### Required remediation steps (MANUAL)

#### 1. Rotate credentials IMMEDIATELY

- **Rotate the database password** on Render.com dashboard:
  - Go to your Render PostgreSQL service
  - Generate new credentials
  - Update the `DATABASE_URL` in your Render web service environment variables

- **Change the JWT secret** in your Render web service environment variables:
  - Use a strong, random value: `openssl rand -base64 32`
  - This will invalidate all existing user sessions (users will need to log in again)

#### 2. Clean git history

Run these commands locally to remove `.env` from all git history:

```bash
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# Clean up backup refs
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force-push the cleaned history
git push origin --force --all
```

> Warning: This rewrites history. All collaborators must re-clone the repository afterward.

#### 3. Notify collaborators

All collaborators must re-clone the repository since the history was rewritten.

### Prevention guidelines

- **Never commit `.env` files.** Always verify `.env` is in `.gitignore` before the first commit.
- Use `.env.example` with placeholder values for documentation.
- Use Render's (or your hosting provider's) environment variable configuration instead of files.
- Consider using `git-secrets` or a pre-commit hook to prevent accidental credential commits:

```bash
# Install git-secrets
brew install git-secrets  # macOS
# or: https://github.com/awslabs/git-secrets

# Set up hooks
git secrets --install
git secrets --add 'postgresql://.*:.*@'
git secrets --add 'DATABASE_URL=.*://.*:.*@'
```
