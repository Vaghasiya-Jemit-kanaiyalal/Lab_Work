import Task from '../models/Task.js';
import cache from '../cache.js';
import taskEventEmitter from '../events/taskEventEmitter.js';

const getCacheKey = (req) => (req.user?._id ? `tasks_${req.user._id}` : 'tasks_global');

const invalidateCache = (req) => {
  const key = getCacheKey(req);
  cache.del(key);
  cache.del('tasks_global');
  cache.del('tasks');
  console.log(`[CACHE INVALIDATED] Cleared cache for key: ${key}`);
};

// @desc    Get all tasks for current user (with node-cache)
// @route   GET /api/tasks or GET /tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const cacheKey = getCacheKey(req);

    if (cache.has(cacheKey)) {
      const cachedTasks = cache.get(cacheKey);
      const ttlRemaining = Math.round((cache.getTtl(cacheKey) - Date.now()) / 1000);
      console.log(`[CACHE HIT] Serving from cache (${cacheKey}). TTL: ${ttlRemaining}s`);
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', `${ttlRemaining}s`);
      return res.status(200).json(cachedTasks);
    }

    console.log(`[CACHE MISS] Fetching from MongoDB for key: ${cacheKey}`);
    const filter = req.user ? { user: req.user._id } : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    cache.set(cacheKey, tasks, 60);
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-TTL', '60s');
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new task for current user
// @route   POST /api/tasks or POST /tasks
// @access  Private
export const createTask = async (req, res, next) => {
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

    // Invalidate cache on write
    invalidateCache(req);

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

    taskEventEmitter.emit('task-created', taskEventPayload);

    // Log at API response point
    console.log(`\n🚀 [API RESPONSE POINT] POST /tasks -> 201 Created`);
    console.log(`   Task Title  : "${newTask.title}"`);
    console.log(`   Assigned To : ${req.user.name || 'User'} (${req.user.email || 'N/A'})`);
    console.log(`   Timestamp   : ${responseTimestamp} (${responseTimestampMs} ms)`);
    console.log(`   Status      : Returning 201 response immediately (before event handler finishes)`);

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing task owned by current user
// @route   PUT /api/tasks/:id or PUT /tasks/:id
// @access  Private
export const updateTask = async (req, res, next) => {
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
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Invalidate cache on write
    invalidateCache(req);

    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task owned by current user
// @route   DELETE /api/tasks/:id or DELETE /tasks/:id
// @access  Private
export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedTask = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!deletedTask) {
      return res.status(404).json({ error: 'Task not found or unauthorized' });
    }

    // Invalidate cache on write
    invalidateCache(req);

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error) {
    next(error);
  }
};
