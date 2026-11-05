import { useSimulationStore } from '../store/simulationStore';
import {
  Cpu,
  HardDrive,
  Activity,
  Package,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const processes = useSimulationStore((state) => state.processes);
  const resources = useSimulationStore((state) => state.resources);
  const edges = useSimulationStore((state) => state.edges);
  const systemState = useSimulationStore((state) => state.systemState);
  const events = useSimulationStore((state) => state.events);
  const totalDeadlocksDetected = useSimulationStore((state) => state.totalDeadlocksDetected);

  const stats = [
    {
      title: 'Total Processes',
      value: processes.length,
      icon: Cpu,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      change: '+2 today',
    },
    {
      title: 'Total Resources',
      value: resources.length,
      icon: HardDrive,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      change: '+1 today',
    },
    {
      title: 'Active Requests',
      value: edges.filter(e => e.type === 'request').length,
      icon: Activity,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      change: `${edges.filter(e => e.type === 'request').length} pending`,
    },
    {
      title: 'Allocated Resources',
      value: edges.filter(e => e.type === 'allocation').length,
      icon: Package,
      color: 'text-success-600',
      bgColor: 'bg-green-50',
      change: `${resources.reduce((sum, r) => sum + (r.totalInstances - r.availableInstances), 0)} instances`,
    },
    {
      title: 'Deadlocks Detected',
      value: totalDeadlocksDetected,
      icon: AlertCircle,
      color: 'text-danger-600',
      bgColor: 'bg-red-50',
      change: systemState === 'deadlocked' ? 'Active now' : 'None active',
    },
    {
      title: 'System Status',
      value: systemState.toUpperCase(),
      icon: TrendingUp,
      color: systemState === 'safe' ? 'text-success-600' : systemState === 'unsafe' ? 'text-yellow-600' : 'text-danger-600',
      bgColor: systemState === 'safe' ? 'bg-green-50' : systemState === 'unsafe' ? 'bg-yellow-50' : 'bg-red-50',
      change: 'Real-time',
    },
  ];

  // Sample data for charts
  const resourceUtilizationData = resources.map(r => ({
    name: r.name,
    used: r.totalInstances - r.availableInstances,
    available: r.availableInstances,
  }));

  const activityData = events.slice(0, 10).reverse().map((e, i) => ({
    name: `T${i + 1}`,
    events: 1,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="stat-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-text-secondary mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-text-primary mb-2 transition-all duration-300">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-text-secondary">{stat.change}</p>
                </div>
                <div className={`stat-icon ${stat.bgColor} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Utilization */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Resource Utilization</h3>
          {resourceUtilizationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px' 
                  }} 
                />
                <Bar dataKey="used" fill="#2563EB" name="Used" />
                <Bar dataKey="available" fill="#06B6D4" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">
              No resources to display
            </div>
          )}
        </div>

        {/* Process Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Process Activity</h3>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px' 
                  }} 
                />
                <Line type="monotone" dataKey="events" stroke="#7C3AED" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">
              No activity to display
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'deadlock_detected' ? 'bg-danger-500' :
                  event.type === 'process_terminated' ? 'bg-yellow-500' :
                  'bg-primary-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary">{event.description}</p>
                  <p className="text-xs text-text-secondary mt-1">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p className="text-center text-text-secondary py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* System Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Resource Efficiency</span>
                <span className="text-text-primary font-medium">
                  {resources.length > 0 
                    ? Math.round((resources.reduce((sum, r) => sum + (r.totalInstances - r.availableInstances), 0) / 
                        resources.reduce((sum, r) => sum + r.totalInstances, 0)) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-background-secondary rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: resources.length > 0 
                      ? `${Math.round((resources.reduce((sum, r) => sum + (r.totalInstances - r.availableInstances), 0) / 
                          resources.reduce((sum, r) => sum + r.totalInstances, 0)) * 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Process Load</span>
                <span className="text-text-primary font-medium">
                  {processes.length > 0 ? Math.min(processes.length * 20, 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-background-secondary rounded-full h-2">
                <div 
                  className="bg-violet-600 h-2 rounded-full transition-all"
                  style={{ width: `${processes.length > 0 ? Math.min(processes.length * 20, 100) : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">System Health</span>
                <span className="text-text-primary font-medium">
                  {systemState === 'safe' ? '100%' : systemState === 'unsafe' ? '60%' : '20%'}
                </span>
              </div>
              <div className="w-full bg-background-secondary rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    systemState === 'safe' ? 'bg-success-600' :
                    systemState === 'unsafe' ? 'bg-yellow-500' :
                    'bg-danger-600'
                  }`}
                  style={{ 
                    width: systemState === 'safe' ? '100%' : systemState === 'unsafe' ? '60%' : '20%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-text-secondary">Avg Response</p>
              <p className="text-lg font-semibold text-text-primary">~50ms</p>
            </div>
            <div className="p-3 bg-background-secondary rounded-lg">
              <p className="text-xs text-text-secondary">Uptime</p>
              <p className="text-lg font-semibold text-text-primary">99.9%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deadlock Alert */}
      {systemState === 'deadlocked' && (
        <div className="card bg-red-50 border-danger-200 animate-fadeInDown">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-1 animate-pulse" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-danger-600 mb-2">Deadlock Detected!</h3>
              <p className="text-sm text-danger-700 mb-4">
                The system has detected a deadlock condition. Immediate action required to restore system stability.
              </p>
              <div className="flex gap-3">
                <button className="btn btn-danger text-sm">View Detection</button>
                <button className="btn btn-outline text-sm border-danger-600 text-danger-600 hover:bg-danger-50">
                  Recovery Options
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
