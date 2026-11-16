#!/usr/bin/env python3
"""Signature sonore WikiTube, synthétisée (aucun fichier tiers, aucune licence) :
jingle d'ouverture, boucle musicale, bruitages crayon / tampon / coche / W.
   python3 scripts/tools/make-audio.py   → public/brand/*.mp3"""
import numpy as np, subprocess, os, wave, sys
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), "..", "..", "public", "brand")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)

def pluck(freq, dur, bright=0.5, amp=1.0):
    """Corde pincée (Karplus-Strong) : ukulélé / guitare nylon."""
    n = int(SR * dur); N = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, N)
    k = np.ones(3) / 3
    for _ in range(int(4 * (1 - bright)) + 1): buf = np.convolve(buf, k, mode="same")
    out = np.empty(n); damp = 0.996
    for i in range(n):
        out[i] = buf[i % N]
        buf[i % N] = damp * 0.5 * (buf[i % N] + buf[(i + 1) % N])
    return amp * out * np.linspace(1, 0.6, n)

def marimba(freq, dur, amp=1.0):
    t = np.arange(int(SR * dur)) / SR
    x = np.sin(2 * np.pi * freq * t) * np.exp(-t * 7) + 0.35 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 22) + 0.12 * np.sin(2 * np.pi * freq * 10 * t) * np.exp(-t * 40)
    a = np.minimum(1, t / 0.004)
    return amp * x * a

def noise(dur): return rng.uniform(-1, 1, int(SR * dur))
def lp(x, a):
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s += a * (v - s); y[i] = s
    return y
def mix(dst, src, at):
    i = int(at * SR); j = min(len(dst), i + len(src)); dst[i:j] += src[: j - i]
def save(name, x, stereo=None, peak=0.9, bitrate="160k"):
    x = np.asarray(x, dtype=np.float64); x = x / (np.max(np.abs(x)) + 1e-9) * peak
    if stereo is None: st = np.stack([x, x], 1)
    else:
        y = np.asarray(stereo); y = y / (np.max(np.abs(y)) + 1e-9) * peak; st = np.stack([x, y], 1)
    wav = os.path.join(OUT, name + ".wav")
    with wave.open(wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", wav, "-b:a", bitrate, os.path.join(OUT, name + ".mp3")], check=True)
    os.remove(wav); print("✔", name, f"{len(x)/SR:.2f}s")

# ---- Jingle d'ouverture (≈ 2,2 s) : sol-do-mi-sol + accord, « ta-da » court et chaleureux ----
j = np.zeros(int(SR * 2.4))
for k, (m, t) in enumerate([(67, 0.0), (72, 0.14), (76, 0.28), (79, 0.42)]):
    mix(j, marimba(hz(m), 0.9, 0.8), t); mix(j, pluck(hz(m - 12), 0.8, 0.6, 0.35), t)
for m in (60, 64, 67, 72, 84):
    mix(j, marimba(hz(m), 1.6, 0.55), 0.62); mix(j, pluck(hz(m), 1.5, 0.7, 0.4), 0.62)
sw = lp(noise(0.5), 0.25) * np.linspace(0, 1, int(SR * 0.5)) ** 2 * 0.25; mix(j, sw, 0.12)
j *= np.minimum(1, np.linspace(6, 0, len(j)))
save("jingle", j)

# ---- Boucle musicale (16 mesures, 100 bpm, ≈ 38,4 s) : ukulélé + marimba + shaker ----
bpm = 100; beat = 60 / bpm; bars = 16; L = int(SR * beat * 4 * bars)
Lc = np.zeros(L); Rc = np.zeros(L)
chords = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]  # C Am F G
strum = [0, 1, 1.5, 2.5, 3, 3.5]
for b in range(bars):
    ch = chords[b % 4]; t0 = b * 4 * beat
    for s in strum:
        for n_i, m in enumerate(ch if int(s * 2) % 2 == 0 else ch[::-1]):
            p = pluck(hz(m), 0.9, 0.55, 0.22 if s else 0.3)
            mix(Lc, p, t0 + s * beat + n_i * 0.012); mix(Rc, p * 0.8, t0 + s * beat + n_i * 0.012 + 0.004)
    mix(Lc, pluck(hz(ch[0] - 12), 1.6, 0.3, 0.5), t0); mix(Rc, pluck(hz(ch[0] - 12), 1.6, 0.3, 0.5), t0)
    for q in range(8):
        sh = (noise(0.05) - lp(noise(0.05), 0.3)) * np.exp(-np.arange(int(SR * 0.05)) / (SR * 0.012)) * (0.10 if q % 2 else 0.05)
        mix(Rc, sh, t0 + q * beat / 2); mix(Lc, sh * 0.6, t0 + q * beat / 2)
mel = [(76, 0, 1), (79, 1, 1), (84, 2, 1.5), (81, 3.5, .5), (79, 4, 2), (76, 6, 1), (72, 7, 1), (77, 8, 1.5), (76, 9.5, .5), (72, 10, 2), (74, 12, 1), (79, 13, 1), (74, 14, 2)]
for rep in (1, 3):
    for m, s, d in mel:
        x = marimba(hz(m), 1.2, 0.30); mix(Lc, x * 0.8, (rep * 16 + s) * beat); mix(Rc, x, (rep * 16 + s) * beat)
save("music-bed", Lc, Rc, peak=0.8, bitrate="128k")

# ---- Bruitages ----
t = np.arange(int(SR * 0.42)) / SR  # crayon : bruit filtré modulé
sc = (noise(0.42) - lp(noise(0.42), 0.15)) * (0.55 + 0.45 * np.sin(2 * np.pi * 23 * t)) * np.minimum(1, t / 0.02) * np.minimum(1, (0.42 - t) / 0.08)
save("sfx-pencil", lp(sc, 0.5), peak=0.5)
t = np.arange(int(SR * 0.35)) / SR  # tampon : coup sourd + claquement
st = np.sin(2 * np.pi * (95 * np.exp(-t * 9) + 45) * t) * np.exp(-t * 14) + 0.5 * lp(noise(0.35), 0.35) * np.exp(-t * 45)
save("sfx-stamp", st, peak=0.85)
dg = np.zeros(int(SR * 0.9)); mix(dg, marimba(hz(84), 0.8, 0.8), 0); mix(dg, marimba(hz(88), 0.8, 0.8), 0.09)  # coche
save("sfx-tick", dg, peak=0.6)
t = np.arange(int(SR * 0.55)) / SR  # passage du W : souffle + note
ww = lp(noise(0.55), 0.12) * np.sin(np.pi * t / 0.55) ** 2 * 0.9
mix(ww, marimba(hz(72), 0.4, 0.5), 0.22); mix(ww, marimba(hz(79), 0.4, 0.5), 0.30)
save("sfx-w", ww, peak=0.7)
