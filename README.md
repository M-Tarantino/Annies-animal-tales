# 🐾 Annie's Animal Tales

Persönlicher Tier-Blog mit Jekyll, GitHub Pages und automatischer Übersetzung.

## 🚀 Schnellstart

### 1. Repo klonen
```bash
git clone https://github.com/M-Tarantino/annies-animal-tales.git
cd annies-animal-tales
```

### 2. Lokal testen
```bash
cd docs
bundle install
bundle exec jekyll serve
```

Öffne: `http://localhost:4000`

### 3. GitHub Pages konfigurieren
1. Gehe zu **Settings → Pages**
2. **Source:** `/docs` Branch
3. **Save**

### 4. Admin-Panel Setup
1. Erstelle einen **GitHub Personal Access Token**:
   - GitHub Settings → Developer Settings → Personal Access Tokens
   - Permissions: `repo` (Read & Write)
   - Token speichern!

2. Als Repository Secret hinzufügen:
   - Gehe zu **Settings → Secrets and variables → Actions**
   - **New repository secret**
   - Name: `GROQ_API_KEY`
   - Value: Dein Groq API Key (optional, für Übersetzungen)

3. Admin-Panel nutzen:
   - `annies-animal-tales.github.io/admin.html`
   - Token eingeben → Beiträge schreiben & veröffentlichen

## 📂 Struktur

```
annies-animal-tales/
├── docs/                    ← GitHub Pages Source
│   ├── _config.yml
│   ├── admin.html & admin.js
│   ├── _posts/              ← Blog-Beiträge (Deutsch)
│   ├── _kindergeschichten/  ← Kindergeschichten
│   ├── _layouts/
│   ├── assets/css/main.css
│   └── ...
├── .github/workflows/       ← GitHub Actions
├── scripts/translate.py     ← Groq Übersetzung
└── README.md
```

## ✍️ Neuen Beitrag schreiben

### Via Admin-Panel
1. Gehe zu `/admin.html`
2. Gib Token ein
3. Fülle Formular aus
4. Klick "Veröffentlichen"

### Manuell (Git)
Neue Datei in `docs/_posts/`:

```yaml
---
title: "Mein Titel"
date: 2026-09-08
author: "Annie"
description: "Kurz-Beschreibung"
image: "/assets/images/..."
tags: ["Tag1", "Tag2"]
---

# Hier dein Inhalt...
```

## 👧 Kindergeschichten schreiben

Neue Datei in `docs/_kindergeschichten/`:

```yaml
---
title: "Luna die Mondkatze"
date: 2026-09-08
author: "Annie"
description: "..."
image: "/assets/images/..."
tags: ["Katzen", "Magie"]
age_group: "3-6 Jahre"     ← WICHTIG
reading_time: 5            ← WICHTIG
---
```

## 🌍 Automatische Übersetzung

1. Schreib einen Beitrag in `docs/_posts/`
2. Commit & Push
3. GitHub Action triggert automatisch
4. Englische Version wird in `docs/_posts/en/` erstellt

*Braucht GROQ_API_KEY als Secret!*

## 🖼️ Bilder

- Speichern in: `docs/assets/images/`
- Im Admin-Panel: Auto-Resize auf 2000px
- GitHub Action: Auto-Kompression

## 📱 Mobile

- Responsive Design (Desktop, Tablet, Phone, Extra-Small)
- Touch-Targets: 44×44px minimum
- Performance optimiert

## 🔧 Technologie

- **Jekyll** — Static Site Generator
- **GitHub Pages** — Hosting
- **Groq API** — Automatische Übersetzung
- **CSS3** — Mobile-First Design

## 📞 Support

- [Jekyll Docs](https://jekyllrb.com/)
- [GitHub Pages](https://docs.github.com/pages)
- [Groq API](https://console.groq.com)

---

Made with 🐾 by Annie

**URL:** https://m-tarantino.github.io/annies-animal-tales
