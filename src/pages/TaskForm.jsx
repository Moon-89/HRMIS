import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';

export default function TaskForm() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignee: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  });

  const users = Array.isArray(usersData) ? usersData : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // If no assignee chosen, default to current user
      const payload = { ...form, assignee: form.assignee || currentUser?.id };
      await api.post('/tasks', payload);
      qc.invalidateQueries('tasks');
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">New Task</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            <p className="mt-2 text-xs text-gray-400 italic font-medium">
              * Required: Please select who will be responsible for this task.
            </p>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform active:scale-95 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Assigning Task...' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
