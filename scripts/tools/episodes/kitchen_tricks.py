#!/usr/bin/env python3
"""Plans de l'épisode « 8 Kitchen Tricks You'll Wish You Knew Earlier ». Annotations dans kitchen_tricks.notes.json."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
from _auto import pair
ID = "2026-12-13-kitchen-tricks-wish-you-knew"
K = "In a bright kitchen with a white counter, pale wood cabinets and a window: "
TAIL = ("Photorealistic photograph for a practical home cooking how-to video, soft natural daylight. Adult hands, rolled-up sleeves of a navy-blue cotton shirt, "
        "only hands and forearms in the frame, no head, no face. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = (K + "a tidy counter with a wooden cutting board, a head of garlic, a bowl of brown eggs, a lemon cut in half, a glass jar of fresh parsley standing in water and a crusty loaf of bread, a hand resting on the board, three-quarter view.")
YOUNEED = ("Flat lay photographed from directly above on a light wood surface, items neatly arranged with clear space between them: a chef's knife, a folded damp white kitchen towel, "
           "an empty glass jar with a plain metal lid, and a white bowl of clear cold water. No packaging, no labels.")
MISTAKES = [
 K + "a hand chopping an onion fast with a chef's knife, the fingertips of the other hand stretched out flat and far too close to the blade, close-up.",
 K + "a hand pulling a steaming bowl out of an open microwave oven with a plain blank door and quickly letting go because it is too hot, a cloud of steam rising, close-up.",
 K + "a glass bowl of water with one egg clearly floating at the surface, a hand reaching to take it out as if to use it, a frying pan waiting on the stove behind.",
]
P = {
 1: [
  K + "a wooden cutting board sliding sideways on a smooth white counter while a hand chops a carrot with a chef's knife, the board visibly crooked, close-up.",
  K + "hands folding a damp white kitchen towel flat on the counter, a wooden cutting board held ready just above it, close-up.",
  K + "a wooden cutting board sitting firmly on a folded damp white towel on the counter, a hand pressing on the corner of the board, low side view.",
  K + "a wooden cutting board resting on a folded damp towel on a smooth polished stone counter, a hand letting go of the board, wide view.",
  K + "a hand chopping fresh green herbs with a chef's knife on a steady wooden cutting board, the edge of a damp towel showing under the board.",
  K + "a tidy counter with a wooden cutting board on a damp towel, a chef's knife laid flat on it, vegetables waiting in a bowl, calm wide view.",
 ],
 2: [
  K + "the flat side of a large chef's knife laid over one garlic clove on a wooden board, the heel of a hand pressing down on the blade, the sharp edge facing away from the hand, close-up.",
  K + "fingers pulling the cracked papery skin off a garlic clove in one piece on a wooden board, macro close-up.",
  K + "two hands shaking a closed glass jar with a metal lid full of unpeeled garlic cloves, motion blur on the cloves inside.",
  K + "an open glass jar with peeled white garlic cloves and loose papery skins inside, a hand tipping them onto a wooden board, close-up.",
  K + "a hand holding a chef's knife by the handle with the fingers of the other hand curled well back from the sharp edge, a garlic clove on the board, close-up.",
  K + "a plain green silicone tube with no markings lying on the counter next to a head of garlic, a hand picking the tube up.",
  K + "the palm of a hand rolling a plain green silicone tube back and forth on the counter, a peeled garlic clove and its skin sliding out of the end, close-up.",
  K + "a hand taking one brown egg out of a plain bowl of eggs on the counter, a tall glass of water standing beside it.",
 ],
 3: [
  K + "a hand gently lowering a brown egg into a tall clear glass filled with cold water, close-up.",
  K + "a brown egg lying flat on its side at the bottom of a clear glass bowl of water, seen from the side, close-up.",
  K + "a brown egg standing upright on its narrow end at the bottom of a clear glass of water, seen from the side, close-up.",
  K + "a brown egg floating at the surface of a clear glass of water, a hand lifting it out toward a small plain compost bin, close-up.",
  K + "macro close-up of a hard-boiled egg cut in half lengthwise, showing a clear hollow air pocket at the wide end of the shell.",
  K + "a hand placing a plain unprinted cardboard box of brown eggs on a shelf inside an open refrigerator.",
  K + "a fresh egg cracked into a small pan with a round, high yolk, and a pot with two eggs in water beside it on the stove, a hand holding the pan handle.",
 ],
 4: [
  K + "a hand holding a hard, stale crusty loaf of bread above an open kitchen bin, the other hand raised flat in a stop gesture.",
  K + "a hand passing a crusty loaf of bread quickly under a thin stream of water from the kitchen tap, drops on the crust, close-up.",
  K + "a crusty loaf of bread on the rack inside a hot oven with the door half open, a little steam rising from the damp crust, hands in oven mitts.",
  K + "hands wrapping two slices of bread in a damp white paper towel on a plate next to an open microwave oven with a plain blank door.",
  K + "a hand tearing open a warm crusty loaf, the inside soft and steaming, crumbs falling on a wooden board, close-up.",
  K + "a wooden board with golden toast, a sandwich and a small bowl of croutons made from the same loaf, a hand taking a slice of toast.",
  K + "a hand lifting a rock-hard solid lump of brown sugar out of a glass jar, a crusty loaf in the background, close-up.",
 ],
 5: [
  K + "a hand tapping a solid, rock-hard lump of brown sugar with a spoon on the counter, the spoon bouncing off, close-up.",
  K + "a hard lump of brown sugar in a white bowl covered with a damp white paper towel, a hand sliding the bowl into an open microwave oven with a plain blank door.",
  K + "a hand placing a slice of fresh bread on top of hard brown sugar inside a glass storage container, an apple wedge on the counter beside it, close-up.",
  K + "macro close-up of soft, loose, moist brown sugar crumbling under a spoon inside a glass container, a slice of bread resting on top.",
  K + "a hand lifting a dried-out slice of bread out of a glass container of soft brown sugar, morning light, close-up.",
  K + "hands pressing an airtight lid with a clip onto a glass jar filled with soft brown sugar, close-up.",
  K + "an open airtight glass jar of soft brown sugar with a small plain terracotta disc resting on top, a hand holding one white marshmallow above it, close-up.",
 ],
 6: [
  K + "a limp, wilted bunch of parsley lying in a plastic bag taken from the open refrigerator drawer, a hand holding it up, close-up.",
  K + "bunches of fresh parsley, cilantro and dill laid side by side on the counter like cut flowers, a hand holding an empty glass jar.",
  K + "a glass jar with a little water holding a bunch of parsley with trimmed stems, a hand loosely covering the leaves with a clear plastic bag, kitchen scissors beside it.",
  K + "a hand pouring out the water from a jar of parsley into the sink while holding the bunch, a glass of fresh water waiting on the counter.",
  K + "a bunch of fresh basil with large green leaves held in a hand in front of an open refrigerator, the other hand raised flat in a stop gesture.",
  K + "a glass jar of water holding a bunch of fresh basil on the counter in soft shade, away from the sunny window, a hand setting it down.",
  K + "a jar of parsley in water under a loose clear bag inside the refrigerator door, the leaves green and crisp, a hand taking a few sprigs.",
  K + "hands rolling sprigs of rosemary and thyme in a damp white paper towel, a clear plastic bag waiting on the counter, close-up.",
  K + "a hand taking one lemon from a bowl of lemons and limes on the counter, a jar of fresh herbs behind.",
 ],
 7: [
  K + "the palm of a hand pressing down and rolling a whole lemon firmly on the counter, a lime beside it, close-up.",
  K + "macro close-up of the cut face of a lemon half, the juicy pulp glistening with droplets.",
  K + "a hand placing a whole lemon on a small plate into an open microwave oven with a plain blank door, close-up.",
  K + "a hand squeezing a lemon half over a small glass bowl, juice running down, the other half and a knife on the board, close-up.",
  K + "a small glass bowl nearly full of fresh lemon juice next to two squeezed lemon halves, a hand holding the bowl up to the light.",
  K + "a teaspoon lifting lemon seeds out of a small bowl of lemon juice, close-up.",
  K + "a hand twisting a fork inside a lemon half held over a small glass bowl, juice dripping from the tines, close-up.",
  K + "a simple wooden hand reamer and a fork next to squeezed lemon halves, a hand tipping fine lemon zest from a grater into a small plain freezer container.",
 ],
 8: [
  K + "a hand lowering a brown egg on a large spoon into a pot of boiling water on the stove, a small mechanical kitchen timer with a plain blank face beside it.",
  K + "a slotted spoon moving a hot boiled egg from the pot into a glass bowl full of water and ice cubes, close-up.",
  K + "macro close-up of a boiled egg resting among ice cubes in clear cold water, tiny bubbles on the shell.",
  K + "the palm of a hand gently rolling a boiled egg on the counter, the shell cracked all over in a fine web, close-up.",
  K + "fingers peeling a boiled egg under a thin stream of tap water, the shell coming away in one large piece, a smooth white egg underneath, close-up.",
  K + "a plate of smooth, perfectly peeled boiled eggs, one cut in half, next to a plain unprinted cardboard egg box, a hand taking one.",
 ],
 9: [
  K + "a boiled egg peeled badly with torn, pitted white and bits of shell stuck to it, held in a hand above a plate, close-up.",
  K + "two plain unprinted cardboard egg boxes side by side on the counter, a hand choosing the one pushed further back, close-up.",
  K + "a hand knocking on a hard half loaf of bread left on a wooden board in evening light, a few crumbs around it.",
  K + "a hand tucking a fresh slice of bread into a glass container of soft brown sugar before closing the lid, close-up.",
  K + "a bowl of lemons standing on the counter in the daylight, a hand taking one, the closed refrigerator in the background.",
 ],
 10: [
  K + "a hand opening a freezer drawer neatly filled with clear containers and flat bags, cold mist drifting out.",
  K + "a hand pouring lemon juice into an ice cube tray, a whole knob of ginger and a small grater on the counter beside it, close-up.",
  K + "a hand pouring olive oil over chopped green herbs pressed into the cells of an ice cube tray, close-up.",
  K + "a hand sliding sliced bread into a clear freezer bag, one frozen slice going into a toaster in the background.",
  K + "a hand sticking a small blank white label onto a clear freezer bag of sliced bread, a pen lying beside it, close-up.",
 ],
 11: [
  K + "a hand drawing a chef's knife along a honing steel held upright on the counter, close-up on the blade.",
  K + "a plain red plastic cutting board with a raw chicken breast on it, set apart from a wooden board with vegetables, a hand moving the wooden board away.",
  K + "hands washing a chef's knife and a red cutting board with a soapy sponge under hot running water in the sink, steam rising.",
  K + "a hand placing a closed glass container of leftover cooked food on a shelf inside an open refrigerator.",
  K + "a hand pulling an older jar forward to the front of a tidy refrigerator shelf and placing a newer one behind it.",
 ],
}
def fix(i, t):
    """« Trick N. » est rattaché à la phrase suivante (comme « Step N. »)."""
    return [t[0] + " " + t[1]] + t[2:] if re.fullmatch(r"Trick \w+\.", t[0]) else t
S = pair(ID, P, fix)
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "kitchen_tricks.notes.json", "that turn a shortcut into an accident", youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
