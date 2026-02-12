---
name: suncorp-kpi-report
description: Generate FinOps cost comparison report using cloud-doctor MCP for Suncorp Azure subscriptions
disable-model-invocation: true
user-invocable: false
---

# Suncorp FinOps KPI Report

Generate a cloud cost comparison report for Suncorp Azure subscriptions using the cloud-doctor MCP.

## CRITICAL: Data Integrity Rules

**NEVER fabricate, estimate, or make up numbers.** Every value in the report MUST come directly from cloud-doctor MCP responses.

1. **Only use actual data** returned by cloud-doctor MCP calls
2. **If data is unavailable**, mark as "N/A" or "Data unavailable" - do NOT guess
3. **Currency:** Use CAD (Canadian Dollars) as the primary currency
4. **Validate calculations:** Show your work for variance calculations
5. **If previous month data is missing**, explicitly state this - do not fabricate it

## Output Location

**REQUIRED:** Save the generated report to:
```
/Users/john/Documents/Workspace/2Lines/knowledge-base/clients/JOT/Suncorp/YYYY-MM-DD-cost-report.md
```

Where `YYYY-MM-DD` is the current date (e.g., `2026-02-12-cost-report.md`).

## Workflow

### Step 1: Fetch Cost Comparison Data (Single API Call)

Use the all-subscriptions comparison tool to get both current and previous month data in one call:

```
azure_get_all_subscriptions_cost_comparison()
```

This returns:
- Per-subscription current month costs
- Per-subscription previous month costs (same day range for fair comparison)
- Difference and percent change per subscription
- Aggregated totals
- Days in each period for normalization

**Record the EXACT values returned.** Do not modify or round.

### Step 2: (Optional) Fetch Additional MTD Details

If you need more granular current-month breakdown:
```
azure_get_all_subscriptions_costs()
```

### Step 3: Calculate Daily Rate Variances

The API returns raw costs for the same day range (e.g., Feb 1-12 vs Jan 1-12), so you can compare directly OR normalize to daily rates.

**For daily rate comparison (recommended for different period lengths):**

```
For each subscription from API response:
  current_cost = subscription.current_month.total
  previous_cost = subscription.previous_month.total
  days_current = response.days_in_current_period
  days_previous = response.days_in_previous_period

  current_daily_rate = current_cost / days_current
  previous_daily_rate = previous_cost / days_previous

  daily_variance_pct = ((current_daily_rate - previous_daily_rate) / previous_daily_rate) * 100
```

**Example calculation (for validation):**
```
Prod subscription:
  Current MTD (12 days): $6,072.68 CAD
  Previous MTD (12 days): $4,032.30 CAD  (from API - same day range)

  Current daily rate = $6,072.68 / 12 = $506.06/day
  Previous daily rate = $4,032.30 / 12 = $336.03/day

  Variance = (($506.06 - $336.03) / $336.03) * 100 = +50.6%
```

**Note:** The API uses the same day-of-month for comparison (Feb 1-12 vs Jan 1-12), which provides a fair like-for-like comparison.

### Step 4: Assign Trend Indicators

Based on variance percentage:
- 🟢 Decrease (< -5%)
- 🟡 Stable (-5% to +10%)
- 🔴 Increase (> +10%)

## Report Template

```markdown
# Suncorp Azure Cost Report

**Report Date:** [YYYY-MM-DD]
**Period:** [YYYY-MM-01] to [YYYY-MM-DD] ([X] days MTD)
**Previous Month:** [Previous Month YYYY] ([X] days)
**Currency:** CAD (Canadian Dollars)
**Source:** cloud-doctor MCP

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total MTD Spend (CAD) | $X,XXX.XX |
| Days Elapsed | X of Y days |
| MTD Daily Rate | $XXX.XX/day |
| Previous Month Total (CAD) | $X,XXX.XX |
| Previous Month Daily Rate | $XXX.XX/day |
| Daily Rate Variance | +X.X% [indicator] |

**Overall Status:** [🟢 On Track / 🟡 Watch / 🔴 Over Budget]

---

## Raw Data from cloud-doctor

### Current Month (MTD) - Actual Values

| Subscription | MTD Cost (CAD) | Source |
|--------------|----------------|--------|
| [Name] | $X,XXX.XX | cloud-doctor get_costs(mtd) |
| ... | ... | ... |
| **TOTAL** | **$X,XXX.XX** | — |

### Previous Month - Actual Values

| Subscription | Prev Month Cost (CAD) | Source |
|--------------|----------------------|--------|
| [Name] | $X,XXX.XX | cloud-doctor get_costs(previous_month) |
| ... | ... | ... |
| **TOTAL** | **$X,XXX.XX** | — |

---

## Month-over-Month Comparison

### Daily Rate Comparison (Normalized)

| Subscription | MTD (CAD) | MTD Daily | Prev Month (CAD) | Prev Daily | Variance | Trend |
|--------------|-----------|-----------|------------------|------------|----------|-------|
| [Name] | $X,XXX.XX | $XXX.XX/day | $X,XXX.XX | $XXX.XX/day | +X.X% | 🔴 |
| ... | ... | ... | ... | ... | ... | ... |
| **TOTAL** | **$X,XXX.XX** | **$XXX.XX/day** | **$X,XXX.XX** | **$XXX.XX/day** | **+X.X%** | **🟡** |

**Calculation Method:**
- Days in current MTD: [X]
- Days in previous month: [X]
- MTD Daily Rate = MTD Cost / Days Elapsed
- Prev Daily Rate = Prev Month Cost / Days in Prev Month
- Variance % = ((MTD Daily - Prev Daily) / Prev Daily) × 100

---

## Variance Analysis

### Significant Increases (> +10%)

| Subscription | Variance | MTD Daily | Prev Daily | Notes |
|--------------|----------|-----------|------------|-------|
| [Name] | +X.X% | $XXX.XX | $XXX.XX | [Observation] |

### Significant Decreases (< -5%)

| Subscription | Variance | MTD Daily | Prev Daily | Notes |
|--------------|----------|-----------|------------|-------|
| [Name] | -X.X% | $XXX.XX | $XXX.XX | [Observation] |

### Stable (-5% to +10%)

[List subscriptions]

---

## Trend Indicators

| Indicator | Variance Range | Meaning |
|-----------|---------------|---------|
| 🟢 | < -5% | Decreasing / Under budget |
| 🟡 | -5% to +10% | Stable / Normal range |
| 🔴 | > +10% | Increasing / Watch closely |

---

## Data Quality Notes

- All values sourced directly from cloud-doctor MCP
- No estimates or fabricated data
- [Note any missing data or API errors]

---

*Report generated by suncorp-worker agent*
*Data source: cloud-doctor MCP*
```

## Validation Checklist

Before saving the report, verify:

- [ ] All cost values came directly from cloud-doctor MCP responses
- [ ] Previous month data was actually fetched (not fabricated)
- [ ] Daily rate calculations are mathematically correct
- [ ] Variance percentages match the formula
- [ ] Trend indicators match the variance thresholds
- [ ] Currency is consistently CAD throughout

## Error Handling

- **MCP unavailable:** Report the error clearly; do not generate fake data
- **Missing previous month data:** State "Previous month data unavailable" - do NOT fabricate
- **Calculation errors:** Show the raw values and note the calculation issue

## Final Step: Save Report

After generating and validating the report, save using Write tool:

```
Write(
  file_path="/Users/john/Documents/Workspace/2Lines/knowledge-base/clients/JOT/Suncorp/YYYY-MM-DD-cost-report.md",
  content="<validated report content>"
)
```
