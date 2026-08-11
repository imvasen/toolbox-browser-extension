import { useEffect, useState } from 'react';

import ReactDOM from 'react-dom/client';

import { Button } from '@/components/ui/button';
import type { ViewerDocument } from '@/entrypoints/shared/viewer';

import '@/styles/globals.css';

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
    ? value.map((v, i) => [String(i), v] as const)
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
function App() {
  const [document, setDocument] = useState<ViewerDocument>();
  const [query, setQuery] = useState('');
  const [theme, setTheme] = useState('tokyo-night');
  const [mode, setMode] = useState<'filter' | 'jq'>('filter');
  const [result, setResult] = useState<Json>();
  const [status, setStatus] = useState('');
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id)
      void browser.runtime
        .sendMessage({ type: 'get-viewer', id })
        .then((value: ViewerDocument | undefined) => setDocument(value));
    void browser.storage.local.get('theme').then(({ theme }) => {
      if (theme === 'catppuccin') setTheme(theme);
    });
  }, []);
  if (!document)
    return (
      <p className='p-6'>
        The response is no longer available. Reload the original URL.
      </p>
    );
  try {
    const data = JSON.parse(document.text) as Json;
    document.title = `${document.title || 'JSON'} | Toolbox`;
    async function runJq() {
      if (!query.trim()) {
        setStatus('Enter a jq expression.');
        return;
      }
      setRunning(true);
      setStatus('Running jq...');
      try {
        const { json } = await import('jq-wasm/inline');
        const results = await json<Json>(data, query);
        setResult(results.length === 1 ? results[0]! : results);
        setStatus(`${results.length} result${results.length === 1 ? '' : 's'}`);
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : 'jq could not run this expression.',
        );
      } finally {
        setRunning(false);
      }
    }
    function selectMode(nextMode: 'filter' | 'jq') {
      setMode(nextMode);
      setQuery('');
      setStatus('');
      if (nextMode === 'filter') setResult(undefined);
    }
    return (
      <main data-theme={theme} className='min-h-screen'>
        <header className='border-border bg-background/95 sticky top-0 flex flex-wrap items-center gap-3 border-b p-4'>
          <strong className='text-primary'>
            {'{ }'} toolbox{' '}
            <span className='text-muted-foreground text-xs'>JSON</span>
          </strong>
          <div className='flex gap-1'>
            <Button
              size='sm'
              variant={mode === 'filter' ? 'default' : 'outline'}
              onClick={() => selectMode('filter')}
            >
              Filter
            </Button>
            <Button
              size='sm'
              variant={mode === 'jq' ? 'default' : 'outline'}
              onClick={() => selectMode('jq')}
            >
              jq
            </Button>
          </div>
          <input
            className='border-border bg-background focus:ring-ring h-8 flex-1 rounded-lg border px-2 text-sm outline-none focus:ring-2'
            placeholder={
              mode === 'jq'
                ? 'Enter a jq expression, such as .users[]'
                : 'Filter keys or values'
            }
            value={query}
            onChange={(event) =>
              setQuery(
                mode === 'filter'
                  ? event.target.value.toLowerCase()
                  : event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (mode === 'jq' && event.key === 'Enter') void runJq();
            }}
          />
          {mode === 'jq' && (
            <Button onClick={() => void runJq()} disabled={running}>
              Run query
            </Button>
          )}
          <Button
            variant='outline'
            onClick={() => {
              setQuery('');
              setResult(undefined);
              setStatus('');
            }}
          >
            Reset
          </Button>
        </header>
        {status && (
          <p className='text-muted-foreground m-0 px-6 pt-3 text-xs'>
            {status}
          </p>
        )}
        <section className='p-6 text-sm leading-6'>
          <Node value={result ?? data} query={mode === 'filter' ? query : ''} />
        </section>
      </main>
    );
  } catch {
    return <p className='p-6'>Toolbox could not parse this JSON response.</p>;
  }
}
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
