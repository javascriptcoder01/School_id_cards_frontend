import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from '../app/store.js';
import NotificationContainer from '../components/common/NotificationContainer.jsx';
import { showNotification } from '../features/notifications/notificationSlice.js';

describe('NOTIFICATION UI COMPONENT', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('1. Renders notifications with type, title, and message', () => {
    const store = configureAppStore({
      notifications: {
        notifications: [
          {
            id: 'n1',
            type: 'SUCCESS',
            title: 'Operation Succeeded',
            message: 'Student record enrolled successfully.',
            duration: 5000,
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <NotificationContainer />
      </Provider>
    );

    expect(screen.getByText('Operation Succeeded')).toBeInTheDocument();
    expect(screen.getByText('Student record enrolled successfully.')).toBeInTheDocument();
  });

  it('2. Dismisses notification when close button is clicked', () => {
    const store = configureAppStore({
      notifications: {
        notifications: [
          {
            id: 'n1',
            type: 'ERROR',
            title: 'Operation Failed',
            message: 'Could not connect.',
            duration: 0,
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <NotificationContainer />
      </Provider>
    );

    const closeBtn = screen.getByRole('button', { name: /Close notification/i });
    fireEvent.click(closeBtn);

    expect(store.getState().notifications.notifications).toHaveLength(0);
  });

  it('3. Auto-dismisses notification after duration expires', () => {
    const store = configureAppStore({
      notifications: {
        notifications: [
          {
            id: 'n1',
            type: 'INFO',
            title: 'Auto Dismiss',
            message: 'Disappearing message',
            duration: 3000,
          },
        ],
      },
    });

    render(
      <Provider store={store}>
        <NotificationContainer />
      </Provider>
    );

    expect(screen.getByText('Disappearing message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(store.getState().notifications.notifications).toHaveLength(0);
  });
});

