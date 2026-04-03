import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required')
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data);
      if (response.success) {
        toast.success('Password reset link sent to your email!');
        setEmailSent(true);
      } else {
        toast.error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-50 border border-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-navy">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-navy/60 font-medium">
            We've sent a password reset link to <strong className="text-navy">{getValues('email')}</strong>.
            Click the link in the email to reset your password.
          </p>
        </div>

        <div className="mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="font-medium text-black hover:text-gray-800"
              >
                try again
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
          <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
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
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-soft-white bg-navy hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending reset link...' : 'Send reset link'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="text-sm text-gray-600 hover:text-gray-800">
          Back to sign in
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;







