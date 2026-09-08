# The Living Blueprint — NYAS 2026–2027 (Proof of Work)

> **Author:** Mustafa Enes Kayacı (AI Engineer & Cloud Architect)  
> **Date:** September 2026  
> **Target:** New York Academy of Sciences (NYAS) Launchpad — Team Recruitment & CTO Pitch  
> **Single Entry Point:** [`index.html`](./index.html)

---

## 1. Overview & Vision

**The Living Blueprint** is an interactive, tactile portfolio and engineering dossier created for the **New York Academy of Sciences (NYAS) 2026–2027 Sprint**. Instead of presenting static resume bullets, it gamifies the three NYAS challenge areas into live, zero-latency functional proofs of concept:

1. **BrainTech (Neural Sync Interface)**: A real-time Brain-Computer Interface (BCI) signal processing visualizer.
2. **Misinformation & AI in Public Health (AI Fact-Checker)**: A clinical claim verification engine simulating RAG biomedical search and hallucination audits.
3. **Climatizing Infrastructure (Green Retrofit Mapper)**: An interactive geospatial simulation analyzing building energy decarbonization, rooftop solar yields, and HVAC payback ROI.

---

## 2. Design System: Earthy & Minimalist Engineering Dossier

Departing from generic tech dark-mode tropes, this platform embraces tactile warmth, physical engineering blueprint textures, and organic micro-interactions:

- **Earthy Palette**: Base tones of Oatmeal (`#F6F3EC`), Linen (`#EFE8DC`), and Parchment (`#E7DFCE`), accented with Deep Walnut (`#3A2C21`), Terracotta/Rust (`#B65434`), Sage Olive (`#4B6B54`), and Blueprint Ochre (`#BF7B2B`).
- **Paper Grain & Blueprint Grid**: Subtle fractal noise texture overlay simulating recycled engineering parchment, with faint coordinate millimeter grid lines.
- **Living Fluid Background Canvas**: HTML5 Canvas rendering gentle, organic breathing blobs in warm earth tones, reacting with pressure ripples to mouse movement.
- **Tactile Magnetic Interactions**:
  - Buttons and interactive cards calculate cursor proximity to exert subtle magnetic attraction.
  - Buttons mimic mechanical resistance with physical depress states.
  - Optional synthesized mechanical click audio via the Web Audio API with micro screen-shake haptic feedback.

---

## 3. The Three NYAS Challenge Simulations

### I. BrainTech (BCI Neural Sync Interface)
- **Concept:** Translating noisy neural activity into structured geometric intention.
- **Mechanic:** A 48-node chaotic EEG cluster drifts with Brownian noise. Pressing and holding the tactile **"Calibrate"** button progressively filters electrical artifacts, snapping the nodes into a crystalline, coherent neural network aligned with the cursor.
- **Live Telemetry:** Tracks Signal-to-Noise Ratio (SNR), Phase-Lock Value (PLV), Electrode Impedance (<2.4 kΩ), and decoded sensorimotor/visual intent vectors.

### II. Misinformation & AI in Public Health (AI Fact-Checker)
- **Concept:** Detecting health falsehoods and grounding assertions in peer-reviewed science.
- **Mechanic:** Enter any medical claim (or click quick presets such as *Bleach Ingestion*, *mRNA Vaccines & DNA*, *Vitamin D & Respiratory Health*). A 5-stage NLP pipeline runs semantic tokenization, vector search across simulated PubMed/WHO indices, and outputs a dynamic trust score.
- **Evidence Audit:** Circular SVG gauge with animated percentage counter, cited clinical trials with DOIs, and an AI hallucination risk breakdown.

### III. Climatizing Infrastructure (Green Retrofit Mapper)
- **Concept:** Modeling building decarbonization and urban heat island mitigation.
- **Mechanic:** Interactive Leaflet map with custom warm earthy cartography. Jump between global climate zones (New York, Istanbul, London, Dubai, Tokyo, Berlin) or click custom coordinates.
- **What-If Sliders:** Adjust Building Floor Area, Insulation R-Value, and Net-Zero Target Year in real-time to recalculate rooftop solar generation (MWh/yr), heat pump HVAC payback years, and avoided metric tons of CO₂.

---

## 4. How to Run

The application is engineered with **`index.html` as the single door**:

### Option A: Direct Double-Click
Simply double-click [`index.html`](./index.html) or open it directly in any modern web browser (`Chrome`, `Safari`, `Firefox`, `Edge`). No build step or package installation required.

### Option B: Local Static Server
If you prefer running a local HTTP server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node / npx
npx serve .
```
Then visit `http://localhost:8000` in your browser.

---

## 5. Project Directory Structure

```
.
├── index.html               # Single entry door (semantic HTML5, SVG icons, CDN bindings)
├── README.md                # Project documentation & technical pitch
├── css/
│   └── style.css            # Earthy design system, responsive grid, haptic animations
└── js/
    ├── app.js               # Web Audio synth, magnetic button physics, navigation spy
    ├── living-bg.js         # 60 FPS organic breathing blobs & fluid cursor ripples
    ├── bci-sim.js           # BrainTech BCI signal acquisition & calibration physics
    ├── fact-checker.js      # Public health NLP claim verification & citation engine
    └── retrofit-mapper.js   # Leaflet map, geodetic radar sweep & ROI calculator
```

---

## 6. Developer Profile & Contact

**Mustafa Enes Kayacı**  
*AI Engineer & Cloud Architect*  
Prospective Technical Lead (CTO) — NYAS 2026–2027 Sprint  
- **GitHub:** [github.com/MustafaEnes123](https://github.com/MustafaEnes123)  
- **LinkedIn:** [linkedin.com/in/mustafa-enes-kayaci](https://www.linkedin.com/in/mustafa-enes-kayaci/)
