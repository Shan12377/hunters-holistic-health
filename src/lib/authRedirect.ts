// Where to send someone after they sign in or sign up.
//
// Pages that live outside the app layout (the public tools and trackers) link to
// /login?next=/their/path so people land back where they started instead of on
// the dashboard, having to navigate their way back.

const DEFAULT_DESTINATION = '/app/dashboard'

/**
 * Resolves the ?next= parameter to a safe in-app path.
 *
 * Only same-site absolute paths are allowed. Anything else falls back to the
 * dashboard, so a crafted link cannot bounce someone to another domain after
 * they authenticate.
 */
export function resolveNextPath(search: string): string {
  const next = new URLSearchParams(search).get('next')
  if (!next) return DEFAULT_DESTINATION

  // Must be a single-slash absolute path. This rejects "https://evil.com",
  // protocol-relative "//evil.com", and "javascript:" style values.
  const isSameSitePath = next.startsWith('/') && !next.startsWith('//')
  if (!isSameSitePath) return DEFAULT_DESTINATION

  return next
}
