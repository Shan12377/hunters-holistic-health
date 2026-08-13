#!/bin/bash
# Recurring code health audit for Hunter's Holistic Health.
#
# Run every 3 days:   ./scripts/health-audit.sh
#
# Checks the specific failure classes that have actually broken this app,
# not a generic linter. Every check here exists because something shipped
# broken once. See docs/HEALTH-AUDIT-LOG.md for the history and the dates.

cd "$(dirname "$0")/.." || exit 1
echo "Health audit  $(date '+%Y-%m-%d %H:%M')"
echo "=============================================="
FAIL=0

section () { echo ""; echo "$1"; }

# 1. The hang. An auth call that hits the network on a page load path.
section "1. getUser() on load paths  (hangs the page on a flaky connection)"
n=$(grep -rn "auth.getUser()" src/pages src/components 2>/dev/null | wc -l | tr -d ' ')
if [ "$n" = "0" ]; then echo "   OK, none found"
else echo "   $n found, should be getSession()"; grep -rn "auth.getUser()" src/pages src/components | sed 's|^|      |'; FAIL=1; fi

# 2. The app bootstrap must always clear its loading flag.
section "2. App auth bootstrap has catch and finally"
if grep -q "\.finally(" src/App.tsx && grep -q "BOOTSTRAP_TIMEOUT_MS" src/App.tsx; then
  echo "   OK, finally and failsafe timeout present"
else echo "   MISSING. The app can hang on the loading screen"; FAIL=1; fi

# 3. Banned punctuation, anywhere in the product.
section "3. Em and en dashes in src"
n=$(grep -ro "—\|–" src 2>/dev/null | wc -l | tr -d ' ')
if [ "$n" = "0" ]; then echo "   OK, none"
else echo "   $n found"; grep -rl "—\|–" src | sed 's|^|      |'; FAIL=1; fi

# 4. Money-spending endpoints must verify the caller.
section "4. API routes that spend money or touch user data"
for f in api/*.ts; do
  base=$(basename "$f")
  case "$base" in _guard.ts|stripe-webhook.ts|cron-reminders.ts) continue;; esac
  # A route is protected by a Supabase bearer token OR a shared webhook secret.
  if ! grep -qi "requireUser\|authorization\|x-webhook-secret" "$f"; then
    echo "   NO AUTH CHECK: $f"; FAIL=1
  fi
done
grep -q "NO AUTH CHECK" /dev/null 2>&1
[ "$FAIL" = "0" ] && echo "   OK, all routes verify the caller"

# 5. Secrets must never be committed.
section "5. Secrets staged for commit"
if git diff --cached --name-only 2>/dev/null | grep -qE "\.env|\.pem$"; then
  echo "   A secrets file is staged. Unstage it"; FAIL=1
else echo "   OK, nothing sensitive staged"; fi

# 6. Bundle size, per Rule D.
section "6. Bundle size"
if [ -d dist/assets ]; then
  big=$(find dist/assets -name "*.js" -size +500k | head -5)
  if [ -n "$big" ]; then echo "   Over 500 KB:"; echo "$big" | sed 's|^|      |'
  else echo "   OK, no chunk over 500 KB"; fi
else echo "   skipped, run npm run build first"; fi

# 7. The build itself.
section "7. TypeScript build"
if npm run build >/tmp/hha-build.log 2>&1; then echo "   OK, build passes"
else echo "   BUILD FAILED, see /tmp/hha-build.log"; FAIL=1; fi

echo ""
echo "=============================================="
if [ "$FAIL" = "0" ]; then echo "PASS. Log the date in docs/HEALTH-AUDIT-LOG.md and run again in 3 days."
else echo "ISSUES FOUND above. Fix, then re-run."; fi
exit $FAIL
