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

  const isAdminOrManager = currentUser?.role === 'Admin' || currentUser?.role === 'Manager';

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
    <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-neutral-900 -mt-24">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
    </div>
  );

  if (!user) return null;

  const isEmailVerified = !!user.email_verified_at;

  const getRoleTheme = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin': return 'from-rose-500 to-indigo-600';
      case 'manager': return 'from-blue-500 to-cyan-500';
      default: return 'from-emerald-500 to-teal-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-700 transition-colors duration-300">
      <div className="mb-8">
        <button onClick={() => navigate('/users')} className="group text-sm font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-400 flex items-center gap-2 transition-all uppercase tracking-widest">
          <span className="text-xl group-hover:-translate-x-2 transition-transform">←</span>
          Return to Personnel Deck
        </button>
      </div>

      <div className="relative group">
        <div className={`absolute -inset-1 bg-gradient-to-r ${getRoleTheme(user.role)} rounded-[3rem] blur opacity-15 dark:opacity-25 group-hover:opacity-25 dark:group-hover:opacity-35 transition duration-1000`}></div>
        
        <div className="relative bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 transition-colors duration-300">
          {/* Decorative Banner */}
          <div className={`h-64 bg-gradient-to-br ${getRoleTheme(user.role)} relative overflow-hidden transition-colors`}>
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4"></div>
            </div>
            <div className="absolute bottom-10 left-12">
              <div className="flex flex-wrap items-center gap-4">
                <span className="px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl">
                  {user.role} Intelligence
                </span>
                {isEmailVerified && (
                  <span className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/80 backdrop-blur-md border border-emerald-400/50 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Identity Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-12 pb-16">
            <div className="relative -mt-32 flex flex-col lg:flex-row items-center lg:items-end gap-12 mb-16">
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-tr ${getRoleTheme(user.role)} rounded-[3.5rem] blur-xl opacity-30 animate-pulse`}></div>
                <div className="relative h-60 w-60 rounded-[3.5rem] bg-white dark:bg-white/[0.03] p-3 shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden transform transition-all duration-500 hover:scale-105">
                  <div className={`h-full w-full rounded-[3rem] bg-gradient-to-tr ${getRoleTheme(user.role)} flex items-center justify-center text-8xl font-black text-white shadow-inner border border-white/10`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center lg:text-left pt-10 lg:pt-0">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-5">
                  <h1 className="text-7xl font-black text-gray-900 dark:text-white tracking-[-0.05em] leading-tight transition-colors">{user.name}</h1>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-bold text-2xl mb-4 italic transition-colors">{user.designation || 'Strategic Specialist Officer'}</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <p className={`px-6 py-2.5 rounded-2xl bg-gradient-to-r ${getRoleTheme(user.role)} text-white shadow-xl text-sm font-black uppercase tracking-widest border border-white/20`}>
                    {user.department || 'Operations Control'}
                  </p>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.03] px-4 py-2 rounded-xl border border-gray-100 dark:border-white/5 transition-colors">
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Hash ID</span>
                    <span className="text-sm font-black text-gray-700 dark:text-gray-200 font-mono transition-colors">#{user.id}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              <div className="group bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform transition-colors">📧</div>
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Primary Contact</h4>
                <p className="text-sm font-black text-gray-800 dark:text-white break-all transition-colors">{user.email}</p>
                {user.email_verified_at && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Verified {new Date(user.email_verified_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="group bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform transition-colors">📱</div>
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Comms Line</h4>
                <p className="text-xl font-black text-gray-800 dark:text-white transition-colors">{user.phone || 'NO RECORD'}</p>
                <p className="mt-2 text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest">Active Link</p>
              </div>

              <div className="group bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center text-3xl shadow-sm mb-6 group-hover:scale-110 transition-transform transition-colors">🏢</div>
                <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2">Business Unit</h4>
                <p className="text-xl font-black text-gray-800 dark:text-white uppercase leading-none transition-colors">{user.department || 'Operations'}</p>
                <p className="mt-2 text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase italic">Main Division</p>
              </div>

              <div className={`p-8 rounded-[2.5rem] shadow-2xl dark:shadow-none shadow-indigo-100 border border-white/20 flex flex-col justify-between hover:scale-[1.05] transition-all duration-500 bg-gradient-to-br ${getRoleTheme(user.role)} text-white relative overflow-hidden group`}>
                <div className="absolute -right-6 -top-6 text-white/10 text-[8rem] font-black transition-transform group-hover:rotate-12">#</div>
                <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">System Identity</h4>
                <div>
                  <p className="text-4xl font-black mb-1 drop-shadow-md">{user.id}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/80">Active Personnel Data</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 pt-12 border-t border-gray-100 dark:border-white/10 transition-colors">
              <section className="space-y-10">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4 italic group transition-colors">
                  <span className={`h-8 w-2 rounded-full bg-gradient-to-b ${getRoleTheme(user.role)} transition-all group-hover:h-12`}></span>
                  Personal dossier
                </h3>
                <div className="space-y-6">
                  <div className="group flex flex-col gap-3 p-8 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2rem] hover:bg-white dark:hover:bg-white/[0.05] hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all hover:shadow-xl dark:hover:shadow-none">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌍</span>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] transition-colors">Verified Residence</span>
                    </div>
                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed capitalize transition-colors">
                      {user.address || 'Address information restricted or not documented.'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-8 bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/[0.05] transition-all hover:shadow-lg dark:hover:shadow-none">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-3 transition-colors">Enlistment</span>
                      <p className="font-black text-gray-800 dark:text-white text-2xl tracking-tighter transition-colors">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-[8px] font-bold text-emerald-500 uppercase mt-2 tracking-[0.2em] transition-colors">Validated</p>
                    </div>
                    <div className="p-8 bg-gray-50/80 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/[0.05] transition-all hover:shadow-lg dark:hover:shadow-none">
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] block mb-3 transition-colors">Sync Status</span>
                      <p className="font-black text-gray-800 dark:text-white text-2xl tracking-tighter transition-colors">
                        {user.updated_at ? new Date(user.updated_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric', day: 'numeric' }) : 'N/A'}
                      </p>
                      <p className="text-[8px] font-bold text-indigo-500 uppercase mt-2 tracking-[0.2em] transition-colors">Latest Refresh</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-10">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-4 italic group transition-colors">
                  <span className="h-8 w-2 rounded-full bg-gradient-to-b from-gray-900 to-gray-400 dark:from-white dark:to-gray-500 transition-all group-hover:h-12"></span>
                  Corporate Authority
                </h3>
                {isAdminOrManager && user.email?.toLowerCase() !== 'memona@hrmis.com' ? (
                  <div className="grid grid-cols-2 gap-6">
                    <button
                      onClick={() => navigate(`/users/${user.id}/edit`)}
                      className="flex flex-col items-center justify-center gap-4 p-10 bg-white dark:bg-white/[0.03] border-2 border-indigo-50 dark:border-white/5 rounded-[3rem] hover:border-indigo-600 dark:hover:border-indigo-500 transition-all hover:shadow-2xl dark:hover:shadow-none group/btn"
                    >
                      <span className="text-4xl group-hover/btn:scale-125 group-hover/btn:rotate-12 transition-transform">⚙️</span>
                      <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.3em] transition-colors">Modify Access</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (user.id === currentUser?.id) return toast.error("Self-destruction blocked by core logic.");
                        if (!window.confirm('Erase this personnel record permanently?')) return;
                        try {
                          await api.delete(`/users/${user.id}`);
                          toast.success('Record purged');
                          navigate('/users');
                      } catch (e) { toast.error('Removal failed'); }
                      }}
                      className="flex flex-col items-center justify-center gap-4 p-10 bg-white dark:bg-white/[0.03] border-2 border-rose-50 dark:border-white/5 rounded-[3rem] hover:border-rose-600 dark:hover:border-rose-500 transition-all hover:shadow-2xl dark:hover:shadow-none group/btn"
                    >
                      <span className="text-4xl group-hover/btn:scale-125 group-hover/btn:-rotate-12 transition-transform">🗑️</span>
                      <span className="text-[10px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-[0.3em] transition-colors">Terminate Link</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-10 bg-gray-100 dark:bg-white/[0.02] rounded-[3rem] border border-dashed border-gray-300 dark:border-white/10 text-center flex flex-col items-center justify-center gap-3 grayscale opacity-60 transition-colors">
                    <span className="text-4xl">🔒</span>
                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest leading-relaxed transition-colors">
                      Administrative Control Terminal Locked<br/>
                      <span className="text-[10px] opacity-60 font-bold transition-colors">Standard clearance levels detected</span>
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
