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
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assigned_to: '' });
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
      const payload = { ...form, assigned_to: form.assigned_to || currentUser?.id };
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="mb-8 flex items-center justify-between">
        <Link to="/tasks" className="text-sm font-bold text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors">
          ← Back to Board
        </Link>
        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest transition-colors">New Task</h2>
      </div>

      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden transform transition-all duration-300">
        <div className="bg-indigo-600 px-8 py-6">
          <h3 className="text-2xl font-black text-white">Initiate New Task</h3>
          <p className="text-indigo-100 text-sm font-medium opacity-80 mt-1">Define clear objectives and assign them to your team members.</p>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose transition-colors">Task Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Q1 Performance Review"
              required
              className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-700 dark:text-gray-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose transition-colors">Detailed Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Break down the steps or context for this assignment..."
              className="block w-full px-5 py-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-600 dark:text-gray-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose transition-colors">Priority Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-tighter transition-all border-2 ${form.priority === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none transition-colors' : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 dark:text-gray-500 hover:border-indigo-200 dark:hover:border-indigo-400 transition-colors'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose transition-colors transition-colors">Assigned_to</label>
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                required
                className="block w-full px-5 py-3.5 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none transition-colors"
              >
                <option value="" className="bg-white dark:bg-neutral-800">Select Member...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-neutral-800">
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
              className={`w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-2xl dark:shadow-none text-lg font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all transform active:scale-95 disabled:grayscale ${submitting ? 'cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Loading...' : 'Submit Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
