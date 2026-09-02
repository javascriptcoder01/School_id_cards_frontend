/**
 * Centralized Route Paths Constants
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ACCOUNT: '/account',
  COLLEGES: '/colleges',
  COLLEGES_NEW: '/colleges/new',
  COLLEGE_DETAIL: '/colleges/:collegeId',
  COLLEGE_EDIT: '/colleges/:collegeId/edit',
  USERS: '/users',
  USERS_NEW: '/users/new',
  USER_DETAIL: '/users/:userId',
  USER_EDIT: '/users/:userId/edit',
  STUDENTS: '/students',
  STUDENTS_NEW: '/students/new',
  STUDENT_IMPORT: '/students/import',
  STUDENT_DETAIL: '/students/:studentId',
  STUDENT_EDIT: '/students/:studentId/edit',
  TEMPLATES: '/templates',
  TEMPLATES_NEW: '/templates/new',
  TEMPLATE_DETAIL: '/templates/:templateId',
  TEMPLATE_EDIT: '/templates/:templateId/edit',
  ID_CARD_GENERATIONS: '/id-cards/generations',
  ID_CARD_GENERATION_NEW: '/id-cards/generations/new',
  ID_CARD_GENERATION_DETAIL: '/id-cards/generations/:generationId',
  ID_CARD_OUTPUT: '/id-cards/generations/:generationId/output',
  ID_CARD_VERIFY: '/verify/:token',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*',
};

export const getCollegeDetailRoute = (collegeId) => `/colleges/${collegeId}`;
export const getCollegeEditRoute = (collegeId) => `/colleges/${collegeId}/edit`;

export const getUserDetailRoute = (userId) => `/users/${userId}`;
export const getUserEditRoute = (userId) => `/users/${userId}/edit`;

export const getStudentDetailRoute = (studentId) => `/students/${studentId}`;
export const getStudentEditRoute = (studentId) => `/students/${studentId}/edit`;

export const getTemplateDetailRoute = (templateId) => `/templates/${templateId}`;
export const getTemplateEditRoute = (templateId) => `/templates/${templateId}/edit`;

export const getIdCardGenerationDetailRoute = (generationId) =>
  `/id-cards/generations/${generationId}`;

export const getIdCardOutputRoute = (generationId) =>
  `/id-cards/generations/${generationId}/output`;

export const getVerifyIdCardRoute = (token) => `/verify/${token}`;

export default ROUTES;
