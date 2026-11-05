import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { 
  AlertTriangle, 
  Trash2, 
  RotateCcw, 
  History, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  Play
} from 'lucide-react';

type RecoveryMethod = 'terminate' | 'preempt' | 'rollback';

interface RecoveryStrategy {
  id: RecoveryMethod;
  name: string;
  icon: any;
  description: string;
  pros: string[];
  cons: string[];
  color: string;
  bgColor: string;
  complexity: 'Low' | 'Medium' | 'High';
  overhead: 'Low' | 'Medium' | 'High';
}

const recoveryStrategies: RecoveryStrategy[] = [
  {
    id: 'terminate',
    name: 'Process Termination',
    icon: Trash2,
    description: 'Terminate one or more processes involved in the deadlock to break the circular wait.',
    pros: [
      'Immediate deadlock resolution',
      'Simple implementation',
      'No resource rollback needed'
    ],
    cons: [
      'Work loss for terminated processes',
      'May need to terminate multiple processes',
      'Selecting optimal victim is complex'
    ],
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    complexity: 'Low',
    overhead: 'Low'
  },
  {
    id: 'preempt',
    name: 'Resource Preemption',
    icon: Zap,
    description: 'Preempt resources from processes and reallocate them to break the deadlock.',
    pros: [
      'Preserves process state',
      'Flexible resource reallocation',
      'Can minimize affected processes'
    ],
    cons: [
      'Requires resource state saving',
      'Process may need to restart',
      'Not all resources can be preempted'
    ],
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    complexity: 'Medium',
    overhead: 'Medium'
  },
  {
    id: 'rollback',
    name: 'Checkpoint & Rollback',
    icon: RotateCcw,
    description: 'Roll back processes to a previous safe checkpoint state before the deadlock occurred.',
    pros: [
      'Can restore system to safe state',
      'Minimal process termination',
      'Preserves most computation'
    ],
    cons: [
      'Requires checkpoint infrastructure',
      'High storage overhead',
      'May need multiple rollbacks'
    ],
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    complexity: 'High',
    overhead: 'High'
  }
];

export default function RecoveryCenter() {
  const {
    processes,
    resources,
    detectionResult,
    systemState,
    terminateProcess,
    releaseResource,
    checkpoints,
    loadCheckpoint,
    saveCheckpoint,
    totalProcessesTerminated,
    totalResourcesPreempted,
    applyRecovery,
    runDetection
  } = useSimulationStore();

  const [selectedStrategy, setSelectedStrategy] = useState<RecoveryMethod | null>(null);
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([]);
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [recoveryLog, setRecoveryLog] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const deadlockedProcesses = detectionResult?.deadlockedProcesses || [];
  const isDeadlocked = systemState === 'deadlocked';

  const handleTerminate = () => {
    if (selectedProcesses.length === 0) {
      alert('Please select at least one process to terminate');
      return;
    }

    const log: string[] = [];
    selectedProcesses.forEach(processId => {
      terminateProcess(processId);
      log.push(`✓ Process ${processId} terminated`);
    });

    applyRecovery('terminate', { processes: selectedProcesses });
    setRecoveryLog(log);
    setSelectedProcesses([]);
    
    // Run detection after recovery
    setTimeout(() => {
      runDetection();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handlePreempt = () => {
    if (selectedProcesses.length === 0 || selectedResources.length === 0) {
      alert('Please select processes and resources for preemption');
      return;
    }

    const log: string[] = [];
    selectedProcesses.forEach(processId => {
      const process = processes.find(p => p.id === processId);
      if (process) {
        selectedResources.forEach(resourceId => {
          if (process.allocatedResources.includes(resourceId)) {
            releaseResource(processId, resourceId);
            log.push(`✓ Preempted ${resourceId} from ${processId}`);
          }
        });
      }
    });

    applyRecovery('preempt', { processes: selectedProcesses, resources: selectedResources });
    setRecoveryLog(log);
    setSelectedProcesses([]);
    setSelectedResources([]);

    setTimeout(() => {
      runDetection();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handleRollback = (checkpointId: string) => {
    loadCheckpoint(checkpointId);
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    
    setRecoveryLog([
      `✓ Rolled back to checkpoint: ${checkpoint?.name}`,
      `✓ Restored ${checkpoint?.processes.length} processes`,
      `✓ Restored ${checkpoint?.resources.length} resources`
    ]);

    applyRecovery('rollback', { checkpointId });

    setTimeout(() => {
      runDetection();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 500);
  };

  const handleCreateCheckpoint = () => {
    const name = prompt('Enter checkpoint name:');
    if (name) {
      saveCheckpoint(name);
      setRecoveryLog([`✓ Checkpoint "${name}" created successfully`]);
    }
  };

  const toggleProcessSelection = (processId: string) => {
    setSelectedProcesses(prev =>
      prev.includes(processId)
        ? prev.filter(id => id !== processId)
        : [...prev, processId]
    );
  };

  const toggleResourceSelection = (resourceId: string) => {
    setSelectedResources(prev =>
      prev.includes(resourceId)
        ? prev.filter(id => id !== resourceId)
        : [...prev, resourceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Recovery Center</h1>
          <p className="text-text-secondary mt-1">
            Resolve deadlocks using various recovery strategies
          </p>
        </div>
        <button
          onClick={handleCreateCheckpoint}
          className="btn btn-primary"
        >
          <History className="w-4 h-4" />
          Create Checkpoint
        </button>
      </div>

      {/* System Status */}
      <div className={`card ${isDeadlocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} animate-fadeInUp`}>
        <div className="flex items-center gap-4">
          {isDeadlocked ? (
            <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              {isDeadlocked ? 'Deadlock Detected!' : 'System Running Normally'}
            </h3>
            <p className="text-sm text-text-secondary">
              {isDeadlocked 
                ? `${deadlockedProcesses.length} process(es) involved in deadlock`
                : 'No deadlock detected in the system'
              }
            </p>
          </div>
          {isDeadlocked && (
            <div className="text-right">
              <p className="text-sm font-medium text-red-600">
                Affected Processes: {deadlockedProcesses.join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="card bg-green-50 border-green-200 animate-fadeInDown">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-700 font-medium">Recovery applied successfully!</p>
          </div>
        </div>
      )}

      {/* Recovery Strategies */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Recovery Strategies</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {recoveryStrategies.map((strategy, index) => {
            const Icon = strategy.icon;
            const isSelected = selectedStrategy === strategy.id;
            
            return (
              <div
                key={strategy.id}
                className={`card cursor-pointer transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-primary-500 shadow-lg' : 'hover-lift'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className={`${strategy.bgColor} ${strategy.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {strategy.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4">
                  {strategy.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <p className="text-xs text-text-secondary">Complexity</p>
                    <p className="text-sm font-medium">{strategy.complexity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Overhead</p>
                    <p className="text-sm font-medium">{strategy.overhead}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs font-medium text-green-600 mb-1">Advantages:</p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {strategy.pros.slice(0, 2).map((pro, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-600 mb-1">Disadvantages:</p>
                    <ul className="text-xs text-text-secondary space-y-1">
                      {strategy.cons.slice(0, 2).map((con, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-500 mt-0.5">✗</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  className={`btn w-full ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStrategy(strategy.id);
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Strategy'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recovery Action Panel */}
      {selectedStrategy && (
        <div className="card animate-fadeInUp">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            Apply {recoveryStrategies.find(s => s.id === selectedStrategy)?.name}
          </h3>

          {/* Termination Panel */}
          {selectedStrategy === 'terminate' && (
            <div className="space-y-4">
              <p className="text-text-secondary">
                Select process(es) to terminate. Consider terminating processes with:
              </p>
              <ul className="text-sm text-text-secondary list-disc list-inside space-y-1">
                <li>Lowest priority or importance</li>
                <li>Least amount of work completed</li>
                <li>Fewest resources allocated</li>
              </ul>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {processes.map(process => {
                  const isSelected = selectedProcesses.includes(process.id);
                  const isDeadlocked = deadlockedProcesses.includes(process.id);
                  
                  return (
                    <div
                      key={process.id}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-500 bg-red-50'
                          : isDeadlocked
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-border hover:border-red-300'
                      }`}
                      onClick={() => toggleProcessSelection(process.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{process.id}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="text-xs text-text-secondary">
                        <p>Resources: {process.allocatedResources.length}</p>
                        <p>Status: {process.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleTerminate}
                disabled={selectedProcesses.length === 0}
                className="btn btn-danger"
              >
                <Trash2 className="w-4 h-4" />
                Terminate Selected ({selectedProcesses.length})
              </button>
            </div>
          )}

          {/* Preemption Panel */}
          {selectedStrategy === 'preempt' && (
            <div className="space-y-4">
              <p className="text-text-secondary">
                Select processes and resources to preempt. Resources will be released from selected processes.
              </p>

              <div>
                <h4 className="font-medium mb-2">Select Processes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {processes.filter(p => p.allocatedResources.length > 0).map(process => {
                    const isSelected = selectedProcesses.includes(process.id);
                    const isDeadlocked = deadlockedProcesses.includes(process.id);
                    
                    return (
                      <div
                        key={process.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : isDeadlocked
                            ? 'border-orange-300'
                            : 'border-border hover:border-orange-300'
                        }`}
                        onClick={() => toggleProcessSelection(process.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{process.id}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-orange-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Select Resources to Preempt:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {resources.map(resource => {
                    const isSelected = selectedResources.includes(resource.id);
                    
                    return (
                      <div
                        key={resource.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-border hover:border-orange-300'
                        }`}
                        onClick={() => toggleResourceSelection(resource.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{resource.id}</span>
                          {isSelected && <CheckCircle className="w-4 h-4 text-orange-500" />}
                        </div>
                        <p className="text-xs text-text-secondary">
                          Allocated: {resource.totalInstances - resource.availableInstances}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handlePreempt}
                disabled={selectedProcesses.length === 0 || selectedResources.length === 0}
                className="btn bg-orange-600 text-white hover:bg-orange-700"
              >
                <Zap className="w-4 h-4" />
                Preempt Resources
              </button>
            </div>
          )}

          {/* Rollback Panel */}
          {selectedStrategy === 'rollback' && (
            <div className="space-y-4">
              <p className="text-text-secondary">
                Select a checkpoint to roll back to. The system will restore to the saved state.
              </p>

              {checkpoints.length === 0 ? (
                <div className="text-center py-8 bg-background-secondary rounded-lg">
                  <History className="w-12 h-12 text-text-secondary mx-auto mb-2" />
                  <p className="text-text-secondary">No checkpoints available</p>
                  <p className="text-sm text-text-secondary">Create a checkpoint to enable rollback</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {checkpoints.map(checkpoint => (
                    <div
                      key={checkpoint.id}
                      className="p-4 border border-border rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-text-primary">{checkpoint.name}</h4>
                          <p className="text-sm text-text-secondary">
                            {new Date(checkpoint.timestamp).toLocaleString()}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                            <span>Processes: {checkpoint.processes.length}</span>
                            <span>Resources: {checkpoint.resources.length}</span>
                            <span>Edges: {checkpoint.edges.length}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRollback(checkpoint.id)}
                          className="btn btn-primary btn-sm"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Rollback
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recovery Log */}
      {recoveryLog.length > 0 && (
        <div className="card animate-fadeInUp">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recovery Log</h3>
          <div className="bg-background-secondary rounded-lg p-4 font-mono text-sm space-y-1">
            {recoveryLog.map((log, index) => (
              <div key={index} className="text-text-secondary animate-fadeIn" style={{ animationDelay: `${index * 100}ms` }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Terminations</p>
              <p className="text-2xl font-bold text-text-primary">{totalProcessesTerminated}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Resources Preempted</p>
              <p className="text-2xl font-bold text-text-primary">{totalResourcesPreempted}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Checkpoints Saved</p>
              <p className="text-2xl font-bold text-text-primary">{checkpoints.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
