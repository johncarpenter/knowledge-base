---
name: email-summary
description: >
  Summarize emails from Gmail and Exchange accounts for a specified time period and save
  to a local markdown file. Categorizes emails into actionable groups: Tasks, Response Needed,
  Informational, and Other. Use this skill whenever the user wants to: get an email digest,
  summarize recent emails, create an email report, review emails from a date range, or
  export email summaries.
  Triggers: "email summary", "summarize emails", "email digest", "email report",
  "what emails", "recent emails summary", "emails from last week", "email roundup".
---

# Email Summary — Gmail & Exchange Integration

Summarize emails from configured Gmail and Exchange accounts, categorize them by action type, and save to a local markdown file in `operations/emails/`.

## Available MCP Tools

### Gmail Tools
| Tool | Purpose |
|---|---|
| `mcp__gmail__gmail_list_accounts` | List configured Gmail accounts |
| `mcp__gmail__gmail_search` | Search emails with Gmail query syntax |
| `mcp__gmail__gmail_get_thread` | Get full email thread by ID |
| `mcp__gmail__gmail_summarize` | Get thread content formatted for summarization |

### Exchange Tools
| Tool | Purpose |
|---|---|
| `mcp__exchange__exchange_list_accounts` | List configured Exchange accounts |
| `mcp__exchange__exchange_search` | Search emails with KQL syntax |
| `mcp__exchange__exchange_get_message` | Get full message details |
| `mcp__exchange__exchange_get_thread` | Get conversation thread |

## Workflow

### 1. Determine Time Period

Ask the user for the date range if not specified. Common patterns:
- "today" → current date
- "yesterday" → previous day
- "this week" → Monday to today
- "last week" → previous Monday to Sunday
- "last 7 days" → rolling 7 days
- Custom range: "from YYYY-MM-DD to YYYY-MM-DD"

### 2. List Available Accounts

```
mcp__gmail__gmail_list_accounts()
mcp__exchange__exchange_list_accounts()
```

Present the list and confirm which accounts to include (default: all).

### 3. Fetch Emails

**Gmail** (use date query syntax):
```
mcp__gmail__gmail_search(account="<name>", query="after:2026/01/01 before:2026/01/08", max_results=50, include_body=true)
```

**Exchange** (use KQL syntax):
```
mcp__exchange__exchange_search(account="<name>", query="received:2026-01-01..2026-01-07", max_results=50, include_body=true)
```

### 4. Categorize Each Email

Review each email and assign to ONE category:

| Category | Criteria | Examples |
|---|---|---|
| **Tasks** | Explicit action required, assignments, deadlines | "Please complete by Friday", "Action required", task assignments |
| **Response Needed** | Awaiting your reply, questions directed at you | Direct questions, meeting requests pending response, approval requests |
| **Informational** | FYI, newsletters, updates, notifications | Status updates, automated notifications, newsletters, announcements |
| **Other** | Doesn't fit above categories | Spam, promotional, unclear intent |

### 5. Generate Summary Document

**Filename convention:** `YYYY-MM-DD-email-summary.md` (use end date of range)

**Output location:** `operations/emails/`

**Markdown format:**

```markdown
# Email Summary: [Start Date] to [End Date]

**Generated:** YYYY-MM-DD HH:MM
**Accounts:** account1, account2, account3
**Total Emails:** N

---

## Tasks That Need To Be Done

| Source | From | Subject | Date | Details |
|--------|------|---------|------|---------|
| Gmail/Exchange | sender@example.com | Subject line | YYYY-MM-DD | Brief description of task required |

### Task Details

#### [Subject Line]
- **From:** sender@example.com
- **Date:** YYYY-MM-DD
- **Account:** Gmail (account-name) / Exchange (account-name)
- **Action Required:** [Clear description of what needs to be done]
- **Deadline:** [If mentioned]

---

## Response Needed

| Source | From | Subject | Date | Details |
|--------|------|---------|------|---------|
| Gmail/Exchange | sender@example.com | Subject line | YYYY-MM-DD | What response is needed |

### Response Details

#### [Subject Line]
- **From:** sender@example.com
- **Date:** YYYY-MM-DD
- **Account:** Gmail (account-name) / Exchange (account-name)
- **Question/Request:** [What they're asking]

---

## Informational

| Source | From | Subject | Date | Summary |
|--------|------|---------|------|---------|
| Gmail/Exchange | sender@example.com | Subject line | YYYY-MM-DD | One-line summary |

---

## Other

| Source | From | Subject | Date | Notes |
|--------|------|---------|------|-------|
| Gmail/Exchange | sender@example.com | Subject line | YYYY-MM-DD | Why categorized here |

---

## Statistics

- **Tasks:** N emails
- **Response Needed:** N emails
- **Informational:** N emails
- **Other:** N emails
```

### 6. Save and Confirm

Write the file to `operations/emails/YYYY-MM-DD-email-summary.md` and confirm the path to the user.

## Date Query Reference

### Gmail Query Syntax
- `after:YYYY/MM/DD` — emails after date
- `before:YYYY/MM/DD` — emails before date
- `newer_than:7d` — last 7 days
- `older_than:1d` — older than 1 day

### Exchange KQL Syntax
- `received:YYYY-MM-DD` — specific date
- `received:YYYY-MM-DD..YYYY-MM-DD` — date range
- `received>=YYYY-MM-DD` — on or after date

## Tips

- **Large volumes:** If >50 emails, summarize in batches and combine.
- **Priority emails:** Check `importance:high` (Exchange) or `is:important` (Gmail) first.
- **Thread context:** Use `gmail_get_thread` or `exchange_get_thread` for full conversation context when categorization is unclear.
- **Deduplication:** Emails may appear in multiple searches; dedupe by message ID.

## Error Handling

- Account not found → Run list accounts and verify configuration.
- No emails in range → Confirm date format and expand range.
- MCP not connected → Check MCP server configuration.
