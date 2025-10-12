// Demo mode - Redis disabled
// In production, uncomment the Redis implementation below

// AuthToken interface
export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expireDate: string;
  authorizedAppId: string;
  merchantId?: string;
}

// Mock Redis database operations for demo mode
export const RedisDB = {
  // State management for CSRF protection
  state: {
    async set(key: string, value: string, ttl: number = 60): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis state set ${key} = ${value}`);
    },

    async get(key: string): Promise<string | null> {
      // Demo mode - return null
      console.log(`Demo: Redis state get ${key}`);
      return null;
    },

    async del(key: string): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis state del ${key}`);
    }
  },

  // Token management
  token: {
    async set(authorizedAppId: string, token: AuthToken): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis token set ${authorizedAppId}`);
    },

    async get(authorizedAppId: string): Promise<AuthToken | null> {
      // Demo mode - return null
      console.log(`Demo: Redis token get ${authorizedAppId}`);
      return null;
    },

    async del(authorizedAppId: string): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis token del ${authorizedAppId}`);
    },

    async exists(authorizedAppId: string): Promise<boolean> {
      // Demo mode - return false
      console.log(`Demo: Redis token exists ${authorizedAppId}`);
      return false;
    }
  },

  // Session management
  session: {
    async set(sessionId: string, data: any, ttl: number = 60 * 60 * 24 * 7): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis session set ${sessionId}`);
    },

    async get(sessionId: string): Promise<any | null> {
      // Demo mode - return null
      console.log(`Demo: Redis session get ${sessionId}`);
      return null;
    },

    async del(sessionId: string): Promise<void> {
      // Demo mode - no-op
      console.log(`Demo: Redis session del ${sessionId}`);
    }
  }
};

// Mock Redis client for demo mode
const redisService = {
  isOpen: false,
  connect: () => Promise.resolve(),
  quit: () => Promise.resolve(),
  on: () => {},
  setEx: () => Promise.resolve(),
  get: () => Promise.resolve(null),
  del: () => Promise.resolve(0),
  exists: () => Promise.resolve(0)
};

export default redisService;