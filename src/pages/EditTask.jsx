import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignee: '' });

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  });

  const users = Array.isArray(usersData) ? usersData : [];

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data);
        setForm({ title: res.data.title || '', description: res.data.description || '', priority: res.data.priority || 'Medium', status: res.data.status || 'Todo', assignee: res.data.assignee || '' });
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${id}`, form);
      navigate(`/tasks/${id}`);
    } catch (e) {
      toast.error('Update failed');
    }
  };

  if (!task) return <div className="p-6 text-center dark:text-gray-400 transition-colors">Loading task details...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto transition-colors duration-300">
      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-lg rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 transition-colors">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] transition-colors">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Edit Task #{id}</h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none transition-colors"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none transition-colors"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none transition-colors appearance-none"
              >
                <option className="bg-white dark:bg-neutral-800">Low</option>
                <option className="bg-white dark:bg-neutral-800">Medium</option>
                <option className="bg-white dark:bg-neutral-800">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 transition-colors">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none transition-colors appearance-none"
              >
                <option className="bg-white dark:bg-neutral-800">Todo</option>
                <option className="bg-white dark:bg-neutral-800">InProgress</option>
                <option className="bg-white dark:bg-neutral-800">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 transition-colors">Assign to Team Member</label>
            <select
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all font-medium dark:text-white transition-colors appearance-none"
            >
              <option value="" className="bg-white dark:bg-neutral-800">Select an Employee...</option>
              {users.map(u => (
                <option key={u.id} value={u.id} className="bg-white dark:bg-neutral-800">
                  {u.name} — ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 shadow-md hover:shadow-lg transition-all transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="px-6 py-2 border border-gray-300 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
