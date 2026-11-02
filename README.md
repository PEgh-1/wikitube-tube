# WikiTube — pipeline de production quotidienne

Chaîne YouTube **WikiTUBE** (`@WikiTubeHowTo`) : tutos *how-to* en anglais, **1 vidéo longue (6–8 min) + 1 Short par jour**, produits sans intervention humaine sur GitHub Actions. Même architecture que `youqwiz-tube` : épisode JSON → voix ElevenLabs → visuels Pixabay → rendu Remotion → contrôle qualité → mise en ligne programmée.

```
data/queue/<date>-<slug>.json ──► generate ──► tts (ElevenLabs) ──► images (Pixabay) ──► render (Remotion)
                                      │           │ mp3 + words.json     │ jpg/png            │ long.mp4 · short.mp4 · thumbnail.png
                                      ▼           ▼                      ▼                    ▼
                                 build/<id>/  public/assets/<id>/audio  public/assets/<id>/images   out/<id>/
                                                                                                    │
                        build-srt (long.en.srt) ──► qc (ffprobe, loudnorm) ──► upload (YouTube Data API v3, 17:30 Europe/Paris)
```

## Arborescence

```
data/
  episode.schema.json     JSON Schema généré depuis scripts/lib/episode.mjs (zod)
  episodes/               épisodes d'exemple / bibliothèque (non consommés)
  queue/                  épisodes à produire : <date>-<slug>.json (un par jour)
  done/                   épisodes consommés (déplacés par generate.mjs, commités par le workflow)
  state.json              journal des exécutions (écrit par daily.mjs)
  published.json          journal des vidéos mises en ligne (ids YouTube)
scripts/
  daily.mjs               orchestrateur : generate → tts → images → render → srt → qc → upload
  generate.mjs            choisit l'épisode du jour, valide, prépare build/<id>/, déplace en done/
  tts.mjs                 ElevenLabs with-timestamps → 1 mp3 par segment + words.json (--mock : silences)
  images.mjs              Pixabay (défaut) ou Pexels → 1 visuel par étape + image héros, cache public/assets/<id>/ (--mock : PNG charte)
  render.mjs              Remotion (API renderer) : Long 1920×1080, Short 1080×1920, miniature 1280×720, chapitres, metadata.json
  build-srt.mjs           SRT anglais depuis words.json + timelines
  qc.mjs                  ffprobe : durées, résolution, pistes audio, loudness -14 LUFS, méta YouTube
  upload.mjs              YouTube Data API v3 : long + Short programmés, miniature, localisations, playlist, captions.insert
  validate.mjs            valide les épisodes et régénère le schéma
  lib/                    common (env, ffprobe, logs), episode (schéma zod), timeline (durées → scènes), png (placeholders)
  providers/              elevenlabs.mjs, pixabay.mjs (défaut), pexels.mjs (option), gemini.mjs (squelette image générative)
src/
  Root.tsx                compositions Long / Short / Thumbnail (durée calculée depuis la timeline en inputProps)
  Long.tsx · Short.tsx · Thumbnail.tsx
  scenes/long.tsx         pré-roll, hook, you'll need, Step (3 variantes split/full/card), mistakes, recap, outro
  scenes/short.tsx        hook, 3 étapes, CTA
  components/ui.tsx       logo, cadre papier, Ken Burns, barre de progression, badge, pastille astuce
  components/Subtitles.tsx sous-titres mot à mot (bandeau) + pistes audio par scène
  theme.ts                charte : papier #FBF7EF · encre #1B2A41 · corail #FF6B4A · teal #2BB3A3 · jaune #FFC94D · Nunito
  fixtures/demo.ts        timeline de démo pour `npm run studio`
.github/workflows/daily.yml   cron 04:00 UTC + workflow_dispatch (date, skip_upload, mock)
```

## Format d'un épisode

Un fichier `data/queue/<YYYY-MM-DD>-<slug>.json` validé par `data/episode.schema.json` (voir l'exemple complet `data/episodes/2026-11-03-clean-cast-iron-skillet.json`, 7 étapes) :

| Champ | Rôle |
|---|---|
| `id`, `date`, `slug`, `category`, `title` | identité ; `id` = `<date>-<slug>` |
| `hook`, `intro` | narration d'ouverture (scène titre) |
| `youNeed[]`, `youNeedNarration` | matériel (cartes) + voix off |
| `heroImageQuery`, `heroImagePrompt` | image clé (hook, miniature, Short) |
| `steps[6–8]` | `title`, `narration` (2–4 phrases, 35–120 mots), `tip`, `mistake`, `imageQuery` (requête Pixabay), `imagePrompt` (future API image), `media` photo/video |
| `mistakesToAvoid` | `narration` + `items[2–4]` |
| `recap` | `narration` + `items` (une par étape, sinon titres des étapes) |
| `outro` | appel à l'abonnement |
| `metadata` | `title`, `description`, `tags`, `thumbnailTitle`, `chapters` (`"auto"` = calculés depuis les durées), `localizations` **obligatoires** pour `es, pt, fr, de, hi, it, ja, id` |
| `short` | `title`, `description`, `hook`, `steps[3]` (title + narration courte), `cta` — ≤ 130 mots au total pour tenir sous 58 s |

Règles vérifiées par `npm run validate` : 6 à 8 étapes, 700–1 500 mots de narration (≈ 5–10 min), Short ≤ 130 mots, titres ≤ 100 caractères, 8 localisations. La narration porte le contenu ; l'écran ne montre que numéro, titre court et astuce, pour que le **doublage automatique YouTube** reste cohérent.

### Ajouter des épisodes

1. Écrire le JSON (ou le faire générer par Claude à partir du schéma) dans `data/queue/`, nommé `<date>-<slug>.json`.
2. `npm run validate` (valide tout `data/queue` + `data/episodes`).
3. Commit + push : le workflow du jour prend l'épisode daté du jour, sinon le plus ancien en attente, et le déplace dans `data/done/`.

Garder **au moins 7 à 10 épisodes d'avance** dans la file ; le workflow échoue proprement si elle est vide.

## Lancer en local

```bash
npm install
cp .env.example .env            # remplir les clés (ou laisser vide pour le mock)
npm run validate
npm run daily:mock              # pipeline complet sans clé : silences, PNG charte, pas d'upload
# équivalent : node scripts/daily.mjs --mock --skip-upload [--episode data/episodes/x.json] [--fps 24]
npm run studio                  # Remotion Studio avec la timeline de démo
```

Étapes à l'unité : `npm run generate`, `npm run tts -- --mock`, `npm run images -- --mock`, `npm run render -- --only short`, `npm run srt`, `npm run qc -- --mock`, `npm run upload -- --dry-run`.

Variables utiles : `REMOTION_BROWSER_EXECUTABLE` (Chromium local ; vide sur Actions où `remotion browser ensure` télécharge le navigateur), `REMOTION_CONCURRENCY` (2 par défaut), `BURN_SUBTITLES=1` pour incruster les sous-titres (désactivé par défaut : le SRT anglais déposé via captions.insert est traduit automatiquement par YouTube, cohérent avec le doublage auto), `MOCK_WORDS_PER_SEC` (2,5 par défaut).

Le rendu complet en mock sur 2 vCPU prend ≈ 25 min à 30 fps (≈ 7 images/s) ; `--fps 24` pour un test rapide, le code reste à 30 fps par défaut.

## Secrets et variables GitHub

À créer dans *Settings → Secrets and variables → Actions* du dépôt :

| Secret | Usage |
|---|---|
| `ELEVENLABS_API_KEY` | TTS ElevenLabs (`/v1/text-to-speech/{voice}/with-timestamps`) |
| `ELEVENLABS_VOICE_ID` | id de la voix de la chaîne (en choisir une et ne plus en changer) |
| `PIXABAY_API_KEY` | photos/vidéos d'illustration (gratuit, 100 req/60 s) — fournisseur par défaut |
| `PEXELS_API_KEY` | optionnel, uniquement avec `IMAGE_PROVIDER=pexels` (Pexels a suspendu la délivrance de nouvelles clés) |
| `YT_CLIENT_ID`, `YT_CLIENT_SECRET` | client OAuth « application de bureau » du projet Google Cloud (API YouTube Data v3 activée) |
| `YT_REFRESH_TOKEN` | refresh token obtenu une fois avec les scopes `youtube.upload` + `youtube.force-ssl` (captions, playlists) ; appli OAuth passée en **production** sinon le token expire après 7 jours |
| `GEMINI_API_KEY` | optionnel, pour activer `providers/gemini.mjs` (`IMAGE_PROVIDER=gemini`) |

Variables (non secrètes) : `YT_PLAYLIST_ID`, `ELEVENLABS_MODEL_ID` (défaut `eleven_flash_v2_5`), `IMAGE_PROVIDER` (défaut `pixabay` ; `pexels` ou `gemini` en option), `PUBLISH_SLOT` (défaut `17:30`), `SHORT_DELAY_MINUTES` (défaut `30`).

Obtenir le refresh token (une fois, en local) :

```bash
# 1. Google Cloud → APIs & Services → Credentials → OAuth client ID (Desktop app) ; écran de consentement en "Production"
# 2. Ouvrir dans le navigateur (remplacer CLIENT_ID) :
#    https://accounts.google.com/o/oauth2/v2/auth?client_id=CLIENT_ID&redirect_uri=http://localhost&response_type=code&access_type=offline&prompt=consent&scope=https://www.googleapis.com/auth/youtube.upload%20https://www.googleapis.com/auth/youtube.force-ssl
# 3. Récupérer le ?code= dans l'URL de redirection, puis :
curl -s -X POST https://oauth2.googleapis.com/token -d client_id=CLIENT_ID -d client_secret=CLIENT_SECRET \
  -d code=CODE -d grant_type=authorization_code -d redirect_uri=http://localhost
# → refresh_token à coller dans YT_REFRESH_TOKEN
```

## Workflow quotidien

`.github/workflows/daily.yml` : cron `0 4 * * *` (04:00 UTC) + lancement manuel avec `date`, `skip_upload`, `mock`. Il installe ffmpeg, `npm ci`, `npx remotion browser ensure`, lance `npm run daily`, extrait 6 images de contrôle du long et 2 du Short dans `out/check/`, publie les rendus et manifestes en **artefacts 7 jours**, puis commite `data/queue`, `data/done`, `data/state.json`, `data/published.json`.

Publication : le long est programmé (`privacyStatus: private` + `publishAt`) au **prochain créneau 17:30 Europe/Paris** (≥ 15 min après l'upload), le Short au même créneau + 30 min ; miniature, localisations (titres + descriptions dans 8 langues), chapitres dans la description, playlist optionnelle, sous-titres anglais via `captions.insert`. Le QC bloque l'upload si le long sort de 5–12 min, si le Short dépasse 60 s, s'il manque une piste audio, ou si la loudness s'écarte de -14 LUFS de plus de 2 LU.

## Coûts et limites

- **GitHub Actions** : un run ≈ 30–40 min sur `ubuntu-latest` (rendu ≈ 25 min pour 6–7 min de vidéo à 2 vCPU). Soit ≈ **1 000–1 200 min/mois** : au-delà des 2 000 min gratuites d'un compte Free (dépôt privé) mais dans les 3 000 min de **GitHub Pro** ; un dépôt **public** a des minutes illimitées. Alternative : runner auto-hébergé.
- **ElevenLabs** : ≈ 5 500 caractères par épisode (long + Short) ≈ **165 000 caractères/mois**. Flash v2.5 compte ½ crédit par caractère : le plan Creator (100 k crédits, ~22 $/mois) couvre ≈ 200 k caractères. Le script affiche la consommation à chaque run.
- **Pixabay** : gratuit, 100 requêtes/60 s ; ≈ 9 requêtes par épisode. Fichiers téléchargés et mis en cache localement (pas de hotlink) ; la description reçoit « Images: Pixabay — auteurs ». Sans accès API complet, les photos sont en 1280 px max (fullHDURL/imageURL réservés aux comptes approuvés) : demander l'accès complet sur pixabay.com/api/docs pour du 1920 px.
- **YouTube Data API** : 2 `videos.insert` (1 600 unités chacun) + miniature (50) + sous-titres (400) + playlist (50) ≈ **3 700 unités/jour**, sous le quota par défaut de 10 000.
- **Remotion** : licence gratuite pour les particuliers et les sociétés de ≤ 3 personnes (vérifier remotion.dev/license).

## Points d'attention

- Décision du 02/11/2026 : pas de sous-titres incrustés (SRT YouTube seulement, traduit automatiquement). `BURN_SUBTITLES=1` ou `--subtitles` pour les réactiver.
- Les images Pixabay sont choisies par requête texte : vérifier les images de contrôle (`out/check/`) dans les artefacts les premiers jours et ajuster les `imageQuery`.
- Aucune musique de fond n'est incluse (pas de piste libre de droits embarquée) ; brancher un fichier `public/music/bed.mp3` + un `<Audio volume={0.08}>` dans `Long.tsx` si souhaité, puis revalider la loudness.
