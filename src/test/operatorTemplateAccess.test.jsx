import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorTemplateListPage from '../pages/operator/OperatorTemplateListPage.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR READ-ONLY TEMPLATE ACCESS', () => {
  it('1. Operator sees template list without any create/edit/delete buttons', () => {
    const store = configureStore({
      reducer: { operator: operatorReducer },
      preloadedState: {
        operator: {
          templates: [
            { id: 'tmpl-1', name: 'Standard Student Badge', width: 600, height: 900, fields: [] },
          ],
          loadingTemplates: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OperatorTemplateListPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Standard Student Badge')).toBeInTheDocument();
    expect(screen.getByText('View Design')).toBeInTheDocument();
    expect(screen.queryByText(/Create Template/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Edit Template/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Delete/i)).not.toBeInTheDocument();
  });
});
