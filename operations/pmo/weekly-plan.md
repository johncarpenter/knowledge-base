# Weekly Planning

Use `/weekly-plan` to generate a new weekly plan.

---

## Current Week
<!-- This section is updated by /weekly-plan -->

**Week of:** Feb 9-15, 2026 (W07)

### Epic Focus

| Priority | Epic | Project | Status |
|----------|------|---------|--------|
| 1 | [CIR-18](https://2linessoftware.atlassian.net/browse/CIR-18): Research & Planning - POS/Instacart Reconciliation | Circuit | To Do |
| 2 | [PAC-2](https://2linessoftware.atlassian.net/browse/PAC-2): Create dashboards for financial | Pacwest | To Do |
| 3 | [JOT-10](https://2linessoftware.atlassian.net/browse/JOT-10): ACS Cleaning App Development | JOT | To Do |
| 4 | [JOT-11](https://2linessoftware.atlassian.net/browse/JOT-11): Suncorp AI & Data Transformation | JOT | To Do |
| 5 | [JOT-12](https://2linessoftware.atlassian.net/browse/JOT-12): Concrete Reflections Assessment | JOT | To Do |
| 6 | [ZANE-2](https://2linessoftware.atlassian.net/browse/ZANE-2): MVP Development | Zane | To Do |
| 7 | [ZANE-3](https://2linessoftware.atlassian.net/browse/ZANE-3): Operations & Compliance | Zane | To Do |

### Tasks This Week

**Circuit (CIR-18)**
- [ ] CIR-19: Gather sample POS and Instacart data files from client
- [ ] CIR-20: Research reconciliation matching approaches

**Pacwest (PAC-2)**
- [ ] PAC-16: Complete Balance Sheets page
- [ ] PAC-17: Complete P&L Statements page

**JOT**
- [ ] JOT-13: Develop container and test on device (ACS)
- [ ] JOT-14: Send status email to team (ACS)
- [ ] JOT-15: Prep week tech strategy (Suncorp)
- [ ] JOT-16: Review and summarize findings (Concrete Reflections)

**Zane**
- [ ] ZANE-4: Create eTransfer Backend
- [ ] ZANE-5: Get FinGoal operational
- [ ] ZANE-6: Continue Vanta work

### Commitments

- Complete Balance Sheets and P&L pages before Pacwest Dashboard Review (Mon)
- Start research on POS/Instacart reconciliation for Circuit pivot
- ACS container development and team update
- Suncorp tech strategy prep
- Zane: eTransfer backend + FinGoal + Vanta compliance

### Notes

- Circuit pivoting from original MVP epics to reconciliation focus
- Pacwest meeting Monday - deliverables needed
- JOT work is incremental across multiple client projects
- Zane managed externally - high-level tracking only

---

## How Weekly Planning Works

1. **Review Epics** - `/pmo` shows Epics by priority
2. **Pick Focus** - Select 2-3 Epics to focus on this week
3. **Select Tasks** - Choose specific tasks from those Epics
4. **Commit** - Write down deliverables
5. **Track** - Check off as completed
6. **Archive** - End of week, snapshot moves to `archive/`

---

## Epic Priority Guide

| Priority | Meaning |
|----------|---------|
| **High** | Must progress this week |
| **Medium** | Progress if time allows |
| **Low** | Backlog - not this week |

---

## Archive

Past weekly plans are stored in `operations/pmo/archive/`:

```dataview
TABLE WITHOUT ID
  file.link as "Week",
  file.mtime as "Completed"
FROM "operations/pmo/archive"
WHERE contains(file.name, "weekly-plan")
SORT file.name DESC
LIMIT 8
```
