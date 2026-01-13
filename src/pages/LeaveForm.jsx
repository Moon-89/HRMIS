import React, { useState } from 'react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { toast } from 'react-toastify';

export default function LeaveForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      console.log('API baseURL:', api.defaults?.baseURL);
      const fullUrl = (api.defaults?.baseURL || 'http://localhost:4000') + '/leaves';
      console.log('Posting to (full):', fullUrl);
      console.log('Payload:', form);
      // Use direct fetch to the mock server (avoid axios/dev-server interfering)
      const resp = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      const resBody = await resp.json().catch(() => null);
      if (!resp.ok) {
        const err = new Error(resBody?.message || `Request failed with status ${resp.status}`);
        err.response = { status: resp.status, data: resBody };
        throw err;
      }
      qc.invalidateQueries('leaves');
      navigate('/leaves');
    } catch (err) {
      console.error('Create leave error', err);
      // If axios failed without a response (network), try a simple fetch fallback to the mock server
      if (!err.response) {
        try {
          const fallbackBase = api.defaults?.baseURL || 'http://localhost:4000';
          const resp = await fetch(`${fallbackBase}/leaves`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
          });
          const data = await resp.json().catch(() => null);
          if (resp.ok) {
            qc.invalidateQueries('leaves');
            toast.success('Leave requested via fallback');
            navigate('/leaves');
            return;
          }
          toast.error(`${resp.status} - ${data?.message || JSON.stringify(data) || resp.statusText}`);
          return;
        } catch (fetchErr) {
          console.error('Fallback fetch failed', fetchErr);
          toast.error('Network error: could not reach API (axios+fetch)');
          return;
        }
      }

      const status = err.response?.status;
      const body = err.response?.data;
      const msg = body?.message || body || err.message || 'Failed to create leave';
      toast.error(`${status ? status + ' - ' : ''}${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">New Leave Request</h2>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reason</label>
            <div className="mt-1">
              <textarea
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={4}
                required
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${submitting ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Request Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
