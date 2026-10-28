import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  School,
  MapPin,
  Mail,
  Phone,
  ArrowLeft,
  Edit3,
  Calendar,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
  PenTool,
  Stamp,
  ExternalLink,
  Clock,
  Hash,
} from 'lucide-react';
import {
  fetchCollegeByIdRequested,
  fetchMyCollegeRequested,
  clearSelectedCollege,
} from '../../features/colleges/collegeSlice.js';
import {
  selectSelectedCollege,
  selectCollegeDetailLoading,
  selectCollegeDetailError,
} from '../../features/colleges/collegeSelectors.js';
import { selectCurrentUser, selectUserRole } from '../../features/auth/authSelectors.js';
import { ROUTES, getCollegeEditRoute } from '../../constants/routes.js';
import Loader from '../../components/common/Loader.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const formatDate = (value, withTime = false) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

// collegeLogo naya source hai; purane records mein sirf `logo` string ho sakti hai
const getImage = (image, legacyUrl = null) => {
  if (image?.url) return { url: image.url, publicId: image.publicId || null };
  if (legacyUrl) return { url: legacyUrl, publicId: null };
  return null;
};

const NotProvided = () => <span className="text-slate-400 italic">Not provided</span>;

const DetailRow = ({ label, children, first = false }) => (
  <div
    className={`flex items-start justify-between gap-4 py-2 ${first ? '' : 'border-t border-slate-100'}`}
  >
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className="font-medium text-slate-900 text-right break-words min-w-0">{children}</span>
  </div>
);

/** Logo / Signature / Stamp preview card */
const ImagePreviewCard = ({ title, description, icon: Icon, image }) => {
  const [failed, setFailed] = useState(false);
  const isRemote = image?.url && /^https?:\/\//.test(image.url);

  useEffect(() => setFailed(false), [image?.url]);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 overflow-hidden">
      {/* Checkered background so transparent PNGs are visible */}
      <div
        className="h-36 grid place-items-center p-4 bg-slate-50"
        style={{
          backgroundImage:
            'linear-gradient(45deg,#f1f5f9 25%,transparent 25%),linear-gradient(-45deg,#f1f5f9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f5f9 75%),linear-gradient(-45deg,transparent 75%,#f1f5f9 75%)',
          backgroundSize: '16px 16px',
          backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
        }}
      >
        {image?.url && !failed ? (
          <img
            src={image.url}
            alt={title}
            className="max-h-28 max-w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="text-center text-slate-400">
            <Icon className="w-7 h-7 mx-auto mb-1.5 opacity-50" aria-hidden="true" />
            <span className="text-xs font-medium">
              {failed ? 'Image could not be loaded' : 'Not uploaded'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-slate-500" aria-hidden="true" />
            {title}
          </h3>
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${image?.url ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
          >
            {image?.url ? 'Uploaded' : 'Missing'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{description}</p>
        {image?.publicId && (
          <p className="text-[11px] text-slate-400 mt-2 truncate" title={image.publicId}>
            File: {image.publicId}
          </p>
        )}
        {/* Browsers block opening data: URLs in a new tab, so only link real URLs */}
        {isRemote && (
          <a
            href={image.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open full size
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export const CollegeDetailPage = () => {
  const { collegeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const userRole = useSelector(selectUserRole);
  const college = useSelector(selectSelectedCollege);
  const isLoading = useSelector(selectCollegeDetailLoading);
  const error = useSelector(selectCollegeDetailError);

  const [logoFailed, setLogoFailed] = useState(false);

  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCollegeAdmin = userRole === 'COLLEGE_ADMIN';

  useEffect(() => {
    if (collegeId === 'me' || (isCollegeAdmin && !collegeId)) {
      dispatch(fetchMyCollegeRequested());
    } else if (collegeId) {
      // If COLLEGE_ADMIN tries to view an ID that isn't their own, redirect
      if (isCollegeAdmin && user?.collegeId && user.collegeId !== collegeId) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return undefined;
      }
      dispatch(fetchCollegeByIdRequested(collegeId));
    }

    return () => {
      dispatch(clearSelectedCollege());
    };
  }, [dispatch, collegeId, isCollegeAdmin, user, navigate]);

  const logo = getImage(college?.collegeLogo, college?.logo);

  useEffect(() => setLogoFailed(false), [logo?.url]);

  if (isLoading) {
    return <Loader message="Loading college details..." />;
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-4xl">
        {isSuperAdmin && (
          <Link
            to={ROUTES.COLLEGES}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Colleges</span>
          </Link>
        )}
        <ErrorMessage message={error} title="College Not Found or Inaccessible" />
      </div>
    );
  }

  if (!college) {
    return null;
  }

  const address = college.address || {};
  const contact = college.contact || {};
  const signature = getImage(college.adminSignature, college.principleSign?.url);
  const stamp = getImage(college.collegeStamp);
  const registeredOn = formatDate(college.createdAt);
  const updatedOn = formatDate(college.updatedAt, true);
  const brandingCount = [logo, signature, stamp].filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Top Navigation & Actions Bar */}
      <div className="flex items-center justify-between">
        {isSuperAdmin ? (
          <Link
            to={ROUTES.COLLEGES}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Colleges</span>
          </Link>
        ) : (
          <div />
        )}

        {isSuperAdmin && (
          <Link
            to={getCollegeEditRoute(college._id)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/30 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit College</span>
          </Link>
        )}
      </div>

      {/* Profile Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {logo && !logoFailed ? (
            <img
              src={logo.url}
              alt={`${college.name} logo`}
              className="w-20 h-20 rounded-2xl object-contain bg-slate-50 border border-slate-200 p-2 shrink-0"
              onError={() => setLogoFailed(true)}
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-2xl shrink-0">
              {college.code ? college.code.slice(0, 2) : <School className="w-10 h-10" />}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{college.name}</h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${college.isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
              >
                {college.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-500" />
                    Inactive
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-slate-500 mt-2">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                Code: {college.code}
              </span>
              {registeredOn && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Registered {registeredOn}
                </span>
              )}
              {updatedOn && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Last updated {updatedOn}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Branding & Authority: Logo, Signature, Stamp */}
      <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            ID Card Branding
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {brandingCount} of 3 uploaded
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ImagePreviewCard
            title="College Logo"
            description="Shown on ID cards and in the colleges list."
            icon={ImageIcon}
            image={logo}
          />
          <ImagePreviewCard
            title="Admin Signature"
            description="Printed as the authorising signature on ID cards."
            icon={PenTool}
            image={signature}
          />
          <ImagePreviewCard
            title="College Stamp"
            description="Official seal placed next to the signature."
            icon={Stamp}
            image={stamp}
          />
        </div>

        {isSuperAdmin && brandingCount < 3 && (
          <p className="text-xs text-slate-500">
            Missing items can be added from{' '}
            <Link
              to={getCollegeEditRoute(college._id)}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Edit College
            </Link>
            .
          </p>
        )}
      </section>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-indigo-600" />
            Contact Details
          </h2>

          <div className="text-sm">
            <DetailRow label="Official email" first>
              {contact.email ? (
                <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">
                  {contact.email}
                </a>
              ) : (
                <NotProvided />
              )}
            </DetailRow>

            <DetailRow label="Phone number">
              {contact.phone ? (
                <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">
                  <Phone className="w-3.5 h-3.5 inline mr-1 -mt-0.5" aria-hidden="true" />
                  {contact.phone}
                </a>
              ) : (
                <NotProvided />
              )}
            </DetailRow>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Campus Address
          </h2>

          <div className="text-sm">
            <DetailRow label="Address line 1" first>
              {address.line1 || <NotProvided />}
            </DetailRow>
            <DetailRow label="Address line 2">{address.line2 || <NotProvided />}</DetailRow>
            <DetailRow label="City">{address.city || <NotProvided />}</DetailRow>
            <DetailRow label="State">{address.state || <NotProvided />}</DetailRow>
            <DetailRow label="Postal code">{address.postalCode || <NotProvided />}</DetailRow>
            <DetailRow label="Country">{address.country || <NotProvided />}</DetailRow>
          </div>
        </div>

        {/* Record info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3 md:col-span-2">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
            <Hash className="w-5 h-5 text-slate-500" />
            Record Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 text-sm">
            <div>
              <DetailRow label="College ID" first>
                <span className="font-mono text-xs">{college._id}</span>
              </DetailRow>
              <DetailRow label="College code">
                <span className="font-mono">{college.code}</span>
              </DetailRow>
            </div>
            <div>
              <DetailRow label="Status" first>
                <span className={college.isActive ? 'text-emerald-700' : 'text-rose-700'}>
                  {college.isActive ? 'Active' : 'Inactive'}
                </span>
              </DetailRow>
              <DetailRow label="Registered on">{registeredOn || <NotProvided />}</DetailRow>
              <DetailRow label="Last updated">{updatedOn || <NotProvided />}</DetailRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeDetailPage;