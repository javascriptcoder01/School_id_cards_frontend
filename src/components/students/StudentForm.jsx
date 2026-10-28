import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  User,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  Shield,
  Hash,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import { selectCurrentUser } from '../../features/auth/authSelectors.js';
import ErrorMessage from '../common/ErrorMessage.jsx';
import OperatorAssignmentBanner from './OperatorAssignmentBanner.jsx';
import StudentPhotoUpload from './StudentPhotoUpload.jsx';

const inputBase =
  'w-full py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';
const lockedInput = 'w-full py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium cursor-not-allowed';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2';
const errorBorder = (hasError) => (hasError ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200');

const EMPTY_ADDRESS = { line1: '', line2: '', city: '', state: '', country: 'India', postalCode: '' };

// studentPhoto ({ url, publicId }) asli source; purane records ke liye `photo` string se fallback
const getInitialPhoto = (values) => {
  if (values?.studentPhoto?.url) {
    return { url: values.studentPhoto.url, publicId: values.studentPhoto.publicId || null };
  }
  if (values?.photo) return { url: values.photo, publicId: null };
  return null;
};

// Photo badli hai ya nahi (edit mein bina badle purani photo dobara na bhejein)
const isSamePhoto = (a, b) => (a?.url || null) === (b?.url || null);

const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
};

const getOperatorScope = (user) => ({
  className: user?.className || '',
  section: user?.sectionName || user?.section || '',
});

const buildInitialState = (values, isOperator, currentUser) => {
  const scope = isOperator ? getOperatorScope(currentUser) : { className: '', section: '' };
  return {
    studentId: values?.studentId || '',
    name: values?.name || '',
    className: values?.className || scope.className,
    section: values?.section || scope.section,
    rollNumber: values?.rollNumber || '',
    dateOfBirth: toDateInput(values?.dateOfBirth),
    gender: values?.gender || '',
    email: values?.email || '',
    phone: values?.phone || '',
    studentPhoto: getInitialPhoto(values),
    guardianName: values?.guardianName || '',
    guardianPhone: values?.guardianPhone || '',
    address: {
      line1: values?.address?.line1 || '',
      line2: values?.address?.line2 || '',
      city: values?.address?.city || '',
      state: values?.address?.state || '',
      country: values?.address?.country || 'India',
      postalCode: values?.address?.postalCode || '',
    },
  };
};

const SectionHeader = ({ icon: Icon, tone, title, subtitle }) => (
  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tone}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

// NOTE: component ke BAHAR hai, warna har keystroke par input remount hokar focus kho deta
const IconInput = ({ icon: Icon, children }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
      <Icon className="w-4 h-4" />
    </div>
    {children}
  </div>
);

const FieldError = ({ message }) =>
  message ? <p className="text-xs text-rose-500 mt-1.5 font-medium">{message}</p> : null;

/**
 * Reusable StudentForm Component
 * Used for both Student Creation and Editing with full validation
 */
export const StudentForm = ({
  initialValues = null,
  isEdit = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  // useSelector: user baad mein load ho to bhi form update hota hai (store.getState() nahi hota tha)
  const currentUser = useSelector(selectCurrentUser);
  const isOperator = currentUser?.role === ROLES.OPERATOR;

  const [formData, setFormData] = useState(() => buildInitialState(initialValues, isOperator, currentUser));
  const [errors, setErrors] = useState({});
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  // Edit mode: DB mein saved photo (restore + "badli ya nahi" check ke liye)
  const initialPhoto = isEdit ? getInitialPhoto(initialValues) : null;

  useEffect(() => {
    if (initialValues) {
      setFormData(buildInitialState(initialValues, isOperator, currentUser));
    }
    // currentUser jaan-boojh kar nahi — sirf initialValues badalne par reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues]);

  // Naye student par operator ki class/section, user load hote hi bhar do
  useEffect(() => {
    if (!isEdit && isOperator) {
      const scope = getOperatorScope(currentUser);
      setFormData((prev) => ({ ...prev, className: scope.className, section: scope.section }));
    }
  }, [isEdit, isOperator, currentUser]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
  };

  const validate = () => {
    const newErrors = {};

    const studentIdTrimmed = formData.studentId.trim();
    if (!studentIdTrimmed) newErrors.studentId = 'Student ID is required';
    else if (studentIdTrimmed.length > 100) newErrors.studentId = 'Student ID cannot exceed 100 characters';

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) newErrors.name = 'Student name is required';
    else if (nameTrimmed.length < 2) newErrors.name = 'Student name must be at least 2 characters long';
    else if (nameTrimmed.length > 150) newErrors.name = 'Student name cannot exceed 150 characters';

    const classTrimmed = formData.className.trim();
    if (!classTrimmed) {
      newErrors.className = isOperator
        ? 'Your operator profile has no class assigned. Ask the college admin to assign one.'
        : 'Class / Grade name is required';
    } else if (classTrimmed.length > 100) {
      newErrors.className = 'Class name cannot exceed 100 characters';
    }

    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading || isPhotoUploading) return;
    if (!validate()) return;

    const payload = {
      studentId: formData.studentId.trim(),
      name: formData.name.trim(),
      className: formData.className.trim(),
      section: formData.section.trim() || null,
      rollNumber: formData.rollNumber.trim() || null,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
      gender: formData.gender || null,
      email: formData.email.trim().toLowerCase() || null,
      phone: formData.phone.trim() || null,
      guardianName: formData.guardianName.trim() || null,
      guardianPhone: formData.guardianPhone.trim() || null,
      address: {
        line1: formData.address.line1.trim(),
        line2: formData.address.line2.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        country: formData.address.country.trim() || 'India',
        postalCode: formData.address.postalCode.trim(),
      },
    };

    // Photo: { url, publicId } ya null (null = photo hatao). Backend legacy `photo` khud sync karta hai.
    // Edit mein photo nahi badli to field bheji hi nahi jaati — purane records ki `photo`
    // (jo kabhi-kabhi poora URL nahi, sirf path hota hai) validation mein fail na ho.
    const nextPhoto = formData.studentPhoto?.url
      ? { url: formData.studentPhoto.url, publicId: formData.studentPhoto.publicId || null }
      : null;

    if (isEdit) {
      if (!isSamePhoto(nextPhoto, initialPhoto)) payload.studentPhoto = nextPhoto;
    } else if (nextPhoto) {
      payload.studentPhoto = nextPhoto;
    }

    onSubmit(payload);
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate(ROUTES.STUDENTS));

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-4xl">
      {errorMessage && <ErrorMessage message={errorMessage} title="Couldn't save the student" />}

      {/* Section 1: Academic Identity */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <SectionHeader
          icon={GraduationCap}
          tone="bg-indigo-50 border-indigo-100 text-indigo-600"
          title="Academic Identity"
          subtitle="Official student and classroom identifiers"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {isOperator && (
            <div className="sm:col-span-3">
              <OperatorAssignmentBanner
                subjectName={currentUser?.subjectName}
                className={currentUser?.className}
                sectionName={currentUser?.sectionName || currentUser?.section}
                operatorName={currentUser?.name}
              />
            </div>
          )}

          <div>
            <label htmlFor="student-id" className={labelClass}>
              Student ID / Reg No <span className="text-rose-500">*</span>
            </label>
            <IconInput icon={Hash}>
              <input
                id="student-id"
                type="text"
                maxLength={100}
                value={formData.studentId}
                disabled={isLoading}
                onChange={(e) => handleChange('studentId', e.target.value)}
                placeholder="e.g. STU-2026-001"
                className={`${inputBase} pl-10 pr-4 font-mono ${errorBorder(errors.studentId)}`}
              />
            </IconInput>
            <FieldError message={errors.studentId} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="student-name" className={labelClass}>
              Full Name <span className="text-rose-500">*</span>
            </label>
            <IconInput icon={User}>
              <input
                id="student-name"
                type="text"
                maxLength={150}
                value={formData.name}
                disabled={isLoading}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`${inputBase} pl-10 pr-4 ${errorBorder(errors.name)}`}
              />
            </IconInput>
            <FieldError message={errors.name} />
          </div>

          <div>
            <label htmlFor="student-class" className={labelClass}>
              Class / Course <span className="text-rose-500">*</span>
            </label>
            <IconInput icon={BookOpen}>
              <input
                id="student-class"
                type="text"
                maxLength={100}
                value={formData.className}
                disabled={isLoading || isOperator}
                readOnly={isOperator}
                onChange={(e) => handleChange('className', e.target.value)}
                placeholder="e.g. 10th Grade / B.Tech CS"
                className={isOperator ? `${lockedInput} pl-10 pr-4` : `${inputBase} pl-10 pr-4 ${errorBorder(errors.className)}`}
              />
            </IconInput>
            {isOperator && <p className="text-[11px] text-slate-400 mt-1">Assigned from operator profile</p>}
            <FieldError message={errors.className} />
          </div>

          <div>
            <label htmlFor="student-section" className={labelClass}>Section</label>
            <input
              id="student-section"
              type="text"
              maxLength={50}
              value={formData.section}
              disabled={isLoading || isOperator}
              readOnly={isOperator}
              onChange={(e) => handleChange('section', e.target.value)}
              placeholder="e.g. A"
              className={isOperator ? `${lockedInput} px-4` : `${inputBase} px-4 border-slate-200`}
            />
            {isOperator && <p className="text-[11px] text-slate-400 mt-1">Assigned from operator profile</p>}
          </div>

          <div>
            <label htmlFor="student-roll" className={labelClass}>Roll Number</label>
            <input
              id="student-roll"
              type="text"
              maxLength={50}
              value={formData.rollNumber}
              disabled={isLoading}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              placeholder="e.g. 42"
              className={`${inputBase} px-4 font-mono border-slate-200`}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Photo + Personal */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <SectionHeader
          icon={User}
          tone="bg-purple-50 border-purple-100 text-purple-600"
          title="Photo & Personal Details"
          subtitle="ID card photo, date of birth and contact information"
        />

        <StudentPhotoUpload
          value={formData.studentPhoto}
          onChange={(photo) => handleChange('studentPhoto', photo)}
          onUploadingChange={setIsPhotoUploading}
          disabled={isLoading}
          savedPhoto={initialPhoto}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div>
            <label htmlFor="student-dob" className={labelClass}>Date of Birth</label>
            <IconInput icon={Calendar}>
              <input
                id="student-dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dateOfBirth}
                disabled={isLoading}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className={`${inputBase} pl-10 pr-4 border-slate-200`}
              />
            </IconInput>
          </div>

          <div>
            <label htmlFor="student-gender" className={labelClass}>Gender</label>
            <select
              id="student-gender"
              value={formData.gender}
              disabled={isLoading}
              onChange={(e) => handleChange('gender', e.target.value)}
              className={`${inputBase} px-4 border-slate-200 cursor-pointer`}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="student-phone" className={labelClass}>Student Phone</label>
            <IconInput icon={Phone}>
              <input
                id="student-phone"
                type="tel"
                maxLength={30}
                value={formData.phone}
                disabled={isLoading}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 9876543210"
                className={`${inputBase} pl-10 pr-4 border-slate-200`}
              />
            </IconInput>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="student-email" className={labelClass}>Email Address</label>
            <IconInput icon={Mail}>
              <input
                id="student-email"
                type="email"
                value={formData.email}
                disabled={isLoading}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@example.edu"
                className={`${inputBase} pl-10 pr-4 ${errorBorder(errors.email)}`}
              />
            </IconInput>
            <FieldError message={errors.email} />
          </div>
        </div>
      </div>

      {/* Section 3: Guardian Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <SectionHeader
          icon={Shield}
          tone="bg-amber-50 border-amber-100 text-amber-600"
          title="Guardian Details"
          subtitle="Emergency and parental contact information"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="guardian-name" className={labelClass}>Guardian / Parent Name</label>
            <input
              id="guardian-name"
              type="text"
              maxLength={150}
              value={formData.guardianName}
              disabled={isLoading}
              onChange={(e) => handleChange('guardianName', e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className={`${inputBase} px-4 border-slate-200`}
            />
          </div>
          <div>
            <label htmlFor="guardian-phone" className={labelClass}>Guardian Phone</label>
            <IconInput icon={Phone}>
              <input
                id="guardian-phone"
                type="tel"
                maxLength={30}
                value={formData.guardianPhone}
                disabled={isLoading}
                onChange={(e) => handleChange('guardianPhone', e.target.value)}
                placeholder="+91 9876500000"
                className={`${inputBase} pl-10 pr-4 border-slate-200`}
              />
            </IconInput>
          </div>
        </div>
      </div>

      {/* Section 4: Address */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <SectionHeader
          icon={MapPin}
          tone="bg-emerald-50 border-emerald-100 text-emerald-600"
          title="Residential Address"
          subtitle="Student permanent / correspondence address"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { key: 'line1', label: 'Address Line 1', placeholder: 'e.g. House No. 42, Green Avenue', span: true, max: 200 },
            { key: 'line2', label: 'Address Line 2', placeholder: 'e.g. Near City Center', span: true, max: 200 },
            { key: 'city', label: 'City', placeholder: 'e.g. Mumbai', max: 100 },
            { key: 'state', label: 'State / Province', placeholder: 'e.g. Maharashtra', max: 100 },
            { key: 'postalCode', label: 'Postal / Zip Code', placeholder: 'e.g. 400001', max: 20 },
            { key: 'country', label: 'Country', placeholder: 'e.g. India', max: 100 },
          ].map(({ key, label, placeholder, span, max }) => (
            <div key={key} className={span ? 'sm:col-span-2' : ''}>
              <label htmlFor={`address-${key}`} className={labelClass}>{label}</label>
              <input
                id={`address-${key}`}
                type="text"
                maxLength={max}
                value={formData.address[key] ?? EMPTY_ADDRESS[key]}
                disabled={isLoading}
                onChange={(e) => handleAddressChange(key, e.target.value)}
                placeholder={placeholder}
                className={`${inputBase} px-4 border-slate-200`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || isPhotoUploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
          ) : isPhotoUploading ? (
            <span>Uploading photo…</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEdit ? 'Save Changes' : 'Create Student'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;