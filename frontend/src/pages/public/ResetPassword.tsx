import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Password criteria validation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isStrong = hasMinLength && hasUpper && hasLower && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
      return;
    }

    if (!isStrong) {
      setError('Password does not meet the strength requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4 font-sans">
        <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-md border border-border text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Link</h1>
          <p className="text-text-muted text-sm mb-6">
            This password reset link is invalid or incomplete because no token was provided.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-saffron-500 hover:bg-saffron-600 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4 font-sans">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-saffron-600 mb-2">Set New Password</h1>
          <p className="text-text-muted">Create a strong password for your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm space-y-2">
            <p>{error}</p>
            {(error.toLowerCase().includes('expired') ||
              error.toLowerCase().includes('used') ||
              error.toLowerCase().includes('invalid')) && (
              <p>
                <Link to="/forgot-password" className="text-saffron-600 underline font-medium">
                  Click here to request a fresh reset link →
                </Link>
              </p>
            )}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <p className="font-semibold mb-1">Password updated successfully!</p>
              <p>Your password has been changed. Redirecting to login...</p>
            </div>
            <Link
              to="/login"
              className="block text-center w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Password strength checklist */}
            {password && (
              <div className="p-3 bg-muted rounded-lg text-xs space-y-1">
                <p className="font-medium text-text mb-1">Password requirements:</p>
                <p className={hasMinLength ? 'text-green-700' : 'text-text-muted'}>
                  {hasMinLength ? '✓' : '○'} At least 8 characters
                </p>
                <p className={hasUpper ? 'text-green-700' : 'text-text-muted'}>
                  {hasUpper ? '✓' : '○'} At least 1 uppercase letter
                </p>
                <p className={hasLower ? 'text-green-700' : 'text-text-muted'}>
                  {hasLower ? '✓' : '○'} At least 1 lowercase letter
                </p>
                <p className={hasNumber ? 'text-green-700' : 'text-text-muted'}>
                  {hasNumber ? '✓' : '○'} At least 1 number
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isStrong || password !== confirmPassword}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <p className="mt-4 text-center text-sm text-text-muted">
              <Link to="/login" className="text-saffron-600 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
