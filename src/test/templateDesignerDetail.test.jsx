import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import TemplateDetailPage from '../pages/templates/TemplateDetailPage.jsx';
import { configureAppStore } from '../app/store.js';
import apiClient from '../api/apiClient.js';

describe('TEMPLATE DETAIL READ-ONLY LIVE PREVIEW', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. TemplateDetailPage displays visual card layout with live preview', async () => {
    const mockTemplate = {
      id: 'tmpl_200',
      name: 'Springfield Card 2026',
      orientation: 'PORTRAIT',
      width: 86,
      height: 54,
      primaryColor: '#4F46E5',
      secondaryColor: '#9333EA',
      isActive: true,
      photo: { x: 55, y: 20, width: 25, height: 30, visible: true },
      fields: [
        { field: 'name', label: 'Full Name', x: 10, y: 30, fontSize: 13, fontWeight: 'BOLD', visible: true },
      ],
    };

    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        success: true,
        data: { template: mockTemplate },
      },
    });

    const store = configureAppStore({
      auth: {
        user: { id: 'u1', role: 'COLLEGE_ADMIN' },
        isAuthenticated: true,
        initialized: true,
      },
      templates: {
        templates: [mockTemplate],
        selectedTemplate: mockTemplate,
        loading: { detail: false },
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/templates/tmpl_200']}>
          <Routes>
            <Route path="/templates/:templateId" element={<TemplateDetailPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Visual Card Layout')).toBeInTheDocument();
    });

    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
    expect(screen.getByTitle('Student Photo')).toBeInTheDocument();

    // Verify it is strictly read-only (no editing tools or inputs)
    expect(screen.queryByRole('button', { name: /Design Canvas/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remove from card/i })).not.toBeInTheDocument();
  });
});

