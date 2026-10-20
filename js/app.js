import { ICONS, iconSvg } from './icons.js';
import { TEMPLATES } from './templates.js';
import { runChecks, protectingDiff } from './checks.js';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
export const TYPES = {
  disj:        'Disjoncteur',
  diff:        'Interrupteur différentiel',
  general:     'Disjoncteur général',
  parafoudre:  'Parafoudre',
  contacteur:  'Contacteur',
  telerupteur: 'Télérupteur',
  minuterie:   'Minuterie / horloge',
  bornier:     'Bornier / répartiteur',
  vide:        'Vide / réserve',
  autre:       'Autre appareil',
};
const TYPE_ICON = { diff: 'differentiel', general: 'disjoncteur', parafoudre: 'parafoudre', contacteur: 'contacteur',
  telerupteur: 'telerupteur', minuterie: 'minuterie', bornier: 'tableau' };
const PALETTE = ['#2563eb', '#d97706', '#7c3aed', '#dc2626', '#16a34a', '#ea580c', '#92400e', '#0d9488', '#db2777', '#475569'];
const NEUTRAL = '#9ca3af';
const NO_DIFF = new Set(['diff', 'general', 'parafoudre', 'vide', 'bornier']);
const CALIBRES = ['2A', '6A', '10A', '16A', '20A', '25A', '32A', '40A', '63A',
  '25A 30mA AC', '40A 30mA AC', '40A 30mA A', '63A 30mA A', '40A 30mA F', '40A 30mA B', '63A 300mA S'];
const STORE_CURRENT = 'etq.current';
const STORE_SAVED = 'etq.saved';
const STORE_UI = 'etq.ui';

const uid = () => Math.random().toString(36).slice(2, 10);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));

function store(key, value) {
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(value));
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Modèle
// ---------------------------------------------------------------------------
export function newModule(props = {}) {
  return { id: uid(), type: 'disj', width: 1, icon: '', label: '', location: '', repere: '', calibre: '', color: '', ...props };
}

export function defaultSettings() {
  return {
    pitch: 18, height: 30, scale: 100, orientation: 'auto',
    showIcon: true, showLocation: true, showRepere: true, showCalibre: true,
    colorMode: 'band', autoColor: true, separators: true,
    printNomenclature: true, printRuler: true, printTitle: true,
  };
}

function normalize(s) {
  const st = { title: 'Mon tableau', settings: defaultSettings(), rows: [], ...s };
  st.settings = { ...defaultSettings(), ...(s.settings || {}) };
  st.rows = (st.rows || []).map((r) => ({ slots: Math.max(1, +r.slots || 13), modules: (r.modules || []).map((m) => newModule({ ...m, id: uid() })) }));
  if (!st.rows.length) st.rows.push({ slots: 13, modules: [] });
  return st;
}

let state = normalize(TEMPLATES[0].build());
let selected = null; // id du module sélectionné
let undoStack = [];
let redoStack = [];
let lastSnapshot = JSON.stringify(state);
const storedUi = store(STORE_UI);
let ui = { zoom: 1, theme: 'auto', ...(storedUi || {}) };

function findModule(id) {
  for (let r = 0; r < state.rows.length; r++) {
    const i = state.rows[r].modules.findIndex((m) => m.id === id);
    if (i >= 0) return { r, i, m: state.rows[r].modules[i] };
  }
  return null;
}

function usedSlots(row) { return row.modules.reduce((a, m) => a + (+m.width || 1), 0); }

// Couleur effective : couleur manuelle, sinon couleur du différentiel qui protège le module.
function colorMap() {
  const map = new Map();
  let diffIndex = -1;
  let current = NEUTRAL;
  for (const row of state.rows) {
    for (const m of row.modules) {
      if (m.type === 'diff') { diffIndex++; current = m.color || PALETTE[diffIndex % PALETTE.length]; }
      let c = m.color || (state.settings.autoColor ? current : NEUTRAL);
      if (m.type === 'vide') c = m.color || 'transparent';
      map.set(m.id, c);
    }
  }
  return map;
}

// ---------------------------------------------------------------------------
// Historique
// ---------------------------------------------------------------------------
let commitTimer = null;
function commit(immediate = true) {
  const doIt = () => {
    const snap = JSON.stringify(state);
    if (snap === lastSnapshot) return;
    undoStack.push(lastSnapshot);
    if (undoStack.length > 150) undoStack.shift();
    redoStack = [];
    lastSnapshot = snap;
    store(STORE_CURRENT, state);
    updateHistoryButtons();
  };
  clearTimeout(commitTimer);
  if (immediate) doIt(); else commitTimer = setTimeout(doIt, 400);
}

function restore(snap) {
  state = normalize(JSON.parse(snap));
  // normalize régénère les id : on conserve la sélection par position
  selected = null;
  lastSnapshot = JSON.stringify(state);
  store(STORE_CURRENT, state);
  renderAll();
}

function undo() {
  clearTimeout(commitTimer); commit();
  if (!undoStack.length) return;
  redoStack.push(lastSnapshot);
  restore(undoStack.pop());
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(lastSnapshot);
  restore(redoStack.pop());
}
function updateHistoryButtons() {
  $('#btn-undo').disabled = !undoStack.length;
  $('#btn-redo').disabled = !redoStack.length;
}

function loadState(s, { resetHistory = true } = {}) {
  state = normalize(s);
  selected = null;
  if (resetHistory) { undoStack = []; redoStack = []; }
  lastSnapshot = JSON.stringify(state);
  store(STORE_CURRENT, state);
  renderAll();
}

// ---------------------------------------------------------------------------
// Rendu d'une étiquette (partagé entre l'éditeur et l'impression)
// ---------------------------------------------------------------------------
function moduleLabel(m) {
  if (m.label) return m.label;
  if (m.type === 'vide') return '';
  if (m.type === 'disj') return '';
  return TYPES[m.type] || '';
}

function labelHtml(m, colors, k = 1) {
  const s = state.settings;
  const w = (+m.width || 1) * s.pitch * k;
  const h = s.height * k;
  const c = colors.get(m.id);
  const icon = m.icon || TYPE_ICON[m.type] || '';
  const showBand = s.colorMode === 'band' && c !== 'transparent';
  const fill = s.colorMode === 'fill' && c !== 'transparent';
  const iconSize = Math.min(h * 0.32, w - 2 * k);
  const foot = [s.showRepere ? m.repere : '', s.showCalibre ? m.calibre : ''].filter(Boolean);
  const isDiff = m.type === 'diff';
  return `<div class="lbl${m.type === 'vide' ? ' lbl-vide' : ''}${isDiff ? ' lbl-diff' : ''}${fill ? ' lbl-fill' : ''}" data-id="${m.id}"
      style="width:${w}mm;height:${h}mm;--c:${c};--band:${h * 0.12}mm;--foot:${h * 0.1}mm">
    ${showBand ? '<div class="lbl-band"></div>' : ''}
    ${s.showIcon && icon && m.type !== 'vide' ? `<div class="lbl-ico" style="height:${iconSize}mm">${iconSvg(icon)}</div>` : ''}
    <div class="lbl-txt" data-max="${(h * 0.15).toFixed(2)}" lang="fr">
      <span class="lbl-name">${esc(moduleLabel(m))}</span>
      ${s.showLocation && m.location ? `<span class="lbl-loc">${esc(m.location)}</span>` : ''}
    </div>
    ${foot.length ? `<div class="lbl-foot">${foot.map((f) => `<span>${esc(f)}</span>`).join('')}</div>` : ''}
  </div>`;
}

function emptyHtml(n, k = 1, interactive = false) {
  const s = state.settings;
  return `<div class="lbl lbl-empty${interactive ? ' is-free' : ''}" style="width:${n * s.pitch * k}mm;height:${s.height * k}mm;--p:${s.pitch * k}mm"
    ${interactive ? `title="Cliquer pour ajouter un module">+` : '>'}</div>`;
}

// Ajuste la taille du texte pour qu'il tienne dans l'étiquette.
function fitTexts(root) {
  for (const el of $$('.lbl-txt', root)) {
    const max = parseFloat(el.dataset.max) || 4;
    const min = Math.min(1.4, max);
    let size = max;
    el.classList.remove('brk');
    el.style.fontSize = size + 'mm';
    while (size > min && (el.scrollHeight > el.clientHeight + 0.5 || el.scrollWidth > el.clientWidth + 0.5)) {
      size -= 0.1;
      el.style.fontSize = size.toFixed(2) + 'mm';
    }
    if (el.scrollWidth > el.clientWidth + 0.5) el.classList.add('brk');
  }
}

// ---------------------------------------------------------------------------
// Éditeur
// ---------------------------------------------------------------------------
function renderPanel() {
  const colors = colorMap();
  const host = $('#panel');
  host.style.setProperty('--zoom', ui.zoom);
  host.innerHTML = state.rows.map((row, r) => {
    const used = usedSlots(row);
    const free = row.slots - used;
    return `<section class="row" data-row="${r}">
      <header class="row-head">
        <strong>Rangée ${r + 1}</strong>
        <label>Modules <input type="number" min="1" max="36" value="${row.slots}" data-act="slots" data-row="${r}"></label>
        <span class="row-usage${free < 0 ? ' over' : ''}">${used}/${row.slots} utilisés${free < 0 ? ' — dépassement !' : ''}</span>
        <span class="spacer"></span>
        <button class="icon-btn" data-act="row-up" data-row="${r}" title="Monter la rangée" ${r === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-btn" data-act="row-down" data-row="${r}" title="Descendre la rangée" ${r === state.rows.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icon-btn" data-act="row-dup" data-row="${r}" title="Dupliquer la rangée"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button>
        <button class="icon-btn danger" data-act="row-del" data-row="${r}" title="Supprimer la rangée">✕</button>
      </header>
      <div class="strip-wrap"><div class="strip${state.settings.separators ? ' sep' : ''}" data-row="${r}">
        ${row.modules.map((m) => labelHtml(m, colors)).join('')}
        ${free > 0 ? emptyHtml(free, 1, true) : ''}
      </div></div>
    </section>`;
  }).join('');

  for (const el of $$('.strip .lbl[data-id]', host)) {
    el.draggable = true;
    if (el.dataset.id === selected) el.classList.add('is-selected');
  }
  fitTexts(host);
  renderChecks();
}

function renderChecks() {
  const res = runChecks(state, TYPES);
  const box = $('#checks');
  $('#checks-count').textContent = res.length ? res.length : '✓';
  $('#checks-count').className = 'badge ' + (res.some((x) => x.level === 'error') ? 'err' : res.length ? 'warn' : 'ok');
  box.innerHTML = res.length
    ? res.map((x) => `<li class="${x.level}" ${x.id ? `data-goto="${x.id}"` : ''}>${esc(x.msg)}</li>`).join('')
    : '<li class="ok">Aucune remarque.</li>';
}

function renderProps() {
  const box = $('#props');
  const f = selected && findModule(selected);
  if (!f) {
    box.innerHTML = `<p class="hint">Cliquez sur une étiquette pour la modifier, ou sur une case <b>+</b> pour ajouter un module.
      Glissez-déposez les étiquettes pour les réordonner, y compris d'une rangée à l'autre.</p>`;
    return;
  }
  const m = f.m;
  const diff = protectingDiff(state, m.id);
  const colors = colorMap();
  box.innerHTML = `
    <div class="props-head">
      <strong>Rangée ${f.r + 1} · position ${state.rows[f.r].modules.slice(0, f.i).reduce((a, x) => a + (+x.width || 1), 0) + 1}</strong>
      <button class="icon-btn" data-act="deselect" title="Fermer">✕</button>
    </div>
    <label>Type d'appareil
      <select data-field="type">${Object.entries(TYPES).map(([k, v]) => `<option value="${k}" ${m.type === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
    </label>
    <label>Circuit / libellé
      <input data-field="label" value="${esc(m.label)}" placeholder="${esc(TYPES[m.type])}" maxlength="60">
    </label>
    <label>Emplacement / pièce
      <input data-field="location" value="${esc(m.location)}" placeholder="Cuisine, Chambre 1…" maxlength="40" list="dl-locations">
    </label>
    <div class="two">
      <label>Repère
        <input data-field="repere" value="${esc(m.repere)}" placeholder="Q3" maxlength="10">
      </label>
      <label>Calibre
        <input data-field="calibre" value="${esc(m.calibre)}" placeholder="16A" maxlength="20" list="dl-calibres">
      </label>
    </div>
    <div class="field">Largeur (modules)
      <div class="seg">${[1, 2, 3, 4, 5, 6].map((n) => `<button data-act="width" data-n="${n}" class="${+m.width === n ? 'on' : ''}">${n}</button>`).join('')}</div>
    </div>
    <div class="field">Couleur ${m.color ? '' : '<small>(automatique)</small>'}
      <div class="swatches">
        <button data-act="color" data-c="" class="sw auto ${m.color ? '' : 'on'}" title="Automatique (couleur du différentiel)">A</button>
        ${PALETTE.map((c) => `<button data-act="color" data-c="${c}" class="sw ${m.color === c ? 'on' : ''}" style="--c:${c}" title="${c}"></button>`).join('')}
        <input type="color" data-act="color-custom" value="${m.color || (colors.get(m.id) !== 'transparent' ? colors.get(m.id) : '#2563eb')}" title="Couleur personnalisée">
      </div>
    </div>
    <div class="field">Icône
      <input type="search" id="icon-search" placeholder="Rechercher une icône…">
      <div class="icons" id="icon-grid">
        <button data-act="icon" data-k="" class="${m.icon ? '' : 'on'}" title="Aucune / par défaut">∅</button>
        ${Object.entries(ICONS).map(([k, v]) => `<button data-act="icon" data-k="${k}" data-name="${esc(v[0].toLowerCase())} ${esc(v[1].toLowerCase())}" class="${m.icon === k ? 'on' : ''}" title="${esc(v[0])}">${iconSvg(k)}</button>`).join('')}
      </div>
    </div>
    ${!NO_DIFF.has(m.type) ? `<p class="hint">Protégé par : <b>${diff ? esc([diff.label || 'Différentiel', diff.calibre].filter(Boolean).join(' · ')) : 'aucun différentiel en amont'}</b></p>` : ''}
    <div class="actions">
      <button data-act="move" data-d="-1" title="Déplacer à gauche">◀</button>
      <button data-act="move" data-d="1" title="Déplacer à droite">▶</button>
      <button data-act="dup">Dupliquer</button>
      <button data-act="insert-gap">Insérer un vide</button>
      <button data-act="del" class="danger">Supprimer</button>
    </div>`;
}

function renderSettings() {
  const s = state.settings;
  $('#doc-title').value = state.title;
  for (const el of $$('[data-setting]')) {
    const k = el.dataset.setting;
    if (el.type === 'checkbox') el.checked = !!s[k];
    else el.value = s[k];
  }
}

function renderAll() {
  renderSettings();
  renderPanel();
  renderProps();
  updateHistoryButtons();
  $('#zoom').value = Math.round(ui.zoom * 100);
  $('#zoom-val').textContent = Math.round(ui.zoom * 100) + ' %';
}

function select(id) {
  selected = id;
  $$('#panel .lbl.is-selected').forEach((e) => e.classList.remove('is-selected'));
  if (id) $(`#panel .lbl[data-id="${id}"]`)?.classList.add('is-selected');
  renderProps();
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------
function addModule(r, props = {}) {
  const m = newModule(props);
  state.rows[r].modules.push(m);
  commit();
  selected = m.id;
  renderPanel(); renderProps();
  $('#props [data-field="label"]')?.focus();
}

function moveModule(id, targetRow, beforeId) {
  const f = findModule(id);
  if (!f || id === beforeId) return;
  const [m] = state.rows[f.r].modules.splice(f.i, 1);
  const mods = state.rows[targetRow].modules;
  const idx = beforeId ? mods.findIndex((x) => x.id === beforeId) : -1;
  if (idx >= 0) mods.splice(idx, 0, m); else mods.push(m);
  commit();
  renderPanel(); renderProps();
}

function onPanelClick(e) {
  const btn = e.target.closest('[data-act]');
  if (btn) {
    const r = +btn.dataset.row;
    const act = btn.dataset.act;
    if (act === 'row-up' && r > 0) [state.rows[r - 1], state.rows[r]] = [state.rows[r], state.rows[r - 1]];
    else if (act === 'row-down' && r < state.rows.length - 1) [state.rows[r + 1], state.rows[r]] = [state.rows[r], state.rows[r + 1]];
    else if (act === 'row-dup') state.rows.splice(r + 1, 0, { slots: state.rows[r].slots, modules: state.rows[r].modules.map((m) => ({ ...clone(m), id: uid() })) });
    else if (act === 'row-del') {
      if (state.rows[r].modules.length && !confirm(`Supprimer la rangée ${r + 1} et ses ${state.rows[r].modules.length} module(s) ?`)) return;
      state.rows.splice(r, 1);
      if (!state.rows.length) state.rows.push({ slots: 13, modules: [] });
    } else return;
    commit(); renderPanel(); renderProps();
    return;
  }
  const lbl = e.target.closest('.lbl');
  if (!lbl) return;
  if (lbl.classList.contains('is-free')) {
    addModule(+lbl.closest('.strip').dataset.row);
  } else if (lbl.dataset.id) {
    select(lbl.dataset.id);
  }
}

function onPanelInput(e) {
  const el = e.target;
  if (el.dataset.act === 'slots') {
    const v = Math.max(1, Math.min(36, parseInt(el.value, 10) || 1));
    state.rows[+el.dataset.row].slots = v;
    commit();
    renderPanel();
    $(`#panel [data-act="slots"][data-row="${el.dataset.row}"]`)?.focus();
  }
}

function onPropsInput(e) {
  const el = e.target;
  const f = selected && findModule(selected);
  if (!f) return;
  if (el.id === 'icon-search') {
    const q = el.value.trim().toLowerCase();
    for (const b of $$('#icon-grid button[data-k]')) b.hidden = q && !(b.dataset.name || '').includes(q) && !b.dataset.k.includes(q);
    return;
  }
  if (el.dataset.field) {
    f.m[el.dataset.field] = el.value;
    if (el.dataset.field === 'type') {
      if (f.m.type === 'diff' && !f.m.calibre) f.m.calibre = '40A 30mA A';
      if (f.m.type === 'diff' && (+f.m.width || 1) < 2) f.m.width = 2;
      commit(); renderPanel(); renderProps();
      return;
    }
    commit(false);
    renderPanel();
  } else if (el.dataset.act === 'color-custom') {
    f.m.color = el.value;
    commit(false);
    renderPanel();
  }
}

function onPropsClick(e) {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const f = selected && findModule(selected);
  const act = btn.dataset.act;
  if (act === 'deselect') return select(null);
  if (!f) return;
  const mods = state.rows[f.r].modules;
  switch (act) {
    case 'width': f.m.width = +btn.dataset.n; break;
    case 'color': f.m.color = btn.dataset.c; break;
    case 'icon': f.m.icon = btn.dataset.k; break;
    case 'move': {
      const j = f.i + +btn.dataset.d;
      if (j >= 0 && j < mods.length) [mods[f.i], mods[j]] = [mods[j], mods[f.i]];
      else if (j < 0 && f.r > 0) { mods.splice(f.i, 1); state.rows[f.r - 1].modules.push(f.m); }
      else if (j >= mods.length && f.r < state.rows.length - 1) { mods.splice(f.i, 1); state.rows[f.r + 1].modules.unshift(f.m); }
      break;
    }
    case 'dup': {
      const copy = { ...clone(f.m), id: uid() };
      mods.splice(f.i + 1, 0, copy);
      selected = copy.id;
      break;
    }
    case 'insert-gap': mods.splice(f.i, 0, newModule({ type: 'vide' })); break;
    case 'del': mods.splice(f.i, 1); selected = null; break;
    default: return;
  }
  commit();
  renderPanel(); renderProps();
}

// Glisser-déposer
let dragId = null;
function setupDnD() {
  const host = $('#panel');
  host.addEventListener('dragstart', (e) => {
    const lbl = e.target.closest('.lbl[data-id]');
    if (!lbl) return;
    dragId = lbl.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    lbl.classList.add('is-dragging');
  });
  host.addEventListener('dragend', () => { dragId = null; $$('.is-dragging, .drop-before, .drop-end', host).forEach((x) => x.classList.remove('is-dragging', 'drop-before', 'drop-end')); });
  host.addEventListener('dragover', (e) => {
    if (!dragId) return;
    const strip = e.target.closest('.strip');
    if (!strip) return;
    e.preventDefault();
    $$('.drop-before, .drop-end', host).forEach((x) => x.classList.remove('drop-before', 'drop-end'));
    const lbl = e.target.closest('.lbl[data-id]');
    if (lbl) lbl.classList.add('drop-before'); else strip.classList.add('drop-end');
  });
  host.addEventListener('drop', (e) => {
    if (!dragId) return;
    const strip = e.target.closest('.strip');
    if (!strip) return;
    e.preventDefault();
    const lbl = e.target.closest('.lbl[data-id]');
    moveModule(dragId, +strip.dataset.row, lbl ? lbl.dataset.id : null);
  });
}

// ---------------------------------------------------------------------------
// Numérotation automatique
// ---------------------------------------------------------------------------
function autoNumber() {
  if (!confirm('Renuméroter tous les repères (Q1, Q2… et ID1, ID2… pour les différentiels) ?')) return;
  let q = 0; let id = 0; let p = 0; let k = 0;
  for (const row of state.rows) for (const m of row.modules) {
    if (m.type === 'vide') continue;
    if (m.type === 'diff') m.repere = 'ID' + (++id);
    else if (m.type === 'parafoudre') m.repere = 'F' + (++p);
    else if (['contacteur', 'telerupteur', 'minuterie'].includes(m.type)) m.repere = 'KM' + (++k);
    else m.repere = 'Q' + (++q);
  }
  commit(); renderPanel(); renderProps();
  toast('Repères renumérotés.');
}

// ---------------------------------------------------------------------------
// Partage par lien (JSON compressé dans l'ancre de l'URL)
// ---------------------------------------------------------------------------
function compactState() {
  // retire les id et les champs vides pour raccourcir le lien
  return {
    t: state.title,
    s: state.settings,
    r: state.rows.map((row) => ({ n: row.slots, m: row.modules.map(({ id, ...m }) => Object.fromEntries(Object.entries(m).filter(([, v]) => v !== '' && v != null))) })),
  };
}
function expandState(c) {
  return { title: c.t, settings: c.s, rows: (c.r || []).map((row) => ({ slots: row.n, modules: row.m || [] })) };
}
const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

async function encodeShare() {
  const json = new TextEncoder().encode(JSON.stringify(compactState()));
  if ('CompressionStream' in window) {
    const buf = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer();
    return 'z=' + b64url(new Uint8Array(buf));
  }
  return 'j=' + b64url(json);
}
async function decodeShare(hash) {
  const m = hash.match(/^#?(z|j)=(.+)$/);
  if (!m) return null;
  let bytes = unb64url(m[2]);
  if (m[1] === 'z') {
    const buf = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer();
    bytes = new Uint8Array(buf);
  }
  return expandState(JSON.parse(new TextDecoder().decode(bytes)));
}

async function shareLink() {
  const url = location.origin + location.pathname + '#' + await encodeShare();
  try { await navigator.clipboard.writeText(url); toast('Lien copié dans le presse-papiers.'); }
  catch { prompt('Copiez ce lien :', url); }
}

// ---------------------------------------------------------------------------
// Import / export / tableaux enregistrés
// ---------------------------------------------------------------------------
function download(name, content, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const slug = (s) => (s || 'tableau').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

function exportJson() {
  download(slug(state.title) + '.json', JSON.stringify({ app: 'etiquettes-tableau', version: 1, ...state }, null, 2), 'application/json');
}
function exportCsv() {
  const colors = colorMap();
  const lines = [['Rangée', 'Position', 'Repère', 'Type', 'Circuit', 'Emplacement', 'Calibre', 'Largeur', 'Protégé par', 'Couleur']];
  state.rows.forEach((row, r) => {
    let pos = 1;
    for (const m of row.modules) {
      const d = NO_DIFF.has(m.type) ? null : protectingDiff(state, m.id);
      lines.push([r + 1, pos, m.repere, TYPES[m.type], moduleLabel(m), m.location, m.calibre, m.width, d ? (d.repere || d.label || 'ID') : '', colors.get(m.id)]);
      pos += +m.width || 1;
    }
  });
  const csv = lines.map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  download(slug(state.title) + '.csv', '﻿' + csv, 'text/csv');
}
function importJson(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const data = JSON.parse(rd.result);
      if (!Array.isArray(data.rows)) throw new Error('format');
      loadState(data);
      toast(`« ${state.title} » importé.`);
    } catch { alert("Ce fichier n'est pas un tableau valide."); }
  };
  rd.readAsText(file);
}

function savedList() { return store(STORE_SAVED) || {}; }
function renderSaved() {
  const list = savedList();
  const keys = Object.keys(list).sort((a, b) => (list[b].savedAt || 0) - (list[a].savedAt || 0));
  $('#saved-list').innerHTML = keys.length ? keys.map((k) => `<li>
      <button class="link" data-act="open" data-k="${esc(k)}">${esc(k)}</button>
      <small>${new Date(list[k].savedAt).toLocaleString('fr-FR')} · ${list[k].rows.length} rangée(s)</small>
      <button class="icon-btn danger" data-act="remove" data-k="${esc(k)}" title="Supprimer">✕</button></li>`).join('')
    : '<li class="hint">Aucun tableau enregistré dans ce navigateur.</li>';
}
function saveCurrent() {
  const list = savedList();
  const name = (state.title || 'Mon tableau').trim();
  if (list[name] && !confirm(`Remplacer l'enregistrement « ${name} » ?`)) return;
  list[name] = { ...clone(state), savedAt: Date.now() };
  store(STORE_SAVED, list);
  renderSaved();
  toast(`« ${name} » enregistré dans ce navigateur.`);
}

// ---------------------------------------------------------------------------
// Impression
// ---------------------------------------------------------------------------
const PAGE = { portrait: [210, 297], landscape: [297, 210] };
const MARGIN = 10;

function buildPrint() {
  const s = state.settings;
  const k = s.scale / 100;
  const widest = Math.max(...state.rows.map((r) => Math.max(r.slots, usedSlots(r)))) * s.pitch * k;
  let orient = s.orientation;
  if (orient === 'auto') orient = widest <= PAGE.portrait[0] - 2 * MARGIN ? 'portrait' : 'landscape';
  const usable = PAGE[orient][0] - 2 * MARGIN;
  $('#page-style').textContent = `@page{size:A4 ${orient};margin:${MARGIN}mm}`;

  const colors = colorMap();
  let html = s.printTitle ? `<h1 class="p-title">${esc(state.title)}</h1>` : '';
  state.rows.forEach((row, r) => {
    // découpe de la rangée en morceaux qui tiennent dans la largeur imprimable
    const units = [...row.modules.map((m) => ({ m, w: (+m.width || 1) * s.pitch * k }))];
    const free = row.slots - usedSlots(row);
    for (let i = 0; i < free; i++) units.push({ m: null, w: s.pitch * k });
    const chunks = [[]];
    let acc = 0;
    for (const u of units) {
      if (acc + u.w > usable + 0.01 && chunks.at(-1).length) { chunks.push([]); acc = 0; }
      chunks.at(-1).push(u); acc += u.w;
    }
    chunks.forEach((ch, ci) => {
      let inner = ''; let empties = 0;
      const flush = () => { if (empties) { inner += emptyHtml(empties, k); empties = 0; } };
      for (const u of ch) { if (u.m) { flush(); inner += labelHtml(u.m, colors, k); } else empties++; }
      flush();
      html += `<div class="p-strip-block"><div class="p-caption">Rangée ${r + 1}${chunks.length > 1 ? ` — partie ${ci + 1}/${chunks.length} (à raccorder)` : ''}</div>
        <div class="strip p-strip${s.separators ? ' sep' : ''}">${inner}</div></div>`;
    });
  });
  if (s.printRuler) {
    html += `<div class="p-ruler"><div class="p-ruler-bar" style="width:${100 * k}mm"></div>
      <span>Contrôle d'échelle : cette barre doit mesurer ${100 * k} mm (échelle ${s.scale} %). Sinon, imprimez à « taille réelle / 100 % » ou corrigez l'échelle.</span></div>`;
  }
  if (s.printNomenclature) {
    const rows = [];
    state.rows.forEach((row, r) => {
      let pos = 1;
      for (const m of row.modules) {
        if (m.type !== 'vide') {
          const d = NO_DIFF.has(m.type) ? null : protectingDiff(state, m.id);
          rows.push(`<tr><td><i style="background:${colors.get(m.id)}"></i>${esc(m.repere)}</td><td>${r + 1}.${pos}</td><td>${esc(TYPES[m.type])}</td>
            <td>${esc(moduleLabel(m))}</td><td>${esc(m.location)}</td><td>${esc(m.calibre)}</td><td>${d ? esc(d.repere || d.label || 'ID') : ''}</td></tr>`);
        }
        pos += +m.width || 1;
      }
    });
    html += `<table class="p-nomenclature"><thead><tr><th>Repère</th><th>Pos.</th><th>Appareil</th><th>Circuit</th><th>Emplacement</th><th>Calibre</th><th>Protégé par</th></tr></thead>
      <tbody>${rows.join('')}</tbody></table>`;
  }
  html += `<p class="p-foot">Généré avec Étiquettes tableau électrique — ${new Date().toLocaleDateString('fr-FR')}</p>`;
  const root = $('#print');
  root.innerHTML = html;
  fitTexts(root);
}

function doPrint() { buildPrint(); window.print(); }

// ---------------------------------------------------------------------------
// Divers
// ---------------------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

function applyTheme() {
  if (ui.theme === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = ui.theme;
}

function renderTemplates() {
  $('#tpl-list').innerHTML = TEMPLATES.map((t, i) => `<li><button data-tpl="${i}">
    <strong>${esc(t.name)}</strong><small>${esc(t.desc)}</small></button></li>`).join('');
}

function init() {
  applyTheme();
  $('#dl-calibres').innerHTML = CALIBRES.map((c) => `<option value="${c}">`).join('');
  $('#dl-locations').innerHTML = ['Entrée', 'Séjour', 'Salon', 'Cuisine', 'Chambre 1', 'Chambre 2', 'Chambre 3', 'Bureau', 'Salle de bain', 'WC', 'Buanderie', 'Garage', 'Cellier', 'Extérieur', 'Jardin', 'Combles', 'Sous-sol', 'Étage', 'Rez-de-chaussée']
    .map((c) => `<option value="${c}">`).join('');
  renderTemplates();

  $('#panel').addEventListener('click', onPanelClick);
  $('#panel').addEventListener('change', onPanelInput);
  $('#props').addEventListener('input', onPropsInput);
  $('#props').addEventListener('change', (e) => { if (e.target.dataset.field || e.target.dataset.act === 'color-custom') commit(); });
  $('#props').addEventListener('click', onPropsClick);
  setupDnD();

  $('#doc-title').addEventListener('input', (e) => { state.title = e.target.value; commit(false); });
  for (const el of $$('[data-setting]')) {
    el.addEventListener(el.type === 'number' ? 'change' : 'input', () => {
      const k = el.dataset.setting;
      let v = el.type === 'checkbox' ? el.checked : el.type === 'number' ? parseFloat(el.value) : el.value;
      if (el.type === 'number') {
        const min = parseFloat(el.min); const max = parseFloat(el.max);
        if (!Number.isFinite(v)) v = defaultSettings()[k];
        v = Math.min(max, Math.max(min, v));
        el.value = v;
      }
      state.settings[k] = v;
      commit(); renderPanel();
    });
  }
  $('#checks').addEventListener('click', (e) => {
    const li = e.target.closest('[data-goto]');
    if (!li) return;
    select(li.dataset.goto);
    $(`#panel .lbl[data-id="${li.dataset.goto}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  });

  $('#btn-add-row').addEventListener('click', () => { state.rows.push({ slots: state.rows.at(-1)?.slots || 13, modules: [] }); commit(); renderPanel(); });
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-redo').addEventListener('click', redo);
  $('#btn-print').addEventListener('click', doPrint);
  $('#btn-share').addEventListener('click', shareLink);
  $('#btn-number').addEventListener('click', autoNumber);
  $('#btn-export').addEventListener('click', exportJson);
  $('#btn-csv').addEventListener('click', exportCsv);
  $('#btn-import').addEventListener('click', () => $('#file-import').click());
  $('#file-import').addEventListener('change', (e) => { if (e.target.files[0]) importJson(e.target.files[0]); e.target.value = ''; });
  $('#btn-new').addEventListener('click', () => { renderTemplates(); $('#dlg-templates').showModal(); });
  $('#tpl-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tpl]');
    if (!b) return;
    if (state.rows.some((r) => r.modules.length) && !confirm('Remplacer le tableau en cours ? (il reste récupérable avec « Annuler »)')) return;
    const prev = lastSnapshot;
    loadState(TEMPLATES[+b.dataset.tpl].build(), { resetHistory: false });
    undoStack.push(prev); redoStack = []; updateHistoryButtons();
    $('#dlg-templates').close();
  });
  $('#btn-saved').addEventListener('click', () => { renderSaved(); $('#dlg-saved').showModal(); });
  $('#btn-save').addEventListener('click', saveCurrent);
  $('#saved-list').addEventListener('click', (e) => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const list = savedList();
    if (b.dataset.act === 'open' && list[b.dataset.k]) {
      const prev = lastSnapshot;
      loadState(list[b.dataset.k], { resetHistory: false });
      undoStack.push(prev); updateHistoryButtons();
      $('#dlg-saved').close();
    } else if (b.dataset.act === 'remove' && confirm(`Supprimer « ${b.dataset.k} » ?`)) {
      delete list[b.dataset.k]; store(STORE_SAVED, list); renderSaved();
    }
  });
  for (const d of $$('dialog')) d.addEventListener('click', (e) => { if (e.target === d || e.target.closest('[data-close]')) d.close(); });

  $('#zoom').addEventListener('input', (e) => {
    ui.zoom = +e.target.value / 100;
    $('#zoom-val').textContent = e.target.value + ' %';
    $('#panel').style.setProperty('--zoom', ui.zoom);
    store(STORE_UI, ui);
  });
  $('#btn-theme').addEventListener('click', () => {
    ui.theme = { auto: 'dark', dark: 'light', light: 'auto' }[ui.theme] || 'auto';
    applyTheme(); store(STORE_UI, ui);
    toast('Thème : ' + { auto: 'automatique', dark: 'sombre', light: 'clair' }[ui.theme]);
  });

  window.addEventListener('beforeprint', buildPrint);
  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !typing) { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !typing) { e.preventDefault(); redo(); }
    else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') { e.preventDefault(); doPrint(); }
    else if (!typing && selected && (e.key === 'Delete' || e.key === 'Backspace')) {
      const f = findModule(selected);
      if (f) { state.rows[f.r].modules.splice(f.i, 1); selected = null; commit(); renderPanel(); renderProps(); }
    } else if (!typing && selected && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      const f = findModule(selected);
      if (!f) return;
      const all = state.rows.flatMap((r) => r.modules);
      const i = all.findIndex((m) => m.id === selected) + (e.key === 'ArrowLeft' ? -1 : 1);
      if (all[i]) select(all[i].id);
    } else if (e.key === 'Escape' && selected && !typing) select(null);
  });
}

async function boot() {
  init();
  let loaded = false;
  if (location.hash.length > 3) {
    try {
      const s = await decodeShare(location.hash);
      if (s) { loadState(s); loaded = true; toast('Tableau chargé depuis le lien.'); }
    } catch { toast('Lien invalide ou incomplet.'); }
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (!loaded) {
    const saved = store(STORE_CURRENT);
    if (saved && Array.isArray(saved.rows)) loadState(saved); else loadState(TEMPLATES[0].build());
  }
  if (!storedUi?.zoom) fitZoom();
}

// Zoom initial : la rangée la plus large tient dans la largeur disponible.
function fitZoom() {
  const wrap = $('#panel .strip-wrap');
  if (!wrap) return;
  const widest = Math.max(...state.rows.map((r) => Math.max(r.slots, usedSlots(r)))) * state.settings.pitch * 96 / 25.4;
  ui.zoom = Math.max(0.4, Math.min(1.5, Math.floor((wrap.clientWidth - 8) / widest * 10) / 10));
  $('#zoom').value = Math.round(ui.zoom * 100);
  $('#zoom-val').textContent = Math.round(ui.zoom * 100) + ' %';
  $('#panel').style.setProperty('--zoom', ui.zoom);
}

boot();
