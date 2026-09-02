import { describe, it, expect } from 'vitest';
import notificationReducer, {
  showNotification,
  dismissNotification,
  clearNotifications,
} from '../features/notifications/notificationSlice.js';
import { logout } from '../features/auth/authSlice.js';

describe('NOTIFICATION REDUX SLICE', () => {
  const initialState = {
    notifications: [],
  };

  it('1. Returns initial state on @@INIT', () => {
    expect(notificationReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Adds notification with showNotification', () => {
    const action = showNotification({
      type: 'SUCCESS',
      title: 'Saved',
      message: 'College saved successfully.',
    });
    const state = notificationReducer(initialState, action);
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].type).toBe('SUCCESS');
    expect(state.notifications[0].title).toBe('Saved');
    expect(state.notifications[0].message).toBe('College saved successfully.');
  });

  it('3. Supports multiple notifications stacking', () => {
    let state = notificationReducer(
      initialState,
      showNotification({ type: 'INFO', message: 'First notice' })
    );
    state = notificationReducer(
      state,
      showNotification({ type: 'WARNING', message: 'Second notice' })
    );
    expect(state.notifications).toHaveLength(2);
  });

  it('4. Prevents duplicate notifications with exact same type and message', () => {
    let state = notificationReducer(
      initialState,
      showNotification({ type: 'ERROR', message: 'Duplicate failure' })
    );
    state = notificationReducer(
      state,
      showNotification({ type: 'ERROR', message: 'Duplicate failure' })
    );
    expect(state.notifications).toHaveLength(1);
  });

  it('5. Handles dismissNotification by ID', () => {
    const stateWithItem = {
      notifications: [
        { id: 'notif_1', type: 'INFO', message: 'Item 1' },
        { id: 'notif_2', type: 'INFO', message: 'Item 2' },
      ],
    };
    const state = notificationReducer(stateWithItem, dismissNotification('notif_1'));
    expect(state.notifications).toHaveLength(1);
    expect(state.notifications[0].id).toBe('notif_2');
  });

  it('6. Handles clearNotifications', () => {
    const dirtyState = {
      notifications: [{ id: 'notif_1', type: 'INFO', message: 'Item 1' }],
    };
    expect(notificationReducer(dirtyState, clearNotifications())).toEqual(initialState);
  });

  it('7. Automatically clears notifications on auth/logout', () => {
    const dirtyState = {
      notifications: [{ id: 'notif_1', type: 'INFO', message: 'Item 1' }],
    };
    expect(notificationReducer(dirtyState, logout())).toEqual(initialState);
  });
});

