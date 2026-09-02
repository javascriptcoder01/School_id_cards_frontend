import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import appReducer from '../store/slices/appSlice.js';
import collegeReducer from '../features/colleges/collegeSlice.js';
import userReducer from '../features/users/userSlice.js';
import studentReducer from '../features/students/studentSlice.js';
import studentImportReducer from '../features/studentImport/studentImportSlice.js';
import templateReducer from '../features/templates/templateSlice.js';
import idCardGenerationReducer from '../features/idCardGeneration/idCardGenerationSlice.js';
import idCardOutputReducer from '../features/idCardOutput/idCardOutputSlice.js';
import idCardVerificationReducer from '../features/idCardVerification/idCardVerificationSlice.js';
import dashboardReducer from '../features/dashboard/dashboardSlice.js';
import notificationReducer from '../features/notifications/notificationSlice.js';
import accountReducer from '../features/account/accountSlice.js';

export const rootReducer = combineReducers({
  auth: authReducer,
  app: appReducer,
  colleges: collegeReducer,
  users: userReducer,
  students: studentReducer,
  studentImport: studentImportReducer,
  templates: templateReducer,
  idCardGeneration: idCardGenerationReducer,
  idCardOutput: idCardOutputReducer,
  idCardVerification: idCardVerificationReducer,
  dashboard: dashboardReducer,
  notifications: notificationReducer,
  account: accountReducer,
});

export default rootReducer;
