import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../lib/auth';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';

  const { data: task, isLoading, isError } = useQuery(['task', id], async () => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  }, {
    retry: 1,
    onError: () => toast.error('Task not found')
  });

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  }, { staleTime: 300000 });
  const usersList = Array.isArray(usersData) ? usersData : [];

  const del = useMutation(async () => {
    await api.delete(`/tasks/${id}`);
  }, {
    onSuccess: () => {
      qc.invalidateQueries('tasks');
      toast.success('Task removed');
      navigate('/tasks');
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen -mt-24 transition-colors">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (isError || !task) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task details could not be loaded.</h2>
      <Link to="/tasks" className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Back to Tasks</Link>
    </div>
  );

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';
      case 'Medium': return 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';
      default: return 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Done': return 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/20';
      case 'InProgress': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
      default: return 'bg-gray-50 dark:bg-white/[0.05] text-gray-700 dark:text-gray-400 border-gray-100 dark:border-white/10';
    }
  };

  const assigneeUser = usersList.find(u => String(u.id) === String(task.assigned_to || task.assignee));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-6">
        <button onClick={() => navigate('/tasks')} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition-all hover:-translate-x-1">
          ← Back to Task Board
        </button>
      </div>

      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 transition-colors duration-300">
        <div className="px-8 py-10 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/20 bg-white/10 text-white shadow-sm`}>
                  {task.priority || 'Medium'} Priority
                </span>
                <span className="text-indigo-200 text-xs font-bold tracking-widest uppercase">Task #{task.id}</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">{task.title}</h1>
            </div>
            <div className={`px-4 py-2 rounded-2xl text-sm font-extrabold uppercase tracking-widest shadow-inner ${getStatusColor(task.status)} transition-colors`}>
              {task.status === 'InProgress' ? 'In Progress' : (task.status || 'Todo')}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose">Assigned To</label>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm transition-all duration-300">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-white/10 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-black text-xl shadow-sm transition-colors">
                  {(assigneeUser?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white leading-none transition-colors">{assigneeUser?.name || 'Unassigned'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1.5 transition-colors">{assigneeUser?.email || 'No email associated'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose">Timestamps</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center transition-colors">
                  <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">Created</p>
                  <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                    {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="bg-white dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-center transition-colors">
                  <p className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-1">Updated</p>
                  <p className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                    {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose">Task Description</label>
            <div className="bg-indigo-50/30 dark:bg-indigo-900/10 p-8 rounded-3xl border border-indigo-50 dark:border-indigo-500/10 text-gray-700 dark:text-gray-300 leading-relaxed text-lg shadow-inner italic transition-all duration-300">
              {task.description || 'No description provided for this task.'}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-gray-50 dark:bg-white/[0.02] flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-100 dark:border-white/5 transition-colors">
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/tasks')}
              className="flex-1 sm:flex-none px-6 py-3 text-sm font-bold text-gray-500 dark:text-gray-400 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
            >
              Go Back
            </button>
          </div>

          {isAdminOrManager && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
                className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all"
              >
                Edit Task
              </button>
              <button
                onClick={() => { if (window.confirm('Delete this task physically?')) del.mutate(); }}
                disabled={del.isLoading}
                className="flex-1 sm:flex-none px-8 py-3 text-sm font-bold text-white bg-rose-500 dark:bg-rose-600 rounded-xl hover:bg-rose-600 dark:hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 dark:shadow-none disabled:opacity-50"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
