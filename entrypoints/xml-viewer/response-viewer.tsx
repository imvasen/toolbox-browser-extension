import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ViewerDocument } from '@/entrypoints/shared/viewer';

function XmlNode({ element }: { element: Element }) {
  return (
    <details open className='pl-5 [&>summary]:cursor-pointer'>
      <summary>
        <span className='text-blue-400'>&lt;{element.tagName}</span>
        {[...element.attributes].map((attribute) => (
          <span key={attribute.name} className='text-cyan-300'>
            {' '}
            {attribute.name}=
            <span className='text-green-400'>
              {JSON.stringify(attribute.value)}
            </span>
          </span>
        ))}
        <span className='text-blue-400'>&gt;</span>
      </summary>
      <div className='border-border border-l pl-4'>
        {[...element.childNodes].map((node, index) =>
          node.nodeType === Node.ELEMENT_NODE ? (
            <XmlNode key={index} element={node as Element} />
          ) : (
            node.textContent?.trim() && (
              <div key={index} className='text-green-400'>
                {node.textContent.trim()}
              </div>
            )
          ),
        )}
      </div>
      <div className='text-blue-400'>&lt;/{element.tagName}&gt;</div>
    </details>
  );
}

export function XmlResponseViewer({ viewer }: { viewer: ViewerDocument }) {
  const [theme, setTheme] = useState('tokyo-night');
  useEffect(() => {
    void browser.storage.local.get('theme').then(({ theme }) => {
      if (theme === 'catppuccin') setTheme(theme);
    });
  }, []);
  const xml = new DOMParser().parseFromString(viewer.text, 'application/xml');
  if (xml.documentElement.localName === 'parsererror')
    return <p className='p-6'>Toolbox could not parse this XML response.</p>;
  window.document.title = `${viewer.title || 'XML'} | Toolbox`;
  return (
    <main data-theme={theme} className='min-h-screen'>
      <header className='border-border bg-background/95 sticky top-0 flex items-center gap-3 border-b p-4'>
        <strong className='text-primary'>
          &lt; /&gt; toolbox{' '}
          <span className='text-muted-foreground text-xs'>XML</span>
        </strong>
        <div className='ml-auto'>
          <Button
            variant='outline'
            onClick={() =>
              window.document.querySelectorAll('details').forEach((node) => {
                node.open = true;
              })
            }
          >
            Expand all
          </Button>
        </div>
      </header>
      <section className='p-6 text-sm leading-6'>
        <XmlNode element={xml.documentElement} />
      </section>
    </main>
  );
}
