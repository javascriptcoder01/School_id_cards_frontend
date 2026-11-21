// documentSelectors.js
const S = (state) => state.documents || {};

export const selectDocumentGenerating = (state) => Boolean(S(state).generating);
export const selectDocumentGenerateError = (state) => S(state).generateError || null;
export const selectLastGeneratedDocument = (state) => S(state).lastGenerated || null;
export const selectDocumentPreview = (state) => S(state).preview || { url: null, refNo: null, pageCount: null, loading: false, error: null };
export const selectDocumentHistory = (state) => S(state).history || { items: [], pagination: {}, loading: false, error: null };
export const selectDocumentDownloadingId = (state) => S(state).downloadingId || null;
