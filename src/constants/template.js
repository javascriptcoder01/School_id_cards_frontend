/**
 * ID Card Template Constants (frontend)
 * Enum values backend ke constants/template.js se EXACT match hone chahiye.
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
  // Purane templates ke liye. Naye templates mein signature imageLayers (SIGNATURE) se lagta hai.
  COLLEGE_ADMIN_SIGNATURE: 'collegeAdminSignature',
  // School details / student extra / card info (back side)
  COLLEGE_EMAIL: 'collegeEmail',
  COLLEGE_PHONE: 'collegePhone',
  COLLEGE_ADDRESS: 'collegeAddress',
  COLLEGE_WEBSITE: 'collegeWebsite',
  EMERGENCY_NUMBER: 'emergencyNumber',
  TOLL_FREE_NUMBER: 'tollFreeNumber',
  RECEPTION_NUMBER: 'receptionNumber',
  PRINCIPAL_NUMBER: 'principalNumber',
  STUDENT_ADDRESS: 'studentAddress',
  BLOOD_GROUP: 'bloodGroup',
  SESSION: 'session',
  VALID_TILL: 'validTill',
  CARD_NUMBER: 'cardNumber',
  CUSTOM_TEXT: 'customText',
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
  collegeAdminSignature: 'Admin Signature (old style)',
  collegeEmail: 'School Email',
  collegePhone: 'School Phone',
  collegeAddress: 'School Address',
  collegeWebsite: 'School Website',
  emergencyNumber: 'Emergency No.',
  tollFreeNumber: 'Toll-free No.',
  receptionNumber: 'Reception / Office No.',
  principalNumber: 'Principal No.',
  studentAddress: 'Student Address',
  bloodGroup: 'Blood Group',
  session: 'Session',
  validTill: 'Valid Till',
  cardNumber: 'Card Number',
  customText: 'Custom Text',
};

// Purane palette fields ke saath label bhi lagta tha; naye fields mein label khaali → backend ka chhota default label
export const TEMPLATE_NEW_FIELDS = [
  'collegeEmail',
  'collegePhone',
  'collegeAddress',
  'collegeWebsite',
  'emergencyNumber',
  'tollFreeNumber',
  'receptionNumber',
  'principalNumber',
  'studentAddress',
  'bloodGroup',
  'session',
  'validTill',
  'cardNumber',
  'customText',
];

// Ek side par ek se zyada baar aa sakte hain
export const TEMPLATE_REPEATABLE_FIELDS = ['customText'];

export const TEMPLATE_FIELD_VALUES = Object.values(TEMPLATE_FIELDS);

// Ye fields palette mein naye add nahi hote (sirf purane templates mein dikhte hain)
export const LEGACY_TEMPLATE_FIELDS = [TEMPLATE_FIELDS.COLLEGE_ADMIN_SIGNATURE];

export const TEMPLATE_PALETTE_FIELD_VALUES = TEMPLATE_FIELD_VALUES.filter(
  (f) => !LEGACY_TEMPLATE_FIELDS.includes(f)
);

export const TEMPLATE_MAX_FIELDS = 30;

/* ---------- Units ---------- */

export const TEMPLATE_UNITS = {
  PX: 'PX',
  MM: 'MM',
};

export const TEMPLATE_UNIT_VALUES = Object.values(TEMPLATE_UNITS);

export const TEMPLATE_UNIT_LABELS = {
  PX: 'px',
  MM: 'mm',
};

// 96 DPI par 1mm = 3.7795px; font: MM templates mein pt, PX templates mein px
export const PX_PER_MM = 96 / 25.4;
export const MM_PER_PT = 25.4 / 72;
export const PX_PER_PT = 96 / 72;

/* ---------- Background (letterhead) ---------- */

export const TEMPLATE_BACKGROUND_FITS = {
  COVER: 'COVER',
  CONTAIN: 'CONTAIN',
  STRETCH: 'STRETCH',
};

export const TEMPLATE_BACKGROUND_FIT_VALUES = Object.values(TEMPLATE_BACKGROUND_FITS);

export const TEMPLATE_BACKGROUND_FIT_LABELS = {
  COVER: 'Cover (fill, crop edges)',
  CONTAIN: 'Contain (show whole image)',
  STRETCH: 'Stretch (fill exactly)',
};

/* ---------- Text ---------- */

export const TEMPLATE_TEXT_ALIGNS = {
  LEFT: 'LEFT',
  CENTER: 'CENTER',
  RIGHT: 'RIGHT',
};

export const TEMPLATE_TEXT_ALIGN_VALUES = Object.values(TEMPLATE_TEXT_ALIGNS);

export const TEMPLATE_FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Verdana',
  'Tahoma',
  'Times New Roman',
  'Georgia',
  'Courier New',
];

export const FIELD_MIN_FONT_SIZE = 4;
export const FIELD_MAX_FONT_SIZE = 72;
export const FIELD_MAX_LINES = 5;

/* ---------- Photo ---------- */

export const TEMPLATE_PHOTO_SHAPES = {
  RECTANGLE: 'RECTANGLE',
  ROUNDED: 'ROUNDED',
  CIRCLE: 'CIRCLE',
};

export const TEMPLATE_PHOTO_SHAPE_VALUES = Object.values(TEMPLATE_PHOTO_SHAPES);

export const TEMPLATE_OBJECT_FITS = {
  COVER: 'COVER',
  CONTAIN: 'CONTAIN',
};

export const TEMPLATE_OBJECT_FIT_VALUES = Object.values(TEMPLATE_OBJECT_FITS);

export const PHOTO_BOX_MIN_WIDTH = 5;
export const PHOTO_BOX_MIN_HEIGHT = 5;
export const PHOTO_MAX_BORDER_WIDTH = 20;

/* ---------- Image layers ---------- */

export const TEMPLATE_IMAGE_LAYER_TYPES = {
  LOGO: 'LOGO',
  SIGNATURE: 'SIGNATURE',
  STAMP: 'STAMP',
  CUSTOM: 'CUSTOM',
};

export const TEMPLATE_IMAGE_LAYER_TYPE_VALUES = Object.values(TEMPLATE_IMAGE_LAYER_TYPES);

// Layer type -> CollegeAsset type (CUSTOM = koi bhi active asset)
export const TEMPLATE_IMAGE_LAYER_ASSET_TYPE = {
  LOGO: 'LOGO',
  SIGNATURE: 'SIGNATURE',
  STAMP: 'STAMP',
  CUSTOM: null,
};

export const TEMPLATE_IMAGE_LAYER_LABELS = {
  LOGO: 'College Logo',
  SIGNATURE: 'Admin Signature',
  STAMP: 'College Stamp',
  CUSTOM: 'Custom Image',
};

// Naya layer add karte waqt default size (MM card ke hisaab se; PX mein convert hota hai)
export const TEMPLATE_IMAGE_LAYER_DEFAULTS = {
  LOGO: { width: 12, height: 12, opacity: 1, rotation: 0, zIndex: 10 },
  SIGNATURE: { width: 22, height: 8, opacity: 1, rotation: 0, zIndex: 11 },
  STAMP: { width: 14, height: 14, opacity: 0.85, rotation: -8, zIndex: 12 },
  CUSTOM: { width: 15, height: 10, opacity: 1, rotation: 0, zIndex: 10 },
};

export const TEMPLATE_MAX_IMAGE_LAYERS = 10;
export const IMAGE_LAYER_MAX_URL_LENGTH = 1000; // backend schema maxlength

// CollegeAsset type jo letterhead ke liye chahiye
export const LETTERHEAD_ASSET_TYPE = 'LETTERHEAD';

/* ---------- Card defaults ---------- */

// Standard CR80 ID card: 85.6 x 54 mm
export const TEMPLATE_DEFAULT_CARD = {
  orientation: TEMPLATE_ORIENTATIONS.LANDSCAPE,
  unit: TEMPLATE_UNITS.MM,
  width: 86,
  height: 54,
};

/* ---------- Designer ---------- */

export const TEMPLATE_DESIGNER_MODES = {
  DESIGN: 'DESIGN',
  PREVIEW: 'PREVIEW',
};

// Selectable element kinds inside the designer
export const DESIGNER_ELEMENT_TYPES = {
  FIELD: 'FIELD',
  PHOTO: 'PHOTO',
  QR: 'QR',
  LAYER: 'LAYER',
};

/* ---------- Sides, themes, QR (backend constants jaise) ---------- */

export const TEMPLATE_SIDES = {
  FRONT: 'FRONT',
  BACK: 'BACK',
};

export const TEMPLATE_BACKGROUND_TYPES = {
  SOLID: 'SOLID',
  GRADIENT: 'GRADIENT',
  IMAGE: 'IMAGE',
};

export const TEMPLATE_BACKGROUND_TYPE_LABELS = {
  SOLID: 'Solid color',
  GRADIENT: 'Gradient',
  IMAGE: 'Letterhead',
};

export const TEMPLATE_QR_CONTENT_TYPES = {
  STUDENT_VERIFICATION: 'STUDENT_VERIFICATION',
  SCHOOL_DETAILS: 'SCHOOL_DETAILS',
  SCHOOL_CONTACT_CARD: 'SCHOOL_CONTACT_CARD',
  CUSTOM_TEXT: 'CUSTOM_TEXT',
};

export const TEMPLATE_QR_CONTENT_TYPE_LABELS = {
  STUDENT_VERIFICATION: 'Student verification',
  SCHOOL_DETAILS: 'School details (text)',
  SCHOOL_CONTACT_CARD: 'School contact card (save contact)',
  CUSTOM_TEXT: 'Custom text',
};

export const TEMPLATE_FONT_STYLES = {
  NORMAL: 'NORMAL',
  ITALIC: 'ITALIC',
};

export const TEMPLATE_TEXT_TRANSFORMS = {
  NONE: 'NONE',
  UPPERCASE: 'UPPERCASE',
};

// Decoration chips ke naam (styles backend /templates/themes se aate hain)
export const CARD_DECORATION_LABELS = {
  NONE: 'None',
  HEADER_BAND: 'Header band',
  CURVE_HEADER: 'Curved header',
  WAVE_HEADER: 'Wave header',
  WAVE_FOOTER: 'Wave footer',
  DIAGONAL_CORNERS: 'Corners',
  CIRCLES: 'Circles',
  STRIPES: 'Stripes',
  DOT_GRID: 'Dot grid',
  TOP_BOTTOM_BANDS: 'Top & bottom bands',
  FULL_GRADIENT: 'Full gradient',
};

// Designer mein badalne wale theme colors (accent ke saath)
export const CARD_THEME_EDITABLE_COLORS = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'accent', label: 'Accent' },
  { key: 'background', label: 'Background' },
  { key: 'text', label: 'Text' },
];

export const DEFAULT_CARD_THEME_KEY = 'CLASSIC_WHITE';

// Card size presets (CR80 = standard ID card)
export const TEMPLATE_SIZE_PRESETS = [
  { key: 'CR80_LANDSCAPE_MM', label: 'CR80 landscape — 86 × 54 mm', unit: 'MM', width: 86, height: 54, orientation: 'LANDSCAPE' },
  { key: 'CR80_PORTRAIT_MM', label: 'CR80 portrait — 54 × 86 mm', unit: 'MM', width: 54, height: 86, orientation: 'PORTRAIT' },
  { key: 'CR80_LANDSCAPE_PX', label: 'CR80 landscape — 1011 × 638 px', unit: 'PX', width: 1011, height: 638, orientation: 'LANDSCAPE' },
  { key: 'CR80_PORTRAIT_PX', label: 'CR80 portrait — 638 × 1011 px', unit: 'PX', width: 638, height: 1011, orientation: 'PORTRAIT' },
];

// QR ke chaaron taraf jagah (naye QR par; MM mein, PX mein convert)
export const DEFAULT_QR_PADDING_MM = 1;

export const DESIGNER_BASE_WIDTH_PX = 420;
export const DEFAULT_DESIGNER_ZOOM = 1.0;
export const MIN_DESIGNER_ZOOM = 0.5;
export const MAX_DESIGNER_ZOOM = 2.0;
export const ZOOM_STEP = 0.1;

export default {
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_ORIENTATION_VALUES,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FONT_WEIGHT_VALUES,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_FIELD_VALUES,
  TEMPLATE_UNITS,
  TEMPLATE_UNIT_VALUES,
  TEMPLATE_BACKGROUND_FITS,
  TEMPLATE_BACKGROUND_FIT_VALUES,
  TEMPLATE_TEXT_ALIGNS,
  TEMPLATE_TEXT_ALIGN_VALUES,
  TEMPLATE_PHOTO_SHAPES,
  TEMPLATE_PHOTO_SHAPE_VALUES,
  TEMPLATE_OBJECT_FITS,
  TEMPLATE_OBJECT_FIT_VALUES,
  TEMPLATE_IMAGE_LAYER_TYPES,
  TEMPLATE_IMAGE_LAYER_TYPE_VALUES,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_DESIGNER_MODES,
  DEFAULT_DESIGNER_ZOOM,
  MIN_DESIGNER_ZOOM,
  MAX_DESIGNER_ZOOM,
  ZOOM_STEP,
};