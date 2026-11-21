# WikiTUBE — produire et programmer un épisode (procédure validée le 21/11/2026)

Branche de travail : `test-gemini-web` (pas `main`). Fichiers vérifiés : branche `release-assets`. Rien n'est automatique : sans cette procédure, la chaîne s'arrête quand le stock est épuisé.

Rythme décidé : 1 long par jour à 17 h 30 (Paris), son Short à 18 h, un 2e Short à 12 h 30 (alternance « tip » / « mistake »). Garder au moins 3 jours programmés d'avance. Ordre des sujets : formats photo (maison, cuisine) d'abord ; voir la fiche mémoire WikiTUBE.

## 1. Plan d'images (`scripts/tools/episodes/<sujet>.py`)
- Modèle : `glass_stovetop.py`, `chicken_breast.py`, `oven_door_glass.py` (une image par phrase via `_auto.pair`).
- `TAIL` fixe le décor et la tenue (une couleur de chemise par épisode, mains seules, pas de visage, « No text, no letters… »).
- Lire le script phrase par phrase et vérifier que l'image n° j illustre bien la phrase n° j (erreur classique : décalage d'un cran).
- `python3 scripts/tools/episodes/<sujet>.py` écrit `data/shots/<id>/shots.json` et `/tmp/<id>-missing.json`.

## 2. Annotations (`<sujet>.notes.json`)
- `extras.intro` : schéma + 5 encarts, dans l'ordre où les mots sont dits dans l'intro.
- Par étape : `ticks`, `facts` (chiffres dits par la voix uniquement), `cards` (« Avoid » = chose à ne pas faire, jamais une consigne positive), `gags`, `diagrams`. Le mot `on` doit être dans la phrase du plan.
- Ne jamais mettre une flèche ou un cercle sur un plan qui porte aussi un schéma (le panneau les coupe).
- Coordonnées des flèches : fractions de l'image d'origine. Les relever sur l'image recadrée, pas sur une image de la vidéo (le travelling décale tout).
- Schéma animé dédié dans `src/components/stage.tsx` (voir `GlassCooktop`, `ChickenPan`, `OvenDoor`), à déclarer dans `DIAGRAMS`.
- 2e Short : champ `short2` dans `data/queue/<id>.json` + image verticale `short2-hook.jpg`.

## 3. Images Gemini (navigateur Playwright du PC, compte pierreeloi.web, sans API)
- Ouvrir son propre onglet. Pour chaque image : `https://gemini.google.com/app`, saisir `Generate an image: <prompt> <TAIL>`, attendre `img.image.loaded`, bouton « taille réelle », `download.saveAs` vers `C:\Users\pierr\Desktop\CLAUDE\wikitube-shots\<sujet>\<nom>.jpg`.
- Environ 20 s par image. L'appel dépasse le délai de réponse (80 s) mais continue sur le PC : suivre l'avancement en listant le dossier, relancer seulement les fichiers manquants.
- Le dossier `wikitube-shots` doit être connecté à la session pour rapatrier les fichiers (une demande d'accès automatique peut être refusée : le dire à Pierre-Éloi).
- Recadrer en 1920×1080 (image verticale : 1296×2322), faire des planches-contact et regarder chaque image ; refaire celles qui contredisent la phrase.
- Clips animés (« Créer une vidéo ») : 2 par jour au plus ; le quota peut être déjà consommé, auquel cas l'épisode part sans clip.

## 4. Rendu (GitHub Actions)
- `gh workflow run daily.yml --ref test-gemini-web -f date=<date de l'épisode> -f skip_upload=true` (19 min environ ; la voix est en cache quand on relance). `-f only=long` pour ne refaire que le long.
- Les artefacts ne sont pas téléchargeables depuis le cloud : `gh workflow run preview-branch.yml --ref test-gemini-web -f run_id=<id>` une fois le rendu terminé, puis cloner la branche `preview` (elle est écrasée à chaque fois).

## 5. Contrôle (obligatoire avant toute programmation)
- `qc.json` : `passed: true`, durée 8 à 10 min, −14 LUFS.
- Extraire une image à chaque encart, flèche et schéma (instants lus dans `timeline-long.json`) + 6 images par Short. Vérifier : aucun texte superposé ou coupé, flèches sur la bonne cible, titre d'ouverture non masqué par la mascotte (40 caractères au plus, champ `title` de l'épisode).
- Corriger, relancer `only=long`, recontrôler les endroits modifiés.

## 6. Titre et miniature
- Titre YouTube (`metadata.title`) : « How to + requête exacte (enjeu) », 2 ou 3 variantes notées avec `vidiq_score_title`, garder la meilleure.
- Miniature : entrée dans `publish/thumbs.json` + photo dans `public/thumbs/`, `node scripts/tools/thumbpro.mjs --only <mot>`, la regarder.

## 7. Programmation
- Copier dans `release-assets` : `<id>/out/` (long.mp4.part-*, short.mp4, short2.mp4, long.en.srt, short.en.srt, thumbnail.jpg = miniature ThumbPro) et `<id>/build/` (metadata.json, qc.json). Pousser.
- Ajouter `{ "id", "publishAt": "<jour>T16:30:00Z", "short2At": "<jour>T11:30:00Z" }` à `publish/queue.json` et pousser : le workflow « Mise en ligne des épisodes vérifiés » programme les trois vidéos.
- Vérifier `data/published.json` et, côté YouTube, les trois vidéos en privé avec leur date (vidIQ `vidiq_user_videos`, statut `private`).
