#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean a MacBook Screen and Keyboard ». Annotations dans clean_macbook.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-11-21-clean-macbook-screen-keyboard"
D = "On a tidy white desk next to a bright window, a small green plant in the background: "
L = "a slim silver aluminium laptop with a plain lid, no logo, its screen switched off and completely black, plain black keys"
TAIL = ("Photorealistic photograph for a practical how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a charcoal-grey cotton shirt, "
        "only hands and forearms in the frame, no head, no face. The laptop screen is always switched off and plain black, with nothing displayed. "
        "16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (D + L + ", open and spotless, the black screen reflecting the window without a single smudge, a hand folding a grey microfiber cloth beside it, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a white desk, items neatly arranged with clear space between them: two folded grey microfiber cloths, "
           "a small plain glass of clear water, a plain white aerosol can of compressed air with a thin red straw and no label, and a small plain white pack of wet wipes with no label.")
MISTAKES = [
 D + "a hand spraying a plain spray bottle directly at the black screen of an open silver laptop, droplets running down the screen toward the keyboard, tight close-up on the hand and the screen only, no body, no chin, no face.",
 D + "a plain blue bottle of glass cleaner, a plain white bottle of bleach and a clear bottle of vinegar lined up beside an open silver laptop with a black screen, a hand pushing the bottles away.",
 D + "a hand pressing hard and scrubbing the black screen of an open silver laptop with a crumpled cloth, the screen visibly flexing under the fingers, close-up.",
]
P = {
 1: [
  D + L + ", a hand pulling the charger cable out of its side, a second cable already unplugged and coiled on the desk.",
  D + "close-up of the black screen of an open silver laptop showing dust and fingerprint smudges clearly in the window light, a single small water droplet on the desk beside the laptop.",
  D + "a hand resting flat on the closed lid of a slim silver laptop with a plain lid, no logo, as if feeling whether it is warm.",
  D + "two hands placing an open silver laptop with a black screen in the middle of a clear, empty white desk in bright window light, wide view.",
  D + "a hand holding a small analog stopwatch with a plain white face next to an open silver laptop with a black screen.",
  D + "a hand unplugging a cable from a plain black external monitor, a plain white computer mouse with its cable unplugged beside an open silver laptop with a black screen.",
 ],
 2: [
  D + "a hand wiping the black screen of an open silver laptop from top to bottom with a dry grey microfiber cloth, a straight vertical stroke.",
  D + "macro close-up of fine dust and tiny grit particles on a black laptop screen, the edge of a grey microfiber cloth lifting them away.",
  D + "a hand holding a grey microfiber cloth very lightly with two fingertips against the black screen of an open silver laptop, the other hand supporting the back of the lid.",
  D + "a roll of paper towels, a box of tissues and a checked kitchen cloth pushed to the side of the desk, a hand raised flat in a stop gesture in front of an open silver laptop with a black screen.",
  D + "hands hanging a clean grey microfiber cloth to dry on a small rack next to a wash basin of soapy water.",
  D + "macro close-up of fingers inspecting a grey microfiber cloth held up to the window light, one tiny grain of sand visible on the fabric.",
  D + "close-up of a few oily fingerprint smudges remaining on the black screen of an open silver laptop, a fingertip pointing at them without touching.",
 ],
 3: [
  D + "a hand dipping one corner of a clean grey microfiber cloth into a small glass of clear water, an open silver laptop with a black screen behind.",
  D + "two hands wringing out a grey microfiber cloth over a small bowl, a single drop falling, close-up.",
  D + "a hand wiping the black screen of an open silver laptop from top to bottom with a slightly damp grey microfiber cloth, a faint clean track behind the cloth.",
  D + "a plain blue spray bottle of window cleaner, a plain brown bottle of alcohol and a clear bottle of vinegar grouped away from an open silver laptop with a black screen, a hand holding only a small glass of water.",
  D + "a hand holding a plain spray bottle pointed at the screen and keyboard of an open silver laptop with a black screen, the other hand raised flat between them in a stop gesture.",
  D + "close-up of a hand gently wiping one stubborn spot on a black laptop screen with a damp grey microfiber cloth, light fingertip pressure.",
  D + "a spotless black laptop screen reflecting the window, a hand lowering the grey microfiber cloth, calm three-quarter view.",
 ],
 4: [
  D + "a hand wiping the black screen of an open silver laptop with a second, dry, light-blue microfiber cloth, a damp grey cloth lying on the desk.",
  D + "macro close-up of a dry light-blue microfiber cloth passing over a black screen, the last faint moisture marks disappearing behind it.",
  D + "a hand tilting the lid of an open silver laptop toward the window, the black screen seen at a low angle with the window reflected along its surface.",
  D + "close-up of a fingertip pointing at one faint streak on a black laptop screen seen at an angle, a damp grey cloth and a dry light-blue cloth ready beside it.",
  D + "an open silver laptop with a black screen standing alone on the desk in the window light, a hand resting on the desk beside it, waiting.",
  D + "a hand slowly lowering the lid of a silver laptop toward its black keyboard, seen from the side, the gap between screen and keys clearly visible.",
  D + "close-up from above of the black keyboard of an open silver laptop with a few crumbs and dust between the keys, a fingertip pointing at them.",
 ],
 5: [
  D + "two hands holding an open silver laptop with a black screen tilted steeply, almost upright, so the black keyboard faces the camera.",
  D + "a hand holding a plain white aerosol can upright with a thin red straw aimed at the black keyboard of a steeply tilted open silver laptop, a small puff of dust flying off.",
  D + "two hands holding an open silver laptop with a black screen turned onto its right side, the keyboard vertical, a plain white aerosol can with a thin red straw on the desk.",
  D + "close-up of a hand holding a plain white aerosol can perfectly upright with a thin red straw, the other hand open flat beside it in a steady gesture.",
  D + "macro close-up of small crumbs and dust flying out from between the black keys of a laptop keyboard in a burst of air.",
  D + "the nozzle of a vacuum cleaner held away from the black keyboard of an open silver laptop, a hand raised flat in a stop gesture between them.",
  D + "a fingertip pressing a single black key on the keyboard of an open silver laptop with a black screen, close-up.",
 ],
 6: [
  D + "a hand wiping the black keys of an open silver laptop with a small white wet wipe, a plain white pack of wipes with no label beside it, close-up.",
  D + "a hand wiping the silver aluminium outside lid of a closed slim laptop with a plain lid, no logo, with a small white wet wipe.",
  D + "macro close-up of a fingertip wrapped in the corner of a grey microfiber cloth wiping one black key, the narrow gaps between the keys dry.",
  D + "a plain white bottle of bleach and a plain brown bottle pushed far to the back of the desk, a hand raised flat toward them, an open silver laptop with a black screen in the foreground.",
  D + "close-up of a fingertip wrapped in a white wet wipe going over the same single black key a second time.",
  D + "a hand wiping the silver palm rest and the large trackpad of an open silver laptop with a grey microfiber cloth, close-up from above.",
  D + "close-up of the side of a silver laptop showing two small plain ports and a row of tiny speaker holes, a damp grey cloth held well away from them.",
  D + "a spotless black keyboard and silver palm rests of an open laptop with a black screen, a hand picking up a grey microfiber cloth, three-quarter view.",
 ],
 7: [
  D + "a hand wiping the plain silver bottom of a closed slim laptop turned upside down with a grey microfiber cloth, keeping away from the vents along the edge.",
  D + "a hand placing a folded grey microfiber cloth on the desk right next to an open silver laptop with a black screen, a plain notebook beside it.",
  D + "hands being dried with a small white towel in front of an open silver laptop with a black screen, a plate with a sandwich pushed away to the far side of the desk.",
  D + "a hand giving the black screen of an open silver laptop a quick light wipe with a dry grey microfiber cloth, a cup of coffee on the desk, a bare white wall behind, no calendar.",
  D + "a hand lifting a pen off the black keyboard of an open silver laptop with a black screen, before closing the lid, close-up.",
  D + "a closed, spotless slim silver laptop with a plain lid, no logo, gleaming on the tidy desk, a hand resting on it, calm wide view.",
 ],
 8: [
  D + "close-up of one stubborn greasy smudge on a black laptop screen, a hand holding up a visibly dirty, greyish microfiber cloth beside it.",
  D + "hands washing a grey microfiber cloth in a small basin of mild soapy water, a fresh clean folded cloth waiting beside the basin.",
  D + "a fingernail held just above a small mark on a black laptop screen without touching it, the other hand raised flat in a stop gesture.",
  D + "close-up of a black laptop screen seen at an angle showing a faint, slightly worn dull patch in the reflection, a fingertip pointing at it.",
 ],
 9: [
  "At a bright repair shop counter: a hand sliding a closed slim silver laptop with a plain lid, no logo, across the counter toward another person's open hands, no faces visible.",
  D + "a fingertip pointing at the black screen of an open silver laptop, the screen plain black, the other hand holding a smartphone with a dark blank screen.",
  D + "side view close-up of a closed silver laptop whose bottom case bulges slightly so it no longer sits flat on the desk, a hand pulled back from it.",
 ],
 10: [
  D + "a hand sliding a folded grey microfiber cloth into a small plain fabric pouch next to an open backpack.",
  D + "a hand holding a worn, frayed old microfiber cloth next to a fresh new folded grey one, close-up.",
  D + "hands sliding a closed slim silver laptop with a plain lid, no logo, into a plain grey padded sleeve, the window in soft shade behind.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "clean_macbook.notes.json", "that damage a MacBook", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
