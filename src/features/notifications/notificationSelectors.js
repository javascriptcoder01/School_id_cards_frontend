/**
 * Notification Selectors
 */

export const selectNotifications = (state) =>
  state.notifications?.notifications || [];

export const selectNotificationById = (id) => (state) =>
  (state.notifications?.notifications || []).find((n) => n.id === id) || null;

export default {
  selectNotifications,
  selectNotificationById,
};

