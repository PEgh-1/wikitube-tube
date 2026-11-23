#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean Between the Glass on Your Oven Door ». Annotations dans oven_door_glass.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-01-clean-between-oven-door-glass"
TAIL = ("Photorealistic photograph for a practical home cleaning how-to video. Bright, tidy modern kitchen, a built-in stainless steel electric oven with a large dark glass door, "
        "light wood countertop and white cabinets, soft daylight. Adult hands, rolled-up sleeves of a mustard yellow cotton shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A built-in stainless steel oven with a perfectly clean, crystal clear glass door, the bright empty oven interior visible through the glass, a hand holding a microfiber cloth beside the door, front view."
YOUNEED = ("Flat lay photographed from directly above on a light wood countertop, items neatly arranged with clear space between them: a Phillips screwdriver with a red handle, "
           "a small bowl of warm soapy water with a sponge, three folded microfiber cloths, a large folded grey towel, a pair of white cotton gloves, and a closed plain white instruction booklet with a blank cover.")
MISTAKES = [
 "A pile of loose screws, small metal clips and two glass panes scattered in disorder on a kitchen table, a hand scratching the back of a wrist in confusion above them, no manual in sight.",
 "A hand pressing a grey steel wool pad on a rectangular glass pane lying on a towel, fine scratch marks visible on the glass under the light, close-up.",
 "Two hands pulling hard on a stuck glass pane inside an oven door frame lying flat on a towel, knuckles tense, the pane not moving, close-up.",
]
P = {
 1: [
  "A hand turning the control knob of a built-in oven to the off position, the oven dark inside, front view.",
  "A hand flipping one switch down in a grey household circuit breaker panel on a white wall, the switches unlabeled.",
  "Hands holding an open plain instruction booklet with blurred unreadable pages and a simple line drawing of an oven door, the oven in the background.",
  "Hands holding a smartphone with a blank dark screen pointed at the open oven door hinge, taking a photo, close-up.",
  "A bright kitchen with the oven door open, a floor lamp lighting the area in front of the oven, a calm tidy scene, wide view.",
  "Hands pulling a chrome wire rack out of an open oven, front view.",
  "Close-up of the small glass-covered lamp inside the dark oven cavity, switched off, seen through the open door.",
 ],
 2: [
  "An oven door opened fully flat, a fingertip pointing at a small metal locking lever on the hinge at the bottom corner of the door, close-up.",
  "A thumb flipping a small metal hinge lock lever forward on an oven door hinge, close-up from the side.",
  "Two hands gripping both sides of a partly closed oven door held at a shallow angle, lifting it up and away from the oven, side view.",
  "Two people's hands carrying a heavy oven door together, one person on each side, no faces visible, kitchen in the background.",
  "An oven door lying flat on a large grey towel on a wooden kitchen table, the handle facing the camera, hands smoothing the towel.",
  "A fingertip pointing at a small blank silver rating plate on the inner frame of an open oven, close-up.",
  "A smartphone with a blurred blank screen propped against a jar on the countertop next to the removed oven door, hands resting beside it.",
 ],
 3: [
  "Close-up of the top edge of an oven door lying flat on a towel, a metal trim strip with two small Phillips screws, a fingertip pointing at one screw.",
  "A hand dropping two small screws into a white ceramic cup next to the oven door on a towel, a screwdriver beside it.",
  "Two hands lifting a long metal trim strip off the top edge of an oven door lying flat on a towel, close-up.",
  "The open top edge of an oven door lying flat, showing the edges of two inner glass panes held by small rubber spacers, a fingertip pointing at them, close-up.",
  "Hands holding a smartphone with a blank dark screen above the opened top edge of the oven door, photographing the parts.",
  "Two hands tilting one end of an oven door very slightly off the towel to check the loosened trim strip, side view.",
  "An oven door lying perfectly flat on a grey towel on a table, both hands pressing it gently flat, seen from above.",
 ],
 4: [
  "Two hands in white cotton gloves sliding a rectangular glass pane out of the top of an oven door lying flat on a towel, holding the pane by its edges.",
  "Close-up of hands pulling on white cotton gloves, the bare edge of a glass pane visible on the towel beside them.",
  "Three rectangular glass panes laid side by side in a neat row on a clean grey towel, gloved hands setting down the last one, seen from above.",
  "A gloved hand tilting a glass pane toward the window light, one face showing a faint bronze reflective coating, close-up.",
  "Gloved hands stopped on a glass pane that is stuck halfway out of the oven door frame, an open plain instruction booklet with blurred pages next to it.",
  "Two gloved hands held open and raised just above a glass pane in the door frame, not touching it, a gentle stop gesture.",
  "A rectangular glass pane with a long visible crack running from one corner, lying on a towel, a gloved fingertip pointing at the crack.",
  "Two glass panes stacked on a towel with a soft folded cloth sandwiched between them, gloved hands lowering the top pane.",
 ],
 5: [
  "Hands washing a rectangular glass pane with a soft yellow sponge and soapy foam in a stainless steel kitchen sink.",
  "A fingertip spreading white baking soda paste over dark burnt-on spots on a glass pane lying on a towel, a small bowl of paste beside it, close-up.",
  "A grey steel wool pad, a tin of scouring powder with no label and a razor blade pushed to the far side of the countertop by a hand, a glass pane in the foreground.",
  "Hands polishing a clean wet glass pane with a white lint-free cloth, the glass becoming perfectly clear and streak-free, held up to the window light.",
  "A hand wiping the inside of an empty oven door frame with a damp cloth, narrow vent slots along the top edge of the frame, close-up.",
  "A cloth-covered fingertip cleaning the inner corner of a metal oven door frame, close-up.",
  "A thin damp cloth wrapped around a wooden ruler being slid into a narrow gap inside an oven door frame, close-up.",
 ],
 6: [
  "Gloved hands sliding a clean glass pane back into the top of an oven door lying flat on a towel, a smartphone with a blank dark screen lying beside it for reference.",
  "Close-up of the edge of a glass pane sitting correctly in its slot with a small black rubber spacer in place, a gloved fingertip pressing the spacer.",
  "A hand tightening a small screw on the metal trim strip of an oven door with a Phillips screwdriver, gentle grip, close-up.",
  "Close-up of a screwdriver stopped on a screw of the door trim, the hand relaxed and open on the handle, the glass pane just below.",
  "A fingertip running along the top edge of a reassembled oven door, a clean cloth in the other hand wiping the glass.",
  "A reassembled oven door held upright toward the window by two hands, the daylight shining through perfectly clear glass.",
 ],
 7: [
  "Two hands holding an oven door at a shallow angle and guiding its two metal hinge arms into the slots at the bottom of the oven opening, side view.",
  "A thumb flipping the small metal hinge lock lever back on a fully opened oven door hinge, close-up.",
  "A hand closing a clean oven door by its handle, the door moving smoothly, front view.",
  "A hand turning the oven control knob on, the oven light glowing warm inside behind a perfectly clear glass door.",
  "Close-up of the edge of a closed oven door meeting the oven frame, the grey rubber seal pressed evenly all around, a fingertip checking it.",
  "Two hands holding an oven door firmly on both sides while fitting it onto the oven, front view.",
  "A built-in oven with a sparkling clean glass door in a tidy kitchen, warm oven light on inside, wide front view.",
 ],
 8: [
  "A gloved hand holding a glass pane up to the window light and turning it over to inspect both faces, a faint cloudy film visible.",
  "Three glass panes standing side by side against a white wall on a towel, a fingertip pointing at the middle one.",
  "Close-up of a glass pane with a permanent milky white etched haze that a cloth cannot wipe off, a hand rubbing it with a cloth without effect.",
  "A fingertip pointing at the small blank silver rating plate inside the oven frame, a pen and a blank notepad on the countertop beside it.",
 ],
 9: [
  "An appliance technician's hands in dark work gloves holding a toolbox in front of a built-in oven, no face visible.",
  "Two hands letting go of an oven door that stays stuck halfway on its hinges, a coiled steel hinge spring visible at the bottom corner, close-up.",
  "A person in a mustard yellow shirt seen from behind walking out of the open front door of a house into the daylight, holding a phone, no face visible.",
  "A hand held back just in front of a white wall light switch without touching it, an open front door and daylight in the background.",
 ],
 10: [
  "A clean built-in oven with a clear glass door, a folded cloth on the countertop beside it, tidy kitchen, three-quarter view.",
  "Hands covering a roasting dish of chicken and vegetables with a loose sheet of aluminium foil on the countertop next to the oven.",
  "A hand sliding a flat metal baking sheet onto the lowest rack of an open oven, a roasting dish on the rack above it.",
  "A hand wiping the inside glass of an open, cool oven door with a damp microfiber cloth, light fresh splashes disappearing.",
  "Close-up of the grey rubber seal around an open oven cavity, completely untouched, while a hand wipes only the stainless steel front panel well above the oven opening with a folded cloth, the cloth clearly far away from the rubber seal.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "oven_door_glass.notes.json", "that make this job harder", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
