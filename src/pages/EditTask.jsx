import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../lib/api';

export default function EditTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [task, setTask] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', status: 'Todo', assigned_to: '' });
  const [submitting, setSubmitting] = useState(false);

  const { data: usersData } = useQuery('users', async () => {
    const res = await api.get('/users');
    return res.data;
  }, { staleTime: 300000 });

  const users = Array.isArray(usersData) ? usersData : [];

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/tasks/${id}`);
        const data = res.data;
        setTask(data);
        setForm({
          title: data.title || '',
          description: data.description || '',
          priority: data.priority || 'Medium',
          status: data.status || 'Todo',
          assigned_to: data.assigned_to || data.assignee || ''
        });
      } catch (e) {
        console.error(e);
        toast.error('Task load failed');
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/tasks/${id}`, form);
      qc.invalidateQueries('tasks');
      qc.invalidateQueries(['task', id]);
      toast.success('Task updated successfully');
      navigate(`/tasks/${id}`);
    } catch (e) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!task) return (
    <div className="flex justify-center items-center h-screen -mt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors duration-300">
      <div className="mb-8 flex items-center justify-between">
        <button onClick={() => navigate(`/tasks/${id}`)} className="group flex items-center gap-2 text-sm font-black text-gray-400 dark:text-gray-500 hover:text-indigo-600 transition-all">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> BACK TO TASKS
        </button>
        
      </div>

      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 transition-colors">
        <div className="px-10 py-10 bg-gradient-to-br from-gray-900 via-indigo-950 to-indigo-900 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">Edit Task Properties</h2>
            <p className="text-indigo-200/60 text-sm font-bold">Registry ID: {id.toString().padStart('0')}</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        <form onSubmit={onSubmit} className="p-10 space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose">Task Information</label>
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Task Title</p>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 transition-all outline-none font-bold placeholder-gray-300 dark:placeholder-gray-600"
                  placeholder="Enter clear objective title..."
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1">Task Description</p>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  required
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 transition-all outline-none font-medium placeholder-gray-300 dark:placeholder-gray-600 leading-relaxed"
                  placeholder="Provide comprehensive details about this task..."
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Priority Selection</p>
              <div className="grid grid-cols-3 gap-3">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm({ ...form, priority: p })}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.priority === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none translate-y-[-2px]' : 'bg-white dark:bg-white/5 border-gray-50 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:border-indigo-200'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Status Protocol</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'Todo', label: 'Todo' },
                  { id: 'InProgress', label: 'Progress' },
                  { id: 'Done', label: 'Complete' }
                ].map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setForm({ ...form, status: s.id })}
                    className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${form.status === s.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-200 dark:shadow-none translate-y-[-2px]' : 'bg-white dark:bg-white/5 border-gray-50 dark:border-white/5 text-gray-400 dark:text-gray-500 hover:border-emerald-200'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-1">Assign to Member</label>
            <div className="relative group">
              <select
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                required
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.03] text-gray-900 dark:text-white focus:bg-white dark:focus:bg-transparent focus:border-indigo-500 transition-all outline-none font-bold appearance-none cursor-pointer"
              >
                <option value="" className="bg-white dark:bg-neutral-900">Select Member...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-neutral-900">
                    {u.name} — {u.role}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-indigo-500">
                ▼
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all relative overflow-hidden group ${submitting ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:bg-indigo-700 active:scale-95'}`}
            >
              <span className="relative z-10">{submitting ? 'Updating Registry...' : 'Save Changes'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="px-10 py-5 border-2 border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-all active:scale-95"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
