import { describe, it, expect } from 'vitest';
import { ROUTES } from '../constants/routes.js';
import { ROLES } from '../constants/roles.js';

describe('Route Access & Navigation Rules (Batch 19)', () => {
  it('defines the required standard student routes and ID card generation route', () => {
    expect(ROUTES.STUDENTS).toBe('/students');
    expect(ROUTES.STUDENTS_NEW).toBe('/students/new');
    expect(ROUTES.STUDENT_IMPORT).toBe('/students/import');
    expect(ROUTES.STUDENT_DETAIL).toBe('/students/:studentId');
    expect(ROUTES.STUDENT_EDIT).toBe('/students/:studentId/edit');
    expect(ROUTES.ID_CARD_GENERATE).toBe('/id-cards/generate');
    expect(ROUTES.PRINT_REQUESTS).toBe('/print-requests');
    expect(ROUTES.PRINT_REQUEST_DETAIL).toBe('/print-requests/:requestId');
    expect(ROUTES.ADMIN_PRINT_REQUESTS).toBe('/admin/print-requests');
  });

  it('preserves legacy operator workspace routes for backward compatibility', () => {
    expect(ROUTES.OPERATOR_STUDENTS).toBe('/operator/students');
    expect(ROUTES.OPERATOR_STUDENT_IMPORT).toBe('/operator/students/import');
    expect(ROUTES.OPERATOR_TEMPLATES).toBe('/operator/templates');
    expect(ROUTES.OPERATOR_ID_CARD_PREVIEW).toBe('/operator/id-cards/preview');
    expect(ROUTES.OPERATOR_ID_CARD_GENERATIONS).toBe('/operator/id-cards/generations');
  });

  it('validates role hierarchy and role constants', () => {
    expect(ROLES.SUPER_ADMIN).toBe('SUPER_ADMIN');
    expect(ROLES.COLLEGE_ADMIN).toBe('COLLEGE_ADMIN');
    expect(ROLES.OPERATOR).toBe('OPERATOR');
  });
});
