#!/usr/bin/env python3
"""Plans de l'épisode « How to Cook Steak Perfectly in a Pan ». Annotations dans cook_steak.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
ID = "2026-11-22-cook-steak-in-a-pan"
TAIL = ("Photorealistic photograph for a home cooking how-to video. Bright, tidy kitchen, light wood countertop, a stovetop hob, a black cast iron skillet, "
        "soft daylight. Adult hands, rolled-up sleeves of a blue denim shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A perfectly seared ribeye steak sliced on a light wood board, deep brown crust and a juicy pink centre, the black cast iron skillet with melted butter and thyme beside it, very appetizing, three-quarter view."
YOUNEED = "Flat lay photographed from directly above on a light wood countertop, items neatly arranged with clear space between them: a thick raw ribeye steak on a plate, a small bowl of coarse salt and a pepper grinder, a black cast iron skillet, a probe meat thermometer, a small bottle of plain golden oil, a block of butter, two garlic cloves and a sprig of fresh thyme."
MISTAKES = [
 "A wet raw steak with beads of water on its surface being laid in a lukewarm skillet, the pan barely warm and the meat turning grey and steaming, close-up.",
 "Close-up of a metal spatula pressing down hard on a searing steak in a black cast iron skillet on a lit gas burner, juices squeezing out around the meat, only the spatula and its handle touch the steak, no hand near the pan.",
 "A freshly cooked steak cut open right out of the pan on a light wood board, a puddle of red juices running out across the board, close-up.",
]
S = {
 1: [
  ("Step one. Choose a steak that is at least one inch thick, because thin steaks overcook before they brown.", "Two raw steaks side by side on a light wood board, one thick and one thin, a hand holding a small ruler beside the thick one, no markings readable."),
  ("Ribeye, strip and sirloin are all excellent.", "Three different raw steaks, a marbled ribeye, a strip and a sirloin, laid out on a white butcher paper on the countertop, seen from above."),
  ("Take the meat out of the fridge about thirty minutes before cooking, so the chill comes off the surface.", "A hand taking a thick raw steak on a plate out of an open fridge, a kitchen timer standing on the counter beside it."),
  ("Then pat it completely dry with paper towels, on every side.", "Hands pressing a paper towel onto the top of a thick raw steak on a board, close-up."),
  ("This is the most important part of this step, because water on the meat turns to steam in the pan, and steamed meat turns grey instead of brown.", "A wet raw steak with beads of water on its surface lying in a black cast iron skillet on a lit gas burner, white steam rising around it and the underside turning pale grey instead of brown, close-up, no hands."),
  ("A dry steak browns in minutes. Thicker cuts forgive small timing errors, which is ideal when you're learning.", "A thick raw steak, perfectly dry, resting on a clean board with a pile of used paper towels beside it, three-quarter view."),
 ],
 2: [
  ("Step two. Season the steak on all sides, including the edges, with coarse salt and freshly ground black pepper.", "A hand grinding black pepper from a wooden pepper mill over a raw steak on a board, coarse salt flakes already on the surface, close-up."),
  ("Be generous, since much of the seasoning falls off in the pan, and a thick steak needs more salt than you think.", "A hand sprinkling a generous pinch of coarse salt from a small bowl from high above onto a thick raw steak, grains scattering."),
  ("For the best flavor, salt it as soon as you take it out of the fridge, so the salt has half an hour to be absorbed.", "A salted raw steak resting on a wire rack over a tray on the counter, an analogue kitchen timer with no readable numbers beside it."),
  ("If you are in a rush, salt it just before it hits the pan.", "A hand salting a raw steak held right next to the black skillet on the hob, ready to be placed in the pan."),
  ("Avoid salting and then waiting five minutes, because that draws out moisture and leaves the surface wet.", "Close-up of a raw salted steak resting on a light wood board, small beads of moisture pooling on its wet glistening surface, a simple mechanical kitchen timer with a blank face beside it, no hands."),
  ("Press the seasoning gently into the meat so it sticks.", "A fingertip pressing coarse salt and pepper gently into the surface of a raw steak, close-up."),
 ],
 3: [
  ("Step three. Place a heavy skillet over medium-high to high heat and let it heat for three to five minutes, until it is really hot.", "A black cast iron skillet sitting empty on a lit gas burner with a blue flame beneath it, seen from a high three-quarter angle."),
  ("Add a tablespoon of oil with a high smoke point, like avocado, canola or sunflower, and wait until it shimmers and just starts to smoke.", "Golden oil poured from a plain bottle into the hot black skillet, the oil shimmering with a thin wisp of smoke rising, close-up."),
  ("A hot pan is what creates the brown crust, which is where most of the flavor lives.", "Close-up of the glossy shimmering oil covering the bottom of a very hot black cast iron skillet."),
  ("Don't use olive oil or butter at this point, because they burn too fast.", "A plain bottle of green olive oil and a block of butter on the counter pushed aside, away from the hot skillet on the hob."),
  ("Turn on your extractor fan and open a window.", "A hand pressing a button on a stainless steel extractor hood above the hob, a bright open window in the background."),
  ("If your pan smokes heavily, lower the heat slightly rather than starting again.", "A hand turning down a knob on the stovetop, a thin curl of smoke rising from the black skillet on the hob."),
 ],
 4: [
  ("Step four. Lay the steak in the pan, away from you, so the oil doesn't splash toward you.", "Hands holding a raw steak with tongs, lowering it into a hot black skillet in a direction away from the camera, close-up."),
  ("It should sizzle loudly right away.", "Close-up of a thick raw steak sizzling in a very hot black cast iron skillet on a lit gas burner, oil bubbling vigorously all around the edges of the meat, light smoke rising, no hands, no utensils."),
  ("Now leave it alone. Don't poke, press or slide it.", "A steak searing undisturbed in the black skillet, a hand with tongs held back and not touching it."),
  ("For a one inch steak, sear for about two to three minutes, until a deep brown crust forms and the meat releases from the pan on its own.", "A kitchen timer with no readable numbers standing beside the hob, a steak searing in the black skillet with a brown crust forming at its edges."),
  ("If it sticks, it isn't ready to turn.", "Tongs gently lifting one corner of a steak, which is still stuck to the black skillet, seen close-up."),
  ("Use tongs to sear the fatty edge for thirty seconds too.", "Tongs holding a steak on its side so the fatty edge is pressed against the surface of the hot black skillet."),
  ("Resist the urge to flip it early, because patience builds the crust. The sound tells you everything, so listen for a steady, strong sizzle.", "A steak sizzling steadily in the black skillet, seen from above, a rich dark crust spreading across the visible surface."),
 ],
 5: [
  ("Step five. Turn the steak over with tongs, and lower the heat to medium.", "Tongs flipping a steak in the black skillet, revealing a deep brown seared crust on the upper side, close-up."),
  ("Add a tablespoon or two of butter, a few crushed garlic cloves and a sprig of thyme.", "A piece of butter, crushed garlic cloves and a sprig of thyme added next to the steak in the black skillet, butter just starting to melt."),
  ("When the butter foams, tilt the pan slightly and spoon the melted butter over the steak again and again for about a minute.", "A hand tilting the black skillet while a metal spoon scoops foaming butter over the steak, close-up."),
  ("Basting adds flavor and cooks the top gently.", "Golden foaming butter with garlic and thyme being spooned over the top of a steak, a glossy sheen on the crust."),
  ("Cook the second side for another two to three minutes, depending on thickness.", "A steak cooking in the black skillet with butter bubbling around it, an analogue kitchen timer with no readable numbers next to the hob."),
  ("Keep the heat moderate so the butter turns nutty and golden, not burnt and bitter.", "Close-up of golden brown nutty butter foaming around a steak in the skillet, with no burnt black bits."),
  ("If your steak is very thick, finish it in a hot oven, at around 200 degrees Celsius or 400 Fahrenheit, for a few minutes.", "A hand in an oven glove sliding the black skillet with the steak into an open hot oven."),
 ],
 6: [
  ("Step six. The most reliable way to judge doneness is a thermometer pushed into the thickest part of the steak.", "A digital probe meat thermometer with its tip pushed into the thickest part of a steak in the skillet, display not readable, close-up."),
  ("Remove the steak from the pan at about 125 degrees Fahrenheit, or 52 Celsius, for rare, 130 to 135, or 54 to 57 Celsius, for medium-rare, and 140, or 60 Celsius, for medium.", "Three steak slices lined up on a light wood board from rare to medium, a deep red centre, a pink centre and a light pink centre, seen from above."),
  ("The temperature rises a few degrees while it rests.", "A steak with a probe thermometer inserted, resting on a board, a faint wisp of steam rising from the meat."),
  ("Food safety agencies advise 145 degrees Fahrenheit, or 63 Celsius, for whole cuts of beef, so choose the doneness that you are comfortable with.", "A cooked steak with a thermometer probe in its centre on a warm plate, seen from above, display not readable."),
  ("Insert the probe from the side, and avoid touching bone or the pan.", "A thin thermometer probe pushed horizontally into the side of a steak in the skillet, its tip reaching the centre, close-up."),
 ],
 7: [
  ("Step seven. Move the steak to a board or a warm plate and let it rest for at least five minutes, and up to ten for a very thick cut.", "Tongs lifting a cooked steak out of the black skillet onto a light wood board, a kitchen timer with no readable numbers beside it."),
  ("During cooking, the juices are pushed to the center. Resting lets them spread back through the meat, so they stay in the steak instead of running onto the board.", "A seared steak with a deep brown crust resting untouched on a light wood cutting board, a simple mechanical kitchen timer with a blank face beside it, the black skillet off the heat in the background, no knife, no hands."),
  ("Then look for the direction of the muscle fibres, the grain, and slice across it.", "A knife held over a cooked steak on a board, the fine lines of the muscle fibres visible on the surface, close-up from above."),
  ("Short fibres feel more tender in your mouth.", "Close-up of tender slices of steak fanned out on a board, each slice cut across the grain with a rosy pink centre."),
  ("Spoon the pan butter over the slices and serve immediately.", "A spoon pouring golden garlic butter from the skillet over sliced steak on a plate with a sprig of thyme, very appetizing."),
 ],
 8: [
  ("If your steak turned grey, the pan was not hot enough, or you cooked too much meat at once.", "A pale grey steak with no crust in a lukewarm black skillet, seen from above, steam rising around it."),
  ("Cook one or two steaks at a time.", "Two steaks searing in a large black skillet with plenty of space around them, seen from above."),
  ("If the kitchen fills with smoke, switch on the fan and check that your oil has a high smoke point.", "A hand switching on the extractor hood above the hob while a light haze of smoke rises from the black skillet."),
  ("Add the butter late, because it burns quickly.", "A knob of butter held on a spoon next to the skillet, ready to be added late, steak almost finished in the pan."),
 ],
 9: [
  ("For a very thick steak, try a reverse sear. Cook it first in a low oven, around 250 degrees Fahrenheit or 120 Celsius, until it is about fifteen degrees below your target temperature.", "A very thick steak on a wire rack over a baking tray inside a lit oven, a probe thermometer in the meat, close-up."),
  ("Then sear it in a very hot pan.", "A thick pale-brown roasted steak being laid with tongs into a smoking hot black skillet."),
  ("After resting, add a splash of stock to the pan for a quick sauce.", "A small splash of dark stock poured from a small jug into the black skillet with browned bits, a rested steak on a board nearby."),
 ],
 10: [
  ("Put leftover steak in a covered container in the fridge within two hours, and eat it within three to four days.", "A hand putting a covered glass container with leftover steak slices into a fridge, shelves tidy."),
  ("Cold sliced steak is wonderful in salads and sandwiches.", "A fresh green salad in a white bowl topped with thin cold slices of steak, seen from above."),
  ("To reheat it, use a low oven or a pan with a little butter, so it does not turn tough.", "Steak slices gently warming in the black skillet with a little butter on low heat, close-up."),
  ("Make it steaming hot all the way through.", "A plate of reheated steak slices with a light steam rising from them, seen close-up."),
 ],
}
def patch(ep):
    ep["hook"] = ("Restaurant steaks cost a fortune, and cooking one at home can go wrong in a hurry, with grey meat and a smoky kitchen. "
                  "But in seven simple steps, you can cook a juicy steak with a deep brown crust in a regular pan, in about fifteen minutes. "
                  "No special equipment is required, apart from a good pan, and I'll show you how to fix the most common problems.")
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "cook_steak.notes.json", "that ruin most steaks", patch=patch, youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5], [0.5, 0.5], [0.5, 0.5]])
