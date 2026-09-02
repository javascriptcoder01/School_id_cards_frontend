import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../api/apiClient.js';
import {
  fetchOperatorAssignments,
  createOperatorAssignment,
  updateOperatorAssignment,
  deleteOperatorAssignment,
} from '../features/operatorAssignments/operatorAssignmentApi.js';

describe('OPERATOR ASSIGNMENT API SERVICE', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. fetchOperatorAssignments sends GET request to /operator-assignments', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { success: true, data: { assignments: [] } },
    });

    const result = await fetchOperatorAssignments({ page: 1, limit: 20 });
    expect(getSpy).toHaveBeenCalledWith('/operator-assignments', {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual({ assignments: [] });
  });

  it('2. createOperatorAssignment sends POST request to /operator-assignments', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: { success: true, data: { assignment: { id: 'asgn-1' } } },
    });

    const payload = { operatorId: 'op-123', className: '10', section: 'A' };
    const result = await createOperatorAssignment(payload);

    expect(postSpy).toHaveBeenCalledWith('/operator-assignments', payload);
    expect(result).toEqual({ assignment: { id: 'asgn-1' } });
  });

  it('3. updateOperatorAssignment sends PATCH request to /operator-assignments/:assignmentId', async () => {
    const patchSpy = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { success: true, data: { assignment: { id: 'asgn-1', section: 'B' } } },
    });

    const result = await updateOperatorAssignment('asgn-1', { section: 'B' });
    expect(patchSpy).toHaveBeenCalledWith('/operator-assignments/asgn-1', { section: 'B' });
    expect(result).toEqual({ assignment: { id: 'asgn-1', section: 'B' } });
  });

  it('4. deleteOperatorAssignment sends DELETE request to /operator-assignments/:assignmentId', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({
      data: { success: true, data: { assignmentId: 'asgn-1' } },
    });

    const result = await deleteOperatorAssignment('asgn-1');
    expect(deleteSpy).toHaveBeenCalledWith('/operator-assignments/asgn-1');
    expect(result).toEqual({ assignmentId: 'asgn-1' });
  });
});

