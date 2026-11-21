#!/usr/bin/env python3
"""Plans de l'épisode « The Best Way to Clean a Glass Stovetop Without Scratching ». Annotations dans glass_stovetop.notes.json.
Le découpage suit les phrases de la narration (une image par phrase, « Step N. » rattaché à la phrase suivante)."""
import os, sys, re, json
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build, ROOT
ID = "2026-11-29-clean-glass-stovetop"
TAIL = ("Photorealistic photograph for a practical home cleaning how-to video. Bright, tidy modern kitchen, a black glass-ceramic electric cooktop with four round burner rings "
        "built into a light wood countertop, white tiled backsplash, soft daylight. Adult hands, rolled-up sleeves of a light blue cotton shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A spotless black glass-ceramic cooktop shining like a mirror, reflecting the window light, a folded white microfiber cloth resting at its edge, three-quarter view from above, very clean and fresh."
YOUNEED = ("Flat lay photographed from directly above on a light wood countertop, items neatly arranged with clear space between them: an open white box of baking soda powder with no label, "
           "a clear spray bottle of white vinegar with no label, a plain white squeeze bottle of cooktop cleaner cream with no label, a flat razor scraper with a black plastic handle, "
           "two folded microfiber cloths, one white and one grey, and a folded white cotton towel.")
MISTAKES = [
 "A hand pressing a grey steel wool pad onto a black glass cooktop, a patch of fine circular scratch marks visible on the glass under the light, close-up.",
 "A hand spraying cleaner onto a black glass cooktop whose front burner ring is still glowing red hot, a small red warning light lit at the front edge, steam hissing where the spray lands.",
 "A razor scraper held almost upright at a steep angle, only its corner digging into a black glass cooktop, the hand gripping it awkwardly, close-up from the side.",
]
P = {
 1: [
  "A hand turning a black control knob of the cooktop to the off position, all four burner rings dark, front view.",
  "Close-up of a small red indicator light glowing at the front edge of the black glass cooktop, the burner ring beside it dark.",
  "A hand held open a few inches above a black glass cooktop without touching it, checking for warmth, faint heat shimmer rising from one burner ring.",
  "Two hands lifting a stainless steel saucepan and a striped pot holder off the black glass cooktop, a wooden spoon already set aside on the countertop.",
  "A hand pushing open a kitchen window above the countertop, bright daylight coming in, the black glass cooktop in the foreground.",
  "A mechanical kitchen timer with a blank face standing on the light wood countertop beside the cooled black glass cooktop, calm mood.",
 ],
 2: [
  "A hand wiping a dry white microfiber cloth lightly across a black glass cooktop scattered with breadcrumbs and dust, a clean stripe behind the cloth.",
  "Close-up of a single hard dark crumb on a black glass cooktop with a fingertip hovering above it, shallow depth of field.",
  "A hand sweeping breadcrumbs off the edge of the black glass cooktop into the cupped palm of the other hand, side view.",
  "A black glass cooktop free of crumbs but still showing three brown burnt-on rings and cloudy streaks around the burner zones, seen from above.",
  "Close-up of the edge of a black glass cooktop where it meets the wood countertop, small food bits hiding along the seam, a fingertip pointing at them.",
  "A fingertip pressing a touch control at the front of a black glass cooktop, a small glowing key-shaped lock light next to it.",
 ],
 3: [
  "A hand sprinkling a generous layer of white baking soda from a small bowl over the brown burnt-on stains of a black glass cooktop, powder falling, close-up.",
  "A hand spraying white vinegar from a clear spray bottle onto baking soda on a black glass cooktop, the powder fizzing with small white bubbles into a loose paste, close-up.",
  "Two hands wringing out a steaming hot wet white cotton towel over a stainless steel kitchen sink, drops of water falling.",
  "A warm damp white towel laid flat over the front half of a black glass cooktop, covering the baking soda paste, light steam rising from it.",
  "A hand lifting a corner of the damp white towel on the cooktop while the other hand holds a fresh steaming towel ready to replace it.",
  "The damp white towel resting on the black glass cooktop with a mechanical kitchen timer with a blank face on the countertop beside it, quiet kitchen.",
 ],
 4: [
  "A hand peeling the damp white towel off a black glass cooktop, revealing grey softened baking soda paste over the stains underneath.",
  "A hand wiping baking soda paste off a black glass cooktop in gentle circles with a grey microfiber cloth, a clean glossy arc appearing, close-up.",
  "A hand rinsing a grey microfiber cloth under warm running water in a stainless steel sink, cloudy water running off it.",
  "Close-up of brown residue lifting off black glass onto a white microfiber cloth, the cloth stained brown, the glass shiny where it has passed.",
  "A hand wiping the whole surface of a black glass cooktop with a clean damp white cloth in one long stroke, the last white traces of baking soda disappearing.",
  "A nearly clean black glass cooktop with one small stubborn black burnt patch remaining near a burner ring, a fingertip pointing at it.",
  "A hand resting lightly with a soft yellow sponge on a black glass cooktop, relaxed open fingers, no pressure, beside one small burnt spot.",
 ],
 5: [
  "A hand squeezing a few drops of white cooktop cleaner cream from a plain white bottle onto a small black burnt-on spot on a black glass cooktop, close-up.",
  "Side view close-up of a razor scraper with a black handle held at a low shallow angle on a black glass cooktop, the full width of the blade flat on the glass, pushing a curl of burnt residue ahead of it.",
  "Close-up of a razor scraper blade with a visible chipped nick in its edge held up to the light between two fingers, the black glass cooktop blurred behind.",
  "A hand wiping scraped black flakes off a black glass cooktop with a folded paper towel, the razor scraper lying flat on the countertop beside it.",
  "A hand wearing a grey work glove holding a razor scraper on a black glass cooktop, all fingers kept behind the blade, close-up from above.",
  "A new razor scraper for glass cooktops with a spare blade in a small clear case, laid on the light wood countertop next to the black glass cooktop, seen from above.",
 ],
 6: [
  "A hand squeezing a small coin-sized dot of white cooktop cleaner cream onto the centre of a clean black glass cooktop, close-up.",
  "A hand rubbing white cleaner cream across a black glass cooktop with a white cloth, a thin milky film spreading over the surface.",
  "A black glass cooktop covered with a thin dry whitish haze, a hand buffing it off in circles with a dry grey microfiber cloth, a mirror-like path appearing.",
  "A black glass cooktop with a clear streak-free shine reflecting the kitchen window, low angle view across the surface.",
  "A tiny dot of white cleaner cream on a fingertip held above the shiny black glass cooktop, the cream bottle standing behind.",
  "Low angle view across a black glass cooktop toward the bright window, the light raking over the surface and revealing one faint streak, a hand with a cloth approaching it.",
  "A hand making a final pass with a dry white microfiber cloth over a gleaming black glass cooktop, bright highlights.",
 ],
 7: [
  "A sparkling clean black glass cooktop in a tidy kitchen, a folded microfiber cloth hanging on the oven handle below, wide front view.",
  "A hand wiping up a small fresh splash of tomato sauce from a cool black glass cooktop with a damp white cloth.",
  "A small puddle of golden sugary syrup spilled on a black glass cooktop next to a small saucepan of jam, a hand with a damp cloth reaching for it, close-up.",
  "Two hands lifting a stainless steel saucepan with a perfectly flat bottom straight up off a burner ring of a black glass cooktop, the pan the same size as the ring.",
  "A hand giving a quick wipe to a black glass cooktop with a white cloth right after cooking, a plate of pasta on the countertop beside it.",
  "A hand wiping a shiny black glass cooktop with a cloth, a mechanical kitchen timer with a blank face on the countertop, easy relaxed mood.",
  "A flawless black glass cooktop gleaming in warm daylight, a small vase of green herbs on the countertop beside it, three-quarter view.",
 ],
 8: [
  "Close-up of one last small dark burnt spot on an otherwise clean black glass cooktop, a soft sponge held back above it without touching.",
  "A hardened amber blob of melted sugar and a small warped piece of melted blue plastic stuck on a black glass cooktop, close-up, no hands.",
  "A hand in a thick grey oven glove holding a razor scraper flat against a blob of melted sugar on a black glass cooktop, an open plain appliance manual with blurred unreadable pages on the countertop.",
  "A faint whitish rainbow-tinted film on part of a black glass cooktop, a hand wiping it away with a cloth and a dot of white cream, the wiped part deep black.",
 ],
 9: [
  "A thin hairline crack running across the corner of a black glass cooktop, catching the light, close-up, no hands.",
  "A hand turning a cooktop control knob to off next to a visible hairline crack in the black glass, close-up.",
  "Cutaway-style close-up of a cracked black glass cooktop edge with a drop of liquid sitting on the crack, a glimpse of metal heating coils in the dark underneath.",
  "A hand flipping a single switch down in a grey household circuit breaker panel on a white wall, the switches unlabeled.",
  "Close-up of a few shallow pale scratches on a black glass cooktop seen in raking light, a fingertip running over them.",
  "An appliance technician's hands in dark work gloves inspecting a black glass cooktop with a small flashlight, a tool bag on the countertop, no face visible.",
 ],
 10: [
  "The underside of a stainless steel saucepan held up by a hand, a few grains of salt stuck to its bottom, the black glass cooktop below.",
  "Extreme close-up of grains of coarse salt and a few rice grains on a black glass cooktop right beside the edge of a pan bottom.",
  "A hand wiping the flat bottom of a stainless steel saucepan with a dry cloth above a black glass cooktop.",
  "A black glass cooktop wrongly used as counter space, crowded with tin cans, a grocery bag and a heavy glass lid, a hand lifting one can away.",
  "Two hands lifting a heavy black cast iron skillet with a rough bottom straight up off a black glass cooktop, a small gap of air visible under the pan, side view.",
 ],
}
def split(n):
    s = re.split(r"(?<=[.!?])\s+", " ".join(n.split()))
    if re.fullmatch(r"Step \w+\.", s[0]): s = [s[0] + " " + s[1]] + s[2:]
    return s
ep = json.load(open(os.path.join(ROOT, f"data/queue/{ID}.json")))
S = {}
for i, sec in enumerate(ep["steps"] + ep.get("bonus", []), 1):
    t = split(sec["narration"])
    if i == 4:  # la première phrase couvre deux gestes (retirer la serviette, essuyer) ; les deux dernières partagent une image
        a, b = t[0].split(" and use ", 1)
        t = [a, "and use " + b] + t[1:5] + [t[5] + " " + t[6]]
    assert len(t) == len(P[i]), f"section {i} : {len(t)} phrases pour {len(P[i])} images"
    S[i] = list(zip(t, P[i]))
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "glass_stovetop.notes.json", "that scratch glass stovetops", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
