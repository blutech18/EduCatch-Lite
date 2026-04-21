/**
 * Extracts a clean, user-friendly message from a Convex error.
 *
 * Convex wraps thrown errors with metadata like:
 *   "[CONVEX M(users:login)] [Request ID: abc123] Server Error
 *    Uncaught Error: Invalid email or password. at handler (../convex/users.ts:69:18)
 *    Called by client"
 *
 * This helper strips that noise and returns just the original message.
 */
export function parseConvexError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;

  const raw = err.message ?? "";

  // Preferred: match the `Uncaught Error: <message>` / `Uncaught ConvexError: <message>` segment,
  // stopping before the stack trace (`at handler ...`) if present.
  const match = raw.match(
    /Uncaught\s+(?:Error|ConvexError):\s*([\s\S]+?)(?:\s+at\s+handler|\n|$)/i
  );
  if (match && match[1]) {
    return cleanMessage(match[1]);
  }

  // If the string doesn't look like a Convex-wrapped error, trust it.
  if (!raw.includes("[CONVEX") && !raw.includes("Server Error") && raw.length < 200) {
    return cleanMessage(raw);
  }

  return fallback;
}

function cleanMessage(msg: string): string {
  const trimmed = msg.trim().replace(/\s+/g, " ");
  // Ensure sentence-style punctuation.
  if (!/[.!?]$/.test(trimmed)) return trimmed + ".";
  return trimmed;
}
