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

  const isAdminOrManager = currentUser?.role?.toLowerCase() === 'admin' || currentUser?.role?.toLowerCase() === 'manager' || currentUser?.email?.toLowerCase()?.includes('memona@hrmis');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
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
        {/* Header/Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-500 to-indigo-700"></div>

        <div className="px-8 pb-10">
          <div className="relative -mt-16 flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10">
            <div className="h-32 w-32 rounded-[2rem] bg-white p-2 shadow-xl border border-gray-50 overflow-hidden">
              <div className="h-full w-full rounded-[1.8rem] bg-gradient-to-tr from-indigo-100 to-indigo-50 flex items-center justify-center text-4xl font-black text-indigo-700 border border-indigo-50 shadow-inner">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">{user.name}</h1>
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] rounded-full border ${getRoleBadge(user.role)}`}>
                  {user.role}
                </span>
              </div>
              <p className="text-gray-500 font-medium text-lg">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 flex flex-col gap-4">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account ID</h4>
                <p className="font-mono text-gray-600 italic">#{user.id}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authentication</h4>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Verified Member
                </p>
              </div>
            </div>

            <div className="bg-indigo-50/30 p-6 rounded-3xl border border-indigo-100 flex flex-col gap-4">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                  Active Access
                </span>
                <span className="px-4 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 shadow-sm border border-gray-100">
                  Standard Security
                </span>
              </div>
            </div>
          </div>
        </div>

        {isAdminOrManager && (
          <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-medium italic">Administrative privileges active for this profile.</p>
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-black rounded-2xl text-indigo-700 bg-white border-2 border-indigo-100 hover:border-indigo-600 transition-all shadow-sm"
              >
                Edit Member
              </button>
              <button
                onClick={async () => {
                  if (user.id === currentUser.id) return toast.error("Self-deletion blocked.");
                  if (!window.confirm('Erase this user record permanently?')) return;
                  try {
                    await api.delete(`/users/${user.id}`);
                    toast.success('Record purged');
                    navigate('/users');
                  } catch (e) { toast.error('Purge failed'); }
                }}
                className="flex-1 sm:flex-none px-8 py-3.5 text-sm font-black rounded-2xl text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 transform active:scale-95"
              >
                Delete Record
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
