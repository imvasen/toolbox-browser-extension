import type { GetViewerMessage, OpenViewerMessage, ViewerDocument } from '@/entrypoints/shared/viewer';

type ViewerMessage = OpenViewerMessage | GetViewerMessage;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: ViewerMessage, sender) => {
    if (message.type === 'open-viewer' && sender.tab?.id !== undefined) {
      const id = crypto.randomUUID();
      await browser.storage.session.set({ [`viewer:${id}`]: message.document });
      const url = message.document.kind === 'json'
        ? browser.runtime.getURL(`/json-viewer.html?id=${id}`)
        : browser.runtime.getURL(`/xml-viewer.html?id=${id}`);
      await browser.tabs.update(sender.tab.id, { url });
    }
    if (message.type === 'get-viewer') return (await browser.storage.session.get(`viewer:${message.id}`))[`viewer:${message.id}`] as ViewerDocument | undefined;
    return undefined;
  });
});
