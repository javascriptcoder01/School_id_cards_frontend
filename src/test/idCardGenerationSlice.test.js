import { describe, it, expect } from 'vitest';
import idCardGenerationReducer, {
  fetchGenerationsRequested,
  fetchGenerationsSucceeded,
  fetchGenerationsFailed,
  fetchGenerationDetailRequested,
  fetchGenerationDetailSucceeded,
  fetchGenerationDetailFailed,
  createGenerationRequested,
  createGenerationSucceeded,
  createGenerationFailed,
  createBulkGenerationRequested,
  createBulkGenerationSucceeded,
  createBulkGenerationFailed,
  processGenerationRequested,
  processGenerationSucceeded,
  processGenerationFailed,
  fetchGenerationResultsRequested,
  fetchGenerationResultsSucceeded,
  fetchGenerationResultsFailed,
  setGenerationFilters,
  resetGenerationFilters,
  resetGenerationState,
} from '../features/idCardGeneration/idCardGenerationSlice.js';

describe('ID CARD GENERATION REDUX SLICE', () => {
  const initialState = {
    generations: [],
    selectedGeneration: null,
    results: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    filters: {
      status: '',
      templateId: '',
      studentId: '',
    },
    loading: {
      list: false,
      detail: false,
      create: false,
      process: false,
      results: false,
    },
    error: null,
  };

  it('1. Returns initial state on init', () => {
    expect(idCardGenerationReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles fetchGenerations lifecycle', () => {
    const loadingState = idCardGenerationReducer(initialState, fetchGenerationsRequested());
    expect(loadingState.loading.list).toBe(true);

    const payload = {
      generations: [{ id: 'g1', status: 'PENDING' }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };
    const successState = idCardGenerationReducer(loadingState, fetchGenerationsSucceeded(payload));
    expect(successState.loading.list).toBe(false);
    expect(successState.generations).toHaveLength(1);
    expect(successState.pagination.total).toBe(1);

    const failState = idCardGenerationReducer(loadingState, fetchGenerationsFailed('Network error'));
    expect(failState.loading.list).toBe(false);
    expect(failState.error).toBe('Network error');
  });

  it('3. Handles fetchGenerationDetail lifecycle', () => {
    const loadingState = idCardGenerationReducer(initialState, fetchGenerationDetailRequested());
    expect(loadingState.loading.detail).toBe(true);

    const genData = { id: 'g1', status: 'COMPLETED', studentCount: 5 };
    const successState = idCardGenerationReducer(loadingState, fetchGenerationDetailSucceeded(genData));
    expect(successState.loading.detail).toBe(false);
    expect(successState.selectedGeneration).toEqual(genData);

    const failState = idCardGenerationReducer(loadingState, fetchGenerationDetailFailed('Not found'));
    expect(failState.loading.detail).toBe(false);
    expect(failState.error).toBe('Not found');
  });

  it('4. Handles createGeneration and createBulkGeneration lifecycle', () => {
    const loadingState = idCardGenerationReducer(initialState, createGenerationRequested());
    expect(loadingState.loading.create).toBe(true);

    const createdSingle = { id: 'g1', status: 'PENDING', studentId: 's1' };
    const successState = idCardGenerationReducer(loadingState, createGenerationSucceeded(createdSingle));
    expect(successState.loading.create).toBe(false);
    expect(successState.generations).toContainEqual(createdSingle);

    const bulkLoading = idCardGenerationReducer(initialState, createBulkGenerationRequested());
    expect(bulkLoading.loading.create).toBe(true);

    const createdBulk = { id: 'g2', status: 'PENDING', studentIds: ['s1', 's2'] };
    const bulkSuccess = idCardGenerationReducer(bulkLoading, createBulkGenerationSucceeded(createdBulk));
    expect(bulkSuccess.loading.create).toBe(false);
    expect(bulkSuccess.generations).toContainEqual(createdBulk);
  });

  it('5. Handles processGeneration lifecycle', () => {
    const stateWithJob = {
      ...initialState,
      generations: [{ id: 'g1', status: 'PENDING' }],
      selectedGeneration: { id: 'g1', status: 'PENDING' },
    };

    const loadingState = idCardGenerationReducer(stateWithJob, processGenerationRequested());
    expect(loadingState.loading.process).toBe(true);

    const processedJob = { id: 'g1', status: 'PROCESSING' };
    const successState = idCardGenerationReducer(loadingState, processGenerationSucceeded(processedJob));
    expect(successState.loading.process).toBe(false);
    expect(successState.generations[0].status).toBe('PROCESSING');
    expect(successState.selectedGeneration.status).toBe('PROCESSING');
  });

  it('6. Handles fetchGenerationResults lifecycle', () => {
    const loadingState = idCardGenerationReducer(initialState, fetchGenerationResultsRequested());
    expect(loadingState.loading.results).toBe(true);

    const resultsData = { totalStudents: 20, completedCount: 18, failedCount: 2 };
    const successState = idCardGenerationReducer(loadingState, fetchGenerationResultsSucceeded(resultsData));
    expect(successState.loading.results).toBe(false);
    expect(successState.results).toEqual(resultsData);
  });

  it('7. Handles filters and reset', () => {
    const filteredState = idCardGenerationReducer(initialState, setGenerationFilters({ status: 'PENDING' }));
    expect(filteredState.filters.status).toBe('PENDING');

    const resetFilterState = idCardGenerationReducer(filteredState, resetGenerationFilters());
    expect(resetFilterState.filters.status).toBe('');

    const fullyResetState = idCardGenerationReducer(filteredState, resetGenerationState());
    expect(fullyResetState).toEqual(initialState);
  });
});

