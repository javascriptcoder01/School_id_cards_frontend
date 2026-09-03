import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactReduxContext } from 'react-redux';
import {
  GraduationCap,
  User,
  BookOpen,
  Mail,
  Phone,
  Calendar,
  Image,
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
  const reduxContext = useContext(ReactReduxContext);
  const currentUser = reduxContext?.store ? selectCurrentUser(reduxContext.store.getState()) : null;
  const isOperator = currentUser?.role === ROLES.OPERATOR;

  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    className: isOperator && currentUser?.className ? currentUser.className : '',
    section: isOperator && (currentUser?.sectionName || currentUser?.section) ? (currentUser?.sectionName || currentUser?.section) : '',
    rollNumber: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    photo: '',
    guardianName: '',
    guardianPhone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      // Format dateOfBirth to YYYY-MM-DD for HTML date input
      let dobString = '';
      if (initialValues.dateOfBirth) {
        try {
          dobString = new Date(initialValues.dateOfBirth).toISOString().split('T')[0];
        } catch {
          dobString = '';
        }
      }

      setFormData({
        studentId: initialValues.studentId || '',
        name: initialValues.name || '',
        className: initialValues.className || '',
        section: initialValues.section || '',
        rollNumber: initialValues.rollNumber || '',
        dateOfBirth: dobString,
        gender: initialValues.gender || '',
        email: initialValues.email || '',
        phone: initialValues.phone || '',
        photo: initialValues.photo || '',
        guardianName: initialValues.guardianName || '',
        guardianPhone: initialValues.guardianPhone || '',
        address: {
          line1: initialValues.address?.line1 || '',
          line2: initialValues.address?.line2 || '',
          city: initialValues.address?.city || '',
          state: initialValues.address?.state || '',
          country: initialValues.address?.country || 'India',
          postalCode: initialValues.address?.postalCode || '',
        },
      });
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};

    const studentIdTrimmed = formData.studentId.trim();
    if (!studentIdTrimmed) {
      newErrors.studentId = 'Student ID is required';
    } else if (studentIdTrimmed.length > 100) {
      newErrors.studentId = 'Student ID cannot exceed 100 characters';
    }

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Student name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Student name must be at least 2 characters long';
    } else if (nameTrimmed.length > 150) {
      newErrors.name = 'Student name cannot exceed 150 characters';
    }

    const classTrimmed = formData.className.trim();
    if (!classTrimmed) {
      newErrors.className = 'Class / Grade name is required';
    } else if (classTrimmed.length > 100) {
      newErrors.className = 'Class name cannot exceed 100 characters';
    }

    if (formData.email && formData.email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Please provide a valid email address';
      }
    }

    if (formData.photo && formData.photo.trim().length > 0) {
      try {
        new URL(formData.photo.trim());
      } catch {
        newErrors.photo = 'Please provide a valid photo URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validate()) {
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
        photo: formData.photo.trim() || null,
        guardianName: formData.guardianName.trim() || null,
        guardianPhone: formData.guardianPhone.trim() || null,
        address: {
          line1: formData.address.line1.trim() || '',
          line2: formData.address.line2.trim() || '',
          city: formData.address.city.trim() || '',
          state: formData.address.state.trim() || '',
          country: formData.address.country.trim() || 'India',
          postalCode: formData.address.postalCode.trim() || '',
        },
      };

      onSubmit(payload);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(ROUTES.STUDENTS);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-4xl">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Submission Error" />
      )}

      {/* Section 1: Academic Identity */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Academic Identity</h2>
            <p className="text-xs text-slate-500">Official student and classroom identifiers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Operator Profile Scope Banner */}
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

          {/* Student ID */}
          <div>
            <label
              htmlFor="student-id"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Student ID / Reg No <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                id="student-id"
                type="text"
                value={formData.studentId}
                disabled={isLoading}
                onChange={(e) => handleChange('studentId', e.target.value)}
                placeholder="e.g. STU-2026-001"
                className={`w-full pl-10 pr-4 py-2.5 font-mono bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.studentId ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.studentId && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.studentId}</p>
            )}
          </div>

          {/* Full Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="student-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="student-name"
                type="text"
                value={formData.name}
                disabled={isLoading}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Class Name */}
          <div>
            <label
              htmlFor="student-class"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Class / Course <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <input
                id="student-class"
                type="text"
                value={formData.className}
                disabled={isLoading || isOperator}
                readOnly={isOperator}
                onChange={(e) => handleChange('className', e.target.value)}
                placeholder="e.g. 10th Grade / B.Tech CS"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all ${isOperator
                    ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed font-medium'
                    : 'bg-slate-50 text-slate-800 border-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white'
                  } ${errors.className ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'}`}
              />
            </div>
            {isOperator && (
              <p className="text-[11px] text-slate-400 mt-1">
                Assigned from operator profile
              </p>
            )}
            {errors.className && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.className}</p>
            )}
          </div>

          {/* Section */}
          <div>
            <label
              htmlFor="student-section"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Section
            </label>
            <input
              id="student-section"
              type="text"
              value={formData.section}
              disabled={isLoading || isOperator}
              readOnly={isOperator}
              onChange={(e) => handleChange('section', e.target.value)}
              placeholder="e.g. A"
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all ${isOperator
                  ? 'bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed font-medium'
                  : 'bg-slate-50 text-slate-800 border-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white'
                }`}
            />
            {isOperator && (
              <p className="text-[11px] text-slate-400 mt-1">
                Assigned from operator profile
              </p>
            )}
          </div>

          {/* Roll Number */}
          <div>
            <label
              htmlFor="student-roll"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Roll Number
            </label>
            <input
              id="student-roll"
              type="text"
              value={formData.rollNumber}
              disabled={isLoading}
              onChange={(e) => handleChange('rollNumber', e.target.value)}
              placeholder="e.g. 42"
              className="w-full px-4 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Personal Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Personal & Contact Details</h2>
            <p className="text-xs text-slate-500">Student demographics, contact info, and photo URL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Date of Birth */}
          <div>
            <label
              htmlFor="student-dob"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Date of Birth
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="student-dob"
                type="date"
                value={formData.dateOfBirth}
                disabled={isLoading}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label
              htmlFor="student-gender"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Gender
            </label>
            <select
              id="student-gender"
              value={formData.gender}
              disabled={isLoading}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Photo URL */}
          <div>
            <label
              htmlFor="student-photo"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Photo URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Image className="w-4 h-4" />
              </div>
              <input
                id="student-photo"
                type="url"
                value={formData.photo}
                disabled={isLoading}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.photo ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.photo && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.photo}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="student-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="student-email"
                type="email"
                value={formData.email}
                disabled={isLoading}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="student@example.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label
              htmlFor="student-phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Student Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="student-phone"
                type="tel"
                value={formData.phone}
                disabled={isLoading}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Guardian Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Guardian Details</h2>
            <p className="text-xs text-slate-500">Emergency and parental contact information</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Guardian Name */}
          <div>
            <label
              htmlFor="guardian-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Guardian / Parent Name
            </label>
            <input
              id="guardian-name"
              type="text"
              value={formData.guardianName}
              disabled={isLoading}
              onChange={(e) => handleChange('guardianName', e.target.value)}
              placeholder="e.g. Ramesh Sharma"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Guardian Phone */}
          <div>
            <label
              htmlFor="guardian-phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Guardian Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="guardian-phone"
                type="tel"
                value={formData.guardianPhone}
                disabled={isLoading}
                onChange={(e) => handleChange('guardianPhone', e.target.value)}
                placeholder="+91 9876500000"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Address Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Residential Address</h2>
            <p className="text-xs text-slate-500">Student permanent / correspondence address</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label
              htmlFor="address-line1"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Address Line 1
            </label>
            <input
              id="address-line1"
              type="text"
              value={formData.address.line1}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('line1', e.target.value)}
              placeholder="e.g. House No. 42, Green Avenue"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="address-line2"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Address Line 2
            </label>
            <input
              id="address-line2"
              type="text"
              value={formData.address.line2}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('line2', e.target.value)}
              placeholder="e.g. Near City Center"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="address-city"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              City
            </label>
            <input
              id="address-city"
              type="text"
              value={formData.address.city}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="e.g. Mumbai"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="address-state"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              State / Province
            </label>
            <input
              id="address-state"
              type="text"
              value={formData.address.state}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="e.g. Maharashtra"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="address-postal"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Postal / Zip Code
            </label>
            <input
              id="address-postal"
              type="text"
              value={formData.address.postalCode}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              placeholder="e.g. 400001"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="address-country"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Country
            </label>
            <input
              id="address-country"
              type="text"
              value={formData.address.country}
              disabled={isLoading}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="e.g. India"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
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
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving...</span>
            </>
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

