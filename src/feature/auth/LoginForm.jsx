import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0a0a0c] transition-colors duration-300">
      {/* Left Side - Brand/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-violet-700 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4"></div>
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-7xl font-black tracking-tighter mb-4 border-b-4 border-white inline-block px-4">HRMIS</h1>
          <p className="text-2xl text-indigo-50 font-medium italic opacity-90 max-w-md mx-auto leading-relaxed">
            Elevating workforce management to a state-of-the-art experience.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-gray-50 dark:bg-transparent transition-colors">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight transition-colors">Welcome Back</h2>
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 font-medium transition-colors">
              Access your personnel control center
            </p>
          </div>

          <div className="mt-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Email</label>
                <div className="mt-1 relative rounded-2xl shadow-sm">
                  <input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="block w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 transition-colors">Password</label>
                <div className="mt-1 relative rounded-2xl shadow-sm">
                  <input
                    id="password"
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="block w-full px-5 py-4 bg-white dark:bg-white/[0.03] border-2 border-transparent focus:border-indigo-600 dark:focus:border-indigo-400 rounded-2xl outline-none font-bold text-gray-800 dark:text-gray-100 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-2 text-xs font-bold text-rose-500 uppercase italic transition-colors">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-white/10 rounded bg-white dark:bg-white/5 transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter transition-colors">Remember device</label>
                </div>
                <div className="text-xs">
                  <a href="#" className="font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors uppercase tracking-widest">Forgot password?</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-5 px-4 border border-transparent rounded-[1.5rem] shadow-xl dark:shadow-none text-sm font-black uppercase tracking-[0.2em] text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all transform active:scale-95 transition-colors"
                >
                 Login
                </button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest transition-colors">
                New to the system?{' '}
                <a href="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                  Register
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
