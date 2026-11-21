// platformSlice.js — platform owner: key (sirf is tab ke sessionStorage mein), organisations list, create, status.
import { createSlice } from '@reduxjs/toolkit';

const KEY_STORAGE = 'platformKey';
export const readPlatformKey = () => {
  try {
    return window.sessionStorage.getItem(KEY_STORAGE) || '';
  } catch {
    return '';
  }
};
export const writePlatformKey = (value) => {
  try {
    if (value) window.sessionStorage.setItem(KEY_STORAGE, value);
    else window.sessionStorage.removeItem(KEY_STORAGE);
  } catch {
    // private mode etc. — memory mein hi rahega
  }
};

const initialState = {
  key: '',
  unlocked: false, // key se list mil gayi
  organizations: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  created: null, // { organization, superAdmin, login }
  statusCode: null, // jis org ka status badal raha
};

export const platformSlice = createSlice({
  name: 'platform',
  initialState,
  reducers: {
    // payload: { key }
    unlockPlatformRequested: (state, action) => {
      state.key = action.payload?.key || '';
      state.loading = true;
      state.error = null;
    },
    fetchOrganizationsRequested: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchOrganizationsSucceeded: (state, action) => {
      state.loading = false;
      state.unlocked = true;
      state.organizations = action.payload || [];
    },
    fetchOrganizationsFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Could not load organisations';
      if (action.payload?.lock) {
        state.unlocked = false;
        state.key = '';
      }
    },
    lockPlatform: () => initialState,

    // payload: { body, onSuccess }
    createOrganizationRequested: (state) => {
      state.creating = true;
      state.createError = null;
      state.created = null;
    },
    createOrganizationSucceeded: (state, action) => {
      state.creating = false;
      state.created = action.payload;
    },
    createOrganizationFailed: (state, action) => {
      state.creating = false;
      state.createError = action.payload;
    },
    clearCreatedOrganization: (state) => {
      state.created = null;
      state.createError = null;
    },

    // payload: { code, status }
    setOrganizationStatusRequested: (state, action) => {
      state.statusCode = action.payload?.code || null;
    },
    setOrganizationStatusFinished: (state, action) => {
      state.statusCode = null;
      const org = action.payload?.organization;
      if (org) state.organizations = state.organizations.map((o) => (o.code === org.code ? org : o));
      if (action.payload?.error) state.error = action.payload.error;
    },
  },
});

export const {
  unlockPlatformRequested,
  fetchOrganizationsRequested,
  fetchOrganizationsSucceeded,
  fetchOrganizationsFailed,
  lockPlatform,
  createOrganizationRequested,
  createOrganizationSucceeded,
  createOrganizationFailed,
  clearCreatedOrganization,
  setOrganizationStatusRequested,
  setOrganizationStatusFinished,
} = platformSlice.actions;

export const selectPlatform = (state) => state.platform || initialState;

export default platformSlice.reducer;
