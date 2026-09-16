// ============================================================
//  FoodLens — Bilan de projet Azure
//  Présentation Typst (16:9). Compile: `typst compile foodlens_slides.typ`
//  Dépendance : @preview/fletcher (téléchargée automatiquement par Typst)
// ============================================================

#import "@preview/fletcher:0.5.2" as fletcher: diagram, node, edge

// ---------- Page & typo ----------
#set page(paper: "presentation-16-9", margin: 0pt)
#set text(
  font: ("Arial", "Liberation Sans", "Helvetica Neue", "DejaVu Sans"),
  size: 20pt,
  fill: rgb("#333333"),
)
#set par(leading: 0.7em)

// ---------- Palette (académique sobre) ----------
#let navy   = rgb("#1F4E79")
#let blue   = rgb("#2E75B6")
#let bluelt = rgb("#EAF2FB")
#let teal   = rgb("#2C7A6B")
#let teallt = rgb("#E8F3F0")
#let ink    = rgb("#333333")
#let muted  = rgb("#6B7280")
#let red    = rgb("#C0392B")
#let card   = rgb("#F4F6F9")
#let linec  = rgb("#D0D7DE")

// ---------- Helpers ----------
#let eyebrow(t, c: blue) = text(size: 12pt, weight: "bold", fill: c, tracking: 1.5pt)[#upper(t)]
#let ttl(t) = text(size: 25pt, weight: "bold", fill: navy)[#t]

#let cslide(eb, title, body) = page(
  fill: white,
  margin: (x: 36pt, top: 30pt, bottom: 30pt),
)[
  #eyebrow(eb)
  #v(3pt)
  #ttl(title)
  #v(16pt)
  #body
]

#let numcard(n, title, desc, accent: blue) = rect(
  fill: card, stroke: 0.75pt + linec, radius: 5pt, inset: 14pt, width: 100%,
)[
  #text(size: 13pt, weight: "bold", fill: accent)[#n]
  #v(5pt)
  #text(size: 16pt, weight: "bold", fill: navy)[#title]
  #if desc != none {
    v(4pt)
    text(size: 13pt, fill: ink)[#desc]
  }
]

#let arrowc = text(size: 22pt, fill: muted)[#sym.arrow.r]

// ============================================================
// SLIDE 1 — Titre
// ============================================================
// NOTES: Présentation du bilan FoodLens. Une webapp qui analyse une assiette
// à partir d'une photo. Fil rouge : couvrir 4 capacités Azure dans un produit.
#page(fill: navy, margin: (x: 50pt, y: 46pt))[
  #eyebrow("Bilan de projet · Azure", c: rgb("#8FB3DE"))
  #v(1fr)
  #text(size: 62pt, weight: "bold", fill: white)[FoodLens]
  #v(6pt)
  #text(size: 23pt, fill: rgb("#CADCFC"))[Analyse nutritionnelle d'une assiette par photo]
  #v(12pt)
  #text(size: 15pt, fill: blue)[Computer Vision · Machine Learning · Edge · Agent]
  #v(1fr)
  #text(size: 14pt, fill: rgb("#8FB3DE"))[Juin 2026 · EPITA SCIA · #text(fill: rgb("#6E93C4"))[\[Vos noms\]]]
]

// ============================================================
// SLIDE 2 — L'application en bref
// ============================================================
// NOTES: Parcours utilisateur en une phrase : photo, identification,
// nutrition + allergènes selon profil, conseil. 4 étapes, une action.
#cslide("L'application en bref", "Une photo d'assiette, quatre réponses")[
  #text(size: 17pt, fill: ink)[
    L'utilisateur photographie son assiette. L'app identifie le plat, estime ses
    valeurs nutritionnelles, signale les allergènes selon son profil, et propose un conseil.
  ]
  #v(22pt)
  #let step(n, t, d) = rect(fill: card, stroke: 0.75pt + linec, radius: 5pt, inset: 14pt, width: 100%, height: 100%)[
    #text(size: 13pt, weight: "bold", fill: blue)[#n]
    #v(5pt)
    #text(size: 17pt, weight: "bold", fill: navy)[#t]
    #v(3pt)
    #text(size: 13pt, fill: muted)[#d]
  ]
  #grid(
    columns: (1fr, auto, 1fr, auto, 1fr, auto, 1fr),
    align: horizon, gutter: 10pt,
    step("01", "Photo", "L'assiette est capturée"),
    arrowc,
    step("02", "Identification", "Quel plat est-ce ?"),
    arrowc,
    step("03", "Nutrition & allergènes", "kcal, macros, alertes"),
    arrowc,
    step("04", "Conseil", "Recommandation ciblée"),
  )
]

// ============================================================
// SLIDE 3 — Objectif pédagogique
// ============================================================
// NOTES: Couvrir 4 familles de capacités Azure dans un seul produit.
#cslide("Objectif pédagogique", "Quatre capacités Azure à couvrir")[
  #let cap(eb, ti, de, ac) = rect(fill: card, stroke: 0.75pt + linec, radius: 6pt, inset: 16pt, width: 100%, height: 100%)[
    #text(size: 12pt, weight: "bold", fill: ac, tracking: 1pt)[#upper(eb)]
    #v(6pt)
    #text(size: 20pt, weight: "bold", fill: navy)[#ti]
    #v(6pt)
    #text(size: 14pt, fill: ink)[#de]
  ]
  #grid(
    columns: (1fr, 1fr), rows: (1fr, 1fr), gutter: 14pt,
    cap("Cognitive · Computer Vision", "Tagger le contenu de la photo",
        "Azure Computer Vision extrait les tags visuels de l'assiette.", blue),
    cap("Machine Learning", "Classifier le plat",
        "ResNet18 fine-tuné sur Food-101, déployé en online endpoint Azure ML.", blue),
    cap("Edge · Conteneurisation", "Empaqueter & déployer",
        "Docker + Compose, images poussées sur Azure Container Registry.", teal),
    cap("Agentic", "Raisonner sur l'aliment",
        "Agent LLM (Qwen3-8b) : identification, allergènes et conseil.", teal),
  )
]

// ============================================================
// SLIDE 4 — Architecture finale (AVEC LE SCHÉMA)
// ============================================================
// NOTES: La photo passe par le frontend React, puis le backend FastAPI qui
// orchestre 4 sources : Azure CV (tags), Azure ML (classe), agent Qwen3 (conseil),
// nutrition (USDA + dataset statique). CV et ML sont dans le cloud Azure ;
// l'agent tourne en local via LM Studio.
#cslide("Architecture finale", "Le backend orchestre quatre sources")[
  #v(6pt)
  #align(center)[
    #diagram(
      spacing: (17mm, 9mm),
      {
        // coeur du pipeline
        node((0, 1.5), text(size: 13pt)[Utilisateur], name: <u>, stroke: none)
        node((1, 1.5), [Frontend\ #text(size: 10pt, fill: muted)[React / Vite]],
             name: <fe>, fill: card, stroke: 0.8pt + muted, inset: 8pt, corner-radius: 3pt)
        node((2, 1.5), text(fill: white)[Backend\ #text(size: 10pt, fill: rgb("#CADCFC"))[FastAPI]],
             name: <be>, fill: navy, stroke: 1pt + navy, inset: 9pt, corner-radius: 3pt)

        // 4 sources
        node((4, 0),   [Azure Computer Vision],       name: <cv>, fill: bluelt, stroke: 1pt + blue, inset: 8pt, corner-radius: 3pt)
        node((4, 1),   [Azure ML\ #text(size: 10pt, fill: muted)[ResNet18 · Food-101]], name: <ml>, fill: bluelt, stroke: 1pt + blue, inset: 8pt, corner-radius: 3pt)
        node((4, 2),   [Agent Qwen3\ #text(size: 10pt, fill: muted)[LM Studio (local)]], name: <ag>, fill: teallt, stroke: 1pt + teal, inset: 8pt, corner-radius: 3pt)
        node((4, 3),   [Nutrition\ #text(size: 10pt, fill: muted)[USDA + dataset statique]], name: <nu>, fill: teallt, stroke: 1pt + teal, inset: 8pt, corner-radius: 3pt)

        // arêtes
        edge(<u>,  <fe>, "->", text(size: 9pt, fill: muted)[photo])
        edge(<fe>, <be>, "->")
        edge(<be>, <cv>, "->", text(size: 9pt, fill: muted)[tags])
        edge(<be>, <ml>, "->", text(size: 9pt, fill: muted)[classe])
        edge(<be>, <ag>, "->", text(size: 9pt, fill: muted)[conseil])
        edge(<be>, <nu>, "->", text(size: 9pt, fill: muted)[kcal])
        edge(<be>, <fe>, "->", text(size: 9pt, fill: muted)[résultat], bend: -38deg)
      },
    )
  ]
  #v(8pt)
  #grid(columns: (auto, auto, auto), gutter: 24pt, align: horizon,
    [#box(width: 12pt, height: 12pt, fill: bluelt, stroke: 1pt + blue) #h(4pt) #text(size: 12pt, fill: muted)[Cloud Azure]],
    [#box(width: 12pt, height: 12pt, fill: teallt, stroke: 1pt + teal) #h(4pt) #text(size: 12pt, fill: muted)[Local / conteneur]],
    [#box(width: 12pt, height: 12pt, fill: navy) #h(4pt) #text(size: 12pt, fill: muted)[Orchestrateur]],
  )
]

// ============================================================
// SLIDE 5 — Démo 1/2
// ============================================================
// NOTES: Écran de capture, charte sombre "Nuit cuisine". L'utilisateur dépose une photo.
#page(fill: navy, margin: (x: 50pt, y: 46pt))[
  #eyebrow("Démo · 1/2", c: rgb("#8FB3DE"))
  #v(1fr)
  #text(size: 40pt, weight: "bold", fill: white)[Capturer l'assiette]
  #v(10pt)
  #text(size: 19pt, fill: rgb("#CADCFC"))[Écran de capture — charte sombre « Nuit cuisine ». L'utilisateur prend ou dépose une photo.]
  #v(14pt)
  #text(size: 13pt, fill: rgb("#6E93C4"))[\[ Insérer capture d'écran de l'app ici \]]
  #v(1fr)
]

// ============================================================
// SLIDE 6 — Démo 2/2
// ============================================================
// NOTES: Écran de résultat : plat identifié, kcal/macros, alertes allergènes, conseil de l'agent.
#cslide("Démo · 2/2", "Le résultat d'analyse")[
  #grid(
    columns: (1fr, 1fr), gutter: 20pt, align: horizon,
    // colonne gauche : placeholder capture
    rect(fill: card, stroke: 0.75pt + linec, radius: 6pt, width: 100%, height: 340pt)[
      #align(center + horizon)[#text(size: 14pt, fill: muted)[\[ Capture de l'écran de résultat \]]]
    ],
    // colonne droite : 4 sorties
    stack(spacing: 12pt,
      numcard("01", "Plat identifié", none, accent: blue),
      numcard("02", "kcal & macronutriments", none, accent: blue),
      numcard("03", "Alertes allergènes selon le profil", none, accent: teal),
      numcard("04", "Conseil nutritionnel de l'agent", none, accent: teal),
    ),
  )
]

// ============================================================
// SLIDE 7 — Difficultés (tableau)
// ============================================================
// NOTES: Difficultés Azure & déploiement : policy région, soft-delete CV,
// providers, quota cores, datasets nutritionnels.
#cslide("Azure · Déploiement · Données", "Difficultés majeures rencontrées")[
  #set text(size: 13pt)
  #table(
    columns: (1fr, 1.5fr, 1.5fr),
    stroke: 0.5pt + linec,
    inset: 9pt,
    align: (left + horizon),
    fill: (c, r) => if r == 0 { navy } else if calc.odd(r) { card } else { white },
    table.header(
      text(fill: white, weight: "bold")[PROBLÈME],
      text(fill: white, weight: "bold")[CAUSE],
      text(fill: white, weight: "bold")[SOLUTION],
    ),
    [Policy de région], [Abonnement étudiant restreint à 5 régions], [`az policy assignment list` → déploiement en italynorth],
    [Soft-delete Computer Vision], [Suppression du resource group → slot F0 bloqué], [`az cognitiveservices account recover`],
    [Providers non enregistrés], [Abonnement neuf], [`az provider register` manuel],
    [Quota de cores insuffisant], [Cluster + endpoint > 6 cores], [Supprimer le cluster après l'entraînement],
    [Datasets nutritionnels], [CIQUAL (FR), Nutritionix (payant), OFF (résultats faux)], [USDA FoodData Central API],
  )
]

// ============================================================
// SLIDE 8 — Limites
// ============================================================
// NOTES: Limites : 20/101 classes, cuisine US (OOD), nutrition statique /100g, un seul plat.
#cslide("État des lieux", "Limites actuelles")[
  #grid(columns: (1fr, 1fr), rows: (1fr, 1fr), gutter: 14pt,
    numcard("01", "20 classes sur 101", "Tout plat hors de ces 20 est mal géré.", accent: red),
    numcard("02", "Food-101 = cuisine US", "Les plats français sont hors distribution (OOD).", accent: red),
    numcard("03", "Nutrition statique /100g", "Sans le poids réel de la portion consommée.", accent: red),
    numcard("04", "Un seul plat par photo", "Classification simple, pas de détection multi-objets.", accent: red),
  )
]

// ============================================================
// SLIDE 9 — Améliorations
// ============================================================
// NOTES: Pistes : 101 classes + fine-tuning FR, estimation portion, détection multi-plats.
#cslide("Et ensuite", "Améliorations possibles")[
  #let imp(t) = rect(fill: card, stroke: 0.75pt + linec, radius: 6pt, inset: 16pt, width: 100%)[
    #grid(columns: (auto, 1fr), gutter: 14pt, align: horizon,
      text(size: 22pt, fill: teal)[#sym.arrow.tr],
      text(size: 17pt, fill: ink)[#t],
    )
  ]
  #stack(spacing: 14pt,
    imp("Entraîner les 101 classes + fine-tuning sur des plats français (CIQUAL / Open Food Facts)."),
    imp("Estimer la portion (objet de référence / profondeur) pour des kcal réels."),
    imp("Détection multi-plats (modèle type YOLO) au lieu d'une simple classification."),
  )
]

// ============================================================
// SLIDE 10 — Bilan
// ============================================================
// NOTES: 4 capacités couvertes par un produit unique. L'essentiel du travail :
// transformer une chaîne fragile en pipeline à garde-fous.
#cslide("Bilan", "Quatre capacités couvertes, une chaîne rendue fiable")[
  #let brick(k, v, ac) = rect(fill: card, stroke: 0.75pt + linec, radius: 6pt, inset: 14pt, width: 100%, height: 100%)[
    #text(size: 12pt, weight: "bold", fill: ac, tracking: 1pt)[#upper(k)]
    #v(5pt)
    #text(size: 15pt, weight: "bold", fill: navy)[#v]
  ]
  #grid(columns: (1fr, 1fr, 1fr, 1fr), gutter: 12pt,
    brick("Vision", "Azure Computer Vision", blue),
    brick("ML", "ResNet18 sur Azure ML", blue),
    brick("Edge", "Docker + ACR", teal),
    brick("Agentic", "Agent Qwen3", teal),
  )
  #v(22pt)
  #rect(fill: bluelt, stroke: 1pt + blue, radius: 6pt, inset: 18pt, width: 100%)[
    #text(size: 17pt, fill: navy)[
      Au-delà des briques, l'essentiel du travail a consisté à transformer une chaîne
      fragile en un *pipeline à garde-fous* qui n'affiche jamais d'aberration.
    ]
  ]
]
