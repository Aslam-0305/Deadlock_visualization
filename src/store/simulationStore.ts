import { create } from 'zustand';

export type ProcessStatus = 'ready' | 'running' | 'blocked' | 'terminated';
export type SystemState = 'safe' | 'unsafe' | 'deadlocked';

export interface Process {
  id: string;
  name: string;
  status: ProcessStatus;
  allocatedResources: string[];
  requestedResources: string[];
  createdAt: number;
}

export interface Resource {
  id: string;
  name: string;
  totalInstances: number;
  availableInstances: number;
  allocations: { processId: string; instances: number }[];
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'allocation';
}

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'process_created' | 'resource_created' | 'request_made' | 'allocation_made' | 
        'resource_released' | 'deadlock_detected' | 'process_terminated' | 'recovery_applied';
  description: string;
  data?: any;
}

export interface DetectionResult {
  isDeadlocked: boolean;
  deadlockedProcesses: string[];
  cycle: string[];
  algorithm: 'cycle' | 'matrix';
  executionSteps: any[];
}

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: number;
  processes: Process[];
  resources: Resource[];
  edges: Edge[];
}

interface SimulationState {
  // Core State
  processes: Process[];
  resources: Resource[];
  edges: Edge[];
  systemState: SystemState;
  
  // Detection
  detectionResult: DetectionResult | null;
  detectionAlgorithm: 'cycle' | 'matrix';
  
  // Simulation Control
  isRunning: boolean;
  simulationSpeed: number;
  
  // Events & History
  events: SimulationEvent[];
  checkpoints: Checkpoint[];
  
  // Analytics
  totalDeadlocksDetected: number;
  totalProcessesTerminated: number;
  totalResourcesPreempted: number;
  
  // Actions - Process Management
  addProcess: (name?: string) => void;
  removeProcess: (id: string) => void;
  updateProcessStatus: (id: string, status: ProcessStatus) => void;
  terminateProcess: (id: string) => void;
  
  // Actions - Resource Management
  addResource: (name?: string, instances?: number) => void;
  removeResource: (id: string) => void;
  updateResourceInstances: (id: string, instances: number) => void;
  
  // Actions - Allocation
  requestResource: (processId: string, resourceId: string, instances?: number) => boolean;
  allocateResource: (processId: string, resourceId: string, instances?: number) => boolean;
  releaseResource: (processId: string, resourceId: string, instances?: number) => boolean;
  
  // Actions - Detection
  runDetection: () => DetectionResult;
  setDetectionAlgorithm: (algorithm: 'cycle' | 'matrix') => void;
  _autoDetect: () => void;
  
  // Actions - Recovery
  applyRecovery: (method: 'terminate' | 'preempt' | 'rollback', data: any) => void;
  
  // Actions - Checkpoints
  saveCheckpoint: (name: string) => void;
  loadCheckpoint: (id: string) => void;
  
  // Actions - Simulation Control
  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  setSimulationSpeed: (speed: number) => void;
  
  // Actions - Scenarios
  loadScenario: (scenario: any) => void;
  
  // Actions - Events
  addEvent: (event: Omit<SimulationEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;
  
  // Actions - Reset
  reset: () => void;
}

let processCounter = 1;
let resourceCounter = 1;
let eventCounter = 1;
let checkpointCounter = 1;

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // Initial State
  processes: [],
  resources: [],
  edges: [],
  systemState: 'safe',
  detectionResult: null,
  detectionAlgorithm: 'cycle',
  isRunning: false,
  simulationSpeed: 1,
  events: [],
  checkpoints: [],
  totalDeadlocksDetected: 0,
  totalProcessesTerminated: 0,
  totalResourcesPreempted: 0,

  // Process Management
  addProcess: (name) => {
    const id = `P${processCounter++}`;
    const process: Process = {
      id,
      name: name || id,
      status: 'ready',
      allocatedResources: [],
      requestedResources: [],
      createdAt: Date.now(),
    };
    
    set((state) => ({
      processes: [...state.processes, process],
    }));
    
    get().addEvent({
      type: 'process_created',
      description: `Process ${id} created`,
      data: { processId: id },
    });
  },

  removeProcess: (id) => {
    const process = get().processes.find(p => p.id === id);
    if (!process) return;
    
    // Release all allocated resources
    process.allocatedResources.forEach(resourceId => {
      get().releaseResource(id, resourceId);
    });
    
    set((state) => ({
      processes: state.processes.filter(p => p.id !== id),
      edges: state.edges.filter(e => e.from !== id && e.to !== id),
    }));
    
    get().addEvent({
      type: 'process_terminated',
      description: `Process ${id} removed`,
      data: { processId: id },
    });
  },

  updateProcessStatus: (id, status) => {
    set((state) => ({
      processes: state.processes.map(p =>
        p.id === id ? { ...p, status } : p
      ),
    }));
  },

  terminateProcess: (id) => {
    get().removeProcess(id);
    set((state) => ({
      totalProcessesTerminated: state.totalProcessesTerminated + 1,
    }));
  },

  // Resource Management
  addResource: (name, instances = 1) => {
    const id = `R${resourceCounter++}`;
    const resource: Resource = {
      id,
      name: name || id,
      totalInstances: instances,
      availableInstances: instances,
      allocations: [],
    };
    
    set((state) => ({
      resources: [...state.resources, resource],
    }));
    
    get().addEvent({
      type: 'resource_created',
      description: `Resource ${id} created with ${instances} instance(s)`,
      data: { resourceId: id, instances },
    });
  },

  removeResource: (id) => {
    set((state) => ({
      resources: state.resources.filter(r => r.id !== id),
      edges: state.edges.filter(e => e.from !== id && e.to !== id),
      processes: state.processes.map(p => ({
        ...p,
        allocatedResources: p.allocatedResources.filter(rid => rid !== id),
        requestedResources: p.requestedResources.filter(rid => rid !== id),
      })),
    }));
  },

  updateResourceInstances: (id, instances) => {
    set((state) => ({
      resources: state.resources.map(r =>
        r.id === id ? { ...r, totalInstances: instances, availableInstances: instances } : r
      ),
    }));
  },

  // Allocation Management
  requestResource: (processId, resourceId, instances = 1) => {
    const process = get().processes.find(p => p.id === processId);
    const resource = get().resources.find(r => r.id === resourceId);
    
    if (!process || !resource) return false;
    if (process.requestedResources.includes(resourceId)) return false;
    
    // Add request edge
    const edgeId = `${processId}->${resourceId}`;
    const edge: Edge = {
      id: edgeId,
      from: processId,
      to: resourceId,
      type: 'request',
    };
    
    set((state) => ({
      processes: state.processes.map(p =>
        p.id === processId
          ? { ...p, requestedResources: [...p.requestedResources, resourceId], status: 'blocked' }
          : p
      ),
      edges: [...state.edges, edge],
    }));
    
    get().addEvent({
      type: 'request_made',
      description: `${processId} requests ${resourceId}`,
      data: { processId, resourceId, instances },
    });

    // Auto-detect after every topology change
    setTimeout(() => get()._autoDetect(), 0);
    
    return true;
  },

  allocateResource: (processId, resourceId, instances = 1) => {
    const process = get().processes.find(p => p.id === processId);
    const resource = get().resources.find(r => r.id === resourceId);
    
    if (!process || !resource) return false;
    if (resource.availableInstances < instances) return false;
    
    // Remove request edge if exists
    const requestEdgeId = `${processId}->${resourceId}`;
    
    // Add allocation edge
    const allocationEdgeId = `${resourceId}->${processId}`;
    const edge: Edge = {
      id: allocationEdgeId,
      from: resourceId,
      to: processId,
      type: 'allocation',
    };
    
    set((state) => ({
      processes: state.processes.map(p =>
        p.id === processId
          ? {
              ...p,
              allocatedResources: [...p.allocatedResources, resourceId],
              requestedResources: p.requestedResources.filter(rid => rid !== resourceId),
              status: 'running',
            }
          : p
      ),
      resources: state.resources.map(r =>
        r.id === resourceId
          ? {
              ...r,
              availableInstances: r.availableInstances - instances,
              allocations: [...r.allocations, { processId, instances }],
            }
          : r
      ),
      edges: [...state.edges.filter(e => e.id !== requestEdgeId), edge],
    }));
    
    get().addEvent({
      type: 'allocation_made',
      description: `${resourceId} allocated to ${processId}`,
      data: { processId, resourceId, instances },
    });

    // Auto-detect after every topology change
    setTimeout(() => get()._autoDetect(), 0);
    
    return true;
  },

  releaseResource: (processId, resourceId, instances = 1) => {
    const process = get().processes.find(p => p.id === processId);
    const resource = get().resources.find(r => r.id === resourceId);
    
    if (!process || !resource) return false;
    
    const allocationEdgeId = `${resourceId}->${processId}`;
    
    set((state) => ({
      processes: state.processes.map(p =>
        p.id === processId
          ? {
              ...p,
              allocatedResources: p.allocatedResources.filter(rid => rid !== resourceId),
            }
          : p
      ),
      resources: state.resources.map(r =>
        r.id === resourceId
          ? {
              ...r,
              availableInstances: r.availableInstances + instances,
              allocations: r.allocations.filter(a => a.processId !== processId),
            }
          : r
      ),
      edges: state.edges.filter(e => e.id !== allocationEdgeId),
    }));
    
    get().addEvent({
      type: 'resource_released',
      description: `${processId} released ${resourceId}`,
      data: { processId, resourceId, instances },
    });

    // Auto-detect after every topology change
    setTimeout(() => get()._autoDetect(), 0);
    
    return true;
  },

  // Detection (stub - will be implemented in detection module)
  runDetection: () => {
    const state = get();
    const algorithm = state.detectionAlgorithm;
    
    let result: DetectionResult;
    
    if (algorithm === 'cycle') {
      // Import dynamically to avoid circular deps
      const { detectCycle } = require('../algorithms/cycleDetection');
      const cycleResult = detectCycle(state.processes, state.resources, state.edges);
      
      result = {
        isDeadlocked: cycleResult.hasCycle,
        deadlockedProcesses: cycleResult.deadlockedProcesses,
        cycle: cycleResult.cycle,
        algorithm: 'cycle',
        executionSteps: cycleResult.steps,
      };
    } else {
      // Matrix-based detection
      const { detectDeadlockMatrix } = require('../algorithms/matrixDetection');
      const matrixResult = detectDeadlockMatrix(state.processes, state.resources);
      
      result = {
        isDeadlocked: matrixResult.isDeadlocked,
        deadlockedProcesses: matrixResult.deadlockedProcesses,
        cycle: [], // Matrix detection doesn't provide cycle path
        algorithm: 'matrix',
        executionSteps: matrixResult.steps,
      };
    }
    
    // Update system state based on detection
    const newSystemState: SystemState = result.isDeadlocked 
      ? 'deadlocked' 
      : state.processes.some(p => p.status === 'blocked') 
        ? 'unsafe' 
        : 'safe';
    
    if (result.isDeadlocked && state.systemState !== 'deadlocked') {
      set((state) => ({
        totalDeadlocksDetected: state.totalDeadlocksDetected + 1,
      }));
      
      get().addEvent({
        type: 'deadlock_detected',
        description: `Deadlock detected involving: ${result.deadlockedProcesses.join(', ')}`,
        data: { processes: result.deadlockedProcesses, cycle: result.cycle },
      });
    }
    
    set({ detectionResult: result, systemState: newSystemState });
    return result;
  },

  setDetectionAlgorithm: (algorithm) => {
    set({ detectionAlgorithm: algorithm });
  },

  // Silent auto-detection — runs after every topology change
  // Uses cycle detection (fast, no steps generated) to keep graph reactive
  _autoDetect: () => {
    const state = get();
    if (state.processes.length === 0) return;

    // Always use cycle detection for auto-detection (it's O(V+E) and fast)
    const { detectCycle } = require('../algorithms/cycleDetection');
    const cycleResult = detectCycle(state.processes, state.resources, state.edges);

    const isDeadlocked = cycleResult.hasCycle;
    const newSystemState: SystemState = isDeadlocked
      ? 'deadlocked'
      : state.processes.some(p => p.status === 'blocked')
      ? 'unsafe'
      : 'safe';

    if (isDeadlocked && state.systemState !== 'deadlocked') {
      set(s => ({ totalDeadlocksDetected: s.totalDeadlocksDetected + 1 }));
      get().addEvent({
        type: 'deadlock_detected',
        description: `Deadlock detected: ${cycleResult.deadlockedProcesses.join(', ')}`,
        data: { processes: cycleResult.deadlockedProcesses, cycle: cycleResult.cycle },
      });
    }

    set({
      detectionResult: {
        isDeadlocked,
        deadlockedProcesses: cycleResult.deadlockedProcesses,
        cycle: cycleResult.cycle,
        algorithm: 'cycle',
        executionSteps: [], // no steps for auto-detect
      },
      systemState: newSystemState,
    });
  },

  // Recovery
  applyRecovery: (method, data) => {
    get().addEvent({
      type: 'recovery_applied',
      description: `Recovery method ${method} applied`,
      data: { method, ...data },
    });
  },

  // Checkpoints
  saveCheckpoint: (name) => {
    const id = `CP${checkpointCounter++}`;
    const checkpoint: Checkpoint = {
      id,
      name,
      timestamp: Date.now(),
      processes: JSON.parse(JSON.stringify(get().processes)),
      resources: JSON.parse(JSON.stringify(get().resources)),
      edges: JSON.parse(JSON.stringify(get().edges)),
    };
    
    set((state) => ({
      checkpoints: [...state.checkpoints, checkpoint],
    }));
  },

  loadCheckpoint: (id) => {
    const checkpoint = get().checkpoints.find(cp => cp.id === id);
    if (!checkpoint) return;
    
    set({
      processes: JSON.parse(JSON.stringify(checkpoint.processes)),
      resources: JSON.parse(JSON.stringify(checkpoint.resources)),
      edges: JSON.parse(JSON.stringify(checkpoint.edges)),
    });
  },

  // Simulation Control
  startSimulation: () => set({ isRunning: true }),
  pauseSimulation: () => set({ isRunning: false }),
  resetSimulation: () => {
    processCounter = 1;
    resourceCounter = 1;
    set({
      processes: [],
      resources: [],
      edges: [],
      systemState: 'safe',
      detectionResult: null,
      events: [],
      isRunning: false,
    });
  },
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  // Scenarios
  loadScenario: (scenario) => {
    // Full reset first (resets counters too)
    get().reset();

    // Add processes and capture their real IDs in order
    const processIds: string[] = [];
    const numProcesses = scenario.processes?.length ?? 0;
    for (let i = 0; i < numProcesses; i++) {
      get().addProcess();
      const state = get();
      processIds.push(state.processes[state.processes.length - 1].id);
    }

    // Add resources and capture their real IDs in order
    const resourceIds: string[] = [];
    for (const r of (scenario.resources ?? [])) {
      get().addResource(r.name, r.instances);
      const state = get();
      resourceIds.push(state.resources[state.resources.length - 1].id);
    }

    // Helper: resolve index-based OR name-based process/resource references
    const resolveProcess = (ref: string | number): string => {
      if (typeof ref === 'number') return processIds[ref] ?? '';
      // If ref looks like "P1", "P2" … treat the trailing number as 1-based index
      const match = ref.match(/^P(\d+)$/i);
      if (match) return processIds[parseInt(match[1]) - 1] ?? ref;
      return ref;
    };
    const resolveResource = (ref: string | number): string => {
      if (typeof ref === 'number') return resourceIds[ref] ?? '';
      const match = ref.match(/^R(\d+)$/i);
      if (match) return resourceIds[parseInt(match[1]) - 1] ?? ref;
      return ref;
    };

    // Apply allocations
    for (const a of (scenario.allocations ?? [])) {
      get().allocateResource(resolveProcess(a.process), resolveResource(a.resource));
    }

    // Apply requests
    for (const r of (scenario.requests ?? [])) {
      get().requestResource(resolveProcess(r.process), resolveResource(r.resource));
    }
  },

  // Events
  addEvent: (event) => {
    const newEvent: SimulationEvent = {
      ...event,
      id: `E${eventCounter++}`,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      events: [newEvent, ...state.events].slice(0, 100), // Keep last 100 events
    }));
  },

  clearEvents: () => set({ events: [] }),

  // Reset
  reset: () => {
    processCounter = 1;
    resourceCounter = 1;
    eventCounter = 1;
    checkpointCounter = 1;
    set({
      processes: [],
      resources: [],
      edges: [],
      systemState: 'safe',
      detectionResult: null,
      detectionAlgorithm: 'cycle',
      isRunning: false,
      simulationSpeed: 1,
      events: [],
      checkpoints: [],
      totalDeadlocksDetected: 0,
      totalProcessesTerminated: 0,
      totalResourcesPreempted: 0,
    });
  },
}));
