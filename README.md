# DEADLOCKX - Enterprise Deadlock Detection & Recovery Simulator

An intelligent, interactive platform for understanding operating system deadlock concepts through visualization, simulation, and hands-on learning.

## 🎯 Features

### 📊 Dashboard
- **Real-time System Monitoring**: Active processes, resources, and system state
- **Live Statistics**: Deadlock count, process metrics, resource utilization
- **Interactive Charts**: Line charts showing system activity trends
- **System State Indicator**: Safe/Unsafe/Deadlocked status with visual alerts
- **Recent Events Log**: Real-time event tracking and history

### 🎮 Live Simulator
- **Process Management**: Create, manage, and monitor multiple processes
- **Resource Control**: Add resources with configurable instance counts
- **Dynamic Allocation**: Real-time resource request and allocation
- **6 Predefined Scenarios**: From simple 2-process deadlock to complex multi-resource scenarios
- **Event Logging**: Complete audit trail of all system actions
- **Status Tracking**: Process states (Ready, Running, Blocked, Terminated)

### 🗺️ Resource Allocation Graph (RAG)
- **Interactive Visualization**: Drag-and-drop node positioning with React Flow
- **Visual Indicators**: Color-coded process and resource nodes
- **Edge Types**: Request edges (P→R) and Allocation edges (R→P)
- **Cycle Highlighting**: Automatic visual detection of deadlock cycles
- **Real-time Updates**: Graph updates as simulation changes
- **Zoom & Pan Controls**: Navigate complex graphs easily

### 🔍 Detection Engine
- **Dual Algorithm Support**:
  - **Cycle Detection** (DFS): For single-instance resources
  - **Banker's Algorithm** (Matrix): For multi-instance resources
- **Step-by-Step Visualization**: See algorithms execute in real-time
- **Matrix Display**: Allocation, Request, Available, Need matrices
- **Safe Sequence Finding**: Identify safe execution orders
- **Detailed Execution Steps**: Follow algorithm logic through each iteration

### 🔧 Recovery Center
- **Three Recovery Strategies**:
  1. **Process Termination**: Select and terminate deadlocked processes
  2. **Resource Preemption**: Preempt resources from processes
  3. **Checkpoint & Rollback**: Save states and rollback to safe points
- **Strategy Comparison**: Pros/cons analysis for each method
- **Interactive Selection**: Visual process and resource selection
- **Recovery Log**: Track all recovery actions
- **Statistics Tracking**: Terminations, preemptions, checkpoint counts

### 📈 Analytics Dashboard
- **Multiple Chart Types**: Line, Bar, Area charts (switchable)
- **Time Range Filters**: 24h, 7d, 30d, All-time views
- **Performance Metrics**:
  - Process Status Distribution (Pie chart)
  - Event Type Distribution (Bar chart)
  - Resource Utilization (Stacked bars)
  - System Performance Radar
  - Deadlock Trend Analysis (Area chart)
- **Real-time Data**: Live updates as simulation progresses

### 🏆 Challenge Mode
- **10 Progressive Challenges**: Across 4 difficulty levels
  - Easy (2 challenges): Basic deadlock detection
  - Medium (2 challenges): Multi-resource scenarios
  - Hard (3 challenges): Complex detection and recovery
  - Expert (3 challenges): Ultimate system mastery
- **Scoring System**: Points based on performance and speed
- **Time Limits**: Race against the clock
- **Unlock System**: Complete challenges to unlock new ones
- **Hints & Objectives**: Guided learning with contextual help
- **Progress Tracking**: Completion stats and streaks

### 📚 Learning Center
- **8 Interactive Tutorials**:
  1. Introduction to Deadlocks
  2. Four Necessary Conditions
  3. Resource Allocation Graph
  4. Detection Algorithms
  5. Deadlock Prevention
  6. Deadlock Avoidance
  7. Recovery Techniques
  8. Real-World Case Studies
- **Multiple Content Types**:
  - Text lessons with diagrams
  - Code examples with syntax highlighting
  - Interactive quizzes with validation
- **Progressive Unlocking**: Tutorials unlock sequentially
- **Progress Tracking**: Certificates and completion stats
- **Learning Path**: Visual progression through topics

### ℹ️ About Page
- **Project Overview**: Mission, features, and technology
- **Technology Stack**: 8 modern web technologies
- **Learning Outcomes**: Comprehensive skill checklist
- **Use Cases**: For students and professionals
- **Team Information**: Project background and contributors
- **Open Source**: GitHub repository link

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aslam-0305/Deadlock_visualization.git
cd Deadlock_visualization

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

### Getting Started

1. **Dashboard**: View system overview and statistics
2. **Simulator**: Create processes, add resources, and make allocations
3. **Graph**: Visualize the resource allocation graph
4. **Detection**: Run detection algorithms to find deadlocks
5. **Recovery**: Apply recovery methods to resolve deadlocks
6. **Analytics**: Analyze system performance and trends
7. **Challenges**: Test your skills with interactive scenarios
8. **Learning**: Master concepts through tutorials

### Simulating Deadlock

1. Go to **Live Simulator** page
2. Load a predefined scenario or create custom one:
   - Click "+ Process" to add processes
   - Click "+ Resource" to add resources
   - Use Request/Allocate buttons to create dependencies
3. Go to **Detection Engine** page
4. Click "Run Detection" to check for deadlock
5. View cycle path and deadlocked processes

### Recovering from Deadlock

1. Navigate to **Recovery Center**
2. Select a recovery strategy (Termination, Preemption, or Rollback)
3. Choose processes/resources to target
4. Apply recovery and observe results
5. Return to Detection Engine to verify resolution

### Learning Mode

1. Visit **Learning Center**
2. Start with "Introduction to Deadlocks"
3. Progress through tutorials sequentially
4. Complete quizzes to test understanding
5. Unlock advanced topics as you progress

### Challenge Mode

1. Open **Challenge Mode**
2. Select an unlocked challenge
3. Read objectives and time limit
4. Use simulator, detection, and recovery tools
5. Complete objectives within time limit
6. Earn points and unlock next challenge

## 🏗️ Architecture

### Technology Stack
- **React 19** with **TypeScript**: Modern component framework
- **Vite**: Lightning-fast build tool
- **Tailwind CSS**: Utility-first styling framework
- **Zustand**: Lightweight state management
- **React Flow**: Interactive node-based graphs
- **Recharts**: Composable charting library
- **Framer Motion**: Production-ready animations
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icon system

### Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Layout.tsx          # Main layout wrapper
│       ├── Sidebar.tsx         # Navigation sidebar
│       └── Header.tsx          # Top header bar
├── pages/
│   ├── Dashboard.tsx           # System overview
│   ├── Simulator.tsx           # Live simulation
│   ├── ResourceGraph.tsx       # RAG visualization
│   ├── DetectionEngine.tsx     # Algorithm execution
│   ├── RecoveryCenter.tsx      # Recovery methods
│   ├── Analytics.tsx           # Data visualization
│   ├── ChallengeMode.tsx       # Interactive challenges
│   ├── LearningCenter.tsx      # Educational content
│   └── About.tsx               # Project information
├── store/
│   └── simulationStore.ts      # Global state management
├── algorithms/
│   ├── cycleDetection.ts       # DFS-based cycle detection
│   └── matrixDetection.ts      # Banker's algorithm
├── App.tsx                     # Root component
├── main.tsx                    # Application entry
└── index.css                   # Global styles + animations
```

### Key Algorithms

**Cycle Detection (DFS)**
```typescript
// Detects circular wait using depth-first search
// Time Complexity: O(V + E)
function detectCycle(processes, resources, edges): CycleResult
```

**Banker's Algorithm**
```typescript
// Checks system safety using matrix analysis
// Time Complexity: O(m × n²)
function detectDeadlockMatrix(processes, resources): MatrixResult
```

## 🎓 Educational Use

### Learning Objectives

Students will understand:
- **Deadlock Fundamentals**: Definition, causes, and real-world examples
- **Necessary Conditions**: The four conditions required for deadlock
- **Detection Methods**: Cycle detection and matrix-based algorithms
- **Prevention Strategies**: Resource ordering, hold-and-wait elimination
- **Avoidance Techniques**: Safe state checking, Banker's algorithm
- **Recovery Methods**: Termination, preemption, and rollback
- **System Design**: How to build deadlock-resistant systems

### Target Audience

- **CS Students**: Operating Systems, Concurrent Programming courses
- **Software Engineers**: System design, debugging distributed systems
- **Educators**: Teaching tool for OS concepts
- **Researchers**: Exploring deadlock patterns and solutions

## 🧪 Testing

### Manual Testing Checklist

✅ **Dashboard**
- [ ] All stat cards display correct values
- [ ] Charts render without errors
- [ ] System state updates in real-time
- [ ] Navigation works from all links

✅ **Simulator**
- [ ] Can add/remove processes
- [ ] Can add/remove resources
- [ ] Request/Allocate operations work
- [ ] Scenarios load correctly
- [ ] Event log updates

✅ **Resource Graph**
- [ ] Nodes are draggable
- [ ] Edges display correctly
- [ ] Cycle highlighting works
- [ ] Graph updates on state change

✅ **Detection Engine**
- [ ] Both algorithms execute
- [ ] Step-by-step visualization works
- [ ] Matrices display correctly
- [ ] Results are accurate

✅ **Recovery Center**
- [ ] All three strategies selectable
- [ ] Process/resource selection works
- [ ] Recovery actions execute
- [ ] Checkpoints save/load correctly

✅ **Analytics**
- [ ] All chart types render
- [ ] Time filters work
- [ ] Data updates in real-time
- [ ] No console errors

✅ **Challenge Mode**
- [ ] Challenges load correctly
- [ ] Timer counts down
- [ ] Objectives display
- [ ] Completion tracking works
- [ ] Unlock system functions

✅ **Learning Center**
- [ ] Tutorials load
- [ ] Navigation works
- [ ] Quizzes validate answers
- [ ] Code syntax highlights
- [ ] Progress saves

### Build Verification

```bash
# Verify production build
npm run build

# Check bundle size
# Expected: ~900KB JS, ~50KB CSS

# Test production preview
npm run preview
```

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is for educational purposes. Feel free to use, modify, and distribute.

## 🙏 Acknowledgments

- Built as an Operating Systems course project
- Inspired by classical OS textbooks (Silberschatz, Tanenbaum)
- Community feedback and contributions

## 🔧 Troubleshooting

### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port Conflicts
```bash
# Use different port
npm run dev -- --port 3000
```

### TypeScript Errors
```bash
# Regenerate types
npm run build
```

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Search closed issues on GitHub
3. Create new issue with details

## 🎉 Version History

### v1.0.0 (2024)
- ✅ Complete 9-page application
- ✅ Dual detection algorithms
- ✅ Three recovery strategies
- ✅ 10 challenge scenarios
- ✅ 8 interactive tutorials
- ✅ Full analytics dashboard
- ✅ Professional animations
- ✅ Responsive design
- ✅ Production-ready build

---

**Built with ❤️ for Operating Systems Education**

🚀 [Live Demo](http://localhost:5173) | 📖 [Documentation](#) | 🐛 [Issues](https://github.com/Aslam-0305/Deadlock_visualization/issues)

