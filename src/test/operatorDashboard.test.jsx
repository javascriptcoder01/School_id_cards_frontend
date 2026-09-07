import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorDashboard from '../pages/dashboard/OperatorDashboard.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR DASHBOARD VIEW', () => {
  it('1. renders real assigned metrics and class breakdown', () => {
    const store = configureStore({
      reducer: { operator: operatorReducer },
      preloadedState: {
        operator: {
          dashboard: {
            summary: {
              totalStudents: 35,
              completedStudents: 30,
              pendingStudents: 5,
              generatedCards: 28,
              pendingCards: 7,
              totalAssignments: 1,
            },
            assignments: [
              {
                className: '10',
                section: 'A',
                totalStudents: 35,
                completedStudents: 30,
                pendingStudents: 5,
                generatedCards: 28,
              },
            ],
          },
          loading: false,
          error: null,
          initialized: true,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OperatorDashboard user={{ name: 'Rahul Operator' }} />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Welcome, Rahul Operator')).toBeInTheDocument();
    expect(screen.getByText('Class 10 (Sec A)')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});

