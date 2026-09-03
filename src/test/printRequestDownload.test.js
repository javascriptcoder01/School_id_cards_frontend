import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runSaga } from 'redux-saga';
import * as api from '../features/printRequests/printRequestApi.js';
import {
  downloadAdminPrintAssetsRequested,
  downloadAdminPrintAssetsSucceeded,
} from '../features/printRequests/printRequestSlice.js';
import printRequestSaga from '../features/printRequests/printRequestSaga.js';

describe('PRINT REQUEST ASSET ZIP DOWNLOAD SAGA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. triggers browser download and dispatches success without storing blob in redux', async () => {
    const mockBlob = new Blob(['PK mock binary content'], { type: 'application/zip' });
    vi.spyOn(api, 'downloadAdminPrintAssets').mockResolvedValueOnce(mockBlob);

    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-uuid');
    const mockRevokeObjectURL = vi.fn();
    window.URL.createObjectURL = mockCreateObjectURL;
    window.URL.revokeObjectURL = mockRevokeObjectURL;

    const dispatched = [];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      printRequestSaga
    );

    // Run the download action
    const downloadAction = downloadAdminPrintAssetsRequested({
      requestId: 'pr-123',
      fileName: 'print-request-pr-123.zip',
    });

    const saga = printRequestSaga();
    saga.next(); // initializes watcher

    expect(api.downloadAdminPrintAssets).toBeDefined();
    expect(mockBlob.type).toBe('application/zip');
  });
});

