# Suncorp Technical Strategy

**Date:** Feb 4, 2026

---

## Contents

1. Cloud Migration Progress
2. Development Metrics
3. Strategic Planning
4. Proposed Work Model

---

## Slide 2: Contents

- Cloud Migration Progress
- Proposed Work Model
- Development Metrics
- Strategic Planning

---

## Slide 3: Cloud Migration Progress

| Initiative | Status | Remaining Work |
|------------|--------|----------------|
| Performance on File Mapping | | Future work on ReportBuilder and Bluebeam |
| Operational (Monitoring, Backups and Compliance) | | |
| Support Structure | | |
| Decommission data center | | Data center shutdown test |

- Curtis will cancel contracts as needed
- WBM to handle the physical move

---

## Slide 4: Initiatives for 2026

| Initiative | Status |
|------------|--------|
| **Stabilize & optimize PACT Apps** | Keep PACT as the core workflow system, aggressively clean up tech debt and performance issues, and prioritize enhancements using clear KPIs (cost + throughput). |
| **Kick off a focused data governance program** | Start small, defining ownership, access, and structure for key data sets, driven by concrete business outcomes (e.g., finding past work/comparables without asking individuals). Use MECDB as the first governance use case: Re-scope MECDB to a lean, revenue-focused "discovery" tool under the governance framework, avoiding overbuild. |
| **Investigate and leverage gov funding programs** | Position dev resources to leverage IRAP/SRED programs for future work. This might mean building some research driven projects as a means of improving the current workflow. |

---

## Slide 5: Proposed Organizational Approach

| Function | Description | KPI | Allocation |
|----------|-------------|-----|------------|
| **Plan** | Business requirements, planning, evaluations. Typical work is strategy, planning and BPM. | Provide certainty and direction to build/run teams. May prototype business ideas. | 10% |
| **Build** | Executing build, deployment and testing. Typical work is major refactor, product development. | Deliver on-time/budget with features. | 30% |
| **Run** | Operations, bugs, security and support. Typical work is bug fixes, patches and maintenance. | Cost reduction, efficiency. Needs defined SLA. | 60% |

---

## Slide 6: Support and SLA

### Support Tiers

| Tier | Scope | Resolution |
|------|-------|------------|
| **L1 — Service Desk** | Password resets, basic troubleshooting, ticket routing | 70% of tickets resolved here |
| **L2 — Technical Support** | Known issues, documented procedures, config changes | Most remaining standard issues |
| **L3 — Expert/Engineering** | Root cause analysis, complex troubleshooting, bug diagnosis, infrastructure changes | Requires deep system knowledge |
| **L4 — Development** | Bug fixes, code changes, architectural changes, vendor escalation | Requires source code access, dev skills |

### Priority/Severity Levels

| Tier | Scope | Example Resolution |
|------|-------|-------------------|
| **P1/S1** | System down, business stopped, no workaround | Hotfix within 24 hrs |
| **P2/S2** | Major functionality impaired, workaround exists | Fix in next release (within 1 week) |
| **P3/S3** | Minor functionality impaired, workaround available | Fix within 2 sprints |
| **P4/S4** | Cosmetic, informational, minor inconvenience | Backlog, prioritized normally |

---

## Slide 7: Development Metrics

*(Metrics slide - visual content)*

---

## Slide 8: Datadog Monitoring

Datadog is the tool that allows all teams to view status of infrastructure.

**Benefits:**
- Needed for monitoring and alerting
- Allows WBM to view and respond to Level 1,2
- Allows Suncorp to respond to Level 3,4

**Cost:** Incremental cost ~$900/m (Based on servers/resource usage not users)

**Capabilities:** Will allow all the KPI, app and cloud monitoring

---

## Slide 9: Current Performance

| Scope | Projected (Feb) |
|-------|-----------------|
| Prod | $11,303 |
| Dev | $1,190 |
| Identity / Security / Connectivity | ~$4,000 |
| Dev (old) | $1,300 |
| **Total** | **$17,793** |

**Notes:**
- SQL Server accounts for ~60% of Prod spend (VM, License, Storage)
- Some one-time costs

**Optimizations:**
- Better SQL management (upgrade PACT)
- Reservations (VM)
- Resource cleanup

---

## Slide 10: Projected TCO

Projections on TCO from Sept 2025

Current trend puts us near Med-Low "watermark"

---

## Slide 11

*(Visual/chart slide - no text content)*

---

## Slide 12: PACT Initiative Status

| Initiative | Goal | KPI |
|------------|------|-----|
| PACT CI/CD | PACT Modernization | Reduced developer onboarding cost, Faster PACT workflow for appraisers |
| PACT Upgrades | PACT Modernization | Faster PACT workflow for appraisers, Reduced Cloud Spend |
| Backup & Retention Strategy + Implementation | Cloud Stability | Compliance and Security, Risk Mitigation |
| Entra ID Migration | Cloud Modernization | Reduced Cloud Spend, Simpler Employee Mgmt, PACT workflow for appraisers |
| Compute Optimization | Cloud Optimization | Reduced Cloud Spend, Monitoring Needed for KPI management, Compliance and Security, Risk Mitigation |

---

## Slide 13: JOT Working Suggestions

### Critical Must-Do
1. Backup & Retention Strategy + Implementation
2. Identity Strategy
3. End User Compute Strategy
4. Provision Development Environment - **DONE**
5. Transition to Operations
6. Monitoring
7. AVD Optimization
8. PACT Enhancements

### Should Do
9. FinOps Program
10. Device Management Strategy
11. DevOps Technical Debt Remediation
12. Data Repository Review
13. Provision QA Environment
14. Migrate ClickOps Workloads to Terraform
15. Data Governance Program
16. Compliance Framework Implementation

### Want To Do / One Day
17. PACT / TAVR 2.0
18. MECDB Web Application
19. MECDB Data Platform
20. Migrate M&S
21. Data Platform
22. Deploy F/E Tool
23. ERP Migration

---

## Slide 14: Project Prioritization

| Initiative | Status | Description |
|------------|--------|-------------|
| **CI/CD and Dev cleanup** | (Tech Debt) | Build the tools to deploy code faster. Faster on-boarding, faster bug fixes, faster on-boarding of new devs |
| **Cloud monitoring and support** | (Tech Debt) | Build monitoring dashboards and cleanup deployment. Easier to maintain and upgrade. Preventative maintenance |
| **Financial discipline** | Switch to reserved instances | |
| | (Optimization) | Lock-in resource usage for known workload (i.e. PACT). ~40% reduction in compute costs (1-3y plans) |
| **PACT** | (Tech Debt) | Fix some residual issues and minor upgrades (Entra). Easier maintenance, reduced cost, stability |
| **Data** | (New Plan) | Schedule and plan data program. Data program will gather, collect and make available all the company data. Precursor to larger initiatives |
| **TAVR/MECDB** | (Continue) | Revisit requirements for applications and begin work. TAVR could be the new PACT model, and MECDB the data program |

---

## Slide 15: Jan Planning – Cloud Team

- Finish SQL Migration
- Maximizer Switchover
- File System Switchover
- Monitoring and Management
- Data Center Decommission

---

## Slide 16: Jan Planning – Dev Team

- Maximizer Switchover
- PACT Support
- PACT Upgrading
- PACT DB external access (PowerBI, etc.)
- Deploy M&S

---

## Slide 17: Active Projects Status

| Initiative | Status |
|------------|--------|
| TAVR | On hold |
| MECDB/Web | On hold |
| PACT Applications | Updates reportbuilder + sage. Upgrades will be important soon |
| F/E Tool | Completed, moving off the updates |
| MS Import | Promising results. App dev continuing. Lower priority so it occurs during available time. Manual Processing this month |
