import { all, fork } from 'redux-saga/effects';
import watchAuth from '../features/auth/authSaga.js';
import watchColleges from '../features/colleges/collegeSaga.js';
import watchUsers from '../features/users/userSaga.js';
import watchStudents from '../features/students/studentSaga.js';
import watchStudentImport from '../features/studentImport/studentImportSaga.js';
import watchTemplates from '../features/templates/templateSaga.js';
import watchIdCardGeneration from '../features/idCardGeneration/idCardGenerationSaga.js';
import watchIdCardOutput from '../features/idCardOutput/idCardOutputSaga.js';
import watchIdCardVerification from '../features/idCardVerification/idCardVerificationSaga.js';
import watchDashboard from '../features/dashboard/dashboardSaga.js';
import watchAccount from '../features/account/accountSaga.js';

export function* rootSaga() {
  yield all([
    fork(watchAuth),
    fork(watchColleges),
    fork(watchUsers),
    fork(watchStudents),
    fork(watchStudentImport),
    fork(watchTemplates),
    fork(watchIdCardGeneration),
    fork(watchIdCardOutput),
    fork(watchIdCardVerification),
    fork(watchDashboard),
    fork(watchAccount),
  ]);
}

export default rootSaga;
