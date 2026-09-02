import { TextDecoder, TextEncoder } from 'util';

import '@testing-library/jest-dom';

Object.assign(global, { TextEncoder, TextDecoder });

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// jsdom doesn't implement layout geometry, which ProseMirror (Tiptap's engine)
// queries on every keystroke to position the cursor/scroll into view.
const emptyClientRect: DOMRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  toJSON: () => ({}),
};
Range.prototype.getBoundingClientRect = () => emptyClientRect;
document.elementFromPoint = () => null;
Range.prototype.getClientRects = () =>
  ({ length: 0, item: () => null, [Symbol.iterator]: Array.prototype[Symbol.iterator] }) as unknown as DOMRectList;
Element.prototype.getBoundingClientRect = () => emptyClientRect;

// jsdom doesn't implement the Blob URL registry the VideoRecorder relies on
// to preview a recorded clip and capture a thumbnail frame.
if (!('createObjectURL' in URL)) {
  Object.assign(URL, {
    createObjectURL: () => 'blob:mock-url',
    revokeObjectURL: () => {},
  });
}

// jsdom's Blob/File don't implement text(), which the Sidebar's import flow
// uses to read an uploaded export file.
if (typeof Blob.prototype.text !== 'function') {
  Blob.prototype.text = function text(this: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  };
}
