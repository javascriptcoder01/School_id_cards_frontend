import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebarOpen: true,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = Boolean(action.payload);
    },
  },
});

export const { toggleSidebar, setSidebarOpen } = appSlice.actions;

export const selectSidebarOpen = (state) => state.app?.sidebarOpen ?? true;

export default appSlice.reducer;

