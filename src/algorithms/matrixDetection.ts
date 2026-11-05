import { Process, Resource } from '../store/simulationStore';

export interface MatrixDetectionStep {
  step: number;
  description: string;
  available: number[];
  allocation: number[][];
  request: number[][];
  work: number[];
  finish: boolean[];
  processChecked?: string;
  canProceed?: boolean;
}

export interface MatrixDetectionResult {
  isDeadlocked: boolean;
  deadlockedProcesses: string[];
  safeSequence: string[];
  steps: MatrixDetectionStep[];
  finalMatrices: {
    available: number[];
    allocation: number[][];
    request: number[][];
    work: number[];
    finish: boolean[];
  };
}

/**
 * Banker's Algorithm style detection for multiple resource instances
 */
export function detectDeadlockMatrix(
  processes: Process[],
  resources: Resource[]
): MatrixDetectionResult {
  const steps: MatrixDetectionStep[] = [];
  const n = processes.length;
  const m = resources.length;

  if (n === 0 || m === 0) {
    return {
      isDeadlocked: false,
      deadlockedProcesses: [],
      safeSequence: [],
      steps: [],
      finalMatrices: {
        available: [],
        allocation: [],
        request: [],
        work: [],
        finish: [],
      },
    };
  }

  // Initialize matrices
  const available: number[] = resources.map(r => r.availableInstances);
  const allocation: number[][] = Array(n).fill(0).map(() => Array(m).fill(0));
  const request: number[][] = Array(n).fill(0).map(() => Array(m).fill(0));

  // Fill allocation matrix
  processes.forEach((process, i) => {
    process.allocatedResources.forEach(resourceId => {
      const resourceIndex = resources.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        allocation[i][resourceIndex] += 1;
      }
    });
  });

  // Fill request matrix
  processes.forEach((process, i) => {
    process.requestedResources.forEach(resourceId => {
      const resourceIndex = resources.findIndex(r => r.id === resourceId);
      if (resourceIndex !== -1) {
        request[i][resourceIndex] += 1;
      }
    });
  });

  // Initialize Work and Finish
  let work = [...available];
  let finish = processes.map(p => {
    // A process is initially finished if it has no allocations
    return p.allocatedResources.length === 0;
  });

  steps.push({
    step: 0,
    description: 'Initial state - Work = Available, Finish initialized',
    available: [...available],
    allocation: allocation.map(row => [...row]),
    request: request.map(row => [...row]),
    work: [...work],
    finish: [...finish],
  });

  // Algorithm execution
  let changed = true;
  let stepCount = 1;
  const safeSequence: string[] = [];

  while (changed) {
    changed = false;

    for (let i = 0; i < n; i++) {
      if (!finish[i]) {
        // Check if Request[i] <= Work
        const canProceed = request[i].every((req, j) => req <= work[j]);

        steps.push({
          step: stepCount++,
          description: `Checking ${processes[i].id}: Request ${request[i].join(',')} ${canProceed ? '<=' : '>'} Work ${work.join(',')}`,
          available: [...available],
          allocation: allocation.map(row => [...row]),
          request: request.map(row => [...row]),
          work: [...work],
          finish: [...finish],
          processChecked: processes[i].id,
          canProceed,
        });

        if (canProceed) {
          // Process can complete
          for (let j = 0; j < m; j++) {
            work[j] += allocation[i][j];
          }
          finish[i] = true;
          changed = true;
          safeSequence.push(processes[i].id);

          steps.push({
            step: stepCount++,
            description: `${processes[i].id} can proceed. Work = Work + Allocation[${i}] = ${work.join(',')}`,
            available: [...available],
            allocation: allocation.map(row => [...row]),
            request: request.map(row => [...row]),
            work: [...work],
            finish: [...finish],
            processChecked: processes[i].id,
            canProceed: true,
          });

          break; // Start over to maintain proper order
        }
      }
    }
  }

  // Determine deadlocked processes
  const deadlockedProcesses: string[] = [];
  finish.forEach((isFinished, i) => {
    if (!isFinished) {
      deadlockedProcesses.push(processes[i].id);
    }
  });

  const isDeadlocked = deadlockedProcesses.length > 0;

  if (isDeadlocked) {
    steps.push({
      step: stepCount++,
      description: `Deadlock detected! Processes ${deadlockedProcesses.join(', ')} cannot complete.`,
      available: [...available],
      allocation: allocation.map(row => [...row]),
      request: request.map(row => [...row]),
      work: [...work],
      finish: [...finish],
    });
  } else {
    steps.push({
      step: stepCount++,
      description: `No deadlock. Safe sequence: ${safeSequence.join(' → ')}`,
      available: [...available],
      allocation: allocation.map(row => [...row]),
      request: request.map(row => [...row]),
      work: [...work],
      finish: [...finish],
    });
  }

  return {
    isDeadlocked,
    deadlockedProcesses,
    safeSequence,
    steps,
    finalMatrices: {
      available,
      allocation,
      request,
      work,
      finish,
    },
  };
}
