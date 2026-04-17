import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
  otp: yup.string().length(6, 'OTP must be 6 digits').matches(/^\d{6}$/, 'OTP must be numeric').required('OTP is required')
});

const OTPVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const location = useLocation();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: location.state?.email || ''
    }
  });

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(data);
      if (response.success) {
        toast.success('Email verified successfully!');
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect based on role
        switch (response.data.user.role) {
          case 'rider':
            navigate('/rider');
            break;
          case 'driver':
            navigate('/driver');
            break;
          case 'admin':
            navigate('/admin');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        toast.error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const email = location.state?.email;
    if (!email) {
      toast.error('Email address not found. Please go back and try again.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await authService.resendOTP({ email });
      if (response.success) {
        toast.success('New OTP sent to your email!');
        setCountdown(60);
      } else {
        toast.error(response.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const inputClasses = (error) => `
    w-full px-5 py-3.5 bg-[var(--bg)] border rounded-2xl text-[var(--text)] outline-none transition-all duration-300
    ${error ? 'border-red-500/50 focus:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'border-[var(--border2)] focus:border-yellow-500/50 focus:bg-white/[0.04] dark:focus:bg-white/[0.08] focus:shadow-[0_0_20px_rgba(255,208,0,0.1)]'}
  `;

  return (
    <div className="cz-dm">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-yellow-500/10 border border-yellow-500/30 shadow-[0_0_40px_rgba(255,208,0,0.1)] mb-6 animate-[springPop_0.5s_ease-out]">
          <svg className="h-10 w-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-4xl cz-bebas tracking-wider text-[var(--text)] mb-2">VERIFY EMAIL</h2>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)] max-w-xs mx-auto">
          We've sent a 6-digit verification code to your email address.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">
            EMAIL ADDRESS
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={inputClasses(errors.email)}
            placeholder="John@example.com"
          />
          {errors.email && (
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* OTP Code */}
        <div className="space-y-1.5">
          <label htmlFor="otp" className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--muted)] ml-1">
            VERIFICATION CODE
          </label>
          <input
            id="otp"
            type="text"
            maxLength="6"
            {...register('otp')}
            className={`${inputClasses(errors.otp)} text-center text-3xl cz-bebas tracking-[0.5em] h-20`}
            placeholder="000000"
          />
          {errors.otp && (
            <p className="text-[10px] font-bold text-red-500 dark:text-red-400 ml-1 mt-1 uppercase tracking-wider">
              {errors.otp.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group overflow-hidden py-5 rounded-2xl bg-yellow-500 text-black cz-bebas text-2xl tracking-[0.1em] transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,208,0,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]" />
          {isLoading ? 'VERIFYING...' : 'VERIFY EMAIL →'}
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-10">
        <div className="text-center">
          <p className="text-[11px] font-bold text-[var(--muted)] tracking-wider">
            DIDN'T RECEIVE THE CODE?{' '}
            {countdown > 0 ? (
              <span className="text-yellow-500/50">
                RESEND IN {countdown}S
              </span>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-yellow-600 hover:text-yellow-500 transition-colors underline underline-offset-4 uppercase"
              >
                {resendLoading ? 'SENDING...' : 'RESEND NOW'}
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/register" className="text-xs font-bold uppercase tracking-[0.1em] text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          ← BACK TO REGISTRATION
        </Link>
      </div>
    </div>
  );
};

export default OTPVerification;
