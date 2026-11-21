"""Découpage automatique : une image par phrase de la narration (« Step N. » rattaché à la phrase suivante)."""
import os, re, json
from _plan import ROOT
def split(n):
    s = re.split(r"(?<=[.!?])\s+", " ".join(n.split()))
    if re.fullmatch(r"Step \w+\.", s[0]): s = [s[0] + " " + s[1]] + s[2:]
    return s
def pair(ID, P, fix=None):
    ep = json.load(open(os.path.join(ROOT, f"data/queue/{ID}.json")))
    S = {}
    for i, sec in enumerate(ep["steps"] + ep.get("bonus", []), 1):
        t = split(sec["narration"])
        if fix: t = fix(i, t)
        assert len(t) == len(P[i]), f"section {i} : {len(t)} phrases pour {len(P[i])} images"
        S[i] = list(zip(t, P[i]))
    return S
