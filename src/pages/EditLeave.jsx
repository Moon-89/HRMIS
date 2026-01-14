import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../lib/auth';

export default function EditLeave() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/leaves/${id}`);
        const leaveData = res.data;

        // Ownership check: Only owner can edit
        if (leaveData.userId !== user?.id) {
          toast.error("You don't have permission to edit this leave request.");
          navigate('/leaves');
          return;
        }

        setIsOwner(true);
        setForm({
          startDate: leaveData.startDate || '',
          endDate: leaveData.endDate || '',
          reason: leaveData.reason || ''
        });
      } catch (e) {
        console.error(e);
        toast.error('Failed to load leave details');
        navigate('/leaves');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, user, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const payload = { ...form, userId: user.id };
      await api.put(`/leaves/${id}`, payload);
      toast.success('Leave request updated successfully');
      navigate(`/leaves/${id}`);
    } catch (err) {
      toast.error('Failed to update leave request');
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen -mt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!isOwner) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
        <div className="px-8 py-10 bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
          <h2 className="text-3xl font-extrabold tracking-tight">Edit Leave Request</h2>
          <p className="mt-2 text-indigo-100 opacity-90">Modify the details of your leave request below.</p>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Reason</label>
            <textarea
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={5}
              className="block w-full px-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 border"
              placeholder="Please provide a reason for your leave request..."
              required
            />
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1"
            >
              Update Request
            </button>
            <button
              type="button"
              onClick={() => navigate(`/leaves/${id}`)}
              className="flex-1 bg-white text-gray-700 font-bold py-4 px-6 rounded-2xl border-2 border-gray-100 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
