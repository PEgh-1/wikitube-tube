#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean Windows Without Streaks ». Annotations dans clean_windows.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-15-clean-windows-without-streaks"
I = "In a bright living room with white walls and a light wood floor, at a large white-framed window with a white sill, soft overcast daylight outside: "
G = "Fully outdoors on the paved ground-floor patio of a house with a light exterior wall, at a white-framed ground-floor window seen from outside, overcast sky, no interior room visible: "
TAIL = ("Photorealistic photograph for a practical home how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a sky-blue cotton shirt, "
        "only hands and forearms in the frame, no head, no face. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (I + "a perfectly clear, streak-free window pane with a garden visible through it, a hand holding a squeegee resting against the frame, a folded microfiber cloth on the sill, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood floor, items neatly arranged with clear space between them: a plain white bucket of water, a small plain bottle of clear dish soap, "
           "a window squeegee with a black rubber blade, a stack of folded blue microfiber cloths, and a clear glass bottle of white vinegar.")
MISTAKES = [
 G.replace("overcast sky", "harsh bright direct sunlight") + "a hand wiping a window pane with a cloth in strong direct sun, the glass covered with dried streaks and smears, hard shadows, close-up.",
 I + "a hand squeezing a long stream of dish soap from a plain bottle into a bucket overflowing with thick foam, a cloudy soapy film on the window pane behind.",
 I + "a hand holding a dirty grey cloth and a squeegee with a grimy, nicked rubber blade in front of a smeared window pane, close-up.",
]
P = {
 1: [
  G + "a hand resting on the window frame under a grey cloudy sky, the glass evenly lit with no sun glare, a bucket on the ground, wide view.",
  G + "a gloved hand touching a thin layer of frost on the corner of a window pane on a cold winter morning, close-up.",
  I + "hands setting a bucket, a squeegee, a small bottle of dish soap and a stack of microfiber cloths in a row on the floor below the window.",
  I + "hands spreading a folded old towel along the white window sill, a second towel already on the floor below, close-up.",
  G + "a hand holding a squeegee reaching the top of a ground-floor window while both feet stay flat on the paving, seen from behind at waist level, no head in the frame.",
  I + "a hand turning the handle and opening the window a few centimetres, the edge of the frame visible, close-up.",
  I + "hands lifting a potted plant off the window sill, a light curtain already pulled aside and tied back, a small ornament set on a table nearby.",
 ],
 2: [
  I + "a hand sweeping a dry soft brush along the upper corner of the window frame, a cobweb and dust coming off, close-up.",
  I + "a hand wiping the edge of the glass along the frame with a dry folded cloth, close-up.",
  I + "macro close-up of muddy brown streaks of wet dust running down a window pane from a dusty frame.",
  I + "a hand running a narrow vacuum nozzle along the dirty track at the bottom of a sliding window, dust and grit visible in the track, close-up.",
  I + "a hand with a dry brush working at the very top of the window frame, the lower part of the frame still dusty, seen from below.",
  I + "a dust-free white window frame and sill, a hand putting the soft brush down on the towel, calm wide view.",
  I + "a hand holding a small plain bottle of dish soap above an empty white bucket on the floor, the clean dry window behind.",
 ],
 3: [
  I + "a hand letting two drops of clear dish soap fall from a small plain bottle into a white bucket filled with warm steaming water, close-up.",
  I + "macro close-up of a single drop of dish soap falling toward the surface of clear water in a white bucket.",
  I + "a window pane covered with a cloudy, streaky soap film catching the light, a bucket with far too much foam in the foreground.",
  "On a white kitchen counter: a hand pouring white vinegar from a clear glass bottle into a plain white spray bottle already half filled with water, close-up.",
  I + "a hand spraying a fine mist from a plain white spray bottle onto a lightly dusty window pane, close-up.",
  I + "a hand holding a spray bottle stopped above a polished grey natural stone window sill, the other hand pressing a fingertip on the black rubber seal of the window frame.",
  "On a white kitchen counter: a clear glass bottle of vinegar standing well apart from two plain unlabelled plastic jugs, a hand raised flat between them in a stop gesture.",
  G + "on a cold winter day with frost on the ground, a hand adding a small splash of clear liquid from a small plain bottle into a bucket of water.",
 ],
 4: [
  I + "hands wringing a blue microfiber cloth lightly over a white bucket of soapy water, a few drops falling, close-up.",
  I + "a hand wiping a window pane with a wet blue microfiber cloth in a firm stroke from the top downward, the glass evenly wet and soapy.",
  I + "a fingertip wrapped in a wet cloth cleaning the grimy lower corner of a window pane where it meets the frame, close-up.",
  G + "a hand holding a wet folded cloth pressed flat against a dried white bird dropping on the outside of a window pane, close-up.",
  I + "a hand holding a green abrasive scouring pad away from the glass, fine scratches visible on a small area of the pane, close-up.",
  I + "a fully wet, soapy window pane glistening with water, a hand already picking up a squeegee from the sill.",
  G + "a hand washing a very dirty, dusty outside window pane with a wet cloth for the second time, grey dirty water running down the glass.",
  I + "a hand lifting a squeegee with a clean black rubber blade toward the top corner of a wet soapy window pane, close-up.",
 ],
 5: [
  I + "a hand pulling a squeegee straight down from the top corner of a wet soapy window pane, a perfectly clear dry stripe of glass behind the blade.",
  I + "a hand wiping the black rubber blade of a squeegee with a clean folded cloth, close-up.",
  I + "a squeegee pulling a second vertical stroke that slightly overlaps the first clear stripe on a soapy window pane, close-up.",
  I + "a hand wiping the last thin wet line along the bottom edge of a window pane with a folded cloth, the rest of the glass clear.",
  I + "macro close-up of a new, straight, sharp black rubber squeegee blade held between two fingers.",
  I + "a hand sliding a cracked, worn rubber strip out of a squeegee, a new rubber strip lying ready on the sill, close-up.",
  I + "a hand pulling a small squeegee down a small bathroom-sized window pane, a bucket on the floor.",
  I + "a large window pane half finished, the cleared part perfectly transparent, a hand making an even squeegee stroke, wide view.",
  ],
 6: [
  I + "a hand wiping the edge of the glass and the white frame with a dry folded microfiber cloth, a few water drops on the sill, close-up.",
  I + "a hand polishing one small water drop off the middle of a clear window pane with a dry white lint-free cloth, close-up.",
  I + "fingertips holding a dry cloth and touching the inside of a window pane very lightly, a sofa visible in the reflection, close-up.",
  I + "a hand pushing aside a roll of paper towels and a folded plain grey sheet of paper on the sill, white lint specks visible on a patch of the glass.",
  I + "a window pane seen at a low sideways angle with light glancing across the glass, a hand pointing at one faint streak.",
  I + "a hand wiping one small smudge on a window pane with a damp folded microfiber cloth, close-up.",
  G + "a hand wiping the outside of the same window pane with a dry cloth, the bright living room visible through the clear glass.",
  I + "a hand lifting a window screen with a fine grey mesh slightly out of its frame, the dusty window track visible below, close-up.",
 ],
 7: [
  I + "a hand pointing at the dusty bottom track and the mesh screen of a window, the glass above already perfectly clear.",
  I + "a hand wiping the bottom window track with a cloth dipped in soapy water, a vacuum nozzle lying beside it on the sill, close-up.",
  I + "a hand cleaning the corner of a window track with an old toothbrush, a cotton swab lying on the sill, macro close-up.",
  G + "a hand rinsing a window screen with a fine grey mesh leaned against the wall with a gentle spray from a garden hose, water running off.",
  I + "a hand wiping the white window sill and the lower frame with a damp cloth in a long stroke.",
  I + "a spotless clear window in a tidy living room, a hand hanging a squeegee on a hook beside a plain wall calendar with empty squares.",
  I + "a hand giving the window pane a quick light wipe with a dry microfiber cloth, a cup of coffee on the sill, relaxed view.",
 ],
 8: [
  I + "a fingertip pointing at a faint streak on a window pane, the other hand visible through the glass on the outside pointing at the same spot.",
  "Split view of one window: on the left side seen from indoors a hand wiping the glass with a cloth in a horizontal stroke, on the right side seen from outdoors a hand wiping the glass in a vertical stroke.",
  I + "close-up of a window pane in glancing light showing one faint horizontal streak and one faint vertical streak crossing each other, a fingertip pointing at the horizontal one.",
  I + "a hand holding up a dirty grey cloth and a squeegee with a grimy blade beside a bucket full of foam, a streaky pane behind.",
  G + "a hand wiping white chalky hard-water spots off the lower part of an outside window pane with a damp cloth, a clear glass bottle of vinegar on the ground.",
  "In a laundry room: a hand dropping blue microfiber cloths into the drum of a washing machine, a plain bottle of fabric softener pushed away to the side by the other hand.",
 ],
 9: [
  "View from the street of a two-storey house with tall windows on the upper floor, a hand in the foreground holding a smartphone with a dark blank screen.",
  "An open upper-floor window seen from inside a bedroom, a hand gripping the frame and staying well inside, the street far below visible.",
  I + "macro close-up of fog and tiny water droplets trapped between the two panes of a double-glazed window, a fingertip touching the dry inner surface.",
  G + "close-up of an outside window pane with fine white paint specks and dull etched hard-water marks, a fingertip pointing at them.",
  G + "a professional window cleaner's gloved hand in dark work clothes examining a window pane with a long-handled tool, the homeowner's hand in a sky-blue sleeve pointing at the glass, no faces visible.",
 ],
 10: [
  I + "a spotless clear window with morning light, a hand resting on the clean white sill, calm wide view.",
  I + "a hand wiping a fresh fingerprint off a window pane with a damp blue microfiber cloth, close-up.",
  "In a laundry room: hands hanging clean blue microfiber cloths to air dry on a drying rack near a washing machine.",
  I + "a hand vacuuming the window track with a narrow nozzle while a removed mesh screen leans against the wall, the glass freshly cleaned.",
  I + "on a cold morning, a hand wiping a band of condensation droplets off the bottom of a window pane with a dry cloth, close-up.",
  "In a bright bathroom: a hand hanging a small squeegee on a hook next to a frosted bathroom window, a few water drops on the glass.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "clean_windows.notes.json", "that leave streaks on the glass", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
