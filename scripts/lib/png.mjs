// Mini encodeur PNG (RGB 8 bits) sans dépendance, pour les images de substitution en mode --mock.
import zlib from "node:zlib";

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

export function encodePng(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const PALETTES = [
  ["#2BB3A3", "#1B2A41"],
  ["#FF6B4A", "#1B2A41"],
  ["#FFC94D", "#FF6B4A"],
  ["#1B2A41", "#2BB3A3"],
  ["#FBF7EF", "#2BB3A3"],
  ["#FF6B4A", "#FFC94D"],
  ["#2BB3A3", "#FFC94D"],
  ["#1B2A41", "#FF6B4A"],
];

/** Image de substitution : dégradé diagonal aux couleurs de la charte + disques translucides. */
export function placeholderPng(width, height, seed = 0) {
  const [a, b] = PALETTES[seed % PALETTES.length].map(hex);
  const rgb = Buffer.alloc(width * height * 3);
  const circles = Array.from({ length: 5 }, (_, i) => {
    const r = (seed * 7919 + i * 104729) % 1000;
    return { cx: ((r * 37) % 100) / 100 * width, cy: ((r * 53) % 100) / 100 * height, rad: (0.12 + ((r * 11) % 20) / 100) * Math.min(width, height) };
  });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const t = (x / width + y / height) / 2;
      let r = a[0] + (b[0] - a[0]) * t;
      let g = a[1] + (b[1] - a[1]) * t;
      let bl = a[2] + (b[2] - a[2]) * t;
      for (const c of circles) {
        const d = Math.hypot(x - c.cx, y - c.cy);
        if (d < c.rad) {
          const k = 0.18 * (1 - d / c.rad);
          r += (255 - r) * k;
          g += (255 - g) * k;
          bl += (255 - bl) * k;
        }
      }
      const o = (y * width + x) * 3;
      rgb[o] = r;
      rgb[o + 1] = g;
      rgb[o + 2] = bl;
    }
  }
  return encodePng(width, height, rgb);
}
