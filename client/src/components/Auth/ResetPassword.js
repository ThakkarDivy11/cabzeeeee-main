import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import authService from '../../services/authService';

const schema = yup.object({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required')
});

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword({
        token,
        password: data.password
      });

      if (response.success) {
        toast.success('Password reset successfully!');
        setResetSuccess(true);
        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(response.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.message || 'Password reset failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Password reset successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
        </div>

        <div className="mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Redirecting to sign in page...
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-black hover:text-gray-800 font-medium">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
            Invalid reset link
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            The password reset link is invalid or has expired. Please request a new one.
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/forgot-password" className="text-sm text-black hover:text-gray-800 font-medium">
            Request new reset link
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below.
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="password" className="block text-sm font-bold text-navy/70">
            New Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-navy/20 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all sm:text-sm bg-soft-white ${errors.password ? 'border-red-300' : 'border-navy/10'
                }`}
              placeholder="Enter your new password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-bold text-navy/70">
            Confirm New Password
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={`appearance-none block w-full px-4 py-3 border rounded-xl placeholder-navy/20 focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all sm:text-sm bg-soft-white ${errors.confirmPassword ? 'border-red-300' : 'border-navy/10'
                }`}
              placeholder="Confirm your new password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-soft-white bg-navy hover:bg-navy-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Resetting password...' : 'Reset password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPassword;







