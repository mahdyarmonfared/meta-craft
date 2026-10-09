# 🎴 MetaCraft

> **Pixel-Perfect Social Share Preview Studio & Meta Tag Generator with Built-in SEO Health Auditor.**  
> Part of the **30 Repos in 30 Days Challenge — Day 18 / 30**.

[![CI Status](https://github.com/mahdyarmonfared/meta-craft/actions/workflows/ci.yml/badge.svg)](https://github.com/mahdyarmonfared/meta-craft/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-blue.svg)](https://nodejs.org/)
[![Challenge Day](https://img.shields.io/badge/30__Days__Challenge-Day__18-blueviolet.svg)](https://github.com/mahdyarmonfared)

```
  __  __      _          ____            __ _   
 |  \/  | ___| |_ __ _  / ___|_ __ __ _ / _| |_ 
 | |\/| |/ _ \ __/ _` | | |   | '__/ _` | |_| __|
 | |  | |  __/ || (_| | | |___| | | (_| |  _| |_ 
 |_|  |_|\___|\__\__,_|  \____|_|  \__,_|_|  \__|
  Social Share Preview Studio & Meta Tag Generator (Day 18/30)
```

---

## ⚡ The Problem

When sharing links on Twitter/X, LinkedIn, Facebook, Slack, or Discord, missing or malformed Open Graph tags result in **broken previews, missing images, ugly truncated titles, and up to 70% lower click-through rates**. 

Debugging these cards usually requires pushing changes to staging and relying on external, slow scrapers.

**MetaCraft** gives you an instant, zero-dependency, local visual studio running on `http://localhost:3018` with real-time pixel-perfect simulators for every major platform, live SEO character auditing, and automated one-click code generation for **HTML, Next.js App Router, Nuxt 3, and JSON-LD schema**.

---

## 🌟 Key Features

- 🐦 **Twitter / X Card Simulator**: Faithful rendition of Summary and Large Image cards with dark/light themes, domain pills, and author attribution.
- 📘 **Facebook & Open Graph Feed**: Pixel-accurate Facebook feed post preview with uppercase domain badges and responsive text containers.
- 💼 **LinkedIn Feed Card**: Professional feed preview formatted to match modern LinkedIn desktop and mobile clients.
- 🔍 **Google SERP Snippet**: Google search desktop and mobile snippet preview with favicon, breadcrumb paths, and title length truncation detection.
- 💬 **Discord Message Embed**: Discord server chat card preview with theme color side-border and responsive media wrapper.
- 🎯 **Real-time SEO & Social Health Auditor**: Computes a dynamic 0–100% score with instant checks for title limits (30–60 chars), description limits (70–160 chars), HTTPS image security, canonical tags, and viewport tags.
- 🌐 **Live Website URL Scraper**: Audit any live website on the internet via CLI (`meta-craft inspect <url>`) or Web GUI to extract, evaluate, and optimize existing meta tags.
- 💻 **Multi-Framework Code Generator**:
  - Standard HTML5 `<meta>` tags (categorized & escaped)
  - Next.js 14 / 15 App Router `export const metadata: Metadata = { ... }`
  - Nuxt 3 / Vue 3 `useSeoMeta({ ... })` composable
  - Schema.org JSON-LD `<script type="application/ld+json">`
- 📦 **Zero External Runtime Dependencies**: Built entirely with native Node.js standard modules (`http`, `url`, `fs`, `node:test`).

---

## 🚀 Quick Start

### 1. Launch Web Studio (Port 3018)

Clone and launch the interactive Web Studio:

```bash
git clone https://github.com/mahdyarmonfared/meta-craft.git
cd meta-craft
npm start
```

Open your browser at **`http://localhost:3018`**.

```
  ● Web Studio running at:  http://localhost:3018
  ● Local API endpoint:     http://localhost:3018/api
```

---

## 💻 CLI Usage

You can also use MetaCraft directly from your command line:

### 1. Audit Any Live Website URL

```bash
node bin/meta-craft.js inspect https://github.com
```

Output:
```text
🔍 Inspecting metadata for: https://github.com

--- Metadata Summary ---
  Title:       GitHub · Build and ship software on a single, collaborative platform · GitHub (84 chars)
  Description: Join the world's most widely adopted, AI-powered developer platform to build, scale, and deliver software. (99 chars)
  OG Image:    https://github.githubassets.com/assets/campaign-social-031d6161fa10.png
  Canonical:   https://github.com
  Twitter Card:summary_large_image
  Robots:      index, follow

--- Audit & SEO Score ---
  Overall Score: 94/100 [Grade A+]
  Passed: 6 | Warnings: 1 | Errors: 0

Check Details:
  ⚠ Page Title Length: Title is too long (84 chars) and will truncate on SERP & social cards. (14/20 pts)
    ↳ Keep title under 60 characters to avoid truncation.
  ✓ Meta Description Length: Optimal description length (99 characters). (20/20 pts)
  ✓ Open Graph Image (og:image): Secure absolute Open Graph banner image specified. (25/25 pts)
  ✓ Canonical URL: Canonical URL is properly formatted with HTTPS. (10/10 pts)
  ✓ Twitter Card Format: Twitter Card configured as "summary_large_image". (10/10 pts)
  ✓ Robots Directives: Robots directive allows search engine crawlers to index and follow links. (10/10 pts)
  ✓ Mobile Viewport: Mobile viewport is configured correctly. (5/5 pts)
```

Export raw audit results as JSON:

```bash
node bin/meta-craft.js inspect https://github.com --json
```

---

### 2. Generate Meta Tags from Presets

List built-in presets:

```bash
node bin/meta-craft.js presets
```

Generate Next.js 14/15 App Router metadata snippet:

```bash
node bin/meta-craft.js generate --preset saas --format nextjs
```

Generate standard HTML tags and write to file:

```bash
node bin/meta-craft.js generate --preset blog --format html --out ./public/meta.html
```

---

## 📋 Code Generation Examples

### Next.js App Router (`app/layout.tsx` or `app/page.tsx`)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PulseStack — Real-Time Cloud Infrastructure & Observability",
  description: "Monitor latency, distributed microservices, and server metrics with zero-overhead tracing and real-time incident alerting.",
  metadataBase: new URL("https://pulsestack.io"),
  alternates: {
    canonical: "https://pulsestack.io",
  },
  openGraph: {
    title: "PulseStack — Real-Time Cloud Infrastructure & Observability",
    description: "Instant observability, automated distributed traces, and team alerts.",
    url: "https://pulsestack.io",
    siteName: "PulseStack",
    images: [
      {
        url: "https://pulsestack.io/og-image.png",
        width: 1200,
        height: 630,
        alt: "PulseStack Cloud Observability Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseStack — Real-Time Cloud Infrastructure & Observability",
    description: "Monitor latency, microservices, and server metrics with zero overhead.",
    images: ["https://pulsestack.io/og-image.png"],
    creator: "@pulsestack_io",
    site: "@pulsestack_io",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

---

## 🏗️ Architecture

```
meta-craft/
├── .github/workflows/
│   └── ci.yml               # Multi-platform CI pipeline (Node 18, 20, 22)
├── bin/
│   └── meta-craft.js        # Executable CLI entrypoint (inspect, generate, serve)
├── src/
│   ├── core/
│   │   ├── parser.js        # Native HTML/URL parser & metadata extractor
│   │   ├── auditor.js       # SEO & Social health scoring engine (0-100%)
│   │   ├── generator.js     # Code generator (HTML, Next.js, Nuxt, JSON-LD)
│   │   └── presets.js       # Curated presets (SaaS, Blog, Portfolio, Repo)
│   ├── server/
│   │   ├── index.js         # Zero-dependency HTTP server & JSON API router
│   │   └── web/
│   │       ├── index.html   # Web Studio GUI with Tailwind & Lucide
│   │       ├── app.js       # Reactive client simulator & live audit gauge
│   │       └── style.css    # Typography, glassmorphism & simulator mockups
│   └── index.js             # Library entrypoint for programmatic usage
├── test/
│   ├── parser.test.js       # Parser test suite
│   ├── auditor.test.js      # Auditor rules & scoring test suite
│   ├── generator.test.js    # Code generation assertions
│   └── server.test.js       # HTTP server and API endpoint integration tests
├── LICENSE                  # MIT License
├── package.json
└── README.md
```

---

## 🧪 Testing

MetaCraft uses Node's native test runner (`node:test`):

```bash
npm test
```

All 14 tests run in `< 350ms` with zero third-party dependencies required.

---

## 📜 License

MIT License © 2026 [Mahdyar Monfared](https://github.com/mahdyarmonfared).
Part of the **30 Repos in 30 Days** GitHub Engineering Showcase.
