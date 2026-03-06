import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { toast } from 'react-toastify';

export default function UserForm() {
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
        const token = localStorage.getItem('hrmis_token');
        const res = await api.get(`/users/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

      if (id) {
        const token = localStorage.getItem('hrmis_token');
        await api.put(`/users/${id}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success(`${form.name}'s profile updated`);
        navigate(`/users/${id}`);
      } else {
        const token = localStorage.getItem('hrmis_token');
        await api.post('/users', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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

  if (loading && id) return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-r-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden border border-gray-100 italic transition-all">
        <div className="p-10 md:p-14">
          <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tighter">
            {id ? 'Revise Personal Record' : 'Enroll New Personal'}
          </h2>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-10">
            Ensure all information is accurate and verified.
          </p>

          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Legal Full Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                placeholder="e.g. Maham Fatima"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Professional Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                placeholder="name@company.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Contact Number</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                placeholder="+92 3XX XXXXXXX"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Allocated Unit</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all cursor-pointer"
              >
                <option value="">Select Department</option>
                <option value="IT">IT & Engineering</option>
                <option value="HR">Human Resources</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="Marketing">Marketing & Growth</option>
                <option value="Sales">Sales & Distribution</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Official Designation</label>
              <input
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                required
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                placeholder="e.g. Lead Designer"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Access Tier</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all cursor-pointer"
              >
                <option value="Employee">Standard (Employee)</option>
                <option value="Manager">Elevated (Manager)</option>
                <option value="Admin">Full Access (Admin)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">{id ? 'Secure Key Reset' : 'Initial Passkey'}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-3xl outline-none font-black text-gray-800 transition-all placeholder:text-gray-300"
                placeholder={id ? "Leave blank to keep current" : "Min. 6 characters"}
              />
            </div>

            {/* Actions */}
            <div className="md:col-span-2 pt-8 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/users')}
                className="px-10 py-5 bg-gray-100 text-gray-400 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 ${loading ? 'opacity-50' : ''}`}
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
