import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsPanel } from '../settingsPanel';

const mockSetTheme = vi.fn();
const mockSetLocale = vi.fn();
const mockToggleSidebar = vi.fn();
const mockToggleImPanel = vi.fn();

vi.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }) => id,
  }),
}));

vi.mock('@/stores/useUiStore', () => ({
  useUiStore: (selector: any) =>
    selector({
      theme: 'light',
      setTheme: mockSetTheme,
      locale: 'en',
      setLocale: mockSetLocale,
      sidebarCollapsed: false,
      toggleSidebar: mockToggleSidebar,
      imConversationPanelOpen: true,
      toggleImConversationPanel: mockToggleImPanel,
    }),
}));

vi.mock('@/stores/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      userId: 'user-123',
      tenantId: 'tenant-456',
      userName: 'Test User',
      userRoles: ['admin', 'editor'],
    }),
}));

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description', () => {
    render(<SettingsPanel />);
    expect(screen.getByText('settings.title')).toBeInTheDocument();
    expect(screen.getByText('settings.desc')).toBeInTheDocument();
  });

  it('handles theme switching', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    await user.click(screen.getByText('settings.themeDark'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');

    await user.click(screen.getByText('settings.themeLight'));
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('handles language switching', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    await user.click(screen.getByText('中文'));
    expect(mockSetLocale).toHaveBeenCalledWith('zh');

    await user.click(screen.getByText('English'));
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('handles display toggles', async () => {
    const user = userEvent.setup();
    render(<SettingsPanel />);

    const sidebarCheckbox = screen.getByLabelText('settings.sidebarCollapsed');
    await user.click(sidebarCheckbox);
    expect(mockToggleSidebar).toHaveBeenCalled();

    const imCheckbox = screen.getByLabelText('settings.imPanel');
    await user.click(imCheckbox);
    expect(mockToggleImPanel).toHaveBeenCalled();
  });

  it('displays session information correctly', () => {
    render(<SettingsPanel />);
    expect(screen.getByText('user-123')).toBeInTheDocument();
    expect(screen.getByText('tenant-456')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('admin, editor')).toBeInTheDocument();
  });
});
