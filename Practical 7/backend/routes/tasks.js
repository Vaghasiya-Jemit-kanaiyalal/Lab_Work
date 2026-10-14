import express from 'express';
import cache from '../cache.js';
import Task from '../models/Task.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateTask } from '../middlewares/validationMiddleware.js';
import taskEventEmitter from '../events/taskEventEmitter.js';
import { notificationHistory } from '../listeners/notificationListener.js';

const router = express.Router();

// Apply auth middleware to protect task routes
router.use(protect);

/**
 * Cache Key Helper
 * Generates a distinct key per user so users don't see each other's cached tasks.
 */
const getCacheKey = (req) => {
  return req.user?._id ? `tasks_${req.user._id}` : 'tasks_global';
};

/**
 * Cache Invalidation Helper
 * Removes cached task list on any write operation (POST, PUT, DELETE).
 */
export const invalidateTasksCache = (req) => {
  const key = getCacheKey(req);
  cache.del(key);
  cache.del('tasks_global');
  cache.del('tasks');
  console.log(`[CACHE INVALIDATED] Cache cleared for key: "${key}" due to write operation`);
};

// ==========================================
// 1. GET /tasks - Read All Tasks (Cached)
// ==========================================
router.get('/', async (req, res, next) => {
  try {
    const cacheKey = getCacheKey(req);

    // 1. Check if response is already in-memory cached
    if (cache.has(cacheKey)) {
      const cachedTasks = cache.get(cacheKey);
      const ttlRemaining = Math.round((cache.getTtl(cacheKey) - Date.now()) / 1000);
      console.log(`[CACHE HIT] Serving ${cachedTasks.length} tasks from cache (${cacheKey}). TTL remaining: ${ttlRemaining}s`);
      
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', `${ttlRemaining}s`);
      return res.status(200).json(cachedTasks);
    }

    // 2. Cache MISS: Query MongoDB database
    console.log(`[CACHE MISS] Fetching tasks from MongoDB for key: ${cacheKey}`);
    const filter = req.user ? { user: req.user._id } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // 3. Store in node-cache with 60s TTL
    cache.set(cacheKey, tasks, 60);
    console.log(`[CACHE SET] Cached ${tasks.length} tasks under key "${cacheKey}" for 60 seconds`);

    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-TTL', '60s');
    return res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. POST /tasks - Create Task (Invalidates Cache)
// ==========================================
router.post('/', validateTask, async (req, res, next) => {
  try {
    const { title, desc, priority, date } = req.body;

    let formattedDate = date;
    if (date && date.includes('-')) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    } else if (!date) {
      formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const newTask = await Task.create({
      title: title.trim(),
      desc: desc.trim(),
      priority: priority || 'medium',
      date: formattedDate,
      status: 'in-progress',
      user: req.user._id,
    });

    // Invalidate cache immediately on write operation
    invalidateTasksCache(req);

    // Capture precise API response timestamps
    const responseTimestamp = new Date().toISOString();
    const responseTimestampMs = Date.now();

    // Emit 'task-created' event to be handled asynchronously by background notification listener
    const taskEventPayload = {
      taskId: newTask._id.toString(),
      title: newTask.title,
      assignedUser: {
        id: req.user._id.toString(),
        name: req.user.name || 'Unknown User',
        email: req.user.email || 'N/A',
      },
      priority: newTask.priority,
      status: newTask.status,
      responseTimestamp,
      responseTimestampMs,
    };

    // Emit event asynchronously into event bus
    taskEventEmitter.emit('task-created', taskEventPayload);

    // Log at the API response point to demonstrate immediate response
    console.log(`\n🚀 [API RESPONSE POINT] POST /tasks -> 201 Created`);
    console.log(`   Task Title  : "${newTask.title}"`);
    console.log(`   Assigned To : ${req.user.name || 'User'} (${req.user.email || 'N/A'})`);
    console.log(`   Timestamp   : ${responseTimestamp} (${responseTimestampMs} ms)`);
    console.log(`   Status      : Returning 201 response immediately (before event handler finishes)`);

    // The main API response must return immediately, before the event handler finishes executing
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. PUT /tasks/:id - Update Task (Invalidates Cache)
// ==========================================
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.body.date && req.body.date.includes('-')) {
      const d = new Date(req.body.date);
      if (!isNaN(d.getTime())) {
        req.body.date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Invalidate cache immediately on update
    invalidateTasksCache(req);

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. DELETE /tasks/:id - Delete Task (Invalidates Cache)
// ==========================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Invalidate cache immediately on delete
    invalidateTasksCache(req);

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
});

// Cache flush endpoint for benchmarking / testing
router.post('/cache/flush', (req, res) => {
  cache.flushAll();
  console.log('[CACHE FLUSHED] All cache entries cleared');
  res.status(200).json({ message: 'Cache flushed successfully' });
});

// Optional cache stats endpoint for debugging / inspection
router.get('/cache/stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();
  res.status(200).json({
    stats,
    keys,
    userCacheKey: getCacheKey(req),
    isCached: cache.has(getCacheKey(req)),
  });
});

// ==========================================
// 5. GET /notifications - View Logged Notifications
// ==========================================
router.get('/notifications', (req, res) => {
  res.status(200).json({
    total: notificationHistory.length,
    notifications: notificationHistory,
  });
});

// ==========================================
// 6. POST /demo/sync-vs-async - Side-by-Side Comparison Demonstration
// ==========================================
router.post('/demo/sync-vs-async', async (req, res) => {
  const taskTitle = req.body.title || 'Demo Task Comparison';
  const assignedUserName = req.user?.name || 'Demo User';
  const assignedUserEmail = req.user?.email || 'demo@example.com';

  const results = {
    synchronous: {},
    asynchronous: {},
  };

  // --- Scenario A: Synchronous Handling ---
  const syncStart = Date.now();
  const syncStartTimeIso = new Date().toISOString();

  // In synchronous handling, notification work blocks the response
  const syncDelay = 500;
  await new Promise((resolve) => setTimeout(resolve, syncDelay));
  const syncHandlerFinish = Date.now();
  const syncHandlerFinishIso = new Date().toISOString();

  const syncResponseSent = Date.now();
  const syncResponseSentIso = new Date().toISOString();

  results.synchronous = {
    mode: 'Synchronous Handling (Blocking)',
    requestReceived: syncStartTimeIso,
    handlerStarted: syncStartTimeIso,
    handlerFinished: syncHandlerFinishIso,
    responseSent: syncResponseSentIso,
    clientWaitTimeMs: syncResponseSent - syncStart,
    isClientBlocked: true,
    description: 'The API response was forced to wait until the notification handler finished processing.',
  };

  // --- Scenario B: Asynchronous EventEmitter Handling ---
  const asyncStart = Date.now();
  const asyncStartTimeIso = new Date().toISOString();

  // In asynchronous handling, event is emitted and response is sent immediately
  const asyncResponseSent = Date.now();
  const asyncResponseSentIso = new Date().toISOString();

  // Background listener runs after response
  const asyncSimulatedHandlerStart = asyncResponseSent + 2;
  const asyncSimulatedHandlerFinish = asyncSimulatedHandlerStart + syncDelay;

  // Emit actual background event for this demo task as well
  taskEventEmitter.emit('task-created', {
    taskId: 'demo-' + Date.now(),
    title: taskTitle,
    assignedUser: {
      id: req.user?._id?.toString() || 'demo-user-id',
      name: assignedUserName,
      email: assignedUserEmail,
    },
    priority: 'high',
    status: 'in-progress',
    responseTimestamp: asyncResponseSentIso,
    responseTimestampMs: asyncResponseSent,
  });

  results.asynchronous = {
    mode: 'Asynchronous EventEmitter (Non-Blocking)',
    requestReceived: asyncStartTimeIso,
    responseSent: asyncResponseSentIso,
    clientWaitTimeMs: asyncResponseSent - asyncStart,
    handlerExecutionTime: new Date(asyncSimulatedHandlerStart).toISOString(),
    handlerFinishTime: new Date(asyncSimulatedHandlerFinish).toISOString(),
    isClientBlocked: false,
    description: 'The API returned status 201 immediately! The notification listener processes in the background without holding up the client.',
  };

  results.summary = {
    latencyImprovementMs: results.synchronous.clientWaitTimeMs - results.asynchronous.clientWaitTimeMs,
    speedupPercentage: `${Math.round(((results.synchronous.clientWaitTimeMs - results.asynchronous.clientWaitTimeMs) / results.synchronous.clientWaitTimeMs) * 100)}% faster response to client`,
  };

  res.status(200).json(results);
});

export default router;
