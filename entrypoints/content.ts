type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type Theme = {
  background: string;
  foreground: string;
  muted: string;
  border: string;
  panel: string;
  key: string;
  string: string;
  number: string;
  boolean: string;
  null: string;
  accent: string;
};

// Themes are data so new schemes can be added without changing the viewer.
const themes: Record<string, Theme> = {
  'tokyo-night': {
    background: '#1a1b26',
    foreground: '#c0caf5',
    muted: '#565f89',
    border: '#292e42',
    panel: '#16161e',
    key: '#7aa2f7',
    string: '#9ece6a',
    number: '#ff9e64',
    boolean: '#bb9af7',
    null: '#f7768e',
    accent: '#7dcfff',
  },
};

const theme = themes['tokyo-night']!;

function isJsonDocument(): JsonValue | undefined {
  const text = document.body?.innerText.trim();
  if (!text || !/^[{[]/.test(text)) return undefined;

  try {
    return JSON.parse(text) as JsonValue;
  } catch {
    return undefined;
  }
}

function valueType(value: JsonValue): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function formatPrimitive(value: null | boolean | number | string): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}

function createViewer(data: JsonValue) {
  const originalTitle = document.title;
  document.documentElement.innerHTML = '<head></head><body></body>';
  document.title = `${originalTitle || 'JSON'} | Toolbox`;

  const root = document.createElement('main');
  root.id = 'toolbox-json-viewer';
  root.innerHTML = `
    <header>
      <div class="brand"><span class="mark">{ }</span><span>toolbox</span><span class="label">JSON</span></div>
      <div class="modes"><button type="button" data-mode="filter" class="active">Filter</button><button type="button" data-mode="jq">jq</button></div>
      <label class="query"><span class="query-prefix">/</span><input type="search" placeholder="Filter keys, values, or paths" autocomplete="off" spellcheck="false"></label>
      <div class="actions"><button type="button" data-action="run-jq" hidden>Run query</button><button type="button" data-action="reset">Reset</button><button type="button" data-action="expand">Expand all</button><button type="button" data-action="collapse">Collapse nested</button></div>
    </header>
    <p class="status" aria-live="polite"></p>
    <section class="content" aria-label="JSON document"></section>
  `;
  document.body.append(root);

  const style = document.createElement('style');
  style.textContent = `
    :root { color-scheme: dark; background: ${theme.background}; color: ${theme.foreground}; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 100%; background: ${theme.background}; }
    #toolbox-json-viewer { min-height: 100vh; font-size: 14px; line-height: 1.65; }
    header { position: sticky; top: 0; z-index: 1; display: flex; gap: 18px; align-items: center; padding: 14px 24px; background: color-mix(in srgb, ${theme.panel} 94%, transparent); border-bottom: 1px solid ${theme.border}; backdrop-filter: blur(10px); }
    .brand { display: flex; align-items: center; gap: 8px; color: ${theme.foreground}; font-weight: 700; letter-spacing: .03em; white-space: nowrap; }
    .mark { color: ${theme.accent}; } .label { padding: 1px 6px; border: 1px solid ${theme.border}; color: ${theme.muted}; font-size: 11px; font-weight: 500; }
    .query { display: flex; flex: 1; max-width: 540px; align-items: center; gap: 8px; padding: 5px 10px; background: ${theme.background}; border: 1px solid ${theme.border}; border-radius: 4px; color: ${theme.muted}; }
    .query:focus-within { border-color: ${theme.accent}; } input { width: 100%; border: 0; outline: 0; background: transparent; color: ${theme.foreground}; font: inherit; } input::placeholder { color: ${theme.muted}; }
    .modes, .actions { display: flex; gap: 8px; } .actions { margin-left: auto; } button { border: 1px solid ${theme.border}; border-radius: 4px; padding: 4px 9px; background: ${theme.background}; color: ${theme.foreground}; cursor: pointer; font: inherit; font-size: 12px; } button:hover, button.active { border-color: ${theme.accent}; color: ${theme.accent}; } button[hidden] { display: none; }
    .status { min-height: 0; margin: 0; padding: 0 24px; color: ${theme.muted}; font-size: 12px; } .status.error { color: ${theme.null}; } .status:not(:empty) { padding-top: 10px; }
    .content { padding: 24px; overflow: auto; } .node { padding-left: 22px; position: relative; } .node.root { padding-left: 0; } .row { min-height: 23px; white-space: nowrap; } .toggle { position: absolute; left: 0; width: 18px; height: 23px; padding: 0; border: 0; background: transparent; color: ${theme.muted}; } .toggle:hover { border: 0; } .key { color: ${theme.key}; } .string { color: ${theme.string}; } .number { color: ${theme.number}; } .boolean { color: ${theme.boolean}; } .null { color: ${theme.null}; } .punctuation, .summary { color: ${theme.muted}; } .children { border-left: 1px solid color-mix(in srgb, ${theme.border} 70%, transparent); margin-left: 1px; } .node.collapsed > .children, .node.collapsed > .close { display: none; } .node.hidden { display: none; } .match > .row { background: color-mix(in srgb, ${theme.accent} 12%, transparent); outline: 1px solid color-mix(in srgb, ${theme.accent} 25%, transparent); }
    @media (max-width: 680px) { header { flex-wrap: wrap; padding: 10px 14px; gap: 10px; } .query { order: 3; flex-basis: 100%; max-width: none; } .actions { margin-left: 0; flex-wrap: wrap; } .status { padding-left: 14px; } .content { padding: 14px; font-size: 13px; } }
  `;
  document.head.append(style);

  const content = root.querySelector<HTMLElement>('.content')!;
  const query = root.querySelector<HTMLInputElement>('input')!;
  const prefix = root.querySelector<HTMLElement>('.query-prefix')!;
  const status = root.querySelector<HTMLElement>('.status')!;
  const runJqButton = root.querySelector<HTMLButtonElement>('[data-action="run-jq"]')!;
  let jqMode = false;

  function render(value: JsonValue, key: string | undefined, path: string): HTMLElement {
    const type = valueType(value);
    const node = document.createElement('div');
    node.className = 'node';
    node.dataset.search = `${path} ${key ?? ''} ${typeof value === 'object' ? '' : String(value)}`.toLowerCase();
    const row = document.createElement('div');
    row.className = 'row';
    if (key !== undefined) row.innerHTML = `<span class="key">${escapeHtml(JSON.stringify(key))}</span><span class="punctuation">: </span>`;

    if (type !== 'array' && type !== 'object') {
      row.innerHTML += `<span class="${type}">${escapeHtml(formatPrimitive(value as null | boolean | number | string))}</span>`;
      node.append(row);
      return node;
    }

    const entries: [string, JsonValue][] = Array.isArray(value)
      ? value.map((item, index) => [String(index), item])
      : Object.entries(value as Record<string, JsonValue>);
    const opening = type === 'array' ? '[' : '{';
    const closing = type === 'array' ? ']' : '}';
    row.innerHTML += `<span class="punctuation">${opening}</span> <span class="summary">${entries.length} ${entries.length === 1 ? 'item' : 'items'}</span>`;
    const toggle = document.createElement('button');
    toggle.className = 'toggle';
    toggle.type = 'button';
    toggle.textContent = '▾';
    toggle.setAttribute('aria-label', 'Collapse node');
    toggle.addEventListener('click', () => {
      const collapsed = node.classList.toggle('collapsed');
      toggle.textContent = collapsed ? '▸' : '▾';
      toggle.setAttribute('aria-label', collapsed ? 'Expand node' : 'Collapse node');
    });
    node.append(toggle, row);

    const children = document.createElement('div');
    children.className = 'children';
    entries.forEach(([childKey, childValue]) => children.append(render(childValue, childKey, `${path}.${childKey}`)));
    const close = document.createElement('div');
    close.className = 'close punctuation';
    close.textContent = closing;
    node.append(children, close);
    return node;
  }

  function renderTree(value: JsonValue) {
    const tree = render(value, undefined, '$');
    tree.classList.add('root');
    content.replaceChildren(tree);
  }

  function setStatus(message = '', isError = false) {
    status.textContent = message;
    status.classList.toggle('error', isError);
  }

  function filterTree() {
    const term = query.value.trim().toLowerCase();
    [...root.querySelectorAll<HTMLElement>('.node')].reverse().forEach((node) => {
      const matches = !term || node.dataset.search?.includes(term);
      const hasMatchingChild = [...node.querySelectorAll<HTMLElement>(':scope > .children > .node')].some((child) => !child.classList.contains('hidden'));
      node.classList.toggle('hidden', !matches && !hasMatchingChild);
      node.classList.toggle('match', Boolean(term && matches));
      if (term && hasMatchingChild) node.classList.remove('collapsed');
    });
  }

  async function runJq() {
    const expression = query.value.trim();
    if (!expression) {
      setStatus('Enter a jq expression.', true);
      return;
    }

    runJqButton.disabled = true;
    setStatus('Running jq...');
    try {
      // The inline build keeps the WebAssembly asset self-contained for the extension.
      const { json } = await import('jq-wasm/inline');
      const results = await json<JsonValue>(data, expression);
      renderTree(results.length === 1 ? results[0]! : results);
      setStatus(`${results.length} result${results.length === 1 ? '' : 's'}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'jq could not run this expression.', true);
    } finally {
      runJqButton.disabled = false;
    }
  }

  renderTree(data);

  query.addEventListener('input', () => {
    if (!jqMode) filterTree();
  });

  query.addEventListener('keydown', (event) => {
    if (jqMode && event.key === 'Enter') void runJq();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((button) => button.addEventListener('click', () => {
    jqMode = button.dataset.mode === 'jq';
    root.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach((mode) => mode.classList.toggle('active', mode === button));
    prefix.textContent = jqMode ? 'jq' : '/';
    query.placeholder = jqMode ? 'Enter a jq expression, such as .users[] | select(.active)' : 'Filter keys, values, or paths';
    runJqButton.hidden = !jqMode;
    query.value = '';
    setStatus();
    if (!jqMode) filterTree();
    query.focus();
  }));

  runJqButton.addEventListener('click', () => void runJq());
  root.querySelector<HTMLButtonElement>('[data-action="reset"]')!.addEventListener('click', () => {
    renderTree(data);
    setStatus('Showing the original response.');
    if (!jqMode) filterTree();
  });

  root.querySelectorAll<HTMLButtonElement>('[data-action="expand"], [data-action="collapse"]').forEach((button) => button.addEventListener('click', () => {
    const collapse = button.dataset.action === 'collapse';
    root.querySelectorAll<HTMLElement>('.node').forEach((node) => {
      node.classList.toggle('collapsed', collapse && !node.classList.contains('root'));
    });
    root.querySelectorAll<HTMLButtonElement>('.toggle').forEach((toggle) => {
      toggle.textContent = collapse && !toggle.closest('.root') ? '▸' : '▾';
    });
  }));
}

function escapeHtml(value: string): string {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    const data = isJsonDocument();
    if (data !== undefined) createViewer(data);
  },
});
