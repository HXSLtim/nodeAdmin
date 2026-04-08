import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUiStore } from '../useUiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    // Reset state before each test
    useUiStore.setState({
      imConversationPanelOpen: true,
      locale: 'zh',
      mobileMenuOpen: false,
      sidebarCollapsed: false,
      theme: 'light',
    });
    vi.clearAllMocks();
  });

  it('should toggle sidebar', () => {
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(false);
  });

  it('should set theme and update localStorage', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem');
    useUiStore.getState().setTheme('dark');
    expect(useUiStore.getState().theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(spy).toHaveBeenCalledWith('theme', 'dark');
  });

  it('should set locale and update document.lang', () => {
    useUiStore.getState().setLocale('en');
    expect(useUiStore.getState().locale).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('should toggle IM conversation panel', () => {
    expect(useUiStore.getState().imConversationPanelOpen).toBe(true);
    useUiStore.getState().toggleImConversationPanel();
    expect(useUiStore.getState().imConversationPanelOpen).toBe(false);
  });

  it('should set mobile menu state', () => {
    expect(useUiStore.getState().mobileMenuOpen).toBe(false);
    useUiStore.getState().setMobileMenuOpen(true);
    expect(useUiStore.getState().mobileMenuOpen).toBe(true);
  });
});
