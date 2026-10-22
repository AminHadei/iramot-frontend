import { PNG } from "pngjs";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const COLORS = [
  [45, 49, 122],
  [104, 102, 173],
  [151, 150, 200],
];

function load(path) {
  return PNG.sync.read(readFileSync(path));
}

function nearest(r, g, b) {
  let best = 0;
  let bestD = Infinity;
  for (let index = 0; index < COLORS.length; index += 1) {
    const [cr, cg, cb] = COLORS[index];
    const distance = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (distance < bestD) {
      bestD = distance;
      best = index;
    }
  }
  return bestD < 90 * 90 ? best : -1;
}

function writePbm(png, file, accept) {
  const { width, height, data } = png;
  const rowBytes = Math.ceil(width / 8);
  const bits = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      const alpha = data[i + 3];
      if (alpha < 80) continue;
      if (!accept(x, y, data[i], data[i + 1], data[i + 2], alpha)) continue;
      bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
    }
  }
  writeFileSync(file, Buffer.concat([Buffer.from(`P4\n${width} ${height}\n`), bits]));
}

function flipY(d, height) {
  // cspell:disable-next-line
  const tokens = d.match(/[MLCZmlcz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) throw new Error("empty path");
  const counts = { M: 2, L: 2, C: 6, m: 2, l: 2, c: 6 };
  const out = [];
  let index = 0;
  let command = "";
  while (index < tokens.length) {
    if (/[A-Za-z]/.test(tokens[index])) command = tokens[index++];
    if (command === "Z" || command === "z") {
      out.push("z");
      continue;
    }
    const count = counts[command];
    if (!count) throw new Error(`unsupported ${command}`);
    const numbers = [];
    for (let step = 0; step < count; step += 1) numbers.push(Number(tokens[index++]));
    const absolute = command === command.toUpperCase();
    for (let step = 1; step < numbers.length; step += 2) {
      const y = numbers[step];
      numbers[step] = Math.round((absolute ? height - y : -y) * 100) / 100;
    }
    for (let step = 0; step < numbers.length; step += 2) {
      numbers[step] = Math.round(numbers[step] * 100) / 100;
    }
    out.push(command, ...numbers);
  }
  return out.join(" ");
}

function trace(pbm, turd, height) {
  const svgPath = `${pbm}.svg`;
  execFileSync("potrace", [
    "-s",
    "--flat",
    "-u",
    "1",
    "-t",
    String(turd),
    "-a",
    "1",
    "-O",
    "0.2",
    "-o",
    svgPath,
    pbm,
  ]);
  const svg = readFileSync(svgPath, "utf8").replace(/\s+/g, " ");
  const path = svg.match(/d="([^"]+)"/)?.[1];
  if (!path) throw new Error(`no path in ${pbm}`);
  return flipY(path, height);
}

function piece(png, file, accept, turd) {
  writePbm(png, file, accept);
  return trace(file, turd, png.height);
}

const mark = load("/tmp/logo-m.png");
const horizontal = load("/tmp/logo-h.png");
const stacked = load("/tmp/logo-s.png");

const markPetals = [0, 1, 2].map((color) =>
  piece(
    mark,
    `/tmp/petal-m-${color}.pbm`,
    (_x, _y, r, g, b) => nearest(r, g, b) === color,
    6,
  ),
);
const lockupPetals = [0, 1, 2].map((color) =>
  piece(
    horizontal,
    `/tmp/petal-h-${color}.pbm`,
    (x, _y, r, g, b) => x > 274 && nearest(r, g, b) === color,
    2,
  ),
);
const lockupText = piece(
  horizontal,
  "/tmp/word-h.pbm",
  (x, _y, r, g, b) => x < 249 && nearest(r, g, b) === 0,
  0,
);
const stackedPetals = [0, 1, 2].map((color) =>
  piece(
    stacked,
    `/tmp/petal-s-${color}.pbm`,
    (_x, y, r, g, b) => y < 338 && nearest(r, g, b) === color,
    4,
  ),
);
const stackedText = piece(
  stacked,
  "/tmp/word-s.pbm",
  (_x, y, r, g, b) => y > 363 && nearest(r, g, b) === 0,
  0,
);

function bounds(png, accept) {
  let minX = png.width;
  let minY = png.height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (png.width * y + x) << 2;
      if (png.data[i + 3] < 80) continue;
      if (!accept(x, y)) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return { minX, minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

const result = {
  mark: {
    viewBox: bounds(mark, () => true),
    petals: markPetals,
  },
  lockup: {
    width: horizontal.width,
    height: horizontal.height,
    petals: lockupPetals,
    text: lockupText,
  },
  stacked: {
    width: stacked.width,
    height: stacked.height,
    petals: stackedPetals,
    text: stackedText,
  },
};

writeFileSync("tools/brand/paths.json", JSON.stringify(result));
console.log(
  JSON.stringify(
    {
      mark: result.mark.viewBox,
      lockup: {
        w: result.lockup.width,
        h: result.lockup.height,
        text: result.lockup.text.length,
      },
      stacked: {
        w: result.stacked.width,
        h: result.stacked.height,
        text: result.stacked.text.length,
      },
      petalLens: result.mark.petals.map((path) => path.length),
    },
    null,
    2,
  ),
);
