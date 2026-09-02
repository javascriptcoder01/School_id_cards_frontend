import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';
import { selectNotifications } from '../../features/notifications/notificationSelectors.js';
import { dismissNotification } from '../../features/notifications/notificationSlice.js';

const NotificationItem = ({ notification, onDismiss }) => {
  const { id, type, title, message, duration } = notification;

  useEffect(() => {
    if (!duration || duration <= 0) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const typeConfig = {
    SUCCESS: {
      icon: CheckCircle2,
      containerClass: 'bg-emerald-950/90 border-emerald-800/80 text-emerald-100',
      iconClass: 'text-emerald-400 bg-emerald-900/50',
    },
    ERROR: {
      icon: AlertCircle,
      containerClass: 'bg-rose-950/90 border-rose-800/80 text-rose-100',
      iconClass: 'text-rose-400 bg-rose-900/50',
    },
    WARNING: {
      icon: AlertTriangle,
      containerClass: 'bg-amber-950/90 border-amber-800/80 text-amber-100',
      iconClass: 'text-amber-400 bg-amber-900/50',
    },
    INFO: {
      icon: Info,
      containerClass: 'bg-slate-900/90 border-slate-700 text-slate-100',
      iconClass: 'text-indigo-400 bg-indigo-950/50',
    },
  };

  const config = typeConfig[type] || typeConfig.INFO;
  const Icon = config.icon;

  return (
    <div
      role="status"
      className={`w-full max-w-sm p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 transition-all animate-in slide-in-from-top-2 duration-200 pointer-events-auto ${config.containerClass}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${config.iconClass}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5 space-y-0.5">
        {title && <p className="text-xs font-bold truncate">{title}</p>}
        <p className="text-xs text-slate-300 leading-snug break-words">{message}</p>
      </div>

      <button
        type="button"
        aria-label="Close notification"
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const NotificationContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  if (!notifications || notifications.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
      className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onDismiss={(id) => dispatch(dismissNotification(id))}
        />
      ))}
    </aside>
  );
};

export default NotificationContainer;

