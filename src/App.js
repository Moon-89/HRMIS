import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import React from 'react';
import ProtectedRoute from './lib/ProtectedRoute';
import LoginForm from './feature/auth/LoginForm';
import RegisterForm from './feature/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Denied from './pages/Denied';
import Leaves from './pages/Leaves';
import LeaveForm from './pages/LeaveForm';
import LeaveDetail from './pages/LeaveDetail';
import EditLeave from './pages/EditLeave';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import TaskDetail from './pages/TaskDetail';
import EditTask from './pages/EditTask';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import UserDetail from './pages/UserDetail';
import Profile from './pages/Profile';
import './index.css';


import { useAuth } from './lib/auth';

export default function App() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path) =>
    location.pathname === path
      ? 'text-indigo-600 bg-indigo-50 font-bold'
      : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                <span className="font-extrabold text-xl tracking-tight text-gray-900 border-b-2 border-indigo-600">HRMIS</span>
              </div>

              <div className="hidden md:ml-10 md:flex md:space-x-4">
                {user && (
                  <>
                    <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
                    <Link to="/leaves" className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${isActive('/leaves')}`}>Leaves</Link>
                    <Link to="/tasks" className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${isActive('/tasks')}`}>Tasks</Link>
                  </>
                )}
                {user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager' || user.email?.toLowerCase()?.includes('memona@hrmis')) && (
                  <Link to="/users" className={`px-3 py-2 rounded-md text-sm font-bold transition-colors ${isActive('/users')}`}>Users</Link>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-gray-800">{user.name}</span>
                    <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-indigo-100">
                      {(user.email?.toLowerCase()?.includes('memona@hrmis') || user.role?.toLowerCase() === 'admin') ? 'Admin' : user.role}
                    </span>
                  </div>
                  <Link to="/profile" className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all transform hover:-translate-y-0.5"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link to="/login" className="text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold transition-all">Login</Link>
                  <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5">Register</Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu content */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 shadow-xl overflow-hidden animate-in slide-in-from-top duration-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {user && (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/dashboard')}`}>Dashboard</Link>
                  <Link to="/leaves" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/leaves')}`}>Leaves</Link>
                  <Link to="/tasks" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/tasks')}`}>Tasks</Link>
                </>
              )}
              {user && (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'manager' || user.email?.toLowerCase()?.includes('memona@hrmis')) && (
                <Link to="/users" onClick={() => setIsMenuOpen(false)} className={`block px-3 py-2 rounded-md text-base font-bold ${isActive('/users')}`}>Users</Link>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-gray-100 px-4">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {user.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-800">{user.name}</div>
                      <div className="text-sm font-medium text-gray-500">{(user.email?.toLowerCase()?.includes('memona@hrmis') || user.role?.toLowerCase() === 'admin') ? 'Admin' : user.role}</div>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-gray-600 font-bold hover:text-indigo-600 py-2">Profile</Link>
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 text-gray-600 font-bold border rounded-xl">Login</Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Register</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-12 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />

          <Route path="/denied" element={<Denied />} />

          <Route path="/dashboard" element={<ProtectedRoute roles={["Admin", "Manager", "Employee"]}> <Dashboard /> </ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="Admin"> <AdminPanel /> </ProtectedRoute>} />

          <Route path="/leaves" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}> <Leaves /> </ProtectedRoute>} />
          <Route path="/leaves/new" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}> <LeaveForm /> </ProtectedRoute>} />
          <Route path="/leaves/:id" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}> <LeaveDetail /> </ProtectedRoute>} />
          <Route path="/leaves/:id/edit" element={<ProtectedRoute roles={["Admin", "Manager", "Employee"]}> <EditLeave /> </ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}><Tasks /></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute roles={["Manager", "Admin"]}><TaskForm /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}><TaskDetail /></ProtectedRoute>} />
          <Route path="/tasks/:id/edit" element={<ProtectedRoute roles={["Admin", "Manager"]}><EditTask /></ProtectedRoute>} />

          <Route path="/users" element={<ProtectedRoute roles={["Admin", "Manager"]}><Users /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute roles={["Admin", "Manager"]}><UserForm /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute roles={["Admin", "Manager"]}><UserDetail /></ProtectedRoute>} />
          <Route path="/users/:id/edit" element={<ProtectedRoute roles={["Admin", "Manager"]}><UserForm /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={["Manager", "Admin", "Employee"]}><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
