#!/usr/bin/env python3
"""Plans de l'épisode « How to Clean a Washing Machine ». Annotations dans clean_washing_machine.notes.json."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _plan import build
ID = "2026-11-24-clean-washing-machine"
TAIL = ("Photorealistic photograph for a home how-to video. Bright, tidy laundry room, white front-loading washing machine with a round glass door "
        "and a grey rubber door seal, white wall tiles, light wood shelf, soft daylight. Adult hands, rolled-up sleeves of a mustard-yellow sweater, "
        "no face visible. 16:9 landscape format. No text, no letters, no numbers, no brand names, no logos, no watermark.")
HERO = "A clean white front-loading washing machine with its round glass door wide open in a bright laundry room, a folded stack of white towels on top, a small green plant on the shelf, front three-quarter view."
YOUNEED = "Flat lay photographed from directly above on a light wood surface, objects neatly arranged with clear space between them: a plain glass bottle of clear white vinegar, a small white bowl of baking soda powder, three folded microfiber cloths, an old toothbrush, and a shallow white dish next to a folded towel."
MISTAKES = [
 "Two plain plastic bottles, one white and one clear, being tilted at the same time over the open detergent drawer of a washing machine, both liquids about to pour in together.",
 "A hand pouring far too much blue liquid detergent from an overflowing cap into the detergent drawer of a washing machine, detergent spilling over.",
 "A hand pushing the round glass door of a washing machine firmly shut, water droplets visible on the inside of the glass and on the wet drum.",
]
S = {
 1: [
  ("Step one. Make sure the drum is empty, with no laundry left inside, and check the pockets of anything that has fallen to the bottom.", "A hand reaching into the empty stainless steel drum of a front-loading washing machine, door wide open."),
  ("Take a few seconds to remove any stray socks or coins from the rubber seal.", "Fingers pulling a small grey sock and two coins out of the fold of the grey rubber door seal of a washing machine, close-up."),
  ("Then take a minute to look at your machine's manual or the label inside the door.", "Hands holding an open instruction booklet with blurred unreadable lines and simple diagrams, a washing machine out of focus behind."),
  ("Some brands recommend a specific cleaner, or a special cleaning cycle called Tub Clean, Drum Clean or Self Clean. If yours has one, use it as the main cycle later.", "Close-up of a finger pointing at the round programme dial on the plain control panel of a washing machine, no readable markings."),
  ("Check as well that the machine is level and the door opens fully.", "A small yellow spirit level resting on top of a washing machine, the round door opened fully to the side."),
  ("It's a short step, but it avoids mistakes with your particular model.", "Front view of a white front-loading washing machine with its door open in a tidy laundry room, an instruction booklet lying on top."),
 ],
 2: [
  ("Step two. On a front loader, the rubber door seal is where the mould lives.", "Close-up of the grey rubber door seal around the opening of a front-loading washing machine, door open."),
  ("Gently pull the rubber back and look into the folds. You'll probably find dark spots, hair and slime.", "Fingers pulling back the grey rubber door seal of a washing machine to reveal dark mould spots and grime hidden inside the fold, close-up."),
  ("Spray the area lightly with a mix of equal parts vinegar and water, or use a cloth dampened with it, and wipe the folds clean.", "A hand spraying a fine mist from a plain clear spray bottle into the fold of a washing machine door seal, a blue microfiber cloth ready in the other hand."),
  ("An old toothbrush helps in the tight corners.", "An old toothbrush scrubbing inside the fold of a grey rubber washing machine door seal, close-up."),
  ("Do this monthly, since the seal is where most smells begin.", "Fingers pulling back a perfectly clean grey rubber door seal of a washing machine, the fold spotless and shiny, close-up."),
  ("Don't use bleach together with vinegar.", "A plain white plastic bottle and a plain clear glass bottle standing apart on top of a washing machine, a hand pushing the white bottle away."),
  ("Wipe the glass, and leave a dry cloth in the seal to catch drips.", "A hand wiping the inside of the round glass door of a washing machine with a blue microfiber cloth."),
  ("For a top loader, wipe the rim and the underside of the lid.", "A white top-loading washing machine with its lid open, a hand wiping the rim of the opening with a blue microfiber cloth."),
 ],
 3: [
  ("Step three. Pull out the detergent drawer.", "A hand pulling the detergent drawer out of the top left corner of a front-loading washing machine."),
  ("On many machines, you press a small tab or lift it slightly, then pull it free. Check your manual if it won't come out.", "Close-up of a thumb pressing a small plastic release tab inside the open detergent drawer of a washing machine."),
  ("Soak the drawer in a sink of warm water for about ten minutes, then scrub off the mould and sticky residue with the toothbrush.", "A white plastic detergent drawer soaking in a sink of warm soapy water while a hand scrubs it with an old toothbrush."),
  ("Don't forget the empty space where the drawer sits, because buildup collects there too.", "A hand with a blue microfiber cloth cleaning inside the empty drawer cavity of a washing machine, dark residue visible in the cavity."),
  ("Rinse the parts, dry them with a towel, and slide the drawer back into place.", "A hand sliding a clean, dry white detergent drawer back into a washing machine."),
  ("This one step is often the main source of the smell.", "Close-up of a removed washing machine detergent drawer coated with dark mould and sticky blue detergent residue, held in a hand."),
  ("If the drawer is fixed in place, simply scrub it where it is with a toothbrush and a cloth.", "A hand scrubbing the compartments of an open detergent drawer still attached to the washing machine with an old toothbrush."),
 ],
 4: [
  ("Step four. Pour two cups of white vinegar into the empty drum, or into the detergent drawer's main compartment, and start the hottest, longest cycle, with no laundry inside.", "A hand pouring clear white vinegar from a plain glass measuring cup into the empty drum of a front-loading washing machine."),
  ("If you have a Tub Clean cycle, choose that instead.", "A hand turning the round programme dial on the plain control panel of a washing machine."),
  ("The hot water and vinegar help dissolve soap scum, hard water minerals and bacteria.", "A front-loading washing machine running with no laundry, clear water sloshing and foaming behind the round glass door, close-up of the door."),
  ("You can pause the cycle for thirty minutes midway, to let the mix soak, then restart it.", "A finger pressing a plain round button on the control panel of a washing machine, water resting still behind the glass door."),
  ("Never combine vinegar with bleach in the same load, because the fumes are harmful. Run them separately, and rinse in between.", "A hand placing a plain white plastic bottle up on a high shelf, away from a washing machine, a clear glass bottle left on the machine."),
  ("Open the door once the cycle finishes, and let the steam escape.", "A hand opening the round glass door of a washing machine, a light cloud of steam drifting out of the warm drum."),
 ],
 5: [
  ("Step five. Once the vinegar cycle ends, sprinkle half a cup of baking soda into the drum and run a second hot cycle.", "A hand sprinkling white baking soda powder from a small white bowl into the empty drum of a washing machine."),
  ("Baking soda is a gentle deodorizer, and it neutralizes any remaining smells.", "A small white bowl of baking soda powder with a spoon standing on top of a washing machine."),
  ("When the cycle finishes, open the door and wipe the inside of the drum with a clean microfiber cloth.", "A hand wiping the inside of the stainless steel drum of a washing machine with a blue microfiber cloth."),
  ("If you see any residue loosened from the sides, wipe it away.", "A hand holding a blue microfiber cloth showing a smear of grey residue just wiped from a washing machine drum."),
  ("Some manufacturers prefer special machine-cleaning tablets, so use those if the manual says so, instead of vinegar and baking soda.", "A hand holding a single plain white cleaning tablet above the empty drum of a washing machine."),
  ("Check the drum for loosened buildup before you close the door.", "A hand shining a small flashlight into the clean shiny drum of a washing machine."),
 ],
 6: [
  ("Step six. Most front loaders have a small drain filter behind a panel at the bottom corner.", "Close-up of the small rectangular access panel at the bottom right corner of a white front-loading washing machine, a finger pointing at it."),
  ("Unplug the machine first.", "A hand pulling a white power plug out of a wall socket next to a washing machine."),
  ("Put a shallow dish and a towel on the floor, because water will come out.", "A shallow white dish and a folded grey towel placed on the tile floor in front of the open bottom corner panel of a washing machine."),
  ("Open the panel, slowly unscrew the filter counterclockwise and let the water drain.", "A hand unscrewing the round drain filter cap at the bottom of a washing machine, water trickling out into a shallow white dish on a towel."),
  ("Remove coins, hair and lint, rinse the filter under the tap, and screw it back firmly.", "A hand holding a washing machine drain filter clogged with grey lint, hair and a coin under a running tap."),
  ("Top loaders may have a lint filter or none at all.", "View from above into the drum of a white top-loading washing machine with its lid open."),
  ("Check the manual, and if you're unsure, leave this job for a technician.", "Hands holding an open instruction booklet with blurred unreadable lines and a simple diagram, in front of the bottom corner of a washing machine."),
  ("Clean this filter every three months, or when the machine drains slowly.", "A hand holding a perfectly clean washing machine drain filter, ready to screw it back into the open panel."),
 ],
 7: [
  ("Step seven. Finish by wiping the outside, the control panel and the top with a damp cloth.", "A hand wiping the top and control panel of a white washing machine with a blue microfiber cloth."),
  ("Then leave the door, and the drawer, slightly open so air can dry the inside, and mould can't grow.", "A white front-loading washing machine with its round door left ajar and its detergent drawer left slightly open, nobody in the picture."),
  ("After washing, don't leave wet clothes in the drum.", "Wet crumpled clothes left forgotten inside the drum of a washing machine, seen through the open door."),
  ("Use the amount of detergent shown on the packet, because too much creates the residue that feeds smells.", "A hand pouring a small measured amount of liquid detergent into a plain measuring cap, a washing machine behind."),
  ("A quick wipe of the seal weekly and a full clean once a month will keep your machine fresh.", "A hand giving the grey rubber door seal of a washing machine a quick wipe with a blue microfiber cloth."),
  ("Mark the date on your calendar. Make it a monthly habit and you won't need to rescue the machine again.", "A hand circling a day with a red pen on a paper wall calendar with blurred unreadable squares, hanging next to a washing machine."),
 ],
 8: [
  ("If the smell comes back, look at your habits first.", "A person seen from the shoulders down standing in front of an open washing machine, one hand waving in front of the drum as if there were a bad smell."),
  ("Wet clothes left in the drum smell bad, and people often blame the machine.", "A damp pile of clothes sitting inside the drum of a washing machine, door open, a laundry basket empty on the floor."),
  ("Check that the drain hose is not kinked, so water does not sit in it.", "A grey corrugated drain hose with a sharp kink behind a washing machine pulled slightly away from the wall, a hand pointing at the kink."),
  ("Use only the detergent amount shown on the packet, then repeat the hot cleaning cycle and wipe the seal more often.", "A hand holding a plain measuring cap filled to a low mark with liquid detergent, in front of the control panel of a washing machine."),
 ],
 9: [
  ("Cleaning cannot fix everything.", "A white front-loading washing machine with its door open and a closed red metal toolbox standing on the floor beside it."),
  ("If water will not drain even after you cleaned the filter, call a technician.", "Still water standing halfway up inside the drum of a washing machine, seen through the closed round glass door."),
  ("The same goes for water leaking from the door or the bottom, or loud banging and grinding.", "A puddle of clear water spreading on the tile floor from under a white washing machine, low angle."),
  ("If you smell burning, switch the machine off, unplug it, and do not use it until it has been checked.", "A hand quickly pulling the power plug of a washing machine out of the wall socket, a thin wisp of smoke near the back of the machine."),
 ],
 10: [
  ("A short routine keeps the machine fresh.", "A sparkling clean white washing machine in a bright laundry room, door ajar, fresh folded towels in a basket beside it."),
  ("Run a hot cleaning cycle about once a month.", "A finger turning the programme dial of a washing machine, the drum empty behind the glass door."),
  ("Take wet laundry out as soon as the cycle ends, and leave the door and drawer open between washes.", "Hands lifting clean wet laundry out of a washing machine drum into a white laundry basket."),
  ("Wash some loads on a hot setting when the care labels allow, because cool washes alone let residue build up.", "Fingers holding the small white care label sewn into a white towel, the symbols blurred and unreadable, a washing machine behind."),
 ],
}
def patch(ep):
    ep["hook"] = ("Does your washing machine smell musty, or do your clean clothes come out smelling a little bit off? The machine that cleans everything needs cleaning too. "
                  "In seven steps, you'll get rid of the smell, the grime and the mould, using ingredients you already have. It's easier than you think, and I'll show you what to do if the smell returns.")
    b = ep["bonus"][2]
    b["narration"] = b["narration"].replace("Wash some loads at the hottest setting the labels allow, because warm, damp conditions are where mould grows.", "Wash some loads on a hot setting when the care labels allow, because cool washes alone let residue build up.")
build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, "clean_washing_machine.notes.json", "that bring the smell back", patch=patch, youneed_focus=(0.5, 0.5))
