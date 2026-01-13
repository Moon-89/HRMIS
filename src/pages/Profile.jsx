import React from 'react';
import { useAuth } from '../lib/auth';

export default function Profile() {
  const { user } = useAuth();

  // ProtectedRoute ensures user exists, but optional chaining is safe
  if (!user) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl leading-6 font-bold text-gray-900">My Profile</h2>
        </div>
        <div className="px-4 py-5 sm:p-6 space-y-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Full Name</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {user.role}
              </span>
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
