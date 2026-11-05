import { Process, Resource, Edge } from '../store/simulationStore';

export interface CycleDetectionStep {
  step: number;
  description: string;
  currentNode: string;
  visited: string[];
  stack: string[];
  path: string[];
  cycleFound: boolean;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycle: string[];
  deadlockedProcesses: string[];
  steps: CycleDetectionStep[];
}

/**
 * DFS-based cycle detection for Resource Allocation Graphs
 * Works for single-instance resources
 */
export function detectCycle(
  processes: Process[],
  resources: Resource[],
  edges: Edge[]
): CycleDetectionResult {
  const steps: CycleDetectionStep[] = [];
  const graph: Map<string, string[]> = new Map();
  
  // Build adjacency list
  const allNodes = [
    ...processes.map(p => p.id),
    ...resources.map(r => r.id)
  ];
  
  allNodes.forEach(node => graph.set(node, []));
  edges.forEach(edge => {
    const neighbors = graph.get(edge.from) || [];
    neighbors.push(edge.to);
    graph.set(edge.from, neighbors);
  });

  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  let cycle: string[] = [];
  let cycleFound = false;

  function dfs(node: string, stepCount: number): boolean {
    visited.add(node);
    stack.add(node);
    path.push(node);

    steps.push({
      step: stepCount,
      description: `Visiting node ${node}`,
      currentNode: node,
      visited: Array.from(visited),
      stack: Array.from(stack),
      path: [...path],
      cycleFound: false,
    });

    const neighbors = graph.get(node) || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, stepCount + 1)) {
          return true;
        }
      } else if (stack.has(neighbor)) {
        // Cycle detected
        const cycleStartIndex = path.indexOf(neighbor);
        cycle = path.slice(cycleStartIndex);
        cycleFound = true;

        steps.push({
          step: stepCount + 1,
          description: `Cycle detected! Back edge from ${node} to ${neighbor}`,
          currentNode: node,
          visited: Array.from(visited),
          stack: Array.from(stack),
          path: [...path],
          cycleFound: true,
        });

        return true;
      }
    }

    stack.delete(node);
    path.pop();

    steps.push({
      step: stepCount + 1,
      description: `Backtracking from ${node}`,
      currentNode: node,
      visited: Array.from(visited),
      stack: Array.from(stack),
      path: [...path],
      cycleFound: false,
    });

    return false;
  }

  // Run DFS from each unvisited node
  let stepCount = 1;
  for (const node of allNodes) {
    if (!visited.has(node)) {
      if (dfs(node, stepCount)) {
        break;
      }
      stepCount = steps.length + 1;
    }
  }

  // Extract deadlocked processes from cycle
  const deadlockedProcesses = cycle.filter(node => node.startsWith('P'));

  return {
    hasCycle: cycleFound,
    cycle,
    deadlockedProcesses,
    steps,
  };
}

/**
 * Simplified cycle detection without steps (for fast detection)
 */
export function hasDeadlockCycle(edges: Edge[]): { hasCycle: boolean; cycle: string[] } {
  const graph: Map<string, string[]> = new Map();
  const allNodes = new Set<string>();

  edges.forEach(edge => {
    allNodes.add(edge.from);
    allNodes.add(edge.to);
    const neighbors = graph.get(edge.from) || [];
    neighbors.push(edge.to);
    graph.set(edge.from, neighbors);
  });

  const visited = new Set<string>();
  const stack = new Set<string>();
  const path: string[] = [];
  let cycle: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    stack.add(node);
    path.push(node);

    const neighbors = graph.get(node) || [];
    
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (stack.has(neighbor)) {
        const cycleStartIndex = path.indexOf(neighbor);
        cycle = path.slice(cycleStartIndex);
        return true;
      }
    }

    stack.delete(node);
    path.pop();
    return false;
  }

  for (const node of Array.from(allNodes)) {
    if (!visited.has(node)) {
      if (dfs(node)) {
        return { hasCycle: true, cycle };
      }
    }
  }

  return { hasCycle: false, cycle: [] };
}
