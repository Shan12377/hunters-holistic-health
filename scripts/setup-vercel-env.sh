#!/bin/bash
# Reads .env.local and pushes all real values to Vercel production.
# Run this ONCE from Terminal.app (not Claude Code terminal) after: vercel login
#
# Usage:
#   cd /Users/higgi/hunters-holistic-health
#   vercel login         (opens browser — only needed once)
#   bash scripts/setup-vercel-env.sh

set -e
cd "$(dirname "$0")/.."

echo ""
echo "Hunter's Holistic Health — Syncing env vars to Vercel production"
echo "================================================================="
echo ""

if ! command -v vercel &> /dev/null; then
  echo "ERROR: Vercel CLI not found. Run: npm i -g vercel"
  exit 1
fi

if ! vercel whoami &> /dev/null; then
  echo "ERROR: Not logged into Vercel. Run: vercel login"
  exit 1
fi

# These have placeholder or blank values in .env.local — skip them.
# They must be added manually in the Vercel dashboard.
SKIP=(
  "ANTHROPIC_API_KEY"
  "VITE_STRIPE_PUBLISHABLE_KEY"
  "STRIPE_SECRET_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "VITE_N8N_SESSION_PREP_WEBHOOK_URL"
  "VITE_N8N_CLINICAL_REVIEW_WEBHOOK_URL"
)

add_var() {
  local key="$1"
  local value="$2"
  # Remove existing first (--force flag not available on all CLI versions)
  vercel env rm "$key" production --yes 2>/dev/null || true
  printf '%s' "$value" | vercel env add "$key" production
  echo "  Added $key"
}

SKIPPED=()
ADDED=()
FAILED=()

while IFS= read -r line; do
  # Skip blank lines and comments
  [[ -z "$line" || "$line" == \#* ]] && continue
  # Must start with an uppercase letter (env var name)
  [[ ! "$line" =~ ^[A-Z] ]] && continue

  key=$(echo "$line" | cut -d'=' -f1)
  value=$(echo "$line" | cut -d'=' -f2-)

  # Skip blank values
  if [[ -z "$value" ]]; then
    SKIPPED+=("$key (blank)")
    continue
  fi

  # Skip placeholder values
  if [[ "$value" == *"your-"* || "$value" == "pk_test_your"* || "$value" == "sk_test_your"* ]]; then
    SKIPPED+=("$key (placeholder — needs real value)")
    continue
  fi

  # Skip vars in the manual list
  skip=false
  for s in "${SKIP[@]}"; do
    if [[ "$key" == "$s" ]]; then
      skip=true
      SKIPPED+=("$key (manual)")
      break
    fi
  done
  $skip && continue

  # Production override: replace localhost URL with production URL
  if [[ "$key" == "VITE_APP_URL" ]]; then
    value="https://www.huntersholistichealth.com"
  fi

  if add_var "$key" "$value" 2>&1; then
    ADDED+=("$key")
  else
    FAILED+=("$key")
  fi

done < .env.local

echo ""
echo "================================================================="
echo "Done."
echo ""
echo "Added (${#ADDED[@]}):"
for v in "${ADDED[@]}"; do echo "  + $v"; done

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "Failed (${#FAILED[@]}) — add these manually in Vercel dashboard:"
  for v in "${FAILED[@]}"; do echo "  x $v"; done
fi

echo ""
echo "Skipped — add these manually in Vercel dashboard:"
for v in "${SKIPPED[@]}"; do echo "  - $v"; done

echo ""
echo "Manually required (get fresh values from each service):"
echo "  STRIPE_SECRET_KEY        → Stripe Dashboard > Developers > API keys > Secret key"
echo "  VITE_STRIPE_PUBLISHABLE_KEY → Stripe Dashboard > Developers > API keys > Publishable key"
echo "  ANTHROPIC_API_KEY        → console.anthropic.com > API Keys"
echo "  SUPABASE_SERVICE_ROLE_KEY → already added in Vercel dashboard (confirm it's there)"
echo ""
echo "After adding missing vars, run: npm run check-env"
