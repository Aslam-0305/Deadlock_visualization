import { useLocation } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';
import { Bell, User, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/':          'Dashboard',
  '/simulator': 'Live Simulator',
  '/graph':     'Resource Allocation Graph',
  '/detection': 'Detection Engine',
  '/recovery':  'Recovery Center',
  '/analytics': 'Analytics',
  '/challenge': 'Challenge Mode',
  '/learning':  'Learning Center',
  '/about':     'About Project',
};

export default function Header() {
  const location   = useLocation();
  const systemState = useSimulationStore(s => s.systemState);
  const events      = useSimulationStore(s => s.events);
  const pageTitle   = pageTitles[location.pathname] || 'DEADLOCKX';

  const unread = events.filter(e =>
    e.type === 'deadlock_detected' || e.type === 'process_terminated'
  ).length;

  const statusCfg = {
    safe:      { icon: CheckCircle,  text: 'SAFE',       bg: 'rgba(22,163,74,0.12)',  color: '#15803D',  border: 'rgba(22,163,74,0.3)'  },
    unsafe:    { icon: AlertTriangle,text: 'UNSAFE',     bg: 'rgba(217,119,6,0.12)',  color: '#B45309',  border: 'rgba(217,119,6,0.35)' },
    deadlocked:{ icon: AlertCircle,  text: 'DEADLOCKED', bg: 'rgba(220,38,38,0.12)',  color: '#B91C1C',  border: 'rgba(220,38,38,0.35)' },
  }[systemState] ?? { icon: CheckCircle, text: 'SAFE', bg: 'rgba(22,163,74,0.12)', color: '#15803D', border: 'rgba(22,163,74,0.3)' };

  const StatusIcon = statusCfg.icon;

  return (
    <header
      className="h-16 flex items-center justify-between px-6"
      style={{
        background: 'white',
        borderBottom: '1px solid #C8D8DA',
        boxShadow: '0 1px 4px rgba(22,38,35,0.06)',
      }}
    >
      {/* Page title */}
      <div>
        <h2 className="text-xl font-semibold" style={{ color: '#162623' }}>{pageTitle}</h2>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* System status pill */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all"
          style={{
            background: statusCfg.bg,
            color:      statusCfg.color,
            border:     `1px solid ${statusCfg.border}`,
          }}
        >
          <StatusIcon className="w-4 h-4" />
          {statusCfg.text}
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: '#577877' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#E4ECEE')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* User avatar */}
        <button
          className="flex items-center p-1 rounded-lg transition-colors"
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#E4ECEE')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#295255' }}
          >
            <User className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
    </header>
  );
}
