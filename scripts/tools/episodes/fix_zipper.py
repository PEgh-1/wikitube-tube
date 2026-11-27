#!/usr/bin/env python3
"""Plans de l'épisode « How to Fix a Zipper ». Annotations dans fix_zipper.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-11-18-fix-a-zipper"
W = "On a light wooden table next to a bright window, a plain navy-blue jacket with a silver metal zipper lying flat on the table: "
T = "On a light wooden table next to a bright window: "
TAIL = ("Photorealistic photograph for a practical home how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a mustard-yellow cotton shirt, "
        "only hands and forearms in the frame, no head, no face. Plain clothing with no brand tag and no label. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (W + "a hand pulling the zipper slider smoothly up the fully closed, perfectly aligned zipper, small needle-nose pliers resting beside the jacket, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood surface, items neatly arranged with clear space between them: a pair of needle-nose pliers, a plain yellow graphite pencil with no markings next to a plain white bar of soap, "
           "a pair of metal tweezers, one small silver zipper slider, and a small folded piece of plain grey cloth. No packaging, no labels.")
MISTAKES = [
 W + "a hand yanking the zipper slider hard upward while the other hand grips the jacket, the fabric bunched and caught in the slider, the teeth bending, close-up.",
 W + "a hand dripping yellow oil from a small plain glass bottle onto the zipper teeth, a dark greasy stain spreading on the navy fabric beside the zipper, close-up.",
 W + "a hand squeezing the small metal zipper slider very hard with large pliers, the slider visibly crushed and bent out of shape, close-up.",
]
P = {
 1: [
  W + "two hands holding the zipper up toward the window light to look at it closely, close-up.",
  W + "macro close-up of a fold of navy fabric caught between the metal teeth right at the slider, a fingertip pointing at it.",
  W + "macro close-up of a zipper whose metal teeth have separated and gaped open just below the slider, the slider pulled halfway up, a fingertip pointing at the gap.",
  W + "macro close-up of a zipper slider hanging on only one row of teeth, the other row of teeth loose and free beside it.",
  W + "fingers moving the zipper slider slowly along the teeth, the other hand holding the bottom of the zipper taut, close-up.",
  W + "macro close-up of a metal zipper with a gap where several teeth are missing and one tooth bent sideways, a fingertip pointing at the gap.",
  W + "an open hand held still above the zipper in a calm stop gesture, the slider stuck halfway, close-up.",
  W + "a hand holding a smartphone with a dark blank screen above the damaged zipper, as if taking a photo, seen from behind the hand.",
 ],
 2: [
  W + "a hand letting go of the zipper slider, fingers open, a fold of navy fabric clearly caught in the slider, close-up.",
  W + "macro close-up of metal tweezers gently pulling a fold of fabric out from between the zipper teeth, the slider moved slightly back below the snag.",
  W + "fingertips easing a tiny bit of fabric out of a zipper slider with a pin, very careful slow gesture, macro close-up.",
  W + "one hand pressing the zipper flat on the table while the other hand wiggles the slider with two fingertips, close-up.",
  W + "macro close-up of the tip of a small sewing needle lifting a caught thread out of the zipper teeth beside the slider.",
  W + "fingertips smoothing the navy fabric next to the zipper to inspect it, a few pulled threads visible, close-up.",
  W + "small scissors trimming a few loose threads next to the zipper teeth, macro close-up.",
  W + "a hand slowly pulling the freed zipper slider up the teeth, the fabric lying flat on both sides, close-up.",
  W + "fingers pulling a zipper slider that moves but clearly resists, the other hand holding the jacket taut, a plain pencil lying ready on the table beside it.",
 ],
 3: [
  W + "macro close-up of dusty, dull metal zipper teeth with fine grit between them, a fingertip touching the slider.",
  W + "a hand rubbing the tip of a plain graphite pencil along the metal teeth of the zipper, a plain white bar of soap and a short white candle stub on the table beside it, close-up.",
  "On a light wooden table next to a bright window, a plain white cotton jacket with a zipper lying flat on the table: a hand rubbing a plain white bar of soap along the zipper teeth, close-up.",
  W + "a hand brushing the zipper teeth with an old toothbrush dipped in a little water, a small glass of water beside it, close-up.",
  W + "a hand gliding the zipper slider easily all the way up the zipper in one smooth motion, close-up.",
  T + "a hand rubbing a short white candle stub along the dusty zipper of a brown leather boot, a plain grey backpack and a folded green tent bag beside it.",
  W + "a hand putting a plain pencil and a bar of soap into a small open sewing box on the table, the jacket zipped up beside it.",
 ],
 4: [
  W + "macro close-up of a zipper slider pulled halfway up with the metal teeth gaping open below it, a fingertip pointing at the slider.",
  W + "a hand laying a small piece of plain grey cloth over the zipper slider at the very bottom of the zipper, close-up.",
  W + "needle-nose pliers gently squeezing one side of a zipper slider wrapped in a small piece of grey cloth, the other hand holding the zipper, macro close-up.",
  W + "a hand pulling the slider up to test the zipper, the teeth closing neatly behind it, needle-nose pliers held ready in the other hand, close-up.",
  W + "needle-nose pliers held barely touching a zipper slider, the hand visibly relaxed and gentle, macro close-up.",
  W + "macro close-up of a metal zipper slider with a thin visible crack along its side, held between two fingertips.",
  W + "a hand zipping the jacket zipper up in a quick motion, the closed teeth perfectly aligned along the whole length, close-up.",
  W + "needle-nose pliers giving one more tiny squeeze to a zipper slider covered by a grey cloth, close-up.",
  W + "a hand holding a zipper slider that has come completely off, lying in the open palm above the two separate rows of zipper teeth.",
 ],
 5: [
  W + "needle-nose pliers gripping and lifting the small metal stop at the very bottom end of the zipper, macro close-up.",
  W + "fingers feeding both rows of zipper teeth evenly into the bottom of a metal slider, the two rows held side by side, macro close-up.",
  W + "a hand pulling the slider a short way up the zipper, a few centimetres of teeth closed neatly below it, close-up.",
  W + "macro close-up of a zipper where the two rows of teeth are misaligned and crossed over each other just above the slider, a fingertip pointing at it.",
  W + "a hand sewing a few firm stitches with thick thread and a needle across the bottom end of the zipper tape, macro close-up.",
  "On a light wooden table next to a bright window, a plain grey backpack with a black plastic zipper lying on the table: fingertips very gently guiding a slider onto black plastic zipper teeth, close-up.",
 ],
 6: [
  W + "macro close-up of an old, worn, scratched and dull metal zipper slider held between two fingertips.",
  W + "macro close-up of the plain back of a zipper slider held between fingertips, a second new shiny slider lying on the table beside it, the back of the slider smooth and blank.",
  W + "needle-nose pliers pulling the old slider off the bottom of the zipper, a new shiny slider waiting on the table beside it, close-up.",
  W + "needle-nose pliers lifting the small metal stop at the very top end of the zipper near the collar, macro close-up.",
  W + "needle-nose pliers pinching a small new metal stop onto the bottom end of the zipper tape, a spool of plain strong thread beside it, macro close-up.",
  W + "an open palm holding one small new silver zipper slider next to a few plain coins, close-up.",
  W + "a hand zipping up the repaired jacket on the table with a new shiny slider, needle-nose pliers and the old slider lying beside it.",
  W + "a hand hanging the zipped-up navy jacket on a wooden hanger held above the table, the zipper closed all the way.",
 ],
 7: [
  W + "a hand smoothing the fully zipped jacket, the zipper straight and closed, calm wide view.",
  "In a bright laundry room: a hand zipping a navy jacket fully closed just before putting it into the open drum of a white washing machine.",
  T + "a plain grey backpack stuffed so full that its zipper strains and gapes open in the middle, a hand trying to pull the slider closed.",
  W + "fingers pulling the zipper slider by its tab straight in line with the zipper, close-up.",
  W + "a hand wiping the zipper teeth with a small cloth, a plain white bar of soap beside it, close-up.",
  W + "a fingertip stopping on a rough spot of the zipper, a plain pencil held ready in the other hand, close-up.",
  W + "a hand giving the zipper one quick pass with a white candle stub, the jacket neat and closed, relaxed view.",
 ],
 8: [
  W + "two hands holding the zipper close to the window light, a fingertip tracing along the teeth, close-up.",
  W + "macro close-up of a zipper with one missing tooth and one cracked tooth, needle-nose pliers lying beside it unused.",
  W + "the fine tips of small pliers carefully straightening one bent metal zipper tooth, macro close-up.",
  W + "a new plain navy zipper lying on the table next to the damaged zipper of the jacket, a hand holding the two side by side.",
 ],
 9: [
  "In a small tailor's workshop with spools of plain thread on the wall: a hand passing a folded navy jacket across the counter to another person's hands, no faces visible.",
  "In a small tailor's workshop: a tailor's hands unpicking the seam along the zipper of a pair of blue jeans with a seam ripper, close-up, no face visible.",
  T + "a brown leather jacket and a puffy quilted down jacket lying side by side on the table, a hand resting on the leather jacket.",
  "In a small tailor's workshop: two pairs of hands over a navy coat on the counter, one hand pointing at the zipper, the other holding a pen above a blank paper pad, no faces visible.",
 ],
 10: [
  T + "a hand dropping three small silver zipper sliders into a compartment of an open sewing box with plain spools of thread.",
  W + "needle-nose pliers gently squeezing a zipper slider covered by a grey cloth, the jacket zipper slightly open below, close-up.",
  W + "a hand hanging the navy jacket zipped to the top on a wooden hanger on a wall hook, the other hand taking a set of metal keys out of the pocket of a grey backpack on the table.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "fix_zipper.notes.json", "that break a zipper for good", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
