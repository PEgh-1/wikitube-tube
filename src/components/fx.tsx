// Effets d'ambiance animés par-dessus une photo (vapeur, bulles, gouttes, éclats) et secousse d'impact.
// Les effets sont posés en coordonnées image (0-1) dans le conteneur transformé du plan : ils suivent la caméra.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { imageToBox } from "./brand";
import type { Fx } from "../types";

const frac = (x: number) => ((x % 1) + 1) % 1;

const Steam: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <g style={{ filter: "blur(13px)" }}>
    {[0, 1, 2, 3, 4].map((k) => {
      const p = frac(frame / 110 + k / 5);
      return <circle key={k} cx={Math.sin(p * 5 + k * 1.7) * 34 * size + (k - 2) * 16 * size} cy={-p * 300 * size} r={(26 + 62 * p) * size} fill={C.white} opacity={Math.sin(Math.PI * p) * 0.4} />;
    })}
  </g>
);

const Bubbles: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <g>
    {[0, 1, 2, 3, 4, 5, 6].map((k) => {
      const p = frac(frame / 34 + k / 7);
      return <circle key={k} cx={(((k * 53) % 200) - 100) * size + Math.sin(frame / 7 + k) * 5} cy={-p * 70 * size} r={(6 + (k % 3) * 4) * size * (0.6 + p * 0.6)} fill="rgba(255,255,255,0.18)" stroke={C.white} strokeWidth={3} opacity={(1 - p) * 0.85} />;
    })}
  </g>
);

const Drops: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <g>
    {[0, 1, 2, 3, 4, 5].map((k) => {
      const p = frac(frame / 26 + k / 6);
      const x = (((k * 37) % 140) - 70) * size;
      return <path key={k} d={`M${x} ${p * p * 230 * size} q-7 14 0 20 q7 -6 0 -20 Z`} fill="rgba(255,255,255,0.75)" stroke="rgba(120,190,220,0.9)" strokeWidth={2} opacity={1 - p * 0.8} />;
    })}
  </g>
);

const Sparkle: React.FC<{ size: number; frame: number }> = ({ size, frame }) => (
  <g>
    {[0, 1, 2, 3, 4].map((k) => {
      const p = frac(frame / 46 + k / 5);
      const a = k * 2.4;
      const s = Math.sin(Math.PI * p) * (14 + (k % 2) * 10) * size;
      const x = Math.cos(a) * 110 * size;
      const y = Math.sin(a) * 70 * size;
      return <path key={k} d={`M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`} fill={C.white} stroke={C.sun} strokeWidth={3} />;
    })}
  </g>
);

export const FxLayer: React.FC<{ fx?: Fx[] | null; box: [number, number]; focus: [number, number] }> = ({ fx, box, focus }) => {
  const frame = useCurrentFrame();
  if (!fx?.length) return null;
  const [w, h] = box;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {fx.map((f, i) => {
        const [bx, by] = imageToBox(f.at[0], f.at[1], box, focus);
        const size = (f.size ?? 1) * (w / 1920);
        const fr = frame + i * 23;
        return (
          <g key={i} transform={`translate(${bx * w} ${by * h})`}>
            {f.type === "steam" && <Steam size={size} frame={fr} />}
            {f.type === "bubbles" && <Bubbles size={size} frame={fr} />}
            {f.type === "drops" && <Drops size={size} frame={fr} />}
            {f.type === "sparkle" && <Sparkle size={size} frame={fr} />}
          </g>
        );
      })}
    </svg>
  );
};

/** Secousse d'impact : micro-tremblement amorti de l'image après chaque instant donné (s, relatifs à la scène). */
export function useShake(times: number[], strength = 9): string {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let x = 0;
  let y = 0;
  for (const t of times) {
    const f = frame - Math.round(t * fps);
    if (f < 0 || f > 11) continue;
    const d = (1 - f / 11) ** 2 * strength;
    x += Math.sin(f * 2.6) * d;
    y += Math.cos(f * 3.3) * d * 0.7;
  }
  return x || y ? `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(1.012)` : "none";
}
