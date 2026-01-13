import React from 'react';
import { useAuth } from '../lib/auth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            Welcome back, <span className="text-indigo-600">{user?.name ?? 'Guest'}</span>!
          </h1>
          <p className="text-gray-500 text-lg">Here's what's happening in your workspace today.</p>
          <div className="mt-6 flex space-x-3">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
              {user?.role ?? 'N/A'}
            </span>
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
              Active
            </span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-50 to-transparent opacity-50"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl p-6 border border-gray-100 group">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-50 rounded-lg p-3 group-hover:bg-indigo-100 transition-colors">
              {/* Icon Placeholder */}
              <span className="text-indigo-600 font-bold text-xl">📝</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                  <span className="sr-only">Increased by</span>
                  12%
                </div>
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl p-6 border border-gray-100 group">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-pink-50 rounded-lg p-3 group-hover:bg-pink-100 transition-colors">
              <span className="text-pink-600 font-bold text-xl">📅</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Upcoming Leaves</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">2</div>
              </dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow rounded-xl p-6 border border-gray-100 group">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 rounded-lg p-3 group-hover:bg-yellow-100 transition-colors">
              <span className="text-yellow-600 font-bold text-xl">👥</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">12</div>
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            Recent Activity
          </h3>
          <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">View all</button>
        </div>
        <ul className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <li key={i} className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="truncate">
                  <div className="flex text-sm">
                    <p className="font-medium text-indigo-600 truncate">Task #{100 + i}</p>
                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">updated by Admin</p>
                  </div>
                  <div className="mt-1 flex">
                    <p className="flex items-center text-sm text-gray-500">Changed status to <span className="ml-1 font-medium text-gray-900">In Progress</span></p>
                  </div>
                </div>
              </div>
              <div className="ml-5 flex-shrink-0">
                <p className="text-sm text-gray-500">{i * 2}h ago</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
