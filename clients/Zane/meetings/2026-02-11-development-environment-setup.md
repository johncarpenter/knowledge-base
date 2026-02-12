# Development Environment Setup for Zane Mobile API

**Date:** 2026-02-11 10:29 MST
**Attendees:** John, Pavel
**Folder:** Zane
**Source:** Granola (backed up 2026-02-12)

---

## Summary

Walkthrough of setting up full development environment for Zane Mobile API. Covered Docker installation, Google Cloud CLI setup, secrets management, database configuration, and Test UI application setup. Onboarded Pavel to the local development environment.

## Key Decisions

- Full dev environment runs everything except admin panel
- Docker required for development environment
- Google Cloud CLI needed for secrets management (Secrets Manager stores all environment variables)
- Local Postgres database runs in Docker container
- Test UI is separate React application on localhost:3000

## Action Items

- [ ] John: Containerize Test UI to avoid NPM issues
- [ ] John: Lock down main branch to prevent accidental pushes
- [ ] John: Set up production deployment permissions
- [ ] John: Reduce onboarding time from current session to 30 minutes
- [ ] Pavel: Connect RBC account to test model once available

## Notes

### Development Environment Overview
- Full development environment runs everything except admin panel
- Mobile device can run on local instance if needed
- Two key pieces: API and test console

### Docker Installation
- Docker required for development environment
- Docker Desktop for Silicon needed
- Requires elevated permissions during installation

### Google Cloud CLI Setup
- Access to Google Cloud required for secrets management
- Install gcloud CLI via brew
- Authentication through Zane Money Google account
- Secrets Manager stores all environment variables:
  - API keys for Vertex AI
  - DC Bank default addresses
  - Auth0 configurations
  - OpenAI connections

### Code Repository
- Zane Mobile codebase requires latest pull
- Multiple daily pushes to repository
- Make tool provides scripting shortcuts
- Python 3.12 environment
- Node.js version conflicts resolved with nvm installation

### Database Configuration
- Local Postgres database in Docker container
- PG Admin for database management
- Username: Zane, Password: Zane_password
- Migration issues required manual table creation
- Categories and Yodley category mappings needed import

### Test UI Application
- Separate React application on localhost:3000
- NPM dependency conflicts resolved with --force flag
- Environment variables from chat window
- Authentication through local development server

### Account Connection Process
- KYC approval required for user onboarding
- DC Bank account creation with manual address entry
- Yodley integration for transaction syncing
- Account linking through development interface
- Transaction categorization and classification

### Technical Issues Resolved
- Migration failures due to missing database tables
- Node.js version compatibility problems
- NPM dependency tree conflicts
- Account type mapping bug (mortgage vs mortgages)
- Category mapping between Yodley and Zane systems

---

## Transcript

<details>
<summary>Click to expand full transcript</summary>

Full transcript available in Granola meeting ID: 084ff95f-edfa-48ea-b9ff-c89eb2da83c1

</details>
