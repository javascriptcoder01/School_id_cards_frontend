// letterheadSelectors.js
const S = (state) => state.letterheads || {};

export const selectLetterheadList = (state) => S(state).list || { items: [], pagination: {}, loading: false, error: null };
export const selectLetterheadDetail = (state) => S(state).detail || { data: null, loading: false, error: null };
export const selectLetterheadSaving = (state) => Boolean(S(state).saving);
export const selectLetterheadSaveError = (state) => S(state).saveError || null;
export const selectLetterheadActionId = (state) => S(state).actionId || null;
export const selectLetterheadTemplates = (state) => S(state).templates || { items: [], loading: false };
export const selectLetterheadPreview = (state) => S(state).preview || { url: null, page: 1, loading: false, error: null };
export const selectLetterheadUpload = (state) => S(state).upload || { loadingPage: null, error: null };
export const selectLetterheadCollege = (state) => S(state).college?.data || null;
export const selectLetterheadCollegeOptions = (state) => S(state).collegeOptions || { items: [], loading: false };
export const selectLetterheadSettings = (state) => S(state).settings || { data: null, loading: false, saving: false, error: null };
