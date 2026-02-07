#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * pattern-recognition.js
 * Analiza workflow history y detecta patrones en el uso de agentes
 *
 * Nivel 2: Context Enhancement - Pattern Recognition
 */

const fs = require('fs');
const path = require('path');

// Paths
const MEMORY_FILE = path.join(process.cwd(), '.claude/memory.json');
const CONFIG_FILE = path.join(process.cwd(), '.claude/config.json');

// Pattern detection configuration
const DEFAULT_CONFIG = {
  minPatternFrequency: 2, // Minimum times a pattern must occur to be detected
  minSuccessRate: 0.7, // Minimum success rate to recommend a pattern
  maxPatternsToDetect: 10, // Maximum patterns to track
  agentSequenceWindow: 5 // How many agents to look at for sequence
};

/**
 * Load memory from file
 */
function loadMemory() {
  if (!fs.existsSync(MEMORY_FILE)) {
    return initializeMemory();
  }

  try {
    const content = fs.readFileSync(MEMORY_FILE, 'utf8');
    const memory = JSON.parse(content);

    // Ensure structure exists
    if (!memory.workflows) memory.workflows = { history: [], patterns: [] };
    if (!memory.agentInvocations) memory.agentInvocations = { history: [], statistics: {} };
    if (!memory.sessions) memory.sessions = { current: null, history: [] };
    if (!memory.recommendations) memory.recommendations = { nextSteps: [], warnings: [] };

    return memory;
  } catch (error) {
    console.error('Error loading memory:', error);
    return initializeMemory();
  }
}

/**
 * Initialize empty memory structure
 */
function initializeMemory() {
  return {
    workflows: {
      history: [],
      patterns: []
    },
    agentInvocations: {
      history: [],
      statistics: {}
    },
    sessions: {
      current: {
        id: generateSessionId(),
        startTime: new Date().toISOString(),
        workflowsExecuted: 0,
        agentsUsed: []
      },
      history: []
    },
    recommendations: {
      nextSteps: [],
      warnings: []
    },
    userPreferences: {}
  };
}

/**
 * Save memory to file
 */
function saveMemory(memory) {
  try {
    const dir = path.dirname(MEMORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(MEMORY_FILE, JSON.stringify(memory, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving memory:', error);
    return false;
  }
}

/**
 * Generate unique session ID
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract agent sequences from workflow history
 */
function extractAgentSequences(workflows, windowSize = 5) {
  const sequences = [];

  for (const workflow of workflows) {
    if (!workflow.steps || workflow.steps.length < 2) continue;

    const agents = workflow.steps.map(step => step.agent);

    // Extract all subsequences of length 2 to windowSize
    for (let len = 2; len <= Math.min(windowSize, agents.length); len++) {
      for (let i = 0; i <= agents.length - len; i++) {
        const sequence = agents.slice(i, i + len);
        sequences.push({
          sequence: sequence,
          workflowId: workflow.id,
          outcome: workflow.outcome,
          type: workflow.type
        });
      }
    }
  }

  return sequences;
}

/**
 * Count sequence frequencies
 */
function countSequenceFrequencies(sequences) {
  const frequencyMap = {};

  for (const { sequence, outcome, type } of sequences) {
    const key = sequence.join(' → ');

    if (!frequencyMap[key]) {
      frequencyMap[key] = {
        sequence: sequence,
        count: 0,
        successes: 0,
        failures: 0,
        contexts: {}
      };
    }

    frequencyMap[key].count++;

    if (outcome === 'success') {
      frequencyMap[key].successes++;
    } else if (outcome === 'failed') {
      frequencyMap[key].failures++;
    }

    // Track contexts
    if (type) {
      frequencyMap[key].contexts[type] = (frequencyMap[key].contexts[type] || 0) + 1;
    }
  }

  return Object.values(frequencyMap);
}

/**
 * Detect patterns from workflow history
 */
function detectPatterns(memory, config = DEFAULT_CONFIG) {
  const workflows = memory.workflows.history || [];

  if (workflows.length < config.minPatternFrequency) {
    return [];
  }

  // Extract sequences
  const sequences = extractAgentSequences(workflows, config.agentSequenceWindow);

  // Count frequencies
  const frequencies = countSequenceFrequencies(sequences);

  // Filter and sort patterns
  const patterns = frequencies
    .filter(freq => {
      const successRate = freq.successes / (freq.successes + freq.failures || 1);
      return freq.count >= config.minPatternFrequency &&
             successRate >= config.minSuccessRate;
    })
    .map(freq => {
      const successRate = freq.successes / (freq.successes + freq.failures || 1);
      const mostCommonContext = Object.entries(freq.contexts)
        .sort(([, a], [, b]) => b - a)[0];

      return {
        pattern: freq.sequence.join(' → '),
        sequence: freq.sequence,
        frequency: freq.count,
        lastSeen: new Date().toISOString(), // Simplified, should track actual last seen
        successRate: successRate,
        context: mostCommonContext ? mostCommonContext[0] : 'general'
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, config.maxPatternsToDetect);

  return patterns;
}

/**
 * Generate recommendations based on patterns and current context
 */
function generateRecommendations(memory, recentAgents = []) {
  const patterns = memory.workflows.patterns || [];
  const recommendations = [];
  const warnings = [];

  if (patterns.length === 0) {
    return { recommendations, warnings };
  }

  // Find patterns that match recent agent sequence
  if (recentAgents.length >= 2) {
    const recentSequence = recentAgents.slice(-3).join(' → ');

    for (const pattern of patterns) {
      const patternStart = pattern.sequence.slice(0, recentAgents.length).join(' → ');

      // If recent agents match the start of a known pattern
      if (recentSequence === patternStart && pattern.sequence.length > recentAgents.length) {
        const nextAgent = pattern.sequence[recentAgents.length];

        recommendations.push({
          suggestion: `Based on your pattern "${pattern.pattern}", consider using ${nextAgent} next`,
          confidence: pattern.successRate,
          reasoning: `This pattern has been successful ${pattern.frequency} times (${Math.round(pattern.successRate * 100)}% success rate)`,
          pattern: pattern.pattern
        });
      }
    }
  }

  // Detect common warnings
  const lastWorkflow = memory.workflows.history[memory.workflows.history.length - 1];
  if (lastWorkflow) {
    // Warning: UI changes without tests
    const hasUIChanges = lastWorkflow.steps.some(step =>
      step.agent.includes('frontend') || step.agent.includes('ui-ux')
    );
    const hasTests = lastWorkflow.steps.some(step =>
      step.agent.includes('test') || step.action.includes('test')
    );

    if (hasUIChanges && !hasTests) {
      warnings.push({
        message: 'UI changes detected without running tests',
        severity: 'medium',
        suggestion: 'Consider running E2E tests with /test or generating tests with /generate-tests'
      });
    }

    // Warning: Security changes without audit
    const hasSecurityChanges = lastWorkflow.steps.some(step =>
      step.filesModified && step.filesModified.some(file =>
        file.includes('auth') || file.includes('login') || file.includes('payment')
      )
    );
    const hasSecurityAudit = lastWorkflow.steps.some(step =>
      step.agent.includes('security')
    );

    if (hasSecurityChanges && !hasSecurityAudit) {
      warnings.push({
        message: 'Security-sensitive files modified without security audit',
        severity: 'high',
        suggestion: 'Run security audit with /code-review or use @security-auditor'
      });
    }
  }

  return { recommendations, warnings };
}

/**
 * Get session summary
 */
function getSessionSummary(memory) {
  const session = memory.sessions.current;
  const recentInvocations = (memory.agentInvocations.history || []).slice(-10);
  const patterns = memory.workflows.patterns || [];

  // Get recent agents for recommendation
  const recentAgents = recentInvocations.map(inv => inv.agent).slice(-3);
  const { recommendations, warnings } = generateRecommendations(memory, recentAgents);

  // Calculate session duration
  const startTime = session ? new Date(session.startTime) : new Date();
  const duration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60); // minutes

  // Count unique agents
  const uniqueAgents = new Set(recentInvocations.map(inv => inv.agent));

  return {
    session: {
      id: session?.id,
      duration: duration,
      workflowsExecuted: session?.workflowsExecuted || 0,
      agentsUsed: uniqueAgents.size
    },
    recentInvocations: recentInvocations.map(inv => ({
      agent: inv.agent,
      action: inv.decision,
      timestamp: inv.timestamp,
      minutesAgo: Math.floor((Date.now() - new Date(inv.timestamp).getTime()) / 1000 / 60)
    })),
    patterns: patterns.slice(0, 5), // Top 5 patterns
    recommendations: recommendations.slice(0, 3), // Top 3 recommendations
    warnings: warnings
  };
}

/**
 * Main CLI
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const memory = loadMemory();

  switch (command) {
    case 'detect':
      // Detect patterns and update memory
      const patterns = detectPatterns(memory);
      memory.workflows.patterns = patterns;

      const { recommendations, warnings } = generateRecommendations(memory);
      memory.recommendations = { nextSteps: recommendations, warnings };

      saveMemory(memory);

      console.log(JSON.stringify({
        patternsDetected: patterns.length,
        patterns: patterns,
        recommendations: recommendations,
        warnings: warnings
      }, null, 2));
      break;

    case 'summary':
      // Get session summary
      const summary = getSessionSummary(memory);
      console.log(JSON.stringify(summary, null, 2));
      break;

    case 'init':
      // Initialize memory
      const newMemory = initializeMemory();
      saveMemory(newMemory);
      console.log('Memory initialized');
      break;

    default:
      console.log('Usage: pattern-recognition.js <command>');
      console.log('Commands:');
      console.log('  detect  - Detect patterns and generate recommendations');
      console.log('  summary - Get session summary');
      console.log('  init    - Initialize memory structure');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  loadMemory,
  saveMemory,
  detectPatterns,
  generateRecommendations,
  getSessionSummary
};
