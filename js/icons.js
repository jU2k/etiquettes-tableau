// Jeu d'icônes original (SVG 24×24, trait), sous licence MIT comme le reste du projet.
// Chaque entrée : [libellé affiché, catégorie, contenu SVG].
export const ICONS = {
  // Pièces / usages
  prise:        ['Prises', 'Usages', '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="12" r="1.3"/><circle cx="15.5" cy="12" r="1.3"/><path d="M12 3v3"/>'],
  eclairage:    ['Éclairage', 'Usages', '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.6 1 2.5h6c0-.9.2-1.7 1-2.5A6 6 0 0 0 12 3z"/>'],
  lampadaire:   ['Éclairage ext.', 'Usages', '<path d="M8 22h8M12 22V9M7 9h10l-2-5H9z"/>'],
  interrupteur: ['Interrupteur', 'Usages', '<rect x="5" y="3" width="14" height="18" rx="2"/><rect x="9" y="7" width="6" height="10" rx="1"/><path d="M9 10h6"/>'],
  chambre:      ['Chambre', 'Usages', '<path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="2"/>'],
  sdb:          ['Salle de bain', 'Usages', '<path d="M4 21V6a3 3 0 0 1 6 0M8 6h4M13 11v.01M16 12v.01M13 15v.01M16 16v.01M19 13v.01"/>'],
  maison:       ['Maison', 'Usages', '<path d="M3 11l9-7 9 7M5 9.5V20h5v-6h4v6h5V9.5"/>'],
  garage:       ['Garage', 'Usages', '<path d="M3 21V9l9-6 9 6v12M7 21v-9h10v9M7 15h10M7 18h10"/>'],
  exterieur:    ['Extérieur', 'Usages', '<path d="M12 22v-7M12 15l-3-2M12 14l3-2M12 2a6 6 0 0 0-6 6c-2 .5-3 2-3 4a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4c0-2-1-3.5-3-4a6 6 0 0 0-6-6z"/>'],
  // Cuisine / électroménager
  four:         ['Four', 'Électroménager', '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M7 5.5h.01M10 5.5h.01M17 5.5h-3"/><rect x="6" y="11" width="12" height="7" rx="1"/>'],
  plaque:       ['Plaque de cuisson', 'Électroménager', '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.3" r="2.3"/><circle cx="15.5" cy="9.3" r="2.3"/><circle cx="8.5" cy="15.3" r="1.8"/><circle cx="15.5" cy="15.3" r="1.8"/>'],
  hotte:        ['Hotte', 'Électroménager', '<path d="M9 3h6v6l6 5H3l6-5zM3 14v2h18v-2M8 19v2M12 19v2M16 19v2"/>'],
  microondes:   ['Micro-ondes', 'Électroménager', '<rect x="2" y="5" width="20" height="14" rx="2"/><rect x="5" y="8" width="10" height="8" rx="1"/><path d="M18 9v.01M18 12v.01M18 15v.01"/>'],
  lavelinge:    ['Lave-linge', 'Électroménager', '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M7 5.5h.01M10 5.5h4M9 14c1-1 2 1 3 0s2 1 3 0"/>'],
  sechelinge:   ['Sèche-linge', 'Électroménager', '<rect x="4" y="2" width="16" height="20" rx="2"/><circle cx="12" cy="13" r="5"/><path d="M7 5.5h.01M10 5.5h4M10.5 11c-.8 1 .8 2 0 3M13.5 11c-.8 1 .8 2 0 3"/>'],
  lavevaisselle:['Lave-vaisselle', 'Électroménager', '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 7h16M7 4.5h.01M10 4.5h.01M8 11h8M8 14h8M8 17h8"/>'],
  frigo:        ['Réfrigérateur', 'Électroménager', '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8 5v2M8 12v3"/>'],
  congelateur:  ['Congélateur', 'Électroménager', '<rect x="3" y="7" width="18" height="12" rx="2"/><path d="M3 11h18M7 9h3M12 13v5M10 14l4 3M14 14l-4 3"/>'],
  // Chauffage / eau / air
  chauffeeau:   ['Chauffe-eau', 'Chauffage & air', '<rect x="6" y="2" width="12" height="18" rx="5"/><path d="M9 22h6M12 7c-1.5 2-2 3-2 4a2 2 0 0 0 4 0c0-1-.5-2-2-4z"/>'],
  radiateur:    ['Radiateur', 'Chauffage & air', '<rect x="3" y="5" width="3.5" height="14" rx="1.5"/><rect x="7.5" y="5" width="3.5" height="14" rx="1.5"/><rect x="12" y="5" width="3.5" height="14" rx="1.5"/><rect x="16.5" y="5" width="3.5" height="14" rx="1.5"/><path d="M2 21h20"/>'],
  chauffage:    ['Plancher chauffant', 'Chauffage & air', '<path d="M3 20h18M6 16c0-2 2-2 2-4s-2-2-2-4M11 16c0-2 2-2 2-4s-2-2-2-4M16 16c0-2 2-2 2-4s-2-2-2-4"/>'],
  chaudiere:    ['Chaudière', 'Chauffage & air', '<path d="M12 22a7 7 0 0 0 7-7c0-4-3-6-4-10-1.5 2-2 3.5-2 5-1-1-2-2-2.5-4C8 9 5 11.5 5 15a7 7 0 0 0 7 7z"/>'],
  clim:         ['Climatisation', 'Chauffage & air', '<rect x="2" y="4" width="20" height="8" rx="2"/><path d="M5 9h14M8 15v5M12 15v6M16 15v5"/>'],
  pac:          ['Pompe à chaleur', 'Chauffage & air', '<rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="10" cy="12" r="5"/><path d="M10 7v10M5 12h10M17.5 8h1.5M17.5 11h1.5M17.5 14h1.5"/>'],
  vmc:          ['VMC', 'Chauffage & air', '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="1.5"/><path d="M12 10.5C11 7 12 5 14.5 5S16 9 13.5 11M13.5 12.5c3.5-1 5.5 0 5.5 2.5s-4 1.5-6-1M10.5 13c-1 3.5-3 4.5-5 3.5s-.5-4.5 3.5-5"/>'],
  piscine:      ['Piscine', 'Chauffage & air', '<path d="M2 18c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 21.5c2 0 2-1.5 4-1.5s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M8 15V5a2 2 0 0 1 4 0M16 15V5a2 2 0 0 1 4 0M8 9h8M8 12.5h8"/>'],
  pompe:        ['Pompe', 'Chauffage & air', '<circle cx="10" cy="13" r="6"/><path d="M10 13l3-3M16 13h6M2 13h2M10 7V3h4"/>'],
  arrosage:     ['Arrosage', 'Chauffage & air', '<path d="M12 3c-3 4.5-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-6.5-6-11z"/>'],
  // Énergie
  solaire:      ['Photovoltaïque', 'Énergie', '<path d="M4 20l2-9h12l2 9zM5 15.5h14M10.5 11l-1 9M13.5 11l1 9"/><circle cx="18" cy="5" r="2"/><path d="M18 1v.5M22 5h-.5M14 5h.5"/>'],
  batterie:     ['Batterie', 'Énergie', '<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 10v4M6 12h3M7.5 10.5v3M13 12h3"/>'],
  onduleur:     ['Onduleur', 'Énergie', '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 21L21 3M6 7.5h5M6 10h5M13 16c1-2 2-2 3 0s2 2 3 0"/>'],
  bornve:       ['Borne VE', 'Énergie', '<path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M10 7l-2 4h4l-2 4M15 9h2a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-2-2"/>'],
  compteur:     ['Compteur', 'Énergie', '<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="5" rx="1"/><path d="M8 15h.01M12 15h.01M16 15h.01M8 18h8"/>'],
  electricite:  ['Électricité', 'Énergie', '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'],
  // Réseau / sécurité
  box:          ['Box internet', 'Réseau & sécurité', '<rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 17h.01M10 17h.01M8.5 10.5a5 5 0 0 1 7 0M6 8a8.5 8.5 0 0 1 12 0"/>'],
  baie:         ['Baie réseau', 'Réseau & sécurité', '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 8h16M4 13h16M7 5.5h6M7 10.5h6M7 15.5h6M17 5.5h.01M17 10.5h.01M17 15.5h.01"/>'],
  informatique: ['Informatique', 'Réseau & sécurité', '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'],
  tv:           ['TV / multimédia', 'Réseau & sécurité', '<rect x="2" y="5" width="20" height="13" rx="2"/><path d="M7 21h10M9 2l3 3 3-3"/>'],
  domotique:    ['Domotique', 'Réseau & sécurité', '<path d="M3 11l9-7 9 7M5 9.5V20h14V9.5M9.5 15a3.5 3.5 0 0 1 5 0M12 18h.01"/>'],
  sonnette:     ['Sonnette', 'Réseau & sécurité', '<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4"/>'],
  interphone:   ['Interphone', 'Réseau & sécurité', '<rect x="6" y="2" width="12" height="20" rx="2"/><circle cx="12" cy="7" r="2"/><path d="M9 12h6M9 15h6M11 18.5h2"/>'],
  alarme:       ['Alarme', 'Réseau & sécurité', '<path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM12 8v5M12 16v.01"/>'],
  camera:       ['Caméras', 'Réseau & sécurité', '<rect x="2" y="6" width="14" height="8" rx="2"/><path d="M16 9l5-2v6l-5-2M6 14v4H3"/>'],
  volet:        ['Volets roulants', 'Réseau & sécurité', '<rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 7h18M3 11h18M3 15h18M12 18v3"/>'],
  portail:      ['Portail', 'Réseau & sécurité', '<path d="M3 21V8M21 21V8M3 10h18M3 16h18M7 10v6M11 10v6M15 10v6M19 10v6M2 8h3M19 8h3"/>'],
  // Appareillage du tableau
  disjoncteur:  ['Disjoncteur', 'Appareillage', '<rect x="7" y="2" width="10" height="20" rx="1.5"/><rect x="10" y="7" width="4" height="7" rx="1"/><path d="M10 10.5h4M12 17v2"/>'],
  differentiel: ['Différentiel', 'Appareillage', '<rect x="4" y="2" width="16" height="20" rx="1.5"/><rect x="7" y="6" width="4" height="7" rx="1"/><path d="M7 9.5h4M8 17h2M14.5 17h3"/><circle cx="16" cy="9" r="1.6"/>'],
  parafoudre:   ['Parafoudre', 'Appareillage', '<path d="M12 2v4M12 15v3M8 18h8M9.5 20h5M11 22h2"/><rect x="8" y="6" width="8" height="9" rx="1"/><path d="M13 8l-2 3h2l-2 3"/>'],
  contacteur:   ['Contacteur HP/HC', 'Appareillage', '<rect x="5" y="2" width="14" height="20" rx="1.5"/><circle cx="12" cy="10" r="4"/><path d="M12 8v2l1.5 1.5M8.5 18h7"/>'],
  telerupteur:  ['Télérupteur', 'Appareillage', '<rect x="5" y="2" width="14" height="20" rx="1.5"/><path d="M8 15h2.5l3.5-5M16 15h-2"/>'],
  minuterie:    ['Minuterie', 'Appareillage', '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M10 2h4M12 2v3"/>'],
  tableau:      ['Tableau divisionnaire', 'Appareillage', '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M7 6h.01M10 6h.01M7 12h.01M10 12h.01M13 12h.01M7 18h.01"/>'],
};

export function iconSvg(key, cls = '') {
  const def = ICONS[key];
  if (!def) return '';
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${def[2]}</svg>`;
}
