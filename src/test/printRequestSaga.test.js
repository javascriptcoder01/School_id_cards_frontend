import { describe, it, expect, vi } from 'vitest';
import { call, put } from 'redux-saga/effects';
import * as api from '../features/printRequests/printRequestApi.js';
import * as actions from '../features/printRequests/printRequestSlice.js';
import { showNotification } from '../features/notifications/notificationSlice.js';
import { printRequestSaga } from '../features/printRequests/printRequestSaga.js';

describe('PRINT REQUEST REDUX SAGA', () => {
  it('1. watch saga registers all action handlers', () => {
    const saga = printRequestSaga();
    const result = saga.next().value;
    expect(result.type).toBe('ALL');
    expect(result.payload).toHaveLength(13);
  });
});

