---
description: Create or update weekly plan with prioritized Epics
---

# Weekly Planning

Interactive weekly planning - prioritize Epics, then select tasks from those Epics.

**Usage:** `/weekly-plan [action]`

**Examples:**
- `/weekly-plan` - Start new weekly plan or show current
- `/weekly-plan review` - Review and reprioritize current week
- `/weekly-plan archive` - Archive current week and start fresh

## Process

### 1. Determine Current Week

Calculate ISO week: `2026-W06` (week of Feb 2-8)

### 2. Check Existing Plan

Read `operations/pmo/weekly-plan.md` to see if "Current Week" section is populated.

### 3. If Starting Fresh

#### 3a. Gather Open Epics

Query Jira for all open Epics across projects:

```
jql: "issuetype = Epic AND status != Done ORDER BY priority DESC, project ASC"
fields: "summary,status,priority,project"
```

Or read from local `operations/pmo/epics/` files.

#### 3b. Show Epics for Selection

Present Epics grouped by priority:

```markdown
## Open Epics for Week Planning

### High Priority
1. [ ] CIR-13: AI & Chat Features (Circuit) - In Progress
2. [ ] CIR-14: Data Import/Export (Circuit) - To Do
3. [ ] PAC-8: Data Warehouse (Pacwest) - In Progress

### Medium Priority
4. [ ] CIR-15: UI Polish (Circuit) - To Do
5. [ ] PAC-14: Dashboard Improvements (Pacwest) - To Do

### Low Priority
6. [ ] CIR-16: Mobile Optimization (Circuit) - To Do
...

**Select 2-3 Epics to focus on this week** (comma-separated numbers):
```

#### 3c. Get User Selection

Use AskUserQuestion to get selected Epics.

#### 3d. Show Tasks from Selected Epics

For each selected Epic, query child tasks:

```
jql: "parent = {EPIC_KEY} AND status != Done"
```

Or read from local `operations/pmo/tasks/` files where `epic` matches.

```markdown
## Tasks in Selected Epics

### CIR-13: AI & Chat Features
- [ ] CIR-50: Implement chat UI (To Do)
- [ ] CIR-51: Add AI response handling (In Progress)
- [ ] CIR-52: Chat history storage (To Do)

### PAC-8: Data Warehouse
- [ ] PAC-20: Schema design (In Progress)
- [ ] PAC-21: ETL pipeline (To Do)

**Select tasks to work on this week** (comma-separated, or "all" for all tasks):
```

#### 3e. Update weekly-plan.md

Update the "Current Week" section in `operations/pmo/weekly-plan.md`:

```markdown
## Current Week

**Week of:** 2026-02-03 to 2026-02-09 (W06)

### Epic Focus

| Priority | Epic | Project | Status |
|----------|------|---------|--------|
| 1 | [CIR-13](https://2linessoftware.atlassian.net/browse/CIR-13): AI & Chat Features | Circuit | In Progress |
| 2 | [PAC-8](https://2linessoftware.atlassian.net/browse/PAC-8): Data Warehouse | Pacwest | In Progress |
| 3 | [CIR-14](https://2linessoftware.atlassian.net/browse/CIR-14): Data Import/Export | Circuit | To Do |

### Tasks This Week

- [ ] CIR-50: Implement chat UI
- [ ] CIR-51: Add AI response handling
- [ ] PAC-20: Schema design
- [ ] PAC-21: ETL pipeline

### Commitments

- [ ] Complete chat UI implementation (CIR-50)
- [ ] Finish schema design for data warehouse
- [ ] Start AI response handling

### Notes

_Planning notes for this week._
```

### 4. If Reviewing (`review`)

- Show current week's Epics and tasks with updated Jira status
- Check progress on each Epic (how many tasks completed?)
- Ask if reprioritization needed
- Update the file with changes

### 5. If Archiving (`archive`)

- Copy current "Current Week" section to `operations/pmo/archive/2026-W06-weekly-plan.md`
- Clear the "Current Week" section in weekly-plan.md
- Prompt to start new week planning

## Output

After planning:

```markdown
## Week 06 Plan Set

**Epic Focus:** 3 Epics
**Tasks Selected:** 8 tasks

### Epic Focus

| # | Epic | Project | Tasks |
|---|------|---------|-------|
| 1 | CIR-13: AI & Chat Features | Circuit | 3 |
| 2 | PAC-8: Data Warehouse | Pacwest | 2 |
| 3 | CIR-14: Data Import/Export | Circuit | 3 |

Plan saved to `operations/pmo/weekly-plan.md`

Run `/pmo` anytime to check status.
```

## Notes

- **Epic-first planning**: Prioritize Epics, then tasks flow naturally
- Weekly plans persist in markdown for history
- Archive weekly to build a record of completed work
- Commitments are freeform - express intent, not just task lists
- Use `/pmo-sync` first to ensure local files are current
