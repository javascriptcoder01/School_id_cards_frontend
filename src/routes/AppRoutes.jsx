import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROUTES, getPrintCenterDetailRoute } from '../constants/routes.js';
import { selectUserRole } from '../features/auth/authSelectors.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import RoleRoute from './RoleRoute.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import RouteLoader from '../components/common/RouteLoader.jsx';
import UnauthorizedPage from '../pages/common/UnauthorizedPage.jsx';
import NotFoundPage from '../pages/common/NotFoundPage.jsx';

// Lazy load feature domain pages for optimal code-splitting and bundle performance
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage.jsx'));
const AccountSettingsPage = lazy(() => import('../pages/account/AccountSettingsPage.jsx'));
const CollegeListPage = lazy(() => import('../pages/colleges/CollegeListPage.jsx'));
const CollegeDetailPage = lazy(() => import('../pages/colleges/CollegeDetailPage.jsx'));
const CreateCollegePage = lazy(() => import('../pages/colleges/CreateCollegePage.jsx'));
const EditCollegePage = lazy(() => import('../pages/colleges/EditCollegePage.jsx'));
const UserListPage = lazy(() => import('../pages/users/UserListPage.jsx'));
const UserDetailPage = lazy(() => import('../pages/users/UserDetailPage.jsx'));
const CreateUserPage = lazy(() => import('../pages/users/CreateUserPage.jsx'));
const EditUserPage = lazy(() => import('../pages/users/EditUserPage.jsx'));
const StudentListPage = lazy(() => import('../pages/students/StudentListPage.jsx'));
const StudentBulkImportPage = lazy(() => import('../pages/students/StudentBulkImportPage.jsx'));
const StudentDetailPage = lazy(() => import('../pages/students/StudentDetailPage.jsx'));
const CreateStudentPage = lazy(() => import('../pages/students/CreateStudentPage.jsx'));
const EditStudentPage = lazy(() => import('../pages/students/EditStudentPage.jsx'));
const TemplateListPage = lazy(() => import('../pages/templates/TemplateListPage.jsx'));
const TemplateDetailPage = lazy(() => import('../pages/templates/TemplateDetailPage.jsx'));
const CreateTemplatePage = lazy(() => import('../pages/templates/CreateTemplatePage.jsx'));
const EditTemplatePage = lazy(() => import('../pages/templates/EditTemplatePage.jsx'));
const GenerationListPage = lazy(() => import('../pages/idCardGeneration/GenerationListPage.jsx'));
const GenerationDetailPage = lazy(() => import('../pages/idCardGeneration/GenerationDetailPage.jsx'));
const GenerationOutputPage = lazy(() => import('../pages/idCardOutput/GenerationOutputPage.jsx'));
const PublicVerificationPage = lazy(() => import('../pages/idCardVerification/PublicVerificationPage.jsx'));

// Batch 17 & 18 Lazy Loaded Feature Pages
const OperatorAssignmentsPage = lazy(() => import('../pages/operatorAssignments/OperatorAssignmentsPage.jsx'));
const OperatorStudentListPage = lazy(() => import('../pages/operator/OperatorStudentListPage.jsx'));
const OperatorStudentCreatePage = lazy(() => import('../pages/operator/OperatorStudentCreatePage.jsx'));
const OperatorStudentEditPage = lazy(() => import('../pages/operator/OperatorStudentEditPage.jsx'));
const OperatorStudentBulkImportPage = lazy(() => import('../pages/operator/OperatorStudentBulkImportPage.jsx'));
const OperatorTemplateListPage = lazy(() => import('../pages/operator/OperatorTemplateListPage.jsx'));
const OperatorTemplateDetailPage = lazy(() => import('../pages/operator/OperatorTemplateDetailPage.jsx'));
const OperatorIdCardPreviewPage = lazy(() => import('../pages/operator/OperatorIdCardPreviewPage.jsx'));
const OperatorGenerationListPage = lazy(() => import('../pages/operator/OperatorGenerationListPage.jsx'));
// Print Request workflow (Class Teacher → School Admin → Print Center)
const OperatorPrintRequestsPage = lazy(() => import('../pages/printRequests/OperatorPrintRequestsPage.jsx'));
const AdminPrintRequestsPage = lazy(() => import('../pages/printRequests/AdminPrintRequestsPage.jsx'));
const PrintRequestFormPage = lazy(() => import('../pages/printRequests/PrintRequestFormPage.jsx'));
const PrintRequestDetailPage = lazy(() => import('../pages/printRequests/PrintRequestDetailPage.jsx'));
const PrintCenterPage = lazy(() => import('../pages/printCenter/PrintCenterPage.jsx'));
const GenerateIdCardsPage = lazy(() => import('../pages/idCards/GenerateIdCardsPage.jsx'));

// Helper wrapper to ensure Suspense fallback on all lazy-loaded routes
const withSuspense = (Component) => (
  <Suspense fallback={<RouteLoader />}>
    <Component />
  </Suspense>
);

// Purane generate wizards hat gaye — cards ab Print Requests se:
// Class Teacher → nayi print request, School Admin → ID Cards (preview)
const LegacyGenerateRedirect = () => {
  const role = useSelector(selectUserRole);
  return <Navigate to={role === 'OPERATOR' ? ROUTES.PRINT_REQUEST_NEW : ROUTES.ID_CARDS} replace />;
};

// /print-requests: Class Teacher ko apni requests, School Admin ko approvals
const PrintRequestsByRole = () => {
  const role = useSelector(selectUserRole);
  return withSuspense(role === 'COLLEGE_ADMIN' ? AdminPrintRequestsPage : OperatorPrintRequestsPage);
};

// /print-requests/:id — Super Admin ke purane links Print Center detail par
const PrintRequestDetailByRole = () => {
  const role = useSelector(selectUserRole);
  const { requestId } = useParams();
  if (role === 'SUPER_ADMIN') {
    return <Navigate to={getPrintCenterDetailRoute(requestId)} replace />;
  }
  return withSuspense(PrintRequestDetailPage);
};

// Batches ab Print Requests se: Super Admin → Print Center, School Admin → ID Cards
const LegacyBatchRedirect = () => {
  const role = useSelector(selectUserRole);
  return <Navigate to={role === 'SUPER_ADMIN' ? ROUTES.PRINT_CENTER : ROUTES.ID_CARDS} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LOGIN} element={withSuspense(LoginPage)} />
      <Route path={ROUTES.ID_CARD_VERIFY} element={withSuspense(PublicVerificationPage)} />

      {/* Protected Application Routes wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.HOME} element={withSuspense(DashboardPage)} />
        <Route path={ROUTES.DASHBOARD} element={withSuspense(DashboardPage)} />

        {/* Account Settings Route (All Authenticated Roles) */}
        <Route
          path={ROUTES.ACCOUNT}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(AccountSettingsPage)}
            </RoleRoute>
          }
        />

        {/* College Management Routes */}
        <Route
          path={ROUTES.COLLEGES}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(CollegeListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.COLLEGES_NEW}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              {withSuspense(CreateCollegePage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.COLLEGE_DETAIL}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(CollegeDetailPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.COLLEGE_EDIT}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              {withSuspense(EditCollegePage)}
            </RoleRoute>
          }
        />

        {/* User Management Routes */}
        <Route
          path={ROUTES.USERS}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(UserListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.USERS_NEW}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(CreateUserPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.USER_DETAIL}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(UserDetailPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.USER_EDIT}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(EditUserPage)}
            </RoleRoute>
          }
        />

        {/* Student Management Routes (COLLEGE_ADMIN & OPERATOR) */}
        <Route
          path={ROUTES.STUDENTS}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(StudentListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT_IMPORT}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(StudentBulkImportPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.STUDENTS_NEW}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(CreateStudentPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT_DETAIL}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(StudentDetailPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.STUDENT_EDIT}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(EditStudentPage)}
            </RoleRoute>
          }
        />

        {/* ID Card Template Management Routes */}
        <Route
          path={ROUTES.TEMPLATES}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(TemplateListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.TEMPLATES_NEW}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN']}>
              {withSuspense(CreateTemplatePage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.TEMPLATE_DETAIL}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN']}>
              {withSuspense(TemplateDetailPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.TEMPLATE_EDIT}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN']}>
              {withSuspense(EditTemplatePage)}
            </RoleRoute>
          }
        />

        {/* ID Cards: preview + generate batch + PDF (COLLEGE_ADMIN generate, OPERATOR preview) */}
        <Route
          path={ROUTES.ID_CARDS}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(GenerateIdCardsPage)}
            </RoleRoute>
          }
        />
        {/* Purane batch URLs (direct generate hata) → ID Cards / Print Center */}
        <Route path={ROUTES.ID_CARD_BATCHES} element={<LegacyBatchRedirect />} />
        <Route path={ROUTES.ID_CARD_BATCH_DETAIL} element={<LegacyBatchRedirect />} />

        {/* ID Card Generation Job Management Routes (COLLEGE_ADMIN & OPERATOR) */}
        <Route
          path={ROUTES.ID_CARD_GENERATIONS}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(GenerationListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ID_CARD_GENERATION_NEW}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              <LegacyGenerateRedirect />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ID_CARD_GENERATE}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              <LegacyGenerateRedirect />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ID_CARD_OUTPUT}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(GenerationOutputPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.ID_CARD_GENERATION_DETAIL}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              {withSuspense(GenerationDetailPage)}
            </RoleRoute>
          }
        />

        {/* Operator Assignment Route (COLLEGE_ADMIN only) */}
        <Route
          path={ROUTES.OPERATOR_ASSIGNMENTS}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN']}>
              {withSuspense(OperatorAssignmentsPage)}
            </RoleRoute>
          }
        />

        {/* Operator Workspace Routes (OPERATOR only) */}
        <Route
          path={ROUTES.OPERATOR_STUDENTS}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorStudentListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_STUDENTS_NEW}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorStudentCreatePage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_STUDENT_EDIT}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorStudentEditPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_STUDENT_IMPORT}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorStudentBulkImportPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_TEMPLATES}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorTemplateListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_TEMPLATE_DETAIL}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorTemplateDetailPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_ID_CARD_PREVIEW}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorIdCardPreviewPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_ID_CARD_GENERATIONS}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(OperatorGenerationListPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.OPERATOR_ID_CARD_GENERATE}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              <LegacyGenerateRedirect />
            </RoleRoute>
          }
        />

        {/* Print Center (SUPER_ADMIN) */}
        <Route
          path={ROUTES.PRINT_CENTER}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              {withSuspense(PrintCenterPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PRINT_CENTER_DETAIL}
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN']}>
              {withSuspense(PrintRequestDetailPage)}
            </RoleRoute>
          }
        />
        {/* Purane Print Center URLs (bookmarks) → naya Print Center */}
        <Route path={ROUTES.SUPER_ADMIN_PRINT_CENTER} element={<Navigate to={ROUTES.PRINT_CENTER} replace />} />
        <Route path={ROUTES.SUPER_ADMIN_PRINT_COLLEGE_DETAIL} element={<Navigate to={ROUTES.PRINT_CENTER} replace />} />
        <Route path={ROUTES.ADMIN_PRINT_REQUESTS} element={<Navigate to={ROUTES.PRINT_CENTER} replace />} />

        {/* Print Requests: Class Teacher (apni requests) / School Admin (approvals) */}
        <Route
          path={ROUTES.PRINT_REQUESTS}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR']}>
              <PrintRequestsByRole />
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PRINT_REQUEST_NEW}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(PrintRequestFormPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PRINT_REQUEST_EDIT}
          element={
            <RoleRoute allowedRoles={['OPERATOR']}>
              {withSuspense(PrintRequestFormPage)}
            </RoleRoute>
          }
        />
        <Route
          path={ROUTES.PRINT_REQUEST_DETAIL}
          element={
            <RoleRoute allowedRoles={['COLLEGE_ADMIN', 'OPERATOR', 'SUPER_ADMIN']}>
              <PrintRequestDetailByRole />
            </RoleRoute>
          }
        />
      </Route>

      {/* Common Fallback Routes */}
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
