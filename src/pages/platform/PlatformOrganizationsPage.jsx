// PlatformOrganizationsPage.jsx — platform owner (/platform): platform key se unlock → organisations list,
// naya organisation (apna DB + Super Admin) banao, suspend / activate. App login se alag (koi user account nahi).
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Building2, KeyRound, Lock, Plus, Loader2, RefreshCw, CheckCircle2, Copy, Check, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import {
  unlockPlatformRequested,
  fetchOrganizationsRequested,
  lockPlatform,
  createOrganizationRequested,
  clearCreatedOrganization,
  setOrganizationStatusRequested,
  selectPlatform,
  readPlatformKey,
} from '../../features/platform/platformSlice.js';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import { ROUTES } from '../../constants/routes.js';

// Backend jaisa: "Global NK Studio" → "GLOBALNKSTUDIO" (sirf preview; asli code server banata hai)
const keyCodeFromName = (value) => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const inputCls =
  'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-60';
const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-300';

const Field = ({ label, htmlFor, error, hint, children }) => (
  <div className="min-w-0">
    <label htmlFor={htmlFor} className={labelCls}>{label}</label>
    {children}
    {error ? <p className="mt-1 text-xs font-medium text-red-400">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

const emptyForm = { organizationName: '', keyCode: '', contactPhone: '', adminName: '', adminEmail: '', password: '', confirm: '', sendLoginEmail: true };
const EMAIL_REASON = { MAIL_DISABLED: 'email is not set up on the server (SMTP)', NOT_REQUESTED: 'you chose not to send it', QUEUE_FAILED: 'it could not be queued' };

/* ---------- unlock ---------- */
const UnlockCard = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(selectPlatform);
  const [key, setKey] = useState('');
  const [show, setShow] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (key.trim()) dispatch(unlockPlatformRequested({ key: key.trim() }));
      }}
      className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-800/60 p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-white">Platform administration</h1>
          <p className="text-xs text-slate-400">Create and manage organisations. Enter the platform key.</p>
        </div>
      </div>
      {error && <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
      <Field label="Platform key" htmlFor="platform-key" hint="PLATFORM_ADMIN_KEY from the server's .env. Kept only in this browser tab.">
        <div className="relative">
          <input id="platform-key" type={show ? 'text' : 'password'} autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} className={`${inputCls} pr-10`} />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white" aria-label={show ? 'Hide key' : 'Show key'}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <button type="submit" disabled={loading || !key.trim()} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />} Unlock
      </button>
      <p className="mt-4 text-center text-xs text-slate-500">
        Not the platform owner? <Link to={ROUTES.LOGIN} className="font-semibold text-indigo-300 hover:text-indigo-200">Go to login</Link>
      </p>
    </form>
  );
};

/* ---------- create form ---------- */
const CreateOrganizationForm = () => {
  const dispatch = useDispatch();
  const { creating, createError, created } = useSelector(selectPlatform);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const previewCode = keyCodeFromName(form.keyCode || form.organizationName);
  const errors = useMemo(() => {
    const e = {};
    if (form.organizationName.trim().length < 2) e.organizationName = 'Organisation name is required';
    if (previewCode.length < 2) e.keyCode = 'Needs at least 2 letters or digits';
    if (form.adminName.trim().length < 2) e.adminName = 'Name is required';
    if (!EMAIL_RE.test(form.adminEmail.trim())) e.adminEmail = 'Enter a valid email';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match';
    return e;
  }, [form, previewCode]);
  const err = (k) => (touched ? errors[k] : null);

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (Object.keys(errors).length || creating) return;
    dispatch(
      createOrganizationRequested({
        body: {
          organizationName: form.organizationName.trim(),
          ...(form.keyCode.trim() ? { keyCode: form.keyCode.trim() } : {}),
          ...(form.contactPhone.trim() ? { contactPhone: form.contactPhone.trim() } : {}),
          admin: { name: form.adminName.trim(), email: form.adminEmail.trim().toLowerCase(), password: form.password },
          sendLoginEmail: form.sendLoginEmail,
        },
        onSuccess: () => {
          setForm(emptyForm);
          setTouched(false);
        },
      })
    );
  };

  const copyLogin = async () => {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(`Organisation / Key Code: ${created.login.keyCode}\nEmail: ${created.login.email}\nLogin: ${window.location.origin}${ROUTES.LOGIN}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 sm:p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
        <Plus className="h-4 w-4 text-indigo-400" /> New organisation
      </h2>

      {created && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200" role="status">
          <p className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" /> {created.organization?.name} created</p>
          <p className="mt-1 text-xs text-emerald-100/90">
            Super Admin logs in with <span className="font-mono font-bold">{created.login?.keyCode}</span> (or the organisation name) and {created.login?.email}.
          </p>
          <p className="mt-1 text-xs text-emerald-100/90">
            {created.loginEmail?.queued
              ? `Login details were emailed to ${created.login?.email}.`
              : `Login details were not emailed (${EMAIL_REASON[created.loginEmail?.reason] || 'not sent'}). Share the Key Code, email and password yourself.`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={copyLogin} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy login details'}
            </button>
            <button type="button" onClick={() => dispatch(clearCreatedOrganization())} className="rounded-lg bg-slate-700 px-2.5 py-1 text-xs font-bold text-slate-200">Dismiss</button>
          </div>
        </div>
      )}
      {createError && <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{createError}</p>}

      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Organisation name" htmlFor="org-name" error={err('organizationName')}>
            <input id="org-name" value={form.organizationName} onChange={set('organizationName')} maxLength={150} placeholder="e.g. Global NK Studio" className={inputCls} />
          </Field>
          <Field label="Key Code (optional)" htmlFor="org-code" error={err('keyCode')} hint={previewCode ? `Login code: ${previewCode}` : 'Made from the organisation name'}>
            <input id="org-code" value={form.keyCode} onChange={set('keyCode')} maxLength={60} placeholder={previewCode || 'Auto'} className={`${inputCls} font-mono uppercase`} />
          </Field>
          <Field label="Contact phone (optional)" htmlFor="org-phone">
            <input id="org-phone" value={form.contactPhone} onChange={set('contactPhone')} maxLength={30} inputMode="tel" className={inputCls} />
          </Field>
        </div>
        <p className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Super Admin</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="sa-name" error={err('adminName')}>
            <input id="sa-name" value={form.adminName} onChange={set('adminName')} maxLength={100} autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Email" htmlFor="sa-email" error={err('adminEmail')}>
            <input id="sa-email" type="email" value={form.adminEmail} onChange={set('adminEmail')} maxLength={254} autoComplete="off" className={inputCls} />
          </Field>
          <Field label="Password" htmlFor="sa-pass" error={err('password')} hint="At least 8 characters">
            <input id="sa-pass" type="password" value={form.password} onChange={set('password')} maxLength={128} autoComplete="new-password" className={inputCls} />
          </Field>
          <Field label="Confirm password" htmlFor="sa-pass2" error={err('confirm')}>
            <input id="sa-pass2" type="password" value={form.confirm} onChange={set('confirm')} maxLength={128} autoComplete="new-password" className={inputCls} />
          </Field>
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.sendLoginEmail} onChange={(e) => setForm((f) => ({ ...f, sendLoginEmail: e.target.checked }))} className="mt-0.5" />
          <span>Email the login details (organisation / Key Code, email, password) to the Super Admin</span>
        </label>
        <button type="submit" disabled={creating} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg disabled:opacity-60 sm:w-auto">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />} {creating ? 'Creating organisation & database…' : 'Create organisation'}
        </button>
      </form>
    </section>
  );
};

/* ---------- list ---------- */
const OrganizationsList = () => {
  const dispatch = useDispatch();
  const { organizations, loading, statusCode, error } = useSelector(selectPlatform);
  const [confirm, setConfirm] = useState(null); // org
  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-white">
          <Building2 className="h-4 w-4 text-indigo-400" /> Organisations <span className="text-slate-400">({organizations.length})</span>
        </h2>
        <button type="button" onClick={() => dispatch(fetchOrganizationsRequested())} className="rounded-lg p-2 text-slate-300 hover:bg-slate-700" aria-label="Refresh">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {error && <p className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">{error}</p>}
      {!organizations.length ? (
        <p className="py-6 text-center text-sm text-slate-400">{loading ? 'Loading…' : 'No organisations yet.'}</p>
      ) : (
        <ul className="divide-y divide-slate-700/70">
          {organizations.map((o) => {
            const active = o.status === 'ACTIVE';
            return (
              <li key={o.code} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {o.name}
                    {o.isMain && <span className="ml-2 rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-200">MAIN</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="font-mono font-semibold text-slate-300">{o.code}</span>
                    {o.contact?.email ? ` · ${o.contact.email}` : ''} · created {fmt(o.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
                    {active ? 'Active' : 'Suspended'}
                  </span>
                  {!o.isMain && (
                    <button
                      type="button"
                      disabled={statusCode === o.code}
                      onClick={() => setConfirm(o)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-50 ${active ? 'bg-red-500/15 text-red-200 hover:bg-red-500/25' : 'bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'}`}
                    >
                      {statusCode === o.code && <Loader2 className="h-3.5 w-3.5 animate-spin" />} {active ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm ? `${confirm.status === 'ACTIVE' ? 'Suspend' : 'Activate'} ${confirm.name}?` : ''}
        message={confirm?.status === 'ACTIVE' ? 'Nobody in this organisation can log in or use the app until it is activated again. Their data is kept.' : 'Users of this organisation can log in again.'}
        confirmLabel={confirm?.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
        variant={confirm?.status === 'ACTIVE' ? 'danger' : 'primary'}
        isConfirming={Boolean(confirm && statusCode === confirm.code)}
        onConfirm={() => dispatch(setOrganizationStatusRequested({ code: confirm.code, status: confirm.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE', onSuccess: () => setConfirm(null) }))}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
};

export const PlatformOrganizationsPage = () => {
  const dispatch = useDispatch();
  const { unlocked } = useSelector(selectPlatform);

  // Isi tab mein pehle key di thi → seedha unlock
  useEffect(() => {
    const saved = readPlatformKey();
    if (saved && !unlocked) dispatch(unlockPlatformRequested({ key: saved }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 sm:py-12">
      {!unlocked ? (
        <UnlockCard />
      ) : (
        <div className="mx-auto max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg">
                <ShieldAlert className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-white sm:text-xl">Platform administration</h1>
                <p className="text-xs text-slate-400">Each organisation gets its own database and Super Admin.</p>
              </div>
            </div>
            <button type="button" onClick={() => dispatch(lockPlatform())} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 ring-1 ring-slate-700 hover:bg-slate-700">
              <Lock className="h-3.5 w-3.5" /> Lock
            </button>
          </div>
          <CreateOrganizationForm />
          <OrganizationsList />
        </div>
      )}
    </div>
  );
};

export default PlatformOrganizationsPage;
