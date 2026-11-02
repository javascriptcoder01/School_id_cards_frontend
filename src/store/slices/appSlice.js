import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Desktop (lg+) sidebar: poora / chhota (icons)
  sidebarOpen: true,
  // Mobile (lg se chhota): sidebar overlay drawer khula hai ya nahi
  mobileNavOpen: false,
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
    openMobileNav: (state) => {
      state.mobileNavOpen = true;
    },
    closeMobileNav: (state) => {
      state.mobileNavOpen = false;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, openMobileNav, closeMobileNav } = appSlice.actions;

export const selectSidebarOpen = (state) => state.app?.sidebarOpen ?? true;
export const selectMobileNavOpen = (state) => Boolean(state.app?.mobileNavOpen);

export default appSlice.reducer;
