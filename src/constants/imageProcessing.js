// imageProcessing.js — presets + ranges backend constants/imageProcessing.js ke saath same.
// Processed URL frontend nahi banata; wo preview-render se aata hai.

export const BG_REMOVAL_PRESETS = {
  SIGNATURE_WHITE_PAPER: { label: 'Signature on white paper', removeColor: '#FFFFFF', tolerance: 18, trim: true, inkColor: '#1A237E', inkStrength: 80, contrast: 30, sharpen: 0 },
  BLUE_STAMP: { label: 'Blue stamp', removeColor: '#FFFFFF', tolerance: 22, trim: true, inkColor: '#1E40AF', inkStrength: 60, contrast: 20, sharpen: 0 },
  RED_STAMP: { label: 'Red stamp', removeColor: '#FFFFFF', tolerance: 22, trim: true, inkColor: '#B91C1C', inkStrength: 60, contrast: 20, sharpen: 0 },
  PHONE_PHOTO_OF_PAPER: { label: 'Phone photo of paper', removeColor: '#F2F2F2', tolerance: 35, trim: true, inkColor: null, inkStrength: 0, contrast: 50, sharpen: 60 },
};

export const BG_REMOVAL_DEFAULTS = {
  enabled: false,
  preset: null,
  removeColor: '#FFFFFF',
  tolerance: 15,
  trim: true,
  inkColor: null,
  inkStrength: 0,
  contrast: 0,
  sharpen: 0,
};

export const BG_REMOVAL_INK_SWATCHES = ['#1A237E', '#1E40AF', '#111827', '#B91C1C', '#047857'];

export const BG_REMOVAL_NOT_APPLICABLE_MESSAGE = 'Background removal works only for uploaded images';

// Sirf preset ki values (label nahi), layer par lagane ke liye
export const presetSettings = (key) => {
  const values = { ...BG_REMOVAL_PRESETS[key] };
  delete values.label;
  return values;
};

const CLOUDINARY_UPLOAD_URL = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//;
export const isCloudinaryUploadUrl = (url) => typeof url === 'string' && CLOUDINARY_UPLOAD_URL.test(url);
