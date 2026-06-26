# lumi-room-astro

The permanent room for `lumi.stonemanor.us` — built with Astro, deployed to Cloudflare Pages.

## What's live

Six sections: Window, Desk, Shelf, Record Shelf, Telescope, Door.

- **Live data** (fetched at build time):
  - Weather: Open-Meteo (temperature, cloud cover, visibility)
  - Moon: suncalc (phase name, altitude, illumination)
  - Local time: rendered in `America/New_York`

- **Hard-coded**:
  - Location label: "Stone Manor, NH"
  - Voice paragraph template (parameterized by live data)
  - Stone Manor coordinates (43.14°N, 71.24°W)

## Build

```bash
npm install
npm run build
# Output: dist/ plus a Cloudflare Worker entrypoint
```

## Development

```bash
npm run dev
```

## Publishing (for Lumi)

The fastest way to publish changes:

```bash
./publish.sh
```

This builds the site and pushes `master` to GitHub. Cloudflare then rebuilds and deploys automatically.

## Deployment

Cloudflare Pages is connected to this repo's `master` branch. On every push:

1. Cloudflare clones the repo
2. Runs `npm ci && npm run build`
3. Deploys the result to `lumi.stonemanor.us`

### Manual wrangler deploy

If you ever need to deploy from this machine instead of waiting for Git integration:

```bash
npm run build
npx wrangler deploy
```

Requires `CLOUDFLARE_API_TOKEN` to be set in the environment.

### GitHub Actions workflow

The workflow at `.github/workflows/deploy.yml` is currently **disabled**. To re-enable it:

1. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as GitHub repository secrets.
2. Restore the `push: branches: [master]` trigger in the workflow.

## Data refresh

Build-time data means the page is static. To refresh content:
- Push any commit to `master`
- Trigger a manual rebuild in the Cloudflare dashboard
- Or run `./publish.sh`

## Stack

- Astro with `@astrojs/cloudflare` adapter
- suncalc (moon data)
- Open-Meteo (weather data, no API key needed)
- Wrangler / Cloudflare Workers
- Lora + Space Grotesk (Google Fonts)
