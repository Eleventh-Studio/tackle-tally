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

Parse responses with `jq`. If `jq` is not installed, use Python as fallback.

**Always use GraphQL variables for mutations** — never interpolate strings into
the query body. Descriptions contain backticks, quotes and newlines that break
inline GraphQL strings. The correct pattern in Python:

```python
body = {
    "query": "mutation CreateIssue($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { identifier title url } } }",
    "variables": {"input": {"teamId": TEAM_ID, "title": "...", "description": "...", ...}}
}
```

---

## Workspace IDs

These are the known IDs for the Tackle Tally Linear workspace. Use them directly
without querying unless they appear stale (API returns "not found" errors).

```
TEAM_ID = a800a9c6-b6c4-4c9a-afde-96c56933d0d0   # team key: TAC

# Workflow states
BACKLOG     = 00219757-0ab9-409e-823d-09fcb87976dc
TODO        = d111e04d-89a5-4b4d-be5c-c0b4fc83fe55
IN_PROGRESS = 3f57aa61-1f53-42bc-be08-e7d1cc7d8431
IN_REVIEW   = 746638aa-24f9-40f4-a99c-4516e71e8342
DONE        = be4d6a83-8adc-4ab1-b861-7bebd90f7bcc
CANCELLED   = 2f553115-f3a9-44d6-ba79-a27f87d293c0
DUPLICATE   = 85941a87-44d0-484b-be02-5e99e2d16ffd

# Labels
LABEL_STAGE_1   = f4c158d4-c29a-4e99-9b58-e3d0682b3746
LABEL_STAGE_2   = 6dd49084-715e-4efe-be6a-5a9e2feadd00
LABEL_STAGE_3   = 4a68e26c-ed5d-4fd5-b405-bc7e5e096f8e
LABEL_STAGE_4   = bb12ad67-4dfc-476a-9e88-c0e0a830d12d
LABEL_BUG       = 6065df48-3d1c-429c-92a2-b653e01e52bf
LABEL_FEATURE   = 81b0bac5-3239-463c-ae4a-05a2d5cabe43
LABEL_IMPROVE   = b803f177-7873-4f9c-ad0f-7794529a1975

# Projects (one per stage)
PROJECT_STAGE_1 = ef47a83e-7fc3-46df-9d01-8cc7af0f62b7   # Stage 1 — MVP Alpha (ends 31 May 2026)
PROJECT_STAGE_2 = d22b2023-ebd5-452b-a950-6136c87f7091   # Stage 2 — Connected Beta (ends 18 Jul 2026)
PROJECT_STAGE_3 = 6595c7a1-f639-4a63-bf0f-c3abe27787fa   # Stage 3 — AFTA Demo Build (ends 22 Aug 2026)
PROJECT_STAGE_4 = 6305fe41-2ae8-41c6-a06d-7cd4ba005965   # Stage 4 — Public Launch & Growth
```

### If IDs are missing or stale

If the above IDs return "not found" errors, re-resolve them with these queries
and update this file with the new values:

```graphql
# Re-resolve team ID
{ teams { nodes { id name key } } }

# Re-resolve workflow states (substitute actual TEAM_ID)
{
  workflowStates(filter: { team: { id: { eq: "TEAM_ID" } } }) {
    nodes { id name type }
  }
}

# Re-resolve labels
{ issueLabels { nodes { id name color } } }
```

---

## Operations

### 1. Resolve workspace context (only if IDs are stale)

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
