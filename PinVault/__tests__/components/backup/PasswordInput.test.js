import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PasswordInput from '../../../components/backup/PasswordInput';

// Mock the theme context
const mockTheme = {
  theme: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#2196F3',
    border: '#E0E0E0',
    error: '#F44336',
    modal: {
      background: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
  },
  isDarkMode: false,
  toggleTheme: jest.fn(),
};

jest.mock('../../../contexts/ThemeContext', () => ({
  useTheme: () => mockTheme,
}));

describe('PasswordInput Component', () => {
  const defaultProps = {
    visible: true,
    action: 'backup-local',
    onSubmit: jest.fn(),
    onCancel: jest.fn(),
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} />
    );

    expect(getByText('Enter Password')).toBeTruthy();
    expect(getByText('Create Local Backup')).toBeTruthy();
    expect(getByPlaceholderText('Enter password')).toBeTruthy();
    expect(getByText('Create Backup')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('should not render when not visible', () => {
    const { queryByText } = render(
      <PasswordInput {...defaultProps} visible={false} />
    );

    expect(queryByText('Enter Password')).toBeNull();
  });

  it('should display correct title for different actions', () => {
    const actions = [
      { action: 'backup-local', expectedTitle: 'Create Local Backup' },
      { action: 'backup-share', expectedTitle: 'Create Shareable Backup' },
      { action: 'restore', expectedTitle: 'Restore from Backup' },
    ];

    actions.forEach(({ action, expectedTitle }) => {
      const { getByText } = render(
        <PasswordInput {...defaultProps} action={action} />
      );
      expect(getByText(expectedTitle)).toBeTruthy();
    });
  });

  it('should display correct button text for different actions', () => {
    const actions = [
      { action: 'backup-local', expectedButton: 'Create Backup' },
      { action: 'backup-share', expectedButton: 'Create Backup' },
      { action: 'restore', expectedButton: 'Restore' },
    ];

    actions.forEach(({ action, expectedButton }) => {
      const { getByText } = render(
        <PasswordInput {...defaultProps} action={action} />
      );
      expect(getByText(expectedButton)).toBeTruthy();
    });
  });

  it('should handle password input changes', () => {
    const { getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    fireEvent.changeText(passwordInput, 'testpassword');

    expect(passwordInput.props.value).toBe('testpassword');
  });

  it('should toggle password visibility', () => {
    const { getByTestId, getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    const toggleButton = getByTestId('password-toggle');

    // Initially should be secure
    expect(passwordInput.props.secureTextEntry).toBe(true);

    // Toggle visibility
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(false);

    // Toggle back
    fireEvent.press(toggleButton);
    expect(passwordInput.props.secureTextEntry).toBe(true);
  });

  it('should call onSubmit with password when submit button is pressed', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <PasswordInput {...defaultProps} onSubmit={onSubmit} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Create Backup');

    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('testpassword');
    });
  });

  it('should call onCancel when cancel button is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <PasswordInput {...defaultProps} onCancel={onCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    const errorMessage = 'Invalid password';
    const { getByText } = render(
      <PasswordInput {...defaultProps} error={errorMessage} />
    );

    expect(getByText(errorMessage)).toBeTruthy();
  });

  it('should clear password when cancel is pressed', () => {
    const { getByPlaceholderText, getByText } = render(
      <PasswordInput {...defaultProps} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    const cancelButton = getByText('Cancel');

    fireEvent.changeText(passwordInput, 'testpassword');
    expect(passwordInput.props.value).toBe('testpassword');

    fireEvent.press(cancelButton);
    expect(passwordInput.props.value).toBe('');
  });

  it('should prevent submission with empty password', () => {
    const onSubmit = jest.fn();
    const { getByText } = render(
      <PasswordInput {...defaultProps} onSubmit={onSubmit} />
    );

    const submitButton = getByText('Create Backup');
    fireEvent.press(submitButton);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should handle submission with trimmed password', async () => {
    const onSubmit = jest.fn();
    const { getByPlaceholderText, getByText } = render(
      <PasswordInput {...defaultProps} onSubmit={onSubmit} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    const submitButton = getByText('Create Backup');

    fireEvent.changeText(passwordInput, '  testpassword  ');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('testpassword');
    });
  });

  it('should reset state when modal closes and reopens', () => {
    const { rerender, getByPlaceholderText } = render(
      <PasswordInput {...defaultProps} visible={true} />
    );

    const passwordInput = getByPlaceholderText('Enter password');
    fireEvent.changeText(passwordInput, 'testpassword');

    // Close modal
    rerender(<PasswordInput {...defaultProps} visible={false} />);
    
    // Reopen modal
    rerender(<PasswordInput {...defaultProps} visible={true} />);

    const newPasswordInput = getByPlaceholderText('Enter password');
    expect(newPasswordInput.props.value).toBe('');
  });

  it('should display correct description for restore action', () => {
    const { getByText } = render(
      <PasswordInput {...defaultProps} action="restore" />
    );

    expect(getByText(/Enter the password that was used to create this backup/)).toBeTruthy();
  });

  it('should display correct description for backup actions', () => {
    const { getByText } = render(
      <PasswordInput {...defaultProps} action="backup-local" />
    );

    expect(getByText(/Choose a strong password to encrypt your backup/)).toBeTruthy();
  });
});