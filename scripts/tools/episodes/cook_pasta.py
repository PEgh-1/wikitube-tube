#!/usr/bin/env python3
"""Plans de l'épisode « How to Cook Pasta Properly ». Annotations dans cook_pasta.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-08-cook-pasta-properly"
K = "In a bright modern kitchen with a black glass cooktop set in a white counter, pale grey cabinets and a window: "
TAIL = ("Photorealistic photograph for a practical home cooking how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a dark forest-green cotton shirt, "
        "only hands and forearms in the frame, no head, no face. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (K + "a wide stainless steel pan of glossy spaghetti coated in bright tomato sauce, a hand lifting a twirl of pasta with tongs, steam rising, fresh basil leaves on top, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood surface, items neatly arranged with clear space between them: a bundle of dry spaghetti tied with plain string, "
           "a large empty stainless steel pot, a small bowl of coarse salt, a metal colander, a plain glass jar of red tomato sauce with no label, and a plain white mug.")
MISTAKES = [
 K + "a very small saucepan crammed with spaghetti sticking out and clumped together in very little water, a hand holding a small salt shaker above it, close-up.",
 K + "a hand rinsing cooked spaghetti in a colander under running tap water in the sink, a plain glass bottle of oil standing beside the sink, close-up.",
 K + "a fork lifting limp, swollen, overcooked spaghetti that breaks and droops over a pot of cloudy water, close-up.",
]
P = {
 1: [
  K + "a hand holding a large stainless steel pot under a running kitchen tap, the pot almost full of water, a bundle of dry spaghetti on the counter beside the sink.",
  K + "seen from above, short penne pasta moving freely with lots of space in a large pot of boiling water, big bubbles.",
  K + "a very small saucepan crammed with spaghetti stuck together in one clump in very little water, a fork trying to pull the strands apart, close-up.",
  K + "a hand placing a lid on a large stainless steel pot of water on the largest burner of the cooktop, the burner glowing red.",
  K + "close-up of a covered large pot on a glowing burner, steam escaping from under the edge of the lid, tiny bubbles visible through a glass lid.",
  K + "a hand lifting the lid off a large pot of boiling water, steam rising, the other hand holding a bundle of dry spaghetti ready above the pot.",
 ],
 2: [
  K + "a large pot of water at a strong rolling boil on the cooktop, a hand holding a small bowl of coarse salt next to it.",
  K + "a hand holding a heaped metal tablespoon of coarse salt above a large pot of boiling water, a small bowl of coarse salt in the other hand, close-up.",
  K + "a hand lifting a small spoon of hot water from the pot to taste it, steam rising, close-up.",
  K + "close-up of coarse salt grains falling from a spoon into boiling water, a few pieces of penne visible in the water below.",
  K + "a plate of plain pale cooked spaghetti with no sauce on a white counter, a hand pushing the plate slightly away, a fork resting on the rim.",
  K + "a hand generously tipping a spoonful of coarse salt into a large pot of boiling water, seen from the side, salt in mid-air.",
  K + "cloudy salted pasta water pouring out of a pot through a colander into the sink, steam rising, the cooked pasta staying in the colander.",
  K + "a hand lowering a bundle of dry spaghetti toward a large pot of salted boiling water, just before letting go.",
 ],
 3: [
  K + "a hand pushing half-softened spaghetti down under the surface of boiling water with a wooden spoon, the stiff dry ends still sticking out of the large pot.",
  K + "a hand stirring spaghetti in a large pot of boiling water with a wooden spoon, the strands swirling apart, seen from above.",
  K + "a hand holding a plain glass bottle of golden oil tilted above a pot of boiling pasta, the other hand raised flat in a stop gesture.",
  K + "close-up of a fork lifting oily, shiny spaghetti from a plate while thin red tomato sauce slides off and pools at the bottom of the plate.",
  K + "a large uncovered pot of pasta at a steady boil on the cooktop, the lid resting on the counter beside it, a wooden spoon lying across the rim of the pot.",
  K + "a wooden spoon pressing the last curved strands of spaghetti completely under the boiling water in a large pot, close-up.",
 ],
 4: [
  K + "a hand turning the dial of a small round mechanical kitchen timer with a plain blank face, a plain unprinted brown paper bag of pasta standing beside it on the counter.",
  K + "a hand lifting a single strand of spaghetti out of the boiling pot with a fork, steam rising, the small round mechanical timer in the background.",
  "Macro close-up of a piece of cooked penne bitten in half, held between two fingers, showing a slightly firmer paler ring in the center of the cut.",
  K + "a fork holding one piece of penne above the pot to cool, steam drifting away, close-up.",
  "Macro close-up of the cut end of a strand of cooked spaghetti held between two fingertips, a tiny white dot visible in the very center of the cross-section.",
  K + "a hand bringing a fork with a few strands of spaghetti up and out of the frame to taste, the small mechanical timer ignored on the counter behind.",
  K + "three small white bowls of different dry pasta shapes side by side on the counter, spaghetti, penne and bow-ties, a fork resting in front of them.",
  K + "a hand holding an empty plain white mug right next to a large pot of boiling pasta, a metal colander waiting in the sink behind.",
 ],
 5: [
  K + "a hand dipping a plain white mug into a large pot of pasta and scooping out cloudy cooking water, steam rising, close-up.",
  "Close-up of a plain white mug filled with cloudy, milky, starchy pasta cooking water held in a hand, a pot of pasta softly blurred behind.",
  K + "a spoon pouring cloudy pasta water into a pan of tomato sauce, the sauce looking thick, glossy and silky, close-up.",
  K + "a hand setting a plain white mug of cloudy water down on the counter right next to the cooktop, a large pot of pasta beside it.",
  K + "a large empty pot tilted in the sink with the last cloudy water running down the drain, a hand holding the pot handle, a colander of pasta beside it.",
  K + "a spoon pouring a little cloudy pasta water from a plain white mug into a pot of vegetable soup on the cooktop, close-up.",
 ],
 6: [
  K + "hands tipping a large pot of spaghetti and boiling water into a metal colander standing in the sink, water pouring through.",
  K + "a big cloud of steam rising from a colander of hot pasta in the sink, hands holding the pot handles at arm's length with a folded kitchen towel.",
  K + "hands shaking a metal colander full of steaming spaghetti over the sink, the tap above clearly turned off and dry.",
  K + "a bowl of cold pasta salad with short pasta, cherry tomatoes and green herbs on a white counter, a hand holding a serving spoon in it.",
  K + "a colander of drained spaghetti left sitting in the sink, the strands dull and stuck together in one clump, a fork lifting the whole clump at once.",
  K + "a wide stainless steel pan of warm red tomato sauce gently simmering on the cooktop, a colander of freshly drained spaghetti held just beside it.",
  K + "two warm white plates, a small bowl of grated cheese and a pan of sauce set out ready on the counter, a hand placing a fork beside the plates.",
  K + "hands carrying a colander of steaming drained spaghetti from the sink toward a wide pan of red sauce on the cooktop.",
 ],
 7: [
  K + "hands tipping drained spaghetti from a colander into a wide pan of warm tomato sauce, a plain white mug of cloudy water held ready beside the pan.",
  K + "a hand tossing spaghetti in tomato sauce with tongs in a wide pan over a glowing burner, the sauce coating every strand, steam rising.",
  K + "a hand pouring a small splash of cloudy water from a plain white mug into a pan of spaghetti in tomato sauce, close-up.",
  K + "a hand grating cheese over a plate of glossy spaghetti in tomato sauce topped with fresh basil leaves, a second warm plate waiting beside it.",
  K + "hands sliding a white ceramic baking dish of penne in tomato sauce topped with cheese into an open oven, oven mitts on both hands.",
 ],
 8: [
  K + "a plate of spaghetti with tomato sauce on the counter, a hand holding a fork above it, a plain white mug and a small bowl of salt beside the plate.",
  K + "tongs loosening a clump of stuck spaghetti in a pan of hot tomato sauce while a hand pours a splash of cloudy water from a plain white mug.",
  K + "a pan of spaghetti in a thin watery tomato sauce simmering with small bubbles on the cooktop, a wooden spoon stirring, close-up.",
  K + "fingers sprinkling a pinch of salt over a pan of spaghetti in sauce, a small bowl of grated cheese held ready in the other hand.",
  K + "a spoon lifting soft swollen overcooked pasta from a bowl of vegetable soup, a white ceramic baking dish waiting on the counter behind.",
 ],
 9: [
  K + "five small white bowls of different dry pasta shapes arranged in a row on the counter, a hand reaching for one of them, seen from above.",
  K + "a plate of thin spaghetti in a light smooth tomato sauce glistening with olive oil, a fork twirling a neat nest of pasta, close-up.",
  "Macro close-up of ridged rigatoni and penne on a fork, thick chunky vegetable and tomato sauce caught inside the tubes and in the ridges.",
  K + "a plate of wide ribbon pasta coated in a rich pale creamy sauce, a fork lifting a few wide ribbons, close-up.",
  K + "a hand lowering nests of fresh pale yellow egg pasta into a pot of boiling water, a fork held ready in the other hand to taste.",
  K + "two plain unprinted paper bags on the counter, one spilling brown whole wheat penne, the other pale yellow penne, a hand lifting a piece from the pot behind with a fork.",
 ],
 10: [
  K + "a hand spreading leftover cooked penne in a shallow glass container on the counter so it cools quickly, a little steam still rising.",
  K + "a hand placing a closed glass container of cooked pasta on a shelf inside an open refrigerator.",
  K + "a hand drizzling a teaspoon of oil over cooked penne in a glass container, a fork tossing the pasta, close-up.",
  K + "a hand taking a closed glass container of cooked pasta out of an open refrigerator, shelves with fresh vegetables behind.",
  K + "a hand adding a small splash of water from a glass to leftover pasta warming in a pan on the cooktop, steam rising.",
  K + "a hand placing a flat sealed clear freezer bag of plain cooked penne into an open freezer drawer.",
 ],
}
S = pair(ID, P)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "cook_pasta.notes.json", "that ruin a simple plate of pasta", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
