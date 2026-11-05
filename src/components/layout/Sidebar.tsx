import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, PlayCircle, GitBranch, Search,
  Shield, BarChart3, Trophy, BookOpen, Info,
} from 'lucide-react';

const navItems = [
  { path: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/simulator', icon: PlayCircle,       label: 'Live Simulator' },
  { path: '/graph',     icon: GitBranch,        label: 'Resource Graph' },
  { path: '/detection', icon: Search,           label: 'Detection Engine' },
  { path: '/recovery',  icon: Shield,           label: 'Recovery Center' },
  { path: '/analytics', icon: BarChart3,        label: 'Analytics' },
  { path: '/challenge', icon: Trophy,           label: 'Challenge Mode' },
  { path: '/learning',  icon: BookOpen,         label: 'Learning Center' },
  { path: '/about',     icon: Info,             label: 'About Project' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-64 flex flex-col animate-slideInRight"
      style={{ background: '#162623', boxShadow: '2px 0 16px rgba(22,38,35,0.25)' }}
    >
      {/* Logo */}
      <div className="p-6" style={{ borderBottom: '1px solid rgba(87,120,119,0.3)' }}>
        <div className="flex items-center gap-3 animate-fadeIn">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse-slow"
            style={{ background: 'linear-gradient(135deg, #295255, #577877)' }}
          >
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">DEADLOCKX</h1>
            <p className="text-xs" style={{ color: '#8AABA9' }}>Detect. Visualize. Recover.</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <ul className="space-y-0.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li
                key={item.path}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: '#295255',
                          color: '#F0F5F7',
                          fontWeight: 600,
                          boxShadow: '0 2px 8px rgba(41,82,85,0.4)',
                        }
                      : {
                          color: '#8AABA9',
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(41,82,85,0.35)';
                      (e.currentTarget as HTMLElement).style.color = '#F0F5F7';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#8AABA9';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <Icon
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: isActive ? '#F0F5F7' : '#577877' }}
                  />
                  <span className="text-sm">{item.label}</span>
                  {isActive && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: '#F0F5F7' }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 animate-fadeIn" style={{ borderTop: '1px solid rgba(87,120,119,0.3)' }}>
        <div className="text-center text-xs" style={{ color: '#577877' }}>
          <p>© 2024 DEADLOCKX</p>
          <p className="mt-0.5">OS Project Demo</p>
        </div>
      </div>
    </aside>
  );
}
