# WikiTUBE — produire et programmer un épisode (procédure validée le 21/11/2026)

Branche de travail : `test-gemini-web` (pas `main`). Fichiers vérifiés : branche `release-assets`. Rien n'est automatique : sans cette procédure, la chaîne s'arrête quand le stock est épuisé.

Rythme décidé : 1 long par jour à 17 h 30 (Paris), son Short à 18 h, un 2e Short à 12 h 30 (alternance « tip » / « mistake »). Garder au moins 3 jours programmés d'avance. Ordre des sujets : formats photo (maison, cuisine) d'abord ; voir la fiche mémoire WikiTUBE.

## 0. Ouverture v3 (validée le 22/11/2026) — à respecter dans chaque script
Objectif : première étape avant 0 min 55 (elle arrivait à 1 min 36). `data/brand.json` → `"opening": "v3"`.
- `hook` : 40 à 50 mots. Problème, enjeu, promesse (« Seven steps… »), puis « Stay for step N: … » (N = une vraie étape clé, l'affirmation doit être tenue dans cette étape). Aucune phrase creuse.
- `hookWords` : 3 ou 4 mots forts de l'accroche, dans l'ordre du texte, pas dans la première phrase (le titre est à l'écran).
- `intro` : 45 à 55 mots, les consignes de sécurité restent. Les mots `on` des encarts du schéma doivent y figurer, sinon l'encart disparaît.
- `youNeedNarration` : 25 à 32 mots, les objets dans l'ordre de `youNeed`.
- Accroche « bande-annonce » (v4, `"hookStyle": "trailer"`), automatique et calée sur la voix : 1. le problème (image d'erreur n° 1, zoom par à-coups, titre) ; 2. le résultat à la 2e phrase (panoramique filé) ; 3. une carte par étape dès que la voix dit le nombre (« Seven steps ») ; 4. la carte de l'étape annoncée, floutée, sur « Stay for step N ». Le script doit donc garder cet ordre : problème, 2e phrase courte, nombre d'étapes, « Stay for step N ». `hookWords` n'est plus affiché.
- Signature : virgule d'une seconde (pastille W + début du jingle) entre l'accroche et l'intro ; la baseline est dite sur la première photo. La signature complète reste en fin de vidéo.
- Relances : l'étiquette « NEXT » de fin d'étape est automatique. Dans le script, une étape sur deux se termine par une phrase qui annonce la suite ; à écrire avant le plan d'images (une image par phrase).
- Short : l'écran final renvoie au long (« FULL VIDEO », lien en première ligne de la description). Après programmation, renseigner la « vidéo associée » du Short dans YouTube Studio (impossible par l'API).

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
- Extraire une image à chaque encart, flèche et schéma (instants lus dans `timeline-long.json`) + 6 images par Short. Vérifier : aucun texte superposé ou coupé, flèches sur la bonne cible, les 60 premières secondes image par image (une toutes les 2 s : plans de l'accroche, étiquette « Stay for step N », virgule, schéma), l'étiquette « NEXT » de chaque fin d'étape, titre d'ouverture non masqué par la mascotte (40 caractères au plus, champ `title` de l'épisode).
- Corriger, relancer `only=long`, recontrôler les endroits modifiés.

## 6. Titre et miniature
- Titre YouTube (`metadata.title`) : « How to + requête exacte (enjeu) », 2 ou 3 variantes notées avec `vidiq_score_title`, garder la meilleure.
- Miniature : entrée dans `publish/thumbs.json` + photo dans `public/thumbs/`, `node scripts/tools/thumbpro.mjs --only <mot>`, la regarder.

## 7. Programmation
- Copier dans `release-assets` : `<id>/out/` (long.mp4.part-*, short.mp4, short2.mp4, long.en.srt, short.en.srt, thumbnail.jpg = miniature ThumbPro) et `<id>/build/` (metadata.json, qc.json). Pousser.
- Ajouter `{ "id", "publishAt": "<jour>T16:30:00Z", "short2At": "<jour>T11:30:00Z" }` à `publish/queue.json` et pousser : le workflow « Mise en ligne des épisodes vérifiés » programme les trois vidéos.
- Vérifier `data/published.json` et, côté YouTube, les trois vidéos en privé avec leur date (vidIQ `vidiq_user_videos`, statut `private`).

## 8. Raccourcis ajoutés le 25/11/2026
- Lot d'images Gemini sans saisie manuelle : `python3 scripts/tools/episodes/<sujet>.py` puis copier `/tmp/<id>-missing.json` dans `scripts/tools/gemini-batches/<id>.json`, pousser, et lancer dans Playwright une boucle qui lit ce fichier sur raw.githubusercontent.com (une image par passage : `gemini.google.com/app`, saisie, `img.image.loaded`, bouton « taille réelle », `download.saveAs`). La boucle tourne seule sur le PC ; suivre l'état dans `page.context().__wkst`.
- Rapatriement : recadrer et archiver sur le PC (`device_bash` : `convert … -resize 1920x1080^ -gravity center -extent 1920x1080`, puis `tar`) et ne rapatrier que l'archive.
- Scènes d'extérieur : ne pas réutiliser le `TAIL` d'intérieur, sinon Gemini colle la pièce derrière le mur. Écrire un `TAIL` « Fully outdoors… no interior room visible ».
- Miniature hors GitHub Actions : `REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell node scripts/tools/thumbpro.mjs --only <mot>`.
- `title` de l'épisode : 40 caractères au plus, sinon le titre d'ouverture passe sur trois lignes. `short` (dans les notes) : la liste des plans du Short, sinon les images ne correspondent pas aux étapes.
- Ne pas lancer deux rendus `daily.yml` en même temps ; attendre `completed` avant `preview-branch.yml`.
- Studio WikiTube : profil Playwright b (le profil c est sur la chaîne YouQwiz).

## 9. Raccourcis ajoutés le 26/11/2026
- Quota d'images Gemini : la génération s'est arrêtée vers 275 images dans la matinée (« I can create more images as soon as your limit resets »). Compter 3 épisodes complets par jour au plus ; deux onglets en parallèle fonctionnent (environ 35 s par image chacun), pas besoin d'un troisième.
- Boucle de lot : `ctx.__wkst` (`queue` = [[fichier du lot, dossier]], `done`, `errors`, `stop`). Les images verticales vont dans un lot séparé `<id>-short2.json` avec `tail` vide (le `tail` du lot principal impose le 16:9).
- Recadrage et planches-contact sur le PC : `python3 ~/mnt/wikitube-shots/_gen/crop.py <dossier> <nom>` écrit `_gen/<nom>/` (1920×1080, vertical 1296×2322, planches `_sheet-N.jpg`) et `_gen/<nom>.tar` à rapatrier.
- Branche `release-assets` : ne pas la cloner en entier (plusieurs Go). `git clone --depth 1 --filter=blob:none --no-checkout -b release-assets …`, `git sparse-checkout set <id>`, copier, `git add --sparse <id>`, pousser.
- `gh` ne marche pas dans le cloud : lancer `daily.yml` et `preview-branch.yml` avec l'outil GitHub (actions_run_trigger). Un rendu dure 14 à 18 min.
- Le 5e encart de l'intro ne s'affiche pas si son mot `on` est dans la dernière seconde de l'intro (vu sur pâtes et bijoux) : choisir un mot plus tôt.
- En attente au 26/11 : épisode MacBook (`2026-11-21-clean-macbook-screen-keyboard`), plan, annotations, schéma et titre prêts, 51 images contrôlées dans le dépôt ; restent 12 images (lot `gemini-batches/<id>.json`) et l'image verticale (lot `-short2`), puis rendu, contrôle, miniature. Vérifier que le chronomètre du plan 1-5 ne montre pas de chiffres lisibles.
- Bijoux en argent : `youneed.jpg` (étiquette de la boîte d'aluminium effacée à la main), `step-4-7.jpg` (recadrage de 4-3) et `short2-hook.jpg` (recadrage vertical de 7-7) sont des retouches faute de quota, originaux dans `wikitube-shots/silver` et `silver-fix`.
