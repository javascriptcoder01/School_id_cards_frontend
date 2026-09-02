/**
 * ID Card Template Constants
 */

export const TEMPLATE_ORIENTATIONS = {
  PORTRAIT: 'PORTRAIT',
  LANDSCAPE: 'LANDSCAPE',
};

export const TEMPLATE_ORIENTATION_VALUES = Object.values(TEMPLATE_ORIENTATIONS);

export const TEMPLATE_FONT_WEIGHTS = {
  NORMAL: 'NORMAL',
  BOLD: 'BOLD',
};

export const TEMPLATE_FONT_WEIGHT_VALUES = Object.values(TEMPLATE_FONT_WEIGHTS);

export const TEMPLATE_FIELDS = {
  STUDENT_ID: 'studentId',
  NAME: 'name',
  CLASS_NAME: 'className',
  SECTION: 'section',
  ROLL_NUMBER: 'rollNumber',
  DATE_OF_BIRTH: 'dateOfBirth',
  GENDER: 'gender',
  EMAIL: 'email',
  PHONE: 'phone',
  GUARDIAN_NAME: 'guardianName',
  GUARDIAN_PHONE: 'guardianPhone',
  COLLEGE_NAME: 'collegeName',
  COLLEGE_CODE: 'collegeCode',
};

export const TEMPLATE_FIELD_LABELS = {
  studentId: 'Student ID / Reg No',
  name: 'Student Name',
  className: 'Class / Grade',
  section: 'Section',
  rollNumber: 'Roll Number',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  email: 'Email Address',
  phone: 'Phone Number',
  guardianName: 'Guardian Name',
  guardianPhone: 'Guardian Phone',
  collegeName: 'College Name',
  collegeCode: 'College Code',
};

export const TEMPLATE_FIELD_VALUES = Object.values(TEMPLATE_FIELDS);

export const TEMPLATE_DESIGNER_MODES = {
  DESIGN: 'DESIGN',
  PREVIEW: 'PREVIEW',
};

export const DEFAULT_DESIGNER_ZOOM = 1.0;
export const MIN_DESIGNER_ZOOM = 0.5;
export const MAX_DESIGNER_ZOOM = 2.0;
export const ZOOM_STEP = 0.1;

export const PHOTO_BOX_MIN_WIDTH = 10;
export const PHOTO_BOX_MIN_HEIGHT = 10;
export const FIELD_MIN_FONT_SIZE = 6;
export const FIELD_MAX_FONT_SIZE = 72;

export default {
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_ORIENTATION_VALUES,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FONT_WEIGHT_VALUES,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_FIELD_VALUES,
  TEMPLATE_DESIGNER_MODES,
  DEFAULT_DESIGNER_ZOOM,
  MIN_DESIGNER_ZOOM,
  MAX_DESIGNER_ZOOM,
  ZOOM_STEP,
  PHOTO_BOX_MIN_WIDTH,
  PHOTO_BOX_MIN_HEIGHT,
  FIELD_MIN_FONT_SIZE,
  FIELD_MAX_FONT_SIZE,
};
