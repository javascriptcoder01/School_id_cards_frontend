import { describe, it, expect } from 'vitest';
import {
  selectTemplatesState,
  selectTemplates,
  selectSelectedTemplate,
  selectTemplatePagination,
  selectTemplateFilters,
  selectTemplateLoading,
  selectTemplatesLoading,
  selectTemplateDetailLoading,
  selectTemplateCreateLoading,
  selectTemplateUpdateLoading,
  selectTemplateStatusLoading,
  selectTemplateError,
} from '../features/templates/templateSelectors.js';

describe('TEMPLATE SELECTORS', () => {
  const mockState = {
    templates: {
      templates: [{ id: 't1', name: 'Standard ID' }],
      selectedTemplate: { id: 't1', name: 'Standard ID' },
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      filters: { search: 'Standard', collegeId: 'c1' },
      loading: {
        list: true,
        detail: false,
        create: false,
        update: true,
        status: false,
      },
      error: 'Sample error message',
    },
  };

  it('1. Selects state slices correctly', () => {
    expect(selectTemplatesState(mockState)).toEqual(mockState.templates);
    expect(selectTemplates(mockState)).toEqual([{ id: 't1', name: 'Standard ID' }]);
    expect(selectSelectedTemplate(mockState)).toEqual({ id: 't1', name: 'Standard ID' });
    expect(selectTemplatePagination(mockState)).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    expect(selectTemplateFilters(mockState)).toEqual({ search: 'Standard', collegeId: 'c1' });
    expect(selectTemplatesLoading(mockState)).toBe(true);
    expect(selectTemplateDetailLoading(mockState)).toBe(false);
    expect(selectTemplateUpdateLoading(mockState)).toBe(true);
    expect(selectTemplateStatusLoading(mockState)).toBe(false);
    expect(selectTemplateError(mockState)).toBe('Sample error message');
  });

  it('2. Handles empty/undefined state safely', () => {
    const emptyState = {};
    expect(selectTemplates(emptyState)).toEqual([]);
    expect(selectSelectedTemplate(emptyState)).toBeNull();
    expect(selectTemplatePagination(emptyState)).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    expect(selectTemplateFilters(emptyState)).toEqual({ search: '', collegeId: '' });
    expect(selectTemplatesLoading(emptyState)).toBe(false);
    expect(selectTemplateError(emptyState)).toBeNull();
  });
});

