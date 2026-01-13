import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
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

  const isActive = (path) => location.pathname === path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex md:items-center">
              <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                <span className="font-extrabold text-xl tracking-tight text-gray-900">HRMIS</span>
              </div>

              <div className="hidden md:ml-10 md:flex md:space-x-4">
                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
                <Link to="/leaves" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/leaves')}`}>Leaves</Link>
                {user && (
                  <>
                    <Link to="/tasks" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/tasks')}`}>Tasks</Link>
                    <Link to="/users" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/users')}`}>Users</Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <div className="hidden md:flex flex-col items-end mr-2">
                    <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                    <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{user.role}</span>
                  </div>
                  <Link to="/profile" className="p-1 rounded-full text-gray-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex space-x-2">
                  <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                  <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />

          <Route path="/denied" element={<Denied />} />

          <Route path="/dashboard" element={<ProtectedRoute role="Employee"> <Dashboard /> </ProtectedRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="Admin"> <AdminPanel /> </ProtectedRoute>} />

          <Route path="/leaves" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}> <Leaves /> </ProtectedRoute>} />
          <Route path="/leaves/new" element={<ProtectedRoute role="Employee"> <LeaveForm /> </ProtectedRoute>} />
          <Route path="/leaves/:id" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}> <LeaveDetail /> </ProtectedRoute>} />
          <Route path="/leaves/:id/edit" element={<ProtectedRoute roles={["Employee", "Admin", "Manager"]}> <EditLeave /> </ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}><Tasks /></ProtectedRoute>} />
          <Route path="/tasks/new" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}><TaskForm /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}><TaskDetail /></ProtectedRoute>} />
          <Route path="/tasks/:id/edit" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}><EditTask /></ProtectedRoute>} />

          <Route path="/users" element={<ProtectedRoute roles={["Admin", "Manager", "Employee"]}><Users /></ProtectedRoute>} />
          <Route path="/users/new" element={<ProtectedRoute role={"Admin"}><UserForm /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute roles={["Admin", "Manager", "Employee"]}><UserDetail /></ProtectedRoute>} />
          <Route path="/users/:id/edit" element={<ProtectedRoute role={"Admin"}><UserForm /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={["Employee", "Manager", "Admin"]}><Profile /></ProtectedRoute>} />
        </Routes>
      </main>
    </>
  );
}
