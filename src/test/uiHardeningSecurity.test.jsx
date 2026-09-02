import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureAppStore } from '../app/store.js';
import NotificationContainer from '../components/common/NotificationContainer.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import notificationReducer, { showNotification } from '../features/notifications/notificationSlice.js';

describe('UI HARDENING SECURITY & PRIVACY SANITIZATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Tokens or headers are sanitized when dispatching showNotification', () => {
    const rawJwt = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature';
    const state = notificationReducer(
      undefined,
      showNotification({
        type: 'INFO',
        message: rawJwt,
      })
    );

    expect(state.notifications[0].message).not.toContain(rawJwt);
    expect(state.notifications[0].message).toBe('Operation completed.');
  });

  it('2. NotificationContainer does not render sensitive authorization data in DOM', () => {
    const store = configureAppStore({
      notifications: {
        notifications: [
          {
            id: 'n1',
            type: 'SUCCESS',
            title: 'Clean Notice',
            message: 'Action completed safely.',
          },
        ],
      },
    });

    const { container } = render(
      <Provider store={store}>
        <NotificationContainer />
      </Provider>
    );

    expect(container.innerHTML).toContain('Action completed safely.');
    expect(container.innerHTML).not.toContain('Authorization');
    expect(container.innerHTML).not.toContain('Bearer');
    expect(container.innerHTML).not.toContain('__v');
  });

  it('3. ErrorState does not render stack traces or database errors', () => {
    const safeError = 'An error occurred. Please contact support.';
    const { container } = render(
      <ErrorState
        title="Operation Failed"
        message={safeError}
      />
    );

    expect(container.innerHTML).toContain(safeError);
    expect(container.innerHTML).not.toContain('MongoServerError');
    expect(container.innerHTML).not.toContain('at Object.<anonymous>');
    expect(container.innerHTML).not.toContain('AxiosError');
  });
});

