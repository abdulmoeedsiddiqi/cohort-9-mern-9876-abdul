import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TiptapEditor } from './TiptapEditor';

describe('TiptapEditor', () => {
  it('renders the toolbar and an empty editor with a placeholder', () => {
    render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Note content' })).toBeInTheDocument();
  });

  it('renders existing plain-text content', () => {
    render(<TiptapEditor content="Hello from an existing note" onUpdate={jest.fn()} />);

    expect(screen.getByText('Hello from an existing note')).toBeInTheDocument();
  });

  it('reflects the active state on the toolbar after toggling bold', async () => {
    const user = userEvent.setup();
    render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    const editor = screen.getByRole('textbox', { name: 'Note content' });
    await user.click(editor);
    await user.click(screen.getByLabelText('Bold'));

    expect(screen.getByLabelText('Bold')).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles a heading and reflects the active state on the toolbar', async () => {
    const user = userEvent.setup();
    render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    await user.click(screen.getByLabelText('Heading 1'));

    expect(screen.getByLabelText('Heading 1')).toHaveAttribute('aria-pressed', 'true');
  });

  it('reports the live word count as the user types', async () => {
    const onUpdate = jest.fn();
    const user = userEvent.setup();
    render(<TiptapEditor content={null} onUpdate={onUpdate} />);

    const editor = screen.getByRole('textbox', { name: 'Note content' });
    await user.click(editor);
    await user.type(editor, 'one two three');

    const lastCall = onUpdate.mock.calls.at(-1);
    expect(lastCall?.[1]).toBe(3);
  });
});
