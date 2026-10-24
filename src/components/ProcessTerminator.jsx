import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProcessTerminator({
  nodes = [],
  edges = [],
  onTerminate = () => {},
  addLog = () => {},
}) {
  const [selectedProcess, setSelectedProcess] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const processes = nodes.filter((node) => node.type === "process");

  // Get allocated resources and pending requests for selected process
  const getProcessInfo = (processId) => {
    if (!processId) return { allocated: [], requests: [] };

    const allocated = edges
      .filter((e) => e.type === "allocation" && e.to === processId)
      .map((e) => e.from);

    const requests = edges
      .filter((e) => e.type === "request" && e.from === processId)
      .map((e) => e.to);

    return { allocated, requests };
  };

  const processInfo = getProcessInfo(selectedProcess);
  const hasActiveProcess = processes.length > 0;

  const handleTerminateClick = () => {
    if (!selectedProcess) return;
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (!selectedProcess) return;

    const info = getProcessInfo(selectedProcess);

    // Call the termination handler
    onTerminate(selectedProcess, info.allocated, info.requests);

    // Log the termination
    addLog(
      `Process ${selectedProcess} terminated. Released: ${
        info.allocated.length > 0 ? info.allocated.join(", ") : "none"
      }`
    );

    // Reset state
    setSelectedProcess("");
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Select Process</label>
        <select
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          disabled={!hasActiveProcess}
          className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {hasActiveProcess ? "Select Process" : "No active processes"}
          </option>
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id}
            </option>
          ))}
        </select>
      </div>

      {selectedProcess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm space-y-2"
        >
          <div>
            <p className="text-xs text-zinc-500 mb-1">Allocated Resources:</p>
            <p className="text-zinc-300">
              {processInfo.allocated.length > 0
                ? processInfo.allocated.join(", ")
                : "None"}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Pending Requests:</p>
            <p className="text-zinc-300">
              {processInfo.requests.length > 0
                ? processInfo.requests.join(", ")
                : "None"}
            </p>
          </div>
        </motion.div>
      )}

      <motion.button
        whileHover={hasActiveProcess && selectedProcess ? { scale: 1.02 } : {}}
        whileTap={hasActiveProcess && selectedProcess ? { scale: 0.97 } : {}}
        onClick={handleTerminateClick}
        disabled={!selectedProcess || !hasActiveProcess}
        className="w-full py-2.5 px-3 rounded-2xl bg-red-950/40 border border-red-900 text-red-200 hover:bg-red-900/40 hover:border-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-950/40 disabled:hover:border-red-900"
      >
        Terminate Process
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border-2 border-red-800 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-300 mb-2">
                    Confirm Process Termination
                  </h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Are you sure you want to terminate{" "}
                    <span className="font-semibold text-white">
                      {selectedProcess}
                    </span>
                    ?
                  </p>

                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm space-y-2">
                    <div>
                      <p className="text-xs text-zinc-500">
                        Resources to be released:
                      </p>
                      <p className="text-zinc-300 font-medium">
                        {processInfo.allocated.length > 0
                          ? processInfo.allocated.join(", ")
                          : "None"}
                      </p>
                    </div>
                    {processInfo.requests.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500">
                          Pending requests to be removed:
                        </p>
                        <p className="text-zinc-300 font-medium">
                          {processInfo.requests.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 mt-3">
                    This action will update the resource allocation graph and
                    re-run deadlock detection.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-2.5 px-4 rounded-2xl bg-red-950 border border-red-800 text-red-200 hover:bg-red-900 hover:border-red-700 transition-all duration-300 font-medium"
                >
                  Confirm Termination
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
