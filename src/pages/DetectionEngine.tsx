import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { Play, ChevronLeft, ChevronRight, RotateCcw, CheckCircle, XCircle } from 'lucide-react';

export default function DetectionEngine() {
  const [currentStep, setCurrentStep] = useState(0);
  
  const processes = useSimulationStore((state) => state.processes);
  const resources = useSimulationStore((state) => state.resources);
  const detectionResult = useSimulationStore((state) => state.detectionResult);
  const detectionAlgorithm = useSimulationStore((state) => state.detectionAlgorithm);
  const setDetectionAlgorithm = useSimulationStore((state) => state.setDetectionAlgorithm);
  const runDetection = useSimulationStore((state) => state.runDetection);

  const handleRunDetection = () => {
    runDetection();
    setCurrentStep(0);
  };

  const steps = detectionResult?.executionSteps || [];
  const currentStepData = steps[currentStep];

  const handlePrevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Detection Algorithm</h3>
            <p className="text-sm text-text-secondary mt-1">
              Choose an algorithm and run deadlock detection
            </p>
          </div>
          <button onClick={handleRunDetection} className="btn btn-primary">
            <Play className="w-4 h-4" />
            Run Detection
          </button>
        </div>

        {/* Algorithm Selection */}
        <div className="flex gap-4">
          <button
            onClick={() => setDetectionAlgorithm('cycle')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              detectionAlgorithm === 'cycle'
                ? 'border-primary-600 bg-primary-50'
                : 'border-border hover:border-primary-300'
            }`}
          >
            <h4 className="font-semibold text-text-primary mb-1">Cycle Detection (DFS)</h4>
            <p className="text-xs text-text-secondary">
              Graph-based detection for single-instance resources
            </p>
          </button>

          <button
            onClick={() => setDetectionAlgorithm('matrix')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              detectionAlgorithm === 'matrix'
                ? 'border-primary-600 bg-primary-50'
                : 'border-border hover:border-primary-300'
            }`}
          >
            <h4 className="font-semibold text-text-primary mb-1">Matrix Detection (Banker's)</h4>
            <p className="text-xs text-text-secondary">
              Matrix-based detection for multiple-instance resources
            </p>
          </button>
        </div>
      </div>

      {/* Detection Result */}
      {detectionResult && (
        <div className={`card ${detectionResult.isDeadlocked ? 'bg-red-50 border-danger-200' : 'bg-green-50 border-success-200'}`}>
          <div className="flex items-start gap-4">
            {detectionResult.isDeadlocked ? (
              <XCircle className="w-6 h-6 text-danger-600 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-2 ${detectionResult.isDeadlocked ? 'text-danger-600' : 'text-success-600'}`}>
                {detectionResult.isDeadlocked ? 'Deadlock Detected' : 'No Deadlock'}
              </h3>
              {detectionResult.isDeadlocked ? (
                <div className="space-y-2">
                  <p className="text-sm text-danger-700">
                    Deadlocked processes: <strong>{detectionResult.deadlockedProcesses.join(', ')}</strong>
                  </p>
                  {detectionResult.cycle.length > 0 && (
                    <p className="text-sm text-danger-700">
                      Cycle: {detectionResult.cycle.join(' → ')} → {detectionResult.cycle[0]}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-success-700">
                  The system is in a safe state. All processes can complete.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Execution */}
      {steps.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Step-by-Step Execution
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 0}
                className="btn btn-secondary btn-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-text-secondary px-3">
                Step {currentStep + 1} / {steps.length}
              </span>
              <button
                onClick={handleNextStep}
                disabled={currentStep === steps.length - 1}
                className="btn btn-secondary btn-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentStep(0)}
                className="btn btn-secondary btn-sm ml-2"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {currentStepData && (
            <div className="space-y-4">
              {/* Step Description */}
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <p className="text-sm text-text-primary">
                  <strong>Step {currentStepData.step}:</strong> {currentStepData.description}
                </p>
              </div>

              {/* Visualization based on algorithm */}
              {detectionAlgorithm === 'cycle' && (
                <CycleDetectionVisualization step={currentStepData} />
              )}

              {detectionAlgorithm === 'matrix' && (
                <MatrixDetectionVisualization 
                  step={currentStepData} 
                  processes={processes}
                  resources={resources}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Current System State</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Processes:</span>
              <span className="font-medium text-text-primary">{processes.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Resources:</span>
              <span className="font-medium text-text-primary">{resources.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Blocked Processes:</span>
              <span className="font-medium text-text-primary">
                {processes.filter(p => p.status === 'blocked').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Algorithm Info</h3>
          <div className="text-sm text-text-secondary space-y-2">
            {detectionAlgorithm === 'cycle' ? (
              <>
                <p><strong>Time Complexity:</strong> O(V + E)</p>
                <p><strong>Space Complexity:</strong> O(V)</p>
                <p><strong>Best For:</strong> Single-instance resources</p>
              </>
            ) : (
              <>
                <p><strong>Time Complexity:</strong> O(m × n²)</p>
                <p><strong>Space Complexity:</strong> O(m × n)</p>
                <p><strong>Best For:</strong> Multiple-instance resources</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CycleDetectionVisualization({ step }: { step: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card bg-background-secondary">
        <h4 className="font-semibold text-sm text-text-primary mb-3">Visited Nodes</h4>
        <div className="flex flex-wrap gap-2">
          {step.visited?.map((node: string) => (
            <span key={node} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm">
              {node}
            </span>
          ))}
        </div>
      </div>

      <div className="card bg-background-secondary">
        <h4 className="font-semibold text-sm text-text-primary mb-3">Stack</h4>
        <div className="flex flex-wrap gap-2">
          {step.stack?.map((node: string) => (
            <span key={node} className="px-3 py-1 bg-violet-100 text-violet-700 rounded-lg text-sm">
              {node}
            </span>
          ))}
        </div>
      </div>

      <div className="card bg-background-secondary">
        <h4 className="font-semibold text-sm text-text-primary mb-3">Current Path</h4>
        <div className="text-sm text-text-primary">
          {step.path?.join(' → ') || 'Empty'}
        </div>
      </div>
    </div>
  );
}

function MatrixDetectionVisualization({ 
  step, 
  processes, 
  resources 
}: { 
  step: any; 
  processes: any[]; 
  resources: any[];
}) {
  return (
    <div className="space-y-4">
      {/* Available and Work Vectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-background-secondary">
          <h4 className="font-semibold text-sm text-text-primary mb-3">Available</h4>
          <div className="flex gap-2">
            {step.available?.map((val: number, idx: number) => (
              <div key={idx} className="flex-1 p-2 bg-white rounded text-center">
                <div className="text-xs text-text-secondary">{resources[idx]?.name || `R${idx}`}</div>
                <div className="text-lg font-semibold text-text-primary">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card bg-background-secondary">
          <h4 className="font-semibold text-sm text-text-primary mb-3">Work</h4>
          <div className="flex gap-2">
            {step.work?.map((val: number, idx: number) => (
              <div key={idx} className="flex-1 p-2 bg-white rounded text-center">
                <div className="text-xs text-text-secondary">{resources[idx]?.name || `R${idx}`}</div>
                <div className="text-lg font-semibold text-text-primary">{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finish Vector */}
      <div className="card bg-background-secondary">
        <h4 className="font-semibold text-sm text-text-primary mb-3">Finish Vector</h4>
        <div className="flex gap-2">
          {step.finish?.map((val: boolean, idx: number) => (
            <div 
              key={idx} 
              className={`flex-1 p-2 rounded text-center ${
                val ? 'bg-green-100 text-success-700' : 'bg-red-100 text-danger-700'
              }`}
            >
              <div className="text-xs">{processes[idx]?.name || `P${idx}`}</div>
              <div className="text-sm font-semibold">{val ? 'True' : 'False'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-background-secondary">
          <h4 className="font-semibold text-sm text-text-primary mb-3">Allocation Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {resources.map((r, idx) => (
                    <th key={idx} className="p-1 text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.allocation?.map((row: number[], idx: number) => (
                  <tr key={idx}>
                    <td className="p-1 font-medium">{processes[idx]?.name || `P${idx}`}</td>
                    {row.map((val, colIdx) => (
                      <td key={colIdx} className="p-1 text-center bg-white">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-background-secondary">
          <h4 className="font-semibold text-sm text-text-primary mb-3">Request Matrix</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-1"></th>
                  {resources.map((r, idx) => (
                    <th key={idx} className="p-1 text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.request?.map((row: number[], idx: number) => (
                  <tr key={idx}>
                    <td className="p-1 font-medium">{processes[idx]?.name || `P${idx}`}</td>
                    {row.map((val, colIdx) => (
                      <td key={colIdx} className="p-1 text-center bg-white">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
