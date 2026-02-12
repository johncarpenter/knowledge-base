# Zane PM Weekly

**Date:** 2026-02-11 13:44 MST
**Attendees:** John, Bryce, Pavel, Alexi, Dan, Lisa
**Folder:** Zane
**Source:** Granola (backed up 2026-02-12)

---

## Summary

Weekly PM sync covering development process coordination, JSON contract discussions, and money transfer feature implementation. Key focus on improving feature scope definition before development starts and planning send/receive/request functionality for Interac e-transfers.

## Key Decisions

- API coordination already handled well via OpenAPI spec auto-generated from FastAPI routers
- Both email and SMS supported for Interac transfers (confirmed with Interac)
- Cancellation via support contact only for MVP (not front-end feature)
- Desktop clicks for receive links redirect to "use mobile app" page
- Sprint target: complete transfer feature by end of week (optimistic)
- Goal: 23-25 new screens realized next week

## Action Items

- [ ] Alexi: Design receive screens after current tasks (three flows: send, request, receive)
- [ ] Bryce: Continue Loom prototype recordings (need Loom upgrade to download/combine videos)
- [ ] Bryce: Resolve ClickUp sprint functionality with support
- [ ] John: Build receive flow functionality
- [ ] John/Pavel: Contact Jet or Adrian for dev environment testing guidance
- [ ] Pavel: Ask about Slack channel for DC Bank dev questions in tomorrow's meeting

## Notes

### Development Process & Coordination
- JSON contract discussion revealed misaligned expectations
- Initial focus on API separation between frontend/backend
- Real issue: lack of feature scope definition before development starts
- Current workflow already handles API coordination well
- OpenAPI spec auto-generated from FastAPI routers
- Single consumer (mobile) simplifies requirements
- Both developers can work on frontend/backend simultaneously

### Communication Improvements Needed
- More frequent alignment meetings between John and Alexi
- Feature requirements must be clearly defined upfront
- Prototype reviews should include all technical stakeholders

### Money Transfer Feature - Send
- Email and SMS both supported (confirmed with Interac)
- User enters recipient info, selects amount, confirms send
- Backend handles all transaction processing
- Cancellation via support contact only for MVP

### Money Transfer Feature - Receive (More Complex)
- Deep links required for mobile app integration
- Users must click links on device with logged-in account
- Separate passphrase communication needed (compliance requirement)
- Desktop clicks redirect to "use mobile app" page
- Missing receive flow identified in current prototypes

### Testing Environment
- DC Bank dev account has $1M for testing
- Need clarification on external transfer testing
- Contact Jet or Adrian for dev environment guidance

### Documentation Updates
- Loom prototype recordings in progress
- Need Loom upgrade to download/combine videos
- ClickUp sprint functionality pending support resolution

---

## Transcript

<details>
<summary>Click to expand full transcript</summary>

Full transcript available in Granola meeting ID: b47376fc-720b-4278-8f3c-3dcc796c8211

</details>
