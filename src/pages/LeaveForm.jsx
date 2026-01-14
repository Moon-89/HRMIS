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
  const isMemonaAdmin =
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis.com' ||
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis';
  const displayRole = isMemonaAdmin ? 'Admin' : (user?.role || 'Employee');

  if (displayRole !== 'Employee') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Only Employees can request leave. As an {displayRole}, your role is to review and manage these requests.
          </p>
          <button
            onClick={() => navigate('/leaves')}
            className="mt-6 text-indigo-600 font-bold hover:text-indigo-500"
          >
            Return to Leaves List
          </button>
        </div>
      </div>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...form, userId: user?.id, status: 'Pending' };
      const fullUrl = (api.defaults?.baseURL || 'http://localhost:4000') + '/leaves';

      const resp = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const resBody = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(resBody?.message || `Request failed with status ${resp.status}`);
      }

      qc.invalidateQueries('leaves');
      toast.success('Leave request submitted successfully');
      navigate('/leaves');
    } catch (err) {
      console.error('Create leave error', err);
      toast.error(err.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="px-8 py-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">New Leave Request</h2>
          <p className="mt-2 text-indigo-100 opacity-90">Please fill in the details for your time off.</p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={5}
              required
              className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
              placeholder="Why do you need this leave? (e.g., Vacation, Sick Leave, Family Emergency)"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-xl text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-1 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
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
