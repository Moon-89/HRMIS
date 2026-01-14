import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Tasks() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager' || user?.email?.toLowerCase()?.includes('memona@hrmis');
  const canSeeAll = isAdminOrManager;
  const [status, setStatus] = React.useState('');

  const qc = useQueryClient();

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  }, { staleTime: 300000 });

  const usersList = Array.isArray(usersData) ? usersData : [];

  const { data, isLoading, error } = useQuery(['tasks', { status, assignee: !canSeeAll ? user?.id : undefined }], async () => {
    const params = {};
    if (status) params.status = status;
    if (!canSeeAll) params.assignee = user?.id;

    const res = await api.get('/tasks', { params });
    return res.data;
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

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
      Error loading tasks. Please try again.
    </div>
  );

  const list = Array.isArray(data) ? data : [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Done': return 'bg-green-100 text-green-800';
      case 'InProgress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
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

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-bold bg-transparent"
            >
              <option value="">All Tasks</option>
              <option value="Todo">Todo</option>
              <option value="InProgress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Task Info</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Assignee</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                  No tasks found matching your request.
                </td>
              </tr>
            ) : (
              list.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{t.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">ID: #{t.id} • {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}</div>
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
                      <div className="h-6 w-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                        {(usersList.find(u => String(u.id) === String(t.assignee))?.name || 'U').charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {usersList.find(u => String(u.id) === String(t.assignee))?.name ?? (t.assignee || 'Unassigned')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end items-center gap-2">
                      <Link to={`/tasks/${t.id}`} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all font-bold">
                        View
                      </Link>
                      {isAdminOrManager && (
                        <>
                          <Link to={`/tasks/${t.id}/edit`} className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-all font-bold">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all font-bold"
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
          <div className="bg-white p-8 text-center text-gray-500 italic rounded-2xl border border-gray-100">
            No tasks found.
          </div>
        ) : (
          list.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${getPriorityColor(t.priority)}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs font-bold text-gray-400">ID: #{t.id}</span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-lg leading-tight">{t.title}</h3>
                </div>
                <div className={`text-[10px] font-bold uppercase ${getStatusColor(t.status)} px-2 py-1 rounded-md`}>
                  {t.status === 'InProgress' ? 'In Progress' : t.status}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                    {(usersList.find(u => String(u.id) === String(t.assignee))?.name || 'U').charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-gray-600">
                    {usersList.find(u => String(u.id) === String(t.assignee))?.name ?? (t.assignee || 'Unassigned')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <Link to={`/tasks/${t.id}`} className="flex-1 text-center bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                  View
                </Link>
                {isAdminOrManager && (
                  <>
                    <Link to={`/tasks/${t.id}/edit`} className="flex-1 text-center bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
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
