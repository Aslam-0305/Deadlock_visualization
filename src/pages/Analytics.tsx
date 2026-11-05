import { useState, useMemo } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  AlertCircle,
  Clock,
  Target,
  Zap,
  Calendar,
  Download,
  Filter,
  BarChart3,
} from 'lucide-react';

type TimeRange = '24h' | '7d' | '30d' | 'all';
type ChartType = 'line' | 'bar' | 'area';

export default function Analytics() {
  const {
    processes,
    resources,
    events,
    totalDeadlocksDetected,
    totalProcessesTerminated,
    totalResourcesPreempted,
    systemState,
  } = useSimulationStore();

  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [chartType, setChartType] = useState<ChartType>('area');

  // Generate mock historical data for visualization
  const historicalData = useMemo(() => {
    const now = Date.now();
    const data = [];
    const points = 20;
    
    for (let i = 0; i < points; i++) {
      const timestamp = now - (points - i) * 60000; // 1 minute intervals
      data.push({
        time: new Date(timestamp).toLocaleTimeString(),
        processes: Math.floor(Math.random() * 10) + processes.length,
        resources: Math.floor(Math.random() * 8) + resources.length,
        deadlocks: Math.floor(Math.random() * 3),
        utilization: Math.floor(Math.random() * 40) + 60,
      });
    }
    return data;
  }, [processes.length, resources.length]);

  // Event type distribution
  const eventDistribution = useMemo(() => {
    const distribution: Record<string, number> = {};
    events.forEach(event => {
      const type = event.type.replace(/_/g, ' ');
      distribution[type] = (distribution[type] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [events]);

  // Process status distribution
  const processStatusData = useMemo(() => {
    const statusCounts = {
      running: 0,
      blocked: 0,
      ready: 0,
      terminated: 0,
    };
    
    processes.forEach(process => {
      statusCounts[process.status]++;
    });
    
    return [
      { name: 'Running', value: statusCounts.running, color: '#10b981' },
      { name: 'Blocked', value: statusCounts.blocked, color: '#f59e0b' },
      { name: 'Ready', value: statusCounts.ready, color: '#3b82f6' },
      { name: 'Terminated', value: statusCounts.terminated, color: '#ef4444' },
    ].filter(item => item.value > 0);
  }, [processes]);

  // Resource utilization
  const resourceUtilization = useMemo(() => {
    return resources.map(resource => ({
      name: resource.id,
      total: resource.totalInstances,
      allocated: resource.totalInstances - resource.availableInstances,
      available: resource.availableInstances,
      utilization: Math.round(
        ((resource.totalInstances - resource.availableInstances) / resource.totalInstances) * 100
      ),
    }));
  }, [resources]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    const totalResources = resources.reduce((sum, r) => sum + r.totalInstances, 0);
    const allocatedResources = resources.reduce(
      (sum, r) => sum + (r.totalInstances - r.availableInstances),
      0
    );
    const avgUtilization = totalResources > 0 
      ? Math.round((allocatedResources / totalResources) * 100) 
      : 0;

    return [
      { subject: 'Processes', A: processes.length * 10, fullMark: 100 },
      { subject: 'Resources', A: resources.length * 10, fullMark: 100 },
      { subject: 'Utilization', A: avgUtilization, fullMark: 100 },
      { subject: 'Events', A: Math.min(events.length, 100), fullMark: 100 },
      { subject: 'Safety', A: systemState === 'safe' ? 100 : systemState === 'unsafe' ? 50 : 0, fullMark: 100 },
    ];
  }, [processes, resources, events, systemState]);

  // Deadlock frequency over time
  const deadlockTrend = useMemo(() => {
    const data = [];
    for (let i = 0; i < 12; i++) {
      data.push({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        deadlocks: Math.floor(Math.random() * 5),
        resolved: Math.floor(Math.random() * 5),
      });
    }
    return data;
  }, []);

  const stats = [
    {
      title: 'Active Processes',
      value: processes.filter(p => p.status !== 'terminated').length,
      total: processes.length,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%',
    },
    {
      title: 'Resource Utilization',
      value: `${resourceUtilization.reduce((sum, r) => sum + r.utilization, 0) / (resourceUtilization.length || 1) | 0}%`,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%',
    },
    {
      title: 'Total Deadlocks',
      value: totalDeadlocksDetected,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: '-15%',
    },
    {
      title: 'Avg Response Time',
      value: '2.4s',
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '-5%',
    },
  ];

  const renderChart = () => {
    const commonProps = {
      data: historicalData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Line type="monotone" dataKey="processes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="resources" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="deadlocks" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="processes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="resources" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'area':
      default:
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorProcesses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorResources" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="processes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProcesses)" />
            <Area type="monotone" dataKey="resources" stroke="#10b981" fillOpacity={1} fill="url(#colorResources)" />
          </AreaChart>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInDown">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Analytics Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Comprehensive system metrics and performance insights
          </p>
        </div>
        <button className="btn btn-primary">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <h3 className="text-3xl font-bold text-text-primary mb-2">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">{stat.trend}</span>
                  </div>
                </div>
                <div className={`stat-icon ${stat.bgColor} ${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart */}
      <div className="card animate-fadeInUp">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">System Activity Over Time</h2>
            <p className="text-sm text-text-secondary">Real-time monitoring of processes and resources</p>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-background-secondary rounded-lg p-1">
              {(['line', 'bar', 'area'] as ChartType[]).map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    chartType === type
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-background-secondary rounded-lg p-1">
              {(['24h', '7d', '30d', 'all'] as TimeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Process Status Distribution */}
        <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Process Status Distribution</h3>
          {processStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={processStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {processStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">
              No process data available
            </div>
          )}
        </div>

        {/* Event Distribution */}
        <div className="card animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Event Type Distribution</h3>
          {eventDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eventDistribution} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} width={120} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">
              No events recorded yet
            </div>
          )}
        </div>

        {/* Resource Utilization */}
        <div className="card animate-fadeInUp" style={{ animationDelay: '300ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">Resource Utilization</h3>
          {resourceUtilization.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={resourceUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="allocated" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">
              No resources available
            </div>
          )}
        </div>

        {/* Performance Radar */}
        <div className="card animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-text-primary mb-4">System Performance Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={performanceMetrics}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" stroke="#6b7280" style={{ fontSize: 12 }} />
              <PolarRadiusAxis stroke="#6b7280" style={{ fontSize: 12 }} />
              <Radar name="Performance" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deadlock Trend */}
      <div className="card animate-fadeInUp">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Deadlock Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={deadlockTrend}>
            <defs>
              <linearGradient id="colorDeadlocks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
            <Legend />
            <Area type="monotone" dataKey="deadlocks" stroke="#ef4444" fillOpacity={1} fill="url(#colorDeadlocks)" />
            <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 animate-fadeInUp">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Total Events</p>
              <p className="text-2xl font-bold text-blue-900">{events.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-700">Resources Available</p>
              <p className="text-2xl font-bold text-green-900">{resources.length}</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-purple-700">System Status</p>
              <p className="text-2xl font-bold text-purple-900 capitalize">{systemState}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
