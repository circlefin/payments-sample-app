/**
 * Tidies a secret that was pasted into an environment variable. Copy and paste
 * often adds quote marks, a leading "Bearer ", or stray spaces and line breaks,
 * and any of them makes the provider answer "Invalid credentials".
 */
export function cleanCredential(value: unknown): string {
  let text = typeof value === 'string' ? value : ''
  text = text.trim()
  // Remove one pair of wrapping quotes: "abc", 'abc' or `abc`
  if (text.length >= 2 && /^(["'`]).*\1$/s.test(text)) {
    text = text.slice(1, -1)
  }
  text = text.trim().replace(/^bearer\s+/i, '')
  // Real keys never contain whitespace, so drop any that crept in.
  return text.replace(/\s+/g, '')
}

/** Circle keys look like PREFIX:ID:SECRET. All three parts are needed. */
export function hasThreeKeyParts(apiKey: string): boolean {
  const parts = apiKey.split(':')
  return parts.length === 3 && parts.every((part) => part.length > 0)
}
