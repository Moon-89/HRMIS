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
  const [error, setError] = React.useState(null);

  const isAdminOrManager = currentUser?.role === 'Admin';

  const fetchUsers = React.useCallback(async (search = '', roleFilter = '') => {
    if (!isAdminOrManager) return; // Don't fetch if not admin
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.q = search;
      if (roleFilter) params.role = roleFilter;
      const token = localStorage.getItem('hrmis_token');
      const res = await api.get('/users', {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (e) {
      console.error(e);
      setUsers([]);
      setError(e);
      toast.error('Failed to load users');
    } finally { setLoading(false); }
  }, [isAdminOrManager]);

  React.useEffect(() => {
    if (!isAdminOrManager) return;
    const debounce = setTimeout(() => fetchUsers(q, role), 300);
    return () => clearTimeout(debounce);
  }, [q, role, fetchUsers, isAdminOrManager]);

  if (!currentUser) return <div className="p-20 text-center animate-pulse font-bold text-gray-400">Authenticating session...</div>;

  if (!isAdminOrManager) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Access Restricted</h2>
          <p className="text-yellow-600">Only Admin and Manager users can view the personnel directory.</p>
        </div>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    try {
      const token = localStorage.getItem('hrmis_token');
      await api.delete(`/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight italic">Personnel Directory</h1>
          <p className="mt-1 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose italic">Managing the workforce efficiently.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrManager && (
            <Link to="/users/new" className="inline-flex items-center px-6 py-3 border border-transparent text-xs font-black rounded-2xl shadow-xl shadow-indigo-100 uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-1 active:scale-95">
              + New Member
            </Link>
          )}

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex-1 md:flex-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              placeholder="Search directory..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="text-sm border-none focus:ring-0 w-full md:w-32 bg-transparent font-medium"
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Filter</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="text-sm border-none focus:ring-0 bg-transparent font-bold text-gray-700 cursor-pointer p-0"
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
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-r-transparent"></div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between gap-4 text-amber-700 shadow-xl shadow-amber-50/20">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-2 rounded-xl">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">Partial Sync Error</p>
                  <p className="text-[9px] font-bold opacity-70">Some personnel data might be unavailable due to a server method error.</p>
                </div>
              </div>
              <button
                onClick={() => fetchUsers(q, role)}
                className="bg-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-amber-100 transition-colors"
              >
                Retry Sync
              </button>
            </div>
          )}
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden bg-white shadow-2xl rounded-[2.5rem] border border-gray-50">
            <table className="min-w-full divide-y divide-gray-50">
              <thead className="bg-gray-50/30">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Full Name / Identity</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Deparment / Position</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Security Role</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">No members found matching your search.</td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="group hover:bg-indigo-50/20 transition-all">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-3xl bg-gradient-to-tr from-indigo-100 to-white border border-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-inner group-hover:scale-110 transition-transform">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-base font-black text-gray-900 tracking-tight">{u.name}</div>
                            <div className="text-xs text-indigo-400 font-bold tracking-wider">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="text-sm font-black text-gray-800 uppercase tracking-widest">{u.department || 'General'}</div>
                        <div className="text-xs text-gray-400 font-bold italic">{u.designation || 'Specialist'}</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm">
                        <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-full border shadow-sm ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center gap-3">
                          <Link to={`/api/users/${u.id}`} className="text-indigo-600 bg-white border border-indigo-50 px-4 py-2 rounded-xl transition-all font-black uppercase tracking-widest shadow-sm hover:shadow-indigo-100 hover:border-indigo-600">
                            Details
                          </Link>
                          {isAdminOrManager && (
                            <div className="flex gap-2">
                              <Link to={`/api/users/${u.id}/edit`} className="text-amber-600 bg-amber-50/50 hover:bg-amber-100 p-2 rounded-xl transition-all shadow-sm">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </Link>
                              <button
                                onClick={() => handleDelete(u.id)}
                                className="text-red-500 bg-red-50/50 hover:bg-red-100 p-2 rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

          {/* Mobile Grid View */}
          <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
            {users.length === 0 ? (
              <div className="col-span-full bg-white p-12 text-center text-gray-400 font-bold uppercase tracking-widest italic rounded-[2.5rem] border border-gray-50">No results found.</div>
            ) : (
              users.map(u => (
                <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-xl space-y-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50 rounded-bl-[100%] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-gray-900 tracking-tight truncate text-lg">{u.name}</h3>
                      <p className="text-xs text-indigo-400 font-bold truncate tracking-wider">{u.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{u.designation || 'Staff'} — {u.department || 'Operations'}</p>
                    <p className="text-[9px] font-bold text-gray-300">Member ID: #{u.id}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className={`px-4 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full border shadow-sm ${getRoleBadge(u.role)}`}>
                      {u.role}
                    </span>
                    <Link to={`/api/users/${u.id}`} className="text-[9px] font-black text-indigo-600 uppercase tracking-[0.2em] underline underline-offset-4">Profile Details →</Link>
                  </div>

                  {isAdminOrManager && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Link to={`/api/users/${u.id}/edit`} className="flex items-center justify-center gap-2 bg-amber-50/50 text-amber-700 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-100 transition-colors">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Update
                      </Link>
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="flex items-center justify-center gap-2 bg-rose-50/50 text-rose-700 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
