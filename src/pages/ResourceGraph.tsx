import { useMemo, memo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MarkerType,
  Panel,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import { AlertTriangle, CheckCircle, Play, RotateCcw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   Custom node types  (defined outside component → stable refs)
───────────────────────────────────────────────────────────── */

const ProcessNode = memo(({ data }: NodeProps) => {
  const dead = data.deadlocked as boolean;
  const name = data.label as string;
  const status = data.status as string;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
        <div style={{ fontSize: 10, color: dead ? '#DC2626' : '#64748B' }}>
          {dead ? '🔴 locked' : status}
        </div>
      </div>
    </>
  );
});

const ResourceNode = memo(({ data }: NodeProps) => {
  const inCycle = data.inCycle as boolean;
  const name = data.label as string;
  const avail = data.available as number;
  const total = data.total as number;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
        <div style={{ fontSize: 10, color: inCycle ? '#DC2626' : '#7C3AED' }}>
          {avail}/{total} free
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3 }}>
          {Array.from({ length: Math.min(total, 6) }).map((_, di) => (
            <div
              key={di}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: di < (total - avail) ? '#7C3AED' : '#E9D5FF',
                border: '1px solid #7C3AED',
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
});

// Stable reference — defined outside component
const NODE_TYPES = { processNode: ProcessNode, resourceNode: ResourceNode };

/* ─────────────────────────────────────────────────────────────
   Layout helper
───────────────────────────────────────────────────────────── */
function circlePos(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + r * Math.cos(a) - 45, y: cy + r * Math.sin(a) - 45 };
  });
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
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

  /* ── nodes — recompute only when relevant data changes ── */
  const nodes: Node[] = useMemo(() => {
    const deadSet  = new Set(deadlockedIds);
    const cycleSet = new Set(cycleIds);
    const hasDeadlock = deadSet.size > 0;

    // ── positions ──
    let processPositions: { x: number; y: number }[];
    let resourcePositions: { x: number; y: number }[];

    if (!hasDeadlock) {
      processPositions = processes.map((_, i) => ({ x: 100, y: 60 + i * 170 }));
      resourcePositions = resources.map((_, i) => ({ x: 480, y: 60 + i * 170 }));
    } else {
      // Build interleaved ring from cycle members
      const cycleProcs = processes.filter(p => cycleSet.has(p.id));
      const cycleRes   = resources.filter(r => cycleSet.has(r.id));
      const ring: string[] = [];
      const maxLen = Math.max(cycleProcs.length, cycleRes.length);
      for (let i = 0; i < maxLen; i++) {
        if (cycleProcs[i]) ring.push(cycleProcs[i].id);
        if (cycleRes[i])   ring.push(cycleRes[i].id);
      }
      const rp = circlePos(ring.length, 370, 270, 210);
      const ringMap: Record<string, { x: number; y: number }> = {};
      ring.forEach((id, i) => { ringMap[id] = rp[i]; });

      const nonCycleProcs = processes.filter(p => !cycleSet.has(p.id));
      const nonCycleRes   = resources.filter(r => !cycleSet.has(r.id));
      processPositions  = processes.map(p =>
        ringMap[p.id] ?? { x: 20, y: 60 + nonCycleProcs.findIndex(n => n.id === p.id) * 150 }
      );
      resourcePositions = resources.map(r =>
        ringMap[r.id] ?? { x: 700, y: 60 + nonCycleRes.findIndex(n => n.id === r.id) * 150 }
      );
    }

    const pNodes: Node[] = processes.map((p, i) => {
      const dead   = deadSet.has(p.id);
      const inCyc  = cycleSet.has(p.id);
      return {
        id: p.id,
        type: 'processNode',
        position: processPositions[i],
        data: { label: p.name, status: p.status, deadlocked: dead },
        style: {
          background: dead ? '#FEE2E2' : '#DBEAFE',
          border: dead ? '3px solid #DC2626' : inCyc ? '2px solid #F97316' : '2px solid #2563EB',
          borderRadius: '50%',
          width: 90, height: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: dead
            ? '0 0 0 5px rgba(220,38,38,0.2),0 0 20px rgba(220,38,38,0.3)'
            : 'none',
        },
      };
    });

    const rNodes: Node[] = resources.map((r, i) => {
      const inCyc = cycleSet.has(r.id);
      return {
        id: r.id,
        type: 'resourceNode',
        position: resourcePositions[i],
        data: { label: r.name, available: r.availableInstances, total: r.totalInstances, inCycle: inCyc },
        style: {
          background: inCyc ? '#FDF4FF' : '#F3E8FF',
          border: inCyc ? '3px solid #DC2626' : '2px solid #7C3AED',
          borderRadius: 10,
          width: 90, height: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: inCyc
            ? '0 0 0 5px rgba(220,38,38,0.15),0 0 16px rgba(220,38,38,0.25)'
            : 'none',
        },
      };
    });

    return [...pNodes, ...rNodes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // stringify to avoid reference churn on the arrays from the store
    JSON.stringify(processes.map(p => ({ id: p.id, name: p.name, status: p.status,
      alloc: p.allocatedResources, req: p.requestedResources }))),
    JSON.stringify(resources.map(r => ({ id: r.id, name: r.name,
      avail: r.availableInstances, total: r.totalInstances }))),
    JSON.stringify(cycleIds),
    JSON.stringify(deadlockedIds),
  ]);

  /* ── edges ── */
  const edges: Edge[] = useMemo(() => {
    const cycleSet = new Set(cycleIds);
    return storeEdges.map(e => {
      const inCycle = cycleSet.has(e.from) && cycleSet.has(e.to);
      const color   = inCycle ? '#DC2626' : e.type === 'request' ? '#F59E0B' : '#06B6D4';
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
          width: inCycle ? 22 : 16,
          height: inCycle ? 22 : 16,
        },
        label: inCycle ? '⚠' : e.type === 'request' ? 'REQ' : 'ALLOC',
        labelStyle: { fontSize: inCycle ? 13 : 9, fill: color, fontWeight: inCycle ? 700 : 400 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.85, rx: 4 },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(storeEdges), JSON.stringify(cycleIds)]);

  const hasNodes = processes.length > 0 || resources.length > 0;

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
        <div className="flex gap-3 mt-3">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-lg text-sm">{processes.length} processes</span>
          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-lg text-sm">{resources.length} resources</span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-lg text-sm">{storeEdges.length} edges</span>
        </div>
      </div>

      {/* Status banner */}
      {detectionResult && (
        <div className={`card animate-fadeInDown ${isDeadlocked ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
          <div className="flex items-center gap-4">
            {isDeadlocked
              ? <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse flex-shrink-0" />
              : <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            }
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
                  <p className="text-xs text-red-500">
                    Red glowing nodes + thick animated edges highlight the circular wait in the graph below.
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
            <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-600"
              style={{ boxShadow: '0 0 8px rgba(220,38,38,0.5)' }} />
            <span>In deadlock cycle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-2 border-dashed border-yellow-500" />
            <span>Request (REQ)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-2 border-cyan-500" />
            <span>Allocation (ALLOC)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 border-t-4 border-red-600 rounded" />
            <span>Cycle edge ⚠</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!hasNodes && (
        <div className="card text-center py-20 animate-fadeIn">
          <div className="text-5xl mb-4">🔗</div>
          <p className="text-lg font-medium text-text-primary mb-2">No graph data yet</p>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Go to <strong>Live Simulator</strong>, load a scenario such as "Simple Deadlock",
            then return here and click <strong>Run Detection</strong>.
          </p>
        </div>
      )}

      {/* Graph canvas */}
      {hasNodes && (
        <div
          className="rounded-xl overflow-hidden relative"
          style={{
            height: 600,
            border: isDeadlocked ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
            boxShadow: isDeadlocked
              ? '0 0 0 4px rgba(220,38,38,0.08), 0 4px 24px rgba(220,38,38,0.1)'
              : '0 1px 8px rgba(0,0,0,0.05)',
          }}
        >
          {isDeadlocked && (
            <div
              className="absolute inset-0 pointer-events-none z-10 rounded-xl"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.05) 0%, transparent 65%)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}
            />
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={NODE_TYPES}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            attributionPosition="bottom-left"
            minZoom={0.2}
            maxZoom={2.5}
            // Disable interactive editing — graph is read-only display
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={true}
          >
            <Background color={isDeadlocked ? '#FEE2E2' : '#F1F5F9'} gap={24} />
            <Controls />

            {isDeadlocked && (
              <Panel position="top-center">
                <div
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                  style={{
                    background: '#DC2626', color: '#fff',
                    boxShadow: '0 2px 16px rgba(220,38,38,0.5)',
                    marginTop: 10,
                    animation: 'pulse 2s ease-in-out infinite',
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
                    background: '#16a34a', color: '#fff',
                    boxShadow: '0 2px 10px rgba(22,163,74,0.35)',
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

      {/* Detail rows */}
      {hasNodes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card animate-fadeInUp">
            <h4 className="font-semibold text-text-primary mb-3">Processes</h4>
            <div className="space-y-2">
              {processes.map(p => {
                const dead = deadlockedIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
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

          <div className="card animate-fadeInUp" style={{ animationDelay: '80ms' }}>
            <h4 className="font-semibold text-text-primary mb-3">Resources</h4>
            <div className="space-y-2">
              {resources.map(r => {
                const inCyc = cycleIds.includes(r.id);
                const pct   = r.totalInstances > 0
                  ? ((r.totalInstances - r.availableInstances) / r.totalInstances) * 100
                  : 0;
                return (
                  <div
                    key={r.id}
                    className={`px-3 py-2 rounded-lg text-sm ${
                      inCyc ? 'bg-red-50 border border-red-200' : 'bg-background-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded"
                          style={{ background: inCyc ? '#DC2626' : '#7C3AED' }} />
                        <span className="font-medium">{r.name}</span>
                        {inCyc && (
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
                        style={{ width: `${pct}%`, background: inCyc ? '#DC2626' : '#7C3AED' }}
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
