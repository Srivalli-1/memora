import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { KeyRound, User, Mail, AtSign } from 'lucide-react';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (
      !formData.fullName.trim() ||
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError('All fields are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signup(formData);
      setSuccessMsg('Account created! Opening your sanctuary...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f3ed] flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Warm Ambient Lamp Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#e8a85a]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#e89da2]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Signup Card */}
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
            "Start your personal memory archive"
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-[#fbeeed] border border-[#f4cfd3] text-[#a8323e] text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-[#edf4ed] border border-[#cfdec0] text-[#4d734e] text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            name="fullName"
            placeholder="e.g. Valli"
            icon={User}
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Username"
              name="username"
              placeholder="valli"
              icon={AtSign}
              value={formData.username}
              onChange={handleChange}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="valli@example.com"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="At least 6 characters"
            icon={KeyRound}
            value={formData.password}
            onChange={handleChange}
            required
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            icon={KeyRound}
            value={formData.confirmPassword}
            onChange={handleChange}
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
              Begin Your Story →
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-memora-muted pt-2 border-t border-[#eee4d6]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#c86d74] hover:underline font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
