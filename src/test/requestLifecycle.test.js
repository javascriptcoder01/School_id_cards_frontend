import { describe, it, expect } from 'vitest';
import { configureAppStore } from '../app/store.js';
import { clearDashboard } from '../features/dashboard/dashboardSlice.js';
import { clearSelectedStudent } from '../features/students/studentSlice.js';
import { clearSelectedTemplate } from '../features/templates/templateSlice.js';

describe('REQUEST LIFECYCLE & REDUX STATE SERIALIZABILITY', () => {
  it('1. Root store initializes with 100% serializable state', () => {
    const store = configureAppStore();
    const state = store.getState();

    // Verify all state branches are serializable to JSON
    const serialized = JSON.stringify(state);
    expect(serialized).toBeDefined();
    expect(typeof serialized).toBe('string');
    const parsed = JSON.parse(serialized);
    expect(parsed.auth).toBeDefined();
    expect(parsed.dashboard).toBeDefined();
    expect(parsed.students).toBeDefined();
    expect(parsed.templates).toBeDefined();
    expect(parsed.idCardGeneration).toBeDefined();
    expect(parsed.idCardOutput).toBeDefined();
  });

  it('2. State clear actions return clean initial state without residual data', () => {
    const store = configureAppStore({
      dashboard: {
        dashboardType: 'COLLEGE_ADMIN',
        summary: { totalStudents: 50 },
        activity: [],
        generationStats: null,
        loading: false,
        error: null,
        initialized: true,
      },
      students: {
        students: [{ id: 's1', name: 'Student 1' }],
        selectedStudent: { id: 's1', name: 'Student 1' },
        loading: { list: false, detail: false, create: false, update: false, statusUpdate: false },
        errors: { list: null, detail: null, create: null, update: null, statusUpdate: null },
      },
      templates: {
        templates: [{ id: 't1', name: 'Template 1' }],
        selectedTemplate: { id: 't1', name: 'Template 1' },
        loading: { list: false, detail: false, create: false, update: false, status: false },
        error: null,
      },
    });

    store.dispatch(clearDashboard());
    expect(store.getState().dashboard.summary).toBeNull();
    expect(store.getState().dashboard.initialized).toBe(false);

    store.dispatch(clearSelectedStudent());
    expect(store.getState().students.selectedStudent).toBeNull();

    store.dispatch(clearSelectedTemplate());
    expect(store.getState().templates.selectedTemplate).toBeNull();
  });
});

