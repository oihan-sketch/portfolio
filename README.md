# Portfolio — Oihan Hargain

Site statique (HTML/CSS/JS, aucune dépendance).

## Lancer en local
```bash
python3 -m http.server 8080
```
puis ouvrir http://localhost:8080

## Modifier le contenu
Tout est dans `data.js` :
- **Photos** : une entrée par série (`slug`, `title`, `year`, `desc`, `images`). Les fichiers sont dans `assets/photos/<slug>/` (pleine taille, 2000 px) et `assets/thumbs/<slug>/` (miniatures, 800 px). `cover` (optionnel) = index de l'image de couverture.
- **Vidéos** : `id` = identifiant du fichier Google Drive (le fichier doit être partagé en « Tous les utilisateurs disposant du lien »). La miniature est `assets/videos/<id>.jpg`. `landscape: true` pour une vidéo horizontale.
- **Vidéo d'accueil** : `assets/videos/circus.mp4`.

## Mettre en ligne
Glisser le dossier sur Netlify Drop, ou pousser sur GitHub Pages / Vercel — pas de build nécessaire.
