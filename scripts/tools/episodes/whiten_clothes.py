#!/usr/bin/env python3
"""Plans de l'épisode « How to Whiten Yellowed White Clothes ». Annotations dans whiten_clothes.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-10-whiten-yellowed-white-clothes"
TAIL = ("Photorealistic photograph for a practical home laundry how-to video. Bright, tidy laundry room with a white front-loading washing machine and a white utility sink, "
        "light wood countertop and white walls, soft daylight. Adult hands, rolled-up sleeves of a light blue denim shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "Two hands holding up a crisp, bright white cotton shirt by the shoulders, perfectly white under the arms and at the collar, a neat stack of bright white folded clothes on the countertop beside it, front view."
YOUNEED = ("Flat lay photographed from directly above on a light wood countertop, items neatly arranged with clear space between them: a small open glass jar of white baking soda powder, "
           "a clear glass bottle of white vinegar with no label, a plain white tub of white oxygen booster powder with a measuring scoop and no label, "
           "a small clear bottle of green liquid dish soap with no label, and a large empty white plastic bucket.")
MISTAKES = [
 "A white cotton shirt with clearly yellowed underarms lying on the countertop in the foreground, behind it two hands holding a plain white unlabeled bleach jug and a plain unlabeled spray bottle of cleaner tilted over the same bucket, about to mix them.",
 "A hand pouring far too much blue liquid detergent from an unlabeled bottle into the detergent drawer of a washing machine, the compartment overflowing and dripping, close-up.",
 "A hand pushing a white shirt with a clearly visible yellow underarm stain into the open drum of a white tumble dryer, close-up from the side.",
]
P = {
 1: [
  "Close-up of fingers holding the small blank white care label sewn inside the collar of a white cotton shirt, the label turned toward the light.",
  "Two hands rubbing the fabric of a white shirt between thumb and fingers to feel it, a steaming white utility sink tap running in the background, side view.",
  "Seen from above on the countertop: a pile of white cotton T-shirts on the left, and on the right a hand moving a white silk blouse and a white wool sweater aside, away from the pile.",
  "Hands sorting white laundry into two neat piles on the countertop, a separate laundry basket of colored clothes pushed to the far side, wide view.",
  "Close-up of a fingertip pointing at a metal button on a white shirt that also has a small colored printed pattern on the chest.",
  "Three neatly sorted piles of white clothes lined up on the countertop in a calm tidy laundry room, hands resting beside them, wide view.",
  "A hand lifting one white cotton shirt from a sorted pile, an empty white bucket waiting next to the utility sink in the background, three-quarter view.",
 ],
 2: [
  "A white shirt laid flat on the countertop with a yellow underarm stain facing up, a hand squeezing a few drops of green dish soap from an unlabeled bottle onto the stain, a small bowl of white baking soda paste beside it, from above.",
  "Close-up of a hand gently scrubbing the yellowed underarm area of a white shirt with an old toothbrush, light soapy foam on the fabric.",
  "Extreme close-up of soapy foam and white baking soda paste sitting on a yellow stain on white cotton fabric, the weave of the fabric visible.",
  "A hand holding a white shirt with a damp sweat stain away from a steaming hot water tap at the white utility sink, the shirt kept out of the water, side view.",
  "A fingertip spreading a second layer of white baking soda paste on an old yellow collar stain of a white shirt laid flat, the toothbrush resting beside it, close-up.",
 ],
 3: [
  "A large white plastic basin in the utility sink being filled with steaming hot water from the tap, a hand testing the stream, side view.",
  "A hand pouring a measuring cup of white baking soda into a basin of hot water while the other hand stirs with a wooden spoon, from above.",
  "Two hands pushing white shirts down into a basin of slightly cloudy hot water until they are covered, from above.",
  "Close-up of white cotton fabric floating just under the surface of slightly cloudy water in a white basin, calm water, soft light.",
  "A hand pouring clear white vinegar from an unlabeled glass bottle into a second basin of clean water, rinsed white shirts waiting in the sink beside it.",
  "A clear bottle of white vinegar and a plain white tub of oxygen booster powder standing far apart at opposite ends of the countertop, a hand pushing the tub further away, a soaking basin in the middle.",
  "A basin of soaking white clothes on the countertop covered with a large upside-down tray, a hand pressing the cover in place, wide view.",
 ],
 4: [
  "A hand tipping a scoop of white oxygen booster powder into a bucket of steaming hot water, the plain white unlabeled tub held in the other hand with its back turned to the camera.",
  "Close-up of a level measuring scoop of white powder held above a large bucket of clear water, a few grains falling.",
  "Close-up of two hands pulling on yellow rubber household gloves, a bucket of water on the countertop behind them.",
  "Two hands in yellow rubber gloves pressing white shirts fully under the water in a large bucket with a wooden spoon, from above.",
  "Close-up of tiny fine bubbles rising around white cotton fabric submerged in clear water in a white bucket.",
  "A gloved hand setting a white silk blouse and a white wool sweater aside on the countertop, far from the soaking bucket, side view.",
  "A gloved hand placing a screw-top jar lid upside down on the countertop, leaving a plastic container of soaking solution open and uncapped beside it, close-up.",
  "A white bucket of soaking white clothes with a lid resting loosely and slightly askew on top, a visible gap on one side, three-quarter view.",
 ],
 5: [
  "Two hands gently wringing a wet white shirt over the utility sink, the open door of the white front-loading washing machine in the background.",
  "A hand pouring a small measured amount of liquid detergent from a plain cap into the detergent drawer of the washing machine, the cap only partly filled, close-up.",
  "Close-up of a dull, greyish white T-shirt held next to a bright white one for comparison, the dull one looking slightly filmy.",
  "A hand sprinkling a measuring cup of white baking soda directly onto white clothes inside the open drum of a front-loading washing machine.",
  "The open drum of a front-loading washing machine loosely filled with white clothes only, clear empty space left at the top of the drum, a hand showing the free space, front view.",
  "Two hands holding a damp white shirt up near a bright window, inspecting the underarm area in the daylight, the shirt still wet.",
  "Two hands rinsing a soaked white shirt in a white bucket of clean water in the utility sink and squeezing it gently without twisting.",
 ],
 6: [
  "Bright white shirts hanging on a clothesline in strong sunshine against a clear blue sky, outdoors in a garden, low-angle view.",
  "Outdoors in a sunny garden, two hands pegging a damp white shirt onto a clothesline with wooden clothespins in direct sun, side view.",
  "Close-up of white cotton and linen fabric on a clothesline lit by strong direct sunlight, sun flare at the edge of the frame, outdoors.",
  "A hand held flat against the closed round door of a white tumble dryer in a stop gesture, the other hand holding a damp white shirt with a faint yellow mark, front view.",
  "A damp white shirt on a hanger hooked onto a curtain rail in front of a bright sunny window indoors, a hand adjusting the hanger.",
  "A hand lowering a white shirt with a faint remaining yellow underarm mark back into a basin of soaking water, from above.",
  "White shirts drying on a clothesline in a sunny garden, long sharp shadows on the grass below, wide view.",
  "Two hands unpegging a delicate thin white cotton blouse from a sunny clothesline and folding it into a laundry basket, outdoors.",
 ],
 7: [
  "A neat stack of bright white folded shirts on the countertop, a hand resting on top of the stack, tidy laundry room, three-quarter view.",
  "A hand dropping a white sports T-shirt straight into the open drum of the washing machine that contains only white clothes, front view.",
  "A hand turning the program dial of the washing machine, a small cap with a modest amount of liquid detergent standing on top of the machine, close-up.",
  "A hand pushing a plain pink unlabeled bottle of fabric softener to the back of a shelf, a pile of white laundry in the foreground.",
  "A plain white unlabeled deodorant stick standing on a bathroom shelf next to a clean folded white T-shirt, a hand reaching for the T-shirt.",
  "A hand placing clean folded white clothes on a wooden shelf inside a closed dark wardrobe, an empty cardboard box set aside on the floor outside it.",
  "A hand pouring a measuring cup of white baking soda into the drum of the washing machine filled with white towels and shirts, from the side.",
 ],
 8: [
  "Two hands holding a white shirt flat on the countertop and looking closely at a remaining yellow area on the fabric, from above.",
  "Hands lowering a white shirt with yellowed underarms into a basin of soaking water for a second time, a wooden spoon resting on the rim.",
  "Close-up of a fingertip pointing at small orange-brown rust spots on white cotton fabric, a small plain unlabeled bottle of fabric rust remover beside it.",
  "Close-up of a cotton swab dabbing a drop of clear liquid on the inside seam of a white shirt turned inside out.",
  "An old, evenly yellowed vintage white linen cloth with thin worn fibers lying on the countertop, a hand laying a brush down beside it and leaving it alone.",
 ],
 9: [
  "A delicate white garment on a hanger inside a clear garment bag, a hand holding the hanger, the counter of a dry cleaning shop in the background.",
  "Flat lay from above: a white silk blouse, a white wool sweater and a piece of white lace arranged on the countertop, a hand keeping them well away from a steaming basin at the edge of the frame.",
  "A white wedding dress and a small white christening gown hanging side by side on padded hangers in a bright room, a hand gently touching the lace.",
  "A hand pointing at a yellow stain on a white blouse laid on the counter of a dry cleaning shop, the hands of a dry cleaner in a white coat on the other side of the counter, no faces visible.",
  "A dry cleaner's hands in a white coat handing a spotless white blouse on a hanger across the shop counter to a customer's hands, no faces visible.",
 ],
 10: [
  "Close-up of the yellowed underarm area of a white shirt laid flat, a plain white unlabeled antiperspirant stick standing beside it.",
  "A hand laying a thin white undershirt flat on top of a white dress shirt on the countertop, both neatly smoothed, from above.",
  "A hand holding the underarm area of a white shirt under a stream of cold water from the tap of the white utility sink, no steam, close-up.",
  "A hand dropping a worn white shirt into a white laundry basket next to the washing machine, side view.",
  "The drum of a front-loading washing machine filled only halfway with white shirts, a hand taking one extra shirt back out to leave room, front view.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "whiten_clothes.notes.json", "that keep whites yellow", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
