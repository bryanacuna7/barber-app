# Memory Auto-Save System - Technical Implementation

**Version:** 1.0
**Last Updated:** 2026-02-03
**Status:** Active

---

## Overview

This document describes the automatic memory persistence system using Memory MCP for the barber-app project. The system enables Claude to remember important information across sessions without explicit user commands.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Conversation Context                     │
│  (User messages, Claude responses, file edits, commands)    │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Event Detection Layer                     │
│  ┌──────────────┬──────────────┬────────────┬─────────────┐ │
│  │ User         │ File Change  │ Command    │ Pattern     │ │
│  │ Corrections  │ Watchers     │ Completion │ Recognition │ │
│  └──────────────┴──────────────┴────────────┴─────────────┘ │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                 Information Classifier                       │
│  (Determine entity type, extract key details, find context) │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Memory MCP Layer                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ create_entities, add_observations, create_relations  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   .claude/memory.json                        │
│              (Persistent knowledge graph)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Automatic Triggers

### 1. Post-Commit Hook

**Trigger:** After `/commit` command completes
**Condition:** Commit message contains specific keywords
**Action:** Save to `lessons_learned` entity

```typescript
// Detection patterns
const commitPatterns = {
  bugFix: /fix|bug|error|issue|resolve/i,
  security: /security|vulnerability|exploit|xss|sql/i,
  breaking: /breaking|major|BREAKING CHANGE/i,
  performance: /perf|optimize|speed|slow/i,
  architecture: /refactor|migrate|restructure|architecture/i,
}

// Example implementation
async function analyzeCommit(message: string) {
  const patterns = detectPatterns(message)

  if (patterns.includes('bugFix')) {
    await mcp__memory__add_observations({
      observations: [
        {
          entityName: 'lessons_learned',
          contents: [
            `Session ${sessionId}: ${extractLesson(message)}`,
            `Context: ${getCurrentFiles()}`,
            `Fix applied: ${message}`,
          ],
        },
      ],
    })
  }
}
```

### 2. Post-Feature Completion

**Trigger:** After `/create` or `/enhance` completes
**Condition:** Feature successfully implemented
**Action:** Save architectural decisions

```typescript
async function onFeatureComplete(featureName: string, decisions: Decision[]) {
  for (const decision of decisions) {
    if (decision.isArchitectural) {
      await mcp__memory__create_entities({
        entities: [
          {
            name: `${featureName}_architecture`,
            entityType: 'architecture_pattern',
            observations: [
              `Feature: ${featureName}`,
              `Decision: ${decision.what}`,
              `Rationale: ${decision.why}`,
              `Alternatives considered: ${decision.alternatives}`,
              `Date: ${new Date().toISOString()}`,
            ],
          },
        ],
      })
    }
  }
}
```

### 3. User Correction Detection

**Trigger:** User corrects Claude's approach
**Condition:** Specific correction patterns detected
**Action:** Save to appropriate entity

```typescript
// Detection patterns
const correctionPatterns = {
  codeStyle: {
    patterns: [
      /usa? (\w+) en lugar de (\w+)/i,
      /prefiero (\w+)/i,
      /siempre usa? (\w+)/i,
      /nunca uses? (\w+)/i,
    ],
    entity: 'code_style_preferences',
  },

  workflow: {
    patterns: [
      /primero (\w+), luego (\w+)/i,
      /siempre verifica? (\w+) antes/i,
      /cuando hagas? (\w+), (\w+)/i,
    ],
    entity: 'workflow_preferences',
  },

  security: {
    patterns: [/NUNCA (\w+) sin (\w+)/i, /siempre valida? (\w+)/i, /CRITICAL: (\w+)/i],
    entity: 'security_constraints',
  },
}

async function detectUserCorrection(userMessage: string, claudeResponse: string) {
  for (const [type, config] of Object.entries(correctionPatterns)) {
    for (const pattern of config.patterns) {
      const match = userMessage.match(pattern)
      if (match) {
        await saveCorrection(config.entity, match, type)
        return true
      }
    }
  }
  return false
}
```

### 4. File Change Watchers

**Trigger:** Critical files modified
**Condition:** Files in watchlist changed
**Action:** Extract and save changes

```typescript
const watchedFiles = {
  'DATABASE_SCHEMA.md': {
    entity: 'database_architecture',
    extractor: extractSchemaChanges,
  },

  'DECISIONS.md': {
    entity: 'architectural_decisions',
    extractor: extractDecisions,
  },

  'package.json': {
    entity: 'tech_stack',
    extractor: extractDependencies,
  },

  '.env.example': {
    entity: 'environment_config',
    extractor: extractEnvVars,
  },
}

async function onFileChange(filePath: string, diff: string) {
  const watcher = watchedFiles[filePath]
  if (!watcher) return

  const changes = watcher.extractor(diff)

  if (changes.length > 0) {
    await mcp__memory__add_observations({
      observations: [
        {
          entityName: watcher.entity,
          contents: changes.map((c) => `${new Date().toISOString()}: ${c.description}`),
        },
      ],
    })
  }
}
```

### 5. Deployment Hook

**Trigger:** After `/deploy` completes
**Condition:** Successful deployment
**Action:** Update project status

```typescript
async function onDeploySuccess(environment: string, features: string[]) {
  await mcp__memory__add_observations({
    observations: [
      {
        entityName: 'current_implementation_status',
        contents: [
          `Deployed to ${environment}: ${new Date().toISOString()}`,
          `Features: ${features.join(', ')}`,
          `Git commit: ${getCurrentCommit()}`,
        ],
      },
    ],
  })
}
```

---

## Entity Classification System

### Entity Types

```typescript
type EntityType =
  | 'project' // Project identity
  | 'technology' // Tech stack, tools
  | 'architecture' // Architectural patterns
  | 'protocol' // Required procedures
  | 'security_pattern' // Security constraints
  | 'security_history' // Past vulnerabilities
  | 'coding_convention' // Code style rules
  | 'database_convention' // DB patterns
  | 'workflow' // Work processes
  | 'user_preference' // User preferences
  | 'project_status' // Current state
  | 'roadmap' // Future plans
  | 'technical_debt' // Known issues
  | 'testing_protocol' // Test requirements
  | 'optimization' // Performance
  | 'knowledge' // Lessons learned
  | 'market_analysis' // Competitive info
  | 'kpi' // Success metrics
```

### Classification Logic

```typescript
function classifyInformation(text: string, context: Context): Classification {
  // Keywords and patterns for each entity type
  const classifiers = {
    security_pattern: {
      keywords: ['CRITICAL', 'NEVER', 'ALWAYS', 'MANDATORY', 'security', 'vulnerability'],
      contexts: ['auth', 'payment', 'admin', 'api'],
    },

    code_style: {
      keywords: ['prefiero', 'siempre usa', 'nunca uses', 'format', 'naming'],
      contexts: ['code', 'component', 'function'],
    },

    lessons_learned: {
      keywords: ['bug', 'error', 'fixed', 'aprendimos', 'mistake'],
      contexts: ['fix', 'debug', 'issue'],
    },

    // ... more classifiers
  }

  // Score each classifier
  const scores = scoreClassifiers(text, context, classifiers)

  // Return highest scoring classification
  return getTopClassification(scores)
}
```

---

## Information Extraction

### Pattern Extractors

```typescript
interface ExtractedInfo {
  what: string // What changed
  why?: string // Why it changed
  how?: string // How it works
  context?: string // Related files/code
  examples?: string[] // Examples
}

function extractBugPattern(commitMessage: string, files: string[]): ExtractedInfo {
  return {
    what: extractBugDescription(commitMessage),
    why: extractRootCause(commitMessage),
    how: extractFix(commitMessage),
    context: files.join(', '),
    examples: findRelatedCode(files),
  }
}

function extractDecision(text: string): ExtractedInfo {
  return {
    what: extractWhatDecided(text),
    why: extractRationale(text),
    how: extractImplementation(text),
    examples: extractCodeExamples(text),
  }
}

function extractPreference(userMessage: string): ExtractedInfo {
  const patterns = {
    prefer: /prefiero? (\w+)( sobre (\w+))?/i,
    always: /siempre usa? (\w+)/i,
    never: /nunca uses? (\w+)/i,
  }

  for (const [type, pattern] of Object.entries(patterns)) {
    const match = userMessage.match(pattern)
    if (match) {
      return {
        what: buildPreferenceStatement(type, match),
        context: getCurrentFile(),
      }
    }
  }
}
```

---

## Deduplication Strategy

Prevent saving redundant information:

```typescript
async function shouldSaveObservation(entity: string, newObservation: string): Promise<boolean> {
  // Get existing observations
  const existing = await mcp__memory__open_nodes({ names: [entity] })

  if (!existing || !existing.entities) return true

  const observations = existing.entities[0].observations

  // Check for duplicates using similarity score
  for (const obs of observations) {
    const similarity = calculateSimilarity(obs, newObservation)

    // If >80% similar, it's a duplicate
    if (similarity > 0.8) {
      console.log(`Skipping duplicate observation for ${entity}`)
      return false
    }
  }

  return true
}

function calculateSimilarity(str1: string, str2: string): number {
  // Levenshtein distance or cosine similarity
  // Return value between 0 (different) and 1 (identical)
}
```

---

## Entity Linking

Automatically create relations between entities:

```typescript
async function autoLinkEntities(newEntity: Entity) {
  const relations = []

  // Link based on entity type
  if (newEntity.entityType === 'security_pattern') {
    relations.push({
      from: newEntity.name,
      to: 'security_testing_requirements',
      relationType: 'requires_testing',
    })
  }

  if (newEntity.entityType === 'architecture_pattern') {
    relations.push({
      from: 'barber_app_project',
      to: newEntity.name,
      relationType: 'implements',
    })
  }

  // Link based on keywords in observations
  const keywords = extractKeywords(newEntity.observations)

  if (keywords.includes('database')) {
    relations.push({
      from: newEntity.name,
      to: 'database_architecture',
      relationType: 'relates_to',
    })
  }

  if (keywords.includes('security')) {
    relations.push({
      from: newEntity.name,
      to: 'security_vulnerabilities_fixed',
      relationType: 'prevents',
    })
  }

  // Create all relations
  if (relations.length > 0) {
    await mcp__memory__create_relations({ relations })
  }
}
```

---

## Usage Examples

### Example 1: Auto-save after bug fix

```
User: git commit -m "fix: prevent race condition in appointment booking"

Claude:
1. Detects "fix" and "race condition" in message
2. Classifies as lessons_learned
3. Extracts:
   - What: Race condition in appointment booking
   - How: Use atomic DB function instead of read-modify-write
   - Context: src/app/api/appointments/route.ts
4. Saves to memory:

await mcp__memory__add_observations({
  observations: [{
    entityName: "lessons_learned",
    contents: [
      "Session 76: Race condition in appointment booking",
      "Root cause: Read-modify-write pattern",
      "Fix: Use atomic database function (increment_appointment_count)",
      "File: src/app/api/appointments/route.ts",
      "Pattern: ALWAYS use atomic operations for concurrent updates"
    ]
  }]
})

5. Links to related entities:
   - lessons_learned → database_architecture (relates_to)
   - lessons_learned → security_vulnerabilities_fixed (prevents)
```

### Example 2: Auto-save user preference

```
User: "No, prefiero usar Playwright para todas las pruebas UI, no screenshots manuales"

Claude:
1. Detects correction pattern: "prefiero usar X"
2. Classifies as user_preference
3. Extracts:
   - What: Use Playwright for all UI tests
   - Instead of: Manual screenshots
4. Saves to memory:

await mcp__memory__add_observations({
  observations: [{
    entityName: "automation_preferences",
    contents: [
      "UI testing: ALWAYS use Playwright, not manual screenshots",
      "User preference: Automated testing over manual verification",
      "Apply to: All UI changes in src/components, src/app"
    ]
  }]
})
```

### Example 3: Auto-save architectural decision

```
User: "Vamos a usar WebSocket en lugar de polling para Mi Día porque..."

Claude:
1. Detects decision pattern: "vamos a usar X en lugar de Y porque"
2. Classifies as architecture_pattern
3. Extracts:
   - What: Use WebSocket instead of polling
   - Why: Real-time updates, better performance
   - Where: Mi Día feature
4. Creates new entity:

await mcp__memory__create_entities({
  entities: [{
    name: "mi_dia_realtime_pattern",
    entityType: "architecture_pattern",
    observations: [
      "Real-time updates using WebSocket",
      "Replaces: Polling every 30s",
      "Benefits: Immediate updates, reduced server load",
      "Implementation: Socket.io or Supabase Realtime",
      "Affects: src/app/(dashboard)/mi-dia"
    ]
  }]
})

5. Links:
   - barber_app_project → mi_dia_realtime_pattern (implements)
   - mi_dia_realtime_pattern → performance_strategy (optimizes)
```

---

## Configuration

Enable/disable auto-save in `CLAUDE.md`:

```markdown
## Memory Auto-Save

Enabled: true

Triggers:
post_commit: true
post_feature: true
user_correction: true
file_changes: true

File watchers:

- DATABASE_SCHEMA.md
- DECISIONS.md
- package.json
- .env.example

Silent mode: true # Don't show confirmations for auto-saves
```

---

## Monitoring

View what's been saved:

```bash
# Read entire knowledge graph
mcp__memory__read_graph

# Search for specific topic
mcp__memory__search_nodes({ query: "security" })

# View specific entity
mcp__memory__open_nodes({ names: ["lessons_learned"] })
```

---

## Best Practices

### DO:

- ✅ Save high-value information (security, architecture, bugs)
- ✅ Include context (files, dates, reasoning)
- ✅ Link related entities
- ✅ Check for duplicates before saving
- ✅ Use specific, searchable observations

### DON'T:

- ❌ Save trivial changes (typo fixes, formatting)
- ❌ Save redundant information
- ❌ Save sensitive data (API keys, passwords)
- ❌ Create too many entities (consolidate related info)
- ❌ Use vague descriptions

---

## Future Enhancements

### Planned:

1. **Smart search** - Natural language queries to memory
2. **Memory decay** - Archive old/unused observations
3. **Conflict resolution** - Handle contradictory observations
4. **Memory stats** - Dashboard of what's remembered
5. **Export/import** - Share memory between projects

### Under consideration:

- Automatic memory cleanup (remove stale observations)
- Memory versioning (track changes over time)
- Cross-project memory (patterns applicable to multiple projects)
- AI-suggested memory saves (Claude proactively offers to save)

---

## Troubleshooting

### Memory not persisting

- Check `.mcp.json` configuration
- Verify `.claude/memory.json` has write permissions
- Ensure Memory MCP server is running

### Duplicate observations

- Review deduplication threshold (currently 80% similarity)
- Manually delete duplicates with `mcp__memory__delete_observations`

### Too many entities

- Consolidate related entities
- Use observations instead of separate entities
- Review entity types and merge similar ones

---

**Last updated:** 2026-02-03
**Maintained by:** Bryan Acuña
**Status:** Active - automatically saving to `.claude/memory.json`
