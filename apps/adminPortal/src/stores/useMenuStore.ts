import { create } from 'zustand';
import type { MenuItem } from '@nodeadmin/shared-types';

interface MenuState {
  loaded: boolean;
  menus: MenuItem[];
  setMenus: (menus: MenuItem[]) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  loaded: false,
  menus: [],
  setMenus: (menus) => set({ loaded: true, menus }),
}));
