#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean Silver Jewelry at Home ». Annotations dans silver_jewelry.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-11-clean-silver-jewelry-at-home"
K = "On a light wooden table next to a bright window, with a soft white towel laid on the table: "
SK = "At a clean white kitchen sink with a plain chrome tap, a folded white towel on the counter beside it: "
J = "At the glass counter of a small jeweler's workshop with warm lamp light, a dark velvet tray on the counter: "
TAIL = ("Photorealistic photograph for a practical home how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a burgundy cotton shirt, "
        "only hands and forearms in the frame, no head, no face. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (K + "brilliantly shiny sterling silver rings, a chain necklace and a pair of earrings laid out on the towel, a hand buffing one bright ring with a soft grey cloth, sparkling highlights, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood surface, items neatly arranged with clear space between them: a plain clear bottle of dish soap next to a glass bowl of warm water, "
           "a small bowl of fine white powder, a roll of aluminum foil, a soft white toothbrush, and a folded soft grey polishing cloth.")
MISTAKES = [
 K + "a hand scrubbing a dull tarnished silver ring hard with a stiff brush covered in white toothpaste, a plain white unlabelled tube lying beside it, fine scratches visible on the silver, close-up.",
 K + "a hand lowering a white pearl necklace and a ring with a blue-green turquoise stone into a glass bowl of water, close-up.",
 K + "a hand rubbing an antique silver locket with dark detail in its engraved pattern with a cloth, half of the dark detail already rubbed away, close-up.",
]
P = {
 1: [
  K + "a hand holding a slightly dull silver ring up close to examine it, a silver chain, a bracelet and earrings waiting on the towel.",
  K + "macro close-up of the inside of a silver ring band held between fingertips, a tiny indistinct hallmark stamp pressed into the metal, a round magnifying glass held just above it.",
  K + "macro close-up of the edge of a silver-plated bracelet where the thin silver layer has worn away and a yellowish metal shows underneath, a fingertip pointing at the worn spot.",
  K + "a hand setting aside on a small white dish a pearl necklace, a ring with a milky opal and a pendant with a blue-green turquoise stone, away from a glass bowl of water.",
  K + "an antique silver locket with an engraved pattern, the crevices of the pattern deliberately dark, held gently between fingertips, close-up.",
  K + "a hand placing a silver ring next to a small glass bowl of soapy water and a soft white toothbrush, the other bowls pushed to the back of the table.",
  K + "fingertips opening the small clasp of a silver chain to test it, close-up.",
 ],
 2: [
  K + "a lightly tarnished, dull silver chain and a dull silver ring lying on the towel next to a glass bowl of clear soapy water with a few bubbles.",
  K + "a hand squeezing a few drops of clear dish soap from a plain clear bottle into a glass bowl of warm water, a faint wisp of steam, close-up.",
  K + "a hand gently scrubbing the links of a silver chain with a soft white toothbrush over a glass bowl of soapy water, small soap bubbles on the chain, close-up.",
  SK + "fingers holding a silver ring under a gentle stream of water from the tap, close-up.",
  SK + "a hand pressing the metal drain stopper of the sink closed, a small silver ring resting on the edge of the counter, close-up.",
  K + "hands patting a silver ring completely dry inside a folded white cotton cloth, close-up.",
  K + "a hand holding a silver ring that still shows dark tarnish patches up to the window light, a small bowl of fine white powder waiting on the table behind.",
 ],
 3: [
  K + "a small spoon stirring fine white powder and a little water into a thick white paste in a small ceramic bowl, close-up.",
  K + "a fingertip rubbing thick white paste along the length of a tarnished silver bangle bracelet, moving along the band, close-up.",
  K + "macro close-up of a silver bangle bracelet, one half bright and clean, the other half still dark with tarnish and a little white paste, held between fingertips.",
  K + "a soft white toothbrush with a little white paste working into the engraved detail of a silver ring, close-up.",
  SK + "a hand rinsing a silver bangle bracelet under running water, a soft white cloth ready on the counter.",
  K + "one hand raised flat in a stop gesture above a small bowl of white paste, the other hand holding back a ring with a blue-green turquoise stone and a worn silver-plated bracelet.",
  K + "a fingertip dabbing a tiny dot of white paste on the inside of a silver ring band with a very light touch, close-up.",
 ],
 4: [
  K + "hands pressing a sheet of aluminum foil into a round glass bowl to line it, shiny side facing up, close-up.",
  K + "a hand laying a dark tarnished silver chain and two tarnished silver rings flat on the aluminum foil inside the glass bowl, each piece touching the foil.",
  K + "a hand pouring steaming hot water from a plain kettle into the foil-lined glass bowl over the silver, a tablespoon of fine white powder held above the bowl in the other hand.",
  K + "macro close-up of small fizzing bubbles rising around a silver ring lying on aluminum foil under hot water in a glass bowl.",
  K + "a small plain kitchen timer with a blank dial standing next to the foil-lined glass bowl, the silver chain in the water visibly brighter, the foil around it turned darker.",
  K + "a hand pushing the window open wider next to the steaming foil-lined glass bowl, a faint wisp of steam drifting toward the window.",
  K + "a hand in a quilted oven mitt sliding the steaming glass bowl to the back of the table, far from the edge, wide view.",
  SK + "a hand touching the outside of a foil-lined glass bowl standing next to the sink, no steam rising from the water any more.",
  K + "metal kitchen tongs and a folded soft cloth laid ready next to the foil-lined glass bowl, bright silver visible under the water.",
 ],
 5: [
  K + "metal kitchen tongs lifting a bright, dripping silver chain out of the foil-lined glass bowl, a faint wisp of steam, close-up.",
  SK + "fingers holding a bright silver ring under a stream of cool running water from the tap, close-up.",
  K + "hands drying a bright silver ring straight away with a soft grey microfiber cloth, close-up.",
  K + "macro close-up of tiny water droplets trapped between the links of a silver chain.",
  K + "a hand wiping gently along the length of a silver chain held taut with the other hand, using a soft cloth.",
  K + "a hand lowering a silver ring that still has one small dark spot back onto the aluminum foil in the glass bowl.",
  K + "a soft cloth gently patting, not rubbing, a silver pendant with delicate filigree detail lying on the towel, close-up.",
  K + "a hand aiming a plain white hair dryer from a distance at a silver chain laid on the towel, the links slightly lifted by the air.",
 ],
 6: [
  K + "a hand buffing a silver ring with a soft grey silver polishing cloth, close-up.",
  K + "a hand rubbing a silver bangle bracelet in a long stroke with a grey polishing cloth that shows dark marks, the fingers turning the cloth to a clean section.",
  K + "a hand pushing a roll of white paper towels and a few crumpled paper tissues away to the edge of the table, a silver ring in the foreground.",
  K + "a hand pulling a silver chain slowly through a folded grey polishing cloth pinched between the fingers of the other hand, close-up.",
  K + "a brilliantly shiny silver ring held between fingertips, catching the window light with a bright highlight, close-up.",
  K + "a hand sliding a folded grey polishing cloth into a small clear plastic zip bag, close-up.",
  K + "shiny silver rings, a chain and earrings lying on the towel next to two small soft fabric pouches and a few small clear zip bags, calm wide view.",
 ],
 7: [
  "On a white windowsill with slightly misted window glass behind: a bright shiny silver ring and a dull dark tarnished silver ring lying side by side, a fingertip pointing at the dark one, close-up.",
  K + "a hand pressing the air out of a small clear zip bag holding a silver chain, a soft grey fabric pouch with a ring beside it, close-up.",
  K + "a hand placing a small plain blank paper strip into a compartment of an open jewelry box holding silver pieces, close-up.",
  "At a wooden dressing table in a bedroom, a plain glass perfume bottle and a plain white jar of lotion on the table: a hand fastening a silver bracelet on the other wrist, close-up.",
  "At the edge of an outdoor swimming pool with blue water blurred behind: a hand slipping a silver ring off a finger of the other hand, a folded towel beside, close-up.",
  K + "a hand wearing two shiny silver rings and a silver bracelet resting around a plain white coffee cup.",
  K + "a hand dropping a small stick of white chalk into a soft grey fabric pouch that holds a silver chain, close-up.",
 ],
 8: [
  K + "tongs lifting a silver ring that is still dark with tarnish out of the foil-lined glass bowl, the other hand's fingertip pointing at the ring, close-up.",
  K + "a spoon pressing a silver ring down flat onto the aluminum foil at the bottom of a glass bowl, fully covered by steaming hot water, close-up.",
  K + "a soft white toothbrush working gently into the crevices of a silver ring held over the foil-lined glass bowl, close-up.",
  K + "macro close-up of fine hairline scratches on the surface of a silver bangle bracelet, a fingertip beside them.",
  K + "a hand pulling a silver-plated bracelet with a yellowish worn patch away from the foil-lined glass bowl, the other hand raised in a stop gesture.",
 ],
 9: [
  J + "a hand holding out a silver ring toward another person's open hand across the counter, no faces visible.",
  J + "an antique silver locket and an old engraved silver ring lying on the dark velvet tray, a hand resting beside them, a jeweler's loupe on the counter.",
  J + "a pearl necklace, a ring with a milky opal and a pendant with a blue-green turquoise stone laid out on a soft cloth, a hand gently touching the cloth.",
  J + "a jeweler's hands in a dark apron using fine pliers on the small metal prongs that hold a stone on a silver ring, under a bright work lamp, no faces visible, close-up.",
  J + "macro close-up of a silver-plated pendant with small pits and flaking patches in its surface, held between fingertips under the lamp.",
 ],
 10: [
  "On a wooden dresser next to an open window: slightly dull silver rings and a chain left out on an open dish, a hand reaching for them.",
  "At a wooden dressing table in a bedroom: a hand spraying a plain glass perfume bottle onto the inside of the other wrist, a silver bracelet and ring waiting on a small dish on the table.",
  "On a shelf next to a bathroom doorway with a white towel hanging behind: a hand placing two silver rings and a bracelet into a small ceramic dish.",
  K + "in warm evening lamp light, a hand wiping a silver ring with a soft cloth just after taking it off, a small dish beside it, close-up.",
  K + "a hand moving a silver chain away from a small pile of rubber bands, a ball of grey wool yarn and a bowl of brown eggs.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "silver_jewelry.notes.json", "that scratch or damage silver", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
