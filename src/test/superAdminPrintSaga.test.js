import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import {
  loadPrintSummaryWorker,
  loadCollegePrintDetailsWorker,
} from '../features/superAdminPrint/superAdminPrintSaga.js';
import {
  getPrintSummary,
  getCollegePrintDetails,
} from '../features/superAdminPrint/superAdminPrintApi.js';
import {
  loadPrintSummarySucceeded,
  loadCollegePrintDetailsSucceeded,
} from '../features/superAdminPrint/superAdminPrintSlice.js';

describe('SUPER ADMIN PRINT CENTER SAGA', () => {
  it('1. loadPrintSummaryWorker dispatches success on API response', () => {
    const generator = loadPrintSummaryWorker({ payload: {} });
    expect(generator.next().value).toEqual(call(getPrintSummary, {}));

    const mockData = { colleges: [] };
    expect(generator.next(mockData).value).toEqual(put(loadPrintSummarySucceeded(mockData)));
    expect(generator.next().done).toBe(true);
  });

  it('2. loadCollegePrintDetailsWorker dispatches success on API response', () => {
    const generator = loadCollegePrintDetailsWorker({ payload: { collegeId: 'col-1' } });
    expect(generator.next().value).toEqual(call(getCollegePrintDetails, 'col-1'));

    const mockData = { college: { id: 'col-1' }, cards: [] };
    expect(generator.next(mockData).value).toEqual(put(loadCollegePrintDetailsSucceeded(mockData)));
    expect(generator.next().done).toBe(true);
  });
});
