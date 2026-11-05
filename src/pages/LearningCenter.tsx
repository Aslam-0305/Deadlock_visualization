import { useState } from 'react';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  ChevronRight,
  Code,
  Lightbulb,
  GitBranch,
  Lock,
  AlertTriangle,
  Clock,
  Users,
  Database,
  Workflow,
  GraduationCap,
  Award,
  ArrowRight,
} from 'lucide-react';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: any;
  color: string;
  bgColor: string;
  completed: boolean;
  locked: boolean;
  sections: Section[];
}

interface Section {
  id: number;
  title: string;
  content: string;
  type: 'text' | 'code' | 'diagram' | 'quiz';
  codeExample?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  correctAnswer?: number;
}

const tutorials: Tutorial[] = [
  {
    id: 1,
    title: 'Introduction to Deadlocks',
    description: 'Learn the fundamentals of deadlock: what it is, why it occurs, and real-world examples',
    duration: '10 min',
    difficulty: 'Beginner',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    completed: false,
    locked: false,
    sections: [
      {
        id: 1,
        title: 'What is a Deadlock?',
        content: 'A deadlock is a situation in concurrent computing where two or more processes are unable to proceed because each is waiting for the other to release a resource. It\'s like two cars at an intersection, each waiting for the other to move first.',
        type: 'text',
      },
      {
        id: 2,
        title: 'Real-World Example',
        content: 'Imagine a dining philosophers problem: Five philosophers sit at a round table with five chopsticks. Each philosopher needs two chopsticks to eat. If each picks up the chopstick on their left simultaneously, they all wait forever for the right chopstick - a classic deadlock!',
        type: 'text',
      },
      {
        id: 3,
        title: 'Quiz: Understanding Deadlock',
        content: 'Test your understanding',
        type: 'quiz',
        quizQuestion: 'Which statement best describes a deadlock?',
        quizOptions: [
          'A process waiting for CPU time',
          'Two or more processes waiting indefinitely for each other',
          'A process running slowly',
          'A system with high memory usage',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    id: 2,
    title: 'Four Necessary Conditions',
    description: 'Explore the four conditions that must hold simultaneously for deadlock to occur',
    duration: '15 min',
    difficulty: 'Beginner',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    completed: false,
    locked: false,
    sections: [
      {
        id: 1,
        title: 'The Four Conditions',
        content: 'For a deadlock to occur, ALL four of these conditions must be true simultaneously:\n\n1. **Mutual Exclusion**: At least one resource must be held in a non-sharable mode\n2. **Hold and Wait**: A process must be holding at least one resource and waiting for additional resources\n3. **No Preemption**: Resources cannot be forcibly taken from a process\n4. **Circular Wait**: A circular chain of processes exists, where each process holds a resource needed by the next',
        type: 'text',
      },
      {
        id: 2,
        title: 'Breaking the Conditions',
        content: 'To prevent deadlock, you only need to break ONE of these conditions. This forms the basis of deadlock prevention strategies.',
        type: 'text',
      },
      {
        id: 3,
        title: 'Quiz: Deadlock Conditions',
        content: 'Test your knowledge',
        type: 'quiz',
        quizQuestion: 'How many conditions must be true for deadlock to occur?',
        quizOptions: ['At least 1', 'At least 2', 'At least 3', 'All 4 conditions'],
        correctAnswer: 3,
      },
    ],
  },
  {
    id: 3,
    title: 'Resource Allocation Graph',
    description: 'Master the visual representation of resource allocation and deadlock detection',
    duration: '20 min',
    difficulty: 'Intermediate',
    icon: GitBranch,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    completed: false,
    locked: false,
    sections: [
      {
        id: 1,
        title: 'Graph Components',
        content: 'A Resource Allocation Graph (RAG) consists of:\n\n• **Processes (circles)**: Represented as circular nodes\n• **Resources (squares)**: Represented as rectangular nodes\n• **Request Edges (P → R)**: Process requests a resource\n• **Assignment Edges (R → P)**: Resource is allocated to a process',
        type: 'text',
      },
      {
        id: 2,
        title: 'Detecting Cycles',
        content: 'If the RAG contains a cycle:\n- With single-instance resources → Deadlock EXISTS\n- With multiple-instance resources → Deadlock MAY exist (need further analysis)',
        type: 'text',
      },
      {
        id: 3,
        title: 'Example Code',
        content: 'Here\'s how to represent a simple RAG:',
        type: 'code',
        codeExample: `// Process-Resource allocation
const processes = [
  { id: 'P1', holds: ['R1'], requests: ['R2'] },
  { id: 'P2', holds: ['R2'], requests: ['R1'] }
];

// This creates a cycle: P1 → R2 → P2 → R1 → P1
// Deadlock detected!`,
      },
    ],
  },
  {
    id: 4,
    title: 'Deadlock Detection Algorithms',
    description: 'Learn cycle detection and Banker\'s algorithm for deadlock detection',
    duration: '25 min',
    difficulty: 'Intermediate',
    icon: Code,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    completed: false,
    locked: false,
    sections: [
      {
        id: 1,
        title: 'Cycle Detection (Single Instance)',
        content: 'For single-instance resources, use Depth-First Search (DFS) to detect cycles in the RAG. A cycle directly indicates deadlock.',
        type: 'text',
      },
      {
        id: 2,
        title: 'DFS Algorithm',
        content: 'Cycle detection using DFS:',
        type: 'code',
        codeExample: `function detectCycle(graph) {
  const visited = new Set();
  const recStack = new Set();
  
  function dfs(node) {
    visited.add(node);
    recStack.add(node);
    
    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle found!
      }
    }
    
    recStack.delete(node);
    return false;
  }
  
  for (let node in graph) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }
  return false;
}`,
      },
      {
        id: 3,
        title: 'Banker\'s Algorithm',
        content: 'For multiple-instance resources, Banker\'s algorithm checks if the system is in a safe state by finding a safe sequence of process execution.',
        type: 'text',
      },
    ],
  },
  {
    id: 5,
    title: 'Deadlock Prevention',
    description: 'Strategies to design systems that never enter a deadlocked state',
    duration: '20 min',
    difficulty: 'Advanced',
    icon: Lock,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    completed: false,
    locked: true,
    sections: [
      {
        id: 1,
        title: 'Prevention Strategies',
        content: 'Prevent deadlock by breaking one of the four necessary conditions:\n\n1. **Mutual Exclusion**: Make resources sharable (not always possible)\n2. **Hold and Wait**: Require processes to request all resources at once\n3. **No Preemption**: Allow forcible resource preemption\n4. **Circular Wait**: Impose ordering on resource requests',
        type: 'text',
      },
      {
        id: 2,
        title: 'Resource Ordering',
        content: 'Implementation example:',
        type: 'code',
        codeExample: `// Assign numbers to resources
const resourceOrder = { R1: 1, R2: 2, R3: 3 };

// Processes must request in increasing order
function requestResource(process, resource) {
  const lastResource = process.lastRequested;
  if (resourceOrder[resource] <= lastResource) {
    throw new Error('Must request in order!');
  }
  // Grant resource...
}`,
      },
    ],
  },
  {
    id: 6,
    title: 'Deadlock Avoidance',
    description: 'Runtime techniques to avoid deadlock using resource allocation state',
    duration: '25 min',
    difficulty: 'Advanced',
    icon: Workflow,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    completed: false,
    locked: true,
    sections: [
      {
        id: 1,
        title: 'Safe State',
        content: 'A system is in a SAFE state if there exists a sequence of process executions that allows all processes to complete without deadlock. Avoidance ensures the system never leaves a safe state.',
        type: 'text',
      },
      {
        id: 2,
        title: 'Banker\'s Algorithm Implementation',
        content: 'Check if granting a request keeps system safe:',
        type: 'code',
        codeExample: `function isSafe(available, max, allocation) {
  const need = calculateNeed(max, allocation);
  const work = [...available];
  const finish = new Array(processes.length).fill(false);
  
  while (true) {
    let found = false;
    for (let i = 0; i < processes.length; i++) {
      if (!finish[i] && canFinish(need[i], work)) {
        work = add(work, allocation[i]);
        finish[i] = true;
        found = true;
      }
    }
    if (!found) break;
  }
  
  return finish.every(f => f); // All processes can finish
}`,
      },
    ],
  },
  {
    id: 7,
    title: 'Recovery Techniques',
    description: 'Methods to recover from deadlock once it has been detected',
    duration: '20 min',
    difficulty: 'Advanced',
    icon: Database,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    completed: false,
    locked: true,
    sections: [
      {
        id: 1,
        title: 'Recovery Methods',
        content: '**1. Process Termination**\n- Abort all deadlocked processes\n- Abort one process at a time\n\n**2. Resource Preemption**\n- Select a victim process\n- Rollback the process\n- Prevent starvation\n\n**3. Checkpoint & Rollback**\n- Save system state periodically\n- Roll back to safe checkpoint',
        type: 'text',
      },
      {
        id: 2,
        title: 'Victim Selection',
        content: 'Choose victim based on:\n• Minimum cost\n• Least resources held\n• Lowest priority\n• Least execution time\n• Fewest rollbacks (avoid starvation)',
        type: 'text',
      },
    ],
  },
  {
    id: 8,
    title: 'Real-World Case Studies',
    description: 'Analyze famous deadlock incidents and their solutions',
    duration: '30 min',
    difficulty: 'Advanced',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    completed: false,
    locked: true,
    sections: [
      {
        id: 1,
        title: 'Database Deadlocks',
        content: 'In database systems, transaction deadlocks occur when two transactions wait for each other to release locks. Modern databases detect these using wait-for graphs and automatically abort one transaction.',
        type: 'text',
      },
      {
        id: 2,
        title: 'Operating System Examples',
        content: 'Windows and Linux handle deadlocks differently:\n\n• **Windows**: Uses timeout-based detection\n• **Linux**: Employs lock ordering and trylock mechanisms',
        type: 'text',
      },
    ],
  },
];

export default function LearningCenter() {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const completedCount = tutorials.filter(t => t.completed).length;
  const progress = (completedCount / tutorials.length) * 100;

  const handleStartTutorial = (tutorial: Tutorial) => {
    if (tutorial.locked) {
      alert('Complete previous tutorials to unlock this one!');
      return;
    }
    setSelectedTutorial(tutorial);
    setCurrentSection(0);
    setShowAnswer(false);
    setSelectedAnswer(null);
  };

  const handleNextSection = () => {
    if (!selectedTutorial) return;
    
    if (currentSection < selectedTutorial.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    } else {
      // Complete tutorial
      selectedTutorial.completed = true;
      setSelectedTutorial(null);
      setCurrentSection(0);
      
      // Unlock next tutorial
      const currentIndex = tutorials.findIndex(t => t.id === selectedTutorial.id);
      if (currentIndex < tutorials.length - 1) {
        tutorials[currentIndex + 1].locked = false;
      }
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setShowAnswer(false);
      setSelectedAnswer(null);
    }
  };

  const currentSectionData = selectedTutorial?.sections[currentSection];

  const difficultyColors = {
    Beginner: { bg: 'bg-green-100', text: 'text-green-700' },
    Intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    Advanced: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Learning Center</h1>
          <p className="text-text-secondary mt-1">
            Master deadlock concepts through interactive tutorials
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-text-secondary">Progress</p>
            <p className="text-2xl font-bold text-primary-600">{progress.toFixed(0)}%</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Total Tutorials</p>
              <p className="text-2xl font-bold text-blue-900">{tutorials.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Certificates</p>
              <p className="text-2xl font-bold text-purple-900">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Viewer */}
      {selectedTutorial && (
        <div className="card animate-fadeInUp">
          {/* Tutorial Header */}
          <div className="border-b border-border pb-4 mb-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  {selectedTutorial.title}
                </h2>
                <p className="text-text-secondary">{selectedTutorial.description}</p>
              </div>
              <button
                onClick={() => setSelectedTutorial(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className={`badge ${difficultyColors[selectedTutorial.difficulty].bg} ${difficultyColors[selectedTutorial.difficulty].text}`}>
                {selectedTutorial.difficulty}
              </span>
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {selectedTutorial.duration}
              </span>
              <span className="text-sm text-text-secondary">
                Section {currentSection + 1} of {selectedTutorial.sections.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${((currentSection + 1) / selectedTutorial.sections.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Section Content */}
          {currentSectionData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-text-primary mb-4">
                  {currentSectionData.title}
                </h3>

                {currentSectionData.type === 'text' && (
                  <div className="prose max-w-none">
                    <p className="text-text-secondary whitespace-pre-line leading-relaxed">
                      {currentSectionData.content}
                    </p>
                  </div>
                )}

                {currentSectionData.type === 'code' && (
                  <div>
                    <p className="text-text-secondary mb-4">{currentSectionData.content}</p>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <pre className="text-green-400 text-sm font-mono">
                        <code>{currentSectionData.codeExample}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {currentSectionData.type === 'quiz' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-lg font-medium text-text-primary mb-4">
                      {currentSectionData.quizQuestion}
                    </p>
                    <div className="space-y-3">
                      {currentSectionData.quizOptions?.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSelectedAnswer(index);
                            setShowAnswer(true);
                          }}
                          disabled={showAnswer}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            showAnswer
                              ? index === currentSectionData.correctAnswer
                                ? 'border-green-500 bg-green-50'
                                : index === selectedAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 bg-white opacity-50'
                              : selectedAnswer === index
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 bg-white hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              showAnswer && index === currentSectionData.correctAnswer
                                ? 'border-green-500 bg-green-500'
                                : showAnswer && index === selectedAnswer
                                ? 'border-red-500 bg-red-500'
                                : selectedAnswer === index
                                ? 'border-primary-500 bg-primary-500'
                                : 'border-gray-300'
                            }`}>
                              {showAnswer && index === currentSectionData.correctAnswer && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {showAnswer && (
                      <div className={`mt-4 p-4 rounded-lg ${
                        selectedAnswer === currentSectionData.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedAnswer === currentSectionData.correctAnswer
                          ? '✓ Correct! Great job!'
                          : '✗ Not quite. The correct answer is highlighted above.'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-border">
                <button
                  onClick={handlePreviousSection}
                  disabled={currentSection === 0}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  {selectedTutorial.sections.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentSection
                          ? 'bg-primary-600 w-8'
                          : index < currentSection
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={handleNextSection}
                  className="btn btn-primary"
                  disabled={currentSectionData.type === 'quiz' && !showAnswer}
                >
                  {currentSection === selectedTutorial.sections.length - 1 ? 'Complete' : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tutorial Grid */}
      {!selectedTutorial && (
        <div>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Available Tutorials</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tutorials.map((tutorial, index) => {
              const Icon = tutorial.icon;
              const colors = difficultyColors[tutorial.difficulty];

              return (
                <div
                  key={tutorial.id}
                  className={`card transition-all duration-300 ${
                    tutorial.locked ? 'opacity-50' : 'hover-lift cursor-pointer'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleStartTutorial(tutorial)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${tutorial.bgColor} ${tutorial.color} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      {tutorial.locked ? (
                        <Lock className="w-8 h-8" />
                      ) : tutorial.completed ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        <Icon className="w-8 h-8" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-bold text-text-primary">
                          {tutorial.title}
                        </h3>
                        {tutorial.completed && (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-text-secondary mb-3">
                        {tutorial.description}
                      </p>

                      <div className="flex items-center gap-3 mb-3">
                        <span className={`badge ${colors.bg} ${colors.text}`}>
                          {tutorial.difficulty}
                        </span>
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {tutorial.duration}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {tutorial.sections.length} sections
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTutorial(tutorial);
                        }}
                        disabled={tutorial.locked}
                        className={`btn w-full ${
                          tutorial.completed
                            ? 'btn-secondary'
                            : 'btn-primary'
                        }`}
                      >
                        {tutorial.completed ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Review
                          </>
                        ) : tutorial.locked ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Locked
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-4 h-4" />
                            Start Tutorial
                          </>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Learning Path */}
      {!selectedTutorial && (
        <div className="card animate-fadeInUp">
          <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
            Your Learning Path
          </h3>
          <div className="space-y-3">
            {tutorials.slice(0, 4).map((tutorial, index) => (
              <div
                key={tutorial.id}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  tutorial.completed
                    ? 'bg-green-50 border border-green-200'
                    : tutorial.locked
                    ? 'bg-gray-50 border border-gray-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                <div className="text-2xl font-bold text-text-secondary">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-text-primary">{tutorial.title}</p>
                  <p className="text-sm text-text-secondary">{tutorial.duration}</p>
                </div>
                {tutorial.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : tutorial.locked ? (
                  <Lock className="w-6 h-6 text-gray-400" />
                ) : (
                  <PlayCircle className="w-6 h-6 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
