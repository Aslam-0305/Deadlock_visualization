import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  Trophy,
  Star,
  Clock,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Award,
  TrendingUp,
  Flame,
  Lock,
  Unlock,
  Medal,
  Timer,
} from 'lucide-react';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  timeLimit: number; // seconds
  maxScore: number;
  locked: boolean;
  scenario: {
    processes: number;
    resources: { name: string; instances: number }[];
    allocations: { process: number; resource: number }[];
    requests: { process: number; resource: number }[];
  };
  objectives: string[];
  hints: string[];
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Simple Deadlock Detection',
    description: 'Detect a basic circular wait between two processes',
    difficulty: 'easy',
    timeLimit: 120,
    maxScore: 100,
    locked: false,
    scenario: {
      processes: 2,
      resources: [
        { name: 'R1', instances: 1 },
        { name: 'R2', instances: 1 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 1 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 0 },
      ],
    },
    objectives: ['Detect the deadlock', 'Identify both deadlocked processes', 'Find the circular wait cycle'],
    hints: ['Check if P1 is waiting for P2 and vice versa', 'Look at resource allocation graph'],
  },
  {
    id: 2,
    title: 'Three-Way Deadlock',
    description: 'Resolve a circular wait involving three processes',
    difficulty: 'easy',
    timeLimit: 180,
    maxScore: 150,
    locked: false,
    scenario: {
      processes: 3,
      resources: [
        { name: 'R1', instances: 1 },
        { name: 'R2', instances: 1 },
        { name: 'R3', instances: 1 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 1 },
        { process: 2, resource: 2 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 2 },
        { process: 2, resource: 0 },
      ],
    },
    objectives: ['Detect the 3-process deadlock', 'Choose optimal recovery method', 'Minimize terminated processes'],
    hints: ['Forms a triangle in RAG', 'Terminating any one process will break the cycle'],
  },
  {
    id: 3,
    title: 'Resource Abundance',
    description: 'Determine if deadlock can occur with multiple resource instances',
    difficulty: 'medium',
    timeLimit: 240,
    maxScore: 200,
    locked: false,
    scenario: {
      processes: 3,
      resources: [
        { name: 'R1', instances: 3 },
        { name: 'R2', instances: 2 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 0 },
        { process: 2, resource: 1 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 1 },
      ],
    },
    objectives: ['Use Banker\'s algorithm', 'Find safe sequence', 'Determine if system is safe'],
    hints: ['Multiple instances require matrix detection', 'Check available resources carefully'],
  },
  {
    id: 4,
    title: 'Recovery Master',
    description: 'Use preemption to resolve deadlock without termination',
    difficulty: 'medium',
    timeLimit: 300,
    maxScore: 250,
    locked: false,
    scenario: {
      processes: 4,
      resources: [
        { name: 'R1', instances: 1 },
        { name: 'R2', instances: 1 },
        { name: 'R3', instances: 1 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 1 },
        { process: 2, resource: 2 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 2 },
        { process: 2, resource: 0 },
      ],
    },
    objectives: ['Resolve without process termination', 'Use resource preemption', 'Minimize disrupted processes'],
    hints: ['Preempt resources strategically', 'Consider process priorities'],
  },
  {
    id: 5,
    title: 'Hidden Deadlock',
    description: 'Find a non-obvious deadlock in a complex system',
    difficulty: 'hard',
    timeLimit: 360,
    maxScore: 300,
    locked: false,
    scenario: {
      processes: 5,
      resources: [
        { name: 'R1', instances: 2 },
        { name: 'R2', instances: 1 },
        { name: 'R3', instances: 2 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 0 },
        { process: 2, resource: 1 },
        { process: 3, resource: 2 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 2, resource: 2 },
        { process: 3, resource: 1 },
      ],
    },
    objectives: ['Identify all deadlocked processes', 'Detect indirect circular wait', 'Apply optimal recovery'],
    hints: ['Not all processes are deadlocked', 'Trace resource dependencies carefully'],
  },
  {
    id: 6,
    title: 'Checkpoint Champion',
    description: 'Use checkpoints and rollback to prevent deadlock',
    difficulty: 'hard',
    timeLimit: 300,
    maxScore: 350,
    locked: true,
    scenario: {
      processes: 4,
      resources: [
        { name: 'R1', instances: 1 },
        { name: 'R2', instances: 1 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 1 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 0 },
      ],
    },
    objectives: ['Create checkpoint before deadlock', 'Roll back to safe state', 'Prevent deadlock reoccurrence'],
    hints: ['Save checkpoints early', 'Identify safe states'],
  },
  {
    id: 7,
    title: 'Resource Storm',
    description: 'Manage deadlock in high-contention scenario',
    difficulty: 'hard',
    timeLimit: 420,
    maxScore: 400,
    locked: true,
    scenario: {
      processes: 6,
      resources: [
        { name: 'R1', instances: 2 },
        { name: 'R2', instances: 2 },
        { name: 'R3', instances: 1 },
      ],
      allocations: [],
      requests: [],
    },
    objectives: ['Handle multiple deadlock points', 'Optimize resource allocation', 'Achieve 100% resolution rate'],
    hints: ['May require multiple recovery cycles', 'Priority matters'],
  },
  {
    id: 8,
    title: 'Speed Demon',
    description: 'Detect and resolve deadlock in under 30 seconds',
    difficulty: 'expert',
    timeLimit: 30,
    maxScore: 500,
    locked: true,
    scenario: {
      processes: 3,
      resources: [
        { name: 'R1', instances: 1 },
        { name: 'R2', instances: 1 },
        { name: 'R3', instances: 1 },
      ],
      allocations: [
        { process: 0, resource: 0 },
        { process: 1, resource: 1 },
        { process: 2, resource: 2 },
      ],
      requests: [
        { process: 0, resource: 1 },
        { process: 1, resource: 2 },
        { process: 2, resource: 0 },
      ],
    },
    objectives: ['Complete in under 30 seconds', 'Perfect detection accuracy', 'Optimal recovery choice'],
    hints: ['Every second counts', 'Know your algorithms'],
  },
  {
    id: 9,
    title: 'Matrix Mastery',
    description: 'Solve complex multi-instance resource deadlock',
    difficulty: 'expert',
    timeLimit: 480,
    maxScore: 450,
    locked: true,
    scenario: {
      processes: 5,
      resources: [
        { name: 'R1', instances: 4 },
        { name: 'R2', instances: 3 },
        { name: 'R3', instances: 2 },
      ],
      allocations: [],
      requests: [],
    },
    objectives: ['Use Banker\'s algorithm', 'Find all safe sequences', 'Prove system safety'],
    hints: ['Matrix calculations are key', 'Multiple solutions may exist'],
  },
  {
    id: 10,
    title: 'The Ultimate Challenge',
    description: 'Master all deadlock scenarios in one complex system',
    difficulty: 'expert',
    timeLimit: 600,
    maxScore: 1000,
    locked: true,
    scenario: {
      processes: 8,
      resources: [
        { name: 'R1', instances: 3 },
        { name: 'R2', instances: 2 },
        { name: 'R3', instances: 2 },
        { name: 'R4', instances: 1 },
      ],
      allocations: [],
      requests: [],
    },
    objectives: [
      'Detect multiple deadlock cycles',
      'Apply all recovery methods',
      'Achieve perfect score',
      'Complete within time limit',
    ],
    hints: ['Combine all strategies', 'Stay calm and systematic'],
  },
];

const difficultyColors = {
  easy: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  hard: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  expert: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
};

export default function ChallengeMode() {
  const { loadScenario, resetSimulation } = useSimulationStore();
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [score, setScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const [showHints, setShowHints] = useState(false);

  const totalScore = completedChallenges.reduce((sum, id) => {
    const challenge = challenges.find(c => c.id === id);
    return sum + (challenge?.maxScore || 0);
  }, 0);

  const handleStartChallenge = (challenge: Challenge) => {
    if (challenge.locked) {
      alert('Complete previous challenges to unlock this one!');
      return;
    }

    setSelectedChallenge(challenge);
    setIsActive(true);
    setTimeRemaining(challenge.timeLimit);
    setScore(0);
    setShowHints(false);

    // Load the challenge scenario
    resetSimulation();
    // Simulate loading scenario (in real implementation, this would configure the store)
  };

  const handleCompleteChallenge = () => {
    if (!selectedChallenge) return;

    const timeBonus = Math.floor((timeRemaining / selectedChallenge.timeLimit) * 100);
    const finalScore = selectedChallenge.maxScore + timeBonus;
    
    setScore(finalScore);
    setCompletedChallenges([...completedChallenges, selectedChallenge.id]);
    setIsActive(false);

    // Unlock next challenge
    if (selectedChallenge.id < challenges.length) {
      challenges[selectedChallenge.id].locked = false;
    }
  };

  const handleResetChallenge = () => {
    setIsActive(false);
    setSelectedChallenge(null);
    setScore(0);
    setTimeRemaining(0);
  };

  const getStars = (difficulty: Difficulty): number => {
    switch (difficulty) {
      case 'easy': return 1;
      case 'medium': return 2;
      case 'hard': return 3;
      case 'expert': return 5;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Challenge Mode</h1>
          <p className="text-text-secondary mt-1">
            Test your deadlock detection and recovery skills
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-text-secondary">Total Score</p>
            <p className="text-2xl font-bold text-primary-600">{totalScore}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700">Challenges</p>
              <p className="text-2xl font-bold text-blue-900">
                {completedChallenges.length}/{challenges.length}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-700">Completion</p>
              <p className="text-2xl font-bold text-green-900">
                {Math.round((completedChallenges.length / challenges.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-700">Best Score</p>
              <p className="text-2xl font-bold text-purple-900">
                {Math.max(...completedChallenges.map(id => challenges.find(c => c.id === id)?.maxScore || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700">Streak</p>
              <p className="text-2xl font-bold text-orange-900">{completedChallenges.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenge */}
      {isActive && selectedChallenge && (
        <div className="card bg-primary-50 border-primary-200 animate-fadeInUp">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-text-primary">{selectedChallenge.title}</h3>
                <span className={`badge ${difficultyColors[selectedChallenge.difficulty].bg} ${difficultyColors[selectedChallenge.difficulty].text}`}>
                  {selectedChallenge.difficulty.toUpperCase()}
                </span>
              </div>
              <p className="text-text-secondary">{selectedChallenge.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <Timer className="w-5 h-5 text-orange-600" />
                <span className="font-mono font-bold text-lg">
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <button onClick={handleResetChallenge} className="btn btn-secondary">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold mb-2">Objectives:</h4>
            <ul className="space-y-1">
              {selectedChallenge.objectives.map((obj, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={handleCompleteChallenge} className="btn btn-primary">
              <CheckCircle className="w-4 h-4" />
              Complete Challenge
            </button>
            <button onClick={() => setShowHints(!showHints)} className="btn btn-secondary">
              {showHints ? 'Hide' : 'Show'} Hints
            </button>
          </div>

          {showHints && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 animate-fadeIn">
              <h4 className="font-semibold text-yellow-800 mb-2">💡 Hints:</h4>
              <ul className="space-y-1">
                {selectedChallenge.hints.map((hint, idx) => (
                  <li key={idx} className="text-sm text-yellow-700">• {hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Challenge Grid */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Available Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => {
            const colors = difficultyColors[challenge.difficulty];
            const isCompleted = completedChallenges.includes(challenge.id);
            const stars = getStars(challenge.difficulty);

            return (
              <div
                key={challenge.id}
                className={`card transition-all duration-300 ${
                  challenge.locked
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover-lift cursor-pointer'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => !isActive && !challenge.locked && handleStartChallenge(challenge)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {challenge.locked ? (
                      <Lock className="w-5 h-5 text-text-secondary" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Unlock className="w-5 h-5 text-blue-600" />
                    )}
                    <span className="font-mono text-sm text-text-secondary">#{challenge.id}</span>
                  </div>
                  <div className="flex">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${isCompleted ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-text-primary mb-2">
                  {challenge.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {challenge.description}
                </p>

                {/* Difficulty Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge ${colors.bg} ${colors.text}`}>
                    {challenge.difficulty.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    {challenge.timeLimit}s
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium">{challenge.maxScore} pts</span>
                  </div>
                  {isCompleted ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      Completed
                    </span>
                  ) : challenge.locked ? (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Locked
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        !isActive && handleStartChallenge(challenge);
                      }}
                      className="btn btn-primary btn-sm"
                      disabled={isActive}
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="card animate-fadeInUp">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary">Your Progress</h3>
          <Medal className="w-6 h-6 text-yellow-600" />
        </div>
        
        <div className="space-y-2">
          {['easy', 'medium', 'hard', 'expert'].map((diff) => {
            const challengesInDiff = challenges.filter(c => c.difficulty === diff);
            const completedInDiff = challengesInDiff.filter(c => completedChallenges.includes(c.id));
            const percentage = (completedInDiff.length / challengesInDiff.length) * 100;
            const colors = difficultyColors[diff as Difficulty];

            return (
              <div key={diff} className="flex items-center gap-4">
                <div className="w-24">
                  <span className={`text-sm font-medium ${colors.text}`}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors.bg} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className="text-sm font-medium text-text-secondary">
                    {completedInDiff.length}/{challengesInDiff.length}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
