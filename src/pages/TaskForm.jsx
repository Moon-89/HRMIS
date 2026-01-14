import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient, useQuery } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';

export default function TaskForm() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assignee: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: usersData, isLoading: loadingUsers } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  }, { staleTime: 300000 });

  const users = Array.isArray(usersData) ? usersData : [];

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, assignee: form.assignee || currentUser?.id };
      await api.post('/tasks', payload);
      qc.invalidateQueries('tasks');
      toast.success('Task successfully created!');
      navigate('/tasks');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/tasks" className="text-sm font-bold text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors">
          ← Back to Board
        </Link>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">New Mission</h2>
      </div>

      <div className="bg-white shadow-2xl rounded-[2rem] border border-gray-100 overflow-hidden transform transition-all">
        <div className="bg-indigo-600 px-8 py-6">
          <h3 className="text-2xl font-black text-white">Initiate New Task</h3>
          <p className="text-indigo-100 text-sm font-medium opacity-80 mt-1">Define clear objectives and assign them to your team members.</p>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Task Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Q1 Performance Review"
              required
              className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Detailed Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Break down the steps or context for this assignment..."
              className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border-2 ${form.priority === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">Assignee</label>
              <select
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                required
                className="block w-full px-5 py-3.5 rounded-2xl border-2 border-gray-50 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-700 cursor-pointer appearance-none"
              >
                <option value="">Select Member...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-2xl text-lg font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all transform active:scale-95 disabled:grayscale ${submitting ? 'cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Broadcasting...' : 'Launch Mission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
