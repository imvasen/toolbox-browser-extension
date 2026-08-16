import type {
  GetViewerMessage,
  OpenJqViewerMessage,
  ViewerDocument,
} from '@/entrypoints/shared/viewer';

type ViewerMessage = OpenJqViewerMessage | GetViewerMessage;

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: ViewerMessage) => {
    if (message.type === 'open-jq-viewer') {
      const id = crypto.randomUUID();
      await browser.storage.session.set({ [`viewer:${id}`]: message.document });
      await browser.tabs.create({
        url: browser.runtime.getURL(`/json-viewer.html?id=${id}`),
      });
    }
    if (message.type === 'get-viewer')
      return (await browser.storage.session.get(`viewer:${message.id}`))[
        `viewer:${message.id}`
      ] as ViewerDocument | undefined;
    return undefined;
  });
});
