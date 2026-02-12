# Suncorp Azure Cost Report

**Generated:** 2026-02-12  
**Period Analyzed:** February 1-12, 2026 vs January 1-12, 2026  
**Currency:** CAD (Canadian Dollars)  
**Report Type:** Cost Comparison Analysis

---

## Executive Summary

Suncorp's Azure infrastructure spans 9 subscriptions with total MTD costs of **CAD $8,766.70** (Feb 1-12, 2026). This represents a **129.67% increase** compared to the same 12-day period in January (CAD $3,817.08).

**Key Concern:** Significant cost escalation across multiple subscriptions, driven primarily by increased compute resources (Virtual Machines +103.5%) and storage utilization.

---

## Total Cost Comparison

| Metric | Current Period (Feb 1-12) | Previous Period (Jan 1-12) | Difference | % Change |
|--------|---------------------------|---------------------------|-----------|----------|
| **Total Cost (CAD)** | **8,766.70** | **3,817.08** | **+4,949.63** | **+129.67%** |
| **Daily Rate (CAD)** | **730.56** | **318.09** | **+412.47** | **+129.67%** |
| **Cost Increase Rate** | - | - | **+34.41/day** | - |

---

## Daily Rate Variance Analysis

**Math:**
- Current Period Daily Rate: 8,766.70 / 12 days = **CAD $730.56 per day**
- Previous Period Daily Rate: 3,817.08 / 12 days = **CAD $318.09 per day**
- Daily Increase: 730.56 - 318.09 = **CAD $412.47 per day** (+129.67%)

---

## Subscription-Level Breakdown

### 1. Prod (08882ab0-a3c3-429e-9a30-24a260354e64)

**Status:** HIGHEST SPEND | SIGNIFICANT INCREASE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **6,072.68** | **2,633.42** | **+3,439.26** | **+130.60%** |
| **Daily Rate (CAD)** | **505.22** | **219.45** | **+285.77** | **+130.60%** |

**Service Breakdown (Current Period):**
- Storage: CAD $3,086.92 (50.8%)
- Virtual Machines: CAD $2,051.34 (33.8%)
- Virtual Machines Licenses: CAD $587.94 (9.7%)
- Backup: CAD $185.87 (3.1%)
- Microsoft Defender for Cloud: CAD $75.80 (1.2%)
- Virtual Network: CAD $62.54
- Other: CAD $22.25

**Service Comparison:**
| Service | Current | Previous | Difference |
|---------|---------|----------|-----------|
| Storage | 3,086.92 | 920.83 | +2,166.09 (+235.2%) |
| Virtual Machines | 2,051.34 | 935.83 | +1,115.51 (+119.2%) |
| VM Licenses | 587.94 | 629.90 | -41.96 (-6.7%) |
| Backup | 185.87 | 72.56 | +113.31 (+156.1%) |
| Defender | 75.80 | 2.35 | +73.45 (+3,121%) |

---

### 2. Dev (3241e48c-059e-4705-af1e-3018a3fefe4f)

**Status:** CRITICAL INCREASE | INVESTIGATE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **578.26** | **22.18** | **+556.08** | **+2,506.54%** |
| **Daily Rate (CAD)** | **48.19** | **1.85** | **+46.34** | **+2,506.54%** |

**Service Breakdown (Current Period):**
- Storage: CAD $288.40 (49.9%)
- Virtual Machines Licenses: CAD $146.98 (25.4%)
- Virtual Machines: CAD $129.11 (22.3%)
- Defender: CAD $12.80 (2.2%)
- Other: CAD $1.17

**Analysis:** Development environment spending increased 25x. This suggests new VM instances or increased storage provisioning in Dev that requires review.

---

### 3. Connectivity (ec469500-27f2-4156-a3ea-a1ddba66f025)

**Status:** MODERATE INCREASE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **916.05** | **790.24** | **+125.81** | **+15.92%** |
| **Daily Rate (CAD)** | **76.34** | **65.85** | **+10.49** | **+15.92%** |

**Service Breakdown (Current Period):**
- Azure Firewall: CAD $482.01 (52.6%)
- VPN Gateway: CAD $180.72 (19.7%)
- Bandwidth: CAD $158.29 (17.3%)
- Azure Bastion: CAD $70.24 (7.7%)
- Virtual Network: CAD $24.78 (2.7%)

---

### 4. Security (780c608f-a8ce-4dbe-9be2-b447c2dbab1a)

**Status:** CRITICAL INCREASE | INVESTIGATE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **861.97** | **86.03** | **+775.94** | **+901.99%** |
| **Daily Rate (CAD)** | **71.83** | **7.17** | **+64.66** | **+901.99%** |

**Service Breakdown (Current Period):**
- Log Analytics: CAD $813.62 (94.4%)
- Azure Grafana Service: CAD $48.35 (5.6%)

**Analysis:** Log Analytics costs increased 23.7x. This indicates significantly higher ingestion volumes, retention policies, or new monitoring/logging initiatives.

---

### 5. Identity (abd809cf-b182-4f0a-b2d4-f1daad6cdfee)

**Status:** MODERATE INCREASE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **326.12** | **284.39** | **+41.73** | **+14.67%** |
| **Daily Rate (CAD)** | **27.18** | **23.70** | **+3.48** | **+14.67%** |

**Service Breakdown (Current Period):**
- Virtual Machines: CAD $297.18 (91.1%)
- Storage: CAD $18.11 (5.6%)
- Defender: CAD $10.33 (3.2%)

---

### 6. Management (a42f91c1-4c0f-417d-90a6-efff6154fffa)

**Status:** CRITICAL INCREASE | INVESTIGATE

| Metric | Current | Previous | Difference | % Change |
|--------|---------|----------|-----------|----------|
| **Total Cost (CAD)** | **11.63** | **0.82** | **+10.81** | **+1,321.35%** |
| **Daily Rate (CAD)** | **0.97** | **0.07** | **+0.90** | **+1,321.35%** |

**Service Breakdown (Current Period):**
- Microsoft Defender for Cloud: CAD $7.39 (63.6%)
- Storage: CAD $4.24 (36.5%)

---

### 7. Decommissioned (559ea400-4bea-467d-ac52-ffa6e443212a)

**Status:** NO COST

| Metric | Current | Previous |
|--------|---------|----------|
| Total Cost | CAD $0 | CAD $0 |

---

### 8. Sandbox (b5b37199-f1bf-4aca-9b74-031689283fd4)

**Status:** NO COST

| Metric | Current | Previous |
|--------|---------|----------|
| Total Cost | CAD $0 | CAD $0 |

---

### 9. Azure Subscription 2460422 (d391eea1-d59e-4b98-9f0f-58788ae9a9cd)

**Status:** NO COST

| Metric | Current | Previous |
|--------|---------|----------|
| Total Cost | CAD $0 | CAD $0 |

---

## Service-Level Cost Trends (Aggregated)

### Top 10 Services by Current Cost

| Rank | Service | Current (CAD) | Previous (CAD) | Difference | % Change |
|------|---------|---------------|----------------|-----------|----------|
| 1 | Storage | 3,397.67 | 942.22 | +2,455.45 | +260.59% |
| 2 | Virtual Machines | 2,477.63 | 1,215.57 | +1,262.06 | +103.81% |
| 3 | Log Analytics | 814.39 | 34.40 | +779.99 | +2,267.74% |
| 4 | VM Licenses | 734.92 | 633.26 | +101.66 | +16.05% |
| 5 | Azure Firewall | 482.01 | 496.66 | -14.65 | -2.95% |
| 6 | Backup | 185.87 | 72.56 | +113.31 | +156.09% |
| 7 | VPN Gateway | 180.72 | 192.92 | -12.20 | -6.32% |
| 8 | Bandwidth | 158.29 | 10.80 | +147.49 | +1,365.57% |
| 9 | Microsoft Defender | 106.31 | 4.61 | +101.70 | +2,206.86% |
| 10 | Virtual Network | 88.43 | 85.37 | +3.06 | +3.59% |

---

## Key Cost Drivers

### Critical Issues (Require Immediate Investigation)

1. **Log Analytics Spike (Security Subscription)**
   - Increase: CAD $779.99 (+2,267.74%)
   - Current: CAD $813.62 per 12 days = **CAD $67.80/day**
   - Previous: CAD $34.40 per 12 days = **CAD $2.87/day**
   - **Action:** Review ingestion rates, retention policies, and table growth

2. **Dev Environment Escalation**
   - Increase: CAD $556.08 (+2,506.54%)
   - Current: CAD $48.19 per day
   - Previous: CAD $1.85 per day
   - **Action:** Validate VM sizing, utilization, and whether resources should be running

3. **Storage Growth (Prod)**
   - Increase: CAD $2,166.09 (+235.20%)
   - Current: CAD $3,086.92 per 12 days = **CAD $257.24/day**
   - **Action:** Review data growth, redundancy settings, and archival policies

4. **Bandwidth Spike**
   - Increase: CAD $147.49 (+1,365.57%)
   - Current: CAD $158.29 per 12 days = **CAD $13.19/day**
   - **Action:** Identify outbound traffic sources, geo-redundancy, and egress patterns

---

## Recommendations

### Immediate Actions (Week 1)

1. **Storage Optimization (Prod)**
   - Review blob storage redundancy (GRS vs LRS)
   - Implement lifecycle policies to move cold data to archive
   - Check for orphaned or unused storage accounts
   - **Potential Savings:** 20-30% of storage costs

2. **Log Analytics Review (Security)**
   - Audit table ingestion rates and retention
   - Implement sampling or filtering on verbose logs
   - Review which solutions are enabled (e.g., Update Management)
   - **Potential Savings:** 30-50% of Log Analytics costs

3. **Dev Environment Validation**
   - Confirm all Dev VMs are actually in use
   - Right-size VM instances to match workload requirements
   - Consider auto-shutdown policies for non-production
   - **Potential Savings:** 40-60% of Dev spend

### Medium-Term Optimization (Weeks 2-4)

4. **Bandwidth Reduction**
   - Implement ExpressRoute if not already in place
   - Review cross-region data transfers
   - Optimize CDN usage
   - **Potential Savings:** 20-40% of bandwidth costs

5. **Backup Strategy Review**
   - Validate retention periods (currently showing +156% increase)
   - Consider backup deduplication
   - Review recovery point objectives (RPOs)
   - **Potential Savings:** 15-25% of backup costs

6. **Microsoft Defender Tuning**
   - Review Defender scope and SKUs
   - Assess coverage vs. actual security needs
   - **Potential Savings:** 10-20% of Defender costs

### Strategic Review (Weeks 4-8)

7. **Reserved Instances (RIs) Analysis**
   - Current VM spend: CAD $2,477.63 per 12 days
   - RIs could reduce compute costs 30-50%
   - **Potential Savings:** CAD $370-555 per 12 days

8. **Licensing Review**
   - VM Licenses: CAD $734.92 per 12 days
   - Evaluate Azure Hybrid Benefit applicability
   - **Potential Savings:** 10-30% of license costs

---

## Financial Projections

### Monthly Run Rate (Annualized)

**Current Trajectory (Feb data):**
- 12-day sample: CAD $8,766.70
- Projected 30-day month: **CAD $21,916.75**
- Projected annual: **CAD $262,801.00**

**Previous Baseline (Jan data):**
- 12-day sample: CAD $3,817.08
- Projected 30-day month: **CAD $9,542.70**
- Projected annual: **CAD $114,512.40**

**Annual Budget Impact:** +CAD $148,288.60 (+129.67%)

---

## Conclusion

Suncorp's Azure costs have increased significantly in February, with the primary drivers being:
1. Storage growth in Prod environment (+CAD $2,166)
2. Log Analytics escalation in Security (+CAD $780)
3. Dev environment scaling (+CAD $556)
4. Bandwidth egress surge (+CAD $147)

Immediate action on Log Analytics, Dev environment sizing, and storage optimization could reduce costs by 20-30% while maintaining necessary operational capabilities. This would bring February costs to approximately CAD $6,100-6,500 per 12 days versus the current CAD $8,766.70.

**Priority:** Schedule cost optimization working session with infrastructure and security teams within 48 hours.

---

**Report Generated:** 2026-02-12 by Suncorp Worker Agent  
**Data Source:** Azure cloud-doctor MCP (azure_get_all_subscriptions_cost_comparison)  
**Methodology:** 12-day period comparison (Feb 1-12 vs Jan 1-12, 2026)
