import { describe, it, expect, beforeEach } from 'vitest';
import { configureAppStore } from '../app/store.js';
import { logout } from '../features/auth/authSlice.js';
import { clearDashboard } from '../features/dashboard/dashboardSlice.js';
import { clearSelectedStudent } from '../features/students/studentSlice.js';
import { clearSelectedTemplate, resetTemplateState } from '../features/templates/templateSlice.js';

describe('BATCH 16 — TENANT & COLLEGE ISOLATION INTEGRATION', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. User logout purges auth state and prevents session retention across tenants', () => {
    const store = configureAppStore({
      auth: {
        user: { id: 'u1', name: 'Tenant A Admin', role: 'COLLEGE_ADMIN', collegeId: 'college-A' },
        token: 'tenant-a-jwt',
        isAuthenticated: true,
        isLoading: false,
        error: null,
        initialized: true,
      },
    });

    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('2. Feature slice reset actions prevent stale resource leakage across sessions', () => {
    const store = configureAppStore({
      students: {
        students: [{ id: 's1', name: 'Student from College A' }],
        selectedStudent: { id: 's1', name: 'Student from College A' },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '' },
        loading: { list: false, detail: false, create: false, update: false, statusUpdate: false },
        errors: { list: null, detail: null, create: null, update: null, statusUpdate: null },
      },
      templates: {
        templates: [{ id: 't1', name: 'Template from College A' }],
        selectedTemplate: { id: 't1', name: 'Template from College A' },
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: '', collegeId: '' },
        loading: { list: false, detail: false, create: false, update: false, status: false },
        error: null,
      },
      dashboard: {
        summary: { totalStudents: 50 },
        activity: [{ id: 'act-1' }],
        generationStats: { total: 10 },
        loading: false,
        error: null,
      },
    });

    // Clear feature slices
    store.dispatch(clearSelectedStudent());
    store.dispatch(clearSelectedTemplate());
    store.dispatch(resetTemplateState());
    store.dispatch(clearDashboard());

    const state = store.getState();
    expect(state.students.selectedStudent).toBeNull();
    expect(state.templates.selectedTemplate).toBeNull();
    expect(state.templates.templates).toEqual([]);
    expect(state.dashboard.summary).toBeNull();
    expect(state.dashboard.activity).toEqual([]);
    expect(state.dashboard.generationStats).toBeNull();
  });
});

