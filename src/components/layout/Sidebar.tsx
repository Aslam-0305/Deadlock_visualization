import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlayCircle,
  GitBranch,
  Search,
  Shield,
  BarChart3,
  Trophy,
  BookOpen,
  Info,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/simulator', icon: PlayCircle, label: 'Live Simulator' },
  { path: '/graph', icon: GitBranch, label: 'Resource Graph' },
  { path: '/detection', icon: Search, label: 'Detection Engine' },
  { path: '/recovery', icon: Shield, label: 'Recovery Center' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/challenge', icon: Trophy, label: 'Challenge Mode' },
  { path: '/learning', icon: BookOpen, label: 'Learning Center' },
  { path: '/about', icon: Info, label: 'About Project' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col animate-slideInLeft">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 animate-fadeIn">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl flex items-center justify-center animate-pulse-slow">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">DEADLOCKX</h1>
            <p className="text-xs text-text-secondary">Detect. Visualize. Recover.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li 
                key={item.path}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium shadow-sm'
                      : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'animate-pulse-slow' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border animate-fadeIn">
        <div className="text-xs text-text-secondary text-center">
          <p>© 2024 DEADLOCKX</p>
          <p className="mt-1">OS Project Demo</p>
        </div>
      </div>
    </aside>
  );
}
