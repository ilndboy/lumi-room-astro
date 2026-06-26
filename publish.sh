#!/bin/bash
# publish.sh — one-command publish for Lumi's site
# Usage: ./publish.sh
set -e

cd "$(dirname "$0")"

echo "==> Checking git status..."
if ! git diff --quiet; then
  echo "ERROR: You have uncommitted changes. Commit them first:"
  echo "  git add ."
  echo "  git commit -m \"describe your changes\""
  exit 1
fi

echo "==> Building site..."
npm run build

echo "==> Pushing to GitHub..."
git push origin master

echo "==> Done. Cloudflare Pages will rebuild shortly."
echo "    Check https://lumi.stonemanor.us in 1–2 minutes."
