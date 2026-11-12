// themeArtworkSlice.js — Super Admin "Theme Artwork" page: list, detail (svg), upload, edit, delete
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: { items: [], pagination: null, params: null, loading: false, error: null },
  detail: { artwork: null, loading: false, error: null },
  // Upload / edit / delete (modal ke andar error)
  save: { saving: false, error: null, removed: [] },
  deletingId: null,
};

export const themeArtworkSlice = createSlice({
  name: 'themeArtwork',
  initialState,
  reducers: {
    // { params }
    fetchArtworksRequested: (state, action) => {
      state.list.loading = true;
      state.list.error = null;
      state.list.params = action.payload?.params || state.list.params;
    },
    fetchArtworksSucceeded: (state, action) => {
      state.list.loading = false;
      state.list.items = action.payload?.artworks || [];
      state.list.pagination = action.payload?.pagination || null;
    },
    fetchArtworksFailed: (state, action) => {
      state.list.loading = false;
      state.list.error = action.payload || 'Failed to load theme artworks';
    },

    // { artworkId }
    fetchArtworkRequested: (state) => {
      state.detail.loading = true;
      state.detail.error = null;
    },
    fetchArtworkSucceeded: (state, action) => {
      state.detail.loading = false;
      state.detail.artwork = action.payload || null;
    },
    fetchArtworkFailed: (state, action) => {
      state.detail.loading = false;
      state.detail.error = action.payload || 'Failed to load the artwork';
    },
    clearArtworkDetail: (state) => {
      state.detail = initialState.detail;
    },

    // { file, name, category, orientation, onSuccess }
    createArtworkRequested: (state) => {
      state.save = { saving: true, error: null, removed: [] };
    },
    // { artworkId, body, onSuccess }
    updateArtworkRequested: (state) => {
      state.save.saving = true;
      state.save.error = null;
    },
    saveArtworkSucceeded: (state, action) => {
      state.save.saving = false;
      state.save.removed = action.payload?.removed || [];
      if (action.payload?.artwork && state.detail.artwork?.id === action.payload.artwork.id) {
        state.detail.artwork = { ...state.detail.artwork, ...action.payload.artwork };
      }
    },
    saveArtworkFailed: (state, action) => {
      state.save.saving = false;
      state.save.error = action.payload || 'Failed to save the artwork';
    },
    clearArtworkSaveError: (state) => {
      state.save.error = null;
    },

    // { artworkId, onSuccess }
    deleteArtworkRequested: (state, action) => {
      state.deletingId = action.payload?.artworkId || null;
    },
    deleteArtworkSucceeded: (state, action) => {
      state.deletingId = null;
      state.list.items = state.list.items.filter((a) => a.id !== action.payload);
    },
    deleteArtworkFailed: (state) => {
      state.deletingId = null;
    },
  },
});

export const {
  fetchArtworksRequested,
  fetchArtworksSucceeded,
  fetchArtworksFailed,
  fetchArtworkRequested,
  fetchArtworkSucceeded,
  fetchArtworkFailed,
  clearArtworkDetail,
  createArtworkRequested,
  updateArtworkRequested,
  saveArtworkSucceeded,
  saveArtworkFailed,
  clearArtworkSaveError,
  deleteArtworkRequested,
  deleteArtworkSucceeded,
  deleteArtworkFailed,
} = themeArtworkSlice.actions;

export default themeArtworkSlice.reducer;
