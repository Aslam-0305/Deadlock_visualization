import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getResourceState,
  analyzeCycle,
  generateDeadlockScenarios,
} from "../utils/deadlock";

export default function DeadlockScenarioAnalyzer({
  nodes = [],
  edges = [],
  cycle = [],
  deadlock = false,
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const processes = nodes.filter((n) => n.type === "process");
  const resources = nodes.filter((n) => n.type === "resource");

  const handleAnalyze = () => {
    const generatedScenarios = generateDeadlockScenarios(nodes, edges, 8);
    setScenarios(generatedScenarios);
    setShowAnalysis(true);
  };

  const resourceState = getResourceState(nodes, edges);
  const cycleAnalysis = cycle.length > 0 ? analyzeCycle(cycle, edges) : null;

  const hasEnoughNodes = processes.length >= 2 && resources.length >= 2;

  return (
    <div className="space-y-4">
      {/* Current State Summary */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-zinc-300">Current State</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <StatCard label="Active Processes" value={processes.length} />
          <StatCard label="Resource Types" value={resources.length} />
          <StatCard
            label="Blocked Processes"
            value={resourceState.blocked.length}
            highlight={resourceState.blocked.length > 0}
          />
          <StatCard
            label="Total Edges"
            value={edges.length}
          />
        </div>

        {/* Resource Summary */}
        {resources.length > 0 && (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <p className="text-xs text-zinc-500 font-medium">Resource Status</p>
            <div className="space-y-1">
              {resourceState.resources.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center text-xs"
                >
                  <span className="text-zinc-400">{r.id}:</span>
                  <span className="text-zinc-300">
                    {r.available}/{r.total} available
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Deadlock Analysis */}
        {deadlock && cycleAnalysis && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-xs font-semibold text-red-300">
                Active Deadlock Detected
              </p>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-zinc-400">Cycle:</p>
              <p className="text-red-200 font-mono">
                {cycle.join(" → ")} → {cycle[0]}
              </p>
            </div>
            <div className="space-y-1">
              {cycleAnalysis.description.map((desc, i) => (
                <p key={i} className="text-xs text-zinc-400">
                  • {desc}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Process Allocations and Requests */}
        {processes.length > 0 && (
          <div className="space-y-2">
            {processes.slice(0, 4).map((p) => {
              const allocated = resourceState.allocations[p.id] || [];
              const requests = resourceState.requests[p.id] || [];
              const isBlocked = resourceState.blocked.includes(p.id);

              if (allocated.length === 0 && requests.length === 0) return null;

              return (
                <div
                  key={p.id}
                  className={`p-2 rounded-lg border text-xs ${
                    isBlocked
                      ? "bg-yellow-950/20 border-yellow-900/50"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-zinc-300">{p.id}</span>
                    {isBlocked && (
                      <span className="px-1.5 py-0.5 rounded bg-yellow-900/40 text-yellow-300 text-[10px]">
                        BLOCKED
                      </span>
                    )}
                  </div>
                  {allocated.length > 0 && (
                    <p className="text-zinc-500">
                      Holds: <span className="text-zinc-300">{allocated.join(", ")}</span>
                    </p>
                  )}
                  {requests.length > 0 && (
                    <p className="text-zinc-500">
                      Waits: <span className="text-zinc-300">{requests.join(", ")}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <motion.button
        whileHover={hasEnoughNodes ? { scale: 1.02 } : {}}
        whileTap={hasEnoughNodes ? { scale: 0.97 } : {}}
        onClick={handleAnalyze}
        disabled={!hasEnoughNodes}
        className="w-full py-2.5 px-3 rounded-2xl bg-purple-950/40 border border-purple-900 text-purple-200 hover:bg-purple-900/40 hover:border-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {hasEnoughNodes
          ? "Analyze Potential Scenarios"
          : "Need 2+ processes and resources"}
      </motion.button>

      {/* Scenario Results */}
      <AnimatePresence>
        {showAnalysis && scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-300">
                Potential Deadlock Scenarios ({scenarios.length})
              </h3>
              <button
                onClick={() => setShowAnalysis(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Hide
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {scenarios.map((scenario, index) => (
                <ScenarioCard
                  key={index}
                  scenario={scenario}
                  index={index}
                  isSelected={selectedScenario === index}
                  onClick={() =>
                    setSelectedScenario(
                      selectedScenario === index ? null : index
                    )
                  }
                />
              ))}
            </div>
          </motion.div>
        )}

        {showAnalysis && scenarios.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900 text-sm text-emerald-300"
          >
            No additional deadlock scenarios found with current configuration.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, highlight = false }) {
  return (
    <div
      className={`p-2 rounded-lg border ${
        highlight
          ? "bg-yellow-950/20 border-yellow-900/50"
          : "bg-zinc-900 border-zinc-800"
      }`}
    >
      <p className="text-[10px] text-zinc-500">{label}</p>
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-yellow-300" : "text-zinc-300"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ScenarioCard({ scenario, index, isSelected, onClick }) {
  const likelyhoodColors = {
    high: "text-red-400 bg-red-950/40 border-red-900",
    medium: "text-yellow-400 bg-yellow-950/40 border-yellow-900",
    low: "text-blue-400 bg-blue-950/40 border-blue-900",
  };

  const likelyhoodColor =
    likelyhoodColors[scenario.likelyhood] || likelyhoodColors.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border cursor-pointer transition-all ${
        isSelected
          ? "bg-purple-950/40 border-purple-800"
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
      }`}
      onClick={onClick}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-zinc-500">
                #{index + 1}
              </span>
              <h4 className="text-sm font-semibold text-zinc-200">
                {scenario.title}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${likelyhoodColor}`}
              >
                {scenario.likelyhood} risk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-400">
                {scenario.type}
              </span>
            </div>
          </div>
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-zinc-500 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            animate={{ rotate: isSelected ? 180 : 0 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </div>

        <p className="text-xs text-zinc-400 mb-2">{scenario.explanation}</p>

        <div className="flex flex-wrap gap-1 text-xs">
          <span className="text-zinc-500">Involves:</span>
          {scenario.processes.map((p) => (
            <span
              key={p}
              className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-300 border border-blue-900"
            >
              {p}
            </span>
          ))}
          {scenario.resources.map((r) => (
            <span
              key={r}
              className="px-1.5 py-0.5 rounded bg-yellow-950/40 text-yellow-300 border border-yellow-900"
            >
              {r}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-800 overflow-hidden"
          >
            <div className="p-3 space-y-3">
              {/* Steps */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">
                  Sequence of Events:
                </p>
                <div className="space-y-1">
                  {scenario.steps.map((step, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <span className="text-purple-400 font-mono flex-shrink-0">
                        {i + 1}.
                      </span>
                      <span className="text-zinc-300">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cycle */}
              {scenario.cycle && scenario.cycle.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-1">
                    Resulting Cycle:
                  </p>
                  <p className="text-xs font-mono text-red-300 bg-red-950/20 border border-red-900 rounded px-2 py-1">
                    {scenario.cycle.join(" → ")} → {scenario.cycle[0]}
                  </p>
                </div>
              )}

              {/* Prevention */}
              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-1">
                  Prevention Strategy:
                </p>
                <p className="text-xs text-emerald-300 bg-emerald-950/20 border border-emerald-900 rounded px-2 py-1">
                  {scenario.prevention}
                </p>
              </div>

              {/* Assumptions */}
              <div className="text-[10px] text-zinc-500 italic">
                * This scenario assumes single-instance resources unless otherwise
                configured
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
