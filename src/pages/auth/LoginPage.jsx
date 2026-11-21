import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { loginRequested, clearAuthError } from '../../features/auth/authSlice.js';
import {
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from '../../features/auth/authSelectors.js';
import { ROUTES } from '../../constants/routes.js';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import Loader from '../../components/common/Loader.jsx';

// Is device par aakhri Key Code yaad (private mode / blocked storage mein chupchap skip)
const KEY_CODE_STORAGE = 'lastKeyCode';
const readSavedKeyCode = () => {
  try {
    return window.localStorage.getItem(KEY_CODE_STORAGE) || '';
  } catch {
    return '';
  }
};
const writeSavedKeyCode = (value) => {
  try {
    if (value) window.localStorage.setItem(KEY_CODE_STORAGE, value);
    else window.localStorage.removeItem(KEY_CODE_STORAGE);
  } catch {
    // storage band hai — koi baat nahi
  }
};
// "dps 45" → "DPS45", "Global NK Studio" → "GLOBALNKSTUDIO" (backend bhi yahi karta hai — sirf check ke liye)
const cleanKeyCode = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
// Organisation naam jaisa likha waisa dikhao (sirf aage-peeche ki spaces hatao)
const tidyOrgInput = (value) => String(value || '').replace(/\s+/g, ' ').slice(0, 150);

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [keyCode, setKeyCode] = useState(() => tidyOrgInput(readSavedKeyCode()));
  const [rememberedKeyCode, setRememberedKeyCode] = useState(() => Boolean(readSavedKeyCode()));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clean error on unmount
  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!keyCode.trim()) {
      errors.keyCode = 'Organisation or Key Code is required';
    } else if (cleanKeyCode(keyCode).length < 2) {
      errors.keyCode = 'Enter your organisation name or Key Code (at least 2 letters or digits)';
    }

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoading) return; // Prevent duplicate submit

    if (validateForm()) {
      const typed = keyCode.trim();
      writeSavedKeyCode(typed);
      dispatch(
        loginRequested({
          keyCode: typed,
          email: email.trim().toLowerCase(),
          password,
        })
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Global N K Solutions
          </h1>
          <p className="text-slate-400 text-sm mt-1.5">
            Sign in to access your administrative dashboard
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl border border-slate-700/60 p-6 sm:p-8 shadow-2xl">
          {authError && (
            <div className="mb-6">
              <ErrorMessage
                message={authError}
                onDismiss={() => dispatch(clearAuthError())}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Key Code Field */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="keyCode" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Organisation / Key Code
                </label>
                {rememberedKeyCode && (
                  <button
                    type="button"
                    onClick={() => {
                      writeSavedKeyCode('');
                      setRememberedKeyCode(false);
                      setKeyCode('');
                    }}
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    Not you?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="keyCode"
                  name="keyCode"
                  type="text"
                  autoComplete="organization"
                  autoCapitalize="words"
                  spellCheck={false}
                  inputMode="text"
                  maxLength={150}
                  value={keyCode}
                  disabled={isLoading}
                  onChange={(e) => {
                    setKeyCode(tidyOrgInput(e.target.value));
                    if (validationErrors.keyCode) {
                      setValidationErrors((prev) => ({ ...prev, keyCode: null }));
                    }
                    if (authError) {
                      dispatch(clearAuthError());
                    }
                  }}
                  aria-describedby="keyCode-help"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${validationErrors.keyCode
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  placeholder="e.g. Global NK Studio or DPS45"
                />
              </div>
              {validationErrors.keyCode ? (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{validationErrors.keyCode}</p>
              ) : (
                <p id="keyCode-help" className="mt-1.5 text-xs text-slate-500">
                  Super Admin: your organisation name or Key Code. School users: the school code from your welcome email.
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: null }));
                    }
                    if (authError) {
                      dispatch(clearAuthError());
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${validationErrors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  placeholder="admin@school.edu"
                />
              </div>
              {validationErrors.email && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({ ...prev, password: null }));
                    }
                    if (authError) {
                      dispatch(clearAuthError());
                    }
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-900/60 border rounded-xl text-white placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${validationErrors.password
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  placeholder="••••••••••••"
                />
              </div>
              {validationErrors.password && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-white">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-8">
          School ID Cards Platform &bull; Foundation Baseline
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

