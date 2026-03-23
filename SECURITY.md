# Security Audit Report

## Issue: Database Credentials Leaked in Git History

**Severity:** CRITICAL
**Date discovered:** 2026-03-23
**Status:** Remediated (history cleaned)

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

### Actions taken

1. Removed `.env` from all git history using `git filter-branch`
2. Cleaned up backup refs and garbage collected unreachable objects
3. Verified `.env` is listed in `.gitignore`
4. Verified `.env.example` uses placeholder values only

### Required follow-up actions (MANUAL)

These steps **must** be done by the repository owner:

1. **Rotate the database password immediately** on Render.com dashboard
   - Go to your Render PostgreSQL service
   - Generate new credentials
   - Update the `DATABASE_URL` in your Render web service environment variables

2. **Change the JWT secret** in your Render web service environment variables
   - Use a strong, random value (e.g., `openssl rand -base64 32`)
   - This will invalidate all existing user sessions (users will need to log in again)

3. **Force-push the cleaned history** to GitHub:
   ```bash
   git push origin --force --all
   ```
   > Warning: This rewrites history. All collaborators must re-clone the repository.

4. **Notify any collaborators** to re-clone the repository since the history was rewritten

### Prevention guidelines

- **Never commit `.env` files.** Always verify `.env` is in `.gitignore` before the first commit.
- Use `.env.example` with placeholder values for documentation.
- Use Render's (or your hosting provider's) environment variable configuration instead of files.
- Consider using `git-secrets` or a pre-commit hook to prevent accidental credential commits.
