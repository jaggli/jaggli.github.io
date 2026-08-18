const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

const SIZE_GATE_BYTES = 10 * 1024 * 1024;
const MAX_ROWS = 5000;

function fmtBytes(n) {
  if (n === null || n === undefined) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1048576).toFixed(2)} MB`;
}

/* ---------------- input ---------------- */

function handlePaste(e) {
  const cd = e.clipboardData;
  if (!cd) return;
  e.preventDefault();
  const html = cd.getData('text/html');
  const plain = cd.getData('text/plain');
  showFlavors([...cd.types], { html: html.length, plain: plain.length });
  const payload = html || plain;
  if (!payload) {
    fail({ stage: 'clipboard', message: 'The clipboard carried no text/html or text/plain flavor. See the flavor list above.' });
    return;
  }
  decode('/api/decode', { html: payload });
}

document.addEventListener('paste', handlePaste);

const dropzone = $('dropzone');
for (const type of ['dragenter', 'dragover']) {
  dropzone.addEventListener(type, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
}
for (const type of ['dragleave', 'drop']) {
  dropzone.addEventListener(type, () => dropzone.classList.remove('dragover'));
}
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file) await readFile(file);
});

$('filepicker').addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (file) readFile(file);
});

async function readFile(file) {
  showFlavors([`file: ${file.type || 'unknown type'}`], { html: file.size, plain: 0 });
  decode('/api/decode', { html: await file.text() });
}

$('toggle-raw').addEventListener('click', (e) => {
  const wrap = $('rawwrap');
  wrap.hidden = !wrap.hidden;
  e.currentTarget.setAttribute('aria-expanded', String(!wrap.hidden));
  if (!wrap.hidden) $('rawfield').focus();
});
$('rawfield').addEventListener('paste', (e) => e.stopPropagation());
$('rawgo').addEventListener('click', () => {
  const base64 = $('rawfield').value.trim();
  if (!base64) return;
  hide('flavors');
  decode('/api/decode-raw', { base64 });
});

$('reset').addEventListener('click', () => {
  for (const id of ['flavors', 'errorpanel', 'warnpanel', 'statspanel', 'metapanel', 'treepanel', 'schemapanel']) hide(id);
  $('pastefield').value = '';
  $('rawfield').value = '';
  $('status').textContent = '';
  dropzone.classList.remove('compact');
  lastResult = null;
  $('pastefield').focus();
});

/* ---------------- request ---------------- */

let lastResult = null;

async function decode(url, body) {
  $('status').textContent = 'decoding…';
  hide('errorpanel'); hide('warnpanel'); hide('statspanel'); hide('metapanel'); hide('treepanel'); hide('schemapanel');
  dropzone.classList.add('compact');
  try {
    let data;
    if (window.figmaPipeline) {
      // Client-only build (GitHub Pages): decode in-page, nothing leaves the browser.
      data = url.includes('decode-raw')
        ? window.figmaPipeline.decodeRaw(body.base64)
        : window.figmaPipeline.decode(body.html);
    } else {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      data = await res.json();
    }
    render(data);
  } catch (err) {
    fail({ stage: 'transport', message: `Request to ${url} failed: ${err.message}` });
  }
}

/* ---------------- render ---------------- */

const show = (id) => { $(id).hidden = false; };
const hide = (id) => { $(id).hidden = true; };

function showFlavors(types, sizes) {
  const list = $('flavorlist');
  list.replaceChildren();
  for (const t of types) {
    const li = el('li');
    li.append(el('code', null, t));
    if (t === 'text/html' && sizes.html) li.append(document.createTextNode(`  ${fmtBytes(sizes.html)}`));
    if (t === 'text/plain' && sizes.plain) li.append(document.createTextNode(`  ${fmtBytes(sizes.plain)}`));
    list.append(li);
  }
  if (types.length === 0) list.append(el('li', null, '(none reported)'));
  show('flavors');
}

function render(data) {
  lastResult = data;
  renderWarnings(data.warnings);
  renderStats(data.stats);
  renderMeta(data);
  renderSchema(data.schema);

  if (!data.ok) {
    fail(data);
    return;
  }
  hide('errorpanel');
  const kind = data.classification?.label;
  $('status').textContent = `decoded ${data.stats.nodeCount} node${data.stats.nodeCount === 1 ? '' : 's'} · container v${data.stats.containerVersion} · root type ${data.stats.rootType}${kind ? ` · ${kind}` : ''}`;
  $('roottype').textContent = data.stats.rootType ?? '';
  renderKind(data.classification);
  show('treepanel');

  if (data.stats.inflatedBytes > SIZE_GATE_BYTES) {
    $('sizegatetext').textContent =
      `${fmtBytes(data.stats.inflatedBytes)} inflated. Rendering the full tree may hang the page.`;
    show('sizegate');
    $('tree').replaceChildren();
    $('renderanyway').onclick = () => { hide('sizegate'); paintTree(data.decoded); };
  } else {
    hide('sizegate');
    paintTree(data.decoded);
  }
}

function fail(data) {
  $('errstage').textContent = data.stage ?? 'unknown';
  $('errmsg').textContent = data.message ?? 'No message.';
  const hex = $('errhex');
  if (data.hexPreview) {
    hex.textContent = `first ${data.hexPreview.length / 2} bytes:\n${data.hexPreview.replace(/(.{2})/g, '$1 ').trim()}`;
    hex.hidden = false;
  } else {
    hex.hidden = true;
  }
  show('errorpanel');
  $('status').textContent = `failed at ${data.stage ?? 'unknown'}`;
}

function renderKind(classification) {
  $('kindchip').textContent = classification?.label ?? '';
  const list = $('kindroots');
  if (!classification?.roots?.length) { hide('kindroots'); return; }
  list.replaceChildren(...classification.roots.map((r) => {
    const li = el('li');
    li.append(
      el('span', 'kr-kind', r.kind),
      el('code', null, `${r.type} "${r.name ?? ''}"`),
      el('span', 'kr-detail', ` ${r.guid} · ${r.descendants} descendant${r.descendants === 1 ? '' : 's'}`),
    );
    return li;
  }));
  show('kindroots');
}

function renderWarnings(warnings) {
  if (!warnings?.length) { hide('warnpanel'); return; }
  const list = $('warnlist');
  list.replaceChildren(...warnings.map((w) => el('li', null, w)));
  show('warnpanel');
}

function renderStats(stats) {
  if (!stats) { hide('statspanel'); return; }
  const steps = [];
  if (stats.htmlBytes !== undefined) steps.push(['html', fmtBytes(stats.htmlBytes)]);
  if (stats.figmaBase64Bytes) steps.push(['base64', fmtBytes(stats.figmaBase64Bytes)]);
  if (stats.figmaBytes !== undefined) steps.push(['container', fmtBytes(stats.figmaBytes)]);
  if (stats.inflatedBytes !== undefined) steps.push(['inflated', fmtBytes(stats.inflatedBytes)]);
  if (stats.nodeCount !== undefined) steps.push(['nodes', String(stats.nodeCount), true]);

  const strip = $('statsstrip');
  strip.replaceChildren();
  steps.forEach(([label, value, terminal], i) => {
    if (i > 0) strip.append(el('span', 'arrow', '→'));
    const step = el('div', terminal ? 'step terminal' : 'step');
    step.append(el('span', 'step-label', label), el('span', 'step-value', value));
    strip.append(step);
  });
  // Version is a fact about the container, not a stage — keep the strip a pure sequence.
  $('versionchip').textContent = stats.containerVersion !== undefined ? `container v${stats.containerVersion}` : '';

  const table = $('chunktable');
  table.replaceChildren();
  if (stats.chunks?.length) {
    const t = el('table');
    const head = el('tr');
    for (const h of ['chunk', 'codec', 'compressed', 'inflated', 'ratio']) head.append(el('th', null, h));
    t.append(head);
    stats.chunks.forEach((c) => {
      const tr = el('tr');
      const name = c.index === 0 ? '0 · schema' : c.index === 1 ? '1 · message' : `${c.index} · blob`;
      tr.append(el('td', null, name), el('td', null, c.codec ?? '—'), el('td', null, fmtBytes(c.compressed)));
      if (c.error) {
        const bad = el('td', 'bad', c.error);
        bad.colSpan = 2;  // inflated + ratio
        tr.append(bad);
      } else {
        tr.append(el('td', null, fmtBytes(c.inflated)), el('td', null, c.ratio ? `${c.ratio}×` : '—'));
      }
      t.append(tr);
    });
    table.append(t);
  }
  show('statspanel');
}

function renderMeta(data) {
  if (!data.meta && !data.metaError) { hide('metapanel'); return; }
  $('metaenc').textContent = data.metaEncoding ?? 'undecodable';
  const body = $('metabody');
  body.replaceChildren();
  if (data.meta) {
    body.append(buildNode(null, data.meta, 0, true));
  } else {
    body.append(el('p', 'errmsg', data.metaError));
  }
  show('metapanel');
}

function renderSchema(schema) {
  if (!schema) { hide('schemapanel'); return; }
  $('schemacount').textContent = `${schema.typeCount} types`;
  const box = $('schematypes');
  box.replaceChildren();
  for (const t of schema.types) {
    const row = el('div');
    row.append(
      el('span', 'st-kind', `${t.kind.toLowerCase()} `),
      el('span', 'st-name', t.name),
      el('span', 'st-fields', ` (${t.fieldCount})`),
    );
    box.append(row);
  }
  $('schematext').textContent = schema.pretty;
  show('schemapanel');
}

/* ---------------- tree ---------------- */

function paintTree(value) {
  const tree = $('tree');
  tree.replaceChildren(buildNode(null, value, 0, true));
}

const isLeafObject = (v) => v && typeof v === 'object' && !Array.isArray(v) && typeof v.__bytes === 'number';

function preview(value) {
  if (Array.isArray(value)) return `Array(${value.length})`;
  const keys = Object.keys(value);
  return `{${keys.length} ${keys.length === 1 ? 'key' : 'keys'}}`;
}

function leafSpan(value) {
  if (value === null) return el('span', 'v-null', 'null');
  if (isLeafObject(value)) {
    const hex = value.hexPreview ? ` ${value.hexPreview}${value.truncated ? '…' : ''}` : '';
    return el('span', 'v-bytes', `<${value.__bytes} bytes>${hex}`);
  }
  switch (typeof value) {
    case 'string': return el('span', 'v-string', JSON.stringify(value));
    case 'number': return el('span', 'v-number', String(value));
    case 'boolean': return el('span', 'v-boolean', String(value));
    default: return el('span', 'v-null', String(value));
  }
}

/** Children are built on first expand, so a huge payload costs nothing until opened. */
function buildNode(key, value, depth, open) {
  const wrap = el('div', 'node');
  const row = el('div', 'row');
  const branch = value !== null && typeof value === 'object' && !isLeafObject(value);
  let children = null;

  if (branch) {
    const twisty = el('button', 'twisty', open ? '▾' : '▸');
    twisty.setAttribute('aria-expanded', String(!!open));
    row.append(twisty);
    children = el('div', 'children');
    children.hidden = !open;
    twisty.addEventListener('click', () => {
      const nowOpen = children.hidden;
      if (nowOpen && !children.dataset.filled) fillChildren(children, value, depth);
      children.hidden = !nowOpen;
      twisty.textContent = nowOpen ? '▾' : '▸';
      twisty.setAttribute('aria-expanded', String(nowOpen));
    });
  }

  if (key !== null) {
    row.append(el('span', 'k', key), el('span', 'colon', ':'));
  }
  row.append(branch ? el('span', 'meta-count', preview(value)) : leafSpan(value));

  const copy = el('button', 'copy', '⧉');
  copy.title = 'copy this subtree as JSON';
  copy.addEventListener('click', async () => {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    copy.textContent = '✓';
    setTimeout(() => { copy.textContent = '⧉'; }, 900);
  });
  row.append(copy);
  wrap.append(row);

  if (branch) {
    if (open) fillChildren(children, value, depth);
    wrap.append(children);
  }
  return wrap;
}

function fillChildren(container, value, depth) {
  container.dataset.filled = '1';
  const entries = Array.isArray(value)
    ? value.map((v, i) => [String(i), v])
    : Object.entries(value);
  // Collapsed past depth 2, per the format's usual shape.
  const frag = document.createDocumentFragment();
  for (const [k, v] of entries) frag.append(buildNode(k, v, depth + 1, depth + 1 < 2));
  container.append(frag);
}

$('expandall').addEventListener('click', () => {
  let budget = MAX_ROWS;
  const walk = (root) => {
    for (const twisty of [...root.querySelectorAll('.twisty')]) {
      if (budget-- <= 0) break;
      if (twisty.getAttribute('aria-expanded') === 'false') twisty.click();
    }
  };
  // Repeat: clicking materialises new twisties.
  for (let pass = 0; pass < 12 && budget > 0; pass++) {
    const before = $('tree').querySelectorAll('.twisty[aria-expanded="false"]').length;
    walk($('tree'));
    if (before === 0) break;
  }
  $('status').textContent = budget <= 0 ? `expand stopped at ${MAX_ROWS} rows` : 'expanded';
});

$('collapseall').addEventListener('click', () => {
  // Leave the root open; collapse everything below it.
  const expanded = [...$('tree').querySelectorAll('.twisty[aria-expanded="true"]')].slice(1);
  for (const twisty of expanded.reverse()) twisty.click();
  $('status').textContent = 'collapsed';
});

$('exportjson').addEventListener('click', () => {
  if (!lastResult?.decoded) return;
  const blob = new Blob([JSON.stringify({ meta: lastResult.meta, stats: lastResult.stats, decoded: lastResult.decoded }, null, 2)], { type: 'application/json' });
  const a = el('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'figma-clipboard.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

$('pastefield').focus();
