---
name: linear
description: Manage Linear issues, projects and cycles via the Linear GraphQL API
argument-hint: "Action and details, e.g. 'create issue: Fix GPS bug in LogCatchScreen, priority urgent' or 'list issues' or 'populate roadmap'"
user-invocable: true
disable-model-invocation: false
---

# Linear API Skill

Interact with Linear to create, update, and list issues using the Linear GraphQL API.

## User Input

```text
$ARGUMENTS
```

## API Key Setup

Before making any API call, check for the Linear API key:

1. Check the environment: `echo $LINEAR_API_KEY`
2. If empty, check `~/.config/tackle-tally/.env` for `LINEAR_API_KEY=...`
3. If still not found, stop and ask the user:
   > "No LINEAR_API_KEY found. Create one at https://linear.app/settings/api under Personal API Keys, then either set it as an environment variable (`export LINEAR_API_KEY=your_key`) or tell it to me and I'll store it at `~/.config/tackle-tally/.env`."

Never hardcode or commit the API key. Never print the full key value.

Store the key in a variable for the session:
```bash
LINEAR_KEY="${LINEAR_API_KEY}"
```

## Linear GraphQL Helper

All requests use this pattern:

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "QUERY_HERE"}'
```

Parse responses with `jq`. If `jq` is not installed, use `python3 -c "import sys,json; ..."` as fallback.

---

## Operations

### 1. Resolve workspace context

Always run this first to get the team ID and workflow state IDs needed for mutations:

```graphql
{
  viewer { id name email }
  teams { nodes { id name key } }
}
```

Then get workflow states for the relevant team:

```graphql
{
  workflowStates(filter: { team: { id: { eq: "TEAM_ID" } } }) {
    nodes { id name type }
  }
}
```

Map state names to IDs. Common states: Todo, In Progress, In Review, Done, Cancelled.

---

### 2. List issues

```graphql
{
  issues(
    filter: { team: { id: { eq: "TEAM_ID" } } }
    orderBy: updatedAt
  ) {
    nodes {
      id
      identifier
      title
      priority
      state { name type }
      assignee { name }
      labels { nodes { name } }
    }
  }
}
```

Display results as a readable table. Priority values: 0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low.

---

### 3. Create a single issue

```graphql
mutation {
  issueCreate(input: {
    teamId: "TEAM_ID"
    title: "TITLE"
    description: "DESCRIPTION_IN_MARKDOWN"
    priority: PRIORITY_NUMBER
    stateId: "STATE_ID"
    labelIds: ["LABEL_ID"]
  }) {
    success
    issue { id identifier title url }
  }
}
```

After creating, print the issue identifier and URL so the user can open it in Linear.

---

### 4. Update an issue

```graphql
mutation {
  issueUpdate(
    id: "ISSUE_ID"
    input: {
      stateId: "STATE_ID"
      priority: PRIORITY_NUMBER
      title: "NEW_TITLE"
    }
  ) {
    success
    issue { id identifier title state { name } }
  }
}
```

---

### 5. Populate roadmap from CLAUDE.md

When the user asks to "populate roadmap" or "sync roadmap to Linear":

1. Read `CLAUDE.md` from the repo root.
2. Parse the `## Product Roadmap` section — extract each stage, its milestones, and its scope items.
3. Check Linear for existing issues to avoid creating duplicates (match on title).
4. For each scope item not already in Linear, create an issue with:
   - **Title**: the scope item text
   - **Description**: which stage it belongs to, the milestone date, and any relevant context from CLAUDE.md
   - **Priority**: Urgent for items blocking the next milestone, High for current stage, Medium for future stages
   - **Label**: create/use labels matching the stage name (e.g. "Stage 1", "Stage 2")
5. Report a summary: how many created, how many skipped as duplicates.

---

### 6. Create a label (if needed)

```graphql
mutation {
  issueLabelCreate(input: {
    teamId: "TEAM_ID"
    name: "LABEL_NAME"
    color: "#HEX_COLOR"
  }) {
    success
    issueLabel { id name }
  }
}
```

Suggested label colours:
- Stage 1: `#22c55e` (green)
- Stage 2: `#3b82f6` (blue)
- Stage 3: `#f59e0b` (amber)
- Stage 4: `#8b5cf6` (purple)
- Bug: `#ef4444` (red)

---

## Error Handling

- If the API returns `errors`, print the message and stop. Common causes: expired key, wrong team ID, missing required fields.
- If `jq` parse fails, print the raw response for inspection.
- Never retry a mutation automatically — ask the user before retrying.

## Output Format

After each operation, summarise what was done:
- ✓ Created: **TT-12** Fix GPS bug — https://linear.app/...
- ✓ Updated: **TT-7** → In Progress
- ✓ 14 issues created, 2 skipped (already exist)
