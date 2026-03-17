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

  // Handle both ID-based and Object-based assignee data
  const getAssigneeInfo = () => {
    const rawData = task.assigned_to || task.assignee;
    if (!rawData) return { name: 'Unassigned', email: 'No email associated', role: 'None', initial: '?' };

    if (typeof rawData === 'object') {
      return {
        name: rawData.name || 'Unknown',
        email: rawData.email || 'No email associated',
        role: rawData.role || 'Member',
        initial: (rawData.name || 'U').charAt(0).toUpperCase()
      };
    }

    const found = usersList.find(u => String(u.id) === String(rawData));
    return {
      name: found?.name || `User #${rawData}`,
      email: found?.email || 'No email associated',
      role: found?.role || 'Member',
      initial: (found?.name || 'U').charAt(0).toUpperCase()
    };
  };

  const assigneeInfo = getAssigneeInfo();

  const getStatusProgress = (s) => {
    switch (s) {
      case 'Done': return '100%';
      case 'InProgress': return '60%';
      default: return '15%';
    }
  };

  // Robust data extraction with fallbacks
  const tTitle = task?.title || task?.name || task?.task_title || 'Untitled Objective';
  const tDesc = task?.description || task?.desc || task?.details || 'No detailed documentation provided.';
  const tCreated = task?.createdAt || task?.created_at || task?.timestamp || task?.date;
  const tUpdated = task?.updatedAt || task?.updated_at || tCreated;
  const tAssignedTime = task?.assignedAt || task?.assigned_at || tCreated;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/tasks')} className="group flex items-center gap-2 text-sm font-black text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK TO TASKS
        </button>
        
      </div>

      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 transition-colors">
        {/* Top Header Section */}
        <div className="relative px-8 py-12 bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 text-white overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-white/20 bg-white/10 shadow-lg backdrop-blur-md`}>
                  {task.priority || 'Medium'} PRIORITY
                </span>

              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mb-2">{tTitle}</h1>
              <p className="text-indigo-200/60 text-xs font-black tracking-[0.3em] uppercase">System Registry ID: {task?.id}</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl ${getStatusColor(task?.status)} border-2 border-white/10`}>
                {task?.status === 'InProgress' ? 'In Progress' : (task?.status || 'Todo')}
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        </div>

        {/* Unified Progress Bar */}
        <div className="h-2 bg-gray-100 dark:bg-white/5 w-full relative">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            style={{ width: getStatusProgress(task?.status) }}
          ></div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Column: Details */}
            <div className="lg:col-span-2 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Objective Overview</label>
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.02] p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 leading-relaxed text-lg shadow-inner font-medium transition-colors">
                  {tDesc}
                </div>
              </div>

              {/* Meta Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] transition-colors group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🕒</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Assigned On</p>
                  </div>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {tAssignedTime ? new Date(tAssignedTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                  <p className="text-xs font-bold text-indigo-500 mt-1 uppercase">
                    Time: {tAssignedTime ? new Date(tAssignedTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>

                <div className="p-8 bg-white dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-[2rem] transition-colors group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🔄</span>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Updated</p>
                  </div>
                  <p className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                    {tUpdated ? new Date(tUpdated).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                  <p className="text-xs font-bold text-emerald-500 mt-1 uppercase">
                    Time: {tUpdated ? new Date(tUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Stakeholder Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Assigned Details</label>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.02] dark:to-transparent p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 p-1 mb-6 shadow-2xl">
                      <div className="h-full w-full rounded-full bg-white dark:bg-neutral-900 border-4 border-white dark:border-black flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-3xl transition-colors">
                        {assigneeInfo.initial}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 transition-colors">{assigneeInfo.name}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">{assigneeInfo.role}</p>
                    <div className="w-full h-px bg-gray-100 dark:bg-white/5 mb-4"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold truncate w-full italic transition-colors">{assigneeInfo.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Container */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/tasks')}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-indigo-100 dark:shadow-none hover:-translate-y-1 active:scale-95"
                >
                  Return to Task List
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
