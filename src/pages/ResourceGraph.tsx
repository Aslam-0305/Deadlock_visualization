import { useMemo, memo } from 'react';
import ReactFlow, {
  Node, Edge, Controls, Background, BackgroundVariant,
  MarkerType, NodeProps, Handle, Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import { RefreshCw, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

/* ─── Custom nodes (module-level refs = no React Flow re-mount) ─── */

const ProcessNode = memo(({ data }: NodeProps) => {
  const dead    = data.deadlocked as boolean;
  const blocked = data.blocked    as boolean;
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0 }} />
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: dead ? '#FEE2E2' : blocked ? '#FEF9C3' : '#DBEAFE',
        border: `3px solid ${dead ? '#DC2626' : blocked ? '#D97706' : '#2563EB'}`,
        boxShadow: dead
          ? '0 0 0 4px rgba(220,38,38,0.2), 0 0 16px rgba(220,38,38,0.3)'
          : 'none',
        cursor: 'default',
      }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: dead ? '#991B1B' : blocked ? '#92400E' : '#1E3A8A' }}>
          {data.label}
        </span>
        <span style={{ fontSize: 10, marginTop: 2, color: dead ? '#DC2626' : blocked ? '#D97706' : '#64748B' }}>
          {dead ? '🔴 locked' : blocked ? '⏳ blocked' : data.status}
        </span>
      </div>
    </>
  );
});

const ResourceNode = memo(({ data }: NodeProps) => {
  const inCycle = data.inCycle as boolean;
  const avail   = data.available as number;
  const total   = data.total    as number;
  return (
    <>
      <Handle type="target" position={Position.Top}    style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left}   style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0 }} />
      <div style={{
        width: 80, height: 80, borderRadius: 12,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: inCycle ? '#FDF4FF' : '#F3E8FF',
        border: `3px solid ${inCycle ? '#DC2626' : '#7C3AED'}`,
        boxShadow: inCycle
          ? '0 0 0 4px rgba(220,38,38,0.2), 0 0 16px rgba(220,38,38,0.3)'
          : 'none',
        cursor: 'default',
      }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: inCycle ? '#991B1B' : '#5B21B6' }}>
          {data.label}
        </span>
        <span style={{ fontSize: 10, marginTop: 2, color: inCycle ? '#DC2626' : '#7C3AED' }}>
          {avail}/{total} free
        </span>
        {/* instance dots */}
        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
          {Array.from({ length: Math.min(total, 5) }).map((_, i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: '50%',
              background: i < total - avail ? '#7C3AED' : '#DDD8FE',
              border: '1px solid #7C3AED',
            }} />
          ))}
        </div>
      </div>
    </>
  );
});

const NODE_TYPES = { processNode: ProcessNode, resourceNode: ResourceNode };

/* ─── Ring layout for cycle ─── */
function ringPositions(count: number, cx: number, cy: number, r: number) {
  return Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count - Math.PI / 2;
    return { x: cx + r * Math.cos(a) - 40, y: cy + r * Math.sin(a) - 40 };
  });
}

/* ─── Main component ─── */
export default function ResourceGraph() {
  const processes        = useSimulationStore(s => s.processes);
  const resources        = useSimulationStore(s => s.resources);
  const storeEdges       = useSimulationStore(s => s.edges);
  const detectionResult  = useSimulationStore(s => s.detectionResult);
  const systemState      = useSimulationStore(s => s.systemState);
  const events           = useSimulationStore(s => s.events);
  const resetSimulation  = useSimulationStore(s => s.resetSimulation);
  const terminateProcess = useSimulationStore(s => s.terminateProcess);
  const releaseResource  = useSimulationStore(s => s.releaseResource);
  const saveCheckpoint   = useSimulationStore(s => s.saveCheckpoint);
  const _autoDetect      = useSimulationStore(s => s._autoDetect);

  const isDeadlocked  = detectionResult?.isDeadlocked ?? false;
  const cycleIds      = detectionResult?.cycle ?? [];
  const deadlockedIds = detectionResult?.deadlockedProcesses ?? [];
  const hasNodes      = processes.length > 0 || resources.length > 0;

  /* ── build nodes ── */
  const nodes: Node[] = useMemo(() => {
    const deadSet    = new Set(deadlockedIds);
    const cycleSet   = new Set(cycleIds);
    const blockedSet = new Set(
      processes.filter(p => p.status === 'blocked' && !deadSet.has(p.id)).map(p => p.id)
    );

    let pp: { x: number; y: number }[];
    let rp: { x: number; y: number }[];

    if (isDeadlocked && cycleIds.length >= 2) {
      // interleave cycle members into a ring
      const cP = processes.filter(p => cycleSet.has(p.id));
      const cR = resources.filter(r => cycleSet.has(r.id));
      const ring: string[] = [];
      for (let i = 0; i < Math.max(cP.length, cR.length); i++) {
        if (cP[i]) ring.push(cP[i].id);
        if (cR[i]) ring.push(cR[i].id);
      }
      const rPos = ringPositions(ring.length, 320, 240, 170);
      const map: Record<string, { x: number; y: number }> = {};
      ring.forEach((id, i) => { map[id] = rPos[i]; });

      const ncP = processes.filter(p => !cycleSet.has(p.id));
      const ncR = resources.filter(r => !cycleSet.has(r.id));
      pp = processes.map(p => map[p.id] ?? { x: 40,  y: 60 + ncP.findIndex(x => x.id === p.id) * 140 });
      rp = resources.map(r => map[r.id] ?? { x: 600, y: 60 + ncR.findIndex(x => x.id === r.id) * 140 });
    } else {
      pp = processes.map((_, i) => ({ x: 100, y: 60 + i * 150 }));
      rp = resources.map((_, i) => ({ x: 480, y: 60 + i * 150 }));
    }

    return [
      ...processes.map((p, i) => ({
        id: p.id,
        type: 'processNode',
        position: pp[i],
        data: { label: p.name, status: p.status, deadlocked: deadSet.has(p.id), blocked: blockedSet.has(p.id) },
        style: { background: 'transparent', border: 'none', width: 80, height: 80, padding: 0 },
      })),
      ...resources.map((r, i) => ({
        id: r.id,
        type: 'resourceNode',
        position: rp[i],
        data: { label: r.name, available: r.availableInstances, total: r.totalInstances, inCycle: cycleSet.has(r.id) },
        style: { background: 'transparent', border: 'none', width: 80, height: 80, padding: 0 },
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(processes.map(p => ({ id: p.id, name: p.name, st: p.status, a: p.allocatedResources, r: p.requestedResources }))),
    JSON.stringify(resources.map(r => ({ id: r.id, name: r.name, av: r.availableInstances, t: r.totalInstances }))),
    JSON.stringify(cycleIds),
    JSON.stringify(deadlockedIds),
  ]);

  /* ── build edges ── */
  const edges: Edge[] = useMemo(() => {
    const cs = new Set(cycleIds);
    return storeEdges.map(e => {
      const inCycle = cs.has(e.from) && cs.has(e.to);
      const isReq   = e.type === 'request';
      const color   = inCycle ? '#DC2626' : isReq ? '#F59E0B' : '#2563EB';
      return {
        id: e.id,
        source: e.from,
        target: e.to,
        type: 'smoothstep',
        animated: inCycle,
        style: {
          stroke: color,
          strokeWidth: inCycle ? 3 : 2,
          strokeDasharray: isReq && !inCycle ? '6 3' : undefined,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 18, height: 18 },
        label: inCycle ? '⚠' : isReq ? 'REQ' : 'ALLOC',
        labelStyle: { fontSize: inCycle ? 12 : 9, fill: color, fontWeight: inCycle ? 700 : 400 },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.9, rx: 4 },
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(storeEdges), JSON.stringify(cycleIds)]);

  /* ── recovery actions ── */
  const recoveryActions: { label: string; action: () => void }[] = [];
  if (isDeadlocked) {
    deadlockedIds.slice(0, 2).forEach(pid => {
      recoveryActions.push({
        label: `Terminate ${pid}`,
        action: () => { terminateProcess(pid); setTimeout(_autoDetect, 100); },
      });
    });
    processes
      .filter(p => deadlockedIds.includes(p.id))
      .forEach(p =>
        p.allocatedResources
          .filter(r => cycleIds.includes(r))
          .slice(0, 1)
          .forEach(rid => {
            recoveryActions.push({
              label: `Preempt ${rid}`,
              action: () => { releaseResource(p.id, rid); setTimeout(_autoDetect, 100); },
            });
          })
      );
    recoveryActions.push({
      label: 'Release held resources',
      action: () => {
        deadlockedIds.forEach(pid => {
          const p = processes.find(x => x.id === pid);
          p?.allocatedResources.forEach(rid => releaseResource(pid, rid));
        });
        setTimeout(_autoDetect, 100);
      },
    });
    recoveryActions.push({
      label: 'Rollback blocked process',
      action: () => saveCheckpoint(`Rollback ${new Date().toLocaleTimeString()}`),
    });
  }

  const liveLogs = events.slice(0, 6);

  /* ── sidebar colours ── */
  const statusBg     = isDeadlocked ? '#FEF2F2' : systemState === 'unsafe' ? '#FFFBEB' : '#F0FDF4';
  const statusBorder = isDeadlocked ? '#FCA5A5' : systemState === 'unsafe' ? '#FDE68A' : '#BBF7D0';
  const statusColor  = isDeadlocked ? '#DC2626' : systemState === 'unsafe' ? '#D97706' : '#16A34A';
  const statusLabel  = isDeadlocked ? 'DEADLOCK DETECTED'
    : systemState === 'unsafe'      ? 'UNSAFE STATE'
    : hasNodes                      ? 'SAFE STATE'
    : 'NO DATA';
  const StatusIcon   = isDeadlocked ? AlertTriangle
    : systemState === 'unsafe'      ? ShieldAlert
    : CheckCircle;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', minHeight: 500, borderRadius: 16, overflow: 'hidden', border: '1px solid #E2E8F0', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

      {/* ── Graph canvas ── */}
      <div style={{ flex: 1, background: '#F8FAFC', position: 'relative' }}>
        {!hasNodes && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: '#94A3B8',
          }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🔗</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#64748B' }}>No graph data yet</p>
            <p style={{ fontSize: 13, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>
              Go to <strong>Live Simulator</strong>, load a scenario,
              then return here to see the graph.
            </p>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          attributionPosition="bottom-left"
          minZoom={0.2}
          maxZoom={3}
          nodesDraggable
          nodesConnectable={false}
          style={{ background: 'transparent' }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color="#CBD5E1"
            gap={24}
            size={1.5}
          />
          <Controls />
        </ReactFlow>
      </div>

      {/* ── Right sidebar ── */}
      <div style={{
        width: 250,
        background: '#fff',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}>

        {/* Header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Analytics</p>
              <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Live system state</p>
            </div>
            <button
              onClick={() => resetSimulation()}
              title="Reset simulation"
              style={{
                background: '#F1F5F9', border: '1px solid #E2E8F0',
                borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                color: '#64748B', display: 'flex', alignItems: 'center',
              }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* System Status */}
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: 1, marginBottom: 8 }}>
            SYSTEM STATUS
          </p>
          <div style={{
            background: statusBg,
            border: `1.5px solid ${statusBorder}`,
            borderRadius: 10, padding: '10px 12px',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <StatusIcon size={18} color={statusColor} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: statusColor, letterSpacing: 0.3 }}>
                {statusLabel}
              </p>
              {isDeadlocked && cycleIds.length > 0 && (
                <p style={{ fontFamily: 'monospace', fontSize: 10, color: '#DC2626', marginTop: 4, wordBreak: 'break-all' }}>
                  {cycleIds.join(' → ')} → {cycleIds[0]}
                </p>
              )}
              {!isDeadlocked && systemState === 'unsafe' && (
                <p style={{ fontSize: 10, color: '#D97706', marginTop: 4 }}>
                  Processes blocked — deadlock risk
                </p>
              )}
              {!isDeadlocked && systemState === 'safe' && hasNodes && (
                <p style={{ fontSize: 10, color: '#16A34A', marginTop: 4 }}>
                  All processes can complete
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Processes', value: processes.length, color: '#2563EB' },
              { label: 'Resources', value: resources.length, color: '#7C3AED' },
              { label: 'Edges',     value: storeEdges.length, color: '#0891B2' },
              { label: 'Mode',      value: 'Sim', color: '#16A34A' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 8, padding: '8px 10px',
              }}>
                <p style={{ fontSize: 10, color: '#94A3B8', marginBottom: 4 }}>{s.label}</p>
                <p style={{ fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: 1, marginBottom: 8 }}>
            LEGEND
          </p>
          {[
            { color: '#2563EB', dash: false, label: 'Allocation edge' },
            { color: '#F59E0B', dash: true,  label: 'Request edge (dashed)' },
            { color: '#DC2626', dash: false, label: 'Deadlock cycle ⚠' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div style={{
                width: 28, height: 2, background: l.color, borderRadius: 2,
                borderTop: l.dash ? `2px dashed ${l.color}` : undefined,
                background: l.dash ? 'transparent' : l.color,
              }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Deadlock Recovery */}
        {isDeadlocked && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#DC2626', letterSpacing: 1, marginBottom: 8 }}>
              DEADLOCK RECOVERY
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {recoveryActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  style={{
                    background: '#FEF2F2', border: '1px solid #FCA5A5',
                    borderRadius: 7, padding: '7px 10px',
                    color: '#DC2626', fontSize: 12, textAlign: 'left',
                    cursor: 'pointer', transition: 'background 0.15s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  • {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prevention tips when safe/unsafe */}
        {!isDeadlocked && hasNodes && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid #F1F5F9' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: 1, marginBottom: 8 }}>
              PREVENTION TIPS
            </p>
            {[
              'Use resource ordering',
              "Apply Banker's algorithm",
              'Avoid hold-and-wait',
              'Set request timeouts',
            ].map((tip, i) => (
              <p key={i} style={{ fontSize: 11, color: '#64748B', marginBottom: 4 }}>• {tip}</p>
            ))}
          </div>
        )}

        {/* Live Logs */}
        <div style={{ padding: '10px 14px', flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#94A3B8', letterSpacing: 1, marginBottom: 8 }}>
            LIVE LOGS
          </p>
          {liveLogs.length === 0
            ? <p style={{ fontSize: 11, color: '#CBD5E1' }}>No events yet</p>
            : liveLogs.map(ev => (
              <div key={ev.id} style={{
                background: '#F8FAFC', border: '1px solid #E2E8F0',
                borderRadius: 6, padding: '6px 10px', marginBottom: 5,
              }}>
                <p style={{ fontSize: 11, color: '#334155' }}>{ev.description}</p>
                <p style={{ fontSize: 9, color: '#94A3B8', marginTop: 2 }}>
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}
