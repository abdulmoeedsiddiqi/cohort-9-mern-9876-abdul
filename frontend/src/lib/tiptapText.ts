export function extractPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return '';
  }
  const { text, content } = node as { text?: string; content?: unknown[] };
  let result = text ?? '';
  if (Array.isArray(content)) {
    result += content.map(extractPlainText).join(' ');
  }
  return result;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function extractNotePreview(content: unknown): string {
  return typeof content === 'string' ? content : extractPlainText(content).trim();
}
