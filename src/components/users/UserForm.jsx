import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, Building, Eye, EyeOff, Save } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { ROLES } from '../../constants/roles.js';
import ErrorMessage from '../common/ErrorMessage.jsx';

/**
 * Reusable UserForm Component
 * Used for both User Creation and Editing with role-specific tenant handling
 */
export const UserForm = ({
  initialValues = null,
  isEdit = false,
  isSuperAdmin = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: isSuperAdmin ? ROLES.COLLEGE_ADMIN : ROLES.OPERATOR,
    collegeId: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        email: initialValues.email || '',
        password: '',
        role: initialValues.role || (isSuperAdmin ? ROLES.COLLEGE_ADMIN : ROLES.OPERATOR),
        collegeId: initialValues.collegeId || '',
      });
    }
  }, [initialValues, isSuperAdmin]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) {
      newErrors.name = 'Full name is required';
    } else if (nameTrimmed.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (nameTrimmed.length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!isEdit) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (formData.password.length > 128) {
        newErrors.password = 'Password cannot exceed 128 characters';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Role selection is required';
    }

    if (isSuperAdmin && !formData.collegeId?.trim()) {
      newErrors.collegeId = 'Target College ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (validate()) {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      if (!isEdit) {
        payload.password = formData.password;
        payload.role = isSuperAdmin ? formData.role : ROLES.OPERATOR;
        if (isSuperAdmin && formData.collegeId) {
          payload.collegeId = formData.collegeId.trim();
        }
      } else {
        if (isSuperAdmin) {
          if (formData.role) payload.role = formData.role;
          if (formData.collegeId) payload.collegeId = formData.collegeId.trim();
        }
      }

      onSubmit(payload);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(ROUTES.USERS);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-3xl">
      {errorMessage && (
        <ErrorMessage message={errorMessage} title="Submission Error" />
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isEdit ? 'Edit User Profile' : 'Account Details'}
            </h2>
            <p className="text-xs text-slate-500">
              {isEdit
                ? 'Update information for this account'
                : 'Enter user information and system permissions'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label
              htmlFor="user-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="user-name"
                type="text"
                value={formData.name}
                disabled={isLoading}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Jane Doe"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="sm:col-span-2">
            <label
              htmlFor="user-email"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="user-email"
                type="email"
                value={formData.email}
                disabled={isLoading}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jane.doe@college.edu"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.email ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                  }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password (Create Mode Only) */}
          {!isEdit && (
            <div className="sm:col-span-2">
              <label
                htmlFor="user-password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  disabled={isLoading}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.password ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.password}</p>
              )}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label
              htmlFor="user-role"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
            >
              Account Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Shield className="w-4 h-4" />
              </div>
              {isSuperAdmin ? (
                <select
                  id="user-role"
                  value={formData.role}
                  disabled={isLoading}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.role ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                    }`}
                >
                  <option value={ROLES.COLLEGE_ADMIN}>College Admin</option>
                  <option value={ROLES.OPERATOR}>Operator</option>
                </select>
              ) : (
                <input
                  id="user-role"
                  type="text"
                  readOnly
                  disabled
                  value="Operator"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600 cursor-not-allowed"
                />
              )}
            </div>
            {errors.role && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.role}</p>
            )}
          </div>

          {/* College ID (SUPER_ADMIN only) */}
          {isSuperAdmin && (
            <div>
              <label
                htmlFor="user-college"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2"
              >
                Target College ID <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <input
                  id="user-college"
                  type="text"
                  value={formData.collegeId}
                  disabled={isLoading}
                  onChange={(e) => handleChange('collegeId', e.target.value)}
                  placeholder="e.g. 60d5ec49f1b2c8b1f8e4e1a1"
                  className={`w-full pl-10 pr-4 py-2.5 font-mono bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${errors.collegeId ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'
                    }`}
                />
              </div>
              {errors.collegeId && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.collegeId}</p>
              )}
            </div>
          )}
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
              <span>{isEdit ? 'Save Changes' : 'Create User'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UserForm;

