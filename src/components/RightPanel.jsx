import DeadlockScenarioAnalyzer from "./DeadlockScenarioAnalyzer";
import { getPreemptableResources, canReleaseResources, canRollback } from "../utils/recovery";

export default function RightPanel({
  nodes = [],
  edges = [],
  deadlock = false,
  logs = [],
  cycle = [],
  resetSystem = () => {},
  onPreemptResource = () => {},
  onReleaseResources = () => {},
  onRollback = () => {},
}) {
  const processCount =
    nodes.filter(
      (node) => node.type === "process"
    ).length;

  const resourceCount =
    nodes.filter(
      (node) => node.type === "resource"
    ).length;

  const visibleLogs = logs.slice(0, 6);

  const culpritProcess =
    cycle.find((id) =>
      id.startsWith("P")
    ) || "P1";

  const culpritResource =
    cycle.find((id) =>
      id.startsWith("R")
    ) || "R1";

  // Get preemptable resources for dynamic button generation
  const preemptableResources = getPreemptableResources(nodes, edges);
  const canRelease = canReleaseResources(cycle);
  const canRollbackProcess = canRollback(cycle);

  return (
    <div className="h-full p-4 bg-zinc-950 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar">

      <div className="flex items-start justify-between">

        <div>
          <h1 className="text-xl font-semibold">
            Analytics
          </h1>

          <p className="text-sm text-zinc-500">
            Live system state
          </p>
        </div>

        <button
          onClick={resetSystem}
          className="group w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-red-800 hover:bg-red-950/30 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-zinc-400 group-hover:text-red-300 group-hover:rotate-180 transition-all duration-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 11a8 8 0 10-2.34 5.66M20 4v7h-7"
            />
            <circle
              cx="12"
              cy="12"
              r="1.2"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </button>

      </div>

      <StatusCard deadlock={deadlock} />

      <div className="grid grid-cols-2 gap-3">
        <MiniCard
          title="Processes"
          value={processCount}
        />
        <MiniCard
          title="Resources"
          value={resourceCount}
        />
        <MiniCard
          title="Edges"
          value={edges.length}
        />
        <MiniCard
          title="Mode"
          value="Sim"
        />
      </div>

      <Panel title="Deadlock Recovery">

        {deadlock ? (
          <div className="space-y-3">

            {/* Preempt Resource Buttons */}
            {preemptableResources.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 font-medium">Preempt Resources:</p>
                <div className="flex flex-wrap gap-2">
                  {preemptableResources.map((resource) => (
                    <button
                      key={resource.id}
                      onClick={() => onPreemptResource(resource.id)}
                      className="px-3 py-2 rounded-xl bg-yellow-950/40 border border-yellow-900 text-yellow-200 hover:bg-yellow-900/60 hover:border-yellow-700 transition-all duration-300 text-sm font-medium"
                      title={`Preempt ${resource.id} from ${resource.allocatedTo}`}
                    >
                      Preempt {resource.id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Release Held Resources Button */}
            <button
              onClick={onReleaseResources}
              disabled={!canRelease}
              className="w-full p-3 rounded-xl bg-blue-950/40 border border-blue-900 text-blue-200 hover:bg-blue-900/60 hover:border-blue-700 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-950/40 disabled:hover:border-blue-900"
              title={canRelease ? "Release resources from blocked process" : "No blocked processes"}
            >
              Release Held Resources
            </button>

            {/* Rollback Blocked Process Button */}
            <button
              onClick={onRollback}
              disabled={!canRollbackProcess}
              className="w-full p-3 rounded-xl bg-purple-950/40 border border-purple-900 text-purple-200 hover:bg-purple-900/60 hover:border-purple-700 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-950/40 disabled:hover:border-purple-900"
              title={canRollbackProcess ? "Rollback blocked process to checkpoint" : "No blocked processes"}
            >
              Rollback Blocked Process
            </button>

          </div>
        ) : (
          <p className="text-sm text-emerald-300">
            No action needed.
            System is stable.
          </p>
        )}

      </Panel>

      <Panel title="Live Logs">
        <div className="space-y-2 text-sm">
          {visibleLogs.length === 0 ? (
            <p className="text-zinc-500">
              No logs yet
            </p>
          ) : (
            visibleLogs.map((log, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                {log}
              </div>
            ))
          )}
        </div>
      </Panel>

      {/* Deadlock Scenario Analyzer */}
      <Panel title="Potential Deadlock Scenarios">
        <DeadlockScenarioAnalyzer
          nodes={nodes}
          edges={edges}
          cycle={cycle}
          deadlock={deadlock}
        />
      </Panel>

    </div>
  );
}

function StatusCard({ deadlock }) {
  return (
    <div
      className={`p-4 rounded-2xl border ${
        deadlock
          ? "bg-red-950 border-red-800 text-red-300"
          : "bg-emerald-950 border-emerald-800 text-emerald-300"
      }`}
    >
      <p className="text-xs uppercase tracking-wider opacity-70">
        System Status
      </p>

      <p className="text-lg font-semibold mt-1">
        {deadlock
          ? "DEADLOCK DETECTED"
          : "SAFE SYSTEM"}
      </p>
    </div>
  );
}

function MiniCard({ title, value }) {
  return (
    <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800">
      <p className="text-xs text-zinc-500">
        {title}
      </p>

      <p className="text-base font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm uppercase tracking-wider text-zinc-500">
        {title}
      </h2>

      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
        {children}
      </div>
    </div>
  );
}
