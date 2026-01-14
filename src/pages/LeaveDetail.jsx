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
  const isMemonaAdmin =
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis.com' ||
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis';
  const displayRole = isMemonaAdmin ? 'Admin' : (user?.role || 'Employee');
  const isAdminOrManager =
    displayRole.toLowerCase() === 'admin' || displayRole.toLowerCase() === 'manager';

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
    <div className="flex justify-center items-center h-screen -mt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (isError || !leave) return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold text-gray-900">Leave request not found</h2>
      <button
        onClick={() => navigate('/leaves')}
        className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
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
    'Approved': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center gap-2">
        <button
          onClick={() => navigate('/leaves')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
        >
          ← Back to Leaves
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-8 sm:px-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Leave Request Details</h1>
              <p className="mt-1 text-sm text-gray-500">Request ID: <span className="font-mono">{leave.id}</span></p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[leave.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {leave.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Employee</label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {leave.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-none">{leave.user?.name ?? `User #${leave.userId}`}</p>
                  <p className="text-sm text-gray-500 mt-1">{leave.user?.email || 'No email provided'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Request Timeline</label>
              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Start Date</p>
                  <p className="text-sm font-bold text-gray-900">{leave.startDate}</p>
                </div>
                <div className="flex-1 h-px bg-gray-200 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-500 uppercase">End Date</p>
                  <p className="text-sm font-bold text-gray-900">{leave.endDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Reason for Leave</label>
            <div className="bg-white p-6 rounded-2xl border-2 border-gray-50 text-gray-700 leading-relaxed italic shadow-inner">
              "{leave.reason}"
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted On</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {leave.createdAt ? new Date(leave.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Last Activity</p>
              <p className="text-sm font-semibold text-gray-700 mt-1">
                {leave.updatedAt ? new Date(leave.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 bg-gray-50 flex flex-col sm:flex-row gap-4 justify-between border-t border-gray-100">
          {isAdminOrManager ? (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleStatusChange('Approved')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-200 disabled:opacity-50"
              >
                Approve Request
              </button>
              <button
                onClick={() => handleStatusChange('Rejected')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50"
              >
                Reject Request
              </button>
              <button
                onClick={() => handleStatusChange('Pending')}
                disabled={updateStatus.isLoading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-yellow-800 bg-yellow-400 hover:bg-yellow-500 transition-all shadow-lg shadow-yellow-200 disabled:opacity-50"
              >
                Set Pending
              </button>
            </div>
          ) : (user?.id === leave.userId) && (
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/leaves/${leave.id}/edit`)}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-indigo-700 bg-white border-2 border-indigo-100 hover:bg-indigo-50 transition-all shadow-sm"
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
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                Cancel / Delete
              </button>
            </div>
          )}

          <div className="sm:ml-auto">
            {/* Additional info or small placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
}
