import { fireEvent, render, screen } from '@testing-library/react';
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

  it('applies a note-color class to the writing area only, leaving the toolbar neutral', () => {
    const { container } = render(<TiptapEditor content={null} onUpdate={jest.fn()} noteColor="purple" />);

    expect(container.querySelector('.tiptap-content')).toHaveClass('note-editor-surface-purple');
    expect(container.querySelector('.tiptap-editor')?.className).toBe('tiptap-editor');
  });

  it('has no note-color class on the writing area when noteColor is omitted', () => {
    const { container } = render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    expect(container.querySelector('.tiptap-content')).toHaveClass('tiptap-content');
    expect(container.querySelector('.tiptap-content')?.className).toBe('tiptap-content');
  });

  it('applies a text color and can remove it again', async () => {
    const user = userEvent.setup();
    render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    const editor = screen.getByRole('textbox', { name: 'Note content' });
    await user.click(editor);
    await user.type(editor, 'colored text');
    await user.keyboard('{Control>}a{/Control}');

    const colorInput = screen.getByLabelText('Pick text color') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(colorInput.value.toLowerCase()).toBe('#ff0000');

    await user.click(screen.getByLabelText('Remove text color'));

    expect(colorInput.value.toLowerCase()).toBe('#111827');
  });

  it('collapses the text selection after applying a color, so the applied color is visible', async () => {
    const user = userEvent.setup();
    render(<TiptapEditor content={null} onUpdate={jest.fn()} />);

    const editor = screen.getByRole('textbox', { name: 'Note content' });
    await user.click(editor);
    await user.type(editor, 'colored text');
    await user.keyboard('{Control>}a{/Control}');

    const colorInput = screen.getByLabelText('Pick text color') as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    await user.keyboard('!');

    expect(screen.getByText('colored text!')).toBeInTheDocument();
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
