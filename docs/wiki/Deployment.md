# Deployment

## Executive Summary

ScingOS deployment architecture employs a cloud-native model leveraging Firebase and Google Cloud Platform infrastructure for initial phases, with a defined migration path to owned infrastructure for enterprise scale. This guide establishes deployment procedures for development, staging, and production environments, CI/CD automation patterns, monitoring and observability strategies, and operational excellence practices. Current Phase 1 Alpha operates on Firebase with manual deployment gates; future phases implement automated pipelines with blue-green deployments and canary releases.

## Purpose & Scope

### Purpose

Establish standardized deployment procedures across environments, define infrastructure-as-code patterns, implement CI/CD automation, configure monitoring and alerting systems, and ensure operational reliability for ScingOS platform components.

### Scope

**Included:**
- Environment configuration (development, staging, production)
- Firebase service deployment (Authentication, Firestore, Functions, Storage, Hosting)
- Client application deployment (web, desktop builds)
- CI/CD pipeline configuration (GitHub Actions)
- Monitoring and observability setup (Firebase Performance, Error Reporting)
- Rollback procedures and disaster recovery
- Security hardening and compliance verification
- Migration strategy to owned infrastructure (architectural)

**Excluded:**
- Local development environment setup (see [Development Guide](Development-Guide.md))
- Firebase service configuration details (see [Firebase Integration](Firebase-Integration.md))
- Application architecture design (see [Architecture](Architecture.md))
- Security policy administration (see [BANE Security](BANE-Security.md))

## Core Concepts

### Cloud-Native Architecture

ScingOS currently operates on Firebase/Google Cloud Platform:
- **Firebase Authentication:** Identity management and session handling
- **Cloud Firestore:** NoSQL document database for application data
- **Cloud Functions:** Serverless compute for backend logic (Node.js 20)
- **Cloud Storage:** Object storage for media, reports, assets
- **Firebase Hosting:** Static web hosting with CDN distribution
- **Google Cloud AI:** Gemini models for LARI engine inference

This architecture enables:
- Automatic scaling based on demand
- Global CDN distribution
- Managed infrastructure (no server administration)
- Built-in security and compliance certifications
- Pay-per-use pricing model

### Multi-Environment Strategy

**Development Environment:**
- Firebase Emulator Suite for local development
- Rapid iteration without affecting production data
- Isolated testing of Cloud Functions and security rules

**Staging Environment:**
- Dedicated Firebase project mirroring production configuration
- Full integration testing before production deployment
- Performance benchmarking and load testing
- User acceptance testing (UAT) with pilot users

**Production Environment:**
- High-availability Firebase project with SLA guarantees
- Automated monitoring and alerting
- Disaster recovery procedures and backup strategies
- Blue-green deployment capability for zero-downtime updates

### Deployment Models

**Current: Cloud-Native (Phase 1-3)**
```
Client (Web/Desktop) → Firebase Hosting/CDN
                    → Firebase Authentication
                    → Cloud Firestore
                    → Cloud Functions → LARI Engines (Google Cloud AI)
                    → Cloud Storage
```

**Future: Hybrid (Phase 4)**
```
Client → Load Balancer → ScingOS API Gateway
                      → Owned Kubernetes Cluster
                      → Private Firebase Interconnect
                      → Owned Database (PostgreSQL)
                      → LARI Engines (Self-Hosted GPUs)
```

**Long-Term: Owned Infrastructure (2027+)**
```
Client → Owned CDN/Edge
      → Owned Auth Service
      → Owned Database Cluster
      → Owned Compute (Kubernetes)
      → Owned AI Infrastructure
```

See [Architecture](Architecture.md) for detailed infrastructure design.

### CI/CD Philosophy

Automated pipelines ensure consistency and quality:
- **Continuous Integration:** Automated testing on every commit
- **Continuous Deployment:** Automated deployment to staging, manual gate for production
- **Quality Gates:** Linting, type checking, unit tests, E2E tests must pass
- **Security Scanning:** Dependency vulnerabilities, secrets detection
- **Rollback Capability:** Automated rollback on deployment failure

## System / Process Flow

### Deployment Pipeline (Staging)

```
Code Push → GitHub Actions Trigger
         → Install Dependencies
         → Linting & Type Check
         → Unit Tests
         → Build Client (Next.js)
         → Build Functions (TypeScript → JavaScript)
         → Deploy Firestore Rules
         → Deploy Storage Rules
         → Deploy Cloud Functions
         → Deploy Hosting (Client)
         → Run E2E Tests
         → Deploy Complete (or Rollback on Failure)
```

### Deployment Pipeline (Production)

```
Merge to Main → GitHub Actions Trigger
             → All CI Checks (same as staging)
             → Build Production Artifacts
             → Manual Approval Gate
             → Deploy Firestore Rules (isolated transaction)
             → Deploy Cloud Functions (gradual rollout)
             → Deploy Hosting (cache invalidation)
             → Post-Deployment Verification
             → Monitoring Alert Review
             → Success Confirmation or Rollback
```

### Rollback Procedure

```
Deployment Failure Detected
  ↓
Halt Current Deployment
  ↓
Identify Last Known Good Version
  ↓
Revert Firestore Rules (if changed)
  ↓
Rollback Cloud Functions (previous version)
  ↓
Revert Hosting Deployment (previous version)
  ↓
Verify Services Operational
  ↓
Post-Mortem Analysis
```

## Interfaces & Dependencies

### Firebase CLI

**Installation:**
```bash
npm install -g firebase-tools
firebase login
```

**Project Selection:**
```bash
# List projects
firebase projects:list

# Select project
firebase use <project-id>

# Set aliases
firebase use --add
# Prompts for alias (dev, staging, prod)
```

### Environment Configuration

**Directory Structure:**
```
.firebase/
├── .firebaserc        # Project aliases
└── firebase.json      # Firebase configuration

.env.development       # Development environment variables
.env.staging          # Staging environment variables
.env.production       # Production environment variables
```

**Firebase Configuration (.firebase/firebase.json):**
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": [{
    "source": "cloud/functions",
    "codebase": "default",
    "runtime": "nodejs20"
  }],
  "hosting": {
    "public": "client/out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{
      "source": "**",
      "destination": "/index.html"
    }]
  }
}
```

### GitHub Actions Workflows

**Staging Deployment (.github/workflows/deploy-staging.yml):**
```yaml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: pnpm install
        
      - name: Lint & Type Check
        run: |
          pnpm lint
          pnpm typecheck
          
      - name: Run Tests
        run: pnpm test
        
      - name: Build Client
        run: |
          cd client
          pnpm build
          
      - name: Build Functions
        run: |
          cd cloud/functions
          pnpm build
          
      - name: Deploy to Firebase
        run: firebase deploy --only hosting,functions,firestore,storage --project staging
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
          
      - name: Run E2E Tests
        run: pnpm test:e2e --base-url=https://staging.scingos.ai
```

**Production Deployment (.github/workflows/deploy-production.yml):**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval
    steps:
      # Similar to staging, with production configuration
      - name: Deploy to Firebase
        run: firebase deploy --project production
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Monitoring Integration

**Firebase Performance Monitoring:**
```typescript
// client/lib/performance.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();

// Automatic page load tracking
// Manual custom traces
export function startTrace(name: string) {
  return perf.trace(name);
}
```

**Error Reporting (Sentry):**
```typescript
// client/lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  tracesSampleRate: 0.1,
});
```

## Security, Privacy & Governance

### Secrets Management

**GitHub Secrets:**
- `FIREBASE_TOKEN`: Firebase CLI token for automated deployments
- `SENTRY_DSN`: Error reporting endpoint
- `GOOGLE_CLOUD_KEY`: Service account key for GCP services

**Environment Variables:**
- Never commit `.env` files to repository
- Use `.env.example` as template
- Store production secrets in Firebase environment config or GitHub Secrets

**Firebase Environment Config:**
```bash
# Set function environment variables
firebase functions:config:set \
  openai.api_key="sk-..." \
  stripe.secret_key="sk_live_..."

# Deploy with config
firebase deploy --only functions
```

### Security Hardening

**Firestore Security Rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Inspections: owner or team member access
    match /inspections/{inspectionId} {
      allow read: if request.auth != null && (
        resource.data.ownerId == request.auth.uid ||
        request.auth.uid in resource.data.teamMembers
      );
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

**Storage Security Rules:**
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Inspection photos: owner access only
    match /inspections/{inspectionId}/{fileName} {
      allow read, write: if request.auth != null && 
        firestore.get(/databases/(default)/documents/inspections/$(inspectionId)).data.ownerId == request.auth.uid;
    }
  }
}
```

**HTTPS Enforcement:**
- All Firebase Hosting serves over HTTPS only
- Custom domains require SSL certificate (automatic via Firebase)
- AIP protocol uses WSS (WebSocket Secure)

### Compliance

**SOC 2 Type II (Roadmap Q4 2026):**
- Automated audit logging via BANE SDR
- Security controls documentation
- Third-party penetration testing
- Annual recertification

**GDPR/CCPA:**
- Data export API (user can download all data)
- Data deletion API (user can request deletion)
- Privacy policy transparency
- Cookie consent management

See [BANE Security](BANE-Security.md) for detailed compliance framework.

## Operational Notes

### Deployment Checklist (Production)

**Pre-Deployment:**
- [ ] All tests passing in staging
- [ ] Performance benchmarks meet targets
- [ ] Security scan completed (pnpm audit)
- [ ] Breaking changes documented
- [ ] Database migrations tested (if applicable)
- [ ] Rollback procedure confirmed
- [ ] Stakeholders notified (maintenance window if required)

**Deployment:**
- [ ] Create release tag (semantic versioning: v0.1.0)
- [ ] Merge to main branch
- [ ] Monitor GitHub Actions pipeline
- [ ] Approve manual deployment gate
- [ ] Watch deployment logs for errors
- [ ] Verify services healthy post-deployment

**Post-Deployment:**
- [ ] Run smoke tests (critical user flows)
- [ ] Check error rates in Sentry
- [ ] Monitor Firebase Performance metrics
- [ ] Verify AIP WebSocket connectivity
- [ ] Review BANE audit logs for anomalies
- [ ] Update status page (if maintenance window used)
- [ ] Document deployment in changelog

### Rollback Procedure

**Immediate Rollback Triggers:**
- Critical security vulnerability discovered
- >5% error rate increase
- System unresponsive (>5s response time)
- Data corruption detected

**Rollback Steps:**
```bash
# 1. Identify previous stable version
firebase hosting:channel:deploy previous-stable --project production

# 2. Rollback Cloud Functions
firebase functions:delete <problematic-function> --project production
firebase deploy --only functions:<previous-version> --project production

# 3. Revert Firestore rules (if changed)
firebase deploy --only firestore:rules --project production

# 4. Verify rollback success
curl https://scingos.ai/health
```

**Post-Rollback:**
- Create incident report
- Root cause analysis
- Fix issue in develop branch
- Re-deploy to staging for verification
- Schedule production re-deployment

### Monitoring and Alerting

**Key Metrics:**
- Error rate (target: <0.1%)
- Response time (target: <2s p95)
- WebSocket connection success rate (target: >99%)
- Cloud Function execution duration
- Firestore read/write operations
- Storage bandwidth usage

**Alerting Configuration:**
```yaml
# Firebase Alerts (configured in Console)
alerts:
  - name: High Error Rate
    condition: error_rate > 1%
    duration: 5 minutes
    notification: email, slack
    
  - name: Slow Response Time
    condition: p95_latency > 5s
    duration: 10 minutes
    notification: pagerduty
    
  - name: Function Failures
    condition: function_errors > 100/hour
    duration: 5 minutes
    notification: email
```

**Status Page:**
- https://status.scingos.ai (hosted on Statuspage.io)
- Automated incident creation on deployment failures
- Performance metrics published (uptime, response time)

### Backup and Disaster Recovery

**Firestore Backups:**
```bash
# Automated daily backups (configured in GCP Console)
# Manual backup (if needed)
gcloud firestore export gs://scingos-backups/$(date +%Y-%m-%d) \
  --project scingos-production
```

**Storage Backups:**
- Versioning enabled on Cloud Storage buckets
- 30-day retention for deleted objects
- Critical data mirrored to secondary region

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours  

**Disaster Recovery Plan:**
1. Detect outage (automated monitoring)
2. Activate incident response team
3. Assess scope (database, functions, hosting)
4. Restore from latest backup
5. Verify data integrity
6. Gradually restore traffic
7. Post-mortem and improvements

## Implementation Notes

### Initial Deployment (New Environment)

**1. Create Firebase Project:**
```bash
# Web console: https://console.firebase.google.com
# Create new project, enable billing
```

**2. Enable Services:**
- Authentication (Email/Password, Google OAuth)
- Firestore Database (production mode, multi-region)
- Cloud Storage (multi-region bucket)
- Cloud Functions (Node.js 20 runtime)
- Hosting

**3. Configure Firebase CLI:**
```bash
firebase login
firebase projects:list
firebase use --add  # Select project, create alias
```

**4. Deploy Infrastructure:**
```bash
# Deploy Firestore rules and indexes
firebase deploy --only firestore

# Deploy Storage rules
firebase deploy --only storage

# Deploy Cloud Functions
cd cloud/functions
pnpm install
pnpm build
cd ../..
firebase deploy --only functions

# Deploy Hosting (client application)
cd client
pnpm install
pnpm build
cd ..
firebase deploy --only hosting
```

**5. Configure Environment Variables:**
```bash
# Set function config
firebase functions:config:set \
  app.env="production" \
  openai.api_key="..." \
  stripe.secret_key="..."

# Redeploy functions to pick up config
firebase deploy --only functions
```

**6. Configure Custom Domain (Optional):**
```bash
firebase hosting:sites:list
firebase hosting:channel:deploy live --expires 7d
# Follow instructions in Firebase Console for DNS configuration
```

### CI/CD Setup

**1. Generate Firebase Token:**
```bash
firebase login:ci
# Copy token, add to GitHub Secrets as FIREBASE_TOKEN
```

**2. Add GitHub Secrets:**
- Navigate to repository Settings → Secrets and variables → Actions
- Add secrets: `FIREBASE_TOKEN`, `SENTRY_DSN`, etc.

**3. Configure Environments:**
- Settings → Environments → New environment
- Create "staging" and "production" environments
- For production: enable "Required reviewers" (manual approval gate)

**4. Workflows Already Configured:**
- `.github/workflows/deploy-staging.yml` (auto-deploy on develop push)
- `.github/workflows/deploy-production.yml` (manual approval on main push)

### Migration to Owned Infrastructure (Architectural)

**Phase 1: Hybrid Model (2026 Q4)**
- Maintain Firebase for authentication and real-time features
- Migrate compute-intensive workloads to Kubernetes
- Private interconnect between Firebase and owned infrastructure

**Phase 2: Database Migration (2027 Q1)**
- Deploy PostgreSQL on owned infrastructure
- Implement dual-write strategy (Firebase + PostgreSQL)
- Gradual traffic migration
- Firebase as backup/fallback

**Phase 3: Full Migration (2027 Q2+)**
- All services on owned infrastructure
- Firebase retained for disaster recovery only
- Cost savings: 30-50% reduction at scale

**Migration Considerations:**
- Zero-downtime requirement (blue-green deployment)
- Data integrity verification
- Rollback capability at each phase
- Performance benchmarking (must match or exceed Firebase)

See [Architecture](Architecture.md) for detailed infrastructure design.

## See Also

### Internal Documentation

- [Architecture](Architecture.md) - System architecture and infrastructure design
- [Firebase Integration](Firebase-Integration.md) - Firebase service configuration
- [Development Guide](Development-Guide.md) - Local development and contribution
- [Getting Started](Getting-Started.md) - User onboarding and initial setup
- [BANE Security](BANE-Security.md) - Security framework and compliance
- [AIP Protocol](AIP-Protocol.md) - Communication protocol specification

### External Resources

- Firebase Documentation: https://firebase.google.com/docs
- Google Cloud Console: https://console.cloud.google.com
- GitHub Actions: https://docs.github.com/en/actions
- ScingOS Status Page: https://status.scingos.ai

## Terminology Alignment

- **CI/CD:** Continuous Integration / Continuous Deployment
- **RTO:** Recovery Time Objective (max downtime tolerance)
- **RPO:** Recovery Point Objective (max data loss tolerance)
- **Blue-Green Deployment:** Two identical environments, switch traffic instantly
- **Canary Release:** Gradual rollout to percentage of users
- **BANE:** Backend Augmented Neural Engine (security governor)
- **AIP:** Augmented Intelligence Portal (communication protocol)
- **SDR:** Security Decision Record (audit log entry)

---

**Last Updated:** December 12, 2025  
**Document Version:** 1.0  
**ScingOS Version:** 0.1.0-alpha
