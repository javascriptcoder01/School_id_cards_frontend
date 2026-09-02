import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchGenerationsRequested,
  fetchGenerationsSucceeded,
  fetchGenerationDetailRequested,
  fetchGenerationDetailSucceeded,
  createGenerationRequested,
  createGenerationSucceeded,
  createBulkGenerationRequested,
  createBulkGenerationSucceeded,
  processGenerationRequested,
  processGenerationSucceeded,
  fetchGenerationResultsRequested,
  fetchGenerationResultsSucceeded,
} from '../features/idCardGeneration/idCardGenerationSlice.js';
import {
  fetchGenerationsWorker,
  fetchGenerationDetailWorker,
  createGenerationWorker,
  createBulkGenerationWorker,
  processGenerationWorker,
  fetchGenerationResultsWorker,
  watchIdCardGeneration,
} from '../features/idCardGeneration/idCardGenerationSaga.js';
import {
  createGeneration,
  createBulkGeneration,
  getGenerations,
  getGenerationById,
  processGeneration,
  getGenerationResults,
} from '../features/idCardGeneration/idCardGenerationApi.js';

describe('ID CARD GENERATION REDUX SAGA', () => {
  it('1. fetchGenerationsWorker fetches generation jobs and dispatches success', () => {
    const generator = fetchGenerationsWorker(fetchGenerationsRequested({ page: 1, limit: 10 }));
    expect(generator.next().value).toEqual(call(getGenerations, { page: 1, limit: 10 }));

    const mockResponse = {
      data: {
        generations: [{ id: 'g1', status: 'PENDING' }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(
        fetchGenerationsSucceeded({
          generations: [{ id: 'g1', status: 'PENDING' }],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        })
      )
    );
    expect(generator.next().done).toBe(true);
  });

  it('2. fetchGenerationDetailWorker fetches job detail and dispatches success', () => {
    const generator = fetchGenerationDetailWorker(fetchGenerationDetailRequested('g1'));
    expect(generator.next().value).toEqual(call(getGenerationById, 'g1'));

    const mockResponse = { data: { generation: { id: 'g1', status: 'COMPLETED' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchGenerationDetailSucceeded({ id: 'g1', status: 'COMPLETED' }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. createGenerationWorker calls single API and invokes callback', () => {
    const onSuccess = vi.fn();
    const payload = { data: { templateId: 't1', studentId: 's1' }, onSuccess };
    const generator = createGenerationWorker(createGenerationRequested(payload));

    expect(generator.next().value).toEqual(call(createGeneration, { templateId: 't1', studentId: 's1' }));

    const mockResponse = { data: { generation: { id: 'g1', status: 'PENDING' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(createGenerationSucceeded({ id: 'g1', status: 'PENDING' }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 'g1', status: 'PENDING' });
  });

  it('4. createBulkGenerationWorker calls bulk API and invokes callback', () => {
    const onSuccess = vi.fn();
    const payload = { data: { templateId: 't1', studentIds: ['s1', 's2'] }, onSuccess };
    const generator = createBulkGenerationWorker(createBulkGenerationRequested(payload));

    expect(generator.next().value).toEqual(
      call(createBulkGeneration, { templateId: 't1', studentIds: ['s1', 's2'] })
    );

    const mockResponse = { data: { generation: { id: 'g2', status: 'PENDING' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(createBulkGenerationSucceeded({ id: 'g2', status: 'PENDING' }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 'g2', status: 'PENDING' });
  });

  it('5. processGenerationWorker calls process API and dispatches success', () => {
    const onSuccess = vi.fn();
    const payload = { id: 'g1', onSuccess };
    const generator = processGenerationWorker(processGenerationRequested(payload));

    expect(generator.next().value).toEqual(call(processGeneration, 'g1'));

    const mockResponse = { data: { generation: { id: 'g1', status: 'PROCESSING' } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(processGenerationSucceeded({ id: 'g1', status: 'PROCESSING' }))
    );
    expect(generator.next().done).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith({ id: 'g1', status: 'PROCESSING' });
  });

  it('6. fetchGenerationResultsWorker calls results API and dispatches success', () => {
    const generator = fetchGenerationResultsWorker(fetchGenerationResultsRequested('g1'));
    expect(generator.next().value).toEqual(call(getGenerationResults, 'g1'));

    const mockResponse = { data: { generation: { totalStudents: 5, completedCount: 5 } } };
    expect(generator.next(mockResponse).value).toEqual(
      put(fetchGenerationResultsSucceeded({ totalStudents: 5, completedCount: 5 }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('7. watchIdCardGeneration registers all takeLatest watchers', () => {
    const generator = watchIdCardGeneration();
    expect(generator.next().value).toEqual(
      takeLatest(fetchGenerationsRequested.type, fetchGenerationsWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(fetchGenerationDetailRequested.type, fetchGenerationDetailWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(createGenerationRequested.type, createGenerationWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(createBulkGenerationRequested.type, createBulkGenerationWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(processGenerationRequested.type, processGenerationWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(fetchGenerationResultsRequested.type, fetchGenerationResultsWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});

