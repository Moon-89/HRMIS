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
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0c] transition-colors duration-300">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-gradient-to-br from-indigo-700 to-violet-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4"></div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-7xl font-black tracking-tighter mb-6 border-b-4 border-white inline-block px-4">HRMIS</h1>
          <p className="text-2xl text-indigo-50 font-medium italic opacity-90 leading-relaxed max-w-xs mx-auto">
            Join the digital forefront of HR management.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-12 lg:w-2/3 bg-gray-50 dark:bg-transparent overflow-y-auto transition-colors">
        <div className="mx-auto w-full max-w-lg">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Create Account</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium italic transition-colors">Digital Enrollment Phase</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 not-italic">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Full Name</label>
              <input
                {...register('name')}
                className="w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                placeholder="e.g. Ali Khan"
              />
              {errors.name && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Personal ID (Email)</label>
              <input
                {...register('email')}
                className="w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                placeholder="name@company.com"
              />
              {errors.email && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm transition-colors"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Confirm Password</label>
                <input
                  type="password"
                  {...register('confirm')}
                  className="w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent dark:border-white/5 focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm transition-colors"
                  placeholder="••••••••"
                />
                {errors.confirm && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.confirm.message}</p>}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-5 bg-indigo-600 dark:bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 dark:hover:bg-indigo-700 hover:-translate-y-1 active:scale-95 transition-all transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Processing Registration...' : 'Register'}
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">
                Already created account?{' '}
                <a href="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-all font-black">LOGIN HERE</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
