import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Menu, X, Check } from 'lucide-react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'V';

  return (
    <header className="sticky top-0 z-30 w-full bg-[#fbf8f2]/80 backdrop-blur-md transition-all">
      <div className="flex items-center justify-between px-4 sm:px-8 h-16">
        {/* Left: Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-memora-brown hover:text-memora-espresso hover:bg-[#ede3d5] lg:hidden transition"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-1.5 lg:hidden">
            <span className="text-lg font-serif font-bold text-memora-espresso">MEMORA</span>
            <span className="text-base text-[#e89da2]">♡</span>
          </Link>
        </div>

        {/* Right: Notifications & Avatar */}
        <div className="flex items-center gap-3 sm:gap-4 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-memora-muted hover:text-memora-espresso hover:bg-[#f3ece0] transition"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-[#e89da2] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-[#fbf8f2]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#fdfbf7] border border-[#e8dfd1] rounded-2xl shadow-paper py-3 z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 pb-2.5 border-b border-[#eee4d6]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-serif font-bold text-memora-espresso">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fbeeed] text-[#b94a55] font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-memora-muted hover:text-memora-espresso flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#f3ede2]">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-memora-muted font-serif">
                      No notifications yet ♡
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.isRead) markAsRead(n.id);
                          if (n.link) {
                            setShowNotifications(false);
                            navigate(n.link);
                          }
                        }}
                        className={`p-3.5 hover:bg-[#f7f2ea] cursor-pointer transition ${
                          !n.isRead ? 'bg-[#fdf7f8]' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold text-memora-espresso">{n.title}</p>
                        <p className="text-xs text-memora-muted mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 px-4 border-t border-[#eee4d6] text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-[#c86d74] hover:underline font-semibold"
                  >
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Initial / Avatar Pill */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-[#e89da2]/40 transition"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.fullName}
                className="w-9 h-9 rounded-full object-cover border border-[#e8dfd1]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#f5d5db] border border-[#f0c2c9] text-memora-espresso flex items-center justify-center text-sm font-serif font-bold shadow-xs">
                {userInitial}
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
