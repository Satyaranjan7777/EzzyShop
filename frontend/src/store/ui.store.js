import { create } from "zustand";

export const useUIStore = create((set) => ({
  isMobileMenuOpen: false,
  isAdminSidebarOpen: false,

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  openAdminSidebar: () => set({ isAdminSidebarOpen: true }),
  closeAdminSidebar: () => set({ isAdminSidebarOpen: false }),
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),
}));
