import React from 'react';
import { useQuery } from 'react-query';
import api from '../lib/api';
import { Link } from 'react-router-dom';

export default function Tasks() {
  const [status, setStatus] = React.useState('');
  const { data, isLoading, error } = useQuery(['tasks', status], async () => {
    try {
      const params = {};
      if (status) params.status = status;
      const qs = new URLSearchParams(params).toString();
      // Use explicit mock server URL to avoid same-origin dev server handling
      const base = 'http://localhost:4000';
      const url = base + '/tasks' + (qs ? `?${qs}` : '');
      console.log('Fetching tasks from (forced)', url);
      let res = await fetch(url, { credentials: 'include' });
      let text = await res.text().catch(() => null);
      // If server returned HTML like CRA's 404 page, try direct fallback to localhost:4000
      if (text && typeof text === 'string' && text.includes('Cannot GET')) {
        console.warn('Received HTML error from', url, '- trying fallback http://localhost:4000/tasks');
        res = await fetch('http://localhost:4000/tasks' + (qs ? `?${qs}` : ''), { credentials: 'include' });
        text = await res.text().catch(() => null);
      }
      if (!res.ok) {
        throw new Error(`${res.status} - ${text || res.statusText}`);
      }
      return JSON.parse(text || 'null');
    } catch (err) {
      console.error('Tasks fetch error', err);
      throw err;
    }
  });

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks: {String(error.message || error)}</div>;

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Tasks</h2>
      <div className="flex items-center gap-4 mb-6">
        <Link to="/tasks/new" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
          New Task
        </Link>
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">All</option>
            <option value="Todo">Todo</option>
            <option value="InProgress">InProgress</option>
            <option value="Done">Done</option>
          </select>
        </label>
      </div>

      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {list.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t.assignee ?? 'Unassigned'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link to={`/tasks/${t.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
