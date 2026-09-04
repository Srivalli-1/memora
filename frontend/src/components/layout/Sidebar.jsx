import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  Mail,
  HeartHandshake,
  Milestone,
  Gamepad2,
  Settings,
  LogOut,
  X,
  Camera,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navigation = [
  { name: 'Home', to: '/', icon: Home },
  { name: 'Memories', to: '/memories', icon: Camera },
  { name: 'Diary', to: '/diary', icon: BookOpen },
  { name: 'Letters', to: '/letters', icon: Mail },
  { name: 'Commitments', to: '/commitments', icon: HeartHandshake },
  { name: 'Timeline', to: '/timeline', icon: Milestone },
  { name: 'Shared Spaces', to: '/spaces', icon: Users },
  { name: 'Games', to: '/games', icon: Gamepad2 }
];

const Sidebar = ({ isOpen, closeSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/welcome');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#120804]/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container matching Panel 2 */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 sidebar-espresso flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-[#3d2315]">
            <NavLink to="/" className="flex items-center gap-2 group">
              <span className="text-xl font-serif font-bold tracking-wider text-[#fdfbf7]">
                MEMORA
              </span>
              <span className="text-lg text-[#e89da2] font-serif">♡</span>
            </NavLink>

            <button
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-[#a89080] hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="px-4 py-6 space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={closeSidebar}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#f5d5db] text-[#2c1810] font-semibold shadow-md'
                        : 'text-[#d4c2b2] hover:text-[#fdfbf7] hover:bg-[#341d11]/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? 'text-[#2c1810]'
                            : 'text-[#9c8474] group-hover:text-[#e89da2]'
                        }`}
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#3d2315] space-y-1">
          <NavLink
            to="/settings"
            onClick={closeSidebar}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#f5d5db] text-[#2c1810] font-semibold shadow-md'
                  : 'text-[#d4c2b2] hover:text-[#fdfbf7] hover:bg-[#341d11]/70'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#2c1810]' : 'text-[#9c8474] group-hover:text-[#e89da2]'
                  }`}
                />
                <span>Settings</span>
              </>
            )}
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium text-[#d4c2b2] hover:text-[#f2989e] hover:bg-[#3b1c19]/60 transition-all duration-200 text-left"
          >
            <LogOut className="w-4 h-4 text-[#9c8474] group-hover:text-[#f2989e]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
