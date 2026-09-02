import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { ThemeProvider } from '../../context/ThemeContext';
import { TopBar } from './TopBar';

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', name: 'Test User', email: 'test@example.com' } }),
}));

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-search">{location.search}</div>;
}

function renderAt(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <TopBar />
        <LocationDisplay />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('TopBar search', () => {
  it('enables the search input on a searchable notes route', () => {
    renderAt('/notes');
    expect(screen.getByLabelText('Search notes')).toBeEnabled();
  });

  it('disables the search input on the trash route', () => {
    renderAt('/notes/trash');
    expect(screen.getByLabelText('Search notes')).toBeDisabled();
  });

  it('sets the q search param after typing, debounced', async () => {
    renderAt('/notes');
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Search notes'), 'grocery');

    await waitFor(() => expect(screen.getByTestId('location-search')).toHaveTextContent('q=grocery'), {
      timeout: 2000,
    });
  }, 5000);

  it('clears the q search param when the input is cleared', async () => {
    renderAt('/notes?q=grocery');
    const user = userEvent.setup();
    expect(screen.getByLabelText('Search notes')).toHaveValue('grocery');

    await user.clear(screen.getByLabelText('Search notes'));

    await waitFor(() => expect(screen.getByTestId('location-search').textContent).toBe(''), { timeout: 2000 });
  }, 5000);
});
