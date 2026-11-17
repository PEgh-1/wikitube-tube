#!/usr/bin/env python3
"""Plans de l'épisode « How to Cook Rice Perfectly on the Stove » : découpage de la narration en plans
(une ou deux phrases) + prompt d'image par plan → data/shots/<id>/shots.json. Le script (data/queue/<id>.json)
reste la source du texte : le découpage est vérifié contre lui. Annotations dans cook_rice.notes.json."""
import json, os, copy
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
ID = "2026-11-23-cook-rice-on-the-stove"
TAIL = ("Photorealistic photograph for a home cooking how-to video. Bright modern kitchen, light oak countertop, white wall tiles, "
        "black glass electric cooktop, soft daylight. Medium stainless steel saucepan with a glass lid. Long-grain white rice. "
        "Adult hands, rolled-up sleeves of a light blue shirt, no face visible. 16:9 landscape format. "
        "No text, no letters, no numbers, no captions, no logos, no watermark.")
HERO = "A white bowl of fluffy steaming long-grain white rice with clearly separate grains on a light oak table, a fork resting beside it, a stainless steel saucepan out of focus behind, soft side light."
YOUNEED = "Flat lay photographed from directly above on a light oak countertop, objects neatly arranged with clear space between them: a glass jar of long-grain white rice, a medium stainless steel saucepan with its glass lid beside it, a metal measuring cup, a fine mesh strainer, a fork, and a tiny white bowl of salt."
MISTAKES = [
 "Dry white rice being poured straight from a plain paper bag into a saucepan on the cooktop, an unused fine mesh strainer left aside on the counter.",
 "Water being poured freehand from a kettle into a saucepan of rice, far too much water, an unused measuring cup left aside on the counter.",
 "A hand lifting the glass lid off a simmering saucepan of rice, a big cloud of steam escaping, the other hand holding a wooden spoon about to stir.",
]
MISTAKES_FOCUS = [[0.52, 0.5], [0.5, 0.5], [0.55, 0.5]]
S = {
 1: [
  ("Step one. Use a measuring cup to measure your rice, and remember the number, because the water will be based on it.", "Close-up of a hand levelling a metal measuring cup filled with dry long-grain white rice above a glass jar of rice."),
  ("One cup of dry rice makes about three cups cooked, which feeds two to three people.", "On a countertop, one metal measuring cup of dry white rice on the left and three white bowls of fluffy cooked rice lined up on the right."),
  ("Choose a pot that suits the amount, since a pot that is too big dries the rice out, and a pot that is too small boils over.", "Three stainless steel saucepans of different sizes, small, medium and large, lined up on a countertop, a hand resting on the handle of the medium one."),
  ("A heavy-bottomed pot spreads the heat more evenly and helps prevent burning.", "Close-up of a hand holding a stainless steel saucepan tilted to show its thick, heavy layered base."),
  ("Take a moment to read the instructions on your package, because different varieties of rice have slightly different needs.", "Hands holding a plain kraft paper bag of rice turned to its back side with blurred unreadable lines, three small glass jars of different rice varieties behind on the counter."),
  ("Measuring takes ten seconds and removes the guesswork.", "A hand tipping a metal measuring cup of dry white rice into a fine mesh strainer held over a bowl."),
 ],
 2: [
  ("Step two. Put the rice in a strainer or a bowl, and rinse it under cold running water, swishing it with your fingers.", "Fingers swishing white rice in a fine mesh strainer under a stream of cold water from a kitchen tap, over a stainless steel sink."),
  ("The water will start out milky. That cloudiness is surface starch, and it is what makes rice clump and turn gummy.", "View from above of a clear glass bowl of white rice covered with cloudy, milky white water, a hand stirring it."),
  ("Keep rinsing for about a minute, until the water runs mostly clear.", "View from above of a clear glass bowl of white rice covered with perfectly clear water, every grain visible, a hand resting on the rim."),
  ("Drain well, and shake off the excess water.", "A hand shaking a fine mesh strainer full of rinsed white rice over a sink, water droplets falling."),
  ("Rinsing matters most for basmati and jasmine, while rice that is labelled pre-washed or enriched should not be rinsed. Check the packet if you are unsure.", "Three small white bowls of different uncooked rice on a countertop seen from above: long slender basmati, jasmine, and brown rice."),
  ("Good rinsing is the difference between restaurant rice and cafeteria rice.", "Two white plates side by side on a countertop: on the left fluffy white rice with separate grains, on the right a sticky, clumpy, gummy mound of rice."),
 ],
 3: [
  ("Step three. For long-grain white rice, the classic ratio is one cup of rice to one and a half cups of water.", "On a countertop next to an empty saucepan: a metal measuring cup full of dry white rice and a glass measuring jug holding a larger amount of water."),
  ("Basmati and jasmine are similar, around one to one and a quarter or one and a half.", "Two small bowls of uncooked basmati and jasmine rice next to a glass measuring jug of water on a countertop."),
  ("Brown rice needs more, about one to two, and a longer cooking time.", "A bowl of uncooked brown rice next to two identical glasses of water on a countertop."),
  ("Add a pinch of salt, and, if you wish, a small knob of butter or a teaspoon of oil.", "Fingers sprinkling a pinch of salt into a saucepan of rice and water, a small cube of butter on a teaspoon beside the pan."),
  ("Always check the instructions on the packet first, since brands differ.", "A finger pointing at the back of a plain kraft paper rice bag with blurred unreadable lines, saucepan in the background."),
  ("The ratio is the secret, so measure it, and don't eyeball it.", "Water being poured carefully from a glass measuring jug into a saucepan containing rinsed white rice."),
  ("If you prefer softer rice, add a tablespoon more water, but never much more.", "A hand holding a single tablespoon of water just above a saucepan of rice and water."),
 ],
 4: [
  ("Step four. Put the pot on high heat, with the lid off, and bring it to a full boil.", "A hand turning a cooktop control knob to high, an uncovered saucepan of rice and water on the glowing cooktop ring, the glass lid resting on the counter."),
  ("As soon as the water bubbles, give the rice a single stir to loosen anything stuck to the bottom, and then don't stir it again.", "A wooden spoon giving one stir in a saucepan of rice in vigorously bubbling water, steam rising."),
  ("Stirring rice releases starch, which makes it creamy and sticky, great for risotto, but not for fluffy rice.", "A wide pan of creamy risotto being stirred with a wooden spoon, thick and glossy."),
  ("Be ready to move to the next step right away, because the water must not boil away without the lid.", "Close-up of white rice in strongly boiling water in a saucepan, a hand holding the glass lid ready just beside the pan."),
  ("It takes only a few minutes to get this far. Use a timer on your phone, and don't walk too far from the kitchen.", "A smartphone lying on the countertop next to the cooktop, its screen showing a simple round timer dial without any digits, the saucepan steaming in the background."),
 ],
 5: [
  ("Step five. Turn the heat down to the lowest setting, cover the pot with the tight lid, and set a timer for fifteen minutes.", "One hand lowering the glass lid onto a saucepan of rice while the other hand turns the cooktop knob down to low."),
  ("White long-grain rice usually needs fifteen to eighteen minutes, brown rice around forty-five.", "A small white mechanical kitchen timer standing on the countertop next to a covered saucepan on the cooktop."),
  ("Do not lift the lid during this time.", "A hand hovering just above the knob of a glass lid on a covered saucepan, hesitating, not touching it."),
  ("The rice cooks in the trapped steam, and every peek lets heat and moisture escape, which leaves you with hard, uneven grains.", "Close-up of a glass saucepan lid fogged with steam and covered in water droplets, white rice visible underneath."),
  ("If your lid is loose, place a clean tea towel under it.", "A clean white tea towel placed between a saucepan and its lid, the corners of the towel folded up and gathered on top of the lid, well away from the cooktop."),
  ("If your stove runs hot, use a heat diffuser.", "A round perforated metal heat diffuser plate sitting on a cooktop ring under a covered saucepan."),
  ("A tight lid is non-negotiable, so choose a pot that closes well.", "Extreme close-up of the rim of a saucepan where a glass lid fits snugly with no gap."),
 ],
 6: [
  ("Step six. When the timer rings, turn off the heat, but keep the lid on, and let the pot sit for ten minutes.", "A hand turning a cooktop control knob to off, a covered saucepan on the cooktop and a white kitchen timer beside it."),
  ("This resting time is as important as cooking.", "A covered stainless steel saucepan resting quietly on a wooden trivet on the countertop."),
  ("The steam spreads evenly through the pot, and the moisture at the bottom is absorbed, so the grains firm up and stop being sticky.", "View from above through a clear glass lid: cooked white rice with small steam holes on its surface, light condensation on the glass."),
  ("Move the pot to a cool burner if you have an electric stove, because the hot ring will keep cooking the bottom.", "Hands in grey oven mitts lifting a covered saucepan from a glowing red electric cooktop ring toward a dark, cool ring."),
  ("Don't skip it, even when you are hungry and dinner is waiting.", "A dinner table set with two empty plates, forks and glasses in the foreground, a covered saucepan waiting on the counter out of focus behind."),
  ("Many people think this step is optional, but it is where the texture is decided.", "Macro photograph of perfectly cooked long-grain white rice, every grain separate and fluffy."),
 ],
 7: [
  ("Step seven. Remove the lid and gently fluff the rice with a fork, lifting it from the bottom and folding it over.", "A fork lifting and fluffing steaming white rice in a saucepan, the glass lid held up in the other hand."),
  ("A spoon crushes the grains, but a fork keeps them separate and light. Serve it while it is hot.", "Fluffy steaming white rice being served from a saucepan into a white bowl with a fork."),
  ("Leftover rice needs care, because it can carry bacteria that survive cooking.", "A bowl of leftover cooked white rice sitting on a kitchen countertop next to an empty glass storage container with its lid."),
  ("Cool it within one hour, spread out on a tray if you can, then refrigerate it in a covered container and eat it within a day.", "Cooked white rice spread in a thin layer on a metal baking tray on the countertop, a glass container with a lid beside it and an open refrigerator in the background."),
  ("When reheating, make sure it is steaming hot all the way through. A small splash of water helps in the microwave.", "A hand taking a bowl of steaming hot white rice out of an open microwave oven."),
 ],
 8: [
  ("Rice went wrong? Most of it can be saved.", "View from above of a saucepan of overcooked, mushy, clumpy white rice, a hand holding a spoon above it."),
  ("If it is mushy, spread it on a tray to dry, or turn it into fried rice.", "Golden fried rice with peas, diced carrot and egg being tossed in a pan with a spatula."),
  ("If it is hard in the middle, add two or three tablespoons of water, cover the pot, and steam it on very low heat for a few minutes.", "A hand pouring a tablespoon of water over cooked white rice in a saucepan, the glass lid held ready in the other hand."),
  ("If the bottom is burnt, do not scrape it. Spoon out the good rice from the top.", "A spoon lifting clean white rice from the top of a saucepan, a dark brown scorched layer of rice visible at the bottom edge of the pan."),
 ],
 9: [
  ("Plain rice is only the start.", "A white bowl of plain cooked rice in the centre of a countertop surrounded by small bowls of spices, a lemon, fresh herbs, a bay leaf and a cinnamon stick."),
  ("Toast the dry rice in a little oil for a minute before adding the water, which gives a nutty taste.", "Dry white rice being toasted in a little oil in a saucepan, stirred with a wooden spoon, the grains turning slightly golden."),
  ("Cook it in stock instead of water, or drop in a bay leaf or a cinnamon stick.", "Golden stock being poured from a jug into a saucepan of rice, a bay leaf and a cinnamon stick floating on top."),
  ("After fluffing, fold in lemon zest or fresh herbs.", "A hand zesting a lemon with a fine grater over a bowl of fluffy white rice sprinkled with chopped fresh green herbs."),
  ("For fried rice, use rice cooked and chilled the day before.", "A hand taking a glass container of cold cooked white rice out of an open refrigerator."),
 ],
 10: [
  ("A burnt pot is easy to avoid.", "A stainless steel saucepan with a black scorched layer of burnt rice stuck to the bottom, sitting in a kitchen sink."),
  ("Use a heavy-bottomed pot with a tight lid, and keep the heat as low as it will go.", "Close-up of a cooktop control knob turned to its lowest setting, a covered saucepan on the ring in the background."),
  ("Set a timer, so you never have to guess.", "A hand winding a small white mechanical kitchen timer on the countertop next to the cooktop."),
  ("If you cook a larger amount, use a bigger pot and add a few extra minutes.", "A large stainless steel pot full of cooked white rice next to a small saucepan with a little rice, side by side on the countertop."),
  ("If rice does stick, soak the pot in hot soapy water for half an hour.", "A stainless steel saucepan soaking in a kitchen sink filled with hot soapy water and foam, light steam rising."),
 ],
}
qf = os.path.join(ROOT, f"data/queue/{ID}.json")
ep = json.load(open(qf))
# Accroche : la fin ajoutée au script était bancale.
ep["hook"] = ("Sticky, mushy or burnt rice at the bottom of the pot: almost everyone has been there. The fix is simpler than you think. "
              "In seven steps, you'll cook fluffy rice with separate grains, using only a pot, a lid and a stove, every single time. "
              "And if a batch goes wrong, I'll show you how to rescue it.")
json.dump(ep, open(qf, "w"), indent=2, ensure_ascii=False); open(qf, "a").write("\n")
sections = ep["steps"] + ep.get("bonus", [])
norm = lambda x: " ".join(x.split())
nf = os.path.join(os.path.dirname(__file__), "cook_rice.notes.json")
N = json.load(open(nf)) if os.path.exists(nf) else {}
shots = {"episodeId": ID, "version": 3, "source": "gemini-web (navigateur, sans API)", "style": TAIL, "hero": {"prompt": HERO + " " + TAIL, "file": "hero.jpg"},
         "youneed": {"prompt": YOUNEED + " " + TAIL, "file": "youneed.jpg", "focus": [0.5, 0.55]},
         "mistakesSubtitle": "that turn rice into mush",
         "mistakes": [{"prompt": p + " " + TAIL, "file": f"mistake-{k}.jpg", "focus": MISTAKES_FOCUS[k - 1]} for k, p in enumerate(MISTAKES, 1)],
         "shots": {}, "extras": copy.deepcopy(N.get("extras", {}))}
prompts = [["hero.jpg", HERO], ["youneed.jpg", YOUNEED]] + [[f"mistake-{k}.jpg", p] for k, p in enumerate(MISTAKES, 1)]
for i, sec in enumerate(sections, 1):
    assert norm(" ".join(t for t, _ in S[i])) == norm(sec["narration"]), f"section {i} : le découpage ne correspond plus à la narration"
    lst = []
    for j, (t, p) in enumerate(S[i], 1):
        d = dict(text=t, prompt=p + " " + TAIL, file=f"step-{i}-{j}.jpg")
        d.update(copy.deepcopy(N.get("shots", {}).get(f"{i}-{j}", {})))
        lst.append(d); prompts.append([f"step-{i}-{j}.jpg", p])
    shots["shots"][f"step-{i}"] = lst
d = os.path.join(ROOT, f"data/shots/{ID}"); os.makedirs(d, exist_ok=True)
shots["short"] = ["2-1", "3-1", "7-1"]  # plans du Short ("étape-plan")
json.dump(shots, open(os.path.join(d, "shots.json"), "w"), indent=2, ensure_ascii=False)
have = set(os.listdir(d))
json.dump({"tail": TAIL, "items": [x for x in prompts if x[0] not in have]}, open("/tmp/rice-missing.json", "w"))
print(len(prompts), "images dont", len([x for x in prompts if x[0] not in have]), "à générer")
