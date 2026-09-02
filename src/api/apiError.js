/**
 * API Error Normalizer
 * Transforms Axios or network errors into a predictable, safe UI-friendly structure.
 * Never leaks raw Axios request/response internals, tokens, or server stack traces.
 */

export const normalizeApiError = (error) => {
  // Generic Fallback default
  const normalized = {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: 'Something went wrong. Please try again.',
    errors: [],
  };

  if (!error) {
    return normalized;
  }

  // Handle Axios HTTP response errors
  if (error.response) {
    normalized.statusCode = error.response.status || 500;
    normalized.code = error.response.data?.code || `HTTP_${normalized.statusCode}`;

    const data = error.response.data;
    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        // Sanitize out any server stack trace or internal DB paths if leaked by backend
        if (data.message.includes('Mongo') || data.message.includes('at Object.') || data.message.includes('/server/')) {
          normalized.message = 'Something went wrong. Please try again.';
        } else {
          normalized.message = data.message;
        }
      }
      if (Array.isArray(data.errors)) {
        normalized.errors = data.errors.filter(
          (e) => typeof e === 'string' || (typeof e === 'object' && e !== null)
        );
      } else if (data.errors && typeof data.errors === 'object') {
        normalized.errors = [data.errors];
      }
    } else if (typeof data === 'string' && data.trim().length > 0) {
      if (data.includes('Mongo') || data.includes('at Object.') || data.includes('/server/')) {
        normalized.message = 'Something went wrong. Please try again.';
      } else {
        normalized.message = data;
      }
    }

    if (normalized.statusCode === 401 && normalized.message === 'Something went wrong. Please try again.') {
      normalized.message = 'Authentication required or session expired.';
    } else if (normalized.statusCode === 403 && normalized.message === 'Something went wrong. Please try again.') {
      normalized.message = 'You do not have permission to access this resource.';
    } else if (normalized.statusCode === 404 && normalized.message === 'Something went wrong. Please try again.') {
      normalized.message = 'Requested resource not found.';
    }

    return normalized;
  }

  // Handle Network Errors / No Response
  if (error.request) {
    normalized.statusCode = 0;
    normalized.code = 'NETWORK_ERROR';
    normalized.message = 'Unable to connect to the server. Please check your internet connection.';
    return normalized;
  }

  // Standard Error object or custom string
  if (typeof error.message === 'string' && error.message.trim().length > 0) {
    if (error.message.includes('Mongo') || error.message.includes('at Object.') || error.message.includes('AxiosError')) {
      normalized.message = 'Something went wrong. Please try again.';
    } else {
      normalized.message = error.message;
    }
  }

  return normalized;
};

/**
 * Strips all internal metadata and returns a strict safe format: { message, code }
 */
export const formatSafeApiError = (error) => {
  const normalized = normalizeApiError(error);
  return {
    message: normalized.message,
    code: normalized.code || `ERR_${normalized.statusCode}`,
  };
};

export default normalizeApiError;
