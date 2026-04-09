import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email address').required('Email is required'),
  phone: yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').required('Phone number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  role: yup.string().oneOf(['rider', 'driver', 'admin'], 'Invalid role').required('Role is required'),
  profilePicture: yup.mixed().optional()
});

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: 'rider' }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('password', data.password);
      formData.append('role', data.role);

      if (data.profilePicture && data.profilePicture[0]) {
        formData.append('profilePicture', data.profilePicture[0]);
      }

      const response = await authService.register(formData);

      if (response.success) {
        toast.success('Registration successful! Please verify your email.');
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: data.email } });
        }, 2000);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roles = [
    { id: 'rider', label: 'RIDER', desc: 'Secure & fast travel', emoji: '🚗' },
    { id: 'driver', label: 'DRIVER', desc: 'Earn on your terms', emoji: '🏎️' },
  ];

  const inputClasses = (error) => `
    w-full px-5 py-3.5 bg-[var(--bg)] border rounded-2xl text-[var(--text)] outline-none transition-all duration-300
    ${error ? 'border-red-500/50 focus:border-red-500 box-shadow-red' : 'border-[var(--border2)] focus:border-yellow-500/50 focus:bg-white/[0.04] dark:focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,208,0,0.1)]'}
  `;

  if (registrationSuccess) {
    return (
      <div className="text-center py-8 cz-dm">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-yellow-500/20 border border-yellow-500/40 shadow-[0_0_30px_rgba(255,208,0,0.2)] mb-6 animate-[springPop_0.5s_ease-out]">
          <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-4xl cz-bebas tracking-widest text-[var(--text)] mb-2">ACCOUNT CREATED</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)] max-w-xs mx-auto mb-6">
          Redirecting to secured verification portal
        </p>
        <div className="w-12 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
          <div className="h-full bg-yellow-500 animate-[progressFill_2s_linear_forwards]" />
        </div>
      </div>
    );
  }

  return (
    <div className="cz-dm">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-4xl cz-bebas tracking-wider text-[var(--text)] mb-2">JOIN CABZEE</h2>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          START YOUR PREMIUM JOURNEY
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              </button>
            );
          })}
        </div>

        {/* Profile Picture */}
        <div className="flex items-center gap-4 bg-[var(--bg)] p-4 rounded-2xl border border-[var(--border2)]">
          <div className="relative w-16 h-16 rounded-2xl bg-white/5 border border-[var(--border)] overflow-hidden flex items-center justify-center group cursor-pointer">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="h-6 w-6 text-[var(--muted)] group-hover:text-yellow-500/50 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              {...register('profilePicture', {
                onChange: (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setPreview(reader.result);
                    reader.readAsDataURL(file);
                  }
                }
              })}
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--text)]">PROFILE PHOTO</p>
            <p className="text-[9px] font-bold text-[var(--muted)] uppercase mt-0.5 tracking-tighter">Optional · Best for recognition</p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">FULL NAME</label>
          <input
            placeholder="John Doe"
            {...register('name')}
            className={inputClasses(errors.name)}
          />
          {errors.name && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.name.message}</p>}
        </div>

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">EMAIL</label>
            <input
              type="email"
              placeholder="name@email.com"
              {...register('email')}
              className={inputClasses(errors.email)}
            />
            {errors.email && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">PHONE</label>
            <input
              type="tel"
              placeholder="+91 98765..."
              {...register('phone')}
              className={inputClasses(errors.phone)}
            />
            {errors.phone && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Password Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">PASSWORD</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={inputClasses(errors.password)}
            />
            {errors.password && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.password.message}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">CONFIRM</label>
            <input
              type="password"
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={inputClasses(errors.confirmPassword)}
            />
            {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden py-5 rounded-2xl bg-yellow-500 text-black cz-bebas text-2xl tracking-[0.1em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,208,0,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
          {isLoading ? 'PROCESSING...' : 'GET STARTED →'}
        </button>

        {/* Footer Link */}
        <p className="text-center text-[11px] font-bold text-[var(--muted)] tracking-wider">
          ALREADY HAVE AN ACCOUNT?{' '}
          <Link to="/login" className="text-yellow-600 hover:text-yellow-500 transition-colors underline underline-offset-4">SIGN IN</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
