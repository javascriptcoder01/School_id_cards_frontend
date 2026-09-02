import React, { useState, useEffect } from 'react';
import InlineLoader from '../common/InlineLoader.jsx';
import { Upload, X, User } from 'lucide-react';

export const OperatorStudentForm = ({
  initialValues = null,
  assignedScopes = [],
  onSubmit,
  onCancel,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    className: '',
    section: '',
    rollNumber: '',
    gender: '',
    bloodGroup: '',
    emergencyContact: '',
    photo: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        studentId: initialValues.studentId || '',
        name: initialValues.name || '',
        className: initialValues.className || '',
        section: initialValues.section || '',
        rollNumber: initialValues.rollNumber || '',
        gender: initialValues.gender || '',
        bloodGroup: initialValues.bloodGroup || '',
        emergencyContact: initialValues.emergencyContact || '',
        photo: initialValues.photo || '',
      });
    } else if (assignedScopes.length === 1) {
      // Auto-populate default assignment if only one exists
      setFormData((prev) => ({
        ...prev,
        className: assignedScopes[0].className || '',
        section: assignedScopes[0].section || '',
      }));
    }
  }, [initialValues, assignedScopes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'File must be an image (PNG, JPG, WebP)' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Photo must be under 2MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result }));
      setErrors((prev) => ({ ...prev, photo: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, photo: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.studentId.trim()) errs.studentId = 'Student ID is required';
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    if (!formData.className.trim()) errs.className = 'Class is required';
    if (!formData.section.trim()) errs.section = 'Section is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      studentId: formData.studentId.trim(),
      name: formData.name.trim(),
      className: formData.className.trim(),
      section: formData.section.trim(),
      rollNumber: formData.rollNumber.trim() || undefined,
      gender: formData.gender || undefined,
      bloodGroup: formData.bloodGroup.trim() || undefined,
      emergencyContact: formData.emergencyContact.trim() || undefined,
      photo: formData.photo || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label htmlFor="student-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            id="student-name"
            name="name"
            type="text"
            placeholder="e.g. Aarav Sharma"
            value={formData.name}
            disabled={isSaving}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.name ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
              }`}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Student ID */}
        <div>
          <label htmlFor="student-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Student ID / Roll Code *
          </label>
          <input
            id="student-id"
            name="studentId"
            type="text"
            placeholder="e.g. STU-10A-001"
            value={formData.studentId}
            disabled={Boolean(initialValues) || isSaving}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.studentId ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
              }`}
          />
          {errors.studentId && <p className="text-xs text-red-600 mt-1 font-medium">{errors.studentId}</p>}
        </div>

        {/* Class Selection / Input */}
        <div>
          <label htmlFor="student-class" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Class / Grade *
          </label>
          {assignedScopes && assignedScopes.length > 0 ? (
            <select
              id="student-class"
              name="className"
              value={formData.className}
              disabled={isSaving}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.className ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
            >
              <option value="">-- Select Assigned Class --</option>
              {[...new Set(assignedScopes.map((s) => s.className))].map((cls) => (
                <option key={cls} value={cls}>
                  Class {cls}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="student-class"
              name="className"
              type="text"
              placeholder="e.g. 10"
              value={formData.className}
              disabled={isSaving}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.className ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
            />
          )}
          {errors.className && <p className="text-xs text-red-600 mt-1 font-medium">{errors.className}</p>}
        </div>

        {/* Section Selection / Input */}
        <div>
          <label htmlFor="student-section" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Section *
          </label>
          {assignedScopes && assignedScopes.length > 0 ? (
            <select
              id="student-section"
              name="section"
              value={formData.section}
              disabled={isSaving}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.section ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
            >
              <option value="">-- Select Assigned Section --</option>
              {assignedScopes
                .filter((s) => !formData.className || s.className === formData.className)
                .map((s) => (
                  <option key={`${s.className}-${s.section}`} value={s.section}>
                    Section {s.section} (Class {s.className})
                  </option>
                ))}
            </select>
          ) : (
            <input
              id="student-section"
              name="section"
              type="text"
              placeholder="e.g. A"
              value={formData.section}
              disabled={isSaving}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${errors.section ? 'border-red-400 bg-red-50/50' : 'border-slate-200 bg-white'
                }`}
            />
          )}
          {errors.section && <p className="text-xs text-red-600 mt-1 font-medium">{errors.section}</p>}
        </div>

        {/* Roll Number */}
        <div>
          <label htmlFor="student-roll" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Roll Number
          </label>
          <input
            id="student-roll"
            name="rollNumber"
            type="text"
            placeholder="e.g. 15"
            value={formData.rollNumber}
            disabled={isSaving}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="student-gender" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Gender
          </label>
          <select
            id="student-gender"
            name="gender"
            value={formData.gender}
            disabled={isSaving}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="">-- Select Gender --</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        {/* Blood Group */}
        <div>
          <label htmlFor="student-blood" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Blood Group
          </label>
          <input
            id="student-blood"
            name="bloodGroup"
            type="text"
            placeholder="e.g. O+, A+, B+"
            value={formData.bloodGroup}
            disabled={isSaving}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Emergency Contact */}
        <div>
          <label htmlFor="student-emergency" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Emergency Contact / Guardian Phone
          </label>
          <input
            id="student-emergency"
            name="emergencyContact"
            type="text"
            placeholder="e.g. +91 9876543210"
            value={formData.emergencyContact}
            disabled={isSaving}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Photo Upload Section */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Student ID Card Photo
        </label>
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {formData.photo ? (
              <>
                <img src={formData.photo} alt="Student preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
                  title="Remove Photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <User className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Choose Photo File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isSaving}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400">PNG or JPG up to 2MB. Square headshot recommended.</p>
            {errors.photo && <p className="text-xs text-red-600 font-medium">{errors.photo}</p>}
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isSaving && <InlineLoader />}
          <span>{initialValues ? 'Update Student Record' : 'Save Student Record'}</span>
        </button>
      </div>
    </form>
  );
};

export default OperatorStudentForm;

