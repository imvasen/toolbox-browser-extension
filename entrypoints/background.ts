type XmlViewerMessage = {
  type: 'open-xml-viewer';
  xml: string;
  title: string;
};

type XmlDocumentMessage = {
  type: 'get-xml-document';
  id: string;
};

export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (message: XmlViewerMessage | XmlDocumentMessage, sender) => {
    if (message.type === 'open-xml-viewer' && sender.tab?.id !== undefined) {
      const id = crypto.randomUUID();
      const key = `xml-document:${id}`;
      await browser.storage.session.set({ [key]: { xml: message.xml, title: message.title } });
      await browser.tabs.update(sender.tab.id, {
        url: `${browser.runtime.getURL('/xml-viewer.html')}?id=${id}`,
      });
      return undefined;
    }

    if (message.type === 'get-xml-document') {
      const key = `xml-document:${message.id}`;
      const documents = await browser.storage.session.get(key);
      await browser.storage.session.remove(key);
      return documents[key];
    }

    return undefined;
  });
});
