import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C } from "../theme";

// Pictogrammes au trait (viewBox 64×64), dessinés à l'écran par animation de stroke-dashoffset.
export const ICON_PATHS: Record<string, string[]> = {
  drop: ["M32 8 C32 8 14 30 14 41 a18 18 0 0 0 36 0 C50 30 32 8 32 8 Z", "M24 42 a8 8 0 0 0 8 8"],
  flame: ["M32 56 c-11 0 -18 -8 -18 -18 c0 -10 8 -15 10 -24 c4 4 6 9 6 13 c3 -2 5 -6 5 -11 c9 6 15 14 15 22 c0 10 -7 18 -18 18 Z", "M32 56 c-5 0 -8 -4 -8 -8 c0 -5 4 -7 6 -11 c3 3 10 6 10 11 c0 4 -3 8 -8 8 Z"],
  clock: ["M32 10 a22 22 0 1 1 -0.01 0 Z", "M32 20 L32 33 L41 39"],
  oil: ["M26 8 h12 v8 h-12 Z", "M24 16 h16 l4 10 v26 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 v-26 Z", "M32 32 c0 0 -6 7 -6 11 a6 6 0 0 0 12 0 c0 -4 -6 -11 -6 -11 Z"],
  sparkle: ["M28 10 L32 26 L48 30 L32 34 L28 50 L24 34 L8 30 L24 26 Z", "M48 8 L50 14 L56 16 L50 18 L48 24 L46 18 L40 16 L46 14 Z", "M50 42 L51.5 46 L56 47.5 L51.5 49 L50 54 L48.5 49 L44 47.5 L48.5 46 Z"],
  towel: ["M12 14 h40 v12 h-40 Z", "M16 26 v26 h32 v-26", "M16 40 h32", "M16 46 h32"],
  shield: ["M32 8 L52 16 V30 C52 44 43 52 32 56 C21 52 12 44 12 30 V16 Z", "M23 32 L30 39 L42 25"],
  cross: ["M32 10 a22 22 0 1 1 -0.01 0 Z", "M23 23 L41 41", "M41 23 L23 41"],
  box: ["M10 22 L32 12 L54 22 L32 32 Z", "M10 22 V44 L32 54 V32", "M54 22 V44 L32 54"],
  screen: ["M8 12 h48 v32 h-48 Z", "M24 52 h16", "M32 44 v8", "M20 30 L28 36 L44 22"],
  leaf: ["M12 52 C12 26 30 12 54 10 C54 34 40 52 12 52 Z", "M12 52 L40 24"],
  wrench: ["M40 8 a12 12 0 0 0 -11 17 L10 44 a5 5 0 0 0 7 7 L36 32 a12 12 0 0 0 17 -11 l-7 4 l-6 -2 l-2 -6 l4 -7 a12 12 0 0 0 -2 -2 Z"],
  check: ["M32 10 a22 22 0 1 1 -0.01 0 Z", "M21 33 L29 41 L44 25"],
  bulb: ["M32 8 a16 16 0 0 1 10 28 c-2 2 -3 4 -3 7 h-14 c0 -3 -1 -5 -3 -7 a16 16 0 0 1 10 -28 Z", "M26 48 h12", "M28 54 h8"],
};

/** Pictogramme qui se dessine (trait) puis respire légèrement. */
export const DrawIcon: React.FC<{ name?: string | null; size?: number | string; color?: string; delay?: number; stroke?: number }> = ({
  name,
  size = 96,
  color = C.ink,
  delay = 0,
  stroke = 4.5,
}) => {
  const frame = useCurrentFrame();
  const paths = ICON_PATHS[name ?? "bulb"] ?? ICON_PATHS.bulb;
  const draw = interpolate(frame - delay, [0, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" style={{ overflow: "visible" }}>
      {paths.map((d, i) => {
        const local = Math.max(0, Math.min(1, draw * paths.length - i * 0.6));
        return (
          <path
            key={i}
            d={d}
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - local}
          />
        );
      })}
    </svg>
  );
};

/** Pastille ronde avec pictogramme : entrée élastique, dessin du trait, léger flottement. */
export const IconBadge: React.FC<{ name?: string | null; size?: number; bg?: string; color?: string; delay?: number; float?: boolean }> = ({
  name,
  size = 150,
  bg = C.sun,
  color = C.ink,
  delay = 0,
  float = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 9, stiffness: 160 } });
  const bob = float ? Math.sin((frame - delay) / 14) * 6 : 0;
  const rot = float ? Math.sin((frame - delay) / 22) * 4 : 0;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 18px 40px rgba(27,42,65,0.25)",
        transform: `translateY(${bob}px) scale(${s}) rotate(${(1 - s) * -30 + rot}deg)`,
        border: `6px solid ${C.white}`,
      }}
    >
      <DrawIcon name={name} size={size * 0.56} color={color} delay={delay + 6} />
    </div>
  );
};
