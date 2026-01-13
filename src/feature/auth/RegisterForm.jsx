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
      const res = await registerUser({ name: data.name, email: data.email, password: data.password });
      if (res.accessToken) {
        setAccessToken(res.accessToken);
        setUser(res.user ?? null);
        navigate('/dashboard');
        toast.success('Registration successful!');
      } else {
        navigate('/login');
        toast.success('Registration successful! Please login.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      toast.error(msg);
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Side - Brand/Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-600 to-blue-700 overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center text-white px-12">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">Join Us</h1>
          <p className="text-xl text-indigo-100 font-light">
            Start your journey with HRMIS today. <br /> Simple, Fast, Efficient.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:px-24 bg-gray-50">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign up for free and start managing access.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  {...register('name')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  {...register('email')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="password"
                  {...register('password')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="password"
                  {...register('confirm')}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full px-3 py-2 sm:text-sm border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirm && <p className="mt-1 text-sm text-red-600">{errors.confirm.message}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Creating Account...' : 'Register'}
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">Already have an account? </span>
              <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">Login</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
