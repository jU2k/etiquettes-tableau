// Modèles de départ. Les données des modules sont volontairement compactes : [type, largeur, icône, libellé, emplacement, calibre].
const M = (type, width, icon, label = '', location = '', calibre = '') => ({ type, width, icon, label, location, calibre });
// Repères Q1, Q2… / ID1… / F1… / KM1… dans l'ordre du tableau.
function numbered(st) {
  const n = { Q: 0, ID: 0, F: 0, KM: 0 };
  const prefix = { diff: 'ID', parafoudre: 'F', contacteur: 'KM', telerupteur: 'KM', minuterie: 'KM' };
  for (const row of st.rows) for (const m of row.modules) {
    if (m.type === 'vide' || m.type === 'autre') continue;
    const p = prefix[m.type] || 'Q';
    m.repere = p + (++n[p]);
  }
  return st;
}
const empty = (rows, slots) => () => ({ title: 'Mon tableau', rows: Array.from({ length: rows }, () => ({ slots, modules: [] })) });

const exemple = () => numbered({
  title: 'Maison — exemple',
  rows: [
    { slots: 13, modules: [
      M('diff', 2, '', 'Différentiel 1', '', '40A 30mA AC'),
      M('disj', 1, 'eclairage', 'Éclairage', 'Séjour', '10A'),
      M('disj', 1, 'eclairage', 'Éclairage', 'Chambres', '10A'),
      M('disj', 1, 'prise', 'Prises', 'Séjour', '16A'),
      M('disj', 1, 'prise', 'Prises', 'Chambres', '16A'),
      M('disj', 1, 'prise', 'Prises', 'Bureau', '16A'),
      M('disj', 1, 'volet', 'Volets roulants', '', '16A'),
      M('disj', 1, 'vmc', 'VMC', '', '2A'),
      M('contacteur', 1, '', 'Contacteur HP/HC', '', '20A'),
      M('disj', 1, 'chauffeeau', 'Chauffe-eau', 'Cellier', '20A'),
    ] },
    { slots: 13, modules: [
      M('diff', 2, '', 'Différentiel 2', '', '40A 30mA A'),
      M('disj', 1, 'plaque', 'Plaque de cuisson', 'Cuisine', '32A'),
      M('disj', 1, 'four', 'Four', 'Cuisine', '20A'),
      M('disj', 1, 'lavelinge', 'Lave-linge', 'Buanderie', '20A'),
      M('disj', 1, 'lavevaisselle', 'Lave-vaisselle', 'Cuisine', '20A'),
      M('disj', 1, 'sechelinge', 'Sèche-linge', 'Buanderie', '20A'),
      M('disj', 1, 'prise', 'Prises plan de travail', 'Cuisine', '20A'),
      M('disj', 1, 'congelateur', 'Congélateur', 'Garage', '20A'),
      M('disj', 1, 'eclairage', 'Éclairage', 'Cuisine', '10A'),
    ] },
    { slots: 13, modules: [
      M('diff', 2, '', 'Différentiel 3', '', '40A 30mA A'),
      M('disj', 1, 'clim', 'Climatisation', 'Séjour', '16A'),
      M('disj', 1, 'prise', 'Prises', 'Extérieur', '16A'),
      M('disj', 1, 'lampadaire', 'Éclairage ext.', 'Jardin', '10A'),
      M('disj', 1, 'portail', 'Portail', '', '16A'),
      M('disj', 1, 'sonnette', 'Sonnette', '', '2A'),
      M('disj', 1, 'box', 'Box / réseau', 'Entrée', '16A'),
      M('disj', 1, 'hotte', 'Hotte', 'Cuisine', '16A'),
      M('parafoudre', 2, '', 'Parafoudre', '', 'Type 2'),
    ] },
  ],
});

const solaire = () => numbered({
  title: 'Coffret photovoltaïque',
  rows: [
    { slots: 13, modules: [
      M('general', 2, 'disjoncteur', 'Sectionneur réseau', '', '63A'),
      M('autre', 1, 'compteur', 'Compteur EM24', '', ''),
      M('diff', 2, '', 'Différentiel AC-IN', '', '63A 30mA A'),
      M('autre', 3, 'onduleur', 'Inverseur EDF / Solaire', '', '63A'),
      M('disj', 2, 'onduleur', 'Sortie onduleur AC-OUT', '', '40A'),
      M('parafoudre', 2, '', 'Parafoudre AC', '', 'Type 2'),
      M('vide', 1),
    ] },
    { slots: 13, modules: [
      M('autre', 2, 'solaire', 'Sectionneur PV 1', 'Toiture', '25A 1000V DC'),
      M('autre', 2, 'solaire', 'Sectionneur PV 2', 'Toiture', '25A 1000V DC'),
      M('parafoudre', 2, '', 'Parafoudre DC', '', 'Type 2 DC'),
      M('autre', 2, 'batterie', 'Coupe-batterie', '', '48V DC'),
      M('autre', 2, 'electricite', 'Contrôleur d’isolement', '', 'CPI'),
    ] },
  ],
});

export const TEMPLATES = [
  { name: 'Exemple : maison T4', desc: '3 rangées de 13 modules, pré-remplies (3 différentiels, circuits courants)', build: exemple },
  { name: '1 rangée × 13 modules', desc: 'Petit coffret ou tableau divisionnaire', build: empty(1, 13) },
  { name: '2 rangées × 13 modules', desc: 'Tableau 26 modules', build: empty(2, 13) },
  { name: '3 rangées × 13 modules', desc: 'Tableau 39 modules (format le plus courant)', build: empty(3, 13) },
  { name: '4 rangées × 13 modules', desc: 'Tableau 52 modules', build: empty(4, 13) },
  { name: '2 rangées × 18 modules', desc: 'Tableau 36 modules (rangées de 18)', build: empty(2, 18) },
  { name: '3 rangées × 18 modules', desc: 'Tableau 54 modules (rangées de 18)', build: empty(3, 18) },
  { name: '4 rangées × 18 modules', desc: 'Tableau 72 modules (rangées de 18)', build: empty(4, 18) },
  { name: 'Coffret photovoltaïque', desc: 'Exemple de coffret AC/DC pour une installation solaire avec batterie', build: solaire },
];
