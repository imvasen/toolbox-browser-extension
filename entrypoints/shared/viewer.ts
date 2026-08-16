export type ViewerDocument = {
  kind: 'json' | 'xml';
  sourceUrl: string;
  text: string;
  title: string;
};
export type OpenJqViewerMessage = {
  type: 'open-jq-viewer';
  document: ViewerDocument;
};
export type GetViewerMessage = { type: 'get-viewer'; id: string };
