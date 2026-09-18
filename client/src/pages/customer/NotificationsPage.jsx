import React, { useEffect } from 'react';
import { Bell, CheckCheck, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { useNotificationStore } from '../../store/useStores';

export const NotificationsPage = () => {
  const { notifications, unreadCount, fetchNotifications, markRead, markAllRead, loading } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-accent-dark">
              Notifications & Activity Alerts
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-status-danger text-white">
                {unreadCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time status broadcasts across orders, payouts, and hub assignments
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-accent" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-base p-16 text-center space-y-3">
          <Bell className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-serif text-lg font-bold text-text-primary">No Notifications Yet</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            You will receive instant alerts here whenever an order status updates or new dispatches are assigned.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.read && markRead(notif._id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-white border-border text-text-secondary'
                  : 'bg-accent-light/30 border-accent/30 text-text-primary shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.read ? 'bg-bg-tertiary text-text-secondary' : 'bg-accent text-white'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <h4 className={`text-xs font-bold ${notif.read ? 'text-text-primary' : 'text-accent-dark'}`}>
                    {notif.title || 'Platform Notification'}
                  </h4>
                  <p className="text-xs leading-relaxed">{notif.message}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] text-text-secondary">
                <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                <span>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-accent mt-1" title="Unread" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
