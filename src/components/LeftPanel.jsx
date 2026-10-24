import { motion } from "framer-motion";
import ProcessTerminator from "./ProcessTerminator";

export default function LeftPanel(props) {
  const {
    nodes = [],
    total = 0,

    selectedProcess = "",
    setSelectedProcess = () => {},

    selectedResource = "",
    setSelectedResource = () => {},

    addProcess = () => {},
    addResource = () => {},

    addRequest = () => {},
    addAllocation = () => {},

    loadSafePreset = () => {},
    loadDeadlockPreset = () => {},

    resetSystem = () => {},
    
    onTerminateProcess = () => {},
    edges = [],
    addLog = () => {},
  } = props;

  const processes = nodes.filter(
    (node) => node.type === "process"
  );

  const resources = nodes.filter(
    (node) => node.type === "resource"
  );

  return (
    <div className="h-full p-4 bg-zinc-950 flex flex-col gap-4 overflow-y-auto overflow-x-hidden custom-scrollbar">

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Control Panel
        </h1>

        <p className="text-sm text-zinc-500">
          Resource Allocation Graph Visualizer
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card title="Nodes" value={total} />
        <Card title="Mode" value="Live" />
      </div>

      <Section title="Create">
        <Action onClick={addProcess}>
          + Process
        </Action>

        <Action onClick={addResource}>
          + Resource
        </Action>
      </Section>

      <Section title="Connection Builder">

        <SelectBox
          label="Process"
          value={selectedProcess}
          onChange={setSelectedProcess}
          options={processes}
        />

        <SelectBox
          label="Resource"
          value={selectedResource}
          onChange={setSelectedResource}
          options={resources}
        />

        <div className="grid grid-cols-2 gap-3">

          <button
            onClick={addRequest}
            className="w-full py-2.5 px-3 rounded-2xl bg-blue-950/40 border border-blue-900 text-blue-200 hover:bg-blue-900/40 hover:border-blue-700 transition-all duration-300"
          >
            Request
          </button>

          <button
            onClick={addAllocation}
            className="w-full py-2.5 px-3 rounded-2xl bg-yellow-950/40 border border-yellow-900 text-yellow-200 hover:bg-yellow-900/40 hover:border-yellow-700 transition-all duration-300"
          >
            Allocate
          </button>

        </div>

      </Section>

      <Section title="Scenarios">

        <button
          onClick={loadSafePreset}
          className="w-full p-3 rounded-2xl bg-emerald-950/40 border border-emerald-900 text-emerald-200 hover:bg-emerald-900/40 hover:border-emerald-700 transition-all duration-300"
        >
          Safe Scenario
        </button>

        <button
          onClick={loadDeadlockPreset}
          className="w-full py-2.5 px-3 rounded-2xl bg-red-950/40 border border-red-900 text-red-200 hover:bg-red-900/40 hover:border-red-700 transition-all duration-300"
        >
          Deadlock Scenario
        </button>

      </Section>

      <Section title="Process Management">
        <ProcessTerminator
          nodes={nodes}
          edges={edges}
          onTerminate={onTerminateProcess}
          addLog={addLog}
        />
      </Section>

      

    </div>
  );
}

function Section({
  title,
  children,
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs uppercase tracking-[0.2em] text-zinc-500">
        {title}
      </h2>

      {children}
    </div>
  );
}

function Action({
  children,
  onClick,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full py-2.5 px-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition"
    >
      {children}
    </motion.button>
  );
}

function Card({
  title,
  value,
}) {
  return (
    <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
      <p className="text-xs text-zinc-500">
        {title}
      </p>

      <p className="text-lg font-semibold mt-1">
        {value}
      </p>
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full p-3 rounded-2xl bg-zinc-900 border border-zinc-800 outline-none"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.id}
          </option>
        ))}
      </select>
    </div>
  );
}