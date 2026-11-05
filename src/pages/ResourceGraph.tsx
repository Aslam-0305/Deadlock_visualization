import { useMemo, memo, useState } from 'react';
import ReactFlow, {
  Node, Edge, Controls, Background, MarkerType,
  Panel, NodeProps, Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import {
  AlertTriangle, CheckCircle, ShieldAlert, RotateCcw,
  Trash2, Zap, History, ChevronDown, ChevronUp, Info,
} from 'lucide-react';

/* ── Custom node types (module-level = stable refs) ─────────── */
const ProcessNode = memo(({ data }: NodeProps) => {
  const dead = data.deadlocked as boolean;
  const unsafe = data.unsafe as boolean;
  return (
    <>
      <Handle type="target" position={Position.Left}  style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{data.label}</div>
        <div style={{ fontSize: 10, color: dead ? '#DC2626' : unsafe ? '#D97706' : '#64748B' }}>
          {dead ? '🔴 deadlocked' : unsafe ? '⚠ blocked' : data.status}
        </div>
      </div>
    </>
  );
});

const ResourceNode = memo(({ data }: NodeProps) => {
  const inCycle = data.inCycle as boolean;
  const avail = data.available as number;
  const total = data.total as number;
  return (
    <>
      <Handle type="target" position={Position.Left}  style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      <div style={{ textAlign: 'center', lineHeight: 1.4 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{data.label}</div>
        <div style={{ fontSize: 10, color: inCycle ? '#DC2626' : '#7C3AED' }}>
          {avail}/{total} free
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3 }}>
          {Array.from({ length: Math.min(total, 6) }).map((_, di) => (
            <div key={di} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: di < (total - avail) ? '#7C3AED' : '#E9D5FF',
              border: '1px solid #7C3AED',
            }} />
          ))}
        </div>
      </div>
    </>
  );
});

const NODE_TYPES = { processNode: ProcessNode, resourceNode: ResourceNode };

/* ── Layout ─────────────────────────────────────────────────── */
function circlePos(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + r * Math.cos(a) - 45, y: cy + r * Math.sin(a) - 45 };
  });
}

/* ── System state badge ──────────────────────────────────────── */
function StateBadge({ state }: { state: string }) {
  if (state === 'deadlocked') return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm animate-pulse"
      style={{ background: '#DC2626', color: '#fff', boxShadow: '0 2px 14px rgba(220,38,38,0.45)' }}>
      <AlertTriangle className="w-4 h-4" /> DEADLOCK DETECTED
    </div>
  );
  if (state === 'unsafe') return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
      style={{ background: '#D97706', color: '#fff', boxShadow: '0 2px 10px rgba(217,119,6,0.4)' }}>
      <ShieldAlert className="w-4 h-4" /> UNSAFE STATE
    </div>
  );
  if (state === 'safe') return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm"
      style={{ background: '#16a34a', color: '#fff', boxShadow: '0 2px 10px rgba(22,163,74,0.35)' }}>
      <CheckCircle className="w-4 h-4" /> SAFE STATE
    </div>
  );
  return null;
}

/* ── Solutions panel ─────────────────────────────────────────── */
function SolutionsPanel({ deadlockedIds, cycleIds }: { deadlockedIds: string[]; cycleIds: string[] }) {
  const { terminateProcess, releaseResource, saveCheckpoint, processes, _autoDetect } =
    useSimulationStore();
  const [open, setOpen] = useState<string | null>('terminate');
  const [done, setDone] = useState<string[]>([]);

  const mark = (k: string) => setDone(p => [...p, k]);
  const isDone = (k: string) => done.includes(k);

  const deadProcs = processes.filter(p => deadlockedIds.includes(p.id));

  const handleTerminate = (pid: string) => {
    terminateProcess(pid);
    mark(`t-${pid}`);
    setTimeout(() => _autoDetect(), 120);
  };

  const handlePreempt = (pid: string, rid: string) => {
    releaseResource(pid, rid);
    mark(`p-${pid}-${rid}`);
    setTimeout(() => _autoDetect(), 120);
  };

  const handleCheckpoint = () => {
    saveCheckpoint(`Before recovery ${new Date().toLocaleTimeString()}`);
    mark('cp');
  };

  type Section = { id: string; title: string; subtitle: string; Icon: any; color: string; bg: string; border: string; content: JSX.Element };

  const sections: Section[] = [
    {
      id: 'terminate',
      title: 'Option 1 — Process Termination',
      subtitle: 'Terminate a deadlocked process to break the cycle immediately',
      Icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary mb-3">
            Terminating any one of these processes releases all its held resources,
            breaking the circular wait immediately.
          </p>
          {deadProcs.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-lg">
              <div>
                <span className="font-semibold text-sm">{p.name}</span>
                <span className="text-xs text-text-secondary ml-2">
                  holds: {p.allocatedResources.join(', ') || '—'}
                </span>
              </div>
              {isDone(`t-${p.id}`)
                ? <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Done</span>
                : <button onClick={() => handleTerminate(p.id)}
                    className="btn btn-sm bg-red-600 text-white hover:bg-red-700 text-xs">
                    <Trash2 className="w-3 h-3" /> Terminate {p.name}
                  </button>
              }
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'preempt',
      title: 'Option 2 — Resource Preemption',
      subtitle: 'Force-release a cycle resource from a deadlocked process',
      Icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
      content: (
        <div className="space-y-2">
          <p className="text-xs text-text-secondary mb-3">
            The process stays alive but its resource is preempted. It must re-request the resource later.
          </p>
          {deadProcs.flatMap(p =>
            p.allocatedResources
              .filter(rId => cycleIds.includes(rId))
              .map(rId => {
                const key = `p-${p.id}-${rId}`;
                return (
                  <div key={key} className="flex items-center justify-between p-3 bg-white border border-orange-100 rounded-lg">
                    <div>
                      <span className="font-semibold text-sm">{p.name}</span>
                      <span className="mx-1 text-xs text-text-secondary">releases</span>
                      <span className="font-semibold text-sm text-purple-700">{rId}</span>
                    </div>
                    {isDone(key)
                      ? <span className="text-xs text-green-600 font-semibold flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Done</span>
                      : <button onClick={() => handlePreempt(p.id, rId)}
                          className="btn btn-sm bg-orange-500 text-white hover:bg-orange-600 text-xs">
                          <Zap className="w-3 h-3" /> Preempt
                        </button>
                    }
                  </div>
                );
              })
          )}
          {deadProcs.every(p => p.allocatedResources.filter(r => cycleIds.includes(r)).length === 0) && (
            <p className="text-xs text-text-secondary italic">No cycle resources currently held by deadlocked processes.</p>
          )}
        </div>
      ),
    },
    {
      id: 'rollback',
      title: 'Option 3 — Checkpoint & Rollback',
      subtitle: 'Save a snapshot, then roll back to a previous safe state',
      Icon: History, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
      content: (
        <div className="space-y-3">
          <p className="text-xs text-text-secondary">
            Save the current state as a checkpoint, then go to the <strong>Recovery Center</strong> to
            roll back to a safe checkpoint.
          </p>
          <button onClick={handleCheckpoint} disabled={isDone('cp')}
            className="btn btn-primary btn-sm disabled:opacity-50">
            <History className="w-4 h-4" />
            {isDone('cp') ? '✓ Checkpoint Saved' : 'Save Checkpoint Now'}
          </button>
          <p className="text-xs text-text-secondary">
            Then visit <strong>Recovery Center → Rollback</strong> to restore.
          </p>
        </div>
      ),
    },
    {
      id: 'info',
      title: 'Why did this deadlock occur?',
      subtitle: 'Understand the circular wait and how to prevent it',
      Icon: Info, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200',
      content: (
        <div className="space-y-3 text-sm text-text-secondary">
          <div className="font-mono bg-gray-100 px-3 py-2 rounded-lg text-xs">
            {cycleIds.join(' → ')} → {cycleIds[0]}
          </div>
          <p>
            Each process holds a resource that the next one needs, forming a closed loop.
            None can proceed without the others releasing first.
          </p>
          <div>
            <p className="font-semibold text-text-primary mb-1">Prevention strategies:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><strong>Resource ordering</strong> — always request resources in a fixed order</li>
              <li><strong>Banker's algorithm</strong> — check safety before granting any request</li>
              <li><strong>Timeouts</strong> — release resources if waiting too long</li>
              <li><strong>Avoid hold-and-wait</strong> — request all resources at once upfront</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="card border-2 border-red-200 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">How to Resolve This Deadlock</h3>
          <p className="text-sm text-text-secondary">Choose a strategy below — actions apply instantly to the graph</p>
        </div>
      </div>
      <div className="space-y-2">
        {sections.map(s => {
          const isOpen = open === s.id;
          return (
            <div key={s.id} className={`rounded-xl border-2 overflow-hidden ${s.border} bg-white`}>
              <button
                onClick={() => setOpen(isOpen ? null : s.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`${s.bg} ${s.color} w-8 h-8 rounded-lg flex items-center justify-center`}>
                    <s.Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-text-primary">{s.title}</p>
                    <p className="text-xs text-text-secondary">{s.subtitle}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-text-secondary flex-shrink-0" />
                         : <ChevronDown className="w-4 h-4 text-text-secondary flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3">{s.content}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function ResourceGraph() {
  const processes       = useSimulationStore(s => s.processes);
  const resources       = useSimulationStore(s => s.resources);
  const storeEdges      = useSimulationStore(s => s.edges);
  const detectionResult = useSimulationStore(s => s.detectionResult);
  const systemState     = useSimulationStore(s => s.systemState);
  const resetSimulation = useSimulationStore(s => s.resetSimulation);

  const isDeadlocked  = detectionResult?.isDeadlocked ?? false;
  const cycleIds      = detectionResult?.cycle ?? [];
  const deadlockedIds = detectionResult?.deadlockedProcesses ?? [];

  /* ── nodes ── */
  const nodes: Node[] = useMemo(() => {
    const deadSet    = new Set(deadlockedIds);
    const cycleSet   = new Set(cycleIds);
    const blockedSet = new Set(processes.filter(p => p.status === 'blocked' && !deadSet.has(p.id)).map(p => p.id));

    let pp: { x: number; y: number }[];
    let rp: { x: number; y: number }[];

    if (!isDeadlocked) {
      pp = processes.map((_, i) => ({ x: 100, y: 60 + i * 170 }));
      rp = resources.map((_, i) => ({ x: 480, y: 60 + i * 170 }));
    } else {
      const cProcs = processes.filter(p => cycleSet.has(p.id));
      const cRes   = resources.filter(r => cycleSet.has(r.id));
      const ring: string[] = [];
      const ml = Math.max(cProcs.length, cRes.length);
      for (let i = 0; i < ml; i++) {
        if (cProcs[i]) ring.push(cProcs[i].id);
        if (cRes[i])   ring.push(cRes[i].id);
      }
      const ringPos = circlePos(ring.length, 370, 270, 210);
      const ringMap: Record<string, { x: number; y: number }> = {};
      ring.forEach((id, i) => { ringMap[id] = ringPos[i]; });

      const ncP = processes.filter(p => !cycleSet.has(p.id));
      const ncR = resources.filter(r => !cycleSet.has(r.id));
      pp = processes.map(p => ringMap[p.id] ?? { x: 20, y: 60 + ncP.findIndex(n => n.id === p.id) * 150 });
      rp = resources.map(r => ringMap[r.id] ?? { x: 700, y: 60 + ncR.findIndex(n => n.id === r.id) * 150 });
    }

    const pNodes: Node[] = processes.map((p, i) => {
      const dead  = deadSet.has(p.id);
      const inCyc = cycleSet.has(p.id);
      const blk   = blockedSet.has(p.id);
      return {
        id: p.id, type: 'processNode', position: pp[i],
        data: { label: p.name, status: p.status, deadlocked: dead, unsafe: blk },
        style: {
          background: dead ? '#FEE2E2' : blk ? '#FEF9C3' : '#DBEAFE',
          border: dead ? '3px solid #DC2626' : blk ? '2px solid #D97706' : inCyc ? '2px solid #F97316' : '2px solid #2563EB',
          borderRadius: '50%', width: 90, height: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: dead ? '0 0 0 5px rgba(220,38,38,0.2),0 0 20px rgba(220,38,38,0.3)'
                   : blk  ? '0 0 0 3px rgba(217,119,6,0.2)' : 'none',
        },
      };
    });

    const rNodes: Node[] = resources.map((r, i) => {
      const inCyc = cycleSet.has(r.id);
      return {
        id: r.id, type: 'resourceNode', position: rp[i],
        data: { label: r.name, available: r.availableInstances, total: r.totalInstances, inCycle: inCyc },
        style: {
          background: inCyc ? '#FDF4FF' : '#F3E8FF',
          border: inCyc ? '3px solid #DC2626' : '2px solid #7C3AED',
          borderRadius: 10, width: 90, height: 90,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: inCyc ? '0 0 0 5px rgba(220,38,38,0.15),0 0 16px rgba(220,38,38,0.25)' : 'none',
        },
      };
    });

    return [...pNodes, ...rNodes];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(processes.map(p => ({ id: p.id, name: p.name, status: p.status, a: p.allocatedResources, r: p.requestedResources }))),
    JSON.stringify(resources.map(r => ({ id: r.id, name: r.name, av: r.availableInstances, t: r.totalInstances }))),
    JSON.stringify(cycleIds), JSON.stringify(deadlockedIds),
  ]);

  /* ── edges ── */
  const edges: Edge[] = useMemo(() => {
    const cs = new Set(cycleIds);
    return storeEdges.map(e => {
      const inC  = cs.has(e.from) && cs.has(e.to);
      const col  = inC ? '#DC2626' : e.type === 'request' ? '#F59E0B' : '#06B6D4';
      return {
        id: e.id, source: e.from, target: e.to, type: 'smoothstep',
        animated: inC || e.type === 'request',
        style: { stroke: col, strokeWidth: inC ? 4 : 2, strokeDasharray: !inC && e.type === 'request' ? '6 3' : undefined },
        markerEnd: { type: MarkerType.ArrowClosed, color: col, width: inC ? 22 : 16, height: inC ? 22 : 16 },
        label: inC ? '⚠' : e.type === 'request' ? 'REQ' : 'ALLOC',
        labelStyle: { fontSize: inC ? 13 : 9, fill: col, fontWeight: inC ? 700 : 400 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.85, rx: 4 },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(storeEdges), JSON.stringify(cycleIds)]);

  const hasNodes = processes.length > 0 || resources.length > 0;
  const displayState = isDeadlocked ? 'deadlocked'
    : systemState === 'unsafe' ? 'unsafe'
    : hasNodes && detectionResult ? 'safe' : 'unknown';

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="card animate-fadeInDown">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Resource Allocation Graph</h2>
            <p className="text-sm text-text-secondary mt-0.5">
              Detection runs automatically — graph updates in real time
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasNodes && <StateBadge state={displayState} />}
            <button onClick={() => resetSimulation()} className="btn btn-secondary">
              <RotateCcw className="w-4 h-4" /> Reset
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
        <div className={`card animate-fadeInDown ${
          isDeadlocked ? 'bg-red-50 border-2 border-red-300'
          : systemState === 'unsafe' ? 'bg-yellow-50 border-2 border-yellow-300'
          : 'bg-green-50 border-2 border-green-300'
        }`}>
          <div className="flex items-center gap-4">
            {isDeadlocked
              ? <AlertTriangle className="w-9 h-9 text-red-600 animate-pulse flex-shrink-0" />
              : systemState === 'unsafe'
              ? <ShieldAlert className="w-9 h-9 text-yellow-600 flex-shrink-0" />
              : <CheckCircle className="w-9 h-9 text-green-600 flex-shrink-0" />
            }
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${
                isDeadlocked ? 'text-red-700' : systemState === 'unsafe' ? 'text-yellow-700' : 'text-green-700'
              }`}>
                {isDeadlocked ? '🔴 DEADLOCK DETECTED — System Halted'
                  : systemState === 'unsafe' ? '⚠ UNSAFE STATE — Potential Deadlock Risk'
                  : '✅ SAFE STATE — All Processes Can Complete'}
              </h3>
              {isDeadlocked ? (
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-red-700">
                    <strong>Deadlocked processes:</strong> {deadlockedIds.join(', ')}
                  </p>
                  {cycleIds.length > 0 && (
                    <code className="block text-sm bg-red-100 text-red-900 px-3 py-1 rounded-lg mt-1 inline-block">
                      Cycle: {cycleIds.join(' → ')} → {cycleIds[0]}
                    </code>
                  )}
                  <p className="text-xs text-red-500 mt-1">
                    Red glowing nodes + thick animated edges show the circular wait. See <strong>Solutions</strong> below.
                  </p>
                </div>
              ) : systemState === 'unsafe' ? (
                <p className="text-sm text-yellow-700 mt-1">
                  Some processes are blocked. No circular wait yet, but requesting more resources could cause deadlock.
                </p>
              ) : (
                <p className="text-sm text-green-700 mt-1">
                  No circular wait. {processes.filter(p => p.status === 'blocked').length === 0
                    ? 'All processes running normally.'
                    : `${processes.filter(p => p.status === 'blocked').length} process(es) waiting — resources will be available.`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="card py-3">
        <div className="flex flex-wrap items-center gap-5 text-xs text-text-secondary">
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-600" /><span>Running</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-yellow-50 border-2 border-yellow-500" /><span>Blocked</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-600" style={{ boxShadow: '0 0 8px rgba(220,38,38,0.4)' }} /><span>Deadlocked</span></div>
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-purple-100 border-2 border-violet-600" /><span>Resource</span></div>
          <div className="flex items-center gap-2"><div className="w-10 border-t-2 border-dashed border-yellow-500" /><span>Request</span></div>
          <div className="flex items-center gap-2"><div className="w-10 border-t-2 border-cyan-500" /><span>Allocation</span></div>
          <div className="flex items-center gap-2"><div className="w-10 border-t-4 border-red-600 rounded" /><span>Cycle ⚠</span></div>
        </div>
      </div>

      {/* Empty state */}
      {!hasNodes && (
        <div className="card text-center py-20 animate-fadeIn">
          <div className="text-5xl mb-4">🔗</div>
          <p className="text-lg font-medium text-text-primary mb-2">No graph data yet</p>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            Go to <strong>Live Simulator</strong>, load a scenario like "Simple Deadlock",
            then come back — detection runs automatically.
          </p>
        </div>
      )}

      {/* Graph canvas */}
      {hasNodes && (
        <div className="rounded-xl overflow-hidden relative"
          style={{
            height: 580,
            border: isDeadlocked ? '2px solid #FCA5A5' : '1px solid #E2E8F0',
            boxShadow: isDeadlocked
              ? '0 0 0 4px rgba(220,38,38,0.08),0 4px 24px rgba(220,38,38,0.1)'
              : '0 1px 8px rgba(0,0,0,0.05)',
          }}
        >
          {isDeadlocked && (
            <div className="absolute inset-0 pointer-events-none z-10 rounded-xl" style={{
              background: 'radial-gradient(ellipse at center, rgba(220,38,38,0.05) 0%, transparent 65%)',
              animation: 'pulse 2.5s ease-in-out infinite',
            }} />
          )}

          <ReactFlow
            nodes={nodes} edges={edges} nodeTypes={NODE_TYPES}
            fitView fitViewOptions={{ padding: 0.3 }}
            attributionPosition="bottom-left"
            minZoom={0.2} maxZoom={2.5}
            nodesDraggable nodesConnectable={false} elementsSelectable
          >
            <Background color={isDeadlocked ? '#FEE2E2' : '#F1F5F9'} gap={24} />
            <Controls />

            {isDeadlocked && (
              <Panel position="top-center">
                <div className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                  style={{ background: '#DC2626', color: '#fff', boxShadow: '0 2px 16px rgba(220,38,38,0.5)', marginTop: 10, animation: 'pulse 2s ease-in-out infinite' }}>
                  <AlertTriangle className="w-4 h-4" /> DEADLOCK — Circular Wait
                </div>
              </Panel>
            )}
            {!isDeadlocked && detectionResult && (
              <Panel position="top-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: systemState === 'unsafe' ? '#D97706' : '#16a34a', color: '#fff', boxShadow: '0 2px 10px rgba(22,163,74,0.35)', marginTop: 10 }}>
                  {systemState === 'unsafe' ? <ShieldAlert className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {systemState === 'unsafe' ? 'Unsafe State' : 'Safe State'}
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      )}

      {/* Solutions panel — only when deadlocked */}
      {isDeadlocked && cycleIds.length > 0 && (
        <SolutionsPanel deadlockedIds={deadlockedIds} cycleIds={cycleIds} />
      )}

      {/* Process & Resource detail rows */}
      {hasNodes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card animate-fadeInUp">
            <h4 className="font-semibold text-text-primary mb-3">Processes</h4>
            <div className="space-y-2">
              {processes.map(p => {
                const dead = deadlockedIds.includes(p.id);
                return (
                  <div key={p.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${dead ? 'bg-red-50 border border-red-200' : 'bg-background-secondary'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: dead ? '#DC2626' : '#2563EB' }} />
                      <span className="font-medium">{p.name}</span>
                      {dead && <span className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">DEADLOCKED</span>}
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
                const pct   = r.totalInstances > 0 ? ((r.totalInstances - r.availableInstances) / r.totalInstances) * 100 : 0;
                return (
                  <div key={r.id}
                    className={`px-3 py-2 rounded-lg text-sm ${inCyc ? 'bg-red-50 border border-red-200' : 'bg-background-secondary'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ background: inCyc ? '#DC2626' : '#7C3AED' }} />
                        <span className="font-medium">{r.name}</span>
                        {inCyc && <span className="text-xs text-red-600 font-bold bg-red-100 px-1.5 py-0.5 rounded">IN CYCLE</span>}
                      </div>
                      <span className="text-xs text-text-secondary">{r.totalInstances - r.availableInstances}/{r.totalInstances} allocated</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: inCyc ? '#DC2626' : '#7C3AED' }} />
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
