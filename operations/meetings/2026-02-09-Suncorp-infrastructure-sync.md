# Weekly team status sync for Suncorp infrastructure

**Date:** 2026-02-09 15:33
**Attendees:** John Carpenter (+ Suncorp team)
**Source:** Granola (backed up 2026-02-09)

---

## Summary

### Weekend Migration Status

- DNS issue caused 30-45 minute outage after server shutdowns
  - Cloud servers couldn't resolve external domains
  - Cloud DCs were pointing to shut-down on-premises servers
  - Issue resolved, forwarding corrected
- Migration otherwise went smoothly
- Microsoft support ticket pending submission once details received

### Post-Migration Cleanup Tasks

- NSG review scheduled
- SQL-specific backups implementation
  - 15-minute resource recovery capability
  - Separate from disk backups
- Server decommissioning plan
  - Wednesday target for bulk servers (shut down 1.5 weeks ago)
  - Later timeline for weekend shutdown servers
  - Full decomp: leave domain, remove from WBM tools

### Development Work

- Report builder issue #73533 in progress
- PDF processing mapping (#14022) pending
- Windows app verification needed
- Versioning strategy for multiple packed app instances on single host
- Database backup retrieval from reactivated subscription

### SSO Pre-Check

- User UPN audit in progress
- General support tasks ongoing

### Government Project Discussion

- Meeting scheduled tomorrow with government organizations
- Research-related projects may require separate ticketing
- Long-term planning implications
- Updates to be shared in Wednesday meeting

## Key Decisions

- Server decommission target: Wednesday for bulk servers
- 15-minute SQL backup recovery capability to be implemented

## Action Items

- [ ] Submit Microsoft support ticket once details received
- [ ] NSG review
- [ ] Implement SQL-specific backups with 15-min recovery
- [ ] Decommission bulk servers on Wednesday
- [ ] Complete report builder issue #73533
- [ ] Verify Windows app
- [ ] Wednesday meeting update on government project

---

*Tags: #meeting #2lines #infrastructure #jot*
