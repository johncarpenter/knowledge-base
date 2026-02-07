# Billing Configuration

This file maps clients to their Harvest and Zoho project/task IDs for time tracking.

## How to Use

- Each client has a section with their billing codes
- Skills (e.g., `/suncorp`) reference these codes when logging time
- Update this file when project codes change or new clients are added

---

## JOT Digital (Internal)

### JOT Admin and Sales
**Skill:** `/jotadmin`, `/jotsales`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `44410793` | Jot Admin and Sales | `6827764` | Meetings and Overhead |
| Zoho | `12550000000075369` | Jot Non-Billable | `12550000000075497` | Jot Admin |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `6827764` | Meetings and Overhead |
| `22518076` | Client Development |
| `125846` | Business Development |
| `24274388` | Sales |
| `125845` | Project Management |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000075491` | Internal Dev |
| `12550000000075497` | Jot Admin |
| `12550000000075503` | Jot Sales |
| `12550000000075509` | Jot Training |
| `12550000000075515` | Marketing General |
| `12550000000075521` | Zoho Project |
| `12550000000076387` | Internal Jot Projects |
| `12550000000076393` | Jot Vacation |
| `12550000000076399` | PreSales Support |
| `12550000000089411` | Jot Internal IT Support |
| `12550000000091433` | Jot Stat |

**Notes:** Non-billable internal work.
- `/jotadmin` → Harvest: Meetings and Overhead (`6827764`), Zoho: Jot Admin (`12550000000075497`)
- `/jotsales` → Harvest: Sales (`24274388`), Zoho: Jot Sales (`12550000000075503`)

---

## Suncorp

### CTO AI & Data
**Skill:** `/suncorp` (default)

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `44781206` | Suncorp AI and Data Transformation (CTO) | `9060235` | Research & Development |
| Zoho | `12550000000073232` | SUNCo297-4 - Suncorp - CTO AI & Data | `12550000000075251` | Suncorp - CTO AI & Data |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `6827764` | Meetings and Overhead |
| `9060235` | Research & Development |
| `9323678` | Design and Planning |
| `125846` | Business Development |
| `125845` | Project Management |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000075251` | Suncorp - CTO AI & Data - SUNCo297-4 |

**Notes:** Primary Suncorp work. Billable.

---

### PACT Machinery and Equipment
**Skill:** `/suncorp --project pact-me` (or separate skill?)

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `44083190` | PACT Machinery and Equipment | `125849` | Development |
| Zoho | `12550000000072953` | SUNCo297-3 - Suncorp Valuations - PACT Machinery & Equipment Module | `12550000000075299` | PACT Machinery & Equipment |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `125845` | Project Management |
| `8673437` | Operations and Support |
| `6827764` | Meetings and Overhead |
| `125849` | Development |
| `125844` | Admin |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000075299` | Suncorp - PACT Machinery & Equipment Module - SUNCo297-3 |

**Notes:** PACT module development. Billable.

---

## HQCA

### Med Application Workload Implementation
**Skill:** `/hqca`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `42984120` | HQCA Planning | `6827764` | Meetings and Overhead |
| Zoho | `12550000000071174` | HQCAo481-4 - HQCA - Med Application Workload Implementation Advisory | `12550000000076183` | Med Application Workload |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `6827764` | Meetings and Overhead |
| `125845` | Project Management |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000076183` | HQCA - Med Application Workload Implementation Advisory - HQCAo481-4 |

**Notes:** Billable advisory work.

---

## ACS Automated Cleaning

### AI Vision System Prototype
**Skill:** `/acs`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `46298598` | Automated Cleaning | `125849` | Development |
| Zoho | `12550000000067003` | AACSo959-1 - ACS Automated Cleaning - AI Vision System Prototype | `12550000000076035` | AI Vision System Prototype |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `9060235` | Research & Development |
| `125849` | Development |
| `6827763` | Design and Review |
| `125845` | Project Management |
| `125844` | Admin |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000076035` | ACS - AI Vision System Prototype - AACSo959-1 |

**Notes:** Billable prototype development.

---

## Concrete Reflections

### Fieldwire Glean Integration
**Skill:** `/concrete`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `46688079` | Concrete Reflections | `125849` | Development |
| Zoho | `12550000000165313` | COREo704-1 - Concrete Reflections - Fieldwire Glean Integration PoC | `12550000000165437` | Fieldwire Glean Integration |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `6827763` | Design and Review |
| `125849` | Development |
| `125845` | Project Management |
| `125844` | Admin |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000165437` | COREo704-1 - Concrete Reflections - Fieldwire Glean Integration PoC and Data Pipeline Deployment |

**Notes:** Billable PoC and data pipeline work.

---

## Russell Hendrix

### Enterprise Service Bus and WMS POC
**Skill:** `/rh`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `46348085` | Russell Hendrix | `125849` | Development |
| Zoho | `12550000000072572` | RUHEo761-2 - Russell Hendrix - Enterprise Service Bus and WMS POC | `12550000000076315` | ESB and WMS POC |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `3189837` | Overhead / Meetings |
| `125849` | Development |
| `9323678` | Design and Planning |
| `8448083` | Code Review |
| `125845` | Project Management |
| `125844` | Admin |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000076315` | Russell Hendrix - Enterprise Service Bus and WMS POC - RUHEo761-2 |

**Notes:** Billable POC work.

---

## Obsidian Energy

### Welltracker Assessment
**Skill:** `/obsidian`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `46348005` | Obsidian | `125849` | Development |
| Zoho | `12550000000071952` | OBENo449-1 - Obsidian Energy - Welltracker Assessment & Modernization | `12550000000075195` | Welltracker Assessment |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `6827763` | Design and Review |
| `125849` | Development |
| `8448083` | Code Review |
| `125845` | Project Management |
| `125844` | Admin |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `12550000000075195` | Obsidian - Welltracker Assessment & Modernization Planning - OBENo449-1 |

**Notes:** Billable assessment work.

---

## Stratenym

### Searchable AI Library
**Skill:** `/stratenym`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `44051994` | Seachable AI Library | `125849` | Development |
| Zoho | — | N/A | — | — |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `8693997` | Training |
| `9323678` | Design and Planning |
| `1047767` | IT Development |
| `125849` | Development |
| `125845` | Project Management |
| `125844` | Admin |

**Notes:** Harvest only (no Zoho tracking). Billable. Budget: 120 hours.

---

## Circuit

### MVP and Planning
**Skill:** `/circuit`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `44917453` | MVP and Planning | `125849` | Development |
| Zoho | — | N/A | — | — |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `125849` | Development |
| `9323678` | Design and Planning |
| `125846` | Business Development |
| `24274388` | Sales |
| `125845` | Project Management |
| `125844` | Admin |

**Notes:** Harvest only. Billable.

---

## Zane

### Contract Development
**Skill:** `/zane`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `45810822` | Contract Development | `125849` | Development |
| Zoho | — | N/A | — | — |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `125849` | Development |
| `9060235` | Research & Development |
| `6827763` | Design and Review |
| `8152079` | Deployment |
| `1047766` | IT Routine Maintenance |
| `3189837` | Overhead / Meetings |
| `125845` | Project Management |
| `125844` | Admin |

**Alternative Project:** Startup (ID: `44917458`) - for earlier startup-phase work

**Notes:** Harvest only. Billable.

---

## Other Harvest Projects (No Skill Yet)

| Project ID | Project Name | Client |
|------------|--------------|--------|
| `44083095` | TAVR ETP | jot Digital (Suncorp) |
| `42868354` | KBC EMS | jot Digital |
| `43462697` | Internal Dev Management | jot Digital |
| `43825217` | Research | Omela Inc |
| `45499667` | Niali | jot Digital |

---

## Template for New Clients

```markdown
## [Client Name]

### [Project/Engagement Name]
**Skill:** `/skillname`

| System | Project ID | Project Name | Default Task ID | Default Task Name |
|--------|------------|--------------|-----------------|-------------------|
| Harvest | `PROJECT_ID` | Project Name | `TASK_ID` | Task Name |
| Zoho | `PROJECT_ID` | Project Name | `TASK_ID` | Task Name |

**Available Harvest Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `ID` | Name |

**Available Zoho Tasks:**
| Task ID | Task Name |
|---------|-----------|
| `ID` | Name |

**Notes:** Billable/Non-billable. Any special instructions.
```

---

## Quick Reference

| Skill | Client | Harvest Project | Harvest Task | Zoho Project | Zoho Task |
|-------|--------|-----------------|--------------|--------------|-----------|
| `/jotadmin` | JOT Digital | `44410793` | `6827764` | `12550000000075369` | `12550000000075497` |
| `/jotsales` | JOT Digital | `44410793` | `24274388` | `12550000000075369` | `12550000000075503` |
| `/suncorp` | Suncorp (CTO) | `44781206` | `9060235` | `12550000000073232` | `12550000000075251` |
| `/hqca` | HQCA | `42984120` | `6827764` | `12550000000071174` | `12550000000076183` |
| `/acs` | ACS | `46298598` | `125849` | `12550000000067003` | `12550000000076035` |
| `/concrete` | Concrete Reflections | `46688079` | `125849` | `12550000000165313` | `12550000000165437` |
| `/rh` | Russell Hendrix | `46348085` | `125849` | `12550000000072572` | `12550000000076315` |
| `/obsidian` | Obsidian Energy | `46348005` | `125849` | `12550000000071952` | `12550000000075195` |
| `/stratenym` | Stratenym | `44051994` | `125849` | — | — |
| `/circuit` | Circuit | `44917453` | `125849` | — | — |
| `/zane` | Zane | `45810822` | `125849` | — | — |

---

## Common Harvest Task IDs (Reused Across Projects)

| Task ID | Task Name |
|---------|-----------|
| `125844` | Admin |
| `125845` | Project Management |
| `125846` | Business Development |
| `125849` | Development |
| `6827763` | Design and Review |
| `6827764` | Meetings and Overhead |
| `8448083` | Code Review |
| `8673437` | Operations and Support |
| `9060235` | Research & Development |
| `9323678` | Design and Planning |
