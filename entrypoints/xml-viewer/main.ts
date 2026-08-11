type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

type XmlDocumentMessage = {
  xml: string;
  title: string;
};

function escapeHtml(value: string): string {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function xmlElementToJson(element: Element): JsonValue {
  const result: Record<string, JsonValue> = {};
  const attributes = Object.fromEntries([...element.attributes].map((attribute) => [attribute.name, attribute.value]));
  if (Object.keys(attributes).length > 0) result['@attributes'] = attributes;

  const text = [...element.childNodes]
    .filter((node) => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE)
    .map((node) => node.textContent?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' ');
  if (text) result['#text'] = text;

  for (const child of element.children) {
    const value = xmlElementToJson(child);
    const existing = result[child.tagName];
    if (existing === undefined) result[child.tagName] = value;
    else if (Array.isArray(existing)) existing.push(value);
    else result[child.tagName] = [existing, value];
  }

  return result;
}

function renderXml(element: Element): HTMLDetailsElement {
  const details = document.createElement('details');
  details.className = 'xml-node';
  details.open = true;
  const summary = document.createElement('summary');
  const attributes = [...element.attributes]
    .map((attribute) => ` <span class="attribute">${escapeHtml(attribute.name)}</span>=<span class="value">${escapeHtml(JSON.stringify(attribute.value))}</span>`)
    .join('');
  summary.innerHTML = `<span class="punctuation">&lt;</span><span class="tag">${escapeHtml(element.tagName)}</span>${attributes}<span class="punctuation">&gt;</span>`;
  details.append(summary);

  for (const child of element.childNodes) {
    if (child.nodeType === Node.ELEMENT_NODE) details.append(renderXml(child as Element));
    else if (child.nodeType === Node.COMMENT_NODE) {
      const comment = document.createElement('div');
      comment.className = 'comment';
      comment.textContent = `<!--${child.textContent ?? ''}-->`;
      details.append(comment);
    } else if (child.textContent?.trim()) {
      const text = document.createElement('div');
      text.className = 'value text';
      text.textContent = child.textContent.trim();
      details.append(text);
    }
  }

  const close = document.createElement('div');
  close.className = 'punctuation close';
  close.textContent = `</${element.tagName}>`;
  details.append(close);
  return details;
}

async function main() {
  const app = document.querySelector<HTMLElement>('#app')!;
  const id = new URLSearchParams(location.search).get('id');
  const message = id
    ? await browser.runtime.sendMessage({ type: 'get-xml-document', id }) as XmlDocumentMessage | undefined
    : undefined;

  if (!message) {
    app.textContent = 'The XML response is no longer available. Reload the original URL.';
    return;
  }

  const xml = new DOMParser().parseFromString(message.xml, 'application/xml');
  if (xml.documentElement.localName === 'parsererror') {
    app.textContent = 'Toolbox could not parse this XML response.';
    return;
  }

  document.title = `${message.title || 'XML'} | Toolbox`;
  app.innerHTML = `
    <header><div class="brand"><span class="mark">&lt; /&gt;</span><span>toolbox</span><span class="label">XML</span></div><div class="actions"><button type="button" data-action="convert">Convert to JSON</button><button type="button" data-action="expand">Expand all</button><button type="button" data-action="collapse">Collapse nested</button></div></header>
    <section class="content" aria-label="XML document"></section>
  `;
  const content = app.querySelector<HTMLElement>('.content')!;
  const tree = renderXml(xml.documentElement);
  tree.classList.add('root');
  content.append(tree);

  app.querySelector<HTMLButtonElement>('[data-action="convert"]')!.addEventListener('click', () => {
    const json = { [xml.documentElement.tagName]: xmlElementToJson(xml.documentElement) };
    content.innerHTML = `<pre>${escapeHtml(JSON.stringify(json, null, 2))}</pre>`;
  });
  app.querySelectorAll<HTMLButtonElement>('[data-action="expand"], [data-action="collapse"]').forEach((button) => button.addEventListener('click', () => {
    const collapse = button.dataset.action === 'collapse';
    content.querySelectorAll<HTMLDetailsElement>('.xml-node').forEach((node) => {
      node.open = !collapse || node.classList.contains('root');
    });
  }));
}

void main();
