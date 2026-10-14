import fs from 'fs';
import path from 'path';
import taskEventEmitter from '../events/taskEventEmitter.js';

// In-memory log of dispatched notifications for testing and debugging
export const notificationHistory = [];

/**
 * Helper to format date with milliseconds
 */
const formatTimestamp = (date = new Date()) => {
  return `${date.toISOString()} (${date.getTime()} ms)`;
};

/**
 * Initializes the background notification listener for task events.
 * Listens for 'task-created' and processes notifications asynchronously.
 */
export const initNotificationListener = () => {
  // Remove existing listeners if re-initializing to avoid duplicate handlers
  taskEventEmitter.removeAllListeners('task-created');

  taskEventEmitter.on('task-created', (taskData) => {
    // ------------------------------------------------------------------------
    // ASYNCHRONOUS HANDLING:
    // setImmediate pushes listener execution to the 'check' phase of Node.js
    // event loop. This ensures the current call stack (including sending the
    // HTTP 201 response back to the client) completes FIRST and immediately.
    // ------------------------------------------------------------------------
    setImmediate(async () => {
      const handlerStartTime = new Date();
      const handlerStartMs = handlerStartTime.getTime();

      console.log('\n================================================================');
      console.log('🔔 [NOTIFICATION LISTENER - ASYNCHRONOUS EXECUTION]');
      console.log('================================================================');
      console.log(`⏱️  [EVENT HANDLER EXECUTION POINT]`);
      console.log(`    Timestamp      : ${formatTimestamp(handlerStartTime)}`);
      console.log(`    Task Title     : "${taskData.title}"`);
      console.log(`    Assigned User  : ${taskData.assignedUser?.name || 'Unknown'} (${taskData.assignedUser?.email || taskData.assignedUser?.id || 'N/A'})`);
      console.log(`    Task ID        : ${taskData.taskId}`);
      console.log(`    Task Priority  : ${taskData.priority || 'medium'}`);

      if (taskData.responseTimestampMs) {
        const timeDiff = handlerStartMs - taskData.responseTimestampMs;
        console.log(`⚡ [TIMING ANALYSIS]`);
        console.log(`    API Response Point Timestamp : ${taskData.responseTimestamp} (${taskData.responseTimestampMs} ms)`);
        console.log(`    Handler Execution Timestamp  : ${handlerStartTime.toISOString()} (${handlerStartMs} ms)`);
        console.log(`    Lag After API Response Sent  : +${timeDiff} ms`);
        console.log(`    STATUS: API response was returned to client BEFORE handler started!`);
      }

      // Simulate background notification delivery workload (e.g., SMTP Email / Push Notification / Webhook)
      // This simulated 600ms latency clearly demonstrates non-blocking background behavior
      await new Promise((resolve) => setTimeout(resolve, 600));

      const handlerFinishTime = new Date();
      const handlerFinishMs = handlerFinishTime.getTime();

      console.log(`✅ [NOTIFICATION DELIVERED]`);
      console.log(`    Finish Timestamp : ${formatTimestamp(handlerFinishTime)}`);
      if (taskData.responseTimestampMs) {
        console.log(`    Total Processing : Main API returned 201 Created ${(handlerFinishMs - taskData.responseTimestampMs)} ms BEFORE this notification finished!`);
      }
      console.log('================================================================\n');

      const logRecord = {
        taskId: taskData.taskId,
        title: taskData.title,
        assignedUser: taskData.assignedUser,
        apiResponseTimestamp: taskData.responseTimestamp,
        apiResponseTimestampMs: taskData.responseTimestampMs,
        handlerExecutionTimestamp: handlerStartTime.toISOString(),
        handlerExecutionTimestampMs: handlerStartMs,
        handlerFinishTimestamp: handlerFinishTime.toISOString(),
        handlerFinishTimestampMs: handlerFinishMs,
        status: 'delivered',
      };

      notificationHistory.unshift(logRecord);
      if (notificationHistory.length > 50) {
        notificationHistory.pop();
      }

      // Persist to notifications.log.txt
      try {
        const logEntry = `[${handlerFinishTime.toISOString()}] NOTIFICATION: Title="${taskData.title}" | User=${taskData.assignedUser?.name || 'Unknown'} (${taskData.assignedUser?.email || 'N/A'}) | API_Response=${taskData.responseTimestamp || 'N/A'} | Handler_Start=${handlerStartTime.toISOString()} | Handler_End=${handlerFinishTime.toISOString()}\n`;
        fs.appendFileSync(path.join(process.cwd(), 'notifications.log.txt'), logEntry);
      } catch (err) {
        console.error('Failed writing to notifications.log.txt:', err.message);
      }
    });
  });

  console.log('📡 [EVENT SYSTEM] Notification listener registered for "task-created" events');
};
