import NodeCache from 'node-cache';

/**
 * Shared in-memory node-cache instance
 * - stdTTL: 60 seconds (Time-To-Live for cached data)
 * - checkperiod: 120 seconds (Automatic expired key eviction)
 * - useClones: false (Improves performance by not cloning objects on read)
 */
const cache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false,
});

export default cache;
