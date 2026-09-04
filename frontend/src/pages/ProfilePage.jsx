import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  HeartHandshake,
  Milestone,
  Edit,
  Sparkles
} from 'lucide-react';
import Button from '../components/common/Button';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    memoriesCount: 0,
    diaryCount: 0,
    timelineCount: 0,
    commitmentsCount: 0,
    lettersCount: 0
  });

  useEffect(() => {
    api.get('/users/profile').then((res) => {
      if (res.data?.stats) setStats(res.data.stats);
    }).catch(console.error);
  }, []);

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'V';
  const displayName = user?.fullName || 'Valli';
  const displayEmail = user?.email || 'valli@example.com';
  const displayBio = user?.bio || 'Just a girl who loves stories ♡';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-memora-espresso">
          My Profile
        </h1>
        <Button
          size="sm"
          variant="secondary"
          icon={Edit}
          onClick={() => navigate('/settings')}
        >
          Edit in Settings
        </Button>
      </div>

      {/* Main Profile Card matching Panel 8 */}
      <div className="p-8 rounded-3xl warm-card border border-[#e8dfd1] shadow-soft space-y-6">
        <div className="flex items-center gap-5">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-20 h-20 rounded-full object-cover border-2 border-[#e8dfd1]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#f5d5db] border-2 border-[#f0c2c9] flex items-center justify-center font-serif text-3xl font-bold text-memora-espresso shadow-xs">
              {userInitial}
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-memora-espresso">
              {displayName}
            </h2>
            <p className="text-xs text-memora-muted">{displayEmail}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee4d6]">
          <p className="text-sm font-serif italic text-memora-brown">
            "{displayBio}"
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl warm-card text-center space-y-1">
          <BookOpen className="w-5 h-5 text-[#c86d74] mx-auto" />
          <span className="block text-2xl font-bold text-memora-espresso font-serif">
            {stats.diaryCount}
          </span>
          <span className="text-xs text-memora-muted">Diary Entries</span>
        </div>

        <div className="p-5 rounded-2xl warm-card text-center space-y-1">
          <Mail className="w-5 h-5 text-[#c86d74] mx-auto" />
          <span className="block text-2xl font-bold text-memora-espresso font-serif">
            {stats.lettersCount}
          </span>
          <span className="text-xs text-memora-muted">Letters Sealed</span>
        </div>

        <div className="p-5 rounded-2xl warm-card text-center space-y-1">
          <HeartHandshake className="w-5 h-5 text-[#c86d74] mx-auto" />
          <span className="block text-2xl font-bold text-memora-espresso font-serif">
            {stats.commitmentsCount}
          </span>
          <span className="text-xs text-memora-muted">Commitments</span>
        </div>

        <div className="p-5 rounded-2xl warm-card text-center space-y-1">
          <Milestone className="w-5 h-5 text-[#c86d74] mx-auto" />
          <span className="block text-2xl font-bold text-memora-espresso font-serif">
            {stats.timelineCount}
          </span>
          <span className="text-xs text-memora-muted">Milestones</span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
