import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'react-toastify';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdminOrManager = currentUser?.role === 'Admin';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('hrmis_token');
        const res = await api.get(`/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setUser(res.data);
      } catch (e) {
        console.error(e);
        toast.error('User not found');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen -mt-24">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user) return null;

  const getRoleBadge = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button onClick={() => navigate('/users')} className="text-sm font-bold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-all hover:-translate-x-1">
          ← Back to Personnel List
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-[2.5rem] overflow-hidden border border-gray-100 relative">
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-violet-700 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>

        <div className="px-8 pb-10">
          <div className="relative -mt-20 flex flex-col sm:flex-row items-center sm:items-end gap-8 mb-12">
            <div className="h-40 w-40 rounded-[2.5rem] bg-white p-2 shadow-2xl border border-gray-50 overflow-hidden">
              <div className="h-full w-full rounded-[2.2rem] bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center text-5xl font-black text-indigo-700 border border-indigo-50 shadow-inner">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left pt-4 sm:pt-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3">
                <h1 className="text-5xl font-black text-gray-900 tracking-tighter">{user.name}</h1>
                <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border shadow-sm ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-gray-500 font-bold text-xl mb-2">{user.designation || 'Specialist'}</p>
              <p className="text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl inline-block text-sm font-black uppercase tracking-widest border border-indigo-100">
                {user.department || 'Operations'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Direct Contact</h4>
              <p className="text-lg font-black text-gray-800 break-words mb-1">{user.email}</p>
              <p className="text-sm font-bold text-indigo-500">{user.phone || 'No phone recorded'}</p>
            </div>

            <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-200 hover:shadow-lg transition-all">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">System Identity</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-300 italic">#</span>
                <span className="text-2xl font-black text-gray-800 font-mono italic">{user.id}</span>
              </div>
              <p className="mt-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 inline-block uppercase tracking-wider">
                Verified Member
              </p>
            </div>

            <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-4">Organizational Status</h4>
              <div>
                <p className="text-white text-xl font-black mb-1">Active</p>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Full Access Permissions</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 italic">
                <span className="h-6 w-1.5 bg-indigo-600 rounded-full"></span>
                Profile Highlights
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-indigo-200 transition-colors">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🏢</div>
                  <div>
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Primary Unit</h5>
                    <p className="text-sm font-bold text-gray-800">{user.department || 'Not Assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-indigo-200 transition-colors">
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl">🎖️</div>
                  <div>
                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Post</h5>
                    <p className="text-sm font-bold text-gray-800">{user.designation || 'Staff'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 italic">
                <span className="h-6 w-1.5 bg-rose-500 rounded-full"></span>
                Administrative Control
              </h3>
              {isAdminOrManager ? (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-indigo-50 rounded-3xl hover:border-indigo-600 transition-all hover:shadow-xl group"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">⚙️</span>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Revise Profile</span>
                  </button>
                  <button
                    onClick={async () => {
                      if (user.id === currentUser.id) return toast.error("Self-deletion blocked.");
                      if (!window.confirm('Delete this user permanently from the system?')) return;
                      try {
                        const token = localStorage.getItem('hrmis_token');
                        await api.delete(`/users/${user.id}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        });
                        toast.success('Personnel record removed');
                        navigate('/users');
                      } catch (e) { toast.error('Removal failed'); }
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-6 bg-white border-2 border-rose-50 rounded-3xl hover:border-rose-600 transition-all hover:shadow-xl group"
                  >
                    <span className="text-2xl group-hover:scale-125 transition-transform">🗑️</span>
                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest">Terminate Account</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
                  <p className="text-sm font-bold text-gray-400 italic">Access to administrative controls restricted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
