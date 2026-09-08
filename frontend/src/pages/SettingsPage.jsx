import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  Bell,
  Palette,
  KeyRound,
  Edit,
  Trash2,
  Check
} from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import settingsBg from '../assets/settings_bg.png';

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'account', 'privacy', 'notifications', 'appearance'

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || 'Valli');
  const [bio, setBio] = useState(user?.bio || 'Just a girl who loves stories ♡');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passError, setPassError] = useState('');

  // Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletePass, setDeletePass] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');

    try {
      setProfileSaving(true);
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);

      const res = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data?.user) {
        updateUser(res.data.user);
        setProfileMsg('Profile updated ♡');
        setTimeout(() => setIsEditProfileOpen(false), 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassMsg('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    try {
      setPassLoading(true);
      const res = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword
      });
      setPassMsg(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePass) return;

    try {
      setDeleteLoading(true);
      await api.delete('/users/account', {
        data: { password: deletePass }
      });
      logout();
      navigate('/welcome');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'V';
  const displayName = user?.fullName || 'Valli';
  const displayEmail = user?.email || 'valli@example.com';
  const displayBio = user?.bio || 'Just a girl who loves stories ♡';

  return (
    <div 
      className="page-background space-y-8 animate-fadeIn min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${settingsBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        backgroundColor: '#fdfbf7'
      }}
    >
      {/* Title */}
      <h1 className="text-3xl font-serif font-bold text-memora-espresso">
        Settings
      </h1>

      {/* Main Settings Grid matching Panel 8 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Settings Sub-Sidebar (3.5 Cols) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'account', label: 'Account', icon: KeyRound },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Palette }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition text-left ${
                  isActive
                    ? 'bg-[#f5d5db] text-memora-espresso shadow-xs'
                    : 'text-memora-brown hover:bg-[#faf4ea]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-memora-espresso' : 'text-memora-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Center Main Card & Right Pinned Kraft Note (8.5 Cols) */}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Card (8.5 Cols of right area) */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl warm-card border border-[#e8dfd1] shadow-soft space-y-6">
            {/* TAB: PROFILE (Matching Panel 8 exactly) */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#eee4d6] pb-3">
                  <h3 className="text-sm font-serif font-bold text-memora-espresso">
                    Profile
                  </h3>
                  <button
                    onClick={() => {
                      setFullName(user?.fullName || 'Valli');
                      setBio(user?.bio || 'Just a girl who loves stories ♡');
                      setAvatarPreview(user?.avatarUrl || '');
                      setIsEditProfileOpen(true);
                    }}
                    className="px-3.5 py-1 rounded-full border border-[#d8cbb8] hover:bg-[#f5eee6] text-xs font-semibold text-memora-espresso transition"
                  >
                    Edit
                  </button>
                </div>

                {/* Profile Avatar & Info matching Panel 8 */}
                <div className="flex items-center gap-4">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover border border-[#e8dfd1]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#f5d5db] border border-[#f0c2c9] flex items-center justify-center font-serif text-2xl font-bold text-memora-espresso shadow-xs">
                      {userInitial}
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <h4 className="text-base font-bold text-memora-espresso font-serif">
                      {displayName}
                    </h4>
                    <p className="text-xs text-memora-muted">{displayEmail}</p>
                  </div>
                </div>

                {/* Bio Card matching Panel 8 */}
                <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee4d6]">
                  <p className="text-xs sm:text-sm font-serif italic text-memora-brown">
                    "{displayBio}"
                  </p>
                </div>
              </div>
            )}

            {/* TAB: ACCOUNT (Password update) */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <h3 className="text-sm font-serif font-bold text-memora-espresso border-b border-[#eee4d6] pb-3">
                  Account Credentials
                </h3>

                {passMsg && (
                  <div className="p-3 rounded-xl bg-[#edf4ed] text-[#4d734e] text-xs font-semibold">
                    {passMsg}
                  </div>
                )}
                {passError && (
                  <div className="p-3 rounded-xl bg-[#fbeeed] text-[#a8323e] text-xs font-semibold">
                    {passError}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <Button type="submit" variant="primary" size="sm" loading={passLoading}>
                    Change Password
                  </Button>
                </form>

                <div className="pt-6 border-t border-[#eee4d6]">
                  <button
                    onClick={() => setIsDeleteOpen(true)}
                    className="text-xs text-[#a8323e] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account Permanently
                  </button>
                </div>
              </div>
            )}

            {/* TAB: PRIVACY */}
            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif font-bold text-memora-espresso border-b border-[#eee4d6] pb-3">
                  Privacy & Data Sanctity
                </h3>
                <p className="text-xs text-memora-muted leading-relaxed font-serif">
                  Every diary entry is encrypted and accessible only to your authenticated user token.
                  Letters to another user remain locked until unlocked, and mutual agreements are only accessible to both designated signers.
                </p>
              </div>
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif font-bold text-memora-espresso border-b border-[#eee4d6] pb-3">
                  Notification Preferences
                </h3>
                <p className="text-xs text-memora-muted leading-relaxed font-serif">
                  You receive bell alerts for incoming letters, signed promises, and time capsule unlocks.
                </p>
              </div>
            )}

            {/* TAB: APPEARANCE */}
            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-sm font-serif font-bold text-memora-espresso border-b border-[#eee4d6] pb-3">
                  Sanctuary Theme
                </h3>
                <div className="p-4 rounded-2xl bg-[#faf6f0] border border-[#eee4d6]">
                  <span className="text-xs font-bold text-memora-espresso block mb-1">
                    Warm Linen & Leather Journal (Default)
                  </span>
                  <p className="text-xs text-memora-muted font-serif">
                    Soft ivory pages, blush pink accents, and fountain pen typography crafted for honest reflection.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Pinned Kraft Note (4 Cols of right area) matching Panel 8 */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative sticky-note p-6 sm:p-7 w-full max-w-[200px] transform rotate-2 text-center space-y-2 shadow-paper">
              {/* Paperclip */}
              <div className="w-4 h-6 border-2 border-[#826e57] rounded-full absolute -top-3 left-1/2 -translate-x-1/2 z-20" />

              <div className="pt-2 font-handwriting text-lg text-[#3d2417] leading-snug font-bold">
                Same <br />
                Soul <br />
                Different <br />
                Journeys
              </div>
              <div className="text-xl text-[#c86d74]">♡</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profile"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {profileMsg && (
            <div className="p-3 rounded-xl bg-[#edf4ed] text-[#4d734e] text-xs font-semibold">
              {profileMsg}
            </div>
          )}

          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            label="Short Bio"
            isTextarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-memora-brown mb-1.5">
              Change Profile Photo (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setAvatarFile(e.target.files[0]);
                  setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                }
              }}
              className="w-full text-xs text-memora-brown file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#fbeeed] file:text-[#c86d74] hover:file:bg-[#f7d8dc] cursor-pointer"
            />
            {avatarPreview && (
              <div className="mt-2.5 w-14 h-14 rounded-full overflow-hidden border border-[#e8dfd1]">
                <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={profileSaving}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Permanently Delete Sanctuary"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <p className="text-xs text-[#a8323e] font-serif">
            This will permanently remove your diary pages, letters, and account data. Please enter your password to confirm:
          </p>

          <Input
            label="Password"
            type="password"
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
            required
          />

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              loading={deleteLoading}
            >
              Delete Forever
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
