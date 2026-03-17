import React from 'react';
import { useAuth } from '../lib/auth';
import { useQuery } from 'react-query';
import api from '../lib/api';

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.role === 'Admin';
  const isAdminOrManager = isAdmin || user?.role === 'Manager';
  const displayRole = user?.role || 'Employee';

  // Fetch Tasks
  const { data: tasksData, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useQuery(
    ['recentTasks', user?.id, displayRole],
    async () => {
      const params = {};

      if (!isAdminOrManager && user?.id) {
        // Backend uses assigned_to for filtering tasks
        params.assigned_to = user.id;
      }
      const res = await api.get('/tasks', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
    {
      enabled: !!user,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Fetch Leaves
  const { data: leavesData, isLoading: leavesLoading, isError: leavesError, refetch: refetchLeaves } = useQuery(
    ['recentLeaves', user?.id, displayRole],
    async () => {
      const params = {};
      if (!isAdminOrManager && user?.id) {
        params.userId = user.id;
      }
      const res = await api.get('/leaves', { params });
      return Array.isArray(res.data) ? res.data : [];
    },
    {
      enabled: !!user,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const handleSync = () => {
    refetchTasks();
    refetchLeaves();
  };

  const [limit, setLimit] = React.useState(10);

  const formatActivityTime = (dateString) => {
    if (!dateString) return 'recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'recently';

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInSecs = Math.abs(Math.floor(diffInMs / 1000));
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);

    const isToday = date.toDateString() === now.toDateString();

    if (diffInSecs < 60) return 'just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;

    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }

    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatFullDate = (ds) => {
    if (!ds) return 'N/A';
    const d = new Date(ds);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Combine and sort activities
  const combinedActivities = React.useMemo(() => {
    const rawTasks = Array.isArray(tasksData) ? tasksData : [];
    const rawLeaves = Array.isArray(leavesData) ? leavesData : [];

    const t = rawTasks.map(item => {
      const isUpdated = item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt;
      return {
        ...item,
        type: 'Task',
        actionLabel: isUpdated ? 'Updated' : 'Created',
        activityTime: item.updatedAt || item.createdAt
      };
    });

    const l = rawLeaves.map(item => {
      const isUpdated = item.updatedAt && item.createdAt && item.updatedAt !== item.createdAt;
      return {
        ...item,
        type: 'Leave',
        title: `Leave Request: ${item.reason}`,
        actionLabel: isUpdated ? 'Updated' : 'Created',
        activityTime: item.updatedAt || item.createdAt
      };
    });

    return [...t, ...l]
      .filter(item => item.activityTime)
      .sort((a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime());
  }, [tasksData, leavesData]);

  const isSyncing = tasksLoading || leavesLoading;
  const hasError = tasksError || leavesError;
  const isLoading = !user || isSyncing;

  // Debugging logs to identify why timeline might be empty
  React.useEffect(() => {
    if (!isLoading) {
      console.log('Dashboard Data Check:', {
        tasksCount: tasksData?.length,
        leavesCount: leavesData?.length,
        combinedCount: combinedActivities?.length
      });
    }
  }, [isLoading, tasksData, leavesData, combinedActivities]);

  const visibleActivities = combinedActivities.slice(0, limit);
  const hasMore = combinedActivities.length > limit;

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50/30 dark:bg-transparent min-h-screen transition-colors duration-300">
      {/* Header Card */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-white/5 relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400 underline decoration-indigo-200 dark:decoration-indigo-900/50 decoration-8 underline-offset-4">{(user?.name ?? 'Guest').charAt(0).toUpperCase() + (user?.name ?? 'Guest').slice(1)}</span>!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-bold italic mb-1">{user?.designation || 'Workspace Member'}</p>
          <p className="text-indigo-400 dark:text-indigo-300 text-sm font-black uppercase tracking-[0.2em]">{user?.department || 'Operations'}</p>
          <div className="mt-6 flex space-x-3">
            <span className="inline-flex items-center px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none">
              {displayRole}
            </span>
            <span className="inline-flex items-center px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
              System Active
            </span>
          </div>
        </div>
        <div className="absolute right-[-10%] top-[-20%] h-[150%] w-1/2 bg-gradient-to-br from-indigo-50/50 dark:from-indigo-900/10 to-transparent rotate-12 opacity-40"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-white/10 transition-all duration-300 group">
          <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📝</span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Open Tasks</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {Array.isArray(tasksData) ? tasksData.filter(t => t.status !== 'Done').length : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-white/10 transition-all duration-300 group">
          <div className="bg-pink-50 dark:bg-pink-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">📅</span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Leave Requests</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white">
            {Array.isArray(leavesData) ? leavesData.length : 0}
          </p>
        </div>

        <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl dark:hover:shadow-none dark:hover:border-white/10 transition-all duration-300 group">
          <div className="bg-amber-50 dark:bg-amber-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="text-3xl">🔥</span>
          </div>
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Activity Count</h3>
          <p className="text-4xl font-black text-gray-900 dark:text-white">{combinedActivities.length}</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden transition-colors duration-300">
        <div className="px-10 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white dark:bg-transparent">
          <div className="flex items-center gap-4">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Activity Timeline
            </h3>
            <button
              onClick={handleSync}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors group"
              title="Sync Workspace"
            >
              <span className={`block text-xl group-hover:rotate-180 transition-transform duration-500 ${isLoading ? 'animate-spin' : ''}`}>🔄</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Live Logs</span>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900/50 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing workspace...</p>
            </div>
          ) : hasError ? (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="text-6xl block mb-4">🛰️</span>
              <p className="text-rose-500 font-bold text-lg mb-2">Connection Interrupted</p>
              <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">We couldn't reach the server. Please check your connection and try again.</p>
              <button
                onClick={handleSync}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Retry Connection
              </button>
            </div>
          ) : visibleActivities.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <span className="text-6xl block mb-4 animate-bounce">🏜️</span>
              <p className="text-gray-400 font-bold text-lg mb-6">No recent activity detected in your workspace.</p>
              <button
                onClick={handleSync}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
              >
                Sync Now
              </button>
            </div>
          ) : (
            <>
              {visibleActivities.map((item, idx) => (
                <div key={`${item.type}-${item.id}`} className="px-10 py-8 flex items-start gap-6 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-all group">
                  <div className="mt-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm ${item.type === 'Task' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                      }`}>
                      {item.type === 'Task' ? 'T' : 'L'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-sm font-black text-indigo-500 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-xl whitespace-nowrap">
                        {item.actionLabel} {formatActivityTime(item.activityTime)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.status === 'Done' || item.status === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                        item.status === 'Rejected' ? 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' : 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        }`}>
                        {item.status}
                      </span>
                      <span className="text-gray-200 dark:text-white/10">|</span>
                      <p className="text-sm font-bold text-gray-400 dark:text-gray-500 italic">
                        {isAdminOrManager ?
                          (item.type === 'Task' ? `Assigned to: ID ${item.assigned_to || item.assignee || 'Unassigned'}` : `Requester: ID ${item.userId}`)
                          : 'Action logs recorded'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="p-8 bg-gray-50/50 dark:bg-transparent text-center border-t border-gray-50 dark:border-white/5">
                  <button
                    onClick={() => setLimit(prev => prev + 10)}
                    className="px-8 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-black text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-white/10 hover:border-indigo-100 dark:hover:border-white/20 transition-all shadow-sm active:scale-95"
                  >
                    Load Previous Activities
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
