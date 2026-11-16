#!/usr/bin/env python3
"""Source unique de l'épisode « How to Unclog a Toilet » : narration phrase par phrase + prompt d'image
par phrase → data/queue/<id>.json (épisode) et data/shots/<id>/shots.json (plans). Les annotations
(coordonnées) sont dans unclog_a_toilet.notes.json, fusionnées ici quand le fichier existe."""
import json, os, copy
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
ID = "2026-11-04-unclog-a-toilet"
TAIL = ("Photorealistic photograph for a home how-to video. Bright, clean modern bathroom: white ceramic toilet, white wall tiles, "
        "light grey floor tiles, soft daylight. Everything spotlessly clean, clear water only. Adult hands, grey sweatshirt sleeves, no face visible. "
        "16:9 landscape format. No text, no letters, no captions, no logos, no watermark.")
G = "hands wearing bright yellow rubber gloves"
HERO = "A clean white toilet in a bright modern bathroom, a black flange plunger with a wooden handle standing next to it and a blue bucket beside, front three-quarter view."
# Chaque phrase : (texte, prompt d'image[, id]). Sans id, la phrase prend le numéro suivant (1, 2, 3…) : les
# images (step-<n>-<id>.jpg) et les annotations ("<n>-<id>") restent stables quand on insère des phrases ("a", "b"…).
STEPS = [
 dict(title="Stop the water first", tip="No flush until the clog is gone", mistake="Flushing a second time to see if it clears", q="toilet tank flapper", S=[
  ("Step one. If the bowl is filling up, do not flush again.", "Close-up of a white toilet bowl with the clear water level very high, almost at the rim; a bare hand hovering near the chrome flush handle, hesitating."),
  ("A second flush sends a full tank, at least a gallon and a half of water, into a bowl that has nowhere to drain.", "A white toilet overflowing: clear water spilling over the rim of the bowl and running onto the light grey tile floor, a spreading puddle, low side angle.", "a"),
  ("Lift the lid off the tank and push the rubber flapper down over the hole at the bottom.", "View from above into an open toilet tank with the lid removed: a bare hand reaching in and pressing the red rubber flapper down onto the round opening at the bottom of the tank, clear water inside."),
  ("That stops more water from entering the bowl.", "Close-up inside a toilet tank: the red rubber flapper sitting closed on the flush valve seat under clear water, chain and fill tube visible."),
  ("Then reach behind the toilet and turn the shut-off valve clockwise until it stops.", "Low angle behind a white toilet: a bare hand turning the small oval chrome shut-off valve on the tiled wall, a braided steel supply hose running up to the tank."),
  ("Now the water level cannot rise, and you can work without a flood.", "A calm white toilet bowl seen from above with a stable clear water level, the tank lid resting on a folded towel on the floor beside it."),
 ]),
 dict(title="Protect the floor and gear up", tip="Half a bowl of water is ideal", mistake="Plunging a bowl that is full to the brim", q="rubber gloves bathroom", S=[
  ("Step two. Lay old towels or newspaper around the base of the toilet.", "Old beige towels and newspaper spread on the light grey tile floor all around the base of a white toilet, seen from above at an angle."),
  ("Pull on a pair of rubber gloves, and open a window if you can.", f"Close-up of {G} being pulled on, a bathroom window slightly open in the soft-focus background."),
  ("If the bowl is full to the brim, bail some water into a bucket until it is about half full.", f"{G.capitalize()} using a small plastic cup to bail clear water from a very full white toilet bowl into a blue bucket on the floor."),
  ("You want enough water to cover the plunger, but not enough to splash over the rim.", "View from above of a white toilet bowl about half full of clear water, a blue bucket beside it on towels."),
 ]),
 dict(title="Seal the drain with a flange plunger", tip="Warm rubber seals better", mistake="Using a flat sink plunger on a toilet", q="toilet plunger", S=[
  ("Step three. Use a flange plunger, the kind with a soft rubber sleeve sticking out of the cup.", f"Close-up of a flange toilet plunger held up by {G}: black rubber cup with a soft rubber sleeve (flange) extending from the bottom of the cup, wooden handle."),
  ("A flat sink plunger cannot seal the curved drain of a toilet.", "Two plungers standing side by side on a bathroom floor: on the left a flat red cup sink plunger, on the right a black flange toilet plunger with an extended rubber sleeve; the difference is obvious."),
  ("Run the plunger under hot water for a minute so the rubber softens.", f"A black flange plunger held under a running hot tap in a white bathroom sink, light steam rising, {G}."),
  ("For an even tighter seal, smear a little petroleum jelly around the rim of the cup.", f"Close-up of a finger of a yellow rubber glove spreading clear petroleum jelly around the rim of a black rubber plunger cup, a small open white jar without any label beside it.", "b"),
  ("Lower it in at an angle to let the air escape, then fit the sleeve into the drain hole.", f"{G.capitalize()} lowering a black flange plunger at an angle into a white toilet bowl half full of clear water, the rubber sleeve entering the drain opening."),
  ("Make your first push slow and gentle, so trapped air does not blast water back at you.", f"{G.capitalize()} pressing a black flange plunger slowly down in a white toilet bowl, the rubber cup compressed, calm clear water, side view at bowl level."),
 ]),
 dict(title="Plunge in a steady rhythm", tip="Pull as hard as you push", mistake="Breaking the seal on every stroke", q="plunging toilet", S=[
  ("Step four. Keep the seal and pump the handle straight up and down, fifteen to twenty times.", f"A person standing over a white toilet gripping the wooden plunger handle with both {G}, the plunger vertical in the bowl, seen from the side."),
  ("Push firmly, but pull just as hard, because the suction does half the work.", f"Close-up at the toilet bowl: a black plunger cup being pulled upward, slightly stretched, clear water rippling, {G} on the handle."),
  ("The cup must stay under water the whole time, so top up the bowl from your bucket if the level gets low.", f"A blue bucket being tipped to pour clear water into a white toilet bowl while a black plunger stands in the bowl, {G}, side view.", "a"),
  ("On the last stroke, yank the plunger up sharply to break the seal.", f"Action shot: a black flange plunger lifted just out of the clear water of a white toilet bowl, droplets falling, {G}."),
  ("If the water rushes down the drain, the clog has moved.", "View from above of a white toilet bowl with clear water swirling down the drain in a vortex, the water level low."),
  ("If nothing changes, repeat the whole round two or three more times before moving on.", f"{G.capitalize()} repositioning a black flange plunger over the drain in a toilet bowl with still, high clear water, seen from above at an angle."),
 ]),
 dict(title="Loosen it with dish soap and hot water", tip="Hot from the tap, never boiling", mistake="Pouring in boiling water", q="dish soap bucket hot water", S=[
  ("Step five. Squirt about half a cup of dish soap into the bowl.", f"A hand in a yellow rubber glove squeezing a stream of green dish soap from a plastic bottle into a white toilet bowl of clear water."),
  ("No dish soap? Shampoo or liquid hand soap works the same way.", "A plain white shampoo bottle and a clear pump bottle of liquid hand soap, both without any label, standing on the closed lid of a white toilet tank, a hand in a yellow rubber glove reaching for the shampoo.", "a"),
  ("Fill a bucket with hot tap water, hot but never boiling, because boiling water can crack porcelain.", f"A blue bucket being filled with steaming hot water from a bathtub tap, light steam, a hand in a yellow rubber glove holding the bucket."),
  ("Pour it in from waist height, so the weight of the water pushes on the clog.", "A person pouring a blue bucket of hot water from waist height into a white toilet bowl, a thick stream of water, light steam, side view."),
  ("Wait fifteen to twenty minutes while the soap lubricates the pipe.", "A white toilet bowl with slightly soapy, bubbly water, and a small white kitchen timer standing on top of the tank; a calm waiting scene."),
  ("If the water level has dropped while you waited, that is a very good sign: the clog is already letting water through.", "View from above of a white toilet bowl with a low level of slightly soapy water and a ring of small bubbles on the porcelain showing where the water level used to be.", "b"),
  ("Then plunge again, and most stubborn clogs give up at this point.", f"{G.capitalize()} plunging with a black flange plunger in soapy, bubbly water in a white toilet bowl."),
 ]),
 dict(title="Break it up with a toilet auger", tip="Crank gently, never force it", mistake="Using a wire coat hanger instead", q="toilet auger", S=[
  ("Step six. For a clog that still will not move, use a toilet auger, also called a closet auger.", f"A toilet auger (closet auger) held by {G} in a bathroom: a long metal tube with a crank handle at the top and a curved lower end covered by a black rubber sleeve, coiled cable tip."),
  ("Its rubber sleeve protects the porcelain from scratches.", "Close-up of the curved lower end of a toilet auger, its black rubber protective sleeve resting against the white porcelain inside a toilet bowl."),
  ("The cable is about three feet long, enough to reach any clog inside the toilet itself.", "A toilet auger lying on old beige towels on a light grey tile floor with its coiled steel cable fully extended in a straight line next to a yellow tape measure without readable numbers, seen from above.", "a"),
  ("Rest the curved end in the drain and feed the cable in by turning the crank clockwise.", f"{G.capitalize()} operating a toilet auger in a white toilet: one hand holding the metal tube, the other turning the crank handle, the curved end sitting in the drain, side view."),
  ("When you feel resistance, keep cranking gently to break the clog apart or hook it.", f"Close-up of a hand in a yellow rubber glove firmly turning the crank handle of a toilet auger, the metal cable entering the tube."),
  ("Then wind the cable back out slowly and drop whatever comes up into the bucket.", f"{G.capitalize()} pulling the cable of a toilet auger out of a toilet bowl and holding its coiled tip over a blue bucket, a small wad of wet white paper caught on the tip."),
 ]),
 dict(title="Test the flush and clean up", tip="Keep a hand near the flapper", mistake="Walking away before the test flush", q="toilet flushing clean", S=[
  ("Step seven. Turn the shut-off valve back on and let the tank refill.", f"Low angle behind a white toilet: a hand in a yellow rubber glove turning the oval chrome shut-off valve on the tiled wall, braided steel hose."),
  ("Take the lid off and keep one hand near the flapper, ready to close it.", f"An open toilet tank seen from above, filled with clear water, a hand in a yellow rubber glove hovering just above the red rubber flapper."),
  ("Flush once and watch the bowl empty with a strong swirl.", "View from above of a perfectly clean white toilet bowl in mid-flush: a strong swirl of clear water going down the drain."),
  ("If the water rises instead, close the flapper right away and go back to the auger.", "View from above into an open toilet tank: a hand in a yellow rubber glove pressing the red rubber flapper firmly down under clear water, small splashes.", "a"),
  ("Then flush three or four sheets of toilet paper as a final test: if they vanish, the drain is truly clear.", "View from above of a clean white toilet bowl with four white sheets of toilet paper floating on clear water.", "b"),
  ("Finish by rinsing the plunger and auger in the clean flush water, then disinfect them, the floor and the handle.", f"{G.capitalize()} spraying disinfectant from a spray bottle onto a black flange plunger held over a clean white toilet bowl."),
 ]),
]
# Sections bonus (après les étapes, sans numéro) : même rendu plein écran, clés step-8, step-9…
BONUS = [
 dict(label="STILL STUCK?", title="Two last things to try", tip="Paper clogs soften overnight", q="clogged toilet night", S=[
  ("Still stuck? Before you give up, there are two more things worth trying.", f"A person seen from behind and above standing in front of a white toilet with hands in yellow rubber gloves on the hips, a plunger leaning against the wall, the bowl full of still clear water."),
  ("The first one is time. A paper clog softens by itself, so leave the soap and hot water in the bowl overnight, and plunge again in the morning.", "A quiet bathroom at night lit by soft blue moonlight from a window: a white toilet with slightly soapy water in the bowl, a black plunger standing beside it."),
  ("The second one is a wet and dry shop vacuum, if you own one, and never a regular household vacuum.", "A wet and dry shop vacuum with a yellow and black drum on wheels and a thick grey hose, without any logo, standing on a tile bathroom floor next to a white toilet."),
  ("Vacuum the water out of the bowl, wrap an old towel around the hose to seal the drain, and let the suction pull the clog back out.", f"{G.capitalize()} holding the thick grey hose of a shop vacuum wrapped in an old beige towel and pushed into the drain of an empty white toilet bowl, seen from above at an angle."),
  ("As for baking soda and vinegar, the fizz looks impressive, but on a solid clog it does far less than soap, hot water and a good plunger.", "White fizzing foam bubbling up inside a white toilet bowl, and on the tile floor beside the toilet a plain cardboard box of white powder and a clear glass bottle of vinegar, both without any label."),
 ]),
 dict(label="CALL A PRO", title="When to call a plumber", tip="Several slow drains mean the main line", q="plumber bathroom", S=[
  ("Sometimes the problem is not in your toilet at all, and that is when you stop and call a plumber.", "A bare hand holding a smartphone with a completely black screen in the foreground of a bright bathroom, a white toilet and a plunger out of focus behind."),
  ("Sign number one: when you flush, water comes up in the shower or the bathtub.", "A white shower tray seen from above with clear water backing up out of the round chrome drain and pooling across the tray."),
  ("Sign number two: several drains in the house are slow or gurgling at the same time.", "A white bathroom sink half full of clear water that is not draining, a chrome tap above, seen from above at an angle."),
  ("Both mean the blockage is in the main sewer line, far beyond the reach of a plunger.", "A large white PVC main drain pipe running along a clean concrete basement wall with a round threaded cleanout cap, soft daylight from a small window."),
  ("Sign number three: you know a hard object went down, like a toy, a toothbrush or a phone. Forcing it can wedge it deeper.", "A small yellow rubber duck and a blue toothbrush balanced on the rim of an open white toilet bowl, about to fall in, close-up."),
  ("And sign number four: the same toilet clogs every few days, which points to a deeper problem that a pro should look at.", "A plumber seen from the shoulders down in dark blue work clothes kneeling next to a white toilet, an open red metal toolbox on the tile floor, hands in black work gloves holding an adjustable wrench, no face visible."),
 ]),
 dict(label="PREVENTION", title="Keep it from clogging again", tip="When in doubt, put it in the trash", q="clean toilet bathroom", S=[
  ("Finally, here is how to never need this video again.", "A sparkling clean white toilet with the lid open in a bright modern bathroom, a small green plant on the tank, sunlight, wide inviting shot."),
  ("Only two things belong in a toilet: toilet paper and human waste.", "Close-up of a roll of white toilet paper on a chrome wall holder next to a clean white toilet."),
  ("Wipes, even the ones sold as flushable, do not break down like paper. Put them in the trash, along with cotton pads, dental floss and paper towels.", "A bare hand dropping a white wet wipe into a small white pedal bin with the lid open, standing next to a white toilet; cotton pads and a paper towel visible inside the bin."),
  ("When you use a lot of paper, flush twice: once halfway through, and once at the end.", "Close-up of a finger pressing the chrome dual flush button on top of a white toilet tank."),
  ("If you have young children, a simple lid lock keeps toys out of the bowl.", "A white plastic child safety lock fitted on the closed lid of a white toilet, a few colourful wooden toy blocks on the tile floor beside it."),
  ("And keep that flange plunger next to the toilet, so the next clog is a two-minute job.", "A black flange plunger with a wooden handle standing in a neat white holder on the floor right next to a clean white toilet, bright bathroom."),
 ]),
]
YOUNEED_SHOT = "Flat lay photographed from directly above on a light grey tile bathroom floor, six objects neatly arranged with clear space between them: a black flange plunger with a wooden handle, a pair of bright yellow rubber gloves, a green bottle of dish soap without any label, a blue plastic bucket, a toilet auger with a crank handle and coiled cable, and a stack of folded old beige towels."
MISTAKE_SHOTS = [
 "A bare hand pushing down the chrome flush handle of a white toilet whose bowl is already full to the rim with clear water, water just starting to spill over the edge.",
 "A bare hand tilting a plain red plastic bottle of chemical drain cleaner, without any label, above an open white toilet bowl, about to pour.",
 "A stainless steel kettle of boiling water held above an open white toilet bowl, thick steam rising from the spout.",
 "A bare hand pushing a straightened metal wire coat hanger down into the drain of a white toilet bowl.",
]
def phrases(sec):
    """[(texte, prompt, id)] avec les ids implicites 1, 2, 3… pour les phrases d'origine."""
    out, k = [], 0
    for x in sec["S"]:
        if len(x) == 3: out.append((x[0], x[1], str(x[2])))
        else:
            k += 1; out.append((x[0], x[1], str(k)))
    return out
SECTIONS = STEPS + BONUS
ep = json.load(open(os.path.join(ROOT, "data/queue/2026-11-03-clean-cast-iron-skillet.json")))
L = {"es": ("Cómo destapar un inodoro rápido (7 pasos, sin fontanero)", "Los 7 pasos para destapar un inodoro tú mismo: cortar el agua, usar bien el desatascador, jabón y agua caliente, y la sonda para inodoros."),
     "pt": ("Como desentupir um vaso sanitário rápido (7 passos, sem encanador)", "Os 7 passos para desentupir o vaso sozinho: fechar a água, usar o desentupidor certo, detergente e água quente, e a sonda para vasos."),
     "fr": ("Comment déboucher des toilettes rapidement (7 étapes, sans plombier)", "Les 7 étapes pour déboucher des toilettes soi-même : couper l'eau, bien utiliser la ventouse, liquide vaisselle et eau chaude, puis le furet."),
     "de": ("Toilette verstopft? So wird sie schnell frei (7 Schritte, ohne Klempner)", "Die 7 Schritte, um eine verstopfte Toilette selbst zu befreien: Wasser abstellen, Pümpel richtig einsetzen, Spülmittel und heißes Wasser, Rohrspirale."),
     "hi": ("बंद टॉयलेट को जल्दी कैसे खोलें (7 स्टेप, बिना प्लंबर)", "बंद टॉयलेट खुद खोलने के 7 स्टेप: पानी बंद करना, सही प्लंजर का इस्तेमाल, डिश सोप और गर्म पानी, और टॉयलेट ऑगर।"),
     "it": ("Come sturare il water velocemente (7 passaggi, senza idraulico)", "I 7 passaggi per sturare il water da soli: chiudere l'acqua, usare bene lo sturalavandini a flangia, detersivo e acqua calda, sonda per WC."),
     "ja": ("トイレのつまりを素早く直す方法(7ステップ・業者なし)", "トイレのつまりを自分で直す7つのステップ:止水、ラバーカップの正しい使い方、食器用洗剤とお湯、トイレ用ワイヤー。"),
     "id": ("Cara Mengatasi Toilet Mampet dengan Cepat (7 Langkah, Tanpa Tukang)", "7 langkah mengatasi toilet mampet sendiri: menutup air, memakai plunger yang benar, sabun cuci piring dan air panas, serta auger toilet.")}
ep.update(
 id=ID, date="2026-11-04", slug="unclog-a-toilet", category="Home",
 title="How to Unclog a Toilet Without Calling a Plumber",
 hook="A clogged toilet always seems to happen at the worst possible moment. The good news is that most of the time you can clear it yourself in about ten minutes, with no plumber and no harsh chemicals. Here are the seven steps, and what to do if nothing works.",
 intro="Most toilet clogs sit in the first bend of the drain, just out of sight, and they are made of too much paper or something that should never have been flushed. That is why pressure, soap and a simple cable are usually enough. We will start with the gentlest method and work up, so you never do more than you need to.",
 youNeed=["Flange plunger", "Rubber gloves", "Dish soap", "Bucket of hot tap water", "Toilet auger", "Old towels"],
 youNeedNarration="Here is what you will need. A flange plunger. A pair of rubber gloves. Dish soap. A bucket of hot tap water. A toilet auger for the stubborn cases. And a few old towels for the floor.",
 heroImageQuery="clean white toilet bathroom", heroImagePrompt=HERO + " " + TAIL,
 steps=[dict(title=s["title"], narration=" ".join(x[0] for x in s["S"]), tip=s["tip"], mistake=s["mistake"], imageQuery=s["q"], imagePrompt=(s["S"][0][1] + " " + TAIL)[:600], media="photo") for s in STEPS],
 bonus=[dict(label=s["label"], title=s["title"], narration=" ".join(x[0] for x in s["S"]), tip=s["tip"], imageQuery=s["q"], imagePrompt=(s["S"][0][1] + " " + TAIL)[:600], media="photo") for s in BONUS],
 mistakesToAvoid=dict(narration="Now, the mistakes that turn a small clog into a big problem. One, flushing again and again, which is how bathrooms flood. Two, pouring in chemical drain cleaner. It rarely works on toilets, it can damage the pipes, and if you plunge afterwards it can splash onto your skin. Three, using boiling water, which can crack the bowl. And four, poking around with a wire coat hanger, which scratches the porcelain for good.",
   items=["Flushing again and again", "Chemical drain cleaner", "Boiling water", "A wire coat hanger"]),
 recap=dict(narration="Let's run through it one more time. Stop the water. Protect the floor. Seal the drain with a flange plunger. Plunge in a steady rhythm. Add dish soap and hot water. Bring in the auger. Then test the flush and clean up. If it still will not clear, give it a night. If other drains are backing up too, call a plumber. And from now on, wipes go in the trash.",
   items=["Stop the water", "Protect the floor", "Seal with a flange plunger", "Plunge in rhythm", "Dish soap + hot water", "Toilet auger", "Test flush and clean up"]),
 outro="That's how you unclog a toilet without calling a plumber. If this saved your day, subscribe to WikiTube for a new how-to every day, and tell us in the comments what you want us to explain next.",
)
ep["metadata"].update(title="How to Unclog a Toilet Fast (7 Steps, No Plumber)",
 description="A clogged toilet is usually a 10-minute fix. In this video you'll learn the 7 steps to unclog a toilet yourself: stop the water, protect the floor, seal the drain with a flange plunger, plunge in rhythm, use dish soap and hot water, break the clog with a toilet auger, then test the flush. Plus what to try when nothing works, the 4 signs that mean you should call a plumber, how to keep it from clogging again, and the 4 mistakes to avoid.",
 tags=["how to unclog a toilet", "unclog toilet", "clogged toilet", "toilet plunger", "toilet auger", "dish soap toilet clog", "plumbing tips", "home repair", "how to"],
 thumbnailTitle="Unclog it in 10 minutes", chapters="auto", localizations={k: dict(title=v[0], description=v[1]) for k, v in L.items()})
ep["short"] = dict(title="Unclog a toilet in 3 steps #shorts", description="Stop the water, seal with a flange plunger, then dish soap and hot water. Full 7-step guide on the channel. #plumbing #howto #hometips",
 hook="Toilet clogged? Do not flush again. Three steps, about ten minutes.",
 steps=[dict(title="Stop the water", narration="One. Push the flapper down in the tank and close the valve behind the toilet."),
        dict(title="Plunge with a flange plunger", narration="Two. Seal the drain with a flange plunger and pump fifteen to twenty times."),
        dict(title="Dish soap + hot water", narration="Three. Still stuck? Half a cup of dish soap, a bucket of hot tap water, wait fifteen minutes, plunge again.")],
 cta="The full guide with all seven steps is on the channel.")
json.dump(ep, open(os.path.join(ROOT, f"data/queue/{ID}.json"), "w"), indent=2, ensure_ascii=False)
notes_file = os.path.join(os.path.dirname(__file__), "unclog_a_toilet.notes.json")
N = json.load(open(notes_file)) if os.path.exists(notes_file) else {}
shots = {"episodeId": ID, "version": 3, "source": "gemini-web (navigateur, sans API)", "style": TAIL, "hero": {"prompt": HERO + " " + TAIL, "file": "hero.jpg"},
         "youneed": {"prompt": YOUNEED_SHOT + " " + TAIL, "file": "youneed.jpg", "focus": [0.52, 0.5]},
         "mistakes": [{"prompt": p + " " + TAIL, "file": f"mistake-{k}.jpg", "focus": [[0.6, 0.4], [0.75, 0.45], [0.4, 0.6], [0.55, 0.55]][k - 1]} for k, p in enumerate(MISTAKE_SHOTS, 1)],
         "shots": {}, "extras": {}}
prompts = [["hero.jpg", HERO], ["youneed.jpg", YOUNEED_SHOT]] + [[f"mistake-{k}.jpg", p] for k, p in enumerate(MISTAKE_SHOTS, 1)]
for i, s in enumerate(SECTIONS, 1):
    lst, ids = [], []
    for (t, p, pid) in phrases(s):
        d = dict(text=t, prompt=p + " " + TAIL, file=f"step-{i}-{pid}.jpg")
        d.update(copy.deepcopy(N.get("shots", {}).get(f"{i}-{pid}", {})))
        lst.append(d); ids.append(pid); prompts.append([f"step-{i}-{pid}.jpg", p])
    shots["shots"][f"step-{i}"] = lst
    # encarts : « shot » désigne l'id de la phrase → converti en position (1..n) pour le pipeline
    ex = copy.deepcopy(N.get("extras", {}).get(f"step-{i}"))
    if ex:
        for key, items in ex.items():
            for it in items:
                sid = str(it.get("shot", 1))
                assert sid in ids, f"step-{i} {key}: phrase {sid} inconnue"
                it["shot"] = ids.index(sid) + 1
        shots["extras"][f"step-{i}"] = ex
if N.get("extras", {}).get("intro"): shots["extras"]["intro"] = N["extras"]["intro"]
os.makedirs(os.path.join(ROOT, f"data/shots/{ID}"), exist_ok=True)
json.dump(shots, open(os.path.join(ROOT, f"data/shots/{ID}/shots.json"), "w"), indent=2, ensure_ascii=False)
json.dump({"tail": TAIL, "items": prompts}, open("/tmp/toilet-prompts.json", "w"))
have = set(os.listdir(os.path.join(ROOT, f"data/shots/{ID}")))
missing = [f for f, _ in prompts if f not in have]
json.dump({"tail": TAIL, "items": [x for x in prompts if x[0] in missing]}, open("/tmp/toilet-missing.json", "w"))
words = sum(len(ep[k].split()) for k in ("hook", "intro", "youNeedNarration", "outro")) + sum(len(x["narration"].split()) for x in ep["steps"] + ep["bonus"]) + len(ep["mistakesToAvoid"]["narration"].split()) + len(ep["recap"]["narration"].split())
print(len(prompts), "images dont", len(missing), "à générer ;", words, "mots ≈", round(words / 150, 1), "min de voix ;", [len(x["narration"].split()) for x in ep["steps"] + ep["bonus"]])
