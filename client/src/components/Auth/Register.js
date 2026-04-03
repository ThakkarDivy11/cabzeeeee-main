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

  const handleRoleChange = (role) => {
    setValue('role', role);
  };

  if (registrationSuccess) {
    return (
      <div className="text-center py-4">
        <div
          className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-green-500/20 border border-green-500/30 mb-5"
          style={{ animation: 'springPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
        >
          <svg className="h-7 w-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
          Check your email for a verification code, then confirm your account to get started.
        </p>
        <p className="mt-5 text-xs text-gray-600">Redirecting to verification...</p>
      </div>
    );
  }

  const roles = [
    { id: 'rider', label: 'Rider', desc: 'Book rides & travel', emoji: '🚗' },
    { id: 'driver', label: 'Driver', desc: 'Earn money driving', emoji: '🏎️' },
  ];

  // Shared input classes
  const inputClass = (hasError) =>
    `block w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
      hasError ? 'border-red-500' : 'border-white/20'
    }`;

  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.15em] mb-2 text-gray-500";

  const errorMsg = (message) => (
    <p className="mt-1.5 text-[11px] font-medium flex items-center gap-1 text-red-400">
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {message}
    </p>
  );

  return (
    <div>
      {/* Heading */}
      <div className="text-center mb-7">
        <h2 className="text-[28px] font-extrabold tracking-tight text-white">
          Create Account
        </h2>
        <p className="text-sm mt-1.5 text-gray-400">
          Start your journey today ·{' '}
          <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
            or sign in instead
          </Link>
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-center text-gray-500">
          I want to join as a
        </p>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => handleRoleChange(role.id)}
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

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div>
          <label htmlFor="name" className={labelClass}>Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name" type="text" autoComplete="name" {...register('name')}
              placeholder="Your full name"
              className={inputClass(errors.name)}
            />
          </div>
          {errors.name && errorMsg(errors.name.message)}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>Email address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              id="email" type="email" autoComplete="email" {...register('email')}
              placeholder="you@example.com"
              className={inputClass(errors.email)}
            />
          </div>
          {errors.email && errorMsg(errors.email.message)}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className={labelClass}>Phone Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <input
              id="phone" type="tel" autoComplete="tel" {...register('phone')}
              placeholder="+91 9876543210"
              className={inputClass(errors.phone)}
            />
          </div>
          {errors.phone && errorMsg(errors.phone.message)}
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className={labelClass}>Profile Picture (Optional)</label>
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="h-6 w-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer bg-white/10 py-2 px-4 border border-white/20 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/20 focus-within:ring-2 focus-within:ring-purple-500 inline-block transition-all">
                <span>Upload a photo</span>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className="sr-only"
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
              </label>
            </div>
          </div>
          {errors.profilePicture && (
            <p className="mt-1 text-[11px] text-red-400 font-medium">{errors.profilePicture.message}</p>
          )}
        </div>

        {/* Passwords */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="password" className={labelClass}>Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password" type="password" autoComplete="new-password" {...register('password')}
                placeholder="••••••"
                className={`block w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-lg tracking-[0.2em] text-white placeholder-gray-500 transition-all outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-white/20'
                }`}
              />
            </div>
            {errors.password && <p className="mt-1.5 text-[11px] text-red-400 font-medium">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>Confirm</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')}
                placeholder="••••••"
                className={`block w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-lg tracking-[0.2em] text-white placeholder-gray-500 transition-all outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-500' : 'border-white/20'
                }`}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-[11px] text-red-400 font-medium">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <input type="hidden" {...register('role')} />

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
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating your account...
              </>
            ) : (
              <>
                Get Started
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

export default Register;
