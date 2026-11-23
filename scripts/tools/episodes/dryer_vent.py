#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean Your Dryer Vent ». Annotations dans dryer_vent.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-12-clean-dryer-vent"
TAIL = ("Photorealistic photograph for a practical home maintenance how-to video. A bright tidy laundry room with a white front-loading tumble dryer, "
        "white walls, a light wood shelf and a light tiled floor, soft daylight. Adult hands, rolled-up sleeves of a dark green cotton shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = ("A white front-loading tumble dryer pulled slightly away from the wall, a clean shiny short metal vent duct connecting its back to the wall, "
        "a hand holding a long flexible brush rod next to a large pile of grey lint in a bucket on the floor, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood surface, items neatly arranged with clear space between them: a dryer vent brush kit made of a round bristle brush head and several white flexible rods, "
           "a grey vacuum hose with its nozzle, a screwdriver with a red handle, a roll of silver foil tape next to a pair of grey work gloves, and a black flashlight.")
MISTAKES = [
 "Two bare hands reaching behind a white tumble dryer to grab a silver vent duct clogged with grey lint, while the dryer's power cord is still clearly plugged into the wall socket in the foreground, close-up from the side.",
 "Behind a white tumble dryer, a very long thin crumpled foil flexible duct sagging in several loose bends on the floor, partly crushed against the wall, grey lint spilling from a small tear, a fingertip pointing at it.",
 "Close-up of the round opening of a dryer vent duct completely blocked by a thick, old, compacted mat of grey lint and dust, a gloved hand holding a flashlight shining on it.",
]
P = {
 1: [
  "A hand pulling the dryer's power plug out of a white wall socket next to the dryer, the cord hanging loose, close-up.",
  "Close-up behind a dryer of a hand turning the yellow lever of a small gas shut-off valve on a metal pipe to the closed position, the yellow flexible gas line still connected and untouched.",
  "A hand holding a smartphone with a blank dark screen in front of the dryer, the other hand resting hesitantly on the top of the machine, front view.",
  "A palm resting flat on the top of the switched-off dryer to feel that it is cool, the round door left open, side view.",
  "Hands pulling on grey work gloves in front of the dryer, a white dust mask lying on top of the machine, an open window behind, the floor around the dryer clear and empty.",
  "Close-up of the unplugged power plug lying on top of the white dryer, a gloved hand resting beside it.",
 ],
 2: [
  "Two gloved hands gripping the front corners of the dryer and sliding it slowly away from the wall, a narrow gap opening behind it, side view.",
  "Two people's hands on each side of the dryer moving it together, a flattened sheet of brown cardboard under its front feet protecting the floor, no faces visible.",
  "View from above into the gap behind the dryer, a silver vent hose and a black power cord hanging with some slack, a gloved fingertip pointing at them.",
  "Close-up behind the dryer of a gloved hand gently guiding a silver vent hose in a loose, uncrushed curve, a yellow flexible gas line beside it in a smooth curve without any kink.",
  "A dryer fitted tightly into a narrow closet alcove with walls close on both sides and no room to move it, two gloved hands held open in front of it, front view.",
  "A hand holding a smartphone with a blank dark screen and a bunch of apartment keys in the other hand, standing in front of the dryer, close-up.",
 ],
 3: [
  "The back of a dryer pulled away from the wall, a silver vent duct running from the round outlet of the dryer to a round opening in the wall, a gloved fingertip pointing at the duct, wide side view.",
  "Close-up of a metal screw clamp around the end of a silver duct on the back of a dryer, a strip of silver foil tape wrapped around the joint just beside it.",
  "A gloved hand loosening a metal duct clamp with a red-handled screwdriver while the other hand gently pulls the silver duct off the dryer outlet, close-up.",
  "A gloved hand shining a black flashlight into the open end of a detached silver duct, seen from just behind the hand.",
  "Close-up of the open end of a detached dryer duct packed full of thick grey lint, gloved fingers pulling out a big fluffy clump.",
  "Gloved hands holding up a thin white plastic flexible duct that is crushed flat in one place and has a small hole, inspecting it in the daylight.",
  "A gloved hand tightening a metal clamp with a red-handled screwdriver on a clean silver duct fitted on the round wall opening, close-up.",
 ],
 4: [
  "Hands screwing a round bristle brush head onto a white flexible rod, a cordless drill attached to the other end of the rod, lying on the floor behind the dryer, seen from above.",
  "A cordless drill spinning a white flexible rod that feeds a round brush into the round duct opening in the wall, a spare rod section lying ready on the floor, side view.",
  "Two gloved hands pushing and pulling a white flexible rod in and out of the duct opening in the wall, loose tufts of grey lint falling out onto the floor, close-up.",
  "A grey vacuum hose nozzle sucking up a pile of grey lint on the floor right under the duct opening in the wall, a gloved hand holding the hose.",
  "Outdoors, in front of the light exterior wall of a house: gloved hands feeding a white flexible rod with a round brush into the dryer vent hood on the wall, side view.",
  "Close-up of a round bristle brush head pulled out of the duct opening almost clean, with only a tiny wisp of lint on it, a large pile of grey lint already on the floor beside it.",
  "Close-up of gloved hands holding a white dust mask by its elastic straps at chest height, a lint-covered brush rod in the background.",
  "A very long metal duct running along a basement ceiling with several elbow bends, a gloved hand pointing up along it, wide view from below.",
 ],
 5: [
  "Outdoors: the light exterior wall of a house with a white dryer vent hood mounted low on the wall, a gloved hand pointing at it, green lawn in front, wide view.",
  "Outdoors, close-up of a fingertip lifting the white flap of a dryer vent hood on an exterior wall, the flap swinging open easily.",
  "Outdoors, close-up of gloved fingers pulling a clump of grey lint, dry leaves and small twigs out of the opening of a dryer vent hood on an exterior wall.",
  "Outdoors, close-up of a gloved hand taking a small round wire mesh screen clogged with grey lint off the opening of a dryer vent hood.",
  "Outdoors: a hand wiping a white dryer vent hood on an exterior wall with a damp blue cloth, a small hand brush held in the other hand.",
  "Outdoors, close-up of a dryer vent hood whose flap is pushed wide open by the air flowing out, a bare open palm held in front of it to feel the airflow.",
  "Outdoors, close-up of a dryer vent hood whose flap hangs almost closed, barely moving, an open palm held in front of it feeling very little air.",
  "Outdoors: a dryer vent hood on an exterior wall with a green bush trimmed well back from it, a gloved hand holding garden shears beside the cut branches, clear space around the vent.",
 ],
 6: [
  "A hand pulling the flat lint screen out of its slot in the rim of the open round dryer door, the other hand peeling a thick grey sheet of lint off the mesh, close-up.",
  "Hands scrubbing a dryer lint screen with a soft brush and soapy foam under warm running water in a white utility sink, close-up.",
  "A clean, wet dryer lint screen standing upright on a folded towel next to a sunny window to dry, a hand setting it down.",
  "A hand pushing the long narrow crevice attachment of a vacuum hose down into the empty lint trap slot at the rim of the open dryer door, close-up.",
  "A hand dropping a ball of grey lint into a small white bin next to the dryer, the other hand holding the clean lint screen, a laundry basket of dry folded clothes beside it.",
  "One palm resting on the top of the dryer and pulling back slightly as if it were hot, the other hand holding a visibly damp, wrinkled towel just taken out of the open drum.",
 ],
 7: [
  "Two gloved hands pushing the end of a shiny metal duct onto the round outlet at the back of the dryer, close-up from the side.",
  "Gloved hands holding a shiny semi-rigid aluminium duct, an old crumpled thin foil duct and a white plastic duct discarded on the floor beside it.",
  "A short, straight shiny metal duct between the back of the dryer and the wall, a gloved hand pressing silver foil tape around one joint, a metal clamp on the other joint, side view.",
  "Two hands pushing the dryer gently back toward the wall, the metal duct behind it round and uncrushed with a small gap left, the power plug back in the wall socket, seen from above at an angle.",
  "Outdoors, close-up of a dryer vent hood on an exterior wall, its flap held wide open by a strong stream of air, an open palm in front of it.",
  "A hand hanging a coiled dryer vent brush kit on a hook on the laundry room wall, next to a plain wall calendar with empty unprinted squares where the other hand marks one square with a pen.",
 ],
 8: [
  "A hand opening the round dryer door, the other hand holding up a shirt that is still visibly damp, more damp clothes in the drum.",
  "Outdoors, close-up of a dryer vent hood on an exterior wall with its flap lifted fully horizontal by the air coming out, a fingertip pointing at the flap.",
  "A hand pouring a little water from a small glass onto a dryer lint screen held flat over a white utility sink, close-up.",
  "Close-up of water sitting in a shiny puddle on top of the fine mesh of a lint screen instead of passing through, a soft brush held ready beside it.",
  "A black flashlight lighting the space behind the dryer, showing a silver duct sharply bent and crushed flat between the machine and the wall, seen from above.",
  "An open dryer drum stuffed completely full of clothes, a hand pulling some of them out into a laundry basket on the floor, front view.",
 ],
 9: [
  "A metal dryer duct rising from behind the dryer and disappearing into the ceiling, a hand holding a single short brush rod that clearly cannot reach that far, wide view.",
  "A technician's hands in dark work gloves, standing on a stepladder, feeding a long professional rotary cleaning hose into a round duct opening in the ceiling, no face visible.",
  "A technician's hands in dark work gloves inspecting the yellow flexible gas line and its valve behind a dryer with a flashlight, no face visible, close-up.",
  "A person in a dark green shirt seen from behind walking out of the open front door of a house into the daylight, holding a phone, no face visible.",
  "A hand pulling the dryer's power plug out of the wall socket, a technician's closed toolbox standing on the floor next to the dryer.",
 ],
 10: [
  "A tidy laundry room with a white dryer, a laundry basket of folded towels on top and a clear floor, a hand closing the round door, wide view.",
  "A hand peeling a thin grey sheet of lint off the dryer lint screen above the open round door, a basket of freshly dried laundry beside it, close-up.",
  "A fingertip pressing the power button to switch the dryer off, the other hand holding a jacket and house keys, ready to leave, close-up.",
  "A hand holding a kitchen cloth stained with dark cooking oil over a separate bucket on the floor, well away from the open, empty dryer drum.",
  "A white round smoke alarm on the ceiling of the laundry room above the dryer, the floor around the machine completely clear, wide view from a low angle.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "dryer_vent.notes.json", "that make this job risky", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
