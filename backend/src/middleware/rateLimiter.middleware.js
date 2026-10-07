import rateLimitConfig from "../config/rateLimit.config.js";

/**
 * Extract normalized client IP address from Express request
 */
export const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  let ip = "";

  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    ip = forwarded.split(",")[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = forwarded[0].trim();
  } else if (req.ip) {
    ip = req.ip;
  } else if (req.socket && req.socket.remoteAddress) {
    ip = req.socket.remoteAddress;
  } else {
    ip = "127.0.0.1";
  }

  // Normalize IPv4-mapped IPv6 address (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  // Normalize IPv6 localhost
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
};

/**
 * Extract normalized account identifier (email, username, or identifier) from request
 */
export const getAccountIdentifier = (req) => {
  if (!req.body || typeof req.body !== "object") {
    if (req.user && req.user.email) {
      return req.user.email.trim().toLowerCase();
    }
    return null;
  }

  const candidate =
    req.body.email ||
    req.body.username ||
    req.body.account ||
    req.body.identifier ||
    (req.user && req.user.email) ||
    null;

  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate.trim().toLowerCase();
  }

  return null;
};

/**
 * In-Memory Store with automatic TTL cleanup and test-reset support
 */
export class MemoryStore {
  constructor(cleanupIntervalMs = 60000) {
    this.storage = new Map();
    // Use unref so the cleanup interval does not keep the Node.js process alive
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, cleanupIntervalMs);
    if (this.cleanupTimer && this.cleanupTimer.unref) {
      this.cleanupTimer.unref();
    }
  }

  get(key) {
    return this.storage.get(key);
  }

  set(key, val) {
    this.storage.set(key, val);
  }

  delete(key) {
    this.storage.delete(key);
  }

  resetAll() {
    this.storage.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.storage.entries()) {
      const windowMs = record.windowMs || 15 * 60 * 1000;
      const windowExpired = now - (record.lastAttempt || record.startTime || 0) > windowMs;
      const blockExpired = !record.blockedUntil || now > record.blockedUntil;

      if (windowExpired && blockExpired) {
        this.storage.delete(key);
      }
    }
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.storage.clear();
  }
}

// Shared default store instance
export const rateLimitStore = new MemoryStore();

/**
 * Public Endpoints Rate Limiter (Moderate, IP-based sliding window)
 */
export const createPublicRateLimiter = (customOptions = {}) => {
  const options = {
    ...rateLimitConfig.public,
    ...customOptions,
    store: customOptions.store || rateLimitStore,
  };

  const { windowMs, max, message, store } = options;

  return (req, res, next) => {
    if (!rateLimitConfig.enabled || process.env.RATE_LIMIT_ENABLED === "false") {
      return next();
    }

    const ip = getClientIp(req);
    const key = `public:ip:${ip}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 1,
        startTime: now,
        lastAttempt: now,
        windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
      record.lastAttempt = now;
      store.set(key, record);
    }

    const remaining = Math.max(0, max - record.count);
    const resetTimeSec = Math.ceil((record.startTime + windowMs) / 1000);
    const retryAfterSec = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetTimeSec);

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
};

/**
 * Authenticated User Actions Rate Limiter (Looser, User ID-based with IP fallback)
 */
export const createUserRateLimiter = (customOptions = {}) => {
  const options = {
    ...rateLimitConfig.user,
    ...customOptions,
    store: customOptions.store || rateLimitStore,
  };

  const { windowMs, max, message, store } = options;

  return (req, res, next) => {
    if (!rateLimitConfig.enabled || process.env.RATE_LIMIT_ENABLED === "false") {
      return next();
    }

    const userId = req.user?._id?.toString() || req.user?.id;
    const ip = getClientIp(req);
    const key = userId ? `user:id:${userId}` : `user:ip:${ip}`;
    const now = Date.now();

    let record = store.get(key);
    if (!record || now - record.startTime > windowMs) {
      record = {
        count: 1,
        startTime: now,
        lastAttempt: now,
        windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
      record.lastAttempt = now;
      store.set(key, record);
    }

    const remaining = Math.max(0, max - record.count);
    const resetTimeSec = Math.ceil((record.startTime + windowMs) / 1000);
    const retryAfterSec = Math.max(1, Math.ceil((record.startTime + windowMs - now) / 1000));

    res.setHeader("RateLimit-Limit", max);
    res.setHeader("RateLimit-Remaining", remaining);
    res.setHeader("RateLimit-Reset", resetTimeSec);

    if (record.count > max) {
      res.setHeader("Retry-After", retryAfterSec);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSec,
      });
    }

    next();
  };
};

/**
 * Authentication Routes Rate Limiter (Stricter, Dual Per-IP + Per-Account with Exponential Backoff)
 *
 * Instead of a hard lockout, this implements progressive exponential backoff:
 * - When attempts reach threshold (ipMax or accountMax), the client must wait a backoff delay.
 * - Backoff delay = min(baseDelayMs * (backoffFactor ^ excessAttempts), maxDelayMs).
 * - If a request arrives during the backoff window, it is rejected with HTTP 429 and Retry-After header.
 * - Once the backoff window elapses, the client is granted a trial attempt.
 * - If the trial attempt succeeds (2xx), the account tracker resets (if resetOnSuccess is true).
 * - If the trial attempt fails (4xx), the backoff delay scales exponentially for the next attempt.
 */
export const createAuthRateLimiter = (customOptions = {}) => {
  const options = {
    ...rateLimitConfig.auth,
    ...customOptions,
    store: customOptions.store || rateLimitStore,
  };

  const {
    windowMs,
    ipMax,
    accountMax,
    baseDelayMs,
    backoffFactor,
    maxDelayMs,
    resetOnSuccess,
    store,
  } = options;

  return (req, res, next) => {
    if (!rateLimitConfig.enabled || process.env.RATE_LIMIT_ENABLED === "false") {
      return next();
    }

    const now = Date.now();
    const ip = getClientIp(req);
    const account = getAccountIdentifier(req);

    const ipKey = `auth:ip:${ip}`;
    const accountKey = account ? `auth:account:${account}` : null;

    // 1. Fetch or initialize IP record
    let ipRecord = store.get(ipKey);
    if (
      !ipRecord ||
      (now - (ipRecord.lastAttempt || 0) > windowMs && (!ipRecord.blockedUntil || now >= ipRecord.blockedUntil))
    ) {
      ipRecord = {
        attempts: 0,
        lastAttempt: now,
        blockedUntil: 0,
        windowMs,
      };
      store.set(ipKey, ipRecord);
    }

    // 2. Fetch or initialize Account record (if identifiable)
    let accountRecord = null;
    if (accountKey) {
      accountRecord = store.get(accountKey);
      if (
        !accountRecord ||
        (now - (accountRecord.lastAttempt || 0) > windowMs &&
          (!accountRecord.blockedUntil || now >= accountRecord.blockedUntil))
      ) {
        accountRecord = {
          attempts: 0,
          lastAttempt: now,
          blockedUntil: 0,
          windowMs,
        };
        store.set(accountKey, accountRecord);
      }
    }

    // 3. Check for active exponential backoff lock
    const isIpBlocked = ipRecord.blockedUntil && ipRecord.blockedUntil > now;
    const isAccountBlocked = accountRecord && accountRecord.blockedUntil && accountRecord.blockedUntil > now;

    if (isIpBlocked || isAccountBlocked) {
      const ipRetryAfter = isIpBlocked ? Math.ceil((ipRecord.blockedUntil - now) / 1000) : 0;
      const accountRetryAfter = isAccountBlocked ? Math.ceil((accountRecord.blockedUntil - now) / 1000) : 0;
      const retryAfterSec = Math.max(ipRetryAfter, accountRetryAfter, 1);

      const message = isAccountBlocked
        ? `Too many attempts for account '${account}'. Please wait ${retryAfterSec}s before trying again.`
        : `Too many authentication requests from this IP. Please wait ${retryAfterSec}s before trying again.`;

      res.setHeader("Retry-After", retryAfterSec);
      res.setHeader("RateLimit-Limit", Math.min(ipMax, accountMax));
      res.setHeader("RateLimit-Remaining", 0);
      res.setHeader("RateLimit-Reset", Math.ceil((now + retryAfterSec * 1000) / 1000));

      return res.status(429).json({
        success: false,
        message,
        retryAfter: retryAfterSec,
      });
    }

    // 4. Client is eligible to make an attempt
    const isIpTrial = ipRecord.attempts >= ipMax;
    const isAccountTrial = accountRecord && accountRecord.attempts >= accountMax;
    const isTrialAttempt = isIpTrial || isAccountTrial;

    if (!isTrialAttempt) {
      ipRecord.attempts += 1;
      ipRecord.lastAttempt = now;
      if (accountRecord) {
        accountRecord.attempts += 1;
        accountRecord.lastAttempt = now;
      }
    } else {
      // In trial mode: update timestamp
      ipRecord.lastAttempt = now;
      if (accountRecord) {
        accountRecord.lastAttempt = now;
      }
    }

    store.set(ipKey, ipRecord);
    if (accountKey && accountRecord) {
      store.set(accountKey, accountRecord);
    }

    // 5. Calculate remaining quota
    const ipRemaining = Math.max(0, ipMax - ipRecord.attempts);
    const accountRemaining = accountRecord ? Math.max(0, accountMax - accountRecord.attempts) : ipRemaining;
    const minRemaining = Math.min(ipRemaining, accountRemaining);

    res.setHeader("RateLimit-Limit", Math.min(ipMax, accountMax));
    res.setHeader("RateLimit-Remaining", minRemaining);
    res.setHeader("RateLimit-Reset", Math.ceil((now + windowMs) / 1000));

    // 6. Hook into response finish to handle outcome
    res.on("finish", () => {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 300;

      if (isSuccess) {
        if (resetOnSuccess) {
          if (accountKey) {
            store.delete(accountKey);
          }
        }
      } else if (res.statusCode !== 429) {
        // Failed attempt (e.g. 400 Bad Request, 401 Unauthorized, etc.)
        const currentNow = Date.now();

        // Increment attempt count if it was a trial attempt
        if (isTrialAttempt) {
          if (isIpTrial) {
            ipRecord.attempts += 1;
          }
          if (isAccountTrial && accountRecord) {
            accountRecord.attempts += 1;
          }
        }

        // Apply exponential backoff if threshold exceeded
        if (ipRecord.attempts >= ipMax) {
          const ipExcess = ipRecord.attempts - ipMax;
          const delayMs = Math.min(baseDelayMs * Math.pow(backoffFactor, ipExcess), maxDelayMs);
          ipRecord.blockedUntil = currentNow + delayMs;
          store.set(ipKey, ipRecord);
        }

        if (accountRecord && accountRecord.attempts >= accountMax) {
          const accountExcess = accountRecord.attempts - accountMax;
          const delayMs = Math.min(baseDelayMs * Math.pow(backoffFactor, accountExcess), maxDelayMs);
          accountRecord.blockedUntil = currentNow + delayMs;
          store.set(accountKey, accountRecord);
        }
      }
    });

    next();
  };
};

// Ready-to-use middleware singletons configured with system defaults
export const authLimiter = createAuthRateLimiter();
export const publicLimiter = createPublicRateLimiter();
export const userLimiter = createUserRateLimiter();

export default {
  authLimiter,
  publicLimiter,
  userLimiter,
  createAuthRateLimiter,
  createPublicRateLimiter,
  createUserRateLimiter,
  rateLimitStore,
  getClientIp,
  getAccountIdentifier,
};
