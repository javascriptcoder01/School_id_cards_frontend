import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import OperatorIdCardPreviewPage from '../pages/operator/OperatorIdCardPreviewPage.jsx';
import operatorReducer from '../features/operator/operatorSlice.js';

describe('OPERATOR ID CARD PREVIEW VIEW', () => {
  it('1. renders rendered preview image and proceed button when preview exists', () => {
    const store = configureStore({
      reducer: { operator: operatorReducer },
      preloadedState: {
        operator: {
          students: [{ id: 's-1', name: 'Aarav Sharma', className: '10', section: 'A' }],
          templates: [{ id: 't-1', name: 'Standard Badge', orientation: 'PORTRAIT' }],
          preview: { previewImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
          previewing: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <OperatorIdCardPreviewPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByAltText('ID Card Preview')).toBeInTheDocument();
    expect(screen.getByText('Proceed to Card Generation')).toBeInTheDocument();
  });
});
