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
      console.error(error);
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Brand/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-violet-700 overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">HRMIS</h1>
          <p className="text-xl text-indigo-100 font-light">
            Streamline your workforce. <br /> Manage leaves, tasks, and users seamlessly.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-gray-50">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome Back!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to your account
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    id="password"
                    type="password"
                    {...register("password", { required: "Password is required" })}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Forgot password?</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Sign up now
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
