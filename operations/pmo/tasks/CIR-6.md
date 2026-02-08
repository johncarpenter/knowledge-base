---
key: CIR-6
project: CIR
summary: "Add thinking agent"
status: To Do
priority: Medium
assignee: Unassigned
type: Task
created: 2025-11-28
updated: 2025-11-28
due:
epic: CIR-13
labels: []
jira_url: https://2linessoftware.atlassian.net/browse/CIR-6
synced: 2026-02-08T13:20:00-07:00
---

# CIR-6: Add thinking agent

## Description

### Overview

Implement a thinking agent capability that shows the AI's reasoning process to users, providing transparency into how the model arrives at its responses and decisions.

### Tasks

- Design the thinking agent architecture and data flow
- Implement backend support for capturing reasoning steps
- Create UI components to display thinking/reasoning process
- Add collapsible/expandable thinking sections in chat interface
- Implement streaming of thinking steps for real-time feedback
- Add toggle for users to show/hide thinking process
- Style thinking output distinctly from final responses

### UX Considerations

- **Visual Distinction**: Use different styling (indentation, color, font) for thinking vs response
- **Collapsible View**: Allow users to expand/collapse thinking sections
- **Loading States**: Show progressive thinking steps as they stream
- **Preferences**: Remember user preference for showing/hiding thinking

### Technical Considerations

- Handle models that support extended thinking (Claude, o1-style reasoning)
- Parse and format thinking tokens/blocks appropriately
- Consider token usage implications of extended thinking
- Implement caching strategy for thinking content
- Ensure thinking content is included in conversation context appropriately

### Acceptance Criteria

- [ ] Thinking agent captures reasoning steps from AI model
- [ ] UI displays thinking process in distinct, readable format
- [ ] Users can toggle thinking visibility on/off
- [ ] Streaming thinking works smoothly without UI jank
- [ ] Thinking sections are collapsible
- [ ] Feature works across supported AI models
- [ ] Mobile-responsive design for thinking display

## Local Notes

_Add context, decisions, blockers here._
