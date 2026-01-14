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

  if (!task) return <div className="p-6 text-center">Loading task details...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-2xl font-bold text-gray-900">Edit Task #{id}</h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              >
                <option>Todo</option>
                <option>InProgress</option>
                <option>Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Team Member</label>
            <select
              value={form.assignee}
              onChange={(e) => setForm({ ...form, assignee: e.target.value })}
              required
              className="mt-1 block w-full rounded-xl border-gray-300 bg-gray-50/50 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all font-medium"
            >
              <option value="">Select an Employee...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} — ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
