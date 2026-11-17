"""Outil commun aux épisodes : découpe vérifiée de la narration en plans → data/shots/<id>/shots.json.
Le script (data/queue/<id>.json) reste la source du texte ; `patch(ep)` permet de retoucher une phrase."""
import json, os, copy
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
norm = lambda x: " ".join(x.split())

def build(ID, TAIL, HERO, YOUNEED, MISTAKES, S, notes_name, subtitle, patch=None, youneed_focus=(0.5, 0.5), mistakes_focus=None):
    qf = os.path.join(ROOT, f"data/queue/{ID}.json")
    ep = json.load(open(qf))
    if patch:
        patch(ep)
        json.dump(ep, open(qf, "w"), indent=2, ensure_ascii=False); open(qf, "a").write("\n")
    sections = ep["steps"] + ep.get("bonus", [])
    nf = os.path.join(os.path.dirname(__file__), notes_name)
    N = json.load(open(nf)) if os.path.exists(nf) else {}
    shots = {"episodeId": ID, "version": 3, "source": "gemini-web (navigateur, sans API)", "style": TAIL, "hero": {"prompt": HERO + " " + TAIL, "file": "hero.jpg"},
             "youneed": {"prompt": YOUNEED + " " + TAIL, "file": "youneed.jpg", "focus": list(youneed_focus)},
             "mistakesSubtitle": subtitle,
             "mistakes": [{"prompt": p + " " + TAIL, "file": f"mistake-{k}.jpg", "focus": (mistakes_focus or [[0.5, 0.5]] * len(MISTAKES))[k - 1]} for k, p in enumerate(MISTAKES, 1)],
             "shots": {}, "extras": copy.deepcopy(N.get("extras", {})), "short": N.get("short")}
    prompts = [["hero.jpg", HERO], ["youneed.jpg", YOUNEED]] + [[f"mistake-{k}.jpg", p] for k, p in enumerate(MISTAKES, 1)]
    for i, sec in enumerate(sections, 1):
        assert norm(" ".join(t for t, _ in S[i])) == norm(sec["narration"]), f"section {i} : le découpage ne correspond plus à la narration\n{norm(' '.join(t for t, _ in S[i]))}\n{norm(sec['narration'])}"
        lst = []
        for j, (t, p) in enumerate(S[i], 1):
            d = dict(text=t, prompt=p + " " + TAIL, file=f"step-{i}-{j}.jpg")
            d.update(copy.deepcopy(N.get("shots", {}).get(f"{i}-{j}", {})))
            lst.append(d); prompts.append([f"step-{i}-{j}.jpg", p])
        shots["shots"][f"step-{i}"] = lst
    d = os.path.join(ROOT, f"data/shots/{ID}"); os.makedirs(d, exist_ok=True)
    json.dump(shots, open(os.path.join(d, "shots.json"), "w"), indent=2, ensure_ascii=False)
    have = set(os.listdir(d))
    missing = [x for x in prompts if x[0] not in have]
    json.dump({"tail": TAIL, "items": missing}, open(f"/tmp/{ID}-missing.json", "w"))
    print(len(prompts), "images dont", len(missing), "à générer")
