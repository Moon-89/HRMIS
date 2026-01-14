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

  // Failsafe: if email is memona@hrmis.com, treat as Admin
  const isMemonaAdmin = user?.email?.toLowerCase()?.trim() === 'memona@hrmis.com' || user?.email?.toLowerCase()?.trim() === 'memona@hrmis';
  const displayRole = isMemonaAdmin ? 'Admin' : (user?.role || 'Employee');
  const isAdminOrManager = displayRole.toLowerCase() === 'admin' || displayRole.toLowerCase() === 'manager';

  const { data, isLoading } = useQuery(['leave', id], async () => {
    const res = await api.get(`/leaves/${id}`);
    return res.data;
  });

  const del = useMutation(async () => {
    await api.delete(`/leaves/${id}`);
  }, { onSuccess: () => qc.invalidateQueries('leaves') });

  const updateStatus = useMutation(async (status) => {
    await api.put(`/leaves/${id}`, { status });
  }, { onSuccess: () => qc.invalidateQueries('leaves') });

  if (isLoading) return <div>Loading...</div>;
  const leave = data;

  const handleDelete = async () => {
    if (!window.confirm('Delete this leave?')) return;
    try {
      await del.mutateAsync();
      toast.success('Leave deleted');
      navigate('/leaves');
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  const handleApprove = async () => {
    try {
      await updateStatus.mutateAsync('Approved');
      toast.success('Leave approved');
    } catch (e) { toast.error('Failed to approve'); }
  };
  const handleReject = async () => {
    try {
      await updateStatus.mutateAsync('Rejected');
      toast.success('Leave rejected');
    } catch (e) { toast.error('Failed to reject'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl leading-6 font-bold text-gray-900">Leave Request Details</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {leave.id}</p>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">User</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">{leave.user?.name ?? leave.userId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                  {leave.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">From</dt>
              <dd className="mt-1 text-sm text-gray-900">{leave.startDate}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">To</dt>
              <dd className="mt-1 text-sm text-gray-900">{leave.endDate}</dd>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-gray-50">
            <div>
              <dt className="text-sm font-medium text-gray-400">Requested At</dt>
              <dd className="mt-1 text-xs text-gray-500 font-medium">
                {leave.createdAt ? new Date(leave.createdAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-400">Last Modified</dt>
              <dd className="mt-1 text-xs text-gray-500 font-medium">
                {leave.updatedAt ? new Date(leave.updatedAt).toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : 'N/A'}
              </dd>
            </div>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Reason</dt>
            <dd className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md border border-gray-100">{leave.reason}</dd>
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 bg-gray-50 flex flex-wrap gap-3">
          {isAdminOrManager && (
            <>
              <button
                onClick={() => navigate(`/leaves/${leave.id}/edit`)}
                className="inline-flex justify-center py-2 px-6 border border-amber-300 shadow-sm text-sm font-bold rounded-lg text-amber-700 bg-white hover:bg-amber-50 transition-all font-bold"
              >
                Edit Details
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-all"
              >
                Delete Request
              </button>

              <div className="flex-1 min-w-[10px]"></div>

              <button
                onClick={handleApprove}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all transform hover:scale-105"
              >
                Approve Leave
              </button>
              <button
                onClick={handleReject}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-all transform hover:scale-105"
              >
                Reject Leave
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
