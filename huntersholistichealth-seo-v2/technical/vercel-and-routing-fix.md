# Vercel Routing + Canonical Fix

This is the highest-leverage fix in the entire package. Until it ships, Google reads stale Wave 1 HTML and can't fetch robots.txt or sitemap.xml.

## Root cause (from the Playwright audit)

1. The latest code (commit `a7d5e5f` — "SEO: robots.txt, sitemap.xml, per-page meta tags") is likely not deployed to Vercel, so the live `index.html` still serves old title/description.
2. The SPA catch-all rewrite intercepts `/robots.txt` and `/sitemap.xml`, returning the app shell instead of the static files.

## Fix 1 — Deploy the latest code

Confirm with the developer that commit `a7d5e5f` (or later) is live on Vercel. A plain redeploy of current `main` fixes the stale homepage title/description on its own.

## Fix 2 — vercel.json: exclude static files from the SPA rewrite

Current (intercepts everything):

```json
{ "source": "/(.*)", "destination": "/index.html" }
```

Replace with (serves real files first, SPA fallback for everything else):

```json
{
  "rewrites": [
    {
      "source": "/((?!robots\\.txt|sitemap\\.xml|llms\\.txt|google.*\\.html|\\.well-known).*)",
      "destination": "/index.html"
    }
  ]
}
```

After deploying, verify all three return the real file, not HTML:
- https://www.huntersholistichealth.com/robots.txt → plain text
- https://www.huntersholistichealth.com/sitemap.xml → XML
- https://www.huntersholistichealth.com/google816d137015ebe10f.html → verification file

## Fix 3 — Canonical tags on every public page

No page currently has a canonical tag (confirmed for /, /tools, /bp-simulator). Each React page component already sets its own meta tags; add the canonical in the same place:

```jsx
<link rel="canonical" href="https://www.huntersholistichealth.com/PATH" />
```

Rules: always the www host; one canonical form site-wide; the apex domain should 301 to www (verify this redirect is active).

## Fix 4 — Real 404s for unknown routes (optional but recommended)

The SPA currently returns 200 + homepage for any unknown path (e.g. /glycemic-calculator), which creates duplicate/soft-404 signals. Per your instruction, the existing old-page indexing is being LEFT alone — but to prevent NEW phantom URLs, have the app render a real 404 view (and ideally signal 404 status) for routes that match no known page. This stops future old/mistyped URLs from silently serving the homepage.

## Fix 5 — SPA rendering consideration (medium priority)

Because content is JavaScript-rendered, Google's fast Wave 1 pass sees only what's in `index.html`. Deploying the latest `index.html` fixes the homepage, but for key landing pages the durable fix is prerendering or SSR (e.g. a prerender middleware, or migrating those routes to static/SSR output) so Wave 1 already contains correct titles, descriptions, and content. Not urgent once the deploy + vercel.json fixes land, but it's what makes indexing reliable long-term rather than dependent on Google executing your JS.
