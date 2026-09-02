export function extractPlainText(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  if (!content || typeof content !== 'object') {
    return '';
  }
  const node = content as { text?: string; content?: unknown[] };
  let result = node.text ?? '';
  if (Array.isArray(node.content)) {
    result += node.content.map(extractPlainText).join(' ');
  }
  return result;
}
