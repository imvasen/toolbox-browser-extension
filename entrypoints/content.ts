import type { OpenViewerMessage } from '@/entrypoints/shared/viewer';

function jsonText(): string | undefined {
  const text = document.body?.innerText.trim();
  if (!text || !/^[{[]/.test(text)) return undefined;
  try { JSON.parse(text); return text; } catch { return undefined; }
}

function xmlText(): string | undefined {
  if (!document.contentType.toLowerCase().includes('xml') || document.contentType === 'image/svg+xml') return undefined;
  const root = document.querySelector('#webkit-xml-viewer-source-xml > *') ?? document.documentElement;
  return root?.localName === 'parsererror' ? undefined : new XMLSerializer().serializeToString(root);
}

export default defineContentScript({
  matches: ['<all_urls>'], runAt: 'document_idle',
  main() {
    const json = jsonText();
    const xml = json ? undefined : xmlText();
    if (!json && !xml) return;
    const message: OpenViewerMessage = { type: 'open-viewer', document: { kind: json ? 'json' : 'xml', text: json ?? xml!, title: document.title } };
    void browser.runtime.sendMessage(message);
  },
});
