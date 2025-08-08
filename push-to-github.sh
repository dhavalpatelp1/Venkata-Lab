#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-dhavalpatelp1}"
REPO="${2:-venkata-lab}"       # will slugify "Venkata Lab" -> "venkata-lab"
VISIBILITY="${3:-public}"      # public|private

echo "Owner: $OWNER"
echo "Repo:  $REPO"
echo "Visibility: $VISIBILITY"

if ! command -v gh >/dev/null 2>&1; then
  echo "Please install GitHub CLI: https://cli.github.com/"
  exit 1
fi

# Init and push
git init
git checkout -b main || git switch -c main
git add .
git commit -m "feat: initial VC LAB scaffold"
gh repo create "$OWNER/$REPO" --$VISIBILITY --source=. --remote=origin --push

echo ""
echo "Done! GitHub Pages will auto-deploy via Actions."
echo "URL (after first deploy completes): https://$OWNER.github.io/$REPO/"
echo ""
echo "If you plan to use Google Calendar OAuth in production,"
echo "add this origin to your OAuth client: https://$OWNER.github.io"
echo "and if using the repo subpath, also: https://$OWNER.github.io/$REPO"
