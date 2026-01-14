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
  });
  const usersList = Array.isArray(usersData) ? usersData : [];

  const { data, isLoading, error } = useQuery(['tasks', { status, assignee: !canSeeAll ? user?.id : undefined }], async () => {
    const params = {};
    if (status) params.status = status;
    if (!canSeeAll) params.assignee = user?.id;

    const res = await api.get('/tasks', { params });
    return res.data;
  });

  const handleDelete = async (id) => {
    if (!canSeeAll) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      qc.invalidateQueries('tasks');
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {String(error.message || error)}</div>;

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="flex items-center gap-4 mb-6">
        {isAdminOrManager && (
          <Link to="/tasks/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all font-bold shadow-sm">
            + New Task
          </Link>
        )}
        <div className="flex-1" />
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All Tasks</option>
            <option value="Todo">Todo</option>
            <option value="InProgress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </label>
      </div>

      <div className="bg-white shadow overflow-hidden border border-gray-100 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 italic">
            {list.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-gray-400">No tasks found to display.</td>
              </tr>
            ) : list.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{t.id}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{t.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full ${t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-600">{t.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-medium">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium italic">
                  {usersList.find(u => String(u.id) === String(t.assignee))?.name ?? (t.assignee || 'Unassigned')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  <Link to={`/tasks/${t.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">View</Link>
                  {isAdminOrManager && (
                    <>
                      <Link to={`/tasks/${t.id}/edit`} className="text-amber-600 hover:text-amber-900 mr-4">Edit</Link>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer font-bold"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
