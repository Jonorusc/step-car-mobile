/**
 * Simple in-memory rate limiter for client-side brute-force protection.
 *
 * Usage:
 *   const { allowed, remainingMs } = checkRateLimit('login');
 *   if (!allowed) { show "wait X seconds" message; return; }
 *   // attempt action...
 *   if (failed) recordAttempt('login');
 *   if (succeeded) resetAttempts('login');
 */

interface RateLimitState {
  attempts: number;
  lockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000; // 30 seconds

const states = new Map<string, RateLimitState>();

/**
 * Check whether an action is currently allowed.
 * Returns `allowed: false` with the remaining lockout time if blocked.
 */
export function checkRateLimit(key: string): { allowed: boolean; remainingMs: number } {
  const now = Date.now();
  const state = states.get(key);

  if (!state) {
    return { allowed: true, remainingMs: 0 };
  }

  if (state.lockedUntil && now < state.lockedUntil) {
    return { allowed: false, remainingMs: state.lockedUntil - now };
  }

  // Reset if lockout has expired
  if (state.lockedUntil && now >= state.lockedUntil) {
    states.set(key, { attempts: 0, lockedUntil: null });
  }

  return { allowed: true, remainingMs: 0 };
}

/** Record a failed attempt. Triggers lockout after MAX_ATTEMPTS consecutive failures. */
export function recordAttempt(key: string): void {
  const state = states.get(key) || { attempts: 0, lockedUntil: null };
  state.attempts += 1;

  if (state.attempts >= MAX_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }

  states.set(key, state);
}

/** Reset the counter after a successful action. */
export function resetAttempts(key: string): void {
  states.delete(key);
}
