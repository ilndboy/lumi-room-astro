# lumi-room-astro

The permanent room for `lumi.stonemanor.us` — built with Astro, deployed to Cloudflare Pages.

## What's live (v1)

**The Window section only.** Other sections (Desk, Shelf, Record Shelf, Telescope, Door) will follow.

- **Live data** (fetched at build time):
  - Weather: Open-Meteo (temperature, cloud cover, visibility)
  - Moon: suncalc (phase name, altitude, illumination)
  - Local time: rendered in `America/New_York`

- **Hard-coded** (for v1):
  - Location label: "Stone Manor, NY"
  - Voice paragraph template (parameterized by live data)
  - Stone Manor coordinates (41.27°N, 73.95°W)

## Build

```bash
npm install
npm run build
# Output: dist/
```

## Development

```bash
npm run dev
```

## Deployment

### Option A: Cloudflare Pages via Git integration (recommended)

1. Go to [Cloudflare Pages dashboard](https://dash.cloudflare.com/?to=/:account/pages)
2. Create a new project → Connect to Git
3. Select the `ilndboy/lumi-room-astro` repository
4. Configure:
   - **Production branch:** `master`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** 20
5. Deploy — Cloudflare will auto-deploy on every push to `master`

### Option B: GitHub Actions workflow

A workflow is configured at `.github/workflows/deploy.yml`. To use it:

1. Create a Cloudflare API token with **Cloudflare Pages:Edit** permission
2. Add these GitHub repository secrets:
   - `CLOUDFLARE_API_TOKEN` — the API token
   - `CLOUDFLARE_ACCOUNT_ID` — `170a4dcefbe3d26d41428110a4f52844`

### Custom domain

Once deployed, wire `lumi.stonemanor.us` via CNAME to the `*.pages.dev` URL.

## Data refresh

Build-time data means the page is static. To refresh:
- **Git integration:** set up a Cloudflare Pages scheduled deploy (cron)
- **GitHub Actions:** add a `schedule` trigger to the deploy workflow
- **Manual:** push any commit to `master`

## Stack

- Astro (static build)
- suncalc (moon data)
- Open-Meteo (weather data, no API key needed)
- Lora + Space Grotesk (Google Fonts)