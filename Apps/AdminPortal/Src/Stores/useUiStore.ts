import { create } from 'zustand';

interface UiState {
  sidebarCollapsed: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  theme: 'dark' | 'light';
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
