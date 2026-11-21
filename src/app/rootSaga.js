import { all, fork } from 'redux-saga/effects';
import watchAuth from '../features/auth/authSaga.js';
import watchColleges from '../features/colleges/collegeSaga.js';
import watchUsers from '../features/users/userSaga.js';
import watchStudents from '../features/students/studentSaga.js';
import watchStudentBulkImport from '../features/students/studentBulkImportSaga.js';
import watchStudentImport from '../features/studentImport/studentImportSaga.js';
import watchTemplates from '../features/templates/templateSaga.js';
import watchIdCardGeneration from '../features/idCardGeneration/idCardGenerationSaga.js';
import watchIdCardOutput from '../features/idCardOutput/idCardOutputSaga.js';
import watchIdCardVerification from '../features/idCardVerification/idCardVerificationSaga.js';
import watchDashboard from '../features/dashboard/dashboardSaga.js';
import watchAccount from '../features/account/accountSaga.js';
import watchOperatorAssignments from '../features/operatorAssignments/operatorAssignmentSaga.js';
import watchOperator from '../features/operator/operatorSaga.js';
import watchCollegeProgress from '../features/collegeProgress/collegeProgressSaga.js';
import watchIdCards from '../features/idCards/idCardSaga.js';
import watchPrintRequestWorkflow from '../features/printRequestWorkflow/printRequestWorkflowSaga.js';
import watchCommission from '../features/commission/commissionSaga.js';
import watchThemeArtwork from '../features/themeArtwork/themeArtworkSaga.js';
import watchLetterheads from '../features/letterheads/letterheadSaga.js';
import watchDocuments from '../features/documents/documentSaga.js';
import watchCommissionTemplateRates from '../features/commissionTemplateRates/commissionTemplateRatesSaga.js';
import watchLetterheadCommission from '../features/letterheadCommission/letterheadCommissionSaga.js';
import watchLetterheadOrders from '../features/letterheadOrders/letterheadOrdersSaga.js';
import watchPlatform from '../features/platform/platformSaga.js';
import watchDashboardOverview from '../features/dashboard/dashboardOverviewSaga.js';

export function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchColleges),
    fork(watchUsers),
    fork(watchStudents),
    fork(watchStudentBulkImport),
    fork(watchStudentImport),
    fork(watchTemplates),
    fork(watchIdCardGeneration),
    fork(watchIdCardOutput),
    fork(watchIdCardVerification),
    fork(watchDashboard),
    fork(watchAccount),
    fork(watchOperatorAssignments),
    fork(watchOperator),
    fork(watchCollegeProgress),
    fork(watchIdCards),
    fork(watchPrintRequestWorkflow),
    fork(watchCommission),
    fork(watchThemeArtwork),
    fork(watchDashboardOverview),
    fork(watchLetterheads),
    fork(watchDocuments),
    fork(watchCommissionTemplateRates),
    fork(watchLetterheadCommission),
    fork(watchLetterheadOrders),
    fork(watchPlatform),
  ]);
}

export default rootSaga;
