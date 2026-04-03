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

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-navy/5">
          <svg className="h-6 w-6 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-navy">
          Verify your email
        </h2>
        <p className="mt-2 text-center text-sm text-navy/60 font-medium">
          We've sent a 6-digit verification code to your email address.
          Enter it below to verify your account.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-navy/70">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-navy/20 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all sm:text-sm bg-soft-white ${errors.email ? 'border-red-300' : 'border-navy/10'
                }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
            Verification Code
          </label>
          <div className="mt-1">
            <input
              id="otp"
              name="otp"
              type="text"
              maxLength="6"
              {...register('otp')}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm text-center text-lg tracking-widest ${errors.otp ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="000000"
            />
            {errors.otp && (
              <p className="mt-1 text-sm text-red-600">{errors.otp.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-soft-white bg-navy hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the code?{' '}
            {countdown > 0 ? (
              <span className="text-gray-400">
                Resend in {countdown}s
              </span>
            ) : (
              <button
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="font-medium text-black hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </p>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/register" className="text-sm text-gray-600 hover:text-gray-800">
          Back to registration
        </Link>
      </div>
    </div>
  );
};

export default OTPVerification;
