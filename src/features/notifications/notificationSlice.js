import { createSlice } from '@reduxjs/toolkit';
import { logout } from '../auth/authSlice.js';

const initialState = {
  notifications: [],
};

const ALLOWED_TYPES = ['SUCCESS', 'ERROR', 'WARNING', 'INFO'];

/**
 * Sanitizes notification message to ensure no tokens, objects, or stack traces leak into state
 */
const sanitizeMessage = (msg) => {
  if (!msg) return 'Operation completed.';
  if (typeof msg === 'string') {
    // Strip possible raw JWT or token-like strings
    if (msg.startsWith('Bearer ') || msg.length > 500) {
      return 'Operation completed.';
    }
    return msg;
  }
  if (typeof msg === 'object' && msg.message && typeof msg.message === 'string') {
    return msg.message;
  }
  return 'Operation completed.';
};

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      const payload = action.payload || {};
      const type = ALLOWED_TYPES.includes(payload.type?.toUpperCase())
        ? payload.type.toUpperCase()
        : 'INFO';

      const message = sanitizeMessage(payload.message || payload.description);
      const title = typeof payload.title === 'string' ? payload.title : null;
      const duration = typeof payload.duration === 'number' ? payload.duration : 4000;
      const id = payload.id || `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Duplicate prevention: if identical message and type exists, ignore
      const isDuplicate = state.notifications.some(
        (n) => n.type === type && n.message === message
      );

      if (!isDuplicate) {
        state.notifications.push({
          id,
          type,
          title,
          message,
          duration,
          createdAt: Date.now(),
        });
      }
    },
    dismissNotification: (state, action) => {
      const id = typeof action.payload === 'object' ? action.payload?.id : action.payload;
      state.notifications = state.notifications.filter((n) => n.id !== id);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
  extraReducers: (builder) => {
    // Automatically purge notifications on user logout
    builder.addCase(logout, (state) => {
      state.notifications = [];
    });
  },
});

export const { showNotification, dismissNotification, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;

