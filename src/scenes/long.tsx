import React from "react";
import { AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { C, FONT } from "../theme";
import { Frame, Logo, LogoCorner, Pop, SlideUp, ProgressBar, StepBadge, KenBurns, TipPill } from "../components/ui";
import type { HookScene, StepScene, PrerollScene, OutroScene } from "../types";
import { Mascot, WMark, FactChip, InfoCard, TickNote, CueSfx, Tape, HAND, TipBubble, useCardActive } from "../components/brand";
import { WikiGag, DiagramPanel, DiagramView, useCue } from "../components/stage";
import { MultiShot, KeywordBurst, KeywordSfx, useIllustrationActive } from "../components/motion";
import { IconBadge } from "../components/icons";
import { useShake } from "../components/fx";

const shotsOf = (scene: StepScene) => (scene.images?.length ? scene.images : [scene.image]);

/** Mots-clés masqués pendant les plans illustrés (la consigne est déjà écrite à l'écran). */
const StepKeywords: React.FC<{ scene: StepScene; dark?: boolean; size: number }> = ({ scene, dark, size }) => {
  const illus = useIllustrationActive(shotsOf(scene), scene.shotStarts);
  return illus || isRich(scene) ? null : <KeywordBurst keywords={scene.keywords} dark={dark} size={size} />;
};

/** Étape « riche » : annotations, chiffres ou encarts fournis → ils remplacent mots-clés, pastille et pictogramme. */
const isRich = (scene: StepScene) => Boolean(scene.facts?.length || scene.cards?.length || scene.ticks?.length || scene.gags?.length || scene.diagrams?.length || shotsOf(scene).some((im) => im?.notes?.length));

/** Bruitages de tous les éléments calés sur la voix d'une étape. */
const StepCues: React.FC<{ scene: StepScene }> = ({ scene }) => {
  if (!isRich(scene)) return <KeywordSfx keywords={scene.keywords} />;
  const cues = [
    ...shotsOf(scene).flatMap((im) => (im?.notes ?? []).map((n) => ({ t: n.t ?? 0, sfx: n.type === "cross" ? ("stamp" as const) : ("pencil" as const), volume: n.type === "cross" ? 0.5 : 0.28 }))),
    ...(scene.facts ?? []).map((f) => ({ t: f.t ?? 0, sfx: "pop" as const, volume: 0.3 })),
    ...(scene.cards ?? []).map((c) => ({ t: (c.t ?? 0) + (c.kind === "avoid" ? 0.27 : 0), sfx: c.kind === "avoid" ? ("stamp" as const) : ("pop" as const), volume: c.kind === "avoid" ? 0.55 : 0.3 })),
    ...(scene.ticks ?? []).map((k) => ({ t: (k.t ?? 0) + 0.15, sfx: "tick" as const, volume: 0.3 })),
    ...(scene.gags ?? []).map((g) => ({ t: g.t ?? 0, sfx: "boing" as const, volume: 0.4 })),
    ...(scene.diagrams ?? []).map((d) => ({ t: d.t ?? 0, sfx: "pop" as const, volume: 0.3 })),
  ];
  return <CueSfx cues={cues} />;
};

// ---------- Ouverture signée : le W se trace, prend vie (Wiki), jingle + baseline ----------
export const PreRoll: React.FC<{ scene?: PrerollScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = interpolate(frame, [1, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const alive = spring({ frame: frame - 13, fps, config: { damping: 12, stiffness: 160 } }); // le W devient Wiki
  const slide = spring({ frame: frame - 20, fps, config: { damping: 16, stiffness: 110 } }); // Wiki se pousse, le logo arrive
  const ring = interpolate(frame, [12, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const underline = interpolate(frame, [40, 54], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const baseline = scene?.baseline ?? "How-to videos, step by step.";
  return (
    <Frame bg={C.coral} dots={false}>
      <Audio src={staticFile("brand/jingle.mp3")} volume={0.55} />
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(rgba(27,42,65,0.10) 2px, transparent 2px)`, backgroundSize: "44px 44px" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", width: 1500 * ring, height: 1500 * ring, borderRadius: "50%", border: `10px solid ${C.paper}`, opacity: (1 - ring) * 0.8 }} />
      </AbsoluteFill>
      {/* Le W tracé au feutre, puis Wiki à sa place */}
      <div style={{ position: "absolute", left: 960 - 280 - slide * 470, top: 250, width: 560, height: 580, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - alive})`, opacity: 1 - alive }}>
          <WMark size={520} progress={draw} color={C.ink} stroke={18} />
        </div>
        <Mascot pose="wave" height={560} delay={13} />
      </div>
      <div style={{ position: "absolute", left: 800, top: 330, right: 90, opacity: slide, transform: `translateX(${(1 - slide) * 140}px)` }}>
        <div style={{ display: "inline-block", background: C.paper, padding: "30px 56px", borderRadius: 40, border: `8px solid ${C.ink}`, boxShadow: `14px 14px 0 ${C.ink}`, transform: "rotate(-2deg)" }}>
          <Logo size={150} />
        </div>
        <div style={{ marginTop: 54, fontFamily: HAND, fontWeight: 700, fontSize: 92, lineHeight: 1.02, color: C.paper, textShadow: `4px 5px 0 ${C.ink}`, maxWidth: 980 }}>
          {/* une ligne par membre de phrase : pas de mot orphelin */}
          {baseline.split(/(?<=,)\s+/).map((line, i) => (
            <SlideUp key={i} delay={28 + i * 5}>
              {line}
            </SlideUp>
          ))}
        </div>
        <svg width={620} height={40} viewBox="0 0 620 40" style={{ marginTop: 6, overflow: "visible" }}>
          <path d="M8 22 C120 4 220 36 330 18 S540 8 612 24" fill="none" stroke={C.sun} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - underline} />
        </svg>
      </div>
    </Frame>
  );
};

// ---------- Hook / titre ----------
/** Accroche à froid : l'image d'ouverture en plein écran, le titre, et Wiki en plombier. */
const HookCold: React.FC<{ scene: HookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => (
  <Frame bg={C.ink} dots={false}>
    <AbsoluteFill>
      <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={1} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(27,42,65,0.45) 0%, rgba(27,42,65,0) 22%, rgba(27,42,65,0.1) 48%, rgba(27,42,65,0.9) 100%)" }} />
    </AbsoluteFill>
    <LogoCorner top={70} onDark />
    <div style={{ position: "absolute", left: 90, bottom: 90, right: 640 }}>
      <SlideUp delay={4} style={{ display: "inline-block", background: C.coral, color: C.white, fontSize: 34, fontWeight: 900, letterSpacing: 5, padding: "8px 24px", borderRadius: 12, border: `4px solid ${C.paper}`, transform: "rotate(-2deg)" }}>
        {scene.category.toUpperCase()} · {scene.stepCount} STEPS
      </SlideUp>
      <SlideUp delay={10} style={{ fontSize: fitTitle(scene.title, 104), fontWeight: 900, lineHeight: 1.02, color: C.white, marginTop: 22, textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>
        {scene.title}
      </SlideUp>
    </div>
    <div style={{ position: "absolute", right: 110, bottom: 50 }}>
      <Mascot pose={(scene.pose ?? "wave") as "wave"} height={520} delay={22} />
    </div>
    <CueSfx cues={[{ t: 0.75, sfx: "boing", volume: 0.4 }]} />
  </Frame>
);

/** Introduction illustrée : schéma en coupe animé + les méthodes qui s'affichent quand la voix les nomme. */
const HookDiagram: React.FC<{ scene: HookScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chips = scene.chips ?? [];
  let mode = scene.diagramMode ?? "clog";
  let modeFrom = 0;
  for (const c of chips) if (c.mode && frame >= Math.round((c.t ?? 0) * fps)) { mode = c.mode; modeFrom = Math.round((c.t ?? 0) * fps); }
  const gag = useCue(scene.gags, 3.2);
  const shown = chips.filter((c) => !c.hidden);
  const chipsHeight = shown.reduce((h, c) => h + 162 + ((c.label ?? "").length > 17 ? 60 : 0), 0) + Math.max(0, shown.length - 1) * 26;
  const chipScale = Math.min(1.1, 860 / Math.max(1, chipsHeight));
  return (
    <Frame bg={C.paper} dots={false}>
      <AbsoluteFill style={{ backgroundImage: `linear-gradient(rgba(27,42,65,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(27,42,65,0.06) 2px, transparent 2px)`, backgroundSize: "48px 48px" }} />
      <LogoCorner top={50} />
      <div style={{ position: "absolute", left: 90, top: 150 }}>
        <SlideUp delay={4} style={{ fontSize: 32, fontWeight: 900, letterSpacing: 6, color: C.teal }}>HOW IT WORKS</SlideUp>
        <SlideUp delay={8} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 92, lineHeight: 1, color: C.ink }}>{scene.diagramTitle ?? "How it really works"}</SlideUp>
      </div>
      <Pop delay={6} style={{ position: "absolute", left: 70, top: 330 }}>
        <DiagramView name={scene.diagram ?? ""} mode={mode} local={frame - modeFrom} width={1010} />
      </Pop>
      {/* Colonne des causes : toujours entière dans l'image, quelle que soit leur nombre (échelle calculée). */}
      <div style={{ position: "absolute", left: 1110, right: 60, top: 150, height: 890, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, transform: `scale(${chipScale})`, transformOrigin: "right center" }}>
          {chips.map((c, i) => {
            const f = frame - Math.round((c.t ?? 0) * fps);
            if (f < 0 || c.hidden) return null;
            const sp = spring({ frame: f, fps, config: { damping: 12, stiffness: 170 } });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, background: C.white, border: `6px solid ${C.ink}`, borderRadius: 26, padding: "16px 28px", boxShadow: `9px 9px 0 ${[C.coral, C.teal, C.sun][i % 3]}`, transform: `translateX(${(1 - sp) * 220}px) rotate(${i % 2 ? 1 : -1}deg)`, opacity: Math.min(1, sp * 1.5) }}>
                <div style={{ width: 78, height: 78, borderRadius: 22, background: [C.coral, C.teal, C.sun][i % 3], color: i % 3 === 2 ? C.ink : C.white, fontSize: 48, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.02, color: C.ink }}>{c.label}</div>
                  {c.sub && <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 52, lineHeight: 1, color: C.coral }}>{c.sub}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {gag && (
        <div style={{ position: "absolute", right: 70, bottom: 30 }}>
          <Mascot pose={gag.item.pose as "nose"} height={330} delay={Math.round((gag.item.t ?? 0) * fps)} />
        </div>
      )}
      <CueSfx cues={[...chips.filter((c) => !c.hidden).map((c) => ({ t: c.t ?? 0, sfx: "pop" as const, volume: 0.3 })), ...(scene.gags ?? []).map((g) => ({ t: g.t ?? 0, sfx: "boing" as const, volume: 0.4 }))]} />
    </Frame>
  );
};

export const Hook: React.FC<{ scene: HookScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (scene.part === "cold") return <HookCold scene={scene} durationInFrames={durationInFrames} />;
  if (scene.part === "intro" && scene.diagram) return <HookDiagram scene={scene} />;
  const tilt = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  return (
    <Frame>
      <LogoCorner />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 80 }}>
        <Pop style={{ flex: 0.95, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: 820,
              height: 600,
              borderRadius: 44,
              overflow: "hidden",
              boxShadow: "0 30px 70px rgba(27,42,65,0.22)",
              transform: `rotate(${-3 + (1 - tilt) * 6}deg)`,
              border: `10px solid ${C.white}`,
            }}
          >
            <KenBurns image={scene.image} durationInFrames={durationInFrames} direction={1} />
          </div>
        </Pop>
        <div style={{ flex: 1.05 }}>
          <SlideUp delay={6} style={{ fontSize: 32, fontWeight: 800, color: C.coral, letterSpacing: 5 }}>
            {scene.category.toUpperCase()} · {scene.stepCount} STEPS
          </SlideUp>
          <SlideUp delay={12} style={{ fontSize: fitTitle(scene.title, 86), fontWeight: 900, lineHeight: 1.06, marginTop: 14 }}>
            {scene.title}
          </SlideUp>
          <SlideUp delay={26} style={{ marginTop: 34, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 70, height: 8, borderRadius: 4, background: C.teal }} />
            <div style={{ width: 28, height: 8, borderRadius: 4, background: C.sun }} />
            <div style={{ width: 14, height: 8, borderRadius: 4, background: C.coral }} />
          </SlideUp>
        </div>
      </AbsoluteFill>
    </Frame>
  );
};

// ---------- Étape : 3 variantes de mise en page ----------
export const Step: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  if (isRich(scene)) return <StepStage scene={scene} durationInFrames={durationInFrames} />;
  if (scene.layout === "full") return <StepFull scene={scene} durationInFrames={durationInFrames} />;
  if (scene.layout === "card") return <StepCard scene={scene} durationInFrames={durationInFrames} />;
  return <StepSplit scene={scene} durationInFrames={durationInFrames} />;
};

const StepHeader: React.FC<{ scene: StepScene; onDark?: boolean }> = ({ scene, onDark }) => (
  <>
    <ProgressBar step={scene.index} total={scene.total} />
    <LogoCorner top={70} onDark={onDark} />
    <div
      style={{
        position: "absolute",
        top: 70,
        right: 80,
        fontSize: 30,
        fontWeight: 800,
        color: onDark ? "rgba(255,255,255,0.8)" : C.muted,
        letterSpacing: 3,
        fontFamily: FONT,
      }}
    >
      {scene.bonus ? scene.bonus : `STEP ${scene.index}/${scene.total}`}
    </div>
  </>
);

/** Pastille des sections bonus (dépannage, appeler un pro, prévention) : un pictogramme au feutre à la place du numéro. */
const BonusBadge: React.FC<{ label: string; size?: number }> = ({ label, size = 130 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = spring({ frame, fps, config: { damping: 10, stiffness: 200 } });
  const l = label.toLowerCase();
  const kind = l.includes("call") || /\bpro\b/.test(l) ? "phone" : l.includes("prevent") || l.includes("keep") ? "shield" : l.includes("tip") || l.includes("further") ? "star" : "question";
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.25, background: C.sun, border: `6px solid ${C.ink}`, boxSizing: "border-box", display: "inline-flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp}) rotate(${(1 - sp) * -20 - 3}deg)`, boxShadow: "8px 8px 0 rgba(27,42,65,0.55)", flexShrink: 0 }}>
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
        {kind === "question" && (
          <>
            <path d="M20 22 C20 6 46 8 44 24 C43 33 32 33 32 43" />
            <circle cx={32} cy={55} r={2.5} fill={C.ink} />
          </>
        )}
        {kind === "phone" && <path d="M14 8 L24 8 L28 22 L21 27 C25 36 30 41 38 44 L43 37 L57 41 L57 51 C57 55 53 58 49 57 C27 54 11 38 8 16 C7 12 10 8 14 8 Z" />}
        {kind === "star" && <path d="M32 6 L39.5 23 L58 25 L44 37.5 L48 56 L32 46.5 L16 56 L20 37.5 L6 25 L24.5 23 Z" />}
        {kind === "shield" && (
          <>
            <path d="M32 6 L54 14 L54 30 C54 44 45 54 32 59 C19 54 10 44 10 30 L10 14 Z" />
            <path d="M22 31 L30 39 L43 24" />
          </>
        )}
      </svg>
    </div>
  );
};

/** Étape « plein écran » : la photo occupe tout l'écran, tout le reste vient se poser dessus. */
const StepStage: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardOn = useCardActive(scene.cards);
  const diagramOn = useCue(scene.diagrams, 6) !== null;
  const gagOn = useCue(scene.gags, 3) !== null;
  // Le titre s'affiche en grand, puis se range en bandeau compact pour rendre l'image.
  const shrink = interpolate(frame, [70, 92], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const tipFrom = Math.round(durationInFrames * 0.5);
  // La bulle d'astuce reste 9 s au plus : la fin de la scène revient à l'image seule.
  // Pas de bulle d'astuce pendant un plan avant/après : le curseur traverse l'écran.
  const starts = scene.shotStarts ?? [];
  const compareOn = (scene.images ?? []).some((im, j) => {
    if (!im?.compareFile) return false;
    const a = (starts[j] ?? 0) * fps;
    const b = (j + 1 < starts.length ? starts[j + 1] : durationInFrames / fps) * fps;
    return frame >= a - 6 && frame < b + 6;
  });
  const nowSec = frame / fps;
  const activeCard = (scene.cards ?? []).find((c) => nowSec >= (c.t ?? 0) - 0.2 && nowSec < (c.t ?? 0) + (c.dur ?? 4.4) + 0.8);
  const cardLeft = Boolean(activeCard && (scene.diagrams ?? []).some((d) => (activeCard.t ?? 0) < (d.t ?? 0) + (d.dur ?? 6) + 0.6 && (d.t ?? 0) < (activeCard.t ?? 0) + (activeCard.dur ?? 4.4) + 0.6));
  const tipOn = !compareOn && !cardOn && !diagramOn && !gagOn && frame >= tipFrom && frame < Math.min(durationInFrames - 20, tipFrom + 9 * fps);
  const accent = [C.coral, C.teal, C.sun][scene.index % 3];
  // Secousse d'impact : tampons « à éviter », croix sur l'image et entrées de Wiki.
  const shake = useShake([
    ...(scene.cards ?? []).filter((c) => c.kind === "avoid").map((c) => (c.t ?? 0) + 0.27),
    ...(scene.gags ?? []).map((g) => (g.t ?? 0) + 0.12),
    ...shotsOf(scene).flatMap((im) => (im?.notes ?? []).filter((n) => n.type === "cross").map((n) => (n.t ?? 0) + 0.2)),
  ]);
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ transform: shake }}>
        <MultiShot
          shots={shotsOf(scene)}
          durationInFrames={durationInFrames}
          seed={scene.index + 1}
          starts={scene.shotStarts}
          box={[1920, 1080]}
          overlay={`linear-gradient(180deg, rgba(27,42,65,0.55) 0%, rgba(27,42,65,0) 17%, rgba(27,42,65,0) 74%, rgba(27,42,65,0.78) 100%)`}
        />
      </AbsoluteFill>
      <StepHeader scene={scene} onDark />
      <div style={{ position: "absolute", left: 76, top: 150 }}>
        <TickNote ticks={scene.ticks} />
      </div>
      {!diagramOn && (
        <div style={{ position: "absolute", right: 86, top: 150 }}>
          <FactChip facts={scene.facts} />
        </div>
      )}
      <div style={{ position: "absolute", right: 70, top: 150 }}>
        <DiagramPanel diagrams={scene.diagrams} />
      </div>
      <WikiGag gags={scene.gags} />
      {/* Une carte affichée en même temps qu'un schéma passe à gauche : jamais l'une sur l'autre. */}
      <div style={{ position: "absolute", bottom: cardLeft ? 176 : 60, ...(cardLeft ? { left: 76 } : { right: 80 }) }}>
        <InfoCard cards={scene.cards} width={680} />
      </div>
      {tipOn && (
        <div style={{ position: "absolute", right: 70, bottom: 40 }}>
          <TipBubble text={scene.tip} width={400} delay={tipFrom} />
        </div>
      )}
      <StepCues scene={scene} />
      <div style={{ position: "absolute", left: 80, bottom: 56, display: "flex", alignItems: "center", gap: 30, transformOrigin: "0% 100%", transform: `scale(${1 - shrink * 0.42})` }}>
        {scene.bonus ? <BonusBadge label={scene.bonus} size={130} /> : <StepBadge n={scene.index} size={130} color={accent === C.sun ? C.coral : accent} />}
        <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, 78), fontWeight: 900, lineHeight: 1.04, color: C.white, textShadow: "0 4px 24px rgba(0,0,0,0.45)", maxWidth: 1000 }}>
          {scene.title}
        </SlideUp>
      </div>
    </Frame>
  );
};

/** Variante A : page de notice — titre et encarts à gauche, grande photo scotchée à droite. */
const StepSplit: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const rich = isRich(scene);
  const cardOn = useCardActive(scene.cards);
  if (!rich)
    return (
      <Frame>
        <StepHeader scene={scene} />
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 110px", gap: 60 }}>
          <div style={{ flex: 1.05 }}>
            <StepBadge n={scene.index} />
            <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, 80), fontWeight: 900, lineHeight: 1.08, marginTop: 28 }}>
              {scene.title}
            </SlideUp>
            <div style={{ marginTop: 34 }}>
              <TipPill text={scene.tip} />
            </div>
            <div style={{ marginTop: 44, minHeight: 110 }}>
              <StepKeywords scene={scene} size={60} />
            </div>
          </div>
          <Pop delay={4} style={{ flex: 1, display: "flex", justifyContent: "center", position: "relative" }}>
            <div style={{ width: 800, height: 600, borderRadius: 48, overflow: "hidden", boxShadow: "0 24px 60px rgba(27,42,65,0.16)", border: `10px solid ${C.white}` }}>
              <MultiShot shots={shotsOf(scene)} durationInFrames={durationInFrames} seed={scene.index} starts={scene.shotStarts} box={[780, 580]} />
            </div>
            <div style={{ position: "absolute", left: 10, bottom: -40 }}>
              <IconBadge name={scene.icon} size={160} delay={14} />
            </div>
          </Pop>
        </AbsoluteFill>
        <StepCues scene={scene} />
      </Frame>
    );
  return (
    <Frame>
      <StepHeader scene={scene} />
      <div style={{ position: "absolute", left: 100, top: 180, width: 570 }}>
        <StepBadge n={scene.index} size={130} />
        <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, 70), fontWeight: 900, lineHeight: 1.06, marginTop: 26 }}>
          {scene.title}
        </SlideUp>
        <div style={{ marginTop: 34, minHeight: 90 }}>
          <TickNote ticks={scene.ticks} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 130, bottom: 70 }}>
        <InfoCard cards={scene.cards} width={600} />
      </div>
      {!cardOn && (
        <div style={{ position: "absolute", left: 70, bottom: 60 }}>
          <TipBubble text={scene.tip} width={340} />
        </div>
      )}
      <Pop delay={3} style={{ position: "absolute", right: 90, top: 160, width: 1040 }}>
        <div style={{ height: 800, borderRadius: 36, overflow: "hidden", boxShadow: "0 24px 60px rgba(27,42,65,0.18)", border: `10px solid ${C.white}`, boxSizing: "border-box" }}>
          <MultiShot shots={shotsOf(scene)} durationInFrames={durationInFrames} seed={scene.index} starts={scene.shotStarts} box={[1020, 780]} />
        </div>
        <Tape side="l" inset={150} />
        <Tape side="r" inset={150} />
        <div style={{ position: "absolute", right: 30, top: 34 }}>
          <FactChip facts={scene.facts} scale={0.86} />
        </div>
      </Pop>
      <StepCues scene={scene} />
    </Frame>
  );
};

/** Variante B : image plein cadre, dégradé encre, titre en bas à gauche. */
const StepFull: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const rich = isRich(scene);
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill>
        <MultiShot
          shots={shotsOf(scene)}
          durationInFrames={durationInFrames}
          seed={scene.index + 1}
          starts={scene.shotStarts}
          illusPad={[20, 34]}
          box={[1920, 1080]}
          overlay={`linear-gradient(180deg, rgba(27,42,65,0.50) 0%, rgba(27,42,65,0.0) 22%, rgba(27,42,65,0.0) 62%, rgba(27,42,65,0.9) 100%)`}
        />
      </AbsoluteFill>
      <StepHeader scene={scene} onDark />
      {!rich && (
        <>
          <div style={{ position: "absolute", left: 110, top: 300, right: 700 }}>
            <StepKeywords scene={scene} dark size={76} />
          </div>
          <div style={{ position: "absolute", right: 110, bottom: 170 }}>
            <IconBadge name={scene.icon} size={170} delay={14} />
          </div>
          <div style={{ position: "absolute", top: 150, right: 80 }}>
            <TipPill text={scene.tip} dark />
          </div>
        </>
      )}
      {rich && (
        <>
          <div style={{ position: "absolute", left: 76, top: 150 }}>
            <TickNote ticks={scene.ticks} />
          </div>
          <div style={{ position: "absolute", right: 86, top: 150 }}>
            <FactChip facts={scene.facts} />
          </div>
          <div style={{ position: "absolute", right: 90, bottom: 120 }}>
            <InfoCard cards={scene.cards} width={660} />
          </div>
        </>
      )}
      <StepCues scene={scene} />
      <div style={{ position: "absolute", left: 110, bottom: 130, right: rich ? 860 : 110, display: "flex", alignItems: "flex-end", gap: 40 }}>
        <StepBadge n={scene.index} size={140} />
        <div style={{ flex: 1 }}>
          <SlideUp delay={6} style={{ fontSize: fitTitle(scene.title, rich ? 72 : 84), fontWeight: 900, lineHeight: 1.06, color: C.white, textShadow: "0 4px 24px rgba(0,0,0,0.35)" }}>
            {scene.title}
          </SlideUp>
        </div>
      </div>
    </Frame>
  );
};

/** Variante C : grande image en bandeau haut (photo scotchée sur la notice), titre + encart dessous. */
const StepCard: React.FC<{ scene: StepScene; durationInFrames: number }> = ({ scene, durationInFrames }) => {
  const rich = isRich(scene);
  const cardOn = useCardActive(scene.cards);
  return (
    <Frame bg={C.mint}>
      <StepHeader scene={scene} />
      <Pop delay={2} style={{ position: "absolute", top: rich ? 132 : 140, left: 110, right: 110 }}>
        <div style={{ height: rich ? 690 : 600, borderRadius: 40, overflow: "hidden", boxShadow: "0 24px 60px rgba(27,42,65,0.16)", border: rich ? `8px solid ${C.white}` : undefined, boxSizing: "border-box" }}>
          <MultiShot shots={shotsOf(scene)} durationInFrames={durationInFrames} seed={scene.index + 2} starts={scene.shotStarts} box={rich ? [1684, 674] : [1700, 600]} overlay={rich ? undefined : "linear-gradient(90deg, rgba(27,42,65,0.35), transparent 45%)"} />
        </div>
        {rich ? (
          <>
            <Tape side="l" />
            <Tape side="r" />
            <div style={{ position: "absolute", right: 34, top: 34 }}>
              <FactChip facts={scene.facts} scale={0.9} />
            </div>
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 50, bottom: 50 }}>
              <StepKeywords scene={scene} dark size={70} />
            </div>
            <div style={{ position: "absolute", right: 40, top: 40 }}>
              <IconBadge name={scene.icon} size={150} delay={14} bg={C.teal} color={C.white} />
            </div>
          </>
        )}
      </Pop>
      <StepCues scene={scene} />
      <div style={{ position: "absolute", left: 110, right: rich ? 880 : 110, top: rich ? 872 : 790, display: "flex", alignItems: "center", gap: 40 }}>
        <StepBadge n={scene.index} size={110} color={C.teal} />
        <SlideUp delay={6} style={{ flex: 1, fontSize: fitTitle(scene.title, 66), fontWeight: 900, lineHeight: 1.08 }}>
          {scene.title}
        </SlideUp>
        {!rich && (
          <div style={{ flexShrink: 0 }}>
            <TipPill text={scene.tip} size={30} />
          </div>
        )}
      </div>
      {rich && !cardOn && (
        <div style={{ position: "absolute", right: 120, bottom: 14 }}>
          <TipBubble text={scene.tip} width={430} />
        </div>
      )}
      {rich && (
        <div style={{ position: "absolute", right: 110, top: 806 }}>
          <InfoCard cards={scene.cards} />
        </div>
      )}
    </Frame>
  );
};

// ---------- Fin : logo, baseline, abonnement, Wiki ----------
export const Outro: React.FC<{ scene?: OutroScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12 } });
  const pulse = 1 + Math.sin(frame / 5) * 0.04;
  const bell = Math.sin(frame / 3) * 12;
  const underline = interpolate(frame, [26, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <Frame bg={C.ink} dots={false}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(rgba(251,247,239,0.07) 2px, transparent 2px)`, backgroundSize: "44px 44px" }} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
        <div style={{ transform: `scale(${s}) rotate(-2deg)`, background: C.paper, padding: "30px 60px", borderRadius: 36, border: `8px solid ${C.coral}`, boxShadow: `12px 12px 0 ${C.coral}` }}>
          <Logo size={110} />
        </div>
        <SlideUp delay={8} style={{ marginTop: 56, color: C.paper, fontSize: scene?.baseline ? 96 : 52, fontWeight: 700, fontFamily: scene?.baseline ? HAND : FONT, lineHeight: 1, whiteSpace: "nowrap" }}>
          {scene?.baseline ?? "A new how-to every day."}
        </SlideUp>
        <svg width={760} height={36} viewBox="0 0 760 36" style={{ marginTop: 8, overflow: "visible" }}>
          <path d="M8 20 C140 2 280 34 400 16 S660 6 752 22" fill="none" stroke={C.sun} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - underline} />
        </svg>
        <SlideUp delay={16} style={{ marginTop: 150, display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ background: C.coral, color: C.white, fontSize: 56, fontWeight: 900, padding: "24px 76px", borderRadius: 999, transform: `scale(${pulse})`, border: `6px solid ${C.paper}` }}>SUBSCRIBE</div>
          <div style={{ width: 104, height: 104, borderRadius: 999, background: C.sun, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${bell}deg)` }}>
            <svg width="54" height="54" viewBox="0 0 24 24" fill={C.ink}>
              <path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.7V3a2 2 0 1 0-4 0v1.3A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" />
            </svg>
          </div>
        </SlideUp>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 90, bottom: 70 }}>
        <Mascot pose="thumbs" height={400} delay={10} />
      </div>
      <div style={{ position: "absolute", right: 110, bottom: 70 }}>
        <Mascot pose="pencil" height={400} delay={18} />
      </div>
    </Frame>
  );
};

/** Réduit la taille du titre pour les titres longs (évite les débordements). */
export function fitTitle(title: string, base: number): number {
  const len = title.length;
  if (len <= 28) return base;
  if (len <= 40) return base * 0.86;
  if (len <= 55) return base * 0.74;
  if (len <= 70) return base * 0.64;
  return base * 0.56;
}
