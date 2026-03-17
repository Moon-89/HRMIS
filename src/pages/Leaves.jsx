import React from 'react';
import { useQuery } from 'react-query';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { toast } from 'react-toastify';

export default function Leaves() {
  const { user } = useAuth();

  // Role handling
  const isAdmin = user?.role === 'Admin';
  const isAdminOrManager = user?.role === 'Admin' || user?.role === 'Manager';
  const displayRole = user?.role || 'Employee';

  const canSeeAll = isAdminOrManager;
  const [statusFilter, setStatusFilter] = React.useState('');
  const [mineOnly, setMineOnly] = React.useState(!canSeeAll);

  const { data, isLoading, error, refetch } = useQuery(
    ['leaves', { status: statusFilter, userId: (mineOnly || !canSeeAll) ? user?.id : undefined }],
    async () => {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (!canSeeAll || mineOnly) {
          params.userId = user?.id;
        }
        const res = await api.get('/leaves', { params });
        return res.data;
      } catch (err) {
        // Fallback to empty list or sample data if server fails
        console.error("Server Error: Fallback to dummy data", err);
        return [];
      }
    },
    {
      enabled: !!user,
      retry: false, // Stop long loading times
      refetchOnWindowFocus: false
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-6 border-indigo-600 border-t-transparent"></div>
    </div>
  );

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isAdminOrManager ? 'Review and manage employee leave requests.' : 'Track and manage your leave requests.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {displayRole === 'Employee' && (
            <Link
              to="/leaves/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all transform hover:-translate-y-0.5"
            >
              Request Leave
            </Link>
          )}

          <div className="flex items-center gap-2 bg-white dark:bg-white/[0.03] px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 shadow-sm">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border-none focus:ring-0 cursor-pointer text-gray-700 dark:text-gray-200 font-medium bg-transparent"
            >
              <option value="" className="bg-white dark:bg-neutral-800">All Statuses</option>
              <option value="Pending" className="bg-white dark:bg-neutral-800">Pending</option>
              <option value="Approved" className="bg-white dark:bg-neutral-800">Approved</option>
              <option value="Rejected" className="bg-white dark:bg-neutral-800">Rejected</option>
            </select>
          </div>

          {canSeeAll && (
            <label className="flex items-center gap-2 cursor-pointer bg-white dark:bg-white/[0.03] px-3 py-2 rounded-md border border-gray-300 dark:border-white/10 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(e) => setMineOnly(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-white/10 rounded dark:bg-black"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">My Leaves</span>
            </label>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-pulse">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm font-bold tracking-tight">Backend Sync Error: Some data might be missing.</span>
          <button onClick={() => refetch()} className="ml-auto text-xs font-black uppercase underline decoration-2 underline-offset-4">Retry</button>
        </div>
      )}

      {/* Desktop view */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-white/[0.03] backdrop-blur-md shadow-sm ring-1 ring-gray-900/5 dark:ring-white/5 sm:rounded-xl transition-colors duration-300">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/5">
          <thead className="bg-gray-50/50 dark:bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requested By</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/5 bg-transparent">
            {list.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-gray-500 italic dark:text-gray-400">
                  No leave requests found matching your filters.
                </td>
              </tr>
            ) : (
              list.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="font-semibold text-gray-900 dark:text-white">{l.user?.name ?? `User #${l.userId}`}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">ID: {l.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{l.startDate}</span>
                    <span className="mx-1 text-gray-400 dark:text-white/10">to</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{l.endDate}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{l.reason}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {statusBadge(l.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Link to={`/leaves/${l.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded transition-colors">
                        View
                      </Link>

                      {isAdminOrManager ? (
                        <div className="flex gap-1 border-l pl-2 border-gray-200 dark:border-white/10">
                          <button
                            onClick={() => handleStatusChange(l.id, 'Approved')}
                            className="text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 px-2 py-1 rounded transition-colors"
                            title="Approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Rejected')}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                            title="Reject"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleStatusChange(l.id, 'Pending')}
                            className="text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 px-2 py-1 rounded transition-colors"
                            title="Set to Pending"
                          >
                            Pending
                          </button>
                        </div>
                      ) : (l.userId === user?.id) && (
                        <div className="flex gap-1 border-l pl-2 border-gray-200 dark:border-white/10">
                          <Link to={`/leaves/${l.id}/edit`} className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 px-2 py-1 rounded transition-colors">
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(l.id)}
                            className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
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
          <div className="bg-white dark:bg-white/[0.03] p-6 text-center text-gray-500 italic rounded-lg border border-gray-200 dark:border-white/5 transition-colors">
            No leave requests found.
          </div>
        ) : (
          list.map((l) => (
            <div key={l.id} className="bg-white dark:bg-white/[0.03] backdrop-blur-md p-5 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{l.user?.name ?? `User #${l.userId}`}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">ID: {l.id}</p>
                </div>
                {statusBadge(l.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase">From</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{l.startDate}</p>
                </div>
                <div>
                  <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase">To</p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{l.endDate}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase">Reason</p>
                <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{l.reason}</p>
              </div>

              <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex flex-wrap gap-2">
                <Link to={`/leaves/${l.id}`} className="flex-1 text-center bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  View
                </Link>

                {isAdminOrManager ? (
                  <div className="w-full flex gap-2">
                    <button
                      onClick={() => handleStatusChange(l.id, 'Approved')}
                      className="flex-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 py-2 rounded-lg text-sm font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(l.id, 'Rejected')}
                      className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange(l.id, 'Pending')}
                      className="flex-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 py-2 rounded-lg text-sm font-bold hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors"
                    >
                      Pending
                    </button>
                  </div>
                ) : (l.userId === user?.id) && (
                  <div className="w-full flex gap-2">
                    <Link to={`/leaves/${l.id}/edit`} className="flex-1 text-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="flex-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
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
  const base = "px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wider transition-colors";
  if (s === 'Approved') return <span className={`${base} bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-500/20`}>Approved</span>;
  if (s === 'Rejected') return <span className={`${base} bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-500/20`}>Rejected</span>;
  return <span className={`${base} bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20`}>Pending</span>;
}
