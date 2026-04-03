import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
  role: yup.string().oneOf(['rider', 'driver', 'admin'], 'Invalid role').required('Role is required'),
});

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'rider' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      if (response.success) {
        toast.success('Welcome back!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        switch (response.data.user.role) {
          case 'rider': navigate('/rider'); break;
          case 'driver': navigate('/driver'); break;
          default: navigate('/dashboard');
        }
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'rider', label: 'Rider', desc: 'Book rides & travel', emoji: '🚗' },
    { id: 'driver', label: 'Driver', desc: 'Earn money driving', emoji: '🏎️' },
  ];

  return (
    <div>
      {/* Heading */}
      <div className="text-center mb-7">
        <h2 className="text-[28px] font-extrabold tracking-tight text-white">
          Welcome Back
        </h2>
        <p className="text-sm mt-1.5 text-gray-400">
          Sign in to continue your journey ·{' '}
          <Link
            to="/register"
            className="font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            Create account
          </Link>
        </p>
      </div>

      {/* Role selector — modern segmented control */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-center text-gray-500">
          I am a
        </p>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setValue('role', role.id)}
                className={`relative p-4 rounded-xl border text-left transition-all duration-300 overflow-hidden ${
                  isSelected
                    ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className={`text-2xl mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                  {role.emoji}
                </div>
                <p className={`font-bold text-sm transition-colors ${isSelected ? 'text-purple-300' : 'text-gray-400'}`}>
                  {role.label}
                </p>
                <p className={`text-[11px] mt-0.5 transition-colors ${isSelected ? 'text-purple-400/70' : 'text-gray-600'}`}>
                  {role.desc}
                </p>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center bg-purple-500 shadow-md shadow-purple-500/30"
                    style={{ animation: 'springPop 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
                  >
                    <svg className="w-3 h-3" fill="#FFFFFF" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <input type="hidden" {...register('role')} />

      {/* Form */}
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-gray-500">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="your@gmail.com"
              className={`block w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-white/20'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-[11px] font-medium flex items-center gap-1 text-red-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              placeholder="••••••"
              className={`block w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-lg tracking-[0.2em] text-white placeholder-gray-500 transition-all outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-white/20'
              }`}
            />
          </div>
          {errors.password && (
            <p className="mt-1.5 text-[11px] font-medium flex items-center gap-1 text-red-400">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm font-semibold text-white
              bg-gradient-to-r from-purple-500 to-indigo-500
              hover:from-purple-600 hover:to-indigo-600
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98] transition-all duration-300 hover:-translate-y-0.5
              shadow-lg shadow-purple-500/25"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Continue to Dashboard
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
