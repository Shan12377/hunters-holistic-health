// Wraps a promise so a hung network call (weak signal, app backgrounded mid-request)
// rejects instead of leaving the UI stuck on a loading state forever with no way out.
// Accepts PromiseLike, not just Promise, because Supabase query builders are
// thenable but do not implement the full Promise interface (no .catch/.finally).
export function withTimeout<T>(promise: PromiseLike<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
    promise.then(
      value => { clearTimeout(timer); resolve(value) },
      err => { clearTimeout(timer); reject(err) }
    )
  })
}
