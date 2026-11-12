// themeArtworkSelectors.js
const EMPTY_LIST = [];

export const selectThemeArtworks = (state) => state.themeArtwork?.list?.items || EMPTY_LIST;
export const selectThemeArtworksPagination = (state) => state.themeArtwork?.list?.pagination || null;
export const selectThemeArtworksParams = (state) => state.themeArtwork?.list?.params || null;
export const selectThemeArtworksLoading = (state) => Boolean(state.themeArtwork?.list?.loading);
export const selectThemeArtworksError = (state) => state.themeArtwork?.list?.error || null;

export const selectThemeArtworkDetail = (state) => state.themeArtwork?.detail?.artwork || null;
export const selectThemeArtworkDetailLoading = (state) => Boolean(state.themeArtwork?.detail?.loading);
export const selectThemeArtworkDetailError = (state) => state.themeArtwork?.detail?.error || null;

export const selectThemeArtworkSaving = (state) => Boolean(state.themeArtwork?.save?.saving);
export const selectThemeArtworkSaveError = (state) => state.themeArtwork?.save?.error || null;
export const selectThemeArtworkRemoved = (state) => state.themeArtwork?.save?.removed || EMPTY_LIST;

export const selectThemeArtworkDeletingId = (state) => state.themeArtwork?.deletingId || null;
