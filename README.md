# Resource Allocation Graph Visualizer

An interactive visualization tool for understanding Resource Allocation Graphs (RAG), deadlock detection, and recovery in Operating Systems.

## 🎯 Features

### Core Visualization
- **Interactive Graph Canvas**: Drag and position nodes freely
- **Process Nodes**: Create and manage processes (circular blue nodes)
- **Resource Nodes**: Create and manage resources (rectangular yellow nodes)
- **Edges**: Create allocation (Resource → Process) and request (Process → Resource) edges
- **Real-time Deadlock Detection**: Automatic cycle detection with visual highlighting
- **Preset Scenarios**: Quick load safe and deadlock scenarios

### 🆕 Process Termination (Feature 1)
- **Smart Termination**: Select and terminate processes from dropdown
- **Pre-termination Information**: View allocated resources and pending requests
- **Confirmation Modal**: Review impact before confirming termination
- **Automatic Resource Cleanup**: Released resources increase available count
- **Edge Removal**: All connected edges are removed automatically
- **Deadlock Re-detection**: System automatically checks for deadlock after termination
- **Detailed Logging**: Complete history of termination actions

### 🆕 Deadlock Scenario Analyzer (Feature 2)
- **Current State Analysis**:
  - Active processes and resource counts
  - Blocked processes identification
  - Resource availability tracking (available/total instances)
  - Process allocation and request display
- **Active Deadlock Explanation**:
  - Complete cycle path visualization
  - Wait relationship explanations ("P1 waits for R2", "P2 holds R2", etc.)
  - Step-by-step breakdown of the circular wait
- **Potential Scenario Generation**:
  - Generates up to 8 potential deadlock scenarios
  - Multiple scenario types (2-process cycle, 3-process chain, contention, hold-and-wait)
  - Risk level assessment (high/medium/low)
  - Expandable cards with detailed explanations
- **Prevention Strategies**:
  - Specific recommendations for each scenario
  - Resource ordering suggestions
  - Banker's algorithm hints
  - Timeout and priority scheduling advice

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173/`

## 📖 Usage Guide

### Creating a Graph

1. **Add Processes**: Click "+ Process" in the Control Panel
2. **Add Resources**: Click "+ Resource" in the Control Panel
3. **Create Connections**:
   - Select a process from the dropdown
   - Select a resource from the dropdown
   - Click "Request" to create Process → Resource edge
   - Click "Allocate" to create Resource → Process edge

### Detecting Deadlocks

The system automatically detects cycles in the resource allocation graph:
- **Green Status**: "SAFE SYSTEM" - No deadlock detected
- **Red Status**: "DEADLOCK DETECTED" - Cycle found
- Deadlock cycles are highlighted in red with animation

### Terminating Processes

1. Scroll to "Process Management" in the left panel
2. Select a process from the dropdown
3. Review allocated resources and pending requests
4. Click "Terminate Process"
5. Confirm in the modal dialog
6. System automatically re-runs deadlock detection

### Analyzing Potential Scenarios

1. Scroll to "Potential Deadlock Scenarios" in the right panel
2. Review the current state summary
3. Click "Analyze Potential Scenarios" button
4. Browse generated scenarios
5. Click on any scenario card to expand details
6. Review sequence of events, cycles, and prevention strategies

### Using Presets

- **Safe Scenario**: Loads a simple safe allocation (P1 with R1)
- **Deadlock Scenario**: Loads a classic 2-process deadlock (P1-R1-P2-R2 cycle)

### Resetting

Click the rotating arrow button in the Analytics panel to reset the entire system.

## 🏗️ Architecture

### Technology Stack
- **React 19**: Component framework
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Flow**: (available but not currently used)

### Project Structure

```
src/
├── components/
│   ├── GraphCanvas.jsx              # Main graph visualization
│   ├── LeftPanel.jsx                # Control panel (left side)
│   ├── RightPanel.jsx               # Analytics panel (right side)
│   ├── ProcessTerminator.jsx        # Process termination UI
│   └── DeadlockScenarioAnalyzer.jsx # Scenario analysis UI
├── utils/
│   └── deadlock.js                  # Deadlock detection algorithms
├── App.jsx                          # Main application component
├── App.css                          # Application styles
├── index.css                        # Global styles
└── main.jsx                         # Application entry point
```

### Key Algorithms

**Deadlock Detection (DFS-based Cycle Detection)**
```javascript
// Detects cycles in the resource allocation graph
// Returns: { deadlock: boolean, cycle: string[] }
detectDeadlock(nodes, edges)
```

**Resource State Tracking**
```javascript
// Tracks allocations, requests, and blocked processes
// Returns: { processes, resources, allocations, requests, blocked }
getResourceState(nodes, edges)
```

**Cycle Analysis**
```javascript
// Explains wait relationships in a detected cycle
// Returns: { cycle, waitRelationships, description }
analyzeCycle(cycle, edges)
```

**Scenario Generation**
```javascript
// Generates potential deadlock scenarios
// Returns: array of scenario objects
generateDeadlockScenarios(nodes, edges, maxScenarios)
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions including:
- Test case procedures
- Feature validation checklists
- Expected behaviors
- Success criteria

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**: Complete testing procedures and validation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**: Technical implementation details

## 🎓 Educational Use

This tool is designed for:
- **Operating Systems Courses**: Visualize deadlock concepts
- **Student Learning**: Interactive exploration of resource allocation
- **Teaching Demonstrations**: Generate examples automatically
- **Research**: Analyze resource allocation patterns

### Key Concepts Demonstrated

1. **Resource Allocation Graphs**: Visual representation of processes and resources
2. **Deadlock Conditions**:
   - Mutual Exclusion (resources are non-sharable)
   - Hold and Wait (processes hold resources while waiting)
   - No Preemption (resources cannot be forcibly taken)
   - Circular Wait (cycle in the allocation graph)
3. **Deadlock Detection**: Cycle detection algorithm (DFS-based)
4. **Deadlock Recovery**: Process termination with resource release
5. **Deadlock Prevention**: Strategies to avoid circular wait conditions

## 🤝 Contributing

This is an educational project. Feel free to:
- Report issues
- Suggest improvements
- Add new features
- Improve documentation

## 📝 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Original concept: CalmaCodes/Resource-Allocation-Graph-Visualizer
- Enhanced with Process Termination and Scenario Analysis features
- Built with modern React and Vite

## 🔧 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Styling Issues
```bash
# Rebuild Tailwind
npm run build
```

## 📞 Support

For questions or issues:
1. Check the [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. Review the [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
3. Create an issue with detailed description

---

**Happy Learning! 🎉**

Explore deadlock concepts interactively and understand how operating systems manage resources!
