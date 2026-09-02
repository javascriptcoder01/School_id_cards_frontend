import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  updateTemplateStatus,
} from '../features/templates/templateApi.js';

describe('TEMPLATE API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. getTemplates calls GET /templates with sanitized query params', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        templates: [],
        pagination: { page: 1, limit: 10, total: 0 },
      },
    });

    await getTemplates({ page: 2, limit: 20, search: 'Standard', collegeId: 'c123', isActive: true });

    expect(getSpy).toHaveBeenCalledWith('/templates', {
      params: {
        page: 2,
        limit: 20,
        search: 'Standard',
        collegeId: 'c123',
        isActive: true,
      },
    });
  });

  it('2. getTemplateById calls GET /templates/:templateId', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { template: { id: 't1', name: 'Standard ID' } },
    });

    await getTemplateById('t1');
    expect(getSpy).toHaveBeenCalledWith('/templates/t1');
  });

  it('3. createTemplate calls POST /templates with template payload', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { template: { id: 't1', name: 'New Template' } },
    });

    const payload = {
      name: 'New Template',
      orientation: 'PORTRAIT',
      width: 86,
      height: 54,
      fields: [{ field: 'name', x: 10, y: 10 }],
    };

    await createTemplate(payload);
    expect(postSpy).toHaveBeenCalledWith('/templates', payload);
  });

  it('4. updateTemplate calls PUT /templates/:templateId with payload', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      data: { template: { id: 't1', name: 'Updated Template' } },
    });

    const payload = { name: 'Updated Template' };
    await updateTemplate('t1', payload);
    expect(putSpy).toHaveBeenCalledWith('/templates/t1', payload);
  });

  it('5. updateTemplateStatus calls PATCH /templates/:templateId/status with { isActive }', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { template: { id: 't1', isActive: false } },
    });

    await updateTemplateStatus('t1', false);
    expect(patchSpy).toHaveBeenCalledWith('/templates/t1/status', { isActive: false });
  });
});

