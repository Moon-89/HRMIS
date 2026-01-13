import React from 'react';
import { useQuery } from 'react-query';
import api from '../lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { toast } from 'react-toastify';

export default function Leaves() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = React.useState('');
  const [mineOnly, setMineOnly] = React.useState(false);

  const { data, isLoading, error, refetch } = useQuery(['leaves', { status: statusFilter, userId: mineOnly ? user?.id : undefined }], async () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (mineOnly && user?.id) params.userId = user.id;
    const res = await api.get('/leaves', { params });
    return res.data;
  });

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

  if (isLoading) return <div>Loading leaves...</div>;
  if (error) return <div>Error loading leaves</div>;

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Leaves</h2>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/leaves/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
          New Leave Request
        </Link>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mineOnly}
            onChange={(e) => setMineOnly(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-sm font-medium text-gray-700">My leaves</span>
        </label>
      </div>

      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{l.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{l.user?.name ?? l.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.startDate}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{l.endDate}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{l.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">{statusBadge(l.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/leaves/${l.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">View</Link>
                  <Link to={`/leaves/${l.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</Link>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="text-red-600 hover:text-red-900 bg-transparent border-none cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function statusBadge(s) {
  const base = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
  if (s === 'Approved') return <span className={`${base} bg-green-100 text-green-800`}>Approved</span>;
  if (s === 'Rejected') return <span className={`${base} bg-red-100 text-red-800`}>Rejected</span>;
  return <span className={`${base} bg-yellow-100 text-yellow-800`}>Pending</span>;
}
