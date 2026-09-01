import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ThemeProvider } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

describe('ThemeToggle', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('starts unchecked (light theme) by default', () => {
    renderWithProvider();
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles to dark theme when clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    await user.click(screen.getByRole('switch'));

    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('toggles back to light theme on a second click', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const toggle = screen.getByRole('switch');
    await user.click(toggle);
    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'false');
  });
});
