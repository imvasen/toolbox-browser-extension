export type ViewerDocument = { kind: 'json' | 'xml'; text: string; title: string };
export type OpenViewerMessage = { type: 'open-viewer'; document: ViewerDocument };
export type GetViewerMessage = { type: 'get-viewer'; id: string };
