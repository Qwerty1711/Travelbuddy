import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Plane } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError('Invalid email or password. Please try again.');
      } else {
        navigate('/trips');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated vacation background */}
      <div className="auth-background"></div>
      <div className="auth-overlay"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card with glassmorphism effect */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo & Branding */}
          <div className="flex items-center justify-center mb-8 animate-fade-in">
            <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl mr-3 shadow-glow-md">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              TravelBuddy
            </h1>
          </div>

          <h2 className="text-2xl font-display font-bold text-neutral-900 mb-2 text-center">
            Welcome Back
          </h2>
          <p className="text-center text-neutral-500 mb-6">
            Plan your next adventure
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-neutral-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-neutral-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Don't have an account?{' '}
            <Link to="/auth/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign Up
            </Link>
          </p>

          {/* Inline tagline placed directly under the sign-up prompt (no decorative bars) */}
          <div className="mt-4 text-center">
            <p className="text-lg font-display font-semibold bg-gradient-to-r from-secondary-500 via-accent-500 to-secondary-600 bg-clip-text text-transparent">
              ✈️ Explore • 🗺️ Plan • 🌍 Experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
