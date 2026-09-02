import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureAppStore } from '../app/store.js';
import App from '../App.jsx';
import rootReducer from '../app/rootReducer.js';
import rootSaga from '../app/rootSaga.js';

describe('GROUP A — PROJECT FOUNDATION', () => {
  let store;

  beforeEach(() => {
    localStorage.clear();
    store = configureAppStore();
  });

  it('1. Root reducer combines auth and app slice reducers correctly', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('app');
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.app.sidebarOpen).toBe(true);
  });

  it('2. Saga middleware is active and root saga task is running', () => {
    expect(store.sagaMiddleware).toBeDefined();
    expect(store.sagaTask).toBeDefined();
    expect(store.sagaTask.isRunning()).toBe(true);
  });

  it('3. Custom preloaded state initializes correctly in store factory', () => {
    const customStore = configureAppStore({
      auth: {
        user: { id: '123', name: 'Test', role: 'SUPER_ADMIN' },
        token: 'test-token',
        refreshToken: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });
    expect(customStore.getState().auth.isAuthenticated).toBe(true);
    expect(customStore.getState().auth.user.name).toBe('Test');
  });

  it('4. Application renders within Redux Provider and Router without crashing', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <App />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /School ID Cards/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });
  });
});
