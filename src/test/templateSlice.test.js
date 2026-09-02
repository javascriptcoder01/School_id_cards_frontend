import { describe, it, expect } from 'vitest';
import templateReducer, {
  fetchTemplatesRequested,
  fetchTemplatesSucceeded,
  fetchTemplatesFailed,
  fetchTemplateDetailRequested,
  fetchTemplateDetailSucceeded,
  fetchTemplateDetailFailed,
  createTemplateRequested,
  createTemplateSucceeded,
  createTemplateFailed,
  updateTemplateRequested,
  updateTemplateSucceeded,
  updateTemplateFailed,
  updateTemplateStatusRequested,
  updateTemplateStatusSucceeded,
  updateTemplateStatusFailed,
  setTemplateFilters,
  resetTemplateFilters,
  resetTemplateState,
} from '../features/templates/templateSlice.js';

describe('TEMPLATE REDUX SLICE', () => {
  const initialState = {
    templates: [],
    selectedTemplate: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      search: '',
      collegeId: '',
    },
    loading: {
      list: false,
      detail: false,
      create: false,
      update: false,
      status: false,
    },
    error: null,
  };

  it('1. Returns initial state on init', () => {
    expect(templateReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles fetchTemplates lifecycle', () => {
    const loadingState = templateReducer(initialState, fetchTemplatesRequested());
    expect(loadingState.loading.list).toBe(true);

    const mockPayload = {
      templates: [{ id: 't1', name: 'Portrait Card' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    const successState = templateReducer(loadingState, fetchTemplatesSucceeded(mockPayload));
    expect(successState.loading.list).toBe(false);
    expect(successState.templates).toHaveLength(1);
    expect(successState.pagination.total).toBe(1);

    const failState = templateReducer(loadingState, fetchTemplatesFailed('Network error'));
    expect(failState.loading.list).toBe(false);
    expect(failState.error).toBe('Network error');
  });

  it('3. Handles fetchTemplateDetail lifecycle', () => {
    const loadingState = templateReducer(initialState, fetchTemplateDetailRequested());
    expect(loadingState.loading.detail).toBe(true);

    const templateData = { id: 't1', name: 'Portrait Card', width: 86, height: 54 };
    const successState = templateReducer(loadingState, fetchTemplateDetailSucceeded(templateData));
    expect(successState.loading.detail).toBe(false);
    expect(successState.selectedTemplate).toEqual(templateData);

    const failState = templateReducer(loadingState, fetchTemplateDetailFailed('Template not found'));
    expect(failState.loading.detail).toBe(false);
    expect(failState.error).toBe('Template not found');
  });

  it('4. Handles createTemplate lifecycle', () => {
    const loadingState = templateReducer(initialState, createTemplateRequested());
    expect(loadingState.loading.create).toBe(true);

    const createdTemplate = { id: 't2', name: 'Landscape Card' };
    const successState = templateReducer(loadingState, createTemplateSucceeded(createdTemplate));
    expect(successState.loading.create).toBe(false);
    expect(successState.templates).toContainEqual(createdTemplate);

    const failState = templateReducer(loadingState, createTemplateFailed('Validation failed'));
    expect(failState.loading.create).toBe(false);
    expect(failState.error).toBe('Validation failed');
  });

  it('5. Handles updateTemplate lifecycle', () => {
    const stateWithItem = {
      ...initialState,
      templates: [{ id: 't1', name: 'Old Name' }],
      selectedTemplate: { id: 't1', name: 'Old Name' },
    };

    const loadingState = templateReducer(stateWithItem, updateTemplateRequested());
    expect(loadingState.loading.update).toBe(true);

    const updatedTemplate = { id: 't1', name: 'New Name' };
    const successState = templateReducer(loadingState, updateTemplateSucceeded(updatedTemplate));
    expect(successState.loading.update).toBe(false);
    expect(successState.selectedTemplate.name).toBe('New Name');
    expect(successState.templates[0].name).toBe('New Name');
  });

  it('6. Handles updateTemplateStatus lifecycle', () => {
    const stateWithItem = {
      ...initialState,
      templates: [{ id: 't1', isActive: true }],
      selectedTemplate: { id: 't1', isActive: true },
    };

    const loadingState = templateReducer(stateWithItem, updateTemplateStatusRequested());
    expect(loadingState.loading.status).toBe(true);

    const successState = templateReducer(
      loadingState,
      updateTemplateStatusSucceeded({ id: 't1', isActive: false })
    );
    expect(successState.loading.status).toBe(false);
    expect(successState.templates[0].isActive).toBe(false);
    expect(successState.selectedTemplate.isActive).toBe(false);
  });

  it('7. Handles filter modifications and state reset', () => {
    const filteredState = templateReducer(initialState, setTemplateFilters({ search: 'Card' }));
    expect(filteredState.filters.search).toBe('Card');

    const resetFilterState = templateReducer(filteredState, resetTemplateFilters());
    expect(resetFilterState.filters.search).toBe('');

    const fullyResetState = templateReducer(filteredState, resetTemplateState());
    expect(fullyResetState).toEqual(initialState);
  });
});

