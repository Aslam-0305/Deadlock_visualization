export function detectDeadlock(nodes, edges) {
  const graph = {};

  nodes.forEach((node) => {
    graph[node.id] = [];
  });

  edges.forEach((edge) => {
    graph[edge.from].push(edge.to);
  });

  const visited = {};
  const stack = {};
  const path = [];

  let cycle = [];

  function dfs(nodeId) {
    visited[nodeId] = true;
    stack[nodeId] = true;
    path.push(nodeId);

    for (const next of graph[nodeId]) {
      if (!visited[next]) {
        if (dfs(next)) return true;
      } else if (stack[next]) {
        const start =
          path.indexOf(next);

        cycle = path.slice(start);
        return true;
      }
    }

    stack[nodeId] = false;
    path.pop();
    return false;
  }

  for (const node of nodes) {
    if (!visited[node.id]) {
      if (dfs(node.id)) break;
    }
  }

  return {
    deadlock: cycle.length > 0,
    cycle,
  };
}

/**
 * Get resource allocation state for all processes
 */
export function getResourceState(nodes, edges) {
  const processes = nodes.filter(n => n.type === 'process');
  const resources = nodes.filter(n => n.type === 'resource');
  
  const state = {
    processes: processes.map(p => p.id),
    resources: resources.map(r => ({
      id: r.id,
      total: r.instances || 1,
      available: r.instances || 1
    })),
    allocations: {},
    requests: {},
    blocked: []
  };

  // Initialize allocation and request tracking
  processes.forEach(p => {
    state.allocations[p.id] = [];
    state.requests[p.id] = [];
  });

  // Process all edges
  edges.forEach(edge => {
    if (edge.type === 'allocation') {
      // Resource -> Process (allocation)
      const resourceId = edge.from;
      const processId = edge.to;
      
      if (state.allocations[processId]) {
        state.allocations[processId].push(resourceId);
        
        // Decrease available count
        const resource = state.resources.find(r => r.id === resourceId);
        if (resource) {
          resource.available = Math.max(0, resource.available - 1);
        }
      }
    } else if (edge.type === 'request') {
      // Process -> Resource (request)
      const processId = edge.from;
      const resourceId = edge.to;
      
      if (state.requests[processId]) {
        state.requests[processId].push(resourceId);
        
        // Check if blocked (resource not available)
        const resource = state.resources.find(r => r.id === resourceId);
        if (resource && resource.available === 0) {
          if (!state.blocked.includes(processId)) {
            state.blocked.push(processId);
          }
        }
      }
    }
  });

  return state;
}

/**
 * Analyze cycles and explain wait relationships
 */
export function analyzeCycle(cycle, edges) {
  if (!cycle || cycle.length === 0) {
    return null;
  }

  const waitRelationships = [];
  
  for (let i = 0; i < cycle.length; i++) {
    const current = cycle[i];
    const next = cycle[(i + 1) % cycle.length];
    
    // Find the edge connecting these nodes
    const edge = edges.find(e => e.from === current && e.to === next);
    
    if (edge) {
      if (current.startsWith('P') && next.startsWith('R')) {
        // Process requests Resource
        waitRelationships.push({
          process: current,
          action: 'requests',
          resource: next
        });
      } else if (current.startsWith('R') && next.startsWith('P')) {
        // Resource allocated to Process (Process holds Resource)
        waitRelationships.push({
          process: next,
          action: 'holds',
          resource: current
        });
      }
    }
  }

  return {
    cycle,
    waitRelationships,
    description: generateCycleDescription(waitRelationships)
  };
}

function generateCycleDescription(relationships) {
  const descriptions = [];
  
  relationships.forEach(rel => {
    if (rel.action === 'requests') {
      descriptions.push(`${rel.process} waits for ${rel.resource}`);
    } else if (rel.action === 'holds') {
      descriptions.push(`${rel.process} holds ${rel.resource}`);
    }
  });

  return descriptions;
}

/**
 * Generate potential deadlock scenarios
 */
export function generateDeadlockScenarios(nodes, edges, maxScenarios = 10) {
  const processes = nodes.filter(n => n.type === 'process');
  const resources = nodes.filter(n => n.type === 'resource');
  
  if (processes.length < 2 || resources.length < 2) {
    return [];
  }

  const scenarios = [];
  const state = getResourceState(nodes, edges);

  // Scenario 1: Two-process circular wait
  if (processes.length >= 2 && resources.length >= 2) {
    for (let i = 0; i < processes.length && scenarios.length < maxScenarios; i++) {
      for (let j = i + 1; j < processes.length && scenarios.length < maxScenarios; j++) {
        for (let r1 = 0; r1 < resources.length; r1++) {
          for (let r2 = r1 + 1; r2 < resources.length; r2++) {
            const p1 = processes[i].id;
            const p2 = processes[j].id;
            const res1 = resources[r1].id;
            const res2 = resources[r2].id;

            // Check if this forms a potential deadlock pattern
            const scenario = {
              title: `Circular Wait: ${p1} and ${p2}`,
              type: 'two-process-cycle',
              processes: [p1, p2],
              resources: [res1, res2],
              steps: [
                `${p1} holds ${res1}`,
                `${p2} holds ${res2}`,
                `${p1} requests ${res2} (blocked by ${p2})`,
                `${p2} requests ${res1} (blocked by ${p1})`
              ],
              cycle: [p1, res2, p2, res1],
              explanation: `If ${p1} acquires ${res1} and ${p2} acquires ${res2}, then ${p1} requests ${res2} while ${p2} requests ${res1}, a circular wait occurs.`,
              prevention: `Use resource ordering: always acquire ${res1} before ${res2}`,
              likelyhood: 'medium'
            };

            // Check if this scenario is different from current state
            if (!isCurrentDeadlock(scenario, state, edges)) {
              scenarios.push(scenario);
              if (scenarios.length >= maxScenarios) break;
            }
          }
          if (scenarios.length >= maxScenarios) break;
        }
        if (scenarios.length >= maxScenarios) break;
      }
      if (scenarios.length >= maxScenarios) break;
    }
  }

  // Scenario 2: Three-process circular wait
  if (processes.length >= 3 && resources.length >= 3 && scenarios.length < maxScenarios) {
    const p1 = processes[0].id;
    const p2 = processes[1].id;
    const p3 = processes[2].id;
    const r1 = resources[0].id;
    const r2 = resources[1].id;
    const r3 = resources[2].id;

    scenarios.push({
      title: `Chain Deadlock: ${p1}, ${p2}, ${p3}`,
      type: 'three-process-cycle',
      processes: [p1, p2, p3],
      resources: [r1, r2, r3],
      steps: [
        `${p1} holds ${r1}`,
        `${p2} holds ${r2}`,
        `${p3} holds ${r3}`,
        `${p1} requests ${r2} (blocked by ${p2})`,
        `${p2} requests ${r3} (blocked by ${p3})`,
        `${p3} requests ${r1} (blocked by ${p1})`
      ],
      cycle: [p1, r2, p2, r3, p3, r1],
      explanation: `A three-way circular dependency where each process holds one resource and waits for the next process's resource.`,
      prevention: `Implement banker's algorithm or require all resources to be requested atomically`,
      likelyhood: 'low'
    });
  }

  // Scenario 3: Resource contention (multiple processes waiting for same resource)
  if (processes.length >= 2 && scenarios.length < maxScenarios) {
    resources.forEach(resource => {
      if (scenarios.length < maxScenarios) {
        const waitingProcesses = processes.slice(0, Math.min(3, processes.length));
        
        scenarios.push({
          title: `Resource Contention on ${resource.id}`,
          type: 'contention',
          processes: waitingProcesses.map(p => p.id),
          resources: [resource.id],
          steps: waitingProcesses.map((p, i) => 
            i === 0 
              ? `${p.id} holds ${resource.id}` 
              : `${p.id} requests ${resource.id} (blocked, waiting)`
          ),
          cycle: [],
          explanation: `Multiple processes compete for ${resource.id}. If ${resource.id} has only one instance, all but one process will be blocked indefinitely if no release occurs.`,
          prevention: `Implement timeouts, priority scheduling, or increase resource instances`,
          likelyhood: 'high'
        });
      }
    });
  }

  // Scenario 4: Hold-and-wait with insufficient resources
  if (processes.length >= 2 && resources.length >= 2 && scenarios.length < maxScenarios) {
    const p1 = processes[0].id;
    const p2 = processes[1].id;
    const r1 = resources[0].id;
    const r2 = resources[1].id;

    scenarios.push({
      title: `Hold-and-Wait Deadlock`,
      type: 'hold-and-wait',
      processes: [p1, p2],
      resources: [r1, r2],
      steps: [
        `${p1} acquires ${r1}`,
        `${p2} acquires ${r2}`,
        `${p1} needs ${r2} to proceed but doesn't release ${r1}`,
        `${p2} needs ${r1} to proceed but doesn't release ${r2}`,
        `Both processes hold resources and wait indefinitely`
      ],
      cycle: [p1, r2, p2, r1],
      explanation: `Classic hold-and-wait condition where each process holds one resource and waits for another held by a different process.`,
      prevention: `Require processes to request all resources at once, or implement a deadlock avoidance algorithm`,
      likelyhood: 'high'
    });
  }

  return scenarios.slice(0, maxScenarios);
}

function isCurrentDeadlock(scenario, state, edges) {
  // Check if this scenario matches the current graph state
  // This is a simplified check - in reality, we'd do more thorough comparison
  return false;
}