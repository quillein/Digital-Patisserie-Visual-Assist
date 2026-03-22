# 🌿 Quille en Poème — Digital Patisserie Atelier

> *"Where whimsical dreams are translated into edible soul."*

Quille en Poème is a high-end, multimodal AI-driven design studio engineered for the
Artisanal Pastry and Cake Design industry. Built as part of the **Signequille** branding
system, it functions as a Digital Atelier — bridging the gap between abstract poetic
inspiration and technical culinary execution. The system leverages advanced Generative AI
to translate visual and textual moods into actionable pastry manifests, complete with
color-mixing recipes and gestural technique directives.

---

## 🔗 Live App

[View Quille en Poème](https://ai.studio/apps/5dc482f3-702b-412a-9061-f58087d51086?fullscreenApplet=true)

---

## 🎨 The Concept: Botanical Impressionism

The application is built around the aesthetic of **Botanical Impressionism** (Monet/Renoir
style) and **Palette Knife (Spatula) Painting**. It doesn't just generate cake pictures —
it generates a **Technical Manifest** that a professional pastry chef can use in a physical
kitchen to recreate the vision with precision.

At its core it solves the *Translation Gap* in artisanal baking: moving beyond pretty
pictures by providing the exact technical steps — color mixes and hand movements — required
to turn an AI-generated vision into a physical, edible product.

---

## ✨ Core Features

### 1. Multimodal Manifestation Engine
The heart of the atelier. Ingests two types of input:
- **Poetic Prompts** — Text-based moods or descriptions (e.g., *"A quiet morning in a lavender field"*)
- **Visual References** — Upload images (botanicals, landscapes, paintings) to inspire the soul of the design
- **Vessel Selection** — Choose from pastry formats: Single-tier, Multi-tier, Bento, Heart-shaped, and more

### 2. Technical Manifest — The Alchemy
Every generated design includes a full structured technical breakdown:
- **Visual Soul** — A poetic 3–4 sentence description of the design's inspiration
- **Gestural Execution** — Step-by-step spatula and palette knife instructions (angle, pressure, gesture)
- **Color Alchemy (Peotraco)** — Precise color-mixing recipes using the Peotraco color system (Orange, Black, Green, White, Red, Brown, Yellow, Blue)

### 3. Studio Modes
- **Poésie Botanique** *(Poetic)* — Original creation from abstract text and mood
- **Étude de Maître** *(Recreation)* — Study and recreate the essence of masterworks or specific subjects

### 4. Digital Galerie
- Save favorite Manifestations to a local-first gallery
- Review past designs, technical notes, and color recipes at any time
- Persistent storage via browser localStorage

### 5. Professional PDF Export
- Generate a high-quality 2-page technical Manifest Sheet
- Includes the visual design, spatula directives, and color swatches with mixing recipes
- Print-ready for physical kitchen use

### 6. Cryptographic Sharing
- Share full design data via unique URL fragments
- Manifest data is Base64-encoded into the URL — no backend database required
- Any user with the link can reconstruct the full design manifest

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 (Functional Components, Hooks) |
| Language | TypeScript — strictly typed for AI schemas and application state |
| Styling | Tailwind CSS — custom "Ethereal" design system with glassmorphism |
| AI Engine | Google Gemini 3 Pro & Gemini 2.5 Flash (`@google/genai`) |
| Document Generation | jsPDF — professional technical sheet exports |
| Icons | Lucide React |
| Build Tool | Vite |
| Persistence | Browser localStorage — local-first gallery |
| Sharing | Base64-encoded URL state — no-backend data persistence |
| Platform | Google AI Studio |

---

## 🛠️ How It Works

```
1. Input       →  User provides a poetic prompt or uploads a reference image
2. Context     →  System injects Atelier Context (Botanical Impressionism rules
                  + Peotraco Color Alchemy) via constants.tsx
3. AI Call     →  Primary: Gemini 3 Pro Image Preview (high-fidelity 1K images)
                  Fallback: Gemini 2.5 Flash Image (speed + reliability)
4. Parsing     →  Multimodal response parsed — image data + JSON technical manifest extracted
5. Rendering   →  UI displays Manifestation with interactive color swatches + technique notes
6. Export      →  Save to Galerie, download PDF, or share via cryptographic URL
```

---

## 📁 Project Structure

```
/src
  /components    — UI components (Galerie, ManifestCard, ColorSwatch, Controls)
  /services      — AI integration logic (Gemini, Imagen)
  /utils         — Prompt builders, PDF generation, Base64 sharing
  constants.tsx  — Atelier Context, Peotraco color system, studio mode definitions
  App.tsx        — Main application shell
  index.css      — Global styles and Tailwind configuration
```

---

## 🎯 Target Market

| Audience | Use Case |
|----------|----------|
| Luxury Cake Designers | Professionals specializing in palette knife and spatula-painted cakes |
| Culinary Educators | Explaining color theory and gestural techniques to students |
| High-End Patisseries | Boutiques offering bespoke, art-inspired edible creations |
| Bespoke Event Planning | Visualizing botanical themes for high-end weddings and events |

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- A Google AI Studio API Key — get one free at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Clone & Install

```bash
git clone https://github.com/quillein/quille-en-poeme.git
cd quille-en-poeme
npm install
```

### Environment Variables

```env
GEMINI_API_KEY=your_api_key_here
```

### Run Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 🌿 Part of the Signequille Universe

Quille en Poème is a core expression of the **Signequille** branding system —
a long-term pastry brand being built from scratch as a proof-of-skill portfolio,
documentation practice, and eventual foundation for a physical pastry atelier.

It embodies the Signequille ethos: where artistry, systems thinking, and culinary
craft converge into something that is both technically precise and poetically alive.

---

## 📜 License

Proprietary Digital Atelier System — Quille en Poème.

*Developed at the intersection of poetry and patisserie.*
