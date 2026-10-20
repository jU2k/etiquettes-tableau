// Contrôles indicatifs inspirés de la NF C 15-100. Ils ne remplacent ni la norme ni un professionnel.

const NO_DIFF_NEEDED = new Set(['diff', 'general', 'parafoudre', 'vide', 'bornier']);

// Différentiel qui protège un module : le dernier interrupteur différentiel rencontré
// avant lui, en lisant le tableau rangée par rangée, de gauche à droite.
export function protectingDiff(state, id) {
  let current = null;
  for (const row of state.rows) for (const m of row.modules) {
    if (m.id === id) return m.type === 'diff' ? null : current;
    if (m.type === 'diff') current = m;
  }
  return null;
}

const amps = (s) => { const m = String(s || '').match(/(\d+(?:[.,]\d+)?)\s*A(?![a-z])/i); return m ? parseFloat(m[1].replace(',', '.')) : null; };
const diffType = (s) => {
  const m = String(s || '').toUpperCase().match(/(?:TYPE\s*)?\b(AC|A|F|B|S|HPI|SI)\s*$/) || String(s || '').toUpperCase().match(/TYPE\s*(AC|A|F|B)/);
  return m ? m[1] : null;
};
const has = (m, keys, words) => keys.includes(m.icon) || words.test(`${m.label} ${m.location}`);

export function runChecks(state, TYPES) {
  const out = [];
  const name = (m) => [m.repere, m.label || TYPES[m.type]].filter(Boolean).join(' ');

  state.rows.forEach((row, r) => {
    const used = row.modules.reduce((a, m) => a + (+m.width || 1), 0);
    if (used > row.slots) out.push({ level: 'error', msg: `Rangée ${r + 1} : ${used} modules pour ${row.slots} emplacements.` });
  });

  const groups = new Map();
  let current = null;
  let seenAnyDiff = false;
  for (const row of state.rows) for (const m of row.modules) {
    if (m.type === 'diff') { current = m; seenAnyDiff = true; groups.set(m, []); continue; }
    if (m.type === 'disj' && current) groups.get(current).push(m);
    if (!current && !NO_DIFF_NEEDED.has(m.type) && m.type === 'disj') {
      out.push({ level: 'warn', id: m.id, msg: `${name(m) || 'Disjoncteur'} : aucun différentiel 30 mA en amont dans le tableau.` });
    }

    const a = amps(m.calibre);
    if (m.type === 'disj' && a != null) {
      if (has(m, ['eclairage', 'lampadaire'], /éclairage|eclairage|lumi[eè]re/i) && a > 16) out.push({ level: 'warn', id: m.id, msg: `${name(m)} : éclairage protégé en ${a} A (16 A max).` });
      if (has(m, ['prise'], /prise/i) && a > 20) out.push({ level: 'warn', id: m.id, msg: `${name(m)} : prises protégées en ${a} A (16 ou 20 A).` });
    }
    if (m.type === 'disj' && current) {
      const t = diffType(current.calibre);
      if (has(m, ['plaque', 'lavelinge', 'bornve'], /plaque|cuisson|lave[- ]linge|borne|irve|recharge/i) && t === 'AC') {
        out.push({ level: 'warn', id: m.id, msg: `${name(m)} : doit être sous un différentiel de type A (ou F/B), pas AC.` });
      }
    }
  }

  for (const [d, list] of groups) {
    if (list.length > 8) out.push({ level: 'warn', id: d.id, msg: `${name(d) || 'Différentiel'} : ${list.length} circuits en aval (8 maximum conseillés).` });
    if (!list.length) out.push({ level: 'info', id: d.id, msg: `${name(d) || 'Différentiel'} : aucun disjoncteur après lui.` });
  }

  const ids = [...groups.keys()];
  if (seenAnyDiff && !ids.some((d) => ['A', 'F', 'B'].includes(diffType(d.calibre)))) {
    out.push({ level: 'warn', msg: 'Aucun différentiel de type A : obligatoire pour plaque de cuisson et lave-linge.' });
  }

  const reperes = new Map();
  for (const row of state.rows) for (const m of row.modules) {
    if (!m.repere) continue;
    if (reperes.has(m.repere)) out.push({ level: 'info', id: m.id, msg: `Repère « ${m.repere} » utilisé plusieurs fois.` });
    reperes.set(m.repere, m);
  }
  return out;
}
