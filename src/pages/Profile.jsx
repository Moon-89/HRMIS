import React from 'react';
import { useAuth } from '../lib/auth';
import { useQuery } from 'react-query';
import api from '../lib/api';

export default function Profile() {
  const { user: authUser } = useAuth();

  const { data: userProfile, isLoading } = useQuery('profile', async () => {
    const res = await api.get('/users/profile');
    return res.data;
  });

  if (isLoading) return <div className="p-6 text-center">Loading profile...</div>;

  const user = userProfile || authUser;

  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-2xl font-bold">
              {user.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</p>
              <p className="text-xl font-bold text-gray-900">{user.name}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</p>
            <p className="text-lg text-gray-900 mt-1">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Access Role</p>
            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {(user.email?.toLowerCase()?.includes('memona@hrmis') || user.role?.toLowerCase() === 'admin') ? 'Admin' : user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
