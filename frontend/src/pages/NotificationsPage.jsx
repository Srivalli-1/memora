import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';
import {
  Bell,
  Check,
  Trash2,
  ExternalLink,
  BookOpen,
  HeartHandshake,
  Mail,
  Milestone
} from 'lucide-react';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/formatters';

const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotifications();
  const [filter, setFilter] = useState('ALL');
  const navigate = useNavigate();

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'COMMITMENT_REQUEST':
      case 'COMMITMENT_SIGNED':
        return <HeartHandshake className="w-5 h-5 text-[#c86d74]" />;
      case 'LETTER_RECEIVED':
        return <Mail className="w-5 h-5 text-[#c86d74]" />;
      default:
        return <Bell className="w-5 h-5 text-[#c86d74]" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-memora-espresso">
            Activity & Notes
          </h1>
          <p className="text-xs sm:text-sm text-memora-muted font-serif mt-1">
            Letters, promise signatures, and milestone updates <span className="text-[#c86d74]">♡</span>
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" icon={Check} onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex gap-2 border-b border-[#eee4d6] pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'ALL'
              ? 'bg-[#f5d5db] text-memora-espresso'
              : 'bg-[#fdfbf7] text-memora-muted border border-[#e8dfd1] hover:bg-[#f5eee6]'
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
            filter === 'UNREAD'
              ? 'bg-[#f5d5db] text-memora-espresso'
              : 'bg-[#fdfbf7] text-memora-muted border border-[#e8dfd1] hover:bg-[#f5eee6]'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="No pending notifications in your sanctuary."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.isRead) markAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-4 sm:p-5 rounded-2xl warm-card hover:border-[#d98c92] cursor-pointer transition flex items-start justify-between gap-4 ${
                !notif.isRead ? 'bg-[#fbeeed]/40 border-[#f4cfd3]' : ''
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-[#faf4ec] border border-[#eee4d6] flex-shrink-0">
                  {getNotifIcon(notif.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-serif font-bold text-memora-espresso">
                      {notif.title}
                    </h4>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#e89da2]" />
                    )}
                  </div>
                  <p className="text-xs text-memora-brown leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-memora-muted block pt-0.5">
                    {formatDate(notif.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => handleDelete(notif.id, e)}
                  className="p-1.5 rounded-lg text-memora-muted hover:text-[#a8323e] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
