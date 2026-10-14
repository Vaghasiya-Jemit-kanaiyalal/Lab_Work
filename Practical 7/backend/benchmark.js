import cache from './cache.js';

const BASE_URL = 'http://localhost:3000';

async function runBenchmark() {
  console.log('========================================================');
  console.log('   TASK MANAGEMENT API - NODE-CACHE PERFORMANCE TEST    ');
  console.log('========================================================\n');

  // 1. Authenticate / Login to get JWT Token
  console.log('Step 1: Authenticating to obtain JWT token...');
  let token;
  const testEmail = `test_benchmark_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Benchmark Tester',
      email: testEmail,
      password: 'Password123!',
    }),
  });

  if (regRes.ok) {
    const regData = await regRes.json();
    token = regData.token;
    console.log(`Registered new benchmark user: ${testEmail}`);
  } else {
    // Try login with fallback
    const loginRes = await fetch(`${BASE_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'jemit@gmail.com', password: 'Password123!' }),
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    console.log('Logged in with fallback user');
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Seed 3 sample tasks for this user so DB has data
  console.log('\nStep 2: Seeding test tasks in database...');
  for (let i = 1; i <= 3; i++) {
    await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: `Benchmark Task ${i}`,
        desc: `Description for task number ${i} for performance testing`,
        priority: 'high',
      }),
    });
  }

  // Clear cache completely before uncached test
  cache.flushAll();

  // 2. Measure UNCACHED Readings (DB Queries)
  console.log('\n--------------------------------------------------------');
  console.log('Step 3: Measuring UNCACHED (Database Query) Response Times');
  console.log('--------------------------------------------------------');
  const uncachedReadings = [];

  for (let i = 1; i <= 5; i++) {
    // Flush server cache before each uncached reading to guarantee DB fetch
    await fetch(`${BASE_URL}/api/tasks/cache/flush`, {
      method: 'POST',
      headers: authHeaders,
    });

    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: authHeaders,
    });
    const end = performance.now();
    const data = await res.json();
    const duration = parseFloat((end - start).toFixed(2));
    const cacheHeader = res.headers.get('x-cache');

    uncachedReadings.push(duration);
    console.log(`Reading #${i} [UNCACHED | X-Cache: ${cacheHeader}]: ${duration} ms (${data.length} tasks returned)`);
  }

  // 3. Measure CACHED Readings (In-Memory Node-Cache Hits)
  console.log('\n--------------------------------------------------------');
  console.log('Step 4: Measuring CACHED (In-Memory Node-Cache) Response Times');
  console.log('--------------------------------------------------------');
  // Primer / Warm-up requests to populate cache and warm up socket
  await fetch(`${BASE_URL}/api/tasks`, { method: 'GET', headers: authHeaders });
  await fetch(`${BASE_URL}/api/tasks`, { method: 'GET', headers: authHeaders });

  const cachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: authHeaders,
    });
    const end = performance.now();
    const data = await res.json();
    const duration = parseFloat((end - start).toFixed(2));
    const cacheHeader = res.headers.get('x-cache');
    const ttlRemaining = res.headers.get('x-cache-ttl');

    cachedReadings.push(duration);
    console.log(`Reading #${i} [CACHED | X-Cache: ${cacheHeader} | TTL: ${ttlRemaining}]: ${duration} ms (${data.length} tasks returned)`);
  }

  // 4. Verify Cache Invalidation on Write Operations
  console.log('\n--------------------------------------------------------');
  console.log('Step 5: Verifying Cache Invalidation on Write Operations');
  console.log('--------------------------------------------------------');

  // A. Cache Invalidation on POST
  console.log('\n[TEST A] POST /api/tasks (Create Task):');
  const postRes = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: 'Cache Invalidation Verification Task',
      desc: 'Checking if cache invalidates upon creation',
      priority: 'urgent',
    }),
  });
  const createdTask = await postRes.json();
  console.log(`Created Task ID: ${createdTask._id || createdTask.id}`);

  // Immediate GET after POST must be CACHE MISS (X-Cache: MISS)
  const getAfterPost = await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
  const cacheHeaderAfterPost = getAfterPost.headers.get('x-cache');
  console.log(`GET /tasks right after POST => X-Cache: ${cacheHeaderAfterPost} (Expected: MISS) -> ${cacheHeaderAfterPost === 'MISS' ? 'PASSED' : 'FAILED'}`);

  // Second GET should now be CACHED HIT
  const getSecondAfterPost = await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
  console.log(`Subsequent GET /tasks => X-Cache: ${getSecondAfterPost.headers.get('x-cache')} (Expected: HIT) -> ${getSecondAfterPost.headers.get('x-cache') === 'HIT' ? 'PASSED' : 'FAILED'}`);

  // B. Cache Invalidation on PUT
  console.log('\n[TEST B] PUT /api/tasks/:id (Update Task):');
  const taskId = createdTask._id || createdTask.id;
  await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      status: 'completed',
    }),
  });
  console.log(`Updated Task ID: ${taskId} to status: completed`);

  // Immediate GET after PUT must be CACHE MISS (X-Cache: MISS)
  const getAfterPut = await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
  const cacheHeaderAfterPut = getAfterPut.headers.get('x-cache');
  console.log(`GET /tasks right after PUT => X-Cache: ${cacheHeaderAfterPut} (Expected: MISS) -> ${cacheHeaderAfterPut === 'MISS' ? 'PASSED' : 'FAILED'}`);

  // C. Cache Invalidation on DELETE
  console.log('\n[TEST C] DELETE /api/tasks/:id (Delete Task):');
  // First prime cache
  await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
  await fetch(`${BASE_URL}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`Deleted Task ID: ${taskId}`);

  // Immediate GET after DELETE must be CACHE MISS (X-Cache: MISS)
  const getAfterDelete = await fetch(`${BASE_URL}/api/tasks`, { headers: authHeaders });
  const cacheHeaderAfterDelete = getAfterDelete.headers.get('x-cache');
  console.log(`GET /tasks right after DELETE => X-Cache: ${cacheHeaderAfterDelete} (Expected: MISS) -> ${cacheHeaderAfterDelete === 'MISS' ? 'PASSED' : 'FAILED'}`);

  // 5. Calculate Statistics
  const avgUncached = (uncachedReadings.reduce((a, b) => a + b, 0) / uncachedReadings.length).toFixed(2);
  const avgCached = (cachedReadings.reduce((a, b) => a + b, 0) / cachedReadings.length).toFixed(2);
  const speedup = (avgUncached / avgCached).toFixed(1);
  const latencyReduction = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(1);

  console.log('\n========================================================');
  console.log('                   BENCHMARK SUMMARY                    ');
  console.log('========================================================');
  console.log(`Uncached Readings (ms): ${uncachedReadings.slice(0, 3).join(', ')}`);
  console.log(`Cached Readings (ms):   ${cachedReadings.slice(0, 3).join(', ')}`);
  console.log(`Average Uncached Time:  ${avgUncached} ms`);
  console.log(`Average Cached Time:    ${avgCached} ms`);
  console.log(`Speedup Factor:         ${speedup}x faster`);
  console.log(`Latency Reduction:      ${latencyReduction}%`);
  console.log('========================================================\n');
}

runBenchmark().catch(console.error);
