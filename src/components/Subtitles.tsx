import React, { useMemo } from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT } from "../theme";
import type { Segment, Word } from "../types";

export type Chunk = { words: Word[]; s: number; e: number };

/** Regroupe les mots en bandeaux courts (≤ maxWords, ≤ maxDur s, coupure sur la ponctuation). */
export function chunkWords(words: Word[], maxWords = 6, maxDur = 3.4): Chunk[] {
  const chunks: Chunk[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) chunks.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e });
    cur = [];
  };
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    cur.push(w);
    const dur = w.e - cur[0].s;
    const endsSentence = /[.!?]$/.test(w.w);
    const endsClause = /[,;:]$/.test(w.w) && cur.length >= 3;
    // Anticipation : si la fin de phrase arrive dans ≤ 2 mots, on l'absorbe plutôt que de laisser un orphelin.
    const toSentenceEnd = distanceToSentenceEnd(words, i);
    const full = cur.length >= maxWords && !(toSentenceEnd > 0 && toSentenceEnd <= 2 && cur.length < maxWords + 2);
    if (full || dur >= maxDur || endsSentence || endsClause) flush();
  }
  flush();
  // Étire la fin de chaque bandeau jusqu'au début du suivant (évite les trous), max +0.6 s.
  for (let i = 0; i < chunks.length; i++) {
    const next = chunks[i + 1];
    chunks[i].e = next ? Math.min(next.s, chunks[i].e + 0.6) : chunks[i].e + 0.5;
  }
  return chunks;
}

function distanceToSentenceEnd(words: Word[], i: number): number {
  for (let j = i + 1; j < Math.min(words.length, i + 4); j++) if (/[.!?]$/.test(words[j].w)) return j - i;
  return -1;
}

/** Mots d'une scène, ramenés au temps relatif de la scène. */
export function sceneWords(segments: Segment[], sceneStart: number): Word[] {
  const out: Word[] = [];
  for (const seg of segments) {
    const off = seg.at - sceneStart;
    for (const w of seg.words ?? []) out.push({ w: w.w, s: w.s + off, e: w.e + off });
  }
  return out;
}

export const Subtitles: React.FC<{
  segments: Segment[];
  sceneStart: number;
  variant?: "long" | "short";
  dark?: boolean; // fond clair (scènes sur image) → bandeau clair
}> = ({ segments, sceneStart, variant = "long", dark = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunks = useMemo(() => chunkWords(sceneWords(segments, sceneStart), variant === "short" ? 4 : 6), [segments, sceneStart, variant]);
  const chunk = chunks.find((c) => t >= c.s - 0.05 && t < c.e);
  if (!chunk) return null;
  const isShort = variant === "short";
  const fontSize = isShort ? 60 : 42;
  return (
    <div
      style={{
        position: "absolute",
        bottom: isShort ? 470 : 60,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        padding: "0 60px",
        fontFamily: FONT,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: dark ? "rgba(251,247,239,0.94)" : "rgba(27,42,65,0.92)",
          color: dark ? C.ink : C.white,
          fontSize,
          fontWeight: 800,
          padding: isShort ? "20px 36px" : "16px 36px",
          borderRadius: isShort ? 26 : 18,
          maxWidth: isShort ? 960 : 1500,
          textAlign: "center",
          lineHeight: 1.25,
          boxShadow: "0 10px 30px rgba(27,42,65,0.18)",
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.s && t < Math.max(w.e, w.s + 0.12);
          const past = t >= w.e;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                margin: "0 7px",
                padding: "0 6px",
                borderRadius: 10,
                background: active ? C.coral : "transparent",
                color: active ? C.white : past ? (dark ? C.ink : C.white) : dark ? "rgba(27,42,65,0.55)" : "rgba(255,255,255,0.62)",
                transform: active ? "scale(1.06)" : "scale(1)",
                transition: "none",
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Pistes audio d'une scène (une <Audio> par segment, positionnée au bon frame). */
export const SceneAudio: React.FC<{ segments: Segment[]; sceneStart: number; enabled?: boolean }> = ({ segments, sceneStart, enabled = true }) => {
  const { fps } = useVideoConfig();
  if (!enabled) return null;
  return (
    <>
      {segments.map((seg) => (
        <Sequence key={seg.id} from={Math.round((seg.at - sceneStart) * fps)} durationInFrames={Math.max(1, Math.ceil(seg.duration * fps) + 2)} layout="none">
          <Audio src={staticFile(seg.file)} />
        </Sequence>
      ))}
    </>
  );
};
