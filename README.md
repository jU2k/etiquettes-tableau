# Étiquettes pour tableau électrique

Application web, sans installation ni compte, pour créer et **imprimer à l'échelle** les étiquettes d'un tableau électrique.

👉 **En ligne : https://ju2k.github.io/etiquettes-tableau/**

Auteur : jU2k

## Fonctionnalités

- **Éditeur visuel** : rangées de 13, 18 modules ou plus, modules de 1 à 6 de large, glisser-déposer (y compris d'une rangée à l'autre), annuler / rétablir.
- **Étiquettes complètes** : icône, circuit, pièce, repère (Q1, ID1…), calibre (16A, 40A 30mA A…).
- **Couleur automatique par différentiel** : chaque interrupteur différentiel colore les disjoncteurs qu'il protège. Couleur manuelle possible.
- **Plus de 50 icônes** (électroménager, chauffage, VMC, photovoltaïque, batterie, borne VE, réseau, appareillage…), avec recherche.
- **Impression au millimètre** : largeur de module et hauteur réglables (17,5 / 18 mm…), échelle de correction, barre de contrôle de 100 mm, orientation automatique, rangées trop longues coupées en morceaux à raccorder.
- **Nomenclature des circuits** imprimée sous les étiquettes et exportable en CSV.
- **Contrôles indicatifs NF C 15-100** : plus de 8 circuits par différentiel, plaque / lave-linge / borne VE sous un différentiel de type AC, éclairage > 16 A, prises > 20 A, circuits sans différentiel, rangée trop remplie, repères en double.
- **Numérotation automatique** des repères.
- **Sauvegarde** : automatique dans le navigateur, plusieurs tableaux enregistrés, export / import JSON, **lien de partage** compressé contenant tout le tableau.
- **Modèles** : tableaux vides 13 ou 18 modules, maison type pré-remplie, coffret photovoltaïque.
- Thème clair / sombre, utilisable sur mobile.

## Imprimer correctement

1. Mesurez la largeur d'un module de votre tableau (17,5 mm en DIN, pas de 18 mm sur la plupart des marques) et la hauteur de la fenêtre porte-étiquette.
2. Dans la boîte d'impression, choisissez **« Taille réelle » / « 100 % »**, jamais « Ajuster à la page ».
3. Mesurez la barre de contrôle : si elle ne fait pas 100 mm, corrigez l'« Échelle d'impression » (ex. 98 mm mesurés → 102 %).

## Utilisation locale

Aucune dépendance ni compilation : ouvrez le dossier avec n'importe quel serveur web statique.

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Avertissement

Les contrôles sont **indicatifs** et ne remplacent ni la norme NF C 15-100 ni un électricien qualifié.

## Crédits

Idée inspirée du projet [etiquettes-tableau-electrique](https://github.com/qlefevre/etiquettes-tableau-electrique) de qlefevre. Le code et les icônes de ce dépôt sont entièrement réécrits.

## Licence

MIT — voir [LICENSE](LICENSE).
