# Background Notification System Using Node.js EventEmitter

## 1. Overview
In this practical, a background notification subsystem has been integrated into the **Task Management Application** using Node.js's built-in [`events`](https://nodejs.org/api/events.html) module (`EventEmitter`).

When a new task is created via `POST /api/tasks` (or `POST /tasks`), the application:
1. Persists the task document into **MongoDB**.
2. Invalidates the in-memory cache (`node-cache`).
3. Emits a `'task-created'` event into the central event bus.
4. **Responds immediately with HTTP 201 Created** to the client.
5. An asynchronous **Notification Listener** handles the event in the background (logging task title, timestamp, assigned user, and simulated delivery) **without holding up or blocking the HTTP response**.

---

## 2. Event-Driven Architecture

### Workflow Diagram
```
Client (Postman / Browser)
         │
         │  1. POST /tasks (JSON payload)
         ▼
 Express Route Handler
         │
         │  2. Save task to MongoDB (Task.create)
         ▼
  MongoDB Database
         │
         │  3. Task Persisted
         ▼
 Express Route Handler ── 4. emit('task-created', taskData)
         │                                   │
         │ 5. Returns 201 Created            │ (Handled Asynchronously)
         │    IMMEDIATELY to Client          ▼
         ▼                          Notification Listener
 Client receives response                    │
 in ~1-5 ms                                  │ Logs:
                                             │ • Task Title
                                             │ • Timestamp
                                             │ • Assigned User
                                             ▼
                                    notifications.log.txt
```

---

## 3. Key Components & Implementation

### A. Central Event Emitter Singleton ([`events/taskEventEmitter.js`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/events/taskEventEmitter.js))
Provides a decoupled event bus across the application:
```javascript
import { EventEmitter } from 'events';

class TaskEventEmitter extends EventEmitter {}

const taskEventEmitter = new TaskEventEmitter();
taskEventEmitter.setMaxListeners(30);

export default taskEventEmitter;
```

### B. Background Notification Listener ([`listeners/notificationListener.js`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/listeners/notificationListener.js))
Listens for `'task-created'` events and processes them asynchronously using `setImmediate` and background dispatch simulation:
```javascript
taskEventEmitter.on('task-created', (taskData) => {
  // Pushes execution to check phase of Event Loop
  setImmediate(async () => {
    const handlerStartTime = new Date();
    
    console.log(`⏱️  [EVENT HANDLER EXECUTION POINT]`);
    console.log(`    Timestamp      : ${handlerStartTime.toISOString()}`);
    console.log(`    Task Title     : "${taskData.title}"`);
    console.log(`    Assigned User  : ${taskData.assignedUser.name} (${taskData.assignedUser.email})`);
    
    // Simulate background notification delivery workload (e.g., SMTP / Push notification)
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    console.log(`✅ [NOTIFICATION DELIVERED] Finish: ${new Date().toISOString()}`);
  });
});
```

### C. Task Creation Route ([`routes/tasks.js`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/routes/tasks.js))
Emits the event and immediately sends the HTTP response:
```javascript
// 1. Save to MongoDB
const newTask = await Task.create({ ... });

// 2. Capture response timestamp
const responseTimestamp = new Date().toISOString();
const responseTimestampMs = Date.now();

// 3. Emit 'task-created' event
taskEventEmitter.emit('task-created', {
  taskId: newTask._id.toString(),
  title: newTask.title,
  assignedUser: {
    id: req.user._id.toString(),
    name: req.user.name,
    email: req.user.email,
  },
  priority: newTask.priority,
  status: newTask.status,
  responseTimestamp,
  responseTimestampMs,
});

// 4. Log API response point
console.log(`[API RESPONSE POINT] POST /tasks -> 201 Created at: ${responseTimestamp}`);

// 5. Respond immediately before background listener finishes
res.status(201).json(newTask);
```

---

## 4. Synchronous vs. Asynchronous Handling Comparison

| Metric | Synchronous Handling (Blocking) | Asynchronous Handling (EventEmitter) |
| :--- | :--- | :--- |
| **Execution Flow** | Handler runs sequentially before `res.status(201)` | Handler is deferred; API responds immediately |
| **Client Latency** | **~500 - 650 ms** (client waits for notification to finish) | **~1 - 5 ms** (immediate return) |
| **Client Experience** | Degraded; UI freezes or shows loading spinner | Instant feedback; tasks save effortlessly |
| **Node.js Thread** | Event loop / main stack blocked during notification work | Main call stack freed immediately |
| **Response Timing** | Response sent **AFTER** notification finishes | Response sent **BEFORE** notification finishes |

### Actual Measured Timestamps Proof:
From test run `npm run demo:events`:
```
[API RESPONSE POINT]     : 2026-10-08T07:48:32.499Z (1791445712499 ms) -> Response returned immediately
[HANDLER EXECUTION POINT]: 2026-10-08T07:48:32.502Z (1791445712502 ms) -> Handler started in background
[HANDLER FINISH POINT]   : 2026-10-08T07:48:33.105Z (1791445713105 ms) -> Finished 606 ms AFTER API responded!
```

---

## 5. Testing & Verification Guide

### A. Run the Automated Comparison Demo
To view live synchronous vs asynchronous performance and timestamps:
```bash
npm run demo:events
```

### B. Testing via Postman / Thunder Client / cURL

#### 1. Login to get JWT Token
- **POST** `http://localhost:3000/api/login`
- **Body**:
  ```json
  {
    "email": "jemit@gmail.com",
    "password": "Password123!"
  }
  ```
- Copy the `token` from the response.

#### 2. Create a Task (Triggers Background Notification)
- **POST** `http://localhost:3000/api/tasks`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_TOKEN>`
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "title": "Complete AWDF Practical 7 Submission",
    "desc": "Verify EventEmitter background notification timestamps",
    "priority": "high",
    "date": "2026-10-08"
  }
  ```
- **Result**: You will immediately receive a `201 Created` response. Check your server console to observe the notification listener completing in the background ~600ms later!

#### 3. Inspect Notification Audit History
- **GET** `http://localhost:3000/api/notifications`
- Shows all captured notifications with complete timestamp records (`apiResponseTimestamp`, `handlerExecutionTimestamp`, and `handlerFinishTimestamp`).

#### 4. Side-by-Side Sync vs Async Comparison Endpoint
- **POST** `http://localhost:3000/api/tasks/demo/sync-vs-async`
- **Headers**:
  - `Authorization`: `Bearer <YOUR_TOKEN>`
  - `Content-Type`: `application/json`
- **Body**:
  ```json
  {
    "title": "Viva Test Comparison"
  }
  ```
- Returns real-time breakdown of synchronous wait time vs asynchronous wait time.

---

## 6. Viva Questions & Key Concepts

### Q1: What is Node.js `EventEmitter`?
**Ans**: `EventEmitter` is a core module (`events`) in Node.js that implements the Observer pattern. It allows objects to emit named events that trigger registered listener functions.

### Q2: Is Node.js `EventEmitter` asynchronous by default?
**Ans**: **No!** By default, when `emitter.emit('event')` is called, Node.js calls all registered listeners **synchronously** in the order they were registered. To make event handling asynchronous, listener code must explicitly defer execution using `setImmediate()`, `process.nextTick()`, or asynchronous promises/timers so the main call stack is not blocked.

### Q3: Why is `setImmediate()` preferred here?
**Ans**: `setImmediate()` schedules execution in the "check" phase of the Node.js event loop (after I/O polling). This guarantees that the current function execution (which sends the HTTP response via Express) finishes first and flushes the TCP packet to the client before the background listener begins its work.

### Q4: What are the benefits of decoupling notifications using events?
**Ans**:
1. **Separation of Concerns**: The task creation route focuses only on task business logic.
2. **Extensibility**: Additional listeners (e.g., Audit Logging, Slack Webhooks, Analytics) can be attached to `'task-created'` without modifying the route handler.
3. **High Performance & Low Latency**: Clients experience sub-10ms response times regardless of notification service speed or availability.
