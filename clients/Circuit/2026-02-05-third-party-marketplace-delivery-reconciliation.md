# Third-party Marketplace Delivery Reconciliation with Circuit

**Date:** 2026-02-05 19:58
**Attendees:** John (2Lines Software), Gary Ziggler (Circuit co-founder), John Carpenter (Circuit co-founder/CTO), Byron (Circuit head of sales)

## Summary

Introduction meeting with Circuit, a platform for automated discrepancy recovery on third-party delivery platforms. Circuit uses AI/ML to match POS logs with platform transaction logs to identify pricing mismatches, substitutions, and weight discrepancies.

## Circuit Overview

- Co-founders: Gary Ziggler (San Francisco), John Carpenter (CTO)
- Byron: Head of sales (Canada)
- 22+ years retail/POS/payments experience
- Built technology processing 10%+ of US credit cards
- Developed first retail language model (LLM)
- Previous clients: MasterCard, Coca-Cola, Instacart, Fiserv, US Bank
- **Pricing model:** Success-based — keep 75% of recovered funds, Circuit takes 25%

## Neiman's Current Operations & Pain Points

- **141 total stores** across multiple formats:
  - 55 grocery stores
  - 40 Ace Hardware stores
  - 20 convenience stores
  - 14 Little Caesar restaurants
  - 11-12 pet stores
- **Third-party delivery volume:**
  - Instacart: ~$450k/month (grocery only)
  - DoorDash: ~$150k/month (grocery), ~$160k/month (restaurants)
  - Little Caesar restaurants: DoorDash, Uber, Grubhub combined
- **Current reconciliation approach:** Only investigate discrepancies >$3
  - Manual process too time-intensive for smaller variances
  - Example: weekend sale pricing ($2 to $1) not reflected in platform files
- All credit card processing through Fiserv
- C Corp structure means 1099-K forms blend with MasterCard processing

## Implementation Plan

- **Initial 30-day pilot scope:**
  - Instacart and DoorDash logs
  - POS transaction logs
  - 1099-K forms
- **Optional data for improved accuracy:**
  - ACH settlement reports
  - Card transaction bin ranges (already available)
- **Deliverables:**
  - Order ledger discrepancy reports with confidence scores
  - Spreadsheets showing expected vs. actual amounts per transaction
  - Evidence packets for platform dispute submissions

## Action Items

- [ ] Circuit sends NDA and contract terms
- [ ] Eric and Chris prepare transaction log data
- [ ] Eric escalates to operations leadership for approval
