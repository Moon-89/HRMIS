import React from 'react';
import { useAuth } from '../lib/auth';
import { useQuery } from 'react-query';
import api from '../lib/api';

export default function Profile() {
  const { user: authUser } = useAuth();

  const { data: userProfile, isLoading } = useQuery('profile', async () => {
    const res = await api.get('/users/profile');
    return res.data;
  }, { enabled: !!authUser });

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-slate-50 dark:bg-neutral-900">
      <div className="relative">
        <div className="h-32 w-32 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] animate-pulse">
          Loading
        </div>
      </div>
    </div>
  );

  const user = userProfile || authUser;

  if (!user) return null;

  const isAdmin = user.email === 'memona@hrmis.com';
  const displayRole = isAdmin ? 'Admin' : user.role;
  const isEmailVerified = !!user.email_verified_at;

  const getRoleTheme = (r) => {
    switch (r?.toLowerCase()) {
      case 'admin': return 'from-rose-500 via-purple-600 to-indigo-800';
      case 'manager': return 'from-blue-600 via-cyan-500 to-indigo-700';
      default: return 'from-emerald-500 via-teal-600 to-cyan-700';
    }
  };

  const Field = ({ label, value, icon, badge }) => (
    <div className="group relative bg-slate-50/50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-8 rounded-[2.5rem] hover:bg-white dark:hover:bg-white/[0.06] hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] dark:hover:shadow-none hover:border-indigo-100 dark:hover:border-white/10 transition-all duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{icon}</div>
        <h4 className="text-[10px] font-black text-slate-400 dark:text-indigo-400 uppercase tracking-[0.3em]">{label}</h4>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-none truncate max-w-full">
          {value || 'RESTRICTED'}
        </p>
        {badge}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0a0a0c] py-20 px-4 sm:px-6 lg:px-8 selection:bg-indigo-100 dark:selection:bg-indigo-500 selection:text-indigo-900 dark:selection:text-white transition-colors duration-300">
      <div className="max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-700">
        <div className="relative group">
          {/* Subtle Outer Glow */}
          <div className={`absolute -inset-1 bg-gradient-to-r ${getRoleTheme(displayRole)} rounded-[4rem] blur-2xl opacity-5 dark:opacity-20 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-1000`}></div>
          
          <div className="relative bg-white dark:bg-[#111114]/80 backdrop-blur-3xl border border-slate-200 dark:border-white/5 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.05)] rounded-[4rem] overflow-hidden transition-colors duration-300">
            {/* Header / Avatar Banner Area */}
            <div className="p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 bg-gradient-to-br from-white to-slate-50 dark:from-transparent dark:to-transparent">
              <div className="relative group/avatar">
                <div className={`absolute -inset-4 bg-gradient-to-tr ${getRoleTheme(displayRole)} rounded-full blur-xl opacity-20 dark:opacity-30 animate-pulse group-hover:opacity-40 transition-opacity`}></div>
                <div className="relative h-72 w-72 rounded-full border-4 border-white dark:border-white/10 p-2 shadow-2xl overflow-hidden bg-white dark:bg-transparent">
                  <div className={`h-full w-full rounded-full bg-gradient-to-tr ${getRoleTheme(displayRole)} flex items-center justify-center text-[10rem] font-black text-white shadow-inner select-none italic`}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center md:text-left space-y-8">
                <div>
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                    <span className={`px-6 py-2 rounded-full bg-gradient-to-r ${getRoleTheme(displayRole)} text-[10px] font-black text-white uppercase tracking-[0.3em] shadow-lg border border-white/20`}>
                      {displayRole} Authorization
                    </span>
                    {isEmailVerified && (
                      <span className="flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest shadow-sm">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Identity Verified
                      </span>
                    )}
                  </div>
                  <h1 className="text-8xl font-black text-slate-900 dark:text-white tracking-[-0.05em] leading-[0.85] mb-6">
                    {user.name}
                  </h1>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-10">
                  <div className="flex items-center gap-3 group">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">🎖️</div>
                    <p className="text-xl font-black text-slate-500 dark:text-gray-400 uppercase tracking-widest leading-none">{user.designation || 'Strategic Officer'}</p>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-3 group">
                    <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 group-hover:scale-110 transition-transform">🏛️</div>
                    <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none">{user.department || 'Operations'}</p>
                  </div>
                </div>
              </div>

              <div className="hidden xl:block text-right self-start border-l border-slate-100 dark:border-white/10 pl-16">
                <p className="text-slate-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">System Hash</p>
                <p className="text-slate-900 dark:text-white font-mono text-3xl font-black opacity-80">ID–{user.id.toString().padStart( '0')}</p>
              </div>
            </div>

            {/* Main Data Intelligence Hub */}
            <div className="p-12 md:p-20 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-black/20 transition-colors duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <Field 
                  label="Unique Identifier" 
                  value={`ID-${user.id.toString().padStart( '0')}`} 
                  icon="🆔" 
                />
                <Field 
                  label="Legal Full Name" 
                  value={user.name} 
                  icon="👤" 
                />
                <Field 
                  label="Professional Email" 
                  value={user.email} 
                  icon="📧" 
                  badge={isEmailVerified && (
                    <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                      SECURED
                    </span>
                  )}
                />
                <Field 
                  label="Department Wing" 
                  value={user.department} 
                  icon="🏢" 
                />
                <Field 
                  label="Current Designation" 
                  value={user.designation} 
                  icon="🎖️" 
                />
                <Field 
                  label="Contact Endpoint" 
                  value={user.phone} 
                  icon="📱" 
                />
                <Field 
                  label="Auth Clearance" 
                  value={displayRole} 
                  icon="🔒" 
                />
                <Field 
                  label="Verification Timestamp" 
                  value={user.email_verified_at ? new Date(user.email_verified_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'PENDING'} 
                  icon="📅" 
                  badge={!user.email_verified_at && (
                    <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20">
                      ACT REQUIRED
                    </span>
                  )}
                />
                <div className="group bg-indigo-50/50 dark:bg-indigo-500/5 backdrop-blur-md border border-indigo-100 dark:border-indigo-500/10 p-8 rounded-[3rem] flex flex-col justify-center items-center text-center hover:bg-white dark:hover:bg-white/[0.05] hover:shadow-2xl dark:hover:shadow-none transition-all duration-500">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">Record Sync Status</p>
                  <div className="flex gap-12 items-center">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase mb-1">Enrolled</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="w-px h-10 bg-indigo-200 dark:bg-indigo-500/20"></div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 dark:text-gray-500 uppercase mb-1">Last Sync</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-400 dark:text-gray-600 text-[10px] font-black uppercase tracking-[0.6em] opacity-40 mt-12 pb-10">
          Global Personnel Database • Authorization Protocol v5.2
        </p>
      </div>
    </div>
  );
}
