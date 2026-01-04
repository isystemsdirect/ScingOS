# Secrets Management Guide

**Secure handling of sensitive configuration and credentials**

---

## Table of Contents

1. [Overview](#overview)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [GitHub Actions Secrets](#github-actions-secrets)
5. [Firebase Configuration](#firebase-configuration)
6. [API Keys](#api-keys)
7. [Best Practices](#best-practices)
8. [Rotation Policy](#rotation-policy)

---

## Overview

ScingOS uses multiple services that require API keys, credentials, and sensitive configuration. This guide outlines how to manage these secrets securely across different environments.

---

## Environment Variables

### Required Variables

#### Client (Next.js)

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Cloud Functions

```bash
# OpenAI
OPENAI_KEY=sk-...

# ElevenLabs (TTS)
ELEVENLABS_API_KEY=...

# Picovoice (Wake Word)
PICOVOICE_API_KEY=...

# Webhooks & External Services
WEBHOOK_SECRET=...
SLACK_WEBHOOK_URL=...

# Database (if using external DB)
DATABASE_URL=postgresql://...
```

---

## Local Development

### Setup

1. **Copy environment template**:

   ```bash
   cp .env.example client/.env.local
   ```

2. **Fill in your values**:
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Get API keys from respective service dashboards
   - Never commit `.env.local` to version control

3. **Verify setup**:
   ```bash
   cd client
   npm run dev
   # Check console for any missing env var warnings
   ```

### .env.local Example

```bash
# client/.env.local
# This file is NOT committed to git

# Firebase (Get from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDxxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=scingos-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=scingos-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=scingos-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123def456

# Environment
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## GitHub Actions Secrets

### Setting Up Secrets

1. Navigate to: `github.com/isystemsdirect/ScingOS/settings/secrets/actions`

2. Click **"New repository secret"**

3. Add each secret:

#### Required Secrets

| Secret Name                    | Description             | Where to Get            |
| ------------------------------ | ----------------------- | ----------------------- |
| `FIREBASE_TOKEN`               | Firebase CI token       | Run `firebase login:ci` |
| `FIREBASE_API_KEY`             | Firebase API key        | Firebase Console        |
| `FIREBASE_AUTH_DOMAIN`         | Firebase auth domain    | Firebase Console        |
| `FIREBASE_PROJECT_ID`          | Firebase project ID     | Firebase Console        |
| `FIREBASE_STORAGE_BUCKET`      | Firebase storage bucket | Firebase Console        |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging ID   | Firebase Console        |
| `FIREBASE_APP_ID`              | Firebase app ID         | Firebase Console        |
| `VERCEL_TOKEN`                 | Vercel deployment token | Vercel Dashboard        |
| `VERCEL_ORG_ID`                | Vercel organization ID  | Run `vercel` locally    |
| `VERCEL_PROJECT_ID`            | Vercel project ID       | Run `vercel` locally    |
| `OPENAI_KEY`                   | OpenAI API key          | OpenAI Dashboard        |
| `ELEVENLABS_API_KEY`           | ElevenLabs API key      | ElevenLabs Dashboard    |
| `PICOVOICE_API_KEY`            | Picovoice API key       | Picovoice Console       |
| `SNYK_TOKEN`                   | Snyk security token     | Snyk Dashboard          |

### Getting Firebase CI Token

```bash
firebase login:ci
# Follow prompts, copy the token
# Add to GitHub Secrets as FIREBASE_TOKEN
```

### Getting Vercel Credentials

```bash
cd client
vercel link
# This creates .vercel/project.json
cat .vercel/project.json
# Copy orgId and projectId to GitHub Secrets
```

---

## Firebase Configuration

### Production vs Development

Use separate Firebase projects for each environment:

- **Development**: `scingos-dev`
- **Staging**: `scingos-staging`
- **Production**: `scingos-prod`

### Setting Up Multiple Projects

```bash
# Add development project
firebase use --add
# Select project from list
# Alias: dev

# Add staging project
firebase use --add
# Alias: staging

# Add production project
firebase use --add
# Alias: production

# Switch between projects
firebase use dev
firebase use production
```

### Deploy to Specific Project

```bash
# Deploy to staging
firebase deploy --project staging

# Deploy to production
firebase deploy --project production
```

---

## API Keys

### OpenAI

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy immediately (won't be shown again)
4. Add to `.env.local` and GitHub Secrets

### ElevenLabs

1. Go to [ElevenLabs Profile](https://elevenlabs.io/)
2. Navigate to Profile > API Keys
3. Generate new key
4. Add to secrets

### Picovoice

1. Go to [Picovoice Console](https://console.picovoice.ai/)
2. Navigate to Access Keys
3. Create new access key
4. Add to secrets

---

## Best Practices

### ✅ DO

- **Use environment variables** for all secrets
- **Separate secrets per environment** (dev, staging, prod)
- **Rotate secrets regularly** (every 90 days minimum)
- **Use least privilege access** - only grant necessary permissions
- **Audit secret access** - monitor who accesses what
- **Delete unused secrets** immediately
- **Use secret scanning** tools (GitHub Advanced Security)
- **Document all secrets** in this guide

### ❌ DON'T

- **Never commit secrets** to version control
- **Never share secrets** via email, Slack, etc.
- **Never hardcode secrets** in source code
- **Never reuse secrets** across environments
- **Never use weak secrets** (use strong random values)
- **Never expose secrets** in logs or error messages
- **Never store secrets** in plaintext files

---

## Rotation Policy

### When to Rotate

**Immediately**:

- Secret is compromised or suspected breach
- Employee with access leaves
- Public exposure (git commit, logs, etc.)

**Regularly**:

- Production secrets: Every 90 days
- Development secrets: Every 180 days
- Service account keys: Every 90 days

### How to Rotate

1. **Generate new secret** in service dashboard
2. **Update GitHub Secrets** with new value
3. **Update local `.env.local`** if needed
4. **Test thoroughly** in staging
5. **Deploy to production**
6. **Verify old secret** no longer works
7. **Delete old secret** from service
8. **Document rotation** in audit log

---

## Emergency Response

### If Secret is Compromised

1. **Immediately rotate** the affected secret
2. **Revoke old secret** in service dashboard
3. **Audit access logs** to determine scope
4. **Notify team** via secure channel
5. **Update all deployments** with new secret
6. **Monitor for suspicious activity**
7. **Document incident** for future reference

### Contacts

- **Security Lead**: isystemsdirect@gmail.com
- **On-Call**: [Your on-call rotation]

---

## Verification Checklist

Before deploying:

- [ ] All required secrets are set in GitHub Actions
- [ ] Firebase project is correctly selected
- [ ] Vercel project is linked
- [ ] API keys are valid and have correct permissions
- [ ] `.env.local` is in `.gitignore`
- [ ] No secrets appear in git history
- [ ] Production secrets differ from development
- [ ] Team members have documented access

---

## Resources

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Environment Configuration](https://firebase.google.com/docs/functions/config-env)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

_Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC_
