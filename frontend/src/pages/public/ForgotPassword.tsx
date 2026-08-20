import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4 font-sans">
      <div className="max-w-md w-full bg-surface p-8 rounded-xl shadow-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-saffron-600 mb-2">Reset Password</h1>
          <p className="text-text-muted">Enter your email to receive recovery instructions</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <p className="font-semibold mb-1">Check your email</p>
              <p>
                If an account with <strong>{email}</strong> exists, a link to reset your password has been sent. Please check your inbox and spam folder.
              </p>
            </div>
            <p className="text-xs text-text-muted text-center">
              The link is valid for 60 minutes and can only be used once.
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="block text-center w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Account Email</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full p-2.5 rounded-lg border border-border focus:ring-2 focus:ring-saffron-400 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-saffron-500 hover:bg-saffron-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-70"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>

            <p className="mt-6 text-center text-sm text-text-muted">
              Remember your password?{' '}
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
