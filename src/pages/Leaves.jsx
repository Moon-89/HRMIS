import React from 'react';
import { useQuery } from 'react-query';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { toast } from 'react-toastify';

export default function Leaves() {
  const { user } = useAuth();

  // Role handling
  const isMemonaAdmin =
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis.com' ||
    user?.email?.toLowerCase()?.trim() === 'memona@hrmis';
  const displayRole = isMemonaAdmin ? 'Admin' : (user?.role || 'Employee');
  const isAdminOrManager =
    displayRole.toLowerCase() === 'admin' || displayRole.toLowerCase() === 'manager';

  const canSeeAll = isAdminOrManager;
  const [statusFilter, setStatusFilter] = React.useState('');
  const [mineOnly, setMineOnly] = React.useState(!canSeeAll);

  const { data, isLoading, error, refetch } = useQuery(
    ['leaves', { status: statusFilter, userId: (mineOnly || !canSeeAll) ? user?.id : undefined }],
    async () => {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (!canSeeAll || mineOnly) {
        params.userId = user?.id;
      }
      const res = await api.get('/leaves', { params });
      return res.data;
    }
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      refetch();
      toast.success('Leave deleted successfully');
    } catch (err) {
      toast.error('Failed to delete leave request');
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/leaves/${id}`, { status: newStatus });
      refetch();
      toast.success(`Leave status updated to ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
      console.error(err);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-600 p-4 rounded-lg">
      Error loading leaves. Please try again.
    </div>
  );

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isAdminOrManager ? 'Review and manage employee leave requests.' : 'Track and manage your leave requests.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {displayRole === 'Employee' && (
            <Link
              to="/leaves/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5"
            >
              Request Leave
            </Link>
          )}

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-gray-300 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {canSeeAll && (
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(e) => setMineOnly(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">My Leaves</span>
            </label>
          )}
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Requested By</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 italic">
                  No leave requests found matching your filters.
                </td>
              </tr>
            ) : (
              list.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-semibold text-gray-900">{l.user?.name ?? `User #${l.userId}`}</div>
                    <div className="text-xs text-gray-500">ID: {l.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="font-medium text-gray-900">{l.startDate}</span>
                    <span className="mx-1 text-gray-400">to</span>
                    <span className="font-medium text-gray-900">{l.endDate}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{l.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(l.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link to={`/leaves/${l.id}`} className="text-indigo-600 hover:text-indigo-900 px-2 py-1 bg-indigo-50 rounded transition-colors">
                        View
                      </Link>

                      {isAdminOrManager ? (
                        <div className="flex gap-1 border-l pl-2 border-gray-200">
                          <button
                            onClick={() => handleStatusChange(l.id, 'Approved')}
                            className="text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                            title="Approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Rejected')}
                            className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                            title="Reject"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Pending')}
                            className="text-yellow-600 hover:bg-yellow-50 px-2 py-1 rounded transition-colors"
                            title="Set to Pending"
                          >
                            Pending
                          </button>
                        </div>
                      ) : (l.userId === user?.id) && (
                        <div className="flex gap-1 border-l pl-2 border-gray-200">
                          <Link to={`/leaves/${l.id}/edit`} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {list.length === 0 ? (
          <div className="bg-white p-6 text-center text-gray-500 italic rounded-lg border border-gray-200">
            No leave requests found.
          </div>
        ) : (
          list.map((l) => (
            <div key={l.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{l.user?.name ?? `User #${l.userId}`}</h3>
                  <p className="text-xs text-gray-400">ID: {l.id}</p>
                </div>
                {statusBadge(l.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase">From</p>
                  <p className="font-medium text-gray-800">{l.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase">To</p>
                  <p className="font-medium text-gray-800">{l.endDate}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-semibold uppercase">Reason</p>
                <p className="text-gray-600 mt-1 line-clamp-2">{l.reason}</p>
              </div>

              <div className="pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                <Link to={`/leaves/${l.id}`} className="flex-1 text-center bg-gray-50 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
                  View
                </Link>

                {isAdminOrManager ? (
                  <div className="w-full flex gap-2">
                    <button
                      onClick={() => handleStatusChange(l.id, 'Approved')}
                      className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(l.id, 'Rejected')}
                      className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(l.id, 'Pending')}
                      className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-sm font-bold hover:bg-yellow-100 transition-colors"
                    >
                      Pending
                    </button>
                  </div>
                ) : (l.userId === user?.id) && (
                  <div className="w-full flex gap-2">
                    <Link to={`/leaves/${l.id}/edit`} className="flex-1 text-center bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="flex-1 bg-red-50 text-red-700 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function statusBadge(s) {
  const base = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider";
  if (s === 'Approved') return <span className={`${base} bg-green-100 text-green-800 border border-green-200`}>Approved</span>;
  if (s === 'Rejected') return <span className={`${base} bg-red-100 text-red-800 border border-red-200`}>Rejected</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-800 border border-yellow-200`}>Pending</span>;
}
