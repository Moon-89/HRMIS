import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';

export default function LeaveForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  // Role check: Only Employees can request leave
  const displayRole = user?.role || 'Employee';

  if (displayRole === 'Admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center transition-colors">
        <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
          <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Access Restricted</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed transition-colors">
            Only Employees can request leave. As an {displayRole}, your role is to review and manage these requests.
          </p>
          <button
            onClick={() => navigate('/leaves')}
            className="mt-6 text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500 transition-colors"
          >
            Return to Leaves List
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Session error: User ID missing. Please log out and log in again.');
      setSubmitting(false);
      return;
    }
    try {
      const payload = { ...form, userId: user.id, status: 'Pending' };
      console.log('Submitting Leave:', payload);
      await api.post('/leaves', payload);

      qc.invalidateQueries('leaves');
      toast.success('Leave request submitted successfully');
      navigate('/leaves');
    } catch (err) {
      console.error('Create leave error', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to submit leave request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-300">
      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 transition-colors duration-300">
        <div className="px-8 py-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">New Leave Request</h2>
          <p className="mt-2 text-indigo-100 opacity-90">Please fill in the details for your time off.</p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-white/5 border dark:text-gray-200 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-white/5 border dark:text-gray-200 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider transition-colors transition-colors">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={5}
              required
              className="block w-full px-4 py-3 rounded-xl border-gray-200 dark:border-white/10 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 dark:bg-white/5 border dark:text-gray-200 transition-colors"
              placeholder="Why do you need this leave? (e.g., Vacation, Sick Leave, Family Emergency)"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-xl dark:shadow-none text-lg font-bold text-white bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-1 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
