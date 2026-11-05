import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import { RefreshCw } from 'lucide-react';

export default function ResourceGraph() {
  const processes = useSimulationStore((state) => state.processes);
  const resources = useSimulationStore((state) => state.resources);
  const storeEdges = useSimulationStore((state) => state.edges);
  const detectionResult = useSimulationStore((state) => state.detectionResult);

  // Build React Flow nodes/edges from store state
  const buildNodes = useCallback((): Node[] => {
    const processNodes: Node[] = processes.map((p, index) => ({
      id: p.id,
      type: 'default',
      position: { x: 150 + (index % 3) * 220, y: 80 + Math.floor(index / 3) * 200 },
      data: {
        label: (
          <div className="text-center leading-tight">
            <div className="font-bold text-xs">{p.name}</div>
            <div className="text-gray-500" style={{ fontSize: 10 }}>{p.status}</div>
          </div>
        ),
      },
      style: {
        background: detectionResult?.deadlockedProcesses.includes(p.id) ? '#FEE2E2' : '#DBEAFE',
        border: detectionResult?.deadlockedProcesses.includes(p.id)
          ? '2px solid #EF4444'
          : '2px solid #2563EB',
        borderRadius: '50%',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }));

    const resourceNodes: Node[] = resources.map((r, index) => ({
      id: r.id,
      type: 'default',
      position: { x: 480 + (index % 3) * 220, y: 80 + Math.floor(index / 3) * 200 },
      data: {
        label: (
          <div className="text-center leading-tight">
            <div className="font-bold text-xs">{r.name}</div>
            <div className="text-gray-500" style={{ fontSize: 10 }}>
              {r.availableInstances}/{r.totalInstances}
            </div>
          </div>
        ),
      },
      style: {
        background: '#F3E8FF',
        border: '2px solid #7C3AED',
        borderRadius: '8px',
        width: 80,
        height: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }));

    return [...processNodes, ...resourceNodes];
  }, [processes, resources, detectionResult]);

  const buildEdges = useCallback((): Edge[] => {
    return storeEdges.map((e) => {
      const inCycle =
        (detectionResult?.cycle ?? []).includes(e.from) &&
        (detectionResult?.cycle ?? []).includes(e.to);

      const color = inCycle
        ? '#EF4444'
        : e.type === 'request'
        ? '#F59E0B'
        : '#06B6D4';

      return {
        id: e.id,
        source: e.from,
        target: e.to,
        type: 'smoothstep',
        animated: e.type === 'request',
        style: { stroke: color, strokeWidth: inCycle ? 3 : 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color },
        label: e.type === 'request' ? 'Req' : 'Alloc',
        labelStyle: { fontSize: 10, fill: '#64748B' },
        labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.8 },
      };
    });
  }, [storeEdges, detectionResult]);

  const [nodes, setNodes, onNodesChange] = useNodesState(buildNodes());
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(buildEdges());

  // Sync whenever store state changes
  useEffect(() => {
    setNodes(buildNodes());
  }, [buildNodes, setNodes]);

  useEffect(() => {
    setFlowEdges(buildEdges());
  }, [buildEdges, setFlowEdges]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Resource Allocation Graph</h3>
            <p className="text-sm text-text-secondary mt-1">
              Updates automatically as you change the simulation state
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>{processes.length} processes</span>
            <span>{resources.length} resources</span>
            <span>{storeEdges.length} edges</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="card py-3">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-primary-600" />
            <span className="text-text-secondary">Process</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-100 border-2 border-violet-600" />
            <span className="text-text-secondary">Resource</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-yellow-500" />
            <span className="text-text-secondary">Request (animated)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-cyan-500" />
            <span className="text-text-secondary">Allocation</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-danger-500" />
            <span className="text-text-secondary">Deadlock Cycle</span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {processes.length === 0 && resources.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-text-secondary mb-2">No processes or resources yet.</p>
          <p className="text-sm text-text-secondary">
            Go to <strong>Live Simulator</strong> and add processes/resources, or load a scenario.
          </p>
        </div>
      )}

      {/* Graph */}
      {(processes.length > 0 || resources.length > 0) && (
        <div className="card p-0 overflow-hidden" style={{ height: '580px' }}>
          <ReactFlow
            nodes={nodes}
            edges={flowEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      )}

      {/* Cycle Information */}
      {detectionResult && detectionResult.cycle.length > 0 && (
        <div className="card bg-red-50 border-danger-200 animate-fadeInDown">
          <h4 className="font-semibold text-danger-600 mb-2">⚠ Deadlock Cycle Detected</h4>
          <p className="text-sm text-danger-700 font-mono mb-2">
            {detectionResult.cycle.join(' → ')} → {detectionResult.cycle[0]}
          </p>
          <p className="text-xs text-text-secondary">
            Highlighted edges form a circular dependency. Go to Recovery Center to resolve.
          </p>
        </div>
      )}
    </div>
  );
}
