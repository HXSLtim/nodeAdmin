import { create } from 'zustand';

interface UiState {
  setTheme: (theme: 'dark' | 'light') => void;
  theme: 'dark' | 'light';
}

export const useUiStore = create<UiState>((set) => ({
  setTheme: (theme) => set({ theme }),
  theme: 'light',
}));
