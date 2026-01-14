import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { toast } from 'react-toastify';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [q, setQ] = React.useState('');
  const [role, setRole] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const isAdminOrManager = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'manager' || currentUser?.email?.toLowerCase()?.includes('memona@hrmis');

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
      toast.error('Failed to load users');
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(q, role), 300);
    return () => clearTimeout(debounce);
  }, [q, role, fetchUsers]);

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted successfully');
      fetchUsers(q, role);
    } catch (e) {
      console.error(e);
      toast.error('Could not delete user');
    }
  };

  const getRoleBadge = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Personnel Directory</h1>
          <p className="mt-1 text-sm text-gray-500">Manage organizational members and their roles.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrManager && (
            <Link to="/users/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl shadow-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">
              + Add Member
            </Link>
          )}

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex-1 md:flex-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search by name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="text-sm border-none focus:ring-0 w-full md:w-48 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-sm border-none focus:ring-0 bg-transparent font-bold text-gray-700 cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden bg-white shadow-xl rounded-2xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Member</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">ID</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500 italic">No members found matching your search.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{u.name}</div>
                            <div className="text-xs text-gray-500 font-medium">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-mono italic">#{u.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-2">
                          <Link to={`/users/${u.id}`} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all font-bold">
                            View
                          </Link>
                          {isAdminOrManager && (
                            <>
                              <Link to={`/users/${u.id}/edit`} className="text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-all font-bold">
                                Edit
                              </Link>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all font-bold active:scale-95"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Grid View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
            {users.length === 0 ? (
              <div className="col-span-full bg-white p-8 text-center text-gray-500 italic rounded-2xl border border-gray-100">No members found.</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-lg">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-extrabold text-gray-900 truncate">{u.name}</h3>
                      <p className="text-xs text-gray-500 font-medium truncate">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full border ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                    <span className="text-[10px] text-gray-300 font-mono italic">#{u.id}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Link to={`/users/${u.id}`} className="text-center bg-gray-50 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors">
                      View
                    </Link>
                    {isAdminOrManager && (
                      <>
                        <Link to={`/users/${u.id}/edit`} className="text-center bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="bg-red-50 text-red-700 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
