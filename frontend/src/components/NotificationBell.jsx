import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from './icons';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleActionClick = (notification, e) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead(notification._id);
    }
    setOpen(false);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink focus:outline-none"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <BellIcon className="h-[1.15rem] w-[1.15rem]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.65rem] font-bold text-[#1a0f00] ring-2 ring-surface animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-line bg-panel p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-semibold text-accent-strong">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-medium text-ink-faint hover:text-ink transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="mt-2 max-h-96 overflow-y-auto space-y-2.5 divide-y divide-line/40">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ink-faint">
                <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-surface">
                  <BellIcon className="h-5 w-5 text-ink-faint" />
                </div>
                <p className="text-xs font-medium text-ink-soft">No notifications yet</p>
                <p className="text-[0.75rem] text-ink-faint mt-0.5">
                  You'll be notified when issue assignments or reviews occur.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const isAssignUpdate = n.type === 'issue_assignment_update';
                const isAssigned = n.type === 'issue_assigned';
                const isRejected = n.type === 'self_pick_rejected';

                return (
                  <div
                    key={n._id}
                    onClick={() => !n.read && markAsRead(n._id)}
                    className={`pt-2.5 first:pt-0 group relative rounded-xl p-2.5 transition-colors cursor-pointer ${
                      n.read
                        ? 'hover:bg-surface/50'
                        : 'bg-accent/5 hover:bg-accent/10 border border-accent/20'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Icon */}
                      <span
                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                          isAssignUpdate
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isAssigned
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isRejected
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-surface text-ink border border-line'
                        }`}
                      >
                        {isAssignUpdate ? '⚡' : isAssigned ? '✓' : isRejected ? '✕' : 'ℹ'}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-semibold text-ink line-clamp-1">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 rounded-full bg-accent shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-ink-soft leading-relaxed mt-1">
                          {n.message}
                        </p>

                        <div className="flex items-center justify-between gap-2 mt-2">
                          <span className="text-[0.68rem] text-ink-faint">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>

                          {n.actionUrl && (
                            <button
                              type="button"
                              onClick={(e) => handleActionClick(n, e)}
                              className="inline-flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1 text-[0.7rem] font-medium text-surface hover:bg-[#26251f] transition-colors"
                            >
                              <span>{n.actionText || 'View Details'}</span>
                              <span>→</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
