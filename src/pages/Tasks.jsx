import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Tasks() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isAdminOrManager = isAdmin || user?.role === 'Manager';
  const canSeeAll = isAdminOrManager;
  const [status, setStatus] = React.useState('');

  const qc = useQueryClient();

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  }, {
    staleTime: 300000,
    enabled: canSeeAll, // Only fetch users list if admin/manager
    retry: false,
    onError: () => { } // Silently handle permission errors
  });

  const usersList = Array.isArray(usersData) ? usersData : [];

  const { data, isLoading, error } = useQuery(['tasks', { status, assignee: !canSeeAll ? user?.id : undefined }], async () => {
    const params = {};
    if (status) params.status = status;
    if (!canSeeAll) params.assigned_to = user?.id;

    const res = await api.get('/tasks', { params });
    return res.data;
  }, {
    enabled: !!user,
    retry: false,
    refetchOnWindowFocus: false
  });

  const handleDelete = async (id) => {
    if (!isAdminOrManager) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      qc.invalidateQueries('tasks');
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  const list = Array.isArray(data) ? data : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-400 dark:border-white/10';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Done': return 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400';
      case 'InProgress': return 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-gray-400';
    }
  };

  const getAssigneeName = (assigned_to) => {
    if (!assigned_to) return 'Unassigned';
    if (typeof assigned_to === 'object') return assigned_to.name || 'Unassigned';
    return usersList.find(u => String(u.id) === String(assigned_to))?.name || String(assigned_to);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isAdminOrManager ? 'Oversee and manage team responsibilities.' : 'Manage and track your assigned tasks.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrManager && (
            <Link
              to="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5"
            >
              + New Task
            </Link>
          )}

          <div className="flex items-center gap-2 bg-white dark:bg-white/[0.03] backdrop-blur-md px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-200 font-bold bg-transparent"
            >
              <option value="" className="bg-white dark:bg-neutral-800">All Tasks</option>
              <option value="Todo" className="bg-white dark:bg-neutral-800">Todo</option>
              <option value="InProgress" className="bg-white dark:bg-neutral-800">In Progress</option>
              <option value="Done" className="bg-white dark:bg-neutral-800">Done</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-bold tracking-tight">Sync Problem: Please check your internet or server status.</span>
        </div>
      )}

      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden bg-white dark:bg-white/[0.03] backdrop-blur-md shadow-xl rounded-2xl border border-gray-100 dark:border-white/5 transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
          <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Task Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Assigned_to</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5 bg-transparent">
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                  No tasks found matching your request.
                </td>
              </tr>
            ) : (
              list.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{t.title}</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">ID: #{t.id} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter rounded-full border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-bold ${getStatusColor(t.status)} px-2 py-1 rounded-md`}>
                      {t.status === 'InProgress' ? 'In Progress' : t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {getAssigneeName(t.assigned_to).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {getAssigneeName(t.assigned_to)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end items-center gap-2">
                      <Link to={`/tasks/${t.id}`} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 px-3 py-1.5 rounded-lg transition-all font-bold">
                        View
                      </Link>
                      {isAdminOrManager && (
                        <>
                          <Link to={`/tasks/${t.id}/edit`} className="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/40 px-3 py-1.5 rounded-lg transition-all font-bold">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 px-3 py-1.5 rounded-lg transition-all font-bold"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {list.length === 0 ? (
          <div className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-8 text-center text-gray-500 italic rounded-2xl border border-gray-100 dark:border-white/5 transition-colors">
            No tasks found.
          </div>
        ) : (
          list.map((t) => (
            <div key={t.id} className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500">ID: #{t.id}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">{t.title}</h3>
                </div>
                <div className={`text-[10px] font-bold uppercase ${getStatusColor(t.status)} px-2 py-1 rounded-md`}>
                  {t.status === 'InProgress' ? 'In Progress' : t.status}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50 dark:border-white/5 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {getAssigneeName(t.assigned_to).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    {getAssigneeName(t.assigned_to)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Link to={`/tasks/${t.id}`} className="flex-1 text-center bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  View
                </Link>
                {isAdminOrManager && (
                  <>
                    <Link to={`/tasks/${t.id}/edit`} className="flex-1 text-center bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
