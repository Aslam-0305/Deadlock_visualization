import { useLocation } from 'react-router-dom';
import { useSimulationStore } from '../../store/simulationStore';
import { Bell, User, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/simulator': 'Live Simulator',
  '/graph': 'Resource Allocation Graph',
  '/detection': 'Detection Engine',
  '/recovery': 'Recovery Center',
  '/analytics': 'Analytics',
  '/challenge': 'Challenge Mode',
  '/learning': 'Learning Center',
  '/about': 'About Project',
};

export default function Header() {
  const location = useLocation();
  const systemState = useSimulationStore((state) => state.systemState);
  const events = useSimulationStore((state) => state.events);
  const pageTitle = pageTitles[location.pathname] || 'DEADLOCKX';

  const unreadNotifications = events.filter(e => 
    e.type === 'deadlock_detected' || e.type === 'process_terminated'
  ).length;

  const getStatusConfig = () => {
    switch (systemState) {
      case 'safe':
        return {
          icon: CheckCircle,
          text: 'SAFE',
          className: 'bg-green-100 text-success-600 border-green-200',
        };
      case 'unsafe':
        return {
          icon: AlertTriangle,
          text: 'UNSAFE',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
      case 'deadlocked':
        return {
          icon: AlertCircle,
          text: 'DEADLOCKED',
          className: 'bg-red-100 text-danger-600 border-red-200',
        };
      default:
        return {
          icon: CheckCircle,
          text: 'SAFE',
          className: 'bg-green-100 text-success-600 border-green-200',
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-semibold text-text-primary">{pageTitle}</h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* System Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${status.className}`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.text}</span>
        </div>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-background-secondary rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-text-secondary" />
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* User Profile */}
        <button className="flex items-center gap-2 p-2 hover:bg-background-secondary rounded-lg transition-colors">
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-600" />
          </div>
        </button>
      </div>
    </header>
  );
}
