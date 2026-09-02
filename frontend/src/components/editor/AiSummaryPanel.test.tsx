import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiSummaryPanel } from './AiSummaryPanel';

describe('AiSummaryPanel', () => {
  it('renders the summary text with a label', () => {
    render(
      <AiSummaryPanel summary="A concise summary." isRegenerating={false} onRegenerate={jest.fn()} onDismiss={jest.fn()} />,
    );

    expect(screen.getByText('AI Summary')).toBeInTheDocument();
    expect(screen.getByText('A concise summary.')).toBeInTheDocument();
  });

  it('calls onRegenerate when Regenerate is clicked', async () => {
    const onRegenerate = jest.fn();
    const user = userEvent.setup();
    render(<AiSummaryPanel summary="Text" isRegenerating={false} onRegenerate={onRegenerate} onDismiss={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Regenerate' }));

    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when Dismiss is clicked', async () => {
    const onDismiss = jest.fn();
    const user = userEvent.setup();
    render(<AiSummaryPanel summary="Text" isRegenerating={false} onRegenerate={jest.fn()} onDismiss={onDismiss} />);

    await user.click(screen.getByRole('button', { name: 'Dismiss' }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('disables Regenerate and shows a loading label while regenerating', () => {
    render(<AiSummaryPanel summary="Text" isRegenerating onRegenerate={jest.fn()} onDismiss={jest.fn()} />);

    const button = screen.getByRole('button', { name: 'Regenerating…' });
    expect(button).toBeDisabled();
  });
});
