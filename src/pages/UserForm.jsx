import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { useAuth } from '../lib/auth';

export default function UserForm() {
  const { user: currentUser } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'Employee',
    department: '',
    designation: '',
    phone: '',
    password: ''
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        const d = res.data;
        setForm({
          name: d.name || '',
          email: d.email || '',
          role: d.role || 'Employee',
          department: d.department || '',
          designation: d.designation || '',
          phone: d.phone || '',
          password: ''
        });
      } catch (e) {
        console.error(e);
        toast.error('Could not load member data');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password; // Don't send empty password

      // Security Check: Block Managers from granting Manager/Admin roles or editing Admin profile
      if (currentUser?.role === 'Manager') {
        if (form.email.toLowerCase() === 'memona@hrmis.com') {
          toast.error('Managers cannot modify the Admin profile.');
          setLoading(false);
          return;
        }
      }

      if (id) {
        await api.put(`/users/${id}`, payload);
        toast.success(`${form.name}'s profile updated`);
        navigate(`/users/${id}`);
      } else {
        await api.post('/users', payload);
        toast.success('New personal record created');
        navigate('/users');
      }
    } catch (e) {
      console.error(e);
      const msg = e?.response?.data?.message || 'Failed to save personal record';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) return <div className="flex justify-center p-20 transition-colors"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-r-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 transition-colors duration-300">
      <div className="bg-white dark:bg-[#111114]/80 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 italic transition-all duration-300">
        <div className="p-10 md:p-14">
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tighter transition-colors">
            {id ? 'Revise Personal Record' : 'Enroll New Personal'}
          </h2>
          <p className="text-gray-400 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-xs mb-10 transition-colors">
            Ensure all information is accurate and verified.
          </p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 not-italic">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Legal Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                placeholder="e.g. Maham Fatima"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Professional Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                placeholder="name@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Contact Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                placeholder="+92 3XX XXXXXXX"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Allocated Unit</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all cursor-pointer appearance-none"
              >
                <option value="" className="bg-white dark:bg-[#1a1a1c]">Select Department</option>
                <option value="IT" className="bg-white dark:bg-[#1a1a1c]">IT & Engineering</option>
                <option value="HR" className="bg-white dark:bg-[#1a1a1c]">Human Resources</option>
                <option value="Finance" className="bg-white dark:bg-[#1a1a1c]">Finance & Accounts</option>
                <option value="Marketing" className="bg-white dark:bg-[#1a1a1c]">Marketing & Growth</option>
                <option value="Sales" className="bg-white dark:bg-[#1a1a1c]">Sales & Distribution</option>
                <option value="Operations" className="bg-white dark:bg-[#1a1a1c]">Operations</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Official Designation</label>
              <input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                placeholder="e.g. Lead Designer"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">Access Tier</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all cursor-pointer appearance-none disabled:opacity-50"
                disabled={currentUser?.role === 'Manager' && form.email.toLowerCase() === 'memona@hrmis.com'}
              >
                <option value="Employee" className="bg-white dark:bg-[#1a1a1c]">Standard (Employee)</option>
                {(currentUser?.role === 'Admin' || (currentUser?.email?.toLowerCase() === 'memona@hrmis.com')) && (
                  <>
                    <option value="Manager" className="bg-white dark:bg-[#1a1a1c]">Elevated (Manager)</option>
                    <option value="Admin" className="bg-white dark:bg-[#1a1a1c]">Full Access (Admin)</option>
                  </>
                )}
                {currentUser?.role === 'Manager' && form.role !== 'Employee' && (
                  <option value={form.role} className="bg-white dark:bg-[#1a1a1c]">{form.role}</option>
                )}
              </select>
              {currentUser?.role === 'Manager' && (
                <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-2 font-bold uppercase italic transition-colors">
                  * Managers cannot assign Admin/Manager roles or edit Admin profiles.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-3 transition-colors">{id ? 'Secure Key Reset' : 'Initial Passkey'}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-3xl outline-none font-black text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                placeholder={id ? "Leave blank to keep current" : "Min. 6 characters"}
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 pt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-10 py-5 bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
              >
                {loading ? 'Authenticating...' : id ? 'Authorize Change' : 'Confirm Enrollment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
