/* 站点渲染：读 data/*.json，填进页面骨架。
   没有框架，约 80 行。改内容不用碰这个文件。 */

const $ = (sel, root = document) => root.querySelector(sel);

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
};

const getJSON = async (path) => {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
};

/* 封面路径：绝对路径（/media/...）原样用；相对路径按 site 根解析 */
const asset = (p) => (/^(\/|https?:)/.test(p) ? p : `../${p}`);

/* ---------- 首页 ---------- */
async function renderHome() {
  const d = await getJSON('data/site.json');
  document.title = d.name;

  const nameEl = $('[data-name]');
  if (nameEl) nameEl.textContent = d.name;

  const now = d.now || {};
  const frame = $('[data-frame]');
  if (frame && now.image) {
    const img = el('img');
    img.src = now.image;
    img.alt = now.alt || '';
    frame.appendChild(img);
  }

  const cap = $('[data-caption]');
  if (cap) cap.textContent = now.caption || '';

  const nav = $('[data-doors]');
  if (nav) {
    (d.doors || []).forEach((door) => {
      const a = el('a');
      a.href = door.href;
      a.appendChild(el('span', null, door.label));
      a.appendChild(el('span', 'arrow', '↗'));
      nav.appendChild(a);
    });
  }
}

/* ---------- 相册索引 ---------- */
async function renderAlbums() {
  const d = await getJSON('../data/albums.json');
  const list = $('[data-albums]');
  const empty = $('[data-empty]');
  const albums = d.albums || [];

  if (!albums.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  albums.forEach((a) => {
    const link = el('a');
    link.href = `${a.slug}/`;

    const cover = el('span', 'cover');
    if (a.cover) {
      const img = el('img');
      img.src = asset(a.cover);
      img.alt = '';
      cover.appendChild(img);
    }
    link.appendChild(cover);

    const box = el('span');
    box.appendChild(el('span', 't', a.title || 'Untitled'));
    box.appendChild(el('span', 'd', a.date || ''));
    link.appendChild(box);

    list.appendChild(link);
  });
}

/* ---------- Made ---------- */
async function renderMade() {
  const d = await getJSON('../data/made.json');
  const list = $('[data-made]');
  const empty = $('[data-empty]');
  const items = d.items || [];

  if (!items.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  items.forEach((it) => {
    const link = el('a');
    link.href = it.href || '#';

    const cover = el('span', 'cover');
    if (it.cover) {
      const img = el('img');
      img.src = asset(it.cover);
      img.alt = '';
      cover.appendChild(img);
    }
    link.appendChild(cover);

    const box = el('span');
    box.appendChild(el('span', 't', it.title || 'Untitled'));
    if (it.note) box.appendChild(el('span', 'd', it.note));
    link.appendChild(box);

    list.appendChild(link);
  });
}

/* ---------- 分发 ---------- */
const page = document.body.dataset.page;
const routes = { home: renderHome, photos: renderAlbums, made: renderMade };

if (routes[page]) {
  routes[page]().catch((err) => {
    console.error(err);
    const note = el('p', 'data-error', `data error: ${err.message}`);
    note.style.font = '12px ui-monospace, monospace';
    note.style.padding = '3em max(7vw,28px)';
    note.style.color = '#a33';
    document.body.appendChild(note);
  });
}
