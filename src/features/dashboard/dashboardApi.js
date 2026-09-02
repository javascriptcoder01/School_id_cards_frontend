import apiClient from '../../api/apiClient.js';

/**
 * Dashboard API Service
 * Interacts with authorized backend endpoints to aggregate display-safe metrics
 */

export const getSuperAdminSummary = async () => {
  const [collegesRes, usersRes, templatesRes] = await Promise.all([
    apiClient.get('/colleges', { params: { limit: 5 } }),
    apiClient.get('/users', { params: { limit: 5 } }),
    apiClient.get('/templates', { params: { limit: 5 } }),
  ]);

  const collegesData = collegesRes?.data?.data || collegesRes?.data || {};
  const usersData = usersRes?.data?.data || usersRes?.data || {};
  const templatesData = templatesRes?.data?.data || templatesRes?.data || {};

  const totalColleges =
    collegesData?.pagination?.total ??
    collegesData?.pagination?.totalItems ??
    (Array.isArray(collegesData?.colleges) ? collegesData.colleges.length : 0);

  const totalUsers =
    usersData?.pagination?.total ??
    usersData?.pagination?.totalItems ??
    (Array.isArray(usersData?.users) ? usersData.users.length : 0);

  const totalTemplates =
    templatesData?.pagination?.total ??
    templatesData?.pagination?.totalItems ??
    (Array.isArray(templatesData?.templates) ? templatesData.templates.length : 0);

  const recentColleges = (collegesData?.colleges || []).map((c) => ({
    id: c.id,
    name: c.name,
    code: c.code,
    status: c.status,
    createdAt: c.createdAt,
  }));

  const recentUsers = (usersData?.users || []).map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));

  return {
    summary: {
      totalColleges,
      totalUsers,
      totalTemplates,
    },
    activity: [
      ...recentColleges.map((c) => ({
        type: 'COLLEGE_CREATED',
        title: `College: ${c.name}`,
        timestamp: c.createdAt,
      })),
      ...recentUsers.map((u) => ({
        type: 'USER_CREATED',
        title: `User: ${u.name} (${u.role})`,
        timestamp: u.createdAt,
      })),
    ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)),
    generationStats: null,
  };
};

export const getCollegeAdminSummary = async () => {
  const [studentsRes, templatesRes, generationsRes, summaryRes] = await Promise.allSettled([
    apiClient.get('/students', { params: { limit: 5 } }),
    apiClient.get('/templates', { params: { limit: 5 } }),
    apiClient.get('/id-cards/generations', { params: { limit: 10 } }),
    apiClient.get('/id-cards/summary'),
  ]);

  const studentsData =
    studentsRes.status === 'fulfilled'
      ? studentsRes.value?.data?.data || studentsRes.value?.data || {}
      : {};
  const templatesData =
    templatesRes.status === 'fulfilled'
      ? templatesRes.value?.data?.data || templatesRes.value?.data || {}
      : {};
  const generationsData =
    generationsRes.status === 'fulfilled'
      ? generationsRes.value?.data?.data || generationsRes.value?.data || {}
      : {};
  const backendSummary =
    summaryRes.status === 'fulfilled'
      ? summaryRes.value?.data?.data?.summary || summaryRes.value?.data?.summary || null
      : null;

  const totalStudents =
    studentsData?.pagination?.total ??
    studentsData?.pagination?.totalItems ??
    (Array.isArray(studentsData?.students) ? studentsData.students.length : 0);

  const totalTemplates =
    templatesData?.pagination?.total ??
    templatesData?.pagination?.totalItems ??
    (Array.isArray(templatesData?.templates) ? templatesData.templates.length : 0);

  const generationsList = generationsData?.generations || [];

  let completedCount = backendSummary?.completed ?? 0;
  let pendingCount = backendSummary?.pending ?? 0;
  let processingCount = backendSummary?.processing ?? 0;
  let failedCount = backendSummary?.failed ?? 0;
  let totalGenerations =
    backendSummary?.totalGenerations ??
    generationsData?.pagination?.total ??
    generationsData?.pagination?.totalItems ??
    (Array.isArray(generationsData?.generations) ? generationsData.generations.length : 0);

  // Fallback calculation from list if dedicated summary endpoint was not available
  if (!backendSummary) {
    completedCount = 0;
    pendingCount = 0;
    processingCount = 0;
    failedCount = 0;

    generationsList.forEach((g) => {
      if (g.status === 'COMPLETED') completedCount++;
      else if (g.status === 'PENDING') pendingCount++;
      else if (g.status === 'PROCESSING') processingCount++;
      else if (g.status === 'FAILED') failedCount++;
    });
  }

  const recentGenerations = generationsList.map((g) => ({
    id: g.id,
    templateName: g.templateName || 'ID Card Template',
    studentCount:
      g.studentCount ??
      (Array.isArray(g.studentIds) ? g.studentIds.length : g.studentId ? 1 : 0),
    status: g.status,
    createdAt: g.createdAt || g.requestedAt,
  }));

  return {
    summary: {
      totalStudents,
      totalTemplates,
      totalGenerations,
      completedGenerations: completedCount,
    },
    activity: recentGenerations.map((g) => ({
      type: 'GENERATION_JOB',
      title: `Generation Job: ${g.templateName} (${g.status})`,
      timestamp: g.createdAt,
    })),
    generationStats: {
      total: totalGenerations,
      completed: completedCount,
      pending: pendingCount,
      processing: processingCount,
      failed: failedCount,
      totalStudentsRequested: backendSummary?.totalStudentsRequested ?? null,
      totalStudentCompleted: backendSummary?.totalStudentCompleted ?? null,
      totalStudentFailed: backendSummary?.totalStudentFailed ?? null,
      recent: recentGenerations,
    },
  };
};

export const getOperatorSummary = async () => {
  return {
    summary: {
      operationalStatus: 'ACTIVE',
      accessLevel: 'READ_ONLY',
    },
    activity: [],
    generationStats: null,
  };
};

export default {
  getSuperAdminSummary,
  getCollegeAdminSummary,
  getOperatorSummary,
};
