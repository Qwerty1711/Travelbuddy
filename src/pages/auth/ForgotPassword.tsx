import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plane } from 'lucide-react';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError('Could not send reset email. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Plane className="w-10 h-10 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Travel Buddy</h1>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
          Reset Password
        </h2>
        <p className="text-gray-600 text-sm text-center mb-6">
          Enter your email and we'll send you a reset link
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            Password reset email sent! Check your inbox.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/auth/login" className="text-sm text-blue-600 hover:text-blue-700">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
