/**
 * Recovery utilities for deadlock resolution
 */

/**
 * Preempt a specific resource from a process holding it
 */
export function preemptResource(resourceId, nodes, edges, addLog) {
  // Find the process currently holding this resource
  const allocationEdge = edges.find(
    (e) => e.type === "allocation" && e.from === resourceId
  );

  if (!allocationEdge) {
    return {
      success: false,
      message: `${resourceId} is not currently allocated to any process`,
      nodes,
      edges,
    };
  }

  const victimProcess = allocationEdge.to;

  // Remove the allocation edge (preempt the resource)
  const newEdges = edges.filter(
    (e) => !(e.from === resourceId && e.to === victimProcess && e.type === "allocation")
  );

  // Log the preemption
  addLog(`Preempted ${resourceId} from ${victimProcess}`);
  addLog(`Recovery overhead: Resource reallocation`);

  return {
    success: true,
    message: `Preempted ${resourceId} from ${victimProcess}`,
    victimProcess,
    resourceId,
    nodes,
    edges: newEdges,
  };
}

/**
 * Release all resources held by a blocked or deadlocked process
 */
export function releaseHeldResources(nodes, edges, cycle, addLog) {
  // Identify victim: prefer blocked processes in the cycle
  const blockedProcesses = cycle.filter((id) => id.startsWith("P"));

  if (blockedProcesses.length === 0) {
    return {
      success: false,
      message: "No blocked processes found to release resources from",
      nodes,
      edges,
    };
  }

  // Select first blocked process as victim (can be enhanced with policy)
  const victimProcess = blockedProcesses[0];

  // Find all resources allocated to this process
  const allocatedResources = edges
    .filter((e) => e.type === "allocation" && e.to === victimProcess)
    .map((e) => e.from);

  if (allocatedResources.length === 0) {
    return {
      success: false,
      message: `${victimProcess} has no allocated resources to release`,
      nodes,
      edges,
    };
  }

  // Remove all allocation edges for this process
  const newEdges = edges.filter(
    (e) => !(e.type === "allocation" && e.to === victimProcess)
  );

  // Log the release
  addLog(`Released resources from ${victimProcess}: ${allocatedResources.join(", ")}`);
  addLog(`Recovery overhead: Resource release operation`);

  return {
    success: true,
    message: `Released ${allocatedResources.join(", ")} from ${victimProcess}`,
    victimProcess,
    releasedResources: allocatedResources,
    nodes,
    edges: newEdges,
  };
}

/**
 * Rollback a blocked process to a previous state
 */
export function rollbackBlockedProcess(nodes, edges, cycle, addLog) {
  // Identify blocked processes from cycle
  const blockedProcesses = cycle.filter((id) => id.startsWith("P"));

  if (blockedProcesses.length === 0) {
    return {
      success: false,
      message: "No blocked processes found to rollback",
      nodes,
      edges,
    };
  }

  // Select victim process (can be enhanced with policy: youngest, lowest priority, etc.)
  const victimProcess = blockedProcesses[blockedProcesses.length - 1];

  // Find resources held by this process
  const heldResources = edges
    .filter((e) => e.type === "allocation" && e.to === victimProcess)
    .map((e) => e.from);

  // Find pending requests from this process
  const pendingRequests = edges
    .filter((e) => e.type === "request" && e.from === victimProcess)
    .map((e) => e.to);

  // Remove all edges associated with this process (simulated rollback)
  const newEdges = edges.filter(
    (e) => e.from !== victimProcess && e.to !== victimProcess
  );

  // Log the rollback
  addLog(`Rolled back ${victimProcess} to checkpoint state`);
  if (heldResources.length > 0) {
    addLog(`Released resources: ${heldResources.join(", ")}`);
  }
  if (pendingRequests.length > 0) {
    addLog(`Cancelled requests: ${pendingRequests.join(", ")}`);
  }
  addLog(`Recovery overhead: Rollback + state restoration`);

  return {
    success: true,
    message: `Rolled back ${victimProcess}. Released: ${
      heldResources.length > 0 ? heldResources.join(", ") : "none"
    }`,
    victimProcess,
    heldResources,
    pendingRequests,
    nodes,
    edges: newEdges,
  };
}

/**
 * Get all resources that can be preempted (have allocations)
 */
export function getPreemptableResources(nodes, edges) {
  const resources = nodes.filter((n) => n.type === "resource");
  
  return resources
    .map((r) => {
      const allocation = edges.find(
        (e) => e.type === "allocation" && e.from === r.id
      );
      
      return {
        id: r.id,
        canPreempt: !!allocation,
        allocatedTo: allocation ? allocation.to : null,
      };
    })
    .filter((r) => r.canPreempt);
}

/**
 * Check if release operation is possible
 */
export function canReleaseResources(cycle) {
  const blockedProcesses = cycle.filter((id) => id.startsWith("P"));
  return blockedProcesses.length > 0;
}

/**
 * Check if rollback operation is possible
 */
export function canRollback(cycle) {
  const blockedProcesses = cycle.filter((id) => id.startsWith("P"));
  return blockedProcesses.length > 0;
}
