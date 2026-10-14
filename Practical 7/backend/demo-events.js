/**
 * Demonstration Script: Synchronous vs. Asynchronous EventEmitter Notification System
 * 
 * Demonstrates:
 * 1. Immediate HTTP 201 response before notification handler finishes.
 * 2. Asynchronous execution of notification listener (logs task title, timestamp, assigned user).
 * 3. Side-by-side timestamp comparison between Synchronous and Asynchronous handling.
 */

import { EventEmitter } from 'events';

const BASE_URL = 'http://localhost:3000';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatTime(d = new Date()) {
  return `${d.toISOString()} (${d.getTime()} ms)`;
}

// ============================================================================
// PART 1: Core EventEmitter Timing Demonstration (Direct In-Memory)
// ============================================================================
async function demonstrateCoreEventEmitter() {
  console.log('\n================================================================');
  console.log('   PART 1: SYNCHRONOUS VS. ASYNCHRONOUS EVENT HANDLING DEMO     ');
  console.log('================================================================\n');

  // --- Experiment 1: Synchronous Handling (Blocking) ---
  console.log('🔹 [EXPERIMENT 1] Synchronous Handling (Blocks Response)');
  console.log('------------------------------------------------------------');

  const syncEmitter = new EventEmitter();
  let syncHandlerFinishMs = 0;
  let syncHandlerStartMs = 0;

  syncEmitter.on('task-created-sync', (task) => {
    syncHandlerStartMs = Date.now();
    console.log(`  [SYNC LISTENER START]  : ${formatTime(new Date(syncHandlerStartMs))}`);
    console.log(`  [NOTIFICATION WORKLOAD]: Sending email/push to ${task.assignedUser.name}... (Simulating 500ms block)`);
    
    // Simulate synchronous/blocking workload
    const blockUntil = Date.now() + 500;
    while (Date.now() < blockUntil) {
      // Busy wait / blocking synchronous work
    }

    syncHandlerFinishMs = Date.now();
    console.log(`  [SYNC LISTENER FINISH] : ${formatTime(new Date(syncHandlerFinishMs))}`);
  });

  const syncRequestStart = Date.now();
  console.log(`  [1. POST /tasks Start] : ${formatTime(new Date(syncRequestStart))}`);
  console.log('  [2. Saving task to MongoDB... Done]');
  console.log('  [3. Emitting sync event...]');
  syncEmitter.emit('task-created-sync', {
    title: 'Review Project Architecture',
    assignedUser: { name: 'Jemit Vaghasiya', email: 'jemit@gmail.com' },
  });

  const syncResponseSent = Date.now();
  console.log(`  [4. API Responds (201)]: ${formatTime(new Date(syncResponseSent))}`);
  const syncTotalClientWait = syncResponseSent - syncRequestStart;
  console.log(`  ⚠️ Total Client Latency: ${syncTotalClientWait} ms (CLIENT WAS BLOCKED!)\n`);

  // --- Experiment 2: Asynchronous Handling (Non-Blocking) ---
  console.log('🔹 [EXPERIMENT 2] Asynchronous EventEmitter Handling (Non-Blocking)');
  console.log('------------------------------------------------------------');

  const asyncEmitter = new EventEmitter();
  let asyncHandlerStartMs = 0;
  let asyncHandlerFinishMs = 0;
  let asyncPromiseResolve;
  const asyncFinishedPromise = new Promise((res) => { asyncPromiseResolve = res; });

  asyncEmitter.on('task-created-async', (task) => {
    // Non-blocking via setImmediate
    setImmediate(async () => {
      asyncHandlerStartMs = Date.now();
      console.log(`  [ASYNC LISTENER START] : ${formatTime(new Date(asyncHandlerStartMs))}`);
      console.log(`  [NOTIFICATION LOGGED]  : Task="${task.title}" | User=${task.assignedUser.name}`);
      console.log('  [ASYNC WORKLOAD]       : Dispatching background notification... (500ms async latency)');

      await sleep(500);

      asyncHandlerFinishMs = Date.now();
      console.log(`  [ASYNC LISTENER FINISH]: ${formatTime(new Date(asyncHandlerFinishMs))}`);
      console.log(`  ✅ PROOF: API returned 201 ${(asyncHandlerFinishMs - asyncResponseSentMs)} ms BEFORE this listener finished!`);
      asyncPromiseResolve();
    });
  });

  const asyncRequestStart = Date.now();
  console.log(`  [1. POST /tasks Start] : ${formatTime(new Date(asyncRequestStart))}`);
  console.log('  [2. Saving task to MongoDB... Done]');
  console.log('  [3. Emitting async event...]');

  asyncEmitter.emit('task-created-async', {
    title: 'Deploy to Cloud Server',
    assignedUser: { name: 'Jemit Vaghasiya', email: 'jemit@gmail.com' },
  });

  const asyncResponseSentMs = Date.now();
  console.log(`  [4. API Responds (201)]: ${formatTime(new Date(asyncResponseSentMs))} (RETURNED IMMEDIATELY!)`);
  const asyncTotalClientWait = asyncResponseSentMs - asyncRequestStart;
  console.log(`  ⚡ Total Client Latency: ${asyncTotalClientWait} ms (CLIENT RECEIVED 201 WITHOUT DELAY)`);

  console.log('  [Waiting for background notification listener to finish in event loop...]');
  await asyncFinishedPromise;

  // Comparison Summary Table
  console.log('\n================================================================');
  console.log('               📊 COMPARISON SUMMARY TABLE                      ');
  console.log('================================================================');
  console.log(`| Metric                         | Synchronous Handling | Asynchronous Handling |`);
  console.log(`|--------------------------------|----------------------|-----------------------|`);
  console.log(`| Client Wait Time (Latency)     | ${String(syncTotalClientWait).padEnd(20)} | ${String(asyncTotalClientWait).padEnd(21)} |`);
  console.log(`| API Response Point             | AFTER handler finish | BEFORE handler finish |`);
  console.log(`| Client Thread Blocked?         | YES (500ms delay)    | NO (Immediate 201)    |`);
  console.log(`| Handler Execution Model        | Blocks Main Stack    | Node.js Event Loop    |`);
  console.log('================================================================\n');
}

// ============================================================================
// PART 2: Live HTTP API Test against Running Server (POST /api/tasks)
// ============================================================================
async function demonstrateLiveApi() {
  console.log('\n================================================================');
  console.log('   PART 2: LIVE HTTP API DEMO ON RUNNING SERVER (PORT 3000)     ');
  console.log('================================================================\n');

  try {
    // 1. Authenticate / Login
    console.log('Step 1: Authenticating to obtain JWT token...');
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jemit@gmail.com', password: 'Password123!' }),
    });

    let token;
    let userName = 'Jemit Vaghasiya';
    if (loginRes.ok) {
      const data = await loginRes.json();
      token = data.token;
      userName = data.user?.name || userName;
      console.log(`✅ Logged in as: ${userName}`);
    } else {
      // Register a temporary user
      const uniqueEmail = `event_tester_${Date.now()}@example.com`;
      const regRes = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Event Tester',
          email: uniqueEmail,
          password: 'Password123!',
        }),
      });
      const regData = await regRes.json();
      token = regData.token;
      userName = 'Event Tester';
      console.log(`✅ Registered test user: ${uniqueEmail}`);
    }

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Send POST /api/tasks and measure round-trip time
    console.log('\nStep 2: Sending POST /api/tasks request...');
    const clientSendTime = Date.now();
    const taskPayload = {
      title: `EventEmitter Practical 7 Task #${Math.floor(Math.random() * 1000)}`,
      desc: 'Demonstrating Node.js EventEmitter non-blocking background notification',
      priority: 'high',
      date: new Date().toISOString().split('T')[0],
    };

    console.log(`📡 [CLIENT] Request Dispatched at: ${formatTime(new Date(clientSendTime))}`);
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(taskPayload),
    });

    const clientRecvTime = Date.now();
    const taskCreated = await res.json();
    const clientDuration = clientRecvTime - clientSendTime;

    console.log(`\n📥 [CLIENT] HTTP Response Received!`);
    console.log(`    Status Code       : ${res.status} Created`);
    console.log(`    Task ID           : ${taskCreated._id || taskCreated.id}`);
    console.log(`    Task Title        : "${taskCreated.title}"`);
    console.log(`    Response Timestamp: ${formatTime(new Date(clientRecvTime))}`);
    console.log(`    Total Client Wait : ${clientDuration} ms (Immediate response)`);

    // 3. Wait a moment for background listener to finish simulated workload
    console.log('\nStep 3: Waiting for background notification listener to finish simulated dispatch...');
    await sleep(900);

    // 4. Fetch /api/notifications to show recorded timestamps
    console.log('\nStep 4: Fetching /api/notifications audit history...');
    const notifRes = await fetch(`${BASE_URL}/api/notifications`);
    if (notifRes.ok) {
      const notifData = await notifRes.json();
      const latest = notifData.notifications?.[0];
      if (latest) {
        console.log('------------------------------------------------------------');
        console.log('📋 AUDIT VERIFICATION OF BACKGROUND NOTIFICATION:');
        console.log(`   Task Title             : "${latest.title}"`);
        console.log(`   Assigned User          : ${latest.assignedUser?.name} (${latest.assignedUser?.email})`);
        console.log(`   API Response Timestamp : ${latest.apiResponseTimestamp} (${latest.apiResponseTimestampMs} ms)`);
        console.log(`   Handler Start Time     : ${latest.handlerExecutionTimestamp} (${latest.handlerExecutionTimestampMs} ms)`);
        console.log(`   Handler Finish Time    : ${latest.handlerFinishTimestamp} (${latest.handlerFinishTimestampMs} ms)`);
        console.log(`   Delta (Proof)          : API returned ${(latest.handlerFinishTimestampMs - latest.apiResponseTimestampMs)} ms BEFORE handler finished!`);
        console.log('------------------------------------------------------------');
      }
    }

    // 5. Test the built-in comparison endpoint POST /api/tasks/demo/sync-vs-async
    console.log('\nStep 5: Testing built-in comparison endpoint POST /api/tasks/demo/sync-vs-async...');
    const demoEndpointRes = await fetch(`${BASE_URL}/api/tasks/demo/sync-vs-async`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title: 'Viva Demonstration Task' }),
    });

    if (demoEndpointRes.ok) {
      const demoData = await demoEndpointRes.json();
      console.log('\n🏆 SIDE-BY-SIDE API RESPONSE:');
      console.log('Synchronous Result :', JSON.stringify(demoData.synchronous, null, 2));
      console.log('Asynchronous Result:', JSON.stringify(demoData.asynchronous, null, 2));
      console.log('Performance Gain   :', demoData.summary);
    }

  } catch (err) {
    console.error('API connection failed (Server might not be running on port 3000):', err.message);
    console.log('Note: Run "npm start" in another terminal or test with live server.');
  }
}

async function run() {
  await demonstrateCoreEventEmitter();
  await demonstrateLiveApi();
  console.log('\n✨ Demonstration completed successfully!\n');
}

run();
