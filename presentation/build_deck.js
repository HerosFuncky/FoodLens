const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
pres.author = "Equipe FoodLens";
pres.title = "FoodLens - Analyse nutritionnelle par photo";

// ---------- Palette (académique sobre) ----------
const NAVY = "1F4E79";
const BLUE = "2E75B6";
const BLUELT = "EAF2FB";
const TEAL = "2C7A6B";
const TEALLT = "E8F3F0";
const INK = "333333";
const MUTED = "6B7280";
const RED = "C0392B";
const WHITE = "FFFFFF";
const CARD = "F4F6F9";
const LINE = "D0D7DE";
const F = "Calibri";

const W = 13.33, H = 7.5;

// ---------- Helpers ----------
function footer(slide, n) {
  slide.addText("FoodLens · Projet Azure · EPITA SCIA", {
    x: 0.6, y: 7.05, w: 7, h: 0.3, fontFace: F, fontSize: 10, color: MUTED, align: "left", margin: 0
  });
  slide.addText(String(n), {
    x: 12.4, y: 7.05, w: 0.4, h: 0.3, fontFace: F, fontSize: 10, color: MUTED, align: "right", margin: 0
  });
}

function actionTitle(slide, text) {
  slide.addText(text, {
    x: 0.6, y: 0.35, w: 12.13, h: 0.85, fontFace: F, fontSize: 25, bold: true,
    color: NAVY, align: "left", valign: "top", margin: 0
  });
}

const shadow = () => ({ type: "outer", color: "000000", blur: 5, offset: 2, angle: 90, opacity: 0.10 });

function box(slide, x, y, w, h, label, opt = {}) {
  const fill = opt.fill || WHITE;
  const border = opt.border || LINE;
  const tcolor = opt.textColor || INK;
  const fs = opt.fontSize || 11;
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h, fill: { color: fill }, line: { color: border, width: 1.25 },
    rectRadius: 0.06, shadow: opt.noShadow ? undefined : shadow()
  });
  if (opt.sub) {
    slide.addText([
      { text: label, options: { bold: true, fontSize: fs, color: tcolor, breakLine: true } },
      { text: opt.sub, options: { fontSize: fs - 2, color: MUTED } }
    ], { x, y, w, h, align: "center", valign: "middle", fontFace: F, margin: 2 });
  } else {
    slide.addText(label, { x, y, w, h, align: "center", valign: "middle", fontFace: F, fontSize: fs, bold: !!opt.bold, color: tcolor, margin: 2 });
  }
}

// arrow from (x1,y1) to (x2,y2)
function arrow(slide, x1, y1, x2, y2, opt = {}) {
  const color = opt.color || NAVY;
  const dx = x2 - x1, dy = y2 - y1;
  slide.addShape(pres.shapes.LINE, {
    x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(dx) || 0.0001, h: Math.abs(dy) || 0.0001,
    line: { color, width: opt.width || 1.5, dashType: opt.dash ? "dash" : "solid", endArrowType: "triangle" },
    flipH: dx < 0, flipV: dy < 0
  });
  if (opt.label) {
    slide.addText(opt.label, {
      x: opt.lx !== undefined ? opt.lx : (Math.min(x1, x2) - 0.2),
      y: opt.ly !== undefined ? opt.ly : (Math.min(y1, y2) + Math.abs(dy) / 2 - 0.15),
      w: opt.lw || 1.4, h: 0.3, fontFace: F, fontSize: 9, italic: true,
      color: color === RED ? RED : MUTED, align: opt.lalign || "center", margin: 0
    });
  }
}

// =========================================================
// SLIDE 1 — Titre (fond navy)
// =========================================================
let s = pres.addSlide();
s.background = { color: NAVY };
s.addText("FoodLens", { x: 0.9, y: 2.15, w: 11.5, h: 1.1, fontFace: F, fontSize: 60, bold: true, color: WHITE, align: "left", margin: 0 });
s.addText("Analyse nutritionnelle par photo", { x: 0.95, y: 3.25, w: 11.5, h: 0.7, fontFace: F, fontSize: 26, color: "CADCFC", align: "left", margin: 0 });
s.addText("Computer Vision   ·   Machine Learning   ·   Edge   ·   Agent", {
  x: 0.95, y: 4.15, w: 11.5, h: 0.5, fontFace: F, fontSize: 15, color: BLUE, align: "left", charSpacing: 1, margin: 0
});
// bottom meta
s.addShape(pres.shapes.LINE, { x: 0.95, y: 5.75, w: 3.0, h: 0, line: { color: BLUE, width: 1 } });
s.addText([
  { text: "Projet Azure · EPITA SCIA · 2026", options: { fontSize: 14, color: "CADCFC", breakLine: true } },
  { text: "[Vos noms]", options: { fontSize: 14, color: "8FB3DE" } }
], { x: 0.95, y: 5.9, w: 11, h: 0.8, fontFace: F, align: "left", margin: 0 });

// =========================================================
// SLIDE 2 — Contexte
// =========================================================
s = pres.addSlide();
actionTitle(s, "Compter les calories à la main est fastidieux et imprécis");
// left: pain points
s.addText([
  { text: "Le constat", options: { bold: true, fontSize: 18, color: NAVY, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Saisie manuelle longue et rébarbative", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Tables nutritionnelles peu accessibles au moment du repas", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Risque réel pour les personnes allergiques", options: { bullet: true, fontSize: 20, color: INK } },
], { x: 0.6, y: 1.55, w: 6.6, h: 4.2, fontFace: F, valign: "top", margin: 0 });
// right: promise card
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.6, y: 1.7, w: 5.13, h: 3.9, fill: { color: BLUELT }, line: { color: BLUE, width: 1 }, rectRadius: 0.08, shadow: shadow() });
s.addText("La promesse FoodLens", { x: 7.9, y: 2.0, w: 4.5, h: 0.5, fontFace: F, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "Une seule photo →", options: { fontSize: 20, bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 12 } },
  { text: "plat identifié", options: { bullet: true, fontSize: 18, color: INK, breakLine: true, paraSpaceAfter: 8 } },
  { text: "calories et macros estimées", options: { bullet: true, fontSize: 18, color: INK, breakLine: true, paraSpaceAfter: 8 } },
  { text: "allergènes détectés selon le profil", options: { bullet: true, fontSize: 18, color: INK, breakLine: true, paraSpaceAfter: 8 } },
  { text: "conseil nutritionnel personnalisé", options: { bullet: true, fontSize: 18, color: INK } },
], { x: 7.9, y: 2.55, w: 4.55, h: 3.0, fontFace: F, valign: "top", margin: 0 });
footer(s, 2);

// =========================================================
// SLIDE 3 — Objectif : 4 capacités
// =========================================================
s = pres.addSlide();
actionTitle(s, "FoodLens couvre les 4 capacités Azure dans un seul produit");
const caps = [
  ["1 · Cognitive", "Azure Computer Vision", "Tags visuels décrivant la photo", BLUE],
  ["2 · Machine Learning", "Azure ML — endpoint", "Classifieur ResNet18 sur Food-101", BLUE],
  ["3 · Edge", "Docker + Container Registry", "App conteneurisée, Computer Vision en local", TEAL],
  ["4 · Agentic", "Agent Qwen3 (LM Studio)", "Identifie l'aliment, détecte allergènes, conseille", TEAL],
];
const gx = [0.6, 6.97], gy = [1.5, 4.05];
caps.forEach((c, i) => {
  const x = gx[i % 2], y = gy[Math.floor(i / 2)];
  const w = 5.76, h = 2.25;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: CARD }, line: { color: LINE, width: 1 }, rectRadius: 0.06, shadow: shadow() });
  s.addText(c[0].toUpperCase(), { x: x + 0.3, y: y + 0.22, w: w - 0.6, h: 0.4, fontFace: F, fontSize: 13, bold: true, color: c[3], charSpacing: 1, margin: 0 });
  s.addText(c[1], { x: x + 0.3, y: y + 0.72, w: w - 0.6, h: 0.6, fontFace: F, fontSize: 21, bold: true, color: NAVY, margin: 0 });
  s.addText(c[2], { x: x + 0.3, y: y + 1.4, w: w - 0.6, h: 0.7, fontFace: F, fontSize: 15, color: INK, margin: 0, valign: "top" });
});
footer(s, 3);

// =========================================================
// SLIDE 4 — Architecture Azure <-> Edge
// =========================================================
s = pres.addSlide();
actionTitle(s, "Une même app tourne en cloud Azure et en local (edge)");

// ----- AZURE zone -----
const az = { x: 1.45, y: 1.15, w: 10.25, h: 2.55 };
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: az.x, y: az.y, w: az.w, h: az.h, fill: { color: BLUELT }, line: { color: BLUE, width: 1.25 }, rectRadius: 0.05 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: az.x, y: az.y, w: az.w, h: 0.34, fill: { color: BLUE }, line: { color: BLUE, width: 1 }, rectRadius: 0.05 });
s.addText("AZURE  (Cloud)", { x: az.x, y: az.y, w: az.w, h: 0.34, fontFace: F, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", charSpacing: 1, margin: 0 });

// Azure boxes
box(s, 1.95, 2.15, 1.55, 0.6, "Web App", { fill: WHITE, border: BLUE, fontSize: 12 });
box(s, 4.05, 2.15, 1.55, 0.6, "Backend", { fill: WHITE, border: BLUE, fontSize: 12 });
box(s, 8.55, 1.68, 2.7, 0.55, "Computer Vision", { fill: WHITE, border: BLUE, fontSize: 12 });
box(s, 8.55, 2.98, 2.7, 0.55, "Azure ML", { fill: WHITE, border: BLUE, fontSize: 12, sub: "ResNet18 Food-101" });
box(s, 4.05, 2.95, 1.85, 0.58, "Agent Qwen3", { fill: WHITE, border: BLUE, fontSize: 11 });

// Azure arrows
arrow(s, 3.5, 2.45, 4.05, 2.45);
arrow(s, 5.6, 2.35, 8.55, 1.95, { label: "tags", lx: 6.4, ly: 1.9 });
arrow(s, 5.6, 2.55, 8.55, 3.15, { label: "classe", lx: 6.4, ly: 3.15 });
arrow(s, 4.85, 2.75, 4.85, 2.95); // backend -> agent

// ----- Export arrow -----
s.addShape(pres.shapes.DOWN_ARROW, { x: 6.25, y: 3.75, w: 0.7, h: 0.55, fill: { color: NAVY }, line: { color: NAVY, width: 1 } });
s.addText("Export :  modèle CV → image Docker   ·   modèle ML → fichier .pt", {
  x: 7.15, y: 3.8, w: 5.6, h: 0.5, fontFace: F, fontSize: 12, italic: true, color: NAVY, align: "left", valign: "middle", margin: 0
});

// ----- EDGE zone -----
const ed = { x: 1.45, y: 4.4, w: 10.25, h: 2.4 };
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ed.x, y: ed.y, w: ed.w, h: ed.h, fill: { color: TEALLT }, line: { color: TEAL, width: 1.25 }, rectRadius: 0.05 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: ed.x, y: ed.y, w: ed.w, h: 0.34, fill: { color: TEAL }, line: { color: TEAL, width: 1 }, rectRadius: 0.05 });
s.addText("EDGE  (Local — docker compose up)", { x: ed.x, y: ed.y, w: ed.w, h: 0.34, fontFace: F, fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", charSpacing: 1, margin: 0 });

box(s, 1.95, 5.15, 1.55, 0.6, "Web App", { fill: WHITE, border: TEAL, fontSize: 12 });
box(s, 4.05, 5.15, 1.55, 0.6, "Backend", { fill: WHITE, border: TEAL, fontSize: 12 });
box(s, 8.55, 4.78, 2.7, 0.55, "CV Container", { fill: WHITE, border: TEAL, fontSize: 12 });
box(s, 8.55, 5.95, 2.7, 0.55, "Modèle ML (.pt)", { fill: WHITE, border: TEAL, fontSize: 12 });
box(s, 4.05, 5.95, 1.85, 0.55, "Agent LM Studio", { fill: WHITE, border: TEAL, fontSize: 11 });

arrow(s, 3.5, 5.45, 4.05, 5.45, { color: TEAL });
arrow(s, 5.6, 5.35, 8.55, 5.05, { color: TEAL });
arrow(s, 5.6, 5.55, 8.55, 6.2, { color: TEAL });
arrow(s, 4.85, 5.75, 4.85, 5.95, { color: TEAL });

// ----- User & AI Engineer -----
box(s, 0.35, 2.15, 1.0, 0.6, "Utilisateur", { fill: NAVY, textColor: WHITE, border: NAVY, fontSize: 11, noShadow: true });
arrow(s, 1.35, 2.45, 1.95, 2.45);
box(s, 0.35, 5.15, 1.0, 0.6, "Utilisateur", { fill: TEAL, textColor: WHITE, border: TEAL, fontSize: 11, noShadow: true });
arrow(s, 1.35, 5.45, 1.95, 5.45, { color: TEAL });

box(s, 11.85, 1.9, 1.15, 0.7, "AI Engineer", { fill: CARD, border: LINE, fontSize: 10, noShadow: true });
arrow(s, 11.85, 2.25, 11.25, 2.1, { dash: true, label: "entraîne (Food-101)", lx: 10.0, ly: 1.15, lw: 2.6, lalign: "right" });
footer(s, 4);

// =========================================================
// SLIDE 5 — Pipeline en cascade
// =========================================================
s = pres.addSlide();
actionTitle(s, "Chaque photo traverse 4 services en cascade avec garde-fous");
const steps = [
  ["Photo", "upload", CARD, INK],
  ["Azure CV", "tags de l'image", BLUELT, NAVY],
  ["Azure ML", "classe Food-101", BLUELT, NAVY],
  ["Agent Qwen3", "identifie + allergènes", TEALLT, TEAL],
  ["Nutrition", "dataset + USDA", TEALLT, TEAL],
];
let px = 0.6;
const pw = 2.28, gap = 0.22, py = 1.9, ph = 1.5;
steps.forEach((st, i) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: px, y: py, w: pw, h: ph, fill: { color: st[2] }, line: { color: LINE, width: 1 }, rectRadius: 0.06, shadow: shadow() });
  s.addText([
    { text: st[0], options: { bold: true, fontSize: 16, color: st[3], breakLine: true, paraSpaceAfter: 6 } },
    { text: st[1], options: { fontSize: 12, color: MUTED } }
  ], { x: px, y: py, w: pw, h: ph, align: "center", valign: "middle", fontFace: F, margin: 4 });
  if (i < steps.length - 1) {
    const ax = px + pw + 0.01;
    arrow(s, ax, py + ph / 2, ax + gap - 0.02, py + ph / 2);
  }
  px += pw + gap;
});
// garde-fous callout
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.95, w: 12.13, h: 2.5, fill: { color: WHITE }, line: { color: LINE, width: 1 }, rectRadius: 0.06, shadow: shadow() });
s.addText("Les garde-fous qui évitent les aberrations", { x: 0.9, y: 4.15, w: 11.5, h: 0.5, fontFace: F, fontSize: 17, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "Label ML rejeté s'il n'est pas corroboré par les tags CV (ex : tarte classée « bibimbap 100 % »)", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 9 } },
  { text: "Cohérence Atwater : on rejette toute valeur nutritionnelle où kcal ≠ protéines×4 + glucides×4 + lipides×9", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 9 } },
  { text: "Dataset statique fiable pour les 20 classes, l'API USDA ne sert que de repli", options: { bullet: true, fontSize: 16, color: INK } },
], { x: 0.95, y: 4.7, w: 11.4, h: 1.6, fontFace: F, valign: "top", margin: 0 });
footer(s, 5);

// =========================================================
// SLIDE 6 — Modèle ML (figure gauche + bullets droite)
// =========================================================
s = pres.addSlide();
actionTitle(s, "Un ResNet18 ré-entraîné par transfer learning sur 20 classes Food-101");
s.addChart(pres.charts.LINE, [{ name: "Perte", labels: ["Epoch 1", "Epoch 2", "Epoch 3", "Epoch 4"], values: [1.55, 1.10, 0.91, 0.75] }], {
  x: 0.6, y: 1.6, w: 6.3, h: 4.6, lineSize: 3, lineSmooth: true, chartColors: [BLUE],
  showTitle: true, title: "Perte d'entraînement (epochs observés)", titleColor: NAVY, titleFontSize: 14, titleFontFace: F,
  showLegend: false, showValue: true, dataLabelColor: NAVY, dataLabelFontSize: 11, dataLabelFontFace: F, dataLabelPosition: "t",
  catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: F, valAxisLabelFontFace: F,
  catAxisLabelFontSize: 11, valAxisLabelFontSize: 11, valGridLine: { color: "E2E8F0", size: 0.5 }, catGridLine: { style: "none" },
  chartArea: { fill: { color: WHITE } }
});
s.addText([
  { text: "Comment le modèle a été entraîné", options: { bold: true, fontSize: 18, color: NAVY, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Transfer learning depuis ResNet18 pré-entraîné (ImageNet)", options: { bullet: true, fontSize: 17, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "20 classes × 300 images, échantillonnage stratifié", options: { bullet: true, fontSize: 17, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Data augmentation : crop, flip, variation de couleur", options: { bullet: true, fontSize: 17, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "8 epochs sur un cluster de calcul Azure ML", options: { bullet: true, fontSize: 17, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Déployé en online endpoint managé Azure ML", options: { bullet: true, fontSize: 17, color: INK } },
], { x: 7.25, y: 1.7, w: 5.5, h: 4.4, fontFace: F, valign: "top", margin: 0 });
s.addText("Dataset : Food-101 (Bossard et al., 2014)", { x: 0.6, y: 6.35, w: 6.3, h: 0.3, fontFace: F, fontSize: 11, italic: true, color: MUTED, align: "center", margin: 0 });
footer(s, 6);

// =========================================================
// SLIDE 7 — Défis techniques
// =========================================================
s = pres.addSlide();
actionTitle(s, "Trois bugs critiques ont failli fausser toutes les prédictions");
const bugs = [
  ["« Tarte aux pommes → bibimbap 100 % »", "L'échantillonnage naïf (4000 premières images) n'entraînait que 5 classes sur 20.", "Échantillonnage stratifié : 300 images par classe, 20 classes équilibrées."],
  ["Endpoint Azure ML : erreur 424", "Conflit de versions torch / numpy 2.x → plantage à chaque inférence.", "Épinglage numpy < 2 dans l'environnement conda du déploiement."],
  ["localhost qui tourne en boucle", "Docker Desktop résolvait localhost en IPv6 (::1) et restait bloqué.", "Binding IPv4 explicite (127.0.0.1) dans docker-compose."],
];
let by = 1.5;
const bh = 1.62, bgap = 0.13;
bugs.forEach((b, i) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: by, w: 12.13, h: bh, fill: { color: CARD }, line: { color: LINE, width: 1 }, rectRadius: 0.06, shadow: shadow() });
  // problem label
  s.addText(b[0], { x: 0.9, y: by + 0.16, w: 5.5, h: 1.3, fontFace: F, fontSize: 17, bold: true, color: RED, valign: "middle", margin: 0 });
  // vertical divider
  s.addShape(pres.shapes.LINE, { x: 6.6, y: by + 0.25, w: 0, h: bh - 0.5, line: { color: LINE, width: 1 } });
  s.addText([
    { text: "Problème  ", options: { bold: true, fontSize: 12, color: MUTED } },
    { text: b[1], options: { fontSize: 14, color: INK, breakLine: true, paraSpaceAfter: 6 } },
    { text: "Solution  ", options: { bold: true, fontSize: 12, color: TEAL } },
    { text: b[2], options: { fontSize: 14, color: INK } },
  ], { x: 6.9, y: by + 0.16, w: 5.6, h: 1.3, fontFace: F, valign: "middle", margin: 0 });
  by += bh + bgap;
});
footer(s, 7);

// =========================================================
// SLIDE 8 — Online / Offline
// =========================================================
s = pres.addSlide();
actionTitle(s, "Le même Computer Vision tourne en cloud ou en conteneur Docker");
// ONLINE column
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 1.6, w: 5.9, h: 3.6, fill: { color: BLUELT }, line: { color: BLUE, width: 1.25 }, rectRadius: 0.07, shadow: shadow() });
s.addText("ONLINE — Azure Cloud", { x: 0.9, y: 1.85, w: 5.3, h: 0.5, fontFace: F, fontSize: 18, bold: true, color: NAVY, margin: 0 });
s.addText([
  { text: "Appel de l'API Azure Computer Vision", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Inférence hébergée dans le cloud", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Nécessite une connexion internet", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "USE_OFFLINE_CV = false", options: { fontSize: 15, color: NAVY, bold: true } },
], { x: 0.95, y: 2.45, w: 5.2, h: 2.5, fontFace: F, valign: "top", margin: 0 });
// OFFLINE column
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.83, y: 1.6, w: 5.9, h: 3.6, fill: { color: TEALLT }, line: { color: TEAL, width: 1.25 }, rectRadius: 0.07, shadow: shadow() });
s.addText("OFFLINE — Edge / Docker", { x: 7.13, y: 1.85, w: 5.3, h: 0.5, fontFace: F, fontSize: 18, bold: true, color: TEAL, margin: 0 });
s.addText([
  { text: "Conteneur Cognitive Services en local", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Inférence image 100 % locale", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Fonctionne même sans internet", options: { bullet: true, fontSize: 16, color: INK, breakLine: true, paraSpaceAfter: 10 } },
  { text: "USE_OFFLINE_CV = true", options: { fontSize: 15, color: TEAL, bold: true } },
], { x: 7.18, y: 2.45, w: 5.2, h: 2.5, fontFace: F, valign: "top", margin: 0 });
// bottom callout
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 5.45, w: 12.13, h: 1.0, fill: { color: NAVY }, line: { color: NAVY, width: 1 }, rectRadius: 0.07 });
s.addText("Une seule variable d'environnement fait basculer tout le pipeline — le code du backend est identique dans les deux modes.", {
  x: 1.0, y: 5.45, w: 11.3, h: 1.0, fontFace: F, fontSize: 16, color: WHITE, italic: true, valign: "middle", margin: 0
});
footer(s, 8);

// =========================================================
// SLIDE 9 — Démonstration (divider navy)
// =========================================================
s = pres.addSlide();
s.background = { color: NAVY };
s.addText("Démonstration", { x: 0.9, y: 2.4, w: 11.5, h: 1.0, fontFace: F, fontSize: 46, bold: true, color: WHITE, align: "center", margin: 0 });
s.addText("De la photo au conseil nutritionnel, en direct", { x: 0.9, y: 3.45, w: 11.5, h: 0.6, fontFace: F, fontSize: 22, color: "CADCFC", align: "center", margin: 0 });
const demoSteps = ["1 · Photographier un plat", "2 · Analyse automatique", "3 · Macros, allergènes & conseil"];
let dx = 1.9;
demoSteps.forEach((t) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: dx, y: 4.55, w: 3.1, h: 0.9, fill: { color: "2A5A8A" }, line: { color: BLUE, width: 1 }, rectRadius: 0.1 });
  s.addText(t, { x: dx, y: 4.55, w: 3.1, h: 0.9, fontFace: F, fontSize: 14, bold: true, color: WHITE, align: "center", valign: "middle", margin: 4 });
  dx += 3.3;
});

// =========================================================
// SLIDE 10 — Limites
// =========================================================
s = pres.addSlide();
actionTitle(s, "20 classes et une cuisine américaine limitent la couverture");
s.addText([
  { text: "20 des 101 classes de Food-101 seulement", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Food-101 = cuisine américaine → les plats français sont hors distribution", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Nutrition = valeurs moyennes pour 100 g, sans estimation de la portion réelle", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Un seul plat par photo (classification, pas de détection multi-objets)", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "L'endpoint ML managé est facturé en continu (VM allumée 24/7)", options: { bullet: true, fontSize: 20, color: INK } },
], { x: 0.7, y: 1.7, w: 11.9, h: 4.8, fontFace: F, valign: "top", margin: 0 });
footer(s, 10);

// =========================================================
// SLIDE 11 — Améliorations
// =========================================================
s = pres.addSlide();
actionTitle(s, "Des pistes claires pour passer du prototype au produit");
const impr = [
  ["Couverture", "Entraîner les 101 classes + fine-tuning sur des plats français (base CIQUAL)"],
  ["Portions", "Estimer le poids réel (objet de référence ou profondeur) pour des kcal justes"],
  ["Multi-plats", "Passer d'une classification à une détection d'objets (type YOLO)"],
  ["Agent cloud", "Déplacer l'agent vers Azure OpenAI / AI Foundry (cloud-native)"],
  ["Coûts", "Endpoint scale-to-zero ou inférence batch hors démo"],
];
let iy = 1.55;
const ih = 0.95, igap = 0.12;
impr.forEach((it) => {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: iy, w: 12.13, h: ih, fill: { color: CARD }, line: { color: LINE, width: 1 }, rectRadius: 0.06, shadow: shadow() });
  s.addText(it[0], { x: 0.9, y: iy, w: 2.7, h: ih, fontFace: F, fontSize: 17, bold: true, color: TEAL, valign: "middle", margin: 0 });
  s.addText(it[1], { x: 3.7, y: iy, w: 8.8, h: ih, fontFace: F, fontSize: 16, color: INK, valign: "middle", margin: 0 });
  iy += ih + igap;
});
footer(s, 11);

// =========================================================
// SLIDE 12 — Conclusion
// =========================================================
s = pres.addSlide();
actionTitle(s, "FoodLens : un pipeline robuste couvrant les 4 capacités Azure");
s.addText([
  { text: "Les 4 capacités livrées et intégrées", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Robustesse par garde-fous : label ML validé, cohérence Atwater, dataset fiable", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Fonctionne en cloud Azure et en local (edge) via une seule variable", options: { bullet: true, fontSize: 20, color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Tout est conteneurisé : docker compose up lance l'ensemble", options: { bullet: true, fontSize: 20, color: INK } },
], { x: 0.7, y: 1.7, w: 8.6, h: 4.6, fontFace: F, valign: "top", margin: 0 });
// side stat card
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.55, y: 1.9, w: 3.18, h: 3.6, fill: { color: BLUELT }, line: { color: BLUE, width: 1 }, rectRadius: 0.08, shadow: shadow() });
s.addText("4 / 4", { x: 9.55, y: 2.35, w: 3.18, h: 1.2, fontFace: F, fontSize: 54, bold: true, color: NAVY, align: "center", margin: 0 });
s.addText("capacités Azure\ncouvertes", { x: 9.55, y: 3.6, w: 3.18, h: 1.0, fontFace: F, fontSize: 16, color: INK, align: "center", valign: "top", margin: 0 });
footer(s, 12);

// =========================================================
// SLIDE 13 — Merci / Références
// =========================================================
s = pres.addSlide();
s.background = { color: NAVY };
s.addText("Merci — Questions ?", { x: 0.9, y: 1.5, w: 11.5, h: 1.0, fontFace: F, fontSize: 40, bold: true, color: WHITE, align: "left", margin: 0 });
s.addText("Références", { x: 0.95, y: 3.0, w: 6, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: "CADCFC", margin: 0 });
s.addText([
  { text: "Food-101 — Bossard, Guillaumin & Van Gool (ECCV 2014)", options: { fontSize: 14, color: "E6EEF8", breakLine: true, paraSpaceAfter: 7 } },
  { text: "Azure Machine Learning — managed online endpoints (Microsoft Docs)", options: { fontSize: 14, color: "E6EEF8", breakLine: true, paraSpaceAfter: 7 } },
  { text: "Azure Cognitive Services — Computer Vision containers", options: { fontSize: 14, color: "E6EEF8", breakLine: true, paraSpaceAfter: 7 } },
  { text: "USDA FoodData Central — base nutritionnelle", options: { fontSize: 14, color: "E6EEF8", breakLine: true, paraSpaceAfter: 7 } },
  { text: "Qwen3 (Alibaba) — modèle d'agent, exécuté via LM Studio", options: { fontSize: 14, color: "E6EEF8" } },
], { x: 0.95, y: 3.5, w: 11.5, h: 2.4, fontFace: F, valign: "top", margin: 0 });
s.addText("Dépôt : github.com/[votre-repo]   ·   Contact : [email]", { x: 0.95, y: 6.4, w: 11.5, h: 0.4, fontFace: F, fontSize: 13, italic: true, color: "8FB3DE", margin: 0 });

// ---------- Speaker notes ----------
const notes = [
  "Titre (~30s). Se présenter, annoncer FoodLens : analyser une assiette par photo. Annoncer le plan : problème, architecture, démo.",
  "Contexte (~1min). Motiver : compter les calories à la main est pénible et peu fiable ; enjeu allergènes. FoodLens = une photo suffit.",
  "Objectif (~1min). Le fil rouge du cours : couvrir les 4 capacités Azure. Les nommer une à une.",
  "Architecture (~2min). Slide clé. Expliquer le flux Azure (haut), puis l'export vers l'edge (bas) : même app, CV en conteneur local, modèle en fichier. Insister sur le miroir Azure/Edge.",
  "Pipeline (~1min30). Détailler la cascade CV→ML→Agent→Nutrition. Insister sur les garde-fous : c'est ce qui rend le système fiable malgré un modèle imparfait.",
  "Modèle ML (~1min30). Transfer learning ResNet18, 20 classes stratifiées, augmentation. Montrer la courbe de perte qui descend. Mentionner le déploiement endpoint.",
  "Défis (~2min). Raconter les 3 bugs comme une histoire : symptôme spectaculaire → cause racine → correction. C'est le moment le plus vivant.",
  "Online/Offline (~1min). La capacité Edge : même code, une variable bascule cloud↔conteneur local. Fonctionne sans internet.",
  "DÉMO (~2-3min). Lancer l'app : photographier/uploader un plat (apple pie, caesar salad ou chicken curry), montrer macros + allergènes + conseil.",
  "Limites (~1min). Être lucide : 20 classes, cuisine US, pas de portion, un plat, coût endpoint.",
  "Améliorations (~1min). Montrer qu'on sait où aller : 101 classes, portions, YOLO, agent cloud, coûts.",
  "Conclusion (~45s). Récapituler l'argument : 4/4 capacités, robustesse, cloud+edge, tout conteneurisé. Laisser cette slide pendant les questions.",
  "Merci / Références. Ouvrir les questions.",
];
pres.slides.forEach((sl, i) => { if (notes[i]) sl.addNotes(notes[i]); });

pres.writeFile({ fileName: "FoodLens_presentation.pptx" }).then((f) => console.log("OK:", f));
