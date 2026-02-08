# Jira Project Management

Manage Jira issues across all client projects. This skill provides quick access to view, create, update, and transition issues.

## Available Commands

When the user invokes `/jira`, determine their intent and execute the appropriate action:

| Intent | Action |
|--------|--------|
| No arguments or "status" | Show current sprint/active issues |
| "my" or "mine" | Show issues assigned to me |
| "search [query]" | Search with JQL |
| "create [project]" | Create a new issue |
| "[ISSUE-KEY]" (e.g., PAC-123) | Show issue details |
| "update [KEY]" | Update an existing issue |
| "move [KEY] [status]" | Transition issue to new status |
| "projects" | List available projects |

---

## 1. Show My Active Issues (Default)

When user runs `/jira` with no arguments or `/jira status`:

```
Use mcp__jira__jira_search with JQL:
"assignee = currentUser() AND resolution = Unresolved ORDER BY priority DESC, updated DESC"
```

Display results as:

```markdown
## Your Active Issues

| Key | Summary | Status | Priority | Updated |
|-----|---------|--------|----------|---------|
| PAC-123 | Fix login bug | In Progress | High | 2h ago |

**Quick actions**: `/jira PAC-123` for details, `/jira move PAC-123 done` to complete
```

---

## 2. Search Issues

When user runs `/jira search [query]` or `/jira [project] [status]`:

Examples:
- `/jira search project = PAC AND status = "In Progress"`
- `/jira PAC open` → translates to `project = PAC AND status = Open`
- `/jira Circuit` → translates to `project = CIRCUIT AND resolution = Unresolved`

```
Use mcp__jira__jira_search with the JQL query
Limit to 20 results by default
```

### Common JQL Shortcuts

| Shortcut | JQL |
|----------|-----|
| `/jira [PROJECT]` | `project = [PROJECT] AND resolution = Unresolved` |
| `/jira [PROJECT] backlog` | `project = [PROJECT] AND status = Backlog` |
| `/jira [PROJECT] sprint` | `project = [PROJECT] AND sprint in openSprints()` |
| `/jira overdue` | `assignee = currentUser() AND duedate < now()` |
| `/jira created today` | `created >= startOfDay()` |

---

## 3. Get Issue Details

When user provides an issue key like `/jira PAC-123`:

```
Use mcp__jira__jira_get_issue with the issue key
```

Display:

```markdown
## PAC-123: Fix authentication timeout

**Status**: In Progress → Done (available transitions)
**Priority**: High
**Assignee**: John Carpenter
**Reporter**: Jane Smith
**Created**: 2026-02-01
**Updated**: 2026-02-08

### Description
[Full description here]

### Comments (latest 3)
- **Jane** (2h ago): Can you check the session config?
- **John** (1h ago): Found the issue, fixing now

**Actions**:
- `/jira move PAC-123 done` - Mark complete
- `/jira update PAC-123` - Edit details
```

---

## 4. Create Issue

When user runs `/jira create [PROJECT]`:

1. If project not specified, ask which project
2. Prompt for required fields:
   - **Summary**: Brief title
   - **Description**: Detailed description (you can expand brief input)
   - **Issue Type**: Task, Bug, Story (default: Task)
   - **Priority**: Optional (default: Medium)

```
Use mcp__jira__jira_create_issue with:
- project_key: The project key
- summary: Issue title
- issue_type: Task/Bug/Story
- description: Full description (expand user's brief input)
- Additional fields as needed
```

After creation, display the new issue key and link.

---

## 5. Update Issue

When user runs `/jira update [KEY]`:

Ask what to update:
- Summary
- Description
- Priority
- Assignee
- Labels
- Due date

```
Use mcp__jira__jira_update_issue with the fields to change
```

---

## 6. Transition Issue (Move Status)

When user runs `/jira move [KEY] [status]` or `/jira done [KEY]`:

Common shortcuts:
- `/jira done PAC-123` → Transition to Done
- `/jira start PAC-123` → Transition to In Progress
- `/jira move PAC-123 review` → Transition to In Review

```
1. Use mcp__jira__jira_get_issue to get available transitions
2. Match user's status to available transition
3. Use mcp__jira__jira_transition_issue to move it
```

---

## 7. List Projects

When user runs `/jira projects`:

```
Use mcp__jira__jira_search with JQL: "project is not EMPTY"
Extract unique project keys, or use a projects listing endpoint if available
```

Display:
```markdown
## Available Projects

| Key | Name |
|-----|------|
| PAC | Pacwest |
| CIRCUIT | Circuit |
| JOT | JOT Admin |
```

---

## Client Project Mapping

For context, here are the known client projects:

| Client | Jira Project Key |
|--------|-----------------|
| Circuit | CIR |
| JOT Digital | JOT |
| Pacwest | PAC |
| 2Lines Software | PER |
| Runboard 2.0 | RUN |
| Stratenym | STRAT |
| Zane | ZANE |

When user mentions a client name, map to the appropriate project key.

---

## Error Handling

- **Not authenticated**: Tell user to run `source .env` and restart Claude
- **Project not found**: List available projects
- **Issue not found**: Suggest searching with `/jira search`
- **Transition not available**: Show available transitions for the issue

---

## Integration with PMO

After any Jira operation, consider:
- If creating/completing issues, ask if user wants to log time (link to client skill like `/circuit`)
- For cross-project view, suggest `/pmo` for dashboard
- After creating issues, run `/pmo-sync` to update local cache
- For weekly planning, suggest `/weekly-plan`
- For capacity tracking, suggest `/capacity`

Local task cache: `operations/pmo/tasks/`
Client pages: `operations/pmo/clients/`
