import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  createGeneration,
  createBulkGeneration,
  getGenerations,
  getGenerationById,
  processGeneration,
  getGenerationResults,
} from '../features/idCardGeneration/idCardGenerationApi.js';

describe('ID CARD GENERATION API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. createGeneration calls POST /id-cards/generate with single payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { generation: { id: 'g1', templateId: 't1', studentId: 's1', status: 'PENDING' } },
    });

    const payload = { templateId: 't1', studentId: 's1' };
    await createGeneration(payload);
    expect(postSpy).toHaveBeenCalledWith('/id-cards/generate', payload);
  });

  it('2. createBulkGeneration calls POST /id-cards/generate/bulk with bulk payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { generation: { id: 'g2', templateId: 't1', studentIds: ['s1', 's2'], status: 'PENDING' } },
    });

    const payload = { templateId: 't1', studentIds: ['s1', 's2'] };
    await createBulkGeneration(payload);
    expect(postSpy).toHaveBeenCalledWith('/id-cards/generate/bulk', payload);
  });

  it('3. getGenerations calls GET /id-cards/generations with query params', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { generations: [], pagination: { page: 1, limit: 10, total: 0 } },
    });

    await getGenerations({ page: 2, limit: 20, status: 'PENDING', templateId: 't1' });
    expect(getSpy).toHaveBeenCalledWith('/id-cards/generations', {
      params: {
        page: 2,
        limit: 20,
        status: 'PENDING',
        templateId: 't1',
      },
    });
  });

  it('4. getGenerationById calls GET /id-cards/generations/:id', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { generation: { id: 'g1', status: 'COMPLETED' } },
    });

    await getGenerationById('g1');
    expect(getSpy).toHaveBeenCalledWith('/id-cards/generations/g1');
  });

  it('5. processGeneration calls POST /id-cards/generations/:id/process', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { generation: { id: 'g1', status: 'PROCESSING' } },
    });

    await processGeneration('g1');
    expect(postSpy).toHaveBeenCalledWith('/id-cards/generations/g1/process');
  });

  it('6. getGenerationResults calls GET /id-cards/generations/:id/results', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { generation: { id: 'g1', results: { totalStudents: 10, completedCount: 10 } } },
    });

    await getGenerationResults('g1');
    expect(getSpy).toHaveBeenCalledWith('/id-cards/generations/g1/results');
  });
});

