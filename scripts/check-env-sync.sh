#!/bin/bash
# Compares variable NAMES in .env.local against what's actually set in Vercel production.
# Never prints secret values, only which keys are missing.
# Run this before every deploy: npm run check-env

cd "$(dirname "$0")/.."

if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Install it with: npm i -g vercel"
  exit 1
fi

# Vars to skip — placeholders, Vercel-managed tokens, or manually set secrets
SKIP_KEYS="VERCEL_OIDC_TOKEN|VITE_STRIPE_PUBLISHABLE_KEY|STRIPE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|ANTHROPIC_API_KEY|VITE_N8N_SESSION_PREP_WEBHOOK_URL|VITE_N8N_CLINICAL_REVIEW_WEBHOOK_URL"

LOCAL_KEYS=$(grep -E "^[A-Z_]+=." .env.local | grep -v "^#" | cut -d '=' -f1 | grep -Ev "^($SKIP_KEYS)$" | sort -u)

# Parse plain text output — match lines starting with spaces then uppercase (variable rows only)
VERCEL_RAW=$(vercel env ls production 2>/dev/null)

if [ -z "$VERCEL_RAW" ]; then
  echo "Could not read Vercel production env vars."
  echo "Run: vercel login   then try again."
  echo "If already logged in, run: vercel link   to connect this project."
  exit 1
fi

VERCEL_KEYS=$(echo "$VERCEL_RAW" | awk '/^[[:space:]]+[A-Z_]/{print $1}' | grep -v "^name$" | sort -u)

if [ -z "$VERCEL_KEYS" ]; then
  echo "WARNING: Vercel returned env data but no keys could be parsed."
  echo "Raw output: $VERCEL_JSON"
  exit 1
fi

MISSING=$(comm -23 <(echo "$LOCAL_KEYS") <(echo "$VERCEL_KEYS"))

if [ -z "$MISSING" ]; then
  echo "All env vars in .env.local are present in Vercel production. Good to deploy."
else
  echo "WARNING: The following vars exist in .env.local but are MISSING from Vercel production:"
  echo "$MISSING" | sed 's/^/  - /'
  echo ""
  echo "Add them in the Vercel dashboard:"
  echo "  https://vercel.com/mjchunter10-4020s-projects/hunters-holistic-health/settings/environment-variables"
  echo ""
  echo "Or via CLI: vercel env add <NAME> production"
  exit 1
fi
