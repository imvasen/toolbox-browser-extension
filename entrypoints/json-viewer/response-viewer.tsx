import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ViewerDocument } from '@/entrypoints/shared/viewer';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function matches(
  value: Json,
  name: string | undefined,
  query: string,
): boolean {
  if (!query) return true;
  if (
    `${name ?? ''} ${typeof value === 'object' ? '' : String(value)}`
      .toLowerCase()
      .includes(query)
  )
    return true;
  return typeof value === 'object' && value !== null
    ? Object.entries(value).some(([key, child]) => matches(child, key, query))
    : false;
}

function Node({
  value,
  name,
  query,
}: {
  value: Json;
  name?: string;
  query: string;
}) {
  if (!matches(value, name, query)) return null;
  if (value === null || typeof value !== 'object')
    return (
      <div>
        <span className='text-blue-400'>
          {name && `${JSON.stringify(name)}: `}
        </span>
        <span className='text-green-400'>{JSON.stringify(value)}</span>
      </div>
    );
  const entries = Array.isArray(value)
    ? value.map((child, index) => [String(index), child] as const)
    : Object.entries(value);
  return (
    <details open className='pl-5 [&>summary]:cursor-pointer'>
      <summary>
        {name && (
          <span className='text-blue-400'>{JSON.stringify(name)}: </span>
        )}
        {Array.isArray(value) ? '[' : '{'}{' '}
        <span className='text-muted-foreground'>{entries.length} items</span>
      </summary>
      <div className='border-border border-l pl-4'>
        {entries.map(([key, child]) => (
          <Node key={key} name={key} value={child} query={query} />
        ))}
      </div>
      <div>{Array.isArray(value) ? ']' : '}'}</div>
    </details>
  );
}

export function JsonResponseViewer({ document }: { document: ViewerDocument }) {
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('tokyo-night');
  useEffect(() => {
    void browser.storage.local.get('theme').then(({ theme }) => {
      if (theme === 'catppuccin') setTheme(theme);
    });
  }, []);
  try {
    const data = JSON.parse(document.text) as Json;
    window.document.title = `${document.title || 'JSON'} | Toolbox`;
    return (
      <main data-theme={theme} className='min-h-screen'>
        <header className='border-border bg-background/95 sticky top-0 flex flex-wrap items-center gap-3 border-b p-4'>
          <strong className='text-primary'>
            {'{ }'} toolbox{' '}
            <span className='text-muted-foreground text-xs'>JSON</span>
          </strong>
          <Button
            size='sm'
            variant='outline'
            onClick={() =>
              void browser.runtime.sendMessage({
                type: 'open-jq-viewer',
                document,
              })
            }
          >
            Open jq
          </Button>
          <input
            className='border-border bg-background focus:ring-ring h-8 flex-1 rounded-lg border px-2 text-sm outline-none focus:ring-2'
            placeholder='Filter keys or values'
            value={query}
            onChange={(event) => setQuery(event.target.value.toLowerCase())}
          />
          <Button variant='outline' onClick={() => setQuery('')}>
            Reset
          </Button>
        </header>
        <section className='p-6 text-sm leading-6'>
          <Node value={data} query={query} />
        </section>
      </main>
    );
  } catch {
    return <p className='p-6'>Toolbox could not parse this JSON response.</p>;
  }
}
