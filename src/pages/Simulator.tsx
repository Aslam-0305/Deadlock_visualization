import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { Plus, Trash2, Play, Pause, RotateCcw, Settings, ArrowRight, Link, Unlink } from 'lucide-react';

const scenarios = [
  { id: 'safe', name: 'Safe State', description: 'System with no deadlock' },
  { id: 'simple', name: 'Simple Deadlock', description: 'Basic 2-process deadlock' },
  { id: 'circular', name: 'Circular Wait', description: 'Circular dependency chain' },
  { id: 'multi-process', name: 'Multiple Process Deadlock', description: '3+ processes deadlocked' },
  { id: 'multi-instance', name: 'Multiple Resource Instances', description: 'Resources with multiple instances' },
  { id: 'complex', name: 'Complex Deadlock', description: 'Advanced deadlock scenario' },
];

export default function Simulator() {
  const processes = useSimulationStore((state) => state.processes);
  const resources = useSimulationStore((state) => state.resources);
  const edges = useSimulationStore((state) => state.edges);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const events = useSimulationStore((state) => state.events);
  const simulationSpeed = useSimulationStore((state) => state.simulationSpeed);

  const addProcess = useSimulationStore((state) => state.addProcess);
  const removeProcess = useSimulationStore((state) => state.removeProcess);
  const addResource = useSimulationStore((state) => state.addResource);
  const removeResource = useSimulationStore((state) => state.removeResource);
  const requestResource = useSimulationStore((state) => state.requestResource);
  const allocateResource = useSimulationStore((state) => state.allocateResource);
  const releaseResource = useSimulationStore((state) => state.releaseResource);
  const startSimulation = useSimulationStore((state) => state.startSimulation);
  const pauseSimulation = useSimulationStore((state) => state.pauseSimulation);
  const resetSimulation = useSimulationStore((state) => state.resetSimulation);
  const setSimulationSpeed = useSimulationStore((state) => state.setSimulationSpeed);
  const loadScenario = useSimulationStore((state) => state.loadScenario);

  // Controlled state for Quick Actions
  const [selectedProcess, setSelectedProcess] = useState('');
  const [selectedResource, setSelectedResource] = useState('');
  const [actionFeedback, setActionFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  const showFeedback = (msg: string, ok: boolean) => {
    setActionFeedback({ msg, ok });
    setTimeout(() => setActionFeedback(null), 2500);
  };

  const handleRequest = () => {
    if (!selectedProcess || !selectedResource) {
      showFeedback('Select both a process and a resource first.', false);
      return;
    }
    const ok = requestResource(selectedProcess, selectedResource);
    if (ok) {
      showFeedback(`${selectedProcess} → requesting ${selectedResource}`, true);
    } else {
      showFeedback(`Request failed — already requested or invalid selection.`, false);
    }
  };

  const handleAllocate = () => {
    if (!selectedProcess || !selectedResource) {
      showFeedback('Select both a process and a resource first.', false);
      return;
    }
    const resource = resources.find(r => r.id === selectedResource);
    if (resource && resource.availableInstances < 1) {
      // No free instances — create a REQUEST instead (causes deadlock condition)
      const ok = requestResource(selectedProcess, selectedResource);
      if (ok) {
        showFeedback(`${selectedResource} fully allocated → request created for ${selectedProcess} (deadlock risk!)`, false);
      } else {
        showFeedback(`${selectedProcess} already waiting for ${selectedResource}.`, false);
      }
      return;
    }
    const ok = allocateResource(selectedProcess, selectedResource);
    if (ok) {
      showFeedback(`${selectedResource} allocated to ${selectedProcess}`, true);
    } else {
      showFeedback(`Allocation failed — check resource availability.`, false);
    }
  };

  const handleRelease = () => {
    if (!selectedProcess || !selectedResource) {
      showFeedback('Select both a process and a resource first.', false);
      return;
    }
    const process = processes.find(p => p.id === selectedProcess);
    if (!process?.allocatedResources.includes(selectedResource)) {
      showFeedback(`${selectedProcess} does not hold ${selectedResource}.`, false);
      return;
    }
    const ok = releaseResource(selectedProcess, selectedResource);
    if (ok) {
      showFeedback(`${selectedProcess} released ${selectedResource}`, true);
    } else {
      showFeedback(`Release failed.`, false);
    }
  };

  const handleLoadScenario = (scenarioId: string) => {
    setSelectedProcess('');
    setSelectedResource('');
    const scenarioConfigs: Record<string, any> = {
      'safe': {
        processes: [{}, {}],
        resources: [{ name: 'R1', instances: 2 }],
        allocations: [{ process: 'P1', resource: 'R1' }],
        requests: [],
      },
      'simple': {
        processes: [{}, {}],
        resources: [{ name: 'R1', instances: 1 }, { name: 'R2', instances: 1 }],
        allocations: [{ process: 'P1', resource: 'R1' }, { process: 'P2', resource: 'R2' }],
        requests: [{ process: 'P1', resource: 'R2' }, { process: 'P2', resource: 'R1' }],
      },
      'circular': {
        processes: [{}, {}, {}],
        resources: [{ name: 'R1', instances: 1 }, { name: 'R2', instances: 1 }, { name: 'R3', instances: 1 }],
        allocations: [
          { process: 'P1', resource: 'R1' },
          { process: 'P2', resource: 'R2' },
          { process: 'P3', resource: 'R3' },
        ],
        requests: [
          { process: 'P1', resource: 'R2' },
          { process: 'P2', resource: 'R3' },
          { process: 'P3', resource: 'R1' },
        ],
      },
      'multi-process': {
        processes: [{}, {}, {}, {}],
        resources: [{ name: 'R1', instances: 1 }, { name: 'R2', instances: 1 }],
        allocations: [{ process: 'P1', resource: 'R1' }, { process: 'P3', resource: 'R2' }],
        requests: [
          { process: 'P1', resource: 'R2' },
          { process: 'P2', resource: 'R1' },
          { process: 'P3', resource: 'R1' },
          { process: 'P4', resource: 'R2' },
        ],
      },
      'multi-instance': {
        processes: [{}, {}, {}],
        resources: [{ name: 'R1', instances: 3 }, { name: 'R2', instances: 2 }],
        allocations: [
          { process: 'P1', resource: 'R1' },
          { process: 'P2', resource: 'R1' },
          { process: 'P3', resource: 'R2' },
        ],
        requests: [{ process: 'P1', resource: 'R2' }],
      },
      'complex': {
        processes: [{}, {}, {}, {}],
        resources: [
          { name: 'R1', instances: 2 },
          { name: 'R2', instances: 1 },
          { name: 'R3', instances: 2 },
        ],
        allocations: [
          { process: 'P1', resource: 'R1' },
          { process: 'P2', resource: 'R2' },
          { process: 'P3', resource: 'R3' },
          { process: 'P4', resource: 'R1' },
        ],
        requests: [
          { process: 'P1', resource: 'R2' },
          { process: 'P2', resource: 'R3' },
          { process: 'P3', resource: 'R1' },
          { process: 'P4', resource: 'R2' },
        ],
      },
    };

    loadScenario(scenarioConfigs[scenarioId] || scenarioConfigs['safe']);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Simulation Controls */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Simulation Controls</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => (isRunning ? pauseSimulation() : startSimulation())}
                className={`btn ${isRunning ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Start'}
              </button>
              <button onClick={resetSimulation} className="btn btn-secondary">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary">Speed:</span>
            <div className="flex gap-2">
              {[0.5, 1, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setSimulationSpeed(speed)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    simulationSpeed === speed
                      ? 'bg-primary-600 text-white'
                      : 'bg-background-secondary text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Process Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Processes</h3>
            <button onClick={() => addProcess()} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Process
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {processes.map((process) => (
              <div key={process.id} className="p-4 bg-background-secondary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">{process.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      process.status === 'running' ? 'bg-green-100 text-green-700' :
                      process.status === 'blocked' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {process.status}
                    </span>
                  </div>
                  <button
                    onClick={() => removeProcess(process.id)}
                    className="text-danger-500 hover:text-danger-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-text-secondary">Allocated: </span>
                    <span className="text-text-primary">
                      {process.allocatedResources.join(', ') || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Requested: </span>
                    <span className="text-text-primary">
                      {process.requestedResources.join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {processes.length === 0 && (
              <div className="col-span-2 text-center py-8 text-text-secondary">
                No processes. Click "Add Process" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Resource Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text-primary">Resources</h3>
            <button onClick={() => addResource()} className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resources.map((resource) => (
              <div key={resource.id} className="p-4 bg-background-secondary rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-text-primary">{resource.name}</h4>
                    <span className="text-xs text-text-secondary">
                      {resource.availableInstances}/{resource.totalInstances} available
                    </span>
                  </div>
                  <button
                    onClick={() => removeResource(resource.id)}
                    className="text-danger-500 hover:text-danger-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="w-full bg-white rounded-full h-2 mb-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((resource.totalInstances - resource.availableInstances) / resource.totalInstances) * 100}%`,
                    }}
                  />
                </div>

                <div className="text-xs text-text-secondary">
                  Allocations: {resource.allocations.map(a => a.processId).join(', ') || 'None'}
                </div>
              </div>
            ))}
            {resources.length === 0 && (
              <div className="col-span-2 text-center py-8 text-text-secondary">
                No resources. Click "Add Resource" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        {processes.length > 0 && resources.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Quick Actions</h3>

            {/* Feedback banner */}
            {actionFeedback && (
              <div className={`mb-3 px-4 py-2 rounded-lg text-sm font-medium animate-fadeInDown ${
                actionFeedback.ok
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : actionFeedback.msg.includes('deadlock risk')
                  ? 'bg-orange-50 text-orange-700 border border-orange-300'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {actionFeedback.ok ? '✓ ' : actionFeedback.msg.includes('deadlock risk') ? '⚠ ' : '✗ '}{actionFeedback.msg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">Process</label>
                <select
                  className="input"
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                >
                  <option value="">Select process…</option>
                  {processes.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">Resource</label>
                <select
                  className="input"
                  value={selectedResource}
                  onChange={(e) => setSelectedResource(e.target.value)}
                >
                  <option value="">Select resource…</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.availableInstances}/{r.totalInstances} free)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRequest}
                disabled={!selectedProcess || !selectedResource}
                className="btn btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-4 h-4" />
                Request
              </button>
              <button
                onClick={handleAllocate}
                disabled={!selectedProcess || !selectedResource}
                className="btn btn-success text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Link className="w-4 h-4" />
                Allocate
              </button>
              <button
                onClick={handleRelease}
                disabled={!selectedProcess || !selectedResource}
                className="btn btn-danger text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Unlink className="w-4 h-4" />
                Release
              </button>
            </div>

            {/* Current selection summary */}
            {selectedProcess && selectedResource && (() => {
              const proc = processes.find(p => p.id === selectedProcess);
              const res  = resources.find(r => r.id === selectedResource);
              const holds   = proc?.allocatedResources.includes(selectedResource);
              const waiting = proc?.requestedResources.includes(selectedResource);
              return (
                <div className="mt-3 p-3 bg-background-secondary rounded-lg text-xs text-text-secondary space-y-1">
                  <p>
                    <span className="font-medium text-text-primary">{proc?.name}</span>
                    {holds   ? ' → currently holds ' : waiting ? ' → currently waiting for ' : ' → no relation with '}
                    <span className="font-medium text-text-primary">{res?.name}</span>
                  </p>
                  <p>Available instances: <span className="font-medium">{res?.availableInstances}</span></p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Right Column - Scenarios & Events */}
      <div className="space-y-6">
        {/* Predefined Scenarios */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            <Settings className="w-5 h-5 inline mr-2" />
            Load Scenario
          </h3>
          <div className="space-y-2">
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => handleLoadScenario(scenario.id)}
                className="w-full p-3 text-left bg-background-secondary hover:bg-gray-200 rounded-lg transition-colors"
              >
                <div className="font-medium text-sm text-text-primary">{scenario.name}</div>
                <div className="text-xs text-text-secondary mt-1">{scenario.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Event Log */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Event Log</h3>
          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
            {events.slice(0, 15).map((event) => (
              <div key={event.id} className="p-2 bg-background-secondary rounded text-xs">
                <span className="text-text-secondary">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
                <p className="text-text-primary mt-1">{event.description}</p>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-text-secondary py-4 text-sm">No events yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
