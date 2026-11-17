import React, { useEffect, useRef } from "react";
import { continueRender, delayRender, useCurrentFrame } from "remotion";

/**
 * Sonde de mise en page (contrôle uniquement, jamais dans un rendu final) :
 * encadre en magenta tout texte qui sort de l'image ou de son conteneur (coupé),
 * et en cyan deux textes qui se superposent. Les cadres sont ensuite comptés par script.
 */
export const OverflowProbe: React.FC = () => {
  const frame = useCurrentFrame();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = delayRender(`probe-${frame}`);
    const run = () => {
      const layer = ref.current;
      const root = layer?.parentElement;
      if (!layer || !root) return continueRender(h);
      layer.innerHTML = "";
      const R = root.getBoundingClientRect();
      const k = R.width / (root as HTMLElement).offsetWidth || 1;
      type Item = { r: DOMRect; el: Element; text: string };
      const items: Item[] = [];
      const visible = (el: Element) => {
        let o = 1;
        for (let a: Element | null = el; a && a !== root; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.display === "none" || cs.visibility === "hidden") return false;
          o *= Number(cs.opacity);
        }
        return o > 0.25;
      };
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        const el = n.parentElement;
        const text = (n.textContent ?? "").trim();
        if (!el || !text || layer.contains(el) || el.closest("svg")) continue;
        if (!visible(el)) continue;
        const range = document.createRange();
        range.selectNodeContents(n);
        for (const r of Array.from(range.getClientRects())) if (r.width > 3 && r.height > 3) items.push({ r, el, text });
      }
      root.querySelectorAll("svg text").forEach((el) => {
        const text = (el.textContent ?? "").trim();
        const r = el.getBoundingClientRect();
        if (text && r.width > 3 && r.height > 3 && visible(el)) items.push({ r, el, text });
      });
      const box = (r: DOMRect, color: string) => {
        const d = document.createElement("div");
        d.style.cssText = `position:absolute;left:${(r.left - R.left) / k - 6}px;top:${(r.top - R.top) / k - 6}px;width:${r.width / k + 12}px;height:${r.height / k + 12}px;border:9px solid ${color};box-sizing:border-box;z-index:99999;pointer-events:none`;
        layer.appendChild(d);
      };
      const T = 3 * k;
      for (const it of items) {
        const { r } = it;
        let bad = r.left < R.left - T || r.right > R.right + T || r.top < R.top - T || r.bottom > R.bottom + T;
        for (let a = it.el.parentElement; a && a !== root && !bad; a = a.parentElement) {
          const cs = getComputedStyle(a);
          const clips = a.tagName.toLowerCase() === "svg" || cs.overflowX !== "visible" || cs.overflowY !== "visible";
          if (!clips) continue;
          const ar = a.getBoundingClientRect();
          bad = r.left < ar.left - T || r.right > ar.right + T || r.top < ar.top - T || r.bottom > ar.bottom + T;
        }
        if (bad) box(r, "#FF00FF");
      }
      for (let i = 0; i < items.length; i++)
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i], b = items[j];
          if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
          const sh = (r: DOMRect) => ({ l: r.left + 3 * k, rr: r.right - 3 * k, t: r.top + r.height * 0.22, b: r.bottom - r.height * 0.22 });
          const x = sh(a.r), y = sh(b.r);
          const w = Math.min(x.rr, y.rr) - Math.max(x.l, y.l), hh = Math.min(x.b, y.b) - Math.max(x.t, y.t);
          if (w > 4 * k && hh > 4 * k) {
            box(a.r, "#00FFFF");
            box(b.r, "#00FFFF");
          }
        }
      continueRender(h);
    };
    const id = requestAnimationFrame(() => requestAnimationFrame(run));
    return () => {
      cancelAnimationFrame(id);
      continueRender(h);
    };
  }, [frame]);
  return <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 99999 }} />;
};
