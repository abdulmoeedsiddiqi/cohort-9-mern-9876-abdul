interface AiSummaryPanelProps {
  summary: string;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onDismiss: () => void;
}

export function AiSummaryPanel({ summary, isRegenerating, onRegenerate, onDismiss }: AiSummaryPanelProps) {
  return (
    <div className="ai-summary-panel">
      <p className="ai-summary-panel-label">
        <span aria-hidden="true">✦</span> AI Summary
      </p>
      <p className="ai-summary-panel-text">{summary}</p>
      <div className="ai-summary-panel-actions">
        <button type="button" onClick={onRegenerate} disabled={isRegenerating}>
          {isRegenerating ? 'Regenerating…' : 'Regenerate'}
        </button>
        <button type="button" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
