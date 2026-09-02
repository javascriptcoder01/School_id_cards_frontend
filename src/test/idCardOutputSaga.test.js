import { describe, it, expect, vi } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import {
  downloadStudentCardRequested,
  downloadStudentCardSucceeded,
  downloadStudentCardFailed,
  downloadGenerationZipRequested,
  downloadGenerationZipSucceeded,
  downloadGenerationZipFailed,
} from '../features/idCardOutput/idCardOutputSlice.js';
import {
  downloadStudentCardWorker,
  downloadGenerationZipWorker,
  watchIdCardOutput,
  getFilenameFromHeader,
} from '../features/idCardOutput/idCardOutputSaga.js';
import {
  downloadStudentCard,
  downloadGenerationZip,
} from '../features/idCardOutput/idCardOutputApi.js';

describe('ID CARD OUTPUT REDUX SAGA', () => {
  it('1. getFilenameFromHeader extracts filename accurately', () => {
    expect(
      getFilenameFromHeader('attachment; filename="student-123.png"', 'fallback.png')
    ).toBe('student-123.png');
    expect(getFilenameFromHeader(null, 'fallback.png')).toBe('fallback.png');
  });

  it('2. downloadStudentCardWorker calls API and dispatches success', () => {
    const onSuccess = vi.fn();
    const payload = { generationId: 'g1', studentId: 's1', studentName: 'Aarav Patel', onSuccess };
    const generator = downloadStudentCardWorker(downloadStudentCardRequested(payload));

    expect(generator.next().value).toEqual(call(downloadStudentCard, 'g1', 's1'));

    const mockResponse = {
      data: new Blob(['PNG_DATA']),
      headers: { 'content-disposition': 'attachment; filename="student_aarav.png"' },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(downloadStudentCardSucceeded({ generationId: 'g1', studentId: 's1' }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('3. downloadGenerationZipWorker calls API and dispatches success', () => {
    const onSuccess = vi.fn();
    const payload = { generationId: 'g1', onSuccess };
    const generator = downloadGenerationZipWorker(downloadGenerationZipRequested(payload));

    expect(generator.next().value).toEqual(call(downloadGenerationZip, 'g1'));

    const mockResponse = {
      data: new Blob(['ZIP_DATA']),
      headers: { 'content-disposition': 'attachment; filename="batch_cards.zip"' },
    };

    expect(generator.next(mockResponse).value).toEqual(
      put(downloadGenerationZipSucceeded({ generationId: 'g1' }))
    );
    expect(generator.next().done).toBe(true);
  });

  it('4. watchIdCardOutput registers takeLatest for both download actions', () => {
    const generator = watchIdCardOutput();
    expect(generator.next().value).toEqual(
      takeLatest(downloadStudentCardRequested.type, downloadStudentCardWorker)
    );
    expect(generator.next().value).toEqual(
      takeLatest(downloadGenerationZipRequested.type, downloadGenerationZipWorker)
    );
    expect(generator.next().done).toBe(true);
  });
});

