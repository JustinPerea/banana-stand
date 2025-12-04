
/**
 * Client-side rate limiting service
 * Prevents abuse by throttling high-frequency operations
 */

interface ThrottleEntry {
  lastCall: number;
  cooldownMs: number;
}

// Store throttle state per operation + key
const throttleMap = new Map<string, ThrottleEntry>();

// Default cooldown times in milliseconds
export const RATE_LIMITS = {
  INCREMENT_USAGE: 5000,      // 5 seconds between usage increments per app
  TOGGLE_FAVORITE: 2000,      // 2 seconds between favorite toggles per app
  PUBLISH_RECIPE: 30000,      // 30 seconds between recipe publishes
  SET_USERNAME: 60000,        // 60 seconds between username changes
  UPLOAD_IMAGE: 10000,        // 10 seconds between image uploads
} as const;

/**
 * Check if an operation is allowed based on rate limits
 * @param operation - The operation type (e.g., 'INCREMENT_USAGE')
 * @param key - A unique key for the operation (e.g., appId, empty string for global)
 * @param cooldownMs - Cooldown time in milliseconds
 * @returns Object with allowed status and remaining wait time
 */
export function checkRateLimit(
  operation: keyof typeof RATE_LIMITS,
  key: string = ''
): { allowed: boolean; waitMs: number } {
  const mapKey = `${operation}:${key}`;
  const cooldownMs = RATE_LIMITS[operation];
  const now = Date.now();

  const entry = throttleMap.get(mapKey);

  if (!entry) {
    // First call - allow it
    throttleMap.set(mapKey, { lastCall: now, cooldownMs });
    return { allowed: true, waitMs: 0 };
  }

  const elapsed = now - entry.lastCall;
  const remaining = cooldownMs - elapsed;

  if (remaining <= 0) {
    // Cooldown expired - allow it
    throttleMap.set(mapKey, { lastCall: now, cooldownMs });
    return { allowed: true, waitMs: 0 };
  }

  // Still in cooldown - deny
  return { allowed: false, waitMs: remaining };
}

/**
 * Record that an operation was performed (call after successful operation)
 * Use this when you want to check first, then record only on success
 */
export function recordOperation(operation: keyof typeof RATE_LIMITS, key: string = ''): void {
  const mapKey = `${operation}:${key}`;
  throttleMap.set(mapKey, {
    lastCall: Date.now(),
    cooldownMs: RATE_LIMITS[operation]
  });
}

/**
 * Get remaining cooldown time for an operation
 */
export function getRemainingCooldown(operation: keyof typeof RATE_LIMITS, key: string = ''): number {
  const mapKey = `${operation}:${key}`;
  const entry = throttleMap.get(mapKey);

  if (!entry) return 0;

  const elapsed = Date.now() - entry.lastCall;
  const remaining = entry.cooldownMs - elapsed;

  return Math.max(0, remaining);
}

/**
 * Clear rate limit for a specific operation (useful for testing or admin override)
 */
export function clearRateLimit(operation: keyof typeof RATE_LIMITS, key: string = ''): void {
  const mapKey = `${operation}:${key}`;
  throttleMap.delete(mapKey);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  throttleMap.clear();
}

/**
 * Format remaining time for user display
 */
export function formatWaitTime(ms: number): string {
  if (ms <= 0) return '';

  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
}
