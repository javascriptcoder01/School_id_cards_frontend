// platformApi.js — /api/platform (platform owner, header x-platform-key). Apna axios instance: app ke apiClient
// ke interceptors (Bearer token, 401 par logout) yahan NAHI chahiye — galat platform key se logged-in user logout na ho.
import axios from 'axios';
import { getApiBaseUrl } from '../../api/apiClient.js';

const platformClient = axios.create({ baseURL: getApiBaseUrl(), timeout: 60000, headers: { 'Content-Type': 'application/json' } });

// Server ka message (ya network error) — saaf, bina internals
const toError = (error) => {
  const status = error?.response?.status || 0;
  const message = error?.response?.data?.message || (status ? `Request failed (${status})` : 'Cannot reach the server');
  return { statusCode: status, message };
};

const withKey = (key) => ({ headers: { 'x-platform-key': key } });

export const listOrganizationsApi = async (key) => {
  try {
    return (await platformClient.get('/platform/organizations', withKey(key))).data;
  } catch (error) {
    throw toError(error);
  }
};

/** @param {{ organizationName, keyCode?, contactPhone?, admin: { name, email, password } }} body */
export const createOrganizationApi = async (key, body) => {
  try {
    return (await platformClient.post('/platform/organizations', body, withKey(key))).data;
  } catch (error) {
    throw toError(error);
  }
};

export const setOrganizationStatusApi = async (key, code, status) => {
  try {
    return (await platformClient.patch(`/platform/organizations/${encodeURIComponent(code)}/status`, { status }, withKey(key))).data;
  } catch (error) {
    throw toError(error);
  }
};
