#!/usr/bin/env python3
"""Plans de l'épisode « How to Remove Toilet Rings and Hard Water Stains Fast ». Annotations dans toilet_rings.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
ID = "2026-11-28-remove-toilet-ring-hard-water"
TAIL = ("Photorealistic photograph for a practical how-to video. Bright, clean bathroom, white porcelain toilet, white tiles, soft daylight. "
        "Adult hands wearing yellow rubber gloves, rolled-up sleeves of a light grey sweatshirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A spotless white porcelain toilet bowl with clear water and a perfectly clean waterline, seen from a high three-quarter angle, very clean and fresh."
YOUNEED = ("Flat lay photographed from directly above on white bathroom tiles, items neatly arranged with clear space between them: a plain glass bottle of white vinegar with no label, "
           "a small white bowl of white citric acid powder, a pair of yellow rubber gloves, a toilet brush, a grey pumice stone, and a small white tabletop fan.")
MISTAKES = [
 "Two unlabeled plastic cleaning bottles, one white and one blue, held in two gloved hands above a white toilet bowl, no liquid being poured from either, one hand pushing one of the bottles away, clear water in the bowl.",
 "A gloved hand pressing a grey steel wool pad hard against the inside of a white toilet bowl, fine scratch marks on the porcelain, close-up.",
 "A gloved hand pressing the chrome flush button of a white toilet only moments after vinegar was poured, a mechanical kitchen timer with a blank face on the tank lid, a faint brown-orange ring still visible at the waterline.",
]
R = "a faint brown-orange limescale ring at the waterline, the bowl otherwise clean with clear water"
S = {
 1: [
  ("Step one. Open a window or turn on the bathroom fan, and put on rubber gloves.", "A gloved hand opening a small bathroom window above the white toilet, bright daylight pouring in, the other glove pulled on tight."),
  ("Before you start, make sure that no bleach or bleach-based cleaner has been used in the bowl recently, because bleach and acids, such as vinegar or citric acid, create dangerous fumes when they meet.", "A gloved hand holding a plain white plastic bottle with no label next to a plain glass bottle of vinegar with no label, the two kept well apart on the bathroom counter, white toilet in the background."),
  ("If you used bleach or any toilet cleaner today, flush twice and wait.", "A gloved hand pressing the chrome flush button of the white toilet, clear water swirling in the bowl, a mechanical kitchen timer with a blank face on the tank lid."),
  ("We will only use one product at a time, and we will rinse thoroughly in between.", "A single plain glass bottle of white vinegar standing alone on the bathroom floor tiles beside the white toilet, no other products in view."),
  ("Safety first.", "A closed bathroom door seen from inside the clean white bathroom, bright light, the toilet visible at the edge of the frame."),
  ("Keep children and pets out of the bathroom while you work, just to be safe.", "The closed white bathroom door with a gloved hand turning the handle to close it, a child-sized pair of slippers left on the hallway floor outside."),
 ],
 2: [
  ("Step two. The ring sits at the waterline, and the water in the bowl dilutes your cleaner.", f"Close-up of the waterline inside a white toilet bowl showing {R}, side view at bowl level."),
  ("To expose the ring, lower the water level.", "Side view of a white toilet bowl with the water level lowered a few inches, leaving a brown-orange mineral ring clearly above the water, clear water, otherwise clean."),
  ("Turn off the water valve behind the toilet, flush, and the tank empties, leaving the bowl low.", "A gloved hand turning the small oval chrome shut-off valve on the tiled wall behind the white toilet, braided steel hose going up to the tank."),
  ("Or use your brush to push the water down the drain, then remove the water left in the bowl.", "A toilet brush pushing clear water down the drain at the bottom of a white toilet bowl, seen from above, the water level dropping."),
  ("Even a lower level helps a lot.", f"A white toilet bowl seen from above with the water level a few inches low, {R}."),
  ("Now the cleaner can touch the stain directly, which is the real secret of this method.", "Close-up of the exposed brown-orange mineral ring on dry white porcelain just above a low water level, a gloved fingertip pointing at it."),
  ("If your toilet has a very small amount of water, this step is easy.", "Side view of a white toilet bowl with only a small pool of clear water at the bottom, the whole ring exposed above it."),
  ("Don't worry about being perfect, since a lower level is enough.", "A gloved hand making an okay gesture beside a white toilet bowl whose water level is a little lower than normal, relaxed mood."),
 ],
 3: [
  ("Step three. Pour about two cups of white vinegar around the bowl so it coats the ring all the way round.", "White vinegar being poured from a plain glass bottle around the inside of a white toilet bowl, the clear liquid running over the brown-orange ring, close-up."),
  ("For a stronger option, dissolve three tablespoons of citric acid in a cup of hot water, and pour it on the stain.", "A gloved hand stirring white citric acid powder into a heatproof glass of hot water with a spoon, light steam rising, a small bowl of white powder beside it."),
  ("Both are acids that dissolve limescale and rust.", "A glass bottle of white vinegar and a small bowl of white citric acid powder side by side on the white tiles beside the toilet, seen from above."),
  ("For a vertical stain, soak some toilet paper in the vinegar and press it against the ring, so it stays in contact.", "A gloved hand pressing a vinegar-soaked piece of toilet paper flat against the brown-orange ring on the inside wall of a white toilet bowl, close-up."),
  ("Let it sit and do the work, without any scrubbing for now.", "The white toilet bowl with vinegar-soaked toilet paper clinging along the waterline all around, the toilet brush resting untouched in its holder in the background."),
  ("A funnel or a small cup helps you pour precisely, so the liquid doesn't splash on the seat or on the floor.", "A gloved hand pouring vinegar through a small white funnel into a white toilet bowl, the white seat and clean tile floor dry and spotless."),
 ],
 4: [
  ("Step four. Wait at least thirty minutes.", "A mechanical kitchen timer with a blank face standing on the closed lid of a white toilet tank, bright bathroom light."),
  ("For tough, old rings, leave it for two hours, or even overnight, with the lid closed so nobody uses the toilet.", "A white toilet with its seat lid closed in a quiet bathroom lit by soft evening light from the window, a darker evening glow outside."),
  ("The acid needs time to soften the mineral layer.", f"Close-up of the waterline in a white toilet bowl where vinegar covers {R.replace('a faint', 'a softening')}, tiny bubbles clinging to the mineral ring."),
  ("This is the step that replaces hard scrubbing, so don't rush it.", "The toilet brush standing untouched in its white holder next to the white toilet, the bathroom calm and tidy."),
  ("If your bathroom is shared, put a note on the lid.", "A blank white paper card taped to the closed lid of the white toilet, no writing on it, a gloved hand smoothing the tape."),
  ("During the wait, you can wipe the outside of the toilet, the seat and the handle with a cloth and warm soapy water, then rinse.", "A gloved hand wiping the white toilet seat and the chrome flush handle with a damp yellow cloth, a small bucket of soapy water on the floor."),
  ("Close the bathroom door while it works.", "A white bathroom door being pulled closed by a gloved hand, bright hallway light."),
  ("Give the acid a chance, because patience here replaces elbow grease later.", "A gloved hand resting on the closed lid of the white toilet, the mechanical kitchen timer with a blank face beside it, a calm patient mood."),
 ],
 5: [
  ("Step five. After the soak, take your toilet brush and scrub the ring in firm, circular motions.", "A white toilet brush scrubbing in circles around the inside of the white toilet bowl at the waterline, gloved hand on the handle, side view."),
  ("You'll find the ring is much softer now, and it should lift off with far less effort.", "Close-up of the toilet brush bristles at the waterline, the brown-orange ring partly faded where the brush has passed, clear water."),
  ("Brush under the rim too, because minerals gather there.", "The toilet brush angled up under the inner rim of the white toilet bowl, gloved hand, low side view."),
  ("If any of the ring remains, repeat the vinegar or citric acid soak once more.", "A gloved hand holding a plain glass bottle of white vinegar above the white toilet bowl, a thin pale brown ring still faintly visible at the waterline."),
  ("Don't use a wire brush or steel wool, which can scratch the porcelain and make future stains stick even faster.", "A grey steel wool pad and a metal wire brush lying on the white tiles far from the toilet, a gloved hand pushing them aside."),
  ("Always wear gloves, and be careful not to splash the water.", "Close-up of a yellow rubber glove gripping the toilet brush handle, the brush moving gently in clear water with no splashing."),
  ("Work from the top of the bowl down, and rinse your brush afterward.", "The toilet brush being rinsed under clear water in a white bathroom sink, gloved hand, bright light."),
 ],
 6: [
  ("Step six. For rings that won't budge, use a pumice stone, but only on white porcelain.", "A gloved hand holding a grey pumice stone above a white porcelain toilet bowl with a stubborn thin brown-orange ring, close-up."),
  ("Wet the stone and the stain thoroughly, and keep both wet the whole time, because a dry stone scratches.", "A grey pumice stone being dipped in a cup of clear water by a gloved hand, drops falling from the stone over the bowl's wet waterline."),
  ("Rub with very light pressure, and use short strokes, until the stain comes off.", "A wet grey pumice stone gliding with very light pressure along the waterline of the white toilet bowl, the brown-orange ring fading behind it, close-up."),
  ("Then rinse and check.", "A gloved hand pouring a cup of clear water over the cleaned porcelain waterline, the surface bright white and smooth."),
  ("Don't use pumice on plastic, colored or glazed surfaces that are damaged.", "A grey pumice stone on the white tiles next to a blue plastic bucket and a coloured plastic toilet seat cover, a gloved hand holding the pumice back from them."),
  ("If you are unsure, test in a small hidden spot first.", "A wet grey pumice stone touching a small hidden spot on the inside wall of a white toilet bowl low under the rim, gloved hand, close-up."),
  ("This tool removes the last bit of stubborn mineral. Don't press hard, because the stone should do the work.", "A gloved hand holding the wet pumice stone lightly between two fingers against the porcelain, a relaxed light grip."),
  ("Stop if you see any scratches on the surface.", "Close-up of smooth white porcelain at the waterline in bright daylight, a gloved fingertip running along it to check the surface, no marks visible."),
 ],
 7: [
  ("Step seven. Turn the water valve back on, let the tank refill, and flush two or three times to rinse.", "A gloved hand turning the small oval chrome shut-off valve back open on the wall behind the white toilet, braided hose leading to the tank."),
  ("Admire the clean porcelain.", "A sparkling white toilet bowl with clear water and a spotless waterline, three-quarter view from above, very clean and bright."),
  ("To keep the ring from returning, brush the bowl weekly, and once a week, pour a cup of vinegar into the bowl and let it sit for an hour before flushing.", "A gloved hand pouring a cup of white vinegar from a plain glass bottle into the white toilet bowl, a mechanical kitchen timer with a blank face on the tank lid."),
  ("If you have very hard water, consider a water softener, or an in-tank descaler.", "A white toilet tank with the lid removed, a gloved hand placing a small white descaling block into the clear water of the tank."),
  ("A few minutes of weekly care beats an hour of hard work later.", "A wall calendar with no numbers and a single weekday circled with a pen, a white toilet in the soft background."),
  ("A clean bowl is also easier to keep fresh, and makes any future cleaning quick and simple.", "A spotless white toilet with a toilet brush in a white holder beside it, bright minimalist bathroom, front view."),
 ],
 8: [
  ("If the stain survived two soaks, look closer at what it is.", f"A gloved hand leaning in towards the waterline of the white toilet bowl to inspect {R}, close-up."),
  ("A pink or orange slimy film that wipes off easily is not hard water at all.", "A gloved hand wiping a faint pale pink film off the white porcelain waterline with a white cloth, the film coming away easily, close-up."),
  ("It is bacterial growth, and an ordinary toilet cleaner handles it.", "A gloved hand holding a plain white toilet cleaner bottle with no label and a nozzle angled under the rim of the white toilet bowl, no liquid yet."),
  ("A ring that returns a few days after you remove it points to minerals or iron in your water.", "Close-up of the brown-orange mineral ring on the waterline of the white toilet bowl, a clear glass of tap water standing on the tank lid behind it."),
  ("Then repeat the soak on a schedule.", "A wall calendar with no numbers and two days circled with a pen, a plain glass bottle of white vinegar on the toilet tank beside it."),
 ],
 9: [
  ("To stop fighting the ring, deal with the water itself.", "A chrome faucet running clear water into a white bathroom sink, light mineral buildup around the base of the spout, bright light."),
  ("Your water utility can tell you how hard your supply is,", "A gloved hand holding a clear glass of tap water up to the daylight from the window, a white bathroom counter behind."),
  ("and a cheap test kit does the same.", "A hand holding a small water test strip over a glass of clear tap water on a white bathroom counter, the strip showing coloured pads with no writing."),
  ("If a stain trail runs from under the rim or down to the drain, the tank may be leaking slowly into the bowl.", "Close-up of a thin brown-orange mineral streak running down the inside of a white toilet bowl from under the rim to the water, bright light."),
  ("A plumber can also advise you about a water softener.", "A plumber's hands in grey work gloves resting on a white water softener cabinet with no logo in a tidy utility room, seen from the side."),
 ],
 10: [
  ("A few small habits make rings much less likely.", "A tidy shelf in a bright bathroom with a plain glass bottle of white vinegar, a toilet brush in a holder and folded yellow gloves, white toilet in the background."),
  ("Do not drop bleach tablets into the tank.", "A gloved hand holding a round white cleaning tablet with no markings beside the open tank of a white toilet, the tank lid leaning against the wall, the tablet held away from the water."),
  ("They damage the rubber parts, and they should never meet vinegar or citric acid.", "Inside a white toilet tank, a red rubber flapper and a rubber seal in clear water, a gloved fingertip pointing at the rubber parts."),
  ("Flush a spare toilet once a week, because water that sits still is where rings form.", "A gloved hand pressing the chrome flush button of a second white toilet in a small guest bathroom, clear water swirling in the bowl."),
  ("Brush the bowl after cleaning the bathroom, while any stain is still thin.", "A toilet brush gently brushing the waterline of the white toilet bowl, only a very thin pale line visible there, gloved hand, close-up."),
 ],
}
def patch(ep):
    ep["hook"] = ("That brown or orange ring in your toilet bowl won't go away, no matter how much you brush. It's not dirt, it's hard water minerals, and ordinary cleaners barely touch it. "
                  "In seven steps, you'll learn the simple method that dissolves the ring, using ingredients you may already own. It works on rust-colored rings too, and I'll show you what to do if the stain won't budge.")
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "toilet_rings.notes.json", "that make the ring worse", patch=patch, youneed_focus=(0.5, 0.5), mistakes_focus=[[0.5, 0.5]] * 3)
