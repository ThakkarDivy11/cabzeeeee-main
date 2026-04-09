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
    { id: 'rider', label: 'RIDER', desc: 'Secure & fast travel', emoji: '🚗' },
    { id: 'driver', label: 'DRIVER', desc: 'Earn on your terms', emoji: '🏎️' },
  ];

  const inputClasses = (error) => `
    w-full px-5 py-4 bg-[var(--bg)] border rounded-2xl text-[var(--text)] outline-none transition-all duration-300
    ${error ? 'border-red-500/50 focus:border-red-500 box-shadow-red' : 'border-[var(--border2)] focus:border-yellow-500/50 focus:bg-white/[0.04] dark:focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,208,0,0.1)]'}
  `;

  return (
    <div className="cz-dm">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl cz-bebas tracking-wider text-[var(--text)] mb-2">WELCOME BACK</h2>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          Enter your details below
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-4">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setValue('role', role.id)}
                className={`relative p-5 rounded-2xl border text-center transition-all duration-500 group overflow-hidden ${
                  isSelected 
                    ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_25px_rgba(255,208,0,0.15)]' 
                    : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--border2)]'
                }`}
              >
                {isSelected && <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />}
                <div className={`text-3xl mb-3 transition-transform duration-500 ${isSelected ? 'scale-110' : 'grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                  {role.emoji}
                </div>
                <p className={`cz-bebas text-xl tracking-widest transition-colors ${isSelected ? 'text-yellow-600 dark:text-yellow-500' : 'text-[var(--muted)]'}`}>
                  {role.label}
                </p>
                <p className={`text-[10px] uppercase font-bold tracking-tighter mt-1 opacity-60 ${isSelected ? 'text-yellow-700 dark:text-yellow-600' : 'text-[var(--muted)]'}`}>
                  {role.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            className={inputClasses(errors.email)}
          />
          {errors.email && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)]">PASSWORD</label>
            <Link to="/forgot-password" title="Recover account" className="text-[10px] font-bold text-yellow-600 hover:text-yellow-500 transition-colors uppercase tracking-widest">Forgot?</Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className={inputClasses(errors.password)}
          />
          {errors.password && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.password.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden py-5 rounded-2xl bg-yellow-500 text-black cz-bebas text-2xl tracking-[0.1em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,208,0,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
          {isLoading ? 'SIGNING IN...' : 'CONTINUE →'}
        </button>

        {/* Footer Link */}
        <p className="text-center text-[11px] font-bold text-[var(--muted)] tracking-wider">
          NEW TO CABZEE?{' '}
          <Link to="/register" className="text-yellow-600 hover:text-yellow-500 transition-colors underline underline-offset-4">CREATE ACCOUNT</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
