import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import { AlertTriangle, CheckCircle, Play, RotateCcw } from 'lucide-react';

/* ─── Layout helpers ─────────────────────────────────────────── */

function circlePositions(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function buildLayout(
  processes: any[],
  resources: any[],
  deadlockedIds: string[],
  cycleIds: string[],
): { processPositions: { x: number; y: number }[]; resourcePositions: { x: number; y: number }[] } {
  const isDeadlocked = deadlockedIds.length > 0;

  if (!isDeadlocked) {
    // Normal: two-column layout
    return {
      processPositions: processes.map((_, i) => ({ x: 120, y: 100 + i * 160 })),
      resourcePositions: resources.map((_, i) => ({ x: 500, y: 100 + i * 160 })),
    };
  }

  // Deadlock: arrange cycle members in a ring, others outside
  const cycleProcesses = processes.filter(p => cycleIds.includes(p.id));
  const cycleResources = resources.filter(r => cycleIds.includes(r.id));
  const nonCycleProcesses = processes.filter(p => !cycleIds.includes(p.id));
  const nonCycleResources = resources.filter(r => !cycleIds.includes(r.id));

  // interleave processes and resources around the ring for clarity
  const ringNodes: { id: string }[] = [];
  const maxLen = Math.max(cycleProcesses.length, cycleResources.length);
  for (let i = 0; i < maxLen; i++) {
    if (cycleProcesses[i]) ringNodes.push(cycleProcesses[i]);
    if (cycleResources[i]) ringNodes.push(cycleResources[i]);
  }

  const ringPositions = circlePositions(ringNodes.length, 370, 270, 210);

  const processPositions: { x: number; y: number }[] = [];
  const resourcePositions: { x: number; y: number }[] = [];

  processes.forEach(p => {
    const ri = ringNodes.findIndex(n => n.id === p.id);
    if (ri !== -1) {
      processPositions.push(ringPositions[ri]);
    } else {
      const ni = nonCycleProcesses.findIndex(np => np.id === p.id);
      processPositions.push({ x: 20, y: 80 + ni * 140 });
    }
  });

  resources.forEach(r => {
    const ri = ringNodes.findIndex(n => n.id === r.id);
    if (ri !== -1) {
      resourcePositions.push(ringPositions[ri]);
    } else {
      const ni = nonCycleResources.findIndex(nr => nr.id === r.id);
      resourcePositions.push({ x: 680, y: 80 + ni * 140 });
    }
  });

  return { processPositions, resourcePositions };
}

/* ─── Component ─────────────────────────────────────────────── */

export default function ResourceGraph() {
  const processes       = useSimulationStore(s => s.processes);
  const resources       = useSimulationStore(s => s.resources);
  const storeEdges      = useSimulationStore(s => s.edges);
  const detectionResult = useSimulationStore(s => s.detectionResult);
  const runDetection    = useSimulationStore(s => s.runDetection);
  const resetSimulation = useSimulationStore(s => s.resetSimulation);

  const isDeadlocked  = detectionResult?.isDeadlocked ?? false;
  const cycleIds      = detectionResult?.cycle ?? [];
  const deadlockedIds = detectionResult?.deadlockedProcesses ?? [];

  /* ── build nodes ── */
  const buildNodes = useCallback((): Node[] => {
    const { processPositions, resourcePositions } = buildLayout(
      processes, resources, deadlockedIds, cycleIds,
    );

    const processNodes: Node[] = processes.map((p, i) => {
      const inCycle    = cycleIds.includes(p.id);
      const deadlocked = deadlockedIds.includes(p.id);
      return {
        id: p.id,
        type: 'default',
        position: processPositions[i],
        data: {
          label: (
            <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
              <div style={{ fontSize: 10, color: deadlocked ? '#DC2626' : '#64748B' }}>
                {deadlocked ? '🔴 deadlocked' : p.status}
              </div>
            </div>
          ),
        },
        style: {
          background: deadlocked ? '#FEE2E2' : '#DBEAFE',
          border: deadlocked
            ? '3px solid #DC2626'
            : inCycle
            ? '2px solid #F97316'
            : '2px solid #2563EB',
          borderRadius: '50%',
          width: 90,
          height: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: deadlocked
            ? '0 0 0 5px rgba(220,38,38,0.2), 0 0 24px rgba(220,38,38,0.35)'
            : 'none',
        },
      };
    });

    const resourceNodes: Node[] = resources.map((r, i) => {
      const inCycle = cycleIds.includes(r.id);
      return {
        id: r.id,
        type: 'default',
        position: resourcePositions[i],
        data: {
          label: (
            <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 10, color: '#7C3AED' }}>
                {r.availableInstances}/{r.totalInstances} free
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3 }}>
                {Array.from({ length: r.totalInstances }).map((_, di) => (
                  <div
                    key={di}
                    style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background:
                        di < r.totalInstances - r.availableInstances ? '#7C3AED' : '#E9D5FF',
                      border: '1px solid #7C3AED',
                    }}
                  />
                ))}
              </div>
            </div>
          ),
        },
        style: {
          background: inCycle ? '#FDF4FF' : '#F3E8FF',
          border: inCycle ? '3px solid #DC2626' : '2px solid #7C3AED',
          borderRadius: '10px',
          width: 90,
          height: 90,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: inCycle
            ? '0 0 0 5px rgba(220,38,38,0.15), 0 0 20px rgba(220,38,38,0.25)'
            : 'none',
        },
      };
    });

    return [...processNodes, ...resourceNodes];
  }, [processes, resources, deadlockedIds, cycleIds]);

  /* ── build edges ── */
  const buildEdges = useCallback((): Edge[] => {
    return storeEdges.map(e => {
      const inCycle = cycleIds.includes(e.from) && cycleIds.includes(e.to);
      const color = inCycle ? '#DC2626' : e.type === 'request' ? '#F59E0B' : '#06B6D4';

      return {
        id: e.id,
        source: e.from,
        target: e.to,
        type: 'smoothstep',
        animated: inCycle || e.type === 'request',
        style: {
          stroke: color,
          strokeWidth: inCycle ? 4 : 2,
          strokeDasharray: !inCycle && e.type === 'request' ? '6 3' : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color,
          width: inCycle ? 24 : 18,
          height: inCycle ? 24 : 18,
        },
        label: inCycle ? '⚠' : e.type === 'request' ? 'REQ' : 'ALLOC',
        labelStyle: {
          fontSize: inCycle ? 14 : 9,
          fill: inCycle ? '#DC2626' : '#64748B',
          fontWeight: inCycle ? 700 : 400,
        },
        labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.85, rx: 4 },
      };
    });
  }, [storeEdges, cycleIds]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(buildEdges());

  useEffect(() => { setNodes(buildNodes()); },      [buildNodes, setNodes]);
  useEffect(() => { setFlowEdges(buildEdges()); },  [buildEdges, setFlowEdges]);

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="card animate-fadeInDown">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Resource Allocation Graph</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Load a scenario in the Simulator, then click <strong>Run Detection</strong> to highlight deadlock cycles
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => runDetection()} className="btn btn-primary">
              <Play className="w-4 h-4" />
              Run Detection
            </button>
            <button onClick={() => resetSimulation()} className="btn btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Counts */}
        <div className="flex gap-4 mt-3 text-sm text-text-secondary">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg">
            {processes.length} processes
          </span>
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg">
            {resources.length} resources
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg">
            {storeEdges.length} edges
          </span>
        </div>
      </div>

      {/* Status banner */}
      {detectionResult && (
        <div
          className={`card animate-fadeInDown ${
            isDeadlocked ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'
          }`}
        >
          <div className="flex items-center gap-4">
            {isDeadlocked ? (
              <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse flex-shrink-0" />
            ) : (
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-bold ${isDeadlocked ? 'text-red-700' : 'text-green-700'}`}>
                {isDeadlocked ? '🔴 DEADLOCK DETECTED' : '✅ System Safe — No Deadlock'}
              </h3>
              {isDeadlocked ? (
                <div className="mt-1 space-y-1">
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Deadlocked:</span> {deadlockedIds.join(', ')}
                  </p>
                  {cycleIds.length > 0 && (
                    <p className="text-sm font-mono bg-red-100 text-red-800 px-3 py-1 rounded-lg inline-block">
                      {cycleIds.join(' → ')} → {cycleIds[0]}
                    </p>
                  )}
                  <p className="text-xs text-red-500 mt-1">
                    Red glowing nodes and thick animated red edges show the circular wait cycle in the graph below.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-green-700">All processes can complete. System is in a safe state.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card py-3">
        <div className="flex flex-wrap items-center gap-5 text-xs text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-600" />
            <span>Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-100 border-2 border-violet-600" />
            <span>Resource</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-red-100 border-[3px] border-red-600"
              style={{ boxShadow: '0 0 8px rgba(220,38,38,0.5)' }} />
            <span>In deadlock cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-2 border-dashed border-yellow-500" />
            <span>Request edge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-2 border-cyan-500" />
            <span>Allocation edge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-4 border-red-600 rounded" />
            <span>Deadlock cycle edge</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {processes.length === 0 && resources.length === 0 && (
        <div className="card text-center py-20 animate-fadeIn">
          <div className="text-5xl mb-4">🔗</div>
          <p className="text-lg font-medium text-text-primary mb-2">No graph data yet</p>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Go to <strong>Live Simulator</strong>, load a scenario (e.g. "Simple Deadlock"),
            then come back here and click <strong>Run Detection</strong>.
          </p>
        </div>
      )}

      {/* React Flow canvas */}
      {(processes.length > 0 || resources.length > 0) && (
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            height: 620,
            border: isDeadlocked ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
            boxShadow: isDeadlocked
              ? '0 0 0 4px rgba(220,38,38,0.1), 0 4px 32px rgba(220,38,38,0.12)'
              : '0 1px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* subtle red pulse overlay when deadlocked */}
          {isDeadlocked && (
            <div
              className="absolute inset-0 pointer-events-none z-10 rounded-xl animate-pulse"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(220,38,38,0.06) 0%, transparent 65%)',
              }}
            />
          )}

          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            fitViewOptions={{ padding: 0.35 }}
            attributionPosition="bottom-left"
            minZoom={0.25}
            maxZoom={2.5}
          >
            <Background color={isDeadlocked ? '#FEE2E2' : '#F1F5F9'} gap={20} />
            <Controls />

            {/* Floating badge inside the canvas */}
            {isDeadlocked && (
              <Panel position="top-center">
                <div
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold animate-pulse"
                  style={{
                    background: '#DC2626',
                    color: '#fff',
                    boxShadow: '0 2px 16px rgba(220,38,38,0.55)',
                    marginTop: 10,
                  }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  DEADLOCK — Circular Wait Detected
                </div>
              </Panel>
            )}

            {!isDeadlocked && detectionResult && (
              <Panel position="top-center">
                <div
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{
                    background: '#16a34a',
                    color: '#fff',
                    boxShadow: '0 2px 10px rgba(22,163,74,0.4)',
                    marginTop: 10,
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  Safe State
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      )}

      {/* Detail cards below graph */}
      {(processes.length > 0 || resources.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card animate-fadeInUp">
            <h4 className="font-semibold text-text-primary mb-3">Processes</h4>
            <div className="space-y-2">
              {processes.map(p => {
                const dead = deadlockedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      dead ? 'bg-red-50 border border-red-200' : 'bg-background-secondary'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full"
                        style={{ background: dead ? '#DC2626' : '#2563EB' }} />
                      <span className="font-medium">{p.name}</span>
                      {dead && (
                        <span className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                          DEADLOCKED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-text-secondary flex gap-3">
                      <span>holds: <strong>{p.allocatedResources.join(', ') || '—'}</strong></span>
                      <span>wants: <strong>{p.requestedResources.join(', ') || '—'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <h4 className="font-semibold text-text-primary mb-3">Resources</h4>
            <div className="space-y-2">
              {resources.map(r => {
                const inCycle = cycleIds.includes(r.id);
                const pct = ((r.totalInstances - r.availableInstances) / r.totalInstances) * 100;
                return (
                  <div
                    key={r.id}
                    className={`px-3 py-2 rounded-lg text-sm transition-all ${
                      inCycle ? 'bg-red-50 border border-red-200' : 'bg-background-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded"
                          style={{ background: inCycle ? '#DC2626' : '#7C3AED' }} />
                        <span className="font-medium">{r.name}</span>
                        {inCycle && (
                          <span className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">
                            IN CYCLE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-text-secondary">
                        {r.totalInstances - r.availableInstances}/{r.totalInstances} allocated
                      </span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: inCycle ? '#DC2626' : '#7C3AED' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
