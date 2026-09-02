import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorGenerationListPage from '../pages/operator/OperatorGenerationListPage.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR ID CARD GENERATION LIST VIEW', () => {
  it('1. renders operator self-requested generation history with status badge', () => {
    const store = configureStore({
      reducer: { operator: operatorReducer },
      preloadedState: {
        operator: {
          generations: [
            {
              id: 'gen-12345678',
              status: 'COMPLETED',
              studentIds: ['s-1', 's-2'],
              templateId: { name: 'Badge Template' },
              requestedAt: new Date().toISOString(),
            },
          ],
          loadingGenerations: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OperatorGenerationListPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Badge Template')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

