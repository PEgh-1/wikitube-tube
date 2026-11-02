import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./theme";
import { Logo } from "./components/ui";
import type { ThumbnailProps } from "./types";

/** Miniature 1280×720 : image clé plein cadre, titre court très lisible, logo et pastille étapes. */
export const Thumbnail: React.FC<ThumbnailProps> = ({ title, stepCount, category, image }) => {
  const words = title.split(" ");
  // Met en corail le mot en majuscules s'il y en a un, sinon le dernier mot.
  const hiIdx = words.findIndex((w) => w.length > 2 && w === w.toUpperCase());
  const idx = hiIdx >= 0 ? hiIdx : words.length - 1;
  const fontSize = title.length <= 22 ? 112 : title.length <= 30 ? 96 : 82;
  return (
    <AbsoluteFill style={{ background: C.ink, fontFamily: FONT, overflow: "hidden" }}>
      {image ? (
        <Img src={staticFile(image.file)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.04)" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${C.teal}, ${C.ink})` }} />
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(27,42,65,0.92) 0%, rgba(27,42,65,0.75) 45%, rgba(27,42,65,0.05) 100%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 22, background: C.coral }} />
      <div style={{ position: "absolute", top: 44, left: 70, background: C.paper, padding: "12px 22px", borderRadius: 20 }}>
        <Logo size={46} />
      </div>
      <div style={{ position: "absolute", top: 56, right: 54, background: C.sun, color: C.ink, fontSize: 30, fontWeight: 900, padding: "10px 24px", borderRadius: 999, letterSpacing: 2 }}>
        {stepCount} STEPS
      </div>
      <div style={{ position: "absolute", left: 70, right: 80, bottom: 70 }}>
        <div style={{ color: C.teal, fontSize: 30, fontWeight: 800, letterSpacing: 6, marginBottom: 12 }}>{category.toUpperCase()}</div>
        <div style={{ color: C.white, fontSize, fontWeight: 900, lineHeight: 1.02, textShadow: "0 6px 30px rgba(0,0,0,0.45)", maxWidth: 880 }}>
          {words.map((w, i) => (
            <span key={i} style={{ color: i === idx ? C.coral : C.white }}>
              {w}{" "}
            </span>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
