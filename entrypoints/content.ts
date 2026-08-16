import { createElement } from 'react';

import ReactDOM from 'react-dom/client';

import { JsonResponseViewer } from '@/entrypoints/json-viewer/response-viewer';
import type { ViewerDocument } from '@/entrypoints/shared/viewer';
import { XmlViewer } from '@/entrypoints/xml-viewer/main';

import '@/styles/globals.css';

function jsonText(): string | undefined {
  const text = document.body?.innerText.trim();
  if (!text || !/^[{[]/.test(text)) return undefined;
  try {
    JSON.parse(text);
    return text;
  } catch {
    return undefined;
  }
}

function xmlText(): string | undefined {
  if (
    !document.contentType.toLowerCase().includes('xml') ||
    document.contentType === 'image/svg+xml'
  )
    return undefined;
  const root =
    document.querySelector('#webkit-xml-viewer-source-xml > *') ??
    document.documentElement;
  return root?.localName === 'parsererror'
    ? undefined
    : new XMLSerializer().serializeToString(root);
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    const json = jsonText();
    const xml = json ? undefined : xmlText();
    if (!json && !xml) return;
    const viewerDocument: ViewerDocument = {
      kind: json ? 'json' : 'xml',
      sourceUrl: location.href,
      text: json ?? xml!,
      title: document.title,
    };
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    ReactDOM.createRoot(root).render(
      viewerDocument.kind === 'json'
        ? createElement(JsonResponseViewer, { document: viewerDocument })
        : createElement(XmlViewer, { viewer: viewerDocument }),
    );
  },
});
