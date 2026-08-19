import { useEffect, useState } from 'react';

import ReactDOM from 'react-dom/client';

import type { ViewerDocument } from '@/entrypoints/shared/viewer';
import { XmlResponseViewer } from '@/entrypoints/xml-viewer/response-viewer';

import '@/styles/globals.css';

function App() {
  const [viewer, setViewer] = useState<ViewerDocument>();
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id)
      void browser.runtime
        .sendMessage({ type: 'get-viewer', id })
        .then((value: ViewerDocument | undefined) => setViewer(value));
  }, []);
  return viewer ? (
    <XmlResponseViewer viewer={viewer} />
  ) : (
    <p className='p-6'>
      The XML response is no longer available. Reload the original URL.
    </p>
  );
}

const root = document.getElementById('root');
if (root) ReactDOM.createRoot(root).render(<App />);
