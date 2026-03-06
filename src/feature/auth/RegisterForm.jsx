import React from 'react';
import { useAuth } from '../../lib/auth';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required('Confirm is required'),
});

export default function RegisterForm() {
  const { registerUser, setAccessToken, setUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.confirm,
        // Backend requires these fields — sending defaults (not shown in UI)
        department: 'General',
        designation: 'Employee',
        phone: '00000000000',
        address: 'N/A',
      };

      const res = await registerUser(payload);

      if (res.accessToken || res.token) {
        navigate('/dashboard');
        toast.success('Registration successful!');
      } else {
        navigate('/login');
        toast.success('Account created! Please login.');
      }
    } catch (err) {
      // Check for validation errors from backend
      const validationErrors = err?.response?.data?.errors;
      if (validationErrors) {
        const firstError = Object.values(validationErrors).flat()[0];
        toast.error(firstError || 'Validation failed');
      } else {
        const msg = err?.response?.data?.message || err?.message || 'Registration failed';
        toast.error(msg);
      }
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-gradient-to-br from-indigo-700 to-violet-900 overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-black tracking-tighter mb-6">HRMIS</h1>
          <div className="h-1 w-20 bg-indigo-400 mx-auto mb-8"></div>
          <p className="text-xl text-indigo-100 font-medium leading-relaxed">
            Join the professional workforce management system.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:w-2/3 bg-gray-50 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Create Account</h2>
            <p className="mt-3 text-gray-500 font-medium italic">Complete the form to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6">
            {/* Name */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
                placeholder="e.g. Ali Khan"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
              <input
                {...register('email')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
                placeholder="name@company.com"
              />
              {errors.email && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Password</label>
              <input
                type="password"
                {...register('password')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.password.message}</p>}
            </div>

            {/* Confirm */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Confirm</label>
              <input
                type="password"
                {...register('confirm')}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-gray-800 font-medium"
                placeholder="••••••••"
              />
              {errors.confirm && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.confirm.message}</p>}
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing...' : 'Create My Account'}
              </button>
            </div>

            <div className="text-center mt-4">
              <p className="text-sm font-bold text-gray-400">
                Already part of the team? <a href="/login" className="text-indigo-600 hover:underline">Login here</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
