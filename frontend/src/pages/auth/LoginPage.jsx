import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { KeyRound, User } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please enter your email/username and password.');
      return;
    }

    try {
      setLoading(true);
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Warm Ambient Lamp Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#e8a85a]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-[#e89da2]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#fdfbf7] border border-[#e8dfd1] shadow-paper z-10 space-y-6">
        {/* Brand */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-2xl font-serif font-bold tracking-wider text-memora-espresso">
              MEMORA
            </span>
            <span className="text-xl text-[#e89da2] font-serif">♡</span>
          </div>
          <p className="text-xs text-memora-muted font-serif italic">
            "A place for your most honest moments"
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email or Username"
            type="text"
            placeholder="you@example.com or username"
            icon={User}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={KeyRound}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-soft"
            >
              Enter Your Sanctuary →
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-memora-muted pt-2 border-t border-[#eee4d6]">
          Don't have a sanctuary yet?{' '}
          <Link
            to="/signup"
            className="text-[#c86d74] hover:underline font-semibold"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
