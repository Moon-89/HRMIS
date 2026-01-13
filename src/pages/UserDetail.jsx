import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'react-toastify';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (e) { console.error(e); }
    })();
  }, [id]);

  if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h2 className="text-xl leading-6 font-bold text-gray-900">User Profile</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">ID: {user.id}</p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 font-semibold">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Address</dt>
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
          </dl>
        </div>

        {currentUser?.role === 'Admin' && (
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex gap-3">
            <button
              onClick={() => navigate(`/users/${user.id}/edit`)}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={async () => {
                if (!window.confirm('Delete user?')) return;
                try {
                  await api.delete(`/users/${user.id}`);
                  toast.success('User deleted');
                  navigate('/users');
                } catch (e) { toast.error('Delete failed'); }
              }}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
