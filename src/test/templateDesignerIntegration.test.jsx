import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CreateTemplatePage from '../pages/templates/CreateTemplatePage.jsx';
import EditTemplatePage from '../pages/templates/EditTemplatePage.jsx';
import { configureAppStore } from '../app/store.js';

describe('TEMPLATE DESIGNER INTEGRATION', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('1. CreateTemplatePage renders visual designer and tabs', async () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', role: 'COLLEGE_ADMIN' },
        isAuthenticated: true,
        initialized: true,
      },
      templates: {
        templates: [],
        selectedTemplate: null,
        loading: { create: false },
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <CreateTemplatePage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByRole('heading', { level: 1, name: /Create ID Card Template/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Visual Card Designer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Form Specifications/i })).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByTitle('Student Photo')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('2. EditTemplatePage populates existing template into visual designer canvas', async () => {
    const mockTemplate = {
      id: 'tmpl_100',
      name: 'Existing Campus Card',
      orientation: 'PORTRAIT',
      width: 86,
      height: 54,
      primaryColor: '#3B82F6',
      secondaryColor: '#8B5CF6',
      photo: { x: 50, y: 15, width: 25, height: 30, visible: true },
      fields: [
        { field: 'name', label: 'Student Name', x: 10, y: 30, fontSize: 14, fontWeight: 'BOLD', visible: true },
      ],
    };

    const store = configureAppStore({
      auth: {
        user: { id: 'u1', role: 'COLLEGE_ADMIN' },
        isAuthenticated: true,
        initialized: true,
      },
      templates: {
        templates: [mockTemplate],
        selectedTemplate: mockTemplate,
        loading: { detail: false, update: false },
        error: null,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/templates/tmpl_100/edit']}>
          <Routes>
            <Route path="/templates/:templateId/edit" element={<EditTemplatePage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(
      () => {
        expect(screen.getByDisplayValue('Existing Campus Card')).toBeInTheDocument();
        expect(screen.getByTitle('Student Photo')).toBeInTheDocument();
        expect(screen.getByText('Aarav Sharma')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });
});
