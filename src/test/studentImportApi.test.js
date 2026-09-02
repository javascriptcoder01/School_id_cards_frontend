import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import { uploadStudents } from '../features/studentImport/studentImportApi.js';

describe('STUDENT IMPORT API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. uploadStudents constructs FormData and sends POST /students/import', async () => {
    const mockFile = new File(['dummy content'], 'students.csv', { type: 'text/csv' });
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        success: true,
        message: 'Student import completed',
        data: { totalRecords: 10, successCount: 9, failedCount: 1, errors: [] },
      },
    });

    const result = await uploadStudents(mockFile);

    expect(postSpy).toHaveBeenCalledTimes(1);
    expect(postSpy).toHaveBeenCalledWith(
      '/students/import',
      expect.any(FormData),
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const callFormData = postSpy.mock.calls[0][1];
    expect(callFormData.get('file')).toBe(mockFile);
    expect(result.data.success).toBe(true);
  });

  it('2. uploadStudents handles API errors gracefully', async () => {
    const mockFile = new File(['dummy content'], 'students.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('Invalid spreadsheet format'));

    await expect(uploadStudents(mockFile)).rejects.toThrow('Invalid spreadsheet format');
  });
});

