import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Building, MapPin, Mail, Phone, Image, ArrowLeft, Save } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import ErrorMessage from '../common/ErrorMessage.jsx';

/**
 * Reusable CollegeForm Component
 * Used for both College Creation and Editing
 */
export const CollegeForm = ({
  initialValues = null,
  isEdit = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      country: 'India',
      postalCode: '',
    },
    contact: {
      email: '',
      phone: '',
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        code: initialValues.code || '',
        logo: initialValues.logo || '',
        address: {
          line1: initialValues.address?.line1 || '',
          line2: initialValues.address?.line2 || '',
          city: initialValues.address?.city || '',
          state: initialValues.address?.state || '',
          country: initialValues.address?.country || 'India',
          postalCode: initialValues.address?.postalCode || '',
        },
        contact: {
          email: initialValues.contact?.email || '',
          phone: initialValues.contact?.phone || '',
        },
      });
    }
  }, [initialValues]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
    const key = `${parent}.${field}`;
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'College name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'College name must be at least 2 characters';
    } else if (nameTrimmed.length > 150) {
      newErrors.name = 'College name cannot exceed 150 characters';
    }

    const codeTrimmed = formData.code.trim();
    if (!codeTrimmed) {
      newErrors.code = 'College code is required';
    } else if (codeTrimmed.length < 2) {
      newErrors.code = 'College code must be at least 2 characters';
    } else if (codeTrimmed.length > 30) {
      newErrors.code = 'College code cannot exceed 30 characters';
    }

    if (formData.logo && formData.logo.trim().length > 0) {
      try {
        new URL(formData.logo.trim());
      } catch {
        newErrors.logo = 'Please provide a valid URL for the logo';
      }
    }

    if (formData.contact.email && formData.contact.email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact.email.trim())) {
        newErrors['contact.email'] = 'Please provide a valid contact email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validate()) {
      // Clean payload: omit empty optional fields or send clean nested structure
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        logo: formData.logo.trim() || null,
        address: {
          line1: formData.address.line1.trim() || '',
          line2: formData.address.line2.trim() || '',
          city: formData.address.city.trim() || '',
          state: formData.address.state.trim() || '',
          country: formData.address.country.trim() || 'India',
          postalCode: formData.address.postalCode.trim() || '',
        },
        contact: {
          email: formData.contact.email.trim().toLowerCase() || null,
          phone: formData.contact.phone.trim() || '',
        },
      };

      onSubmit(payload);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(ROUTES.COLLEGES);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-4xl">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Submission Error" />
      )}

      {/* Section 1: Basic Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <School className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Basic Information</h2>
            <p className="text-xs text-slate-500">Official college identification details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="sm:col-span-2">
            <label
              htmlFor="college-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              College Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="college-name"
              type="text"
              value={formData.name}
              disabled={isLoading}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. St. Xavier's College of Engineering"
              className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                }`}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Code Field */}
          <div>
            <label
              htmlFor="college-code"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              College Code <span className="text-rose-500">*</span>
            </label>
            <input
              id="college-code"
              type="text"
              value={formData.code}
              disabled={isLoading}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="e.g. SXCE01"
              className={`w-full px-4 py-2.5 font-mono bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.code ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                }`}
            />
            {errors.code && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.code}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-1">Unique institutional uppercase code</p>
          </div>

          {/* Logo URL Field */}
          <div>
            <label
              htmlFor="college-logo"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Logo URL <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Image className="w-4 h-4" />
              </div>
              <input
                id="college-logo"
                type="url"
                value={formData.logo}
                disabled={isLoading}
                onChange={(e) => handleChange('logo', e.target.value)}
                placeholder="https://example.com/logo.png"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.logo ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.logo && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.logo}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: Contact Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center font-bold">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Contact Information</h2>
            <p className="text-xs text-slate-500">Official administrative contact channels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Contact Email */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Contact Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="contact-email"
                type="email"
                value={formData.contact.email}
                disabled={isLoading}
                onChange={(e) => handleNestedChange('contact', 'email', e.target.value)}
                placeholder="admin@college.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors['contact.email'] ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors['contact.email'] && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors['contact.email']}</p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label
              htmlFor="contact-phone"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Contact Phone
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="contact-phone"
                type="tel"
                value={formData.contact.phone}
                disabled={isLoading}
                onChange={(e) => handleNestedChange('contact', 'phone', e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Address Information */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Campus Address</h2>
            <p className="text-xs text-slate-500">Physical location of the institution</p>
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
              onChange={(e) => handleNestedChange('address', 'line1', e.target.value)}
              placeholder="e.g. 123 University Campus Road"
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
              onChange={(e) => handleNestedChange('address', 'line2', e.target.value)}
              placeholder="e.g. Sector 4, Tech Park"
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
              onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
              placeholder="e.g. New Delhi"
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
              onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
              placeholder="e.g. Delhi"
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
              onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
              placeholder="e.g. 110001"
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
              onChange={(e) => handleNestedChange('address', 'country', e.target.value)}
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
              <span>{isEdit ? 'Save Changes' : 'Create College'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default CollegeForm;

