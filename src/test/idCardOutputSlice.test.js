import { describe, it, expect } from 'vitest';
import idCardOutputReducer, {
  downloadStudentCardRequested,
  downloadStudentCardSucceeded,
  downloadStudentCardFailed,
  downloadGenerationZipRequested,
  downloadGenerationZipSucceeded,
  downloadGenerationZipFailed,
  resetDownloadState,
} from '../features/idCardOutput/idCardOutputSlice.js';

describe('ID CARD OUTPUT REDUX SLICE', () => {
  const initialState = {
    downloadStatus: 'IDLE',
    downloadingType: null,
    currentDownload: null,
    error: null,
  };

  it('1. Returns initial state on init', () => {
    expect(idCardOutputReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('2. Handles downloadStudentCard lifecycle', () => {
    const payload = { generationId: 'g1', studentId: 's1', studentName: 'Aarav' };
    const loadingState = idCardOutputReducer(initialState, downloadStudentCardRequested(payload));
    expect(loadingState.downloadStatus).toBe('DOWNLOADING');
    expect(loadingState.downloadingType).toBe('PNG');
    expect(loadingState.currentDownload).toEqual({ generationId: 'g1', studentId: 's1', type: 'PNG' });

    const successState = idCardOutputReducer(loadingState, downloadStudentCardSucceeded());
    expect(successState.downloadStatus).toBe('SUCCESS');
    expect(successState.downloadingType).toBeNull();
    expect(successState.currentDownload).toBeNull();

    const failState = idCardOutputReducer(
      loadingState,
      downloadStudentCardFailed({ generationId: 'g1', studentId: 's1', error: 'File missing' })
    );
    expect(failState.downloadStatus).toBe('FAILED');
    expect(failState.error).toBe('File missing');
  });

  it('3. Handles downloadGenerationZip lifecycle', () => {
    const payload = { generationId: 'g1' };
    const loadingState = idCardOutputReducer(initialState, downloadGenerationZipRequested(payload));
    expect(loadingState.downloadStatus).toBe('DOWNLOADING');
    expect(loadingState.downloadingType).toBe('ZIP');
    expect(loadingState.currentDownload).toEqual({ generationId: 'g1', type: 'ZIP' });

    const successState = idCardOutputReducer(loadingState, downloadGenerationZipSucceeded());
    expect(successState.downloadStatus).toBe('SUCCESS');

    const failState = idCardOutputReducer(
      loadingState,
      downloadGenerationZipFailed({ generationId: 'g1', error: 'ZIP generation failed' })
    );
    expect(failState.downloadStatus).toBe('FAILED');
    expect(failState.error).toBe('ZIP generation failed');
  });

  it('4. Handles resetDownloadState', () => {
    const dirtyState = {
      downloadStatus: 'FAILED',
      downloadingType: null,
      currentDownload: null,
      error: 'Error occurred',
    };
    expect(idCardOutputReducer(dirtyState, resetDownloadState())).toEqual(initialState);
  });
});

