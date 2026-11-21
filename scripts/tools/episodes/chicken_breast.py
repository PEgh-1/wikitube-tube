#!/usr/bin/env python3
"""Plans de l'épisode « How to Cook Chicken Breast Without Drying It Out ». Annotations dans chicken_breast.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-07-cook-chicken-breast-juicy"
TAIL = ("Photorealistic photograph for a home cooking how-to video. Bright, tidy kitchen, light wood countertop, a gas stovetop, a stainless steel skillet with a glass lid, "
        "soft daylight. Adult hands, rolled-up sleeves of a dark green cotton shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A golden-brown pan-seared chicken breast sliced on a light wood board, the slices fanned out showing a juicy white moist interior, a stainless steel skillet beside it, very appetizing, three-quarter view."
YOUNEED = ("Flat lay photographed from directly above on a light wood countertop, items neatly arranged with clear space between them: three raw boneless skinless chicken breasts on a white plate, "
           "a small bowl of coarse salt and a wooden pepper mill, a stainless steel skillet with its glass lid, a small bottle of plain golden cooking oil with no label, a wooden rolling pin, and a digital probe meat thermometer with a blank screen.")
MISTAKES = [
 "A raw chicken breast in a hot stainless steel skillet, clearly uneven, one end very thick and the other end thin and already dried out and curling, close-up.",
 "A hand cutting into a chicken breast in a skillet with a knife to peek inside, no thermometer anywhere, juices running out into the pan, close-up.",
 "A chicken breast sliced immediately after cooking on a light wood board, a large puddle of clear juices spreading across the board, steam rising, close-up.",
]
P = {
 1: [
  "Hands laying a raw boneless chicken breast between two sheets of baking paper on a light wood cutting board, seen from above.",
  "A hand pounding the thick end of a chicken breast covered with baking paper using a wooden rolling pin on a cutting board, side view.",
  "A chicken breast under baking paper flattened to an even moderate thickness, not too thin, a hand lifting the corner of the paper to check it, close-up.",
  "Two raw chicken breasts side by side on a board seen from the side at board level, one evenly thick from end to end, the other with a thick hump and a thin tail.",
  "A hand holding a large raw chicken breast flat on a board while a chef's knife slices it horizontally into two thinner cutlets, side view close-up.",
 ],
 2: [
  "A hand stirring a spoonful of salt into a large clear glass bowl of cold water with a spoon, a small bowl of coarse salt beside it, close-up.",
  "Two raw chicken breasts submerged in a clear glass bowl of water being placed on a shelf of an open, tidy refrigerator by two hands.",
  "Close-up of raw chicken breasts resting in clear salted water in a glass bowl, tiny bubbles on the surface of the meat, soft light.",
  "A hand sprinkling coarse salt generously from above onto a raw chicken breast lying on a white plate, salt crystals falling, close-up.",
  "A glass bowl of chicken breasts in brine standing next to a mechanical kitchen timer with a blank face on the countertop, calm mood.",
  "A covered glass container holding raw chicken breasts sitting on the middle shelf of a clean, bright refrigerator, door open.",
  "Hands washing a clear glass bowl with a soapy sponge under hot running water in a stainless steel sink, foam and steam.",
 ],
 3: [
  "Hands pressing a paper towel onto a raw chicken breast on a cutting board to dry it, a bowl of brine pushed aside, close-up.",
  "Two raw chicken breasts side by side on a board, one perfectly dry and matte, the other wet and glistening with drops of water, seen from above.",
  "A kitchen tap running into an empty stainless steel sink, a hand holding a plate with a raw chicken breast well away from the water, not rinsing it.",
  "A hand brushing a thin coat of oil onto a raw chicken breast with a silicone brush, small bowls of paprika, garlic powder and pepper beside it.",
  "A hand sprinkling a pinch of coarse salt onto an oiled, spice-coated raw chicken breast on a board, close-up.",
  "Hands being washed with soapy foam under running water at a kitchen sink, a used cutting board waiting beside the sink.",
  "Three small white bowls of smoked paprika, garlic powder and dried thyme on a light wood countertop, a spoon mixing them in a fourth bowl, seen from above.",
 ],
 4: [
  "A hand pouring a thin stream of oil into an empty stainless steel skillet on a lit gas burner, medium-high blue flame visible.",
  "Tongs laying a seasoned raw chicken breast into a hot oiled stainless steel skillet, smooth side down, oil shimmering around it.",
  "Close-up of a chicken breast sizzling in a hot skillet, small oil bubbles all around its edge, light wisps of steam.",
  "A chicken breast cooking untouched in a stainless steel skillet on a gas burner, hands resting on the countertop away from the pan, a mechanical kitchen timer with a blank face beside the stove.",
  "A stainless steel skillet seen from above with two chicken breasts and plenty of empty space between and around them.",
  "A plate with two more raw seasoned chicken breasts waiting next to the stove while two others cook in the skillet, side view.",
  "Close-up of the deep golden-brown seared crust on the underside of a chicken breast being lifted slightly with tongs in a skillet.",
  "A hand turning the gas burner knob down a little under a stainless steel skillet from which a little too much smoke is rising.",
  "Close-up of a chicken breast in a skillet with an even deep golden-brown surface, no blackened or burnt spots.",
 ],
 5: [
  "Tongs flipping a chicken breast in a stainless steel skillet, the golden-brown seared side now facing up, the other hand holding a glass lid ready.",
  "A glass lid covering a stainless steel skillet with two golden chicken breasts inside, condensation and steam visible under the glass, low blue flame.",
  "A covered skillet on a low gas flame with a mechanical kitchen timer with a blank face on the countertop beside the stove.",
  "A hand hovering just above the knob of a glass lid on a covered skillet without lifting it, steam trapped inside.",
  "Close-up of a low, gentle blue gas flame under a covered stainless steel skillet, condensation dripping inside the glass lid.",
  "Two thin chicken cutlets cooking in a stainless steel skillet, a hand lifting the glass lid slightly to check them early.",
 ],
 6: [
  "A digital probe meat thermometer with a blank screen held ready in a hand above a skillet with two golden chicken breasts.",
  "Close-up of a thin metal thermometer probe pushed sideways into the thickest part of a golden chicken breast in a skillet, the tip not touching the pan.",
  "Close-up of a golden cooked chicken breast with a thermometer probe inserted in its centre, a hand holding the thermometer steady, steam rising gently.",
  "Tongs lifting a golden chicken breast out of a skillet toward a clean white plate held next to the stove.",
  "A hand placing the glass lid back on a skillet containing one chicken breast, a thermometer lying on the countertop beside the stove.",
  "A knife cut gaping open in the middle of a chicken breast in a skillet, clear juices running out into the pan, close-up.",
  "A thermometer probe inserted into the second of two chicken breasts in a skillet, the first one already on a plate beside the stove.",
 ],
 7: [
  "Two golden cooked chicken breasts resting untouched on a clean light wood board, a mechanical kitchen timer with a blank face beside them.",
  "Close-up of a whole golden chicken breast resting on a board, its surface glistening and moist, no juices on the board.",
  "A hand draping a loose tent of aluminium foil over two cooked chicken breasts resting on a board.",
  "A chef's knife slicing a cooked chicken breast across its width into even thick slices on a board, the interior white and visibly juicy, close-up.",
  "A fresh green salad in a white bowl topped with slices of golden chicken breast, seen from above, bright and appetizing.",
  "A hand placing a glass container of sliced cooked chicken with its lid into a tidy refrigerator.",
  "A wheat wrap being rolled by two hands around slices of chicken breast, lettuce and tomato on a board, a lunch box beside it.",
 ],
 8: [
  "A slice of slightly dry, fibrous cooked chicken breast held up on a fork above a plate, a pan of broth in the background.",
  "Thin slices of chicken breast warming in a small saucepan of golden broth on a low flame, a ladle resting in the pan.",
  "Two forks shredding a cooked chicken breast into strands on a board, soft corn tortillas and a bowl of soup nearby.",
  "A cooked chicken breast cut open on a board showing a slightly pink centre, a hand holding a thermometer next to it, undecided.",
  "Two cut chicken breast halves side by side on a board, one faintly pink inside and one white, a thermometer probe lying between them.",
  "Tongs returning a cut chicken breast to a stainless steel skillet on a lit burner, a thermometer in the other hand.",
 ],
 9: [
  "A digital probe meat thermometer with a blank screen lying on a clean light wood countertop, a hand reaching for it.",
  "A thermometer probe standing in a tall glass filled with ice cubes and water, a hand holding the thermometer upright, close-up.",
  "A hand holding a simple dial meat thermometer and adjusting the small nut under its dial with a little wrench, a glass of ice water beside it.",
  "Side view close-up of a thermometer probe sliding horizontally into the thickest part of a cooked chicken breast held with tongs above the pan.",
  "A hand holding a thermometer perfectly still in a chicken breast on a plate, a patient waiting gesture, blank screen.",
  "A hand washing the metal probe of a thermometer with a soapy sponge under hot running water at a sink.",
 ],
 10: [
  "Slices of cooked chicken breast spread in a single layer in a shallow glass container on the countertop, a hand holding the lid ready.",
  "A frosted freezer bag of cooked chicken slices being placed on a plate on the lower shelf of a refrigerator to thaw.",
  "A plate of reheated chicken slices with clear steam rising from them, a thermometer probe inserted in one slice.",
  "A hand pouring a small splash of broth over chicken slices in a glass dish, a lid ready to cover it, close-up.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "chicken_breast.notes.json", "that dry out chicken breast", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
