# Scrapify: Ad Intelligence Suite  
*A sleek, minimal web app for scraping, analyzing, and optimizing native ad campaigns.*

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [Contact](#contact)

---

## Introduction

**Scrapify** is an all-in-one ad intelligence dashboard for performance marketers and channel managers. It automatically scrapes native ad campaign data from multiple networks, aggregates competitive insights, and empowers teams with AI-powered headline generation, image classification, trend analysis, and robust favorites management. Scrapify helps you analyze the competition, generate high-performing creative, and stay ahead of ad trends with a clean, minimal workflow.

---

## Features

### Dashboard
- **Total Ads**: See your current ad count at a glance.
- **Anstrex Insights**: Visualize gravity, strength, and duration metrics.
- **Upcoming Scrapes**: Quickly view scheduled scraping runs and last update times.

### Ad Intelligence
- **Scrape Data**: Explore a raw, filterable, sortable ad table with favoriting and live preview.
- **Anstrex Data**: Analyze key metrics like gravity, strength, and duration for competitor ads.
- **Top Images**: Instantly identify the most-used images in your vertical.
- **CTR Potential**: Filter for ads and headlines with high click-through potential.

### AI Studio
- **Headline Generator**: Select ads and instantly generate AI-powered headline rewrites. Save your favorites for future use.
- **Top Headlines**: View a frequency table of original headlines and AI rewrites.
- **Image Classifier (Beta)**: Automatically tag images by content type, demographics, and theme.

### Reports
- **Weekly Report**: Export top-performing headlines and AI rewrites for easy sharing.
- **Trend Analysis**: Track trending keywords by week or month.

### Favorites & Stored AI Headlines
- Curate and revisit your best AI-generated headlines and creative assets for future campaigns.

---

## Tech Stack

- **Frontend:**  
  - React
  - Node.js
  - TypeScript
  - Vite
  - Tailwind
  - [shadcn/ui](https://ui.shadcn.com/)
  - [lucide-react](https://lucide.dev/)
  - [recharts](https://recharts.org/)
- **Database:**  
  - Supabase/PostgreSQL
- **Scraping:**  
  - Local Scraper
- **AI:**  
  - OpenAI API (headline generation)

---

## Installation & Setup

```bash
git clone https://github.com/your-org/scrapify.git
cd scrapify
npm install
npm run dev
```

### Required Environment Variables

- `VITE_SUPABASE_URL=VITE_SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_ANON_KEY=VITE_SUPABASE_ANON_KEY`

### Database

- **Migrate:**  
  ```bash
  npm run migrate
  ```
- **Seed:**  
  ```bash
  npm run seed
  ```

---

## Usage

- **Sidebar Navigation**:  
  Use the sidebar to access Dashboard, Ad Intelligence, AI Studio, Reports, and Favorites.

- **Configuring Scraping Schedule**:  
  Set your preferred scraping interval in the Settings panel (`src/config/scraping.js` or via the UI).

### Example Workflows

- **Scrape New Data**:  
  Trigger a manual scrape or configure auto-scheduling. Check Dashboard for results.

- **View Anstrex Insights**:  
  Navigate to Ad Intelligence > Anstrex Data to analyze competitive metrics.

- **Generate AI Headlines & Save Favorites**:  
  In AI Studio > Headline Generator, select ads, generate rewrites, and favorite the best.

- **Export Weekly Report**:  
  Go to Reports > Weekly Report to export your top headlines and AI rewrites.

---

## Configuration

- **Scraping Interval**:  
  Set in the Settings panel or edit `SCRAPING_INTERVAL` in your `.env` file or config.

- **Year/Week Selector Defaults**:  
  Adjust default date ranges for reports in `src/config/dateDefaults.js`.

---

## Testing

- **Run all tests:**  
  ```bash
  npm run test
  ```
- **Linting:**  
  ```bash
  npm run lint
  ```

---

## Contributing

- **Fork** the repo and create your branch:  
  `git checkout -b feature/your-feature-name`
- **Commit** your changes:  
  `git commit -m "Describe your changes"`
- **Push** to your fork:  
  `git push origin feature/your-feature-name`
- **Open a Pull Request** with a clear description of your changes and link to related issues.

---

## Contact

**Maintainer:**  
Caden Shokat  
<caden.shokat@hear.com>

**Issues:**  
[GitHub Issues](https://github.com/your-org/scrapify/issues)


**Created By:**
- Caden Shokat
- Alisha Chaudhuri

---