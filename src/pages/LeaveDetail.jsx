import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { useAuth } from '../lib/auth';

export default function LeaveDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();

  // Role handling
  const isAdmin = user?.role === 'Admin';
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';
  const displayRole = user?.role || 'Employee';

  const { data: leave, isLoading, isError } = useQuery(['leave', id], async () => {
    const res = await api.get(`/leaves/${id}`);
    return res.data;
  }, {
    retry: 1,
    onError: () => toast.error('Leave request not found')
  });

  const del = useMutation(async () => {
    await api.delete(`/leaves/${id}`);
  }, {
    onSuccess: () => {
      qc.invalidateQueries('leaves');
      toast.success('Leave request deleted successfully');
      navigate('/leaves');
    }
  });

  const updateStatus = useMutation(async (status) => {
    await api.put(`/leaves/${id}`, { status });
  }, {
    onSuccess: () => {
      qc.invalidateQueries(['leave', id]);
      qc.invalidateQueries('leaves');
    }
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen -mt-24 transition-colors">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (isError || !leave) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center transition-colors">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Leave request not found</h2>
      <button
        onClick={() => navigate('/leaves')}
        className="mt-4 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
      >
        Go back to leaves
      </button>
    </div>
  );

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus.mutateAsync(newStatus);
      toast.success(`Leave status updated to ${newStatus}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const statusColors = {
    'Approved': 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/20',
    'Rejected': 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/20',
    'Pending': 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate('/leaves')}
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 transition-all hover:-translate-x-1"
        >
          ← Back to Leaves
        </button>
      </div>

      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-xl rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 transition-colors duration-300">
        <div className="px-6 py-8 sm:px-8 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Leave Request Details</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Request ID: <span className="font-mono">{leave.id}</span></p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[leave.status] || 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-white/10'} transition-colors`}>
              {leave.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose">Employee</label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-lg border border-indigo-200 dark:border-indigo-500/20 transition-colors">
                  {leave.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white leading-none transition-colors">{leave.user?.name ?? `User #${leave.userId}`}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors">{leave.user?.email || 'No email provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose">Request Timeline</label>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-white/[0.02] p-4 rounded-xl border border-gray-100 dark:border-white/5 transition-colors">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Start Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{leave.startDate}</p>
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-white/10 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">End Date</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-200">{leave.endDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-loose">Reason for Leave</label>
            <div className="bg-white dark:bg-white/[0.02] p-6 rounded-2xl border-2 border-gray-50 dark:border-white/5 text-gray-700 dark:text-gray-300 leading-relaxed italic shadow-inner transition-colors">
              "{leave.reason}"
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Submitted On</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 transition-colors">
                {leave.createdAt ? new Date(leave.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider transition-colors">Last Activity</p>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1 transition-colors">
                {leave.updatedAt ? new Date(leave.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 bg-gray-50 dark:bg-white/[0.03] flex flex-col sm:flex-row gap-4 justify-between border-t border-gray-100 dark:border-white/5 transition-colors">
          {isAdminOrManager ? (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleStatusChange('Approved')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700 transition-all shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-50"
              >
                Approve Request
              </button>
              <button
                onClick={() => handleStatusChange('Rejected')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none disabled:opacity-50"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleStatusChange('Pending')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-yellow-800 bg-yellow-400 hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-200 dark:shadow-none disabled:opacity-50"
              >
                Set Pending
              </button>
            </div>
          ) : (user?.id === leave.userId) && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/leaves/${leave.id}/edit`)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-700 dark:text-indigo-400 bg-white dark:bg-white/5 border-2 border-indigo-100 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-white/10 transition-all shadow-sm"
              >
                Edit Request
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this leave request?')) {
                    del.mutate();
                  }
                }}
                disabled={del.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none"
              >
                Cancel / Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
