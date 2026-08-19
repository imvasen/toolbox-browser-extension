import { createElement } from 'react';

import ReactDOM from 'react-dom/client';

import { JsonResponseViewer } from '@/entrypoints/json-viewer/response-viewer';
import type { ViewerDocument } from '@/entrypoints/shared/viewer';
import { XmlResponseViewer } from '@/entrypoints/xml-viewer/response-viewer';
import viewerStyles from '@/styles/globals.css?inline';

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
  cssInjectionMode: 'manual',
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
    const style = document.createElement('style');
    style.textContent = viewerStyles;
    document.head.append(style);
    const root = document.createElement('div');
    document.body.replaceChildren(root);
    ReactDOM.createRoot(root).render(
      viewerDocument.kind === 'json'
        ? createElement(JsonResponseViewer, { document: viewerDocument })
        : createElement(XmlResponseViewer, { viewer: viewerDocument }),
    );
  },
});
