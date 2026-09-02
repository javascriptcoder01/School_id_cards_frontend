import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchTemplatesRequested,
  fetchTemplatesSucceeded,
  fetchTemplatesFailed,
  fetchTemplateDetailRequested,
  fetchTemplateDetailSucceeded,
  createTemplateRequested,
  createTemplateSucceeded,
  updateTemplateRequested,
  updateTemplateSucceeded,
  updateTemplateStatusRequested,
  updateTemplateStatusSucceeded,
} from '../features/templates/templateSlice.js';
import {
  fetchTemplatesWorker,
  fetchTemplateDetailWorker,
  createTemplateWorker,
  updateTemplateWorker,
  updateTemplateStatusWorker,
  watchTemplates,
} from '../features/templates/templateSaga.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
} from '../features/templates/templateApi.js';

describe('TEMPLATE REDUX SAGA', () => {
  it('1. fetchTemplatesWorker fetches templates and dispatches success', () => {
    const generator = fetchTemplatesWorker(fetchTemplatesRequested({ page: 1, limit: 10 }));
    expect(generator.next().value).toEqual(call(getTemplates, { page: 1, limit: 10 }));

    const mockResponse = {
      data: {
        templates: [{ id: 't1', name: 'Standard' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        fetchTemplatesSucceeded({
          templates: [{ id: 't1', name: 'Standard' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchTemplateDetailWorker fetches template and dispatches success', () => {
    const generator = fetchTemplateDetailWorker(fetchTemplateDetailRequested('t1'));
    expect(generator.next().value).toEqual(call(getTemplateById, 't1'));

    const mockResponse = { data: { template: { id: 't1', name: 'Detail Template' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchTemplateDetailSucceeded({ id: 't1', name: 'Detail Template' }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. createTemplateWorker calls API and executes onSuccess', () => {
    const onSuccess = vi.fn();
    const payload = { data: { name: 'Card 1' }, onSuccess };
    const generator = createTemplateWorker(createTemplateRequested(payload));

    expect(generator.next().value).toEqual(call(createTemplate, { name: 'Card 1' }));

    const mockResponse = { data: { template: { id: 't1', name: 'Card 1' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(createTemplateSucceeded({ id: 't1', name: 'Card 1' }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 't1', name: 'Card 1' });
  });

  it('4. updateTemplateWorker calls updateTemplate API', () => {
    const onSuccess = vi.fn();
    const payload = { id: 't1', data: { name: 'Updated' }, onSuccess };
    const generator = updateTemplateWorker(updateTemplateRequested(payload));

    expect(generator.next().value).toEqual(call(updateTemplate, 't1', { name: 'Updated' }));

    const mockResponse = { data: { template: { id: 't1', name: 'Updated' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateTemplateSucceeded({ id: 't1', name: 'Updated' }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 't1', name: 'Updated' });
  });

  it('5. updateTemplateStatusWorker calls updateTemplateStatus API', () => {
    const onSuccess = vi.fn();
    const payload = { id: 't1', isActive: false, onSuccess };
    const generator = updateTemplateStatusWorker(updateTemplateStatusRequested(payload));

    expect(generator.next().value).toEqual(call(updateTemplateStatus, 't1', false));

    const mockResponse = { data: { template: { id: 't1', isActive: false } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(updateTemplateStatusSucceeded({ id: 't1', isActive: false }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 't1', isActive: false });
  });

  it('6. watchTemplates registers takeLatest for all requested actions', () => {
    const generator = watchTemplates();
    expect(generator.next().value).toEqual(
      takeLatest(fetchTemplatesRequested.type, fetchTemplatesWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(fetchTemplateDetailRequested.type, fetchTemplateDetailWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(createTemplateRequested.type, createTemplateWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(updateTemplateRequested.type, updateTemplateWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(updateTemplateStatusRequested.type, updateTemplateStatusWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});

