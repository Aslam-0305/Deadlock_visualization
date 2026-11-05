import {
  Code,
  Zap,
  Shield,
  Users,
  Mail,
  ExternalLink,
  BookOpen,
  Target,
  Trophy,
  Heart,
  CheckCircle,
  Cpu,
  GitBranch,
} from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Live Simulation',
    description: 'Real-time deadlock simulation with process and resource management',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Target,
    title: 'Smart Detection',
    description: 'Cycle detection and Banker\'s algorithm for accurate deadlock identification',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Cpu,
    title: 'Interactive RAG',
    description: 'Visual resource allocation graphs with drag-and-drop functionality',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Shield,
    title: 'Recovery Methods',
    description: 'Process termination, resource preemption, and checkpoint rollback',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Trophy,
    title: 'Challenge Mode',
    description: '10+ scenarios with scoring system to test your skills',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: BookOpen,
    title: 'Learning Center',
    description: 'Interactive tutorials covering all deadlock concepts',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
];

const techStack = [
  { name: 'React', icon: '⚛️', description: 'UI framework with TypeScript' },
  { name: 'Tailwind CSS', icon: '🎨', description: 'Utility-first styling' },
  { name: 'Zustand', icon: '🐻', description: 'State management' },
  { name: 'React Flow', icon: '🔀', description: 'Graph visualization' },
  { name: 'Recharts', icon: '📊', description: 'Data visualization' },
  { name: 'Framer Motion', icon: '✨', description: 'Smooth animations' },
  { name: 'Vite', icon: '⚡', description: 'Fast build tool' },
  { name: 'Lucide React', icon: '🎯', description: 'Icon library' },
];

const teamMembers = [
  {
    name: 'Project Team',
    role: 'Operating Systems Course',
    bio: 'Built as a comprehensive educational tool for understanding deadlock concepts',
    avatar: '👥',
  },
];

const stats = [
  { label: 'Lines of Code', value: '5000+', icon: Code },
  { label: 'Components', value: '25+', icon: GitBranch },
  { label: 'Features', value: '9', icon: Zap },
  { label: 'Tutorials', value: '8', icon: BookOpen },
];

export default function About() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-fadeInDown">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-violet-600 rounded-2xl mb-4 shadow-lg animate-pulse-slow">
          <GitBranch className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-text-primary mb-2">DEADLOCKX</h1>
        <p className="text-xl text-text-secondary mb-4">
          Enterprise-Grade Deadlock Detection & Recovery Simulator
        </p>
        <p className="text-text-secondary max-w-2xl mx-auto">
          An intelligent, interactive platform designed to help students and professionals master
          operating system deadlock concepts through visualization, simulation, and hands-on learning.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="stat-card text-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-text-primary mb-1">{stat.value}</p>
              <p className="text-sm text-text-secondary">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Mission Statement */}
      <div className="card bg-gradient-to-br from-primary-50 to-violet-50 border-primary-200 animate-fadeInUp">
        <div className="flex items-start gap-4">
          <div className="bg-primary-600 text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Our Mission</h2>
            <p className="text-text-secondary leading-relaxed">
              To make complex operating system concepts accessible and engaging through interactive
              visualizations and real-world simulations. DEADLOCKX transforms abstract deadlock theory
              into tangible, hands-on learning experiences that prepare students and professionals
              for real-world system design challenges.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="card hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`${feature.bgColor} ${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="card animate-fadeInUp">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <Code className="w-6 h-6 text-primary-600" />
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {techStack.map((tech, index) => (
            <div
              key={index}
              className="p-4 bg-background-secondary rounded-lg hover:bg-primary-50 hover:shadow-md transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">{tech.icon}</div>
              <h4 className="font-semibold text-text-primary text-sm mb-1">{tech.name}</h4>
              <p className="text-xs text-text-secondary">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 animate-fadeInUp">
        <h2 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          What You'll Learn
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Deadlock necessary conditions and prevention',
            'Resource Allocation Graph (RAG) analysis',
            'Cycle detection algorithms (DFS)',
            'Banker\'s algorithm for safe state detection',
            'Process termination strategies',
            'Resource preemption techniques',
            'Checkpoint and rollback mechanisms',
            'Real-world deadlock scenarios',
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-text-secondary">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card hover-lift animate-fadeInUp">
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">For Students</h3>
          <p className="text-text-secondary mb-4">
            Master operating systems concepts with interactive simulations, visual learning aids,
            and challenge modes that make complex theory easy to understand.
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Study for exams with hands-on practice</li>
            <li>• Visualize abstract concepts</li>
            <li>• Complete challenges for skill validation</li>
          </ul>
        </div>

        <div className="card hover-lift animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">For Professionals</h3>
          <p className="text-text-secondary mb-4">
            Refresh your knowledge of concurrency control, system design, and debugging techniques
            for distributed systems and multi-threaded applications.
          </p>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Interview preparation resource</li>
            <li>• System design reference</li>
            <li>• Debugging pattern recognition</li>
          </ul>
        </div>
      </div>

      {/* Team Section */}
      <div className="card animate-fadeInUp">
        <h2 className="text-2xl font-bold text-text-primary mb-4">About the Project</h2>
        <div className="flex items-start gap-6">
          <div className="text-6xl">{teamMembers[0].avatar}</div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-text-primary mb-1">
              {teamMembers[0].name}
            </h3>
            <p className="text-primary-600 mb-3">{teamMembers[0].role}</p>
            <p className="text-text-secondary mb-4">{teamMembers[0].bio}</p>
            <p className="text-sm text-text-secondary">
              This project was developed as part of an Operating Systems course to demonstrate
              understanding of deadlock concepts and create an educational resource for future students.
            </p>
          </div>
        </div>
      </div>

      {/* GitHub & Links */}
      <div className="card bg-gradient-to-br from-gray-900 to-gray-800 text-white animate-fadeInUp">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <GitBranch className="w-6 h-6" />
              Open Source
            </h2>
            <p className="text-gray-300 mb-4">
              Contribute to DEADLOCKX on GitHub. Star the repo, report issues, or submit pull requests!
            </p>
            <a
              href="https://github.com/Aslam-0305/Deadlock_visualization"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-all"
            >
              <GitBranch className="w-4 h-4" />
              View on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="hidden md:block text-6xl">
            🚀
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center animate-fadeInUp">
          <div className="bg-red-100 text-red-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-text-primary mb-2">Built with Passion</h4>
          <p className="text-sm text-text-secondary">
            Crafted with attention to detail and love for teaching
          </p>
        </div>

        <div className="card text-center animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-text-primary mb-2">Free & Open</h4>
          <p className="text-sm text-text-secondary">
            100% free to use for educational purposes
          </p>
        </div>

        <div className="card text-center animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="bg-green-100 text-green-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6" />
          </div>
          <h4 className="font-semibold text-text-primary mb-2">Always Improving</h4>
          <p className="text-sm text-text-secondary">
            Continuously updated with new features
          </p>
        </div>
      </div>

      {/* Version & Credits */}
      <div className="text-center py-6 border-t border-border">
        <p className="text-text-secondary text-sm mb-2">
          DEADLOCKX v1.0.0 • 2024
        </p>
        <p className="text-text-secondary text-xs">
          Made for students, by students. Powered by React, TypeScript, and modern web technologies.
        </p>
      </div>
    </div>
  );
}
