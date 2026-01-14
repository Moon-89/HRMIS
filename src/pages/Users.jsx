import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { toast } from 'react-toastify';

export default function Users() {
  const { user } = useAuth();
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchUsers = React.useCallback(async (search = '', roleFilter = '') => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      setUsers([]);
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchUsers(q, role); }, [fetchUsers, role]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Users</h2>
      <div className="flex items-center gap-4 mb-6">
        {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager' || user?.email?.toLowerCase()?.includes('memona@hrmis')) && (
          <Link to="/users/new" className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-sm flex items-center gap-2">
            <span className="text-xl">+</span> Add New User
          </Link>
        )}
        <div className="flex-1" />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Employee">Employee</option>
        </select>
        <input
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
        <button
          onClick={() => fetchUsers(q, role)}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors"
        >
          Search
        </button>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{u.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/users/${u.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold">View</Link>
                    {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'manager' || user?.email?.toLowerCase()?.includes('memona@hrmis')) && (
                      <>
                        <Link to={`/users/${u.id}/edit`} className="text-amber-600 hover:text-amber-900 mr-4 font-bold">Edit</Link>
                        <button onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this user?')) return;
                          try {
                            await api.delete(`/users/${u.id}`);
                            toast.success('User deleted permanently');
                            fetchUsers();
                          } catch (e) {
                            console.error(e);
                            toast.error('Could not delete user');
                          }
                        }} className="text-red-600 hover:text-red-900 bg-transparent border-none cursor-pointer font-bold transition-colors">Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
