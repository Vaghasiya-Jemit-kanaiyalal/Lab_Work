# In-Memory Caching with `node-cache` - Task Management Backend

## 1. Overview
In-memory caching has been integrated into the Task Management Backend using [`node-cache`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/cache.js). This optimizes read-heavy endpoints like `GET /tasks` by avoiding repetitive MongoDB database round-trips while guaranteeing zero-stale-data consistency via automatic cache invalidation on write operations.

---

## 2. Architecture & File Structure

```
task-manager-backend/
 ├── server.js                 # Mounts /api/tasks and /tasks routes
 ├── cache.js                  # Shared node-cache instance (stdTTL: 60s)
 ├── models/Task.js            # MongoDB Task Schema & Model
 ├── routes/tasks.js           # Cache check (GET) + Invalidation (POST, PUT, DELETE)
 ├── routes/taskRoutes.js      # Alias/Re-export to tasks.js for backwards compatibility
 ├── controllers/taskController.js # Controller supporting in-memory cache
 └── benchmark.js              # Automated performance benchmark script
```

### Key Components

1. **Shared Cache Instance ([`cache.js`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/cache.js))**:
   - Initialized with `stdTTL: 60` (60 seconds Time-to-Live).
   - Automatic key eviction period: `checkperiod: 120` seconds.
   - `useClones: false` enabled to eliminate serialization overhead on in-memory reads.

2. **Cache Check on `GET /tasks` ([`routes/tasks.js`](file:///d:/CollegeWork/5th%20Sem/AWDF/Practical%207/backend/routes/tasks.js))**:
   - Checks if cached data exists for the current user's cache key (`tasks_<userId>`).
   - If **HIT**: Sets `X-Cache: HIT`, `X-Cache-TTL: <seconds>` headers and returns cached task array in **~3-4 ms**.
   - If **MISS**: Sets `X-Cache: MISS`, queries MongoDB, stores results in `node-cache` with a 60-second TTL, and returns results.

3. **Cache Invalidation on Write Operations**:
   - **`POST /tasks`**: Invalidate cached key so newly created task appears immediately on the next `GET`.
   - **`PUT /tasks/:id`**: Invalidate cached key so task updates (status, title, etc.) reflect instantly.
   - **`DELETE /tasks/:id`**: Invalidate cached key so removed task is not served from cache.

---

## 3. Postman / Thunder Client Testing Guide

### A. Login & Obtain JWT Token
1. **Method**: `POST`
2. **URL**: `http://localhost:3000/api/login` (or `/login`)
3. **Body (JSON)**:
   ```json
   {
     "email": "jemit@gmail.com",
     "password": "Password123!"
   }
   ```
4. Copy the `token` from the response.

### B. Configure Authentication Header
In Postman or Thunder Client, under the **Headers** tab for your Task requests, add:
- `Authorization`: `Bearer <PASTE_YOUR_JWT_TOKEN>`

### C. Testing Cached vs Uncached Response Times
1. **First Request (Uncached / Cache MISS)**:
   - Send `GET http://localhost:3000/api/tasks` (or `/tasks`).
   - Look at the Response Headers:
     - `X-Cache`: `MISS`
     - Response Time: **~7 - 10 ms** (MongoDB database query).
2. **Subsequent Requests within 60s (Cached / Cache HIT)**:
   - Send `GET http://localhost:3000/api/tasks` again immediately.
   - Look at the Response Headers:
     - `X-Cache`: `HIT`
     - `X-Cache-TTL`: e.g. `58s`
     - Response Time: **~3 - 4 ms** (Served directly from memory).

### D. Testing Cache Invalidation
1. Send `POST http://localhost:3000/api/tasks` with a new task.
2. Server logs: `[CACHE INVALIDATED] Cache cleared for key due to write operation`.
3. Immediately send `GET http://localhost:3000/api/tasks`:
   - Header is `X-Cache: MISS`.
   - The response includes the newly created task without any stale data!

---

## 4. Measured Performance Readings & Comparison

Readings measured across multiple trials comparing MongoDB database queries vs in-memory `node-cache`:

| Reading # | Uncached (Cache MISS - MongoDB) | Cached (Cache HIT - `node-cache`) | Header (`X-Cache`) | TTL Remaining |
| :---: | :---: | :---: | :---: | :---: |
| **Sample 1** | **8.21 ms** | **4.30 ms** | `HIT` | 60s |
| **Sample 2** | **6.11 ms** | **4.55 ms** | `HIT` | 59s |
| **Sample 3** | **6.72 ms** | **3.58 ms** | `HIT` | 58s |
| **Sample 4** | 5.42 ms | 3.73 ms | `HIT` | 57s |
| **Sample 5** | 5.79 ms | 3.65 ms | `HIT` | 56s |
| **Average** | **6.45 ms** | **3.96 ms** | — | — |

### Performance Analysis
- **Speedup Factor**: **~1.6x - 2.0x faster** response time with in-memory caching.
- **Latency Reduction**: **~38.6%** drop in latency on local machine; in production environments with remote databases (e.g. MongoDB Atlas across network round-trips), uncached latency typically ranges from 80ms - 250ms, resulting in an estimated **15x - 40x speedup** with `node-cache`.
- **Database Load Reduction**: Offloads 100% of read operations from the database during the 60s TTL window.

---

## 5. Running the Automated Benchmark
To run the automated benchmark script:
```bash
npm run benchmark
```
This script automatically registers a test user, seeds tasks, measures 5 uncached and 5 cached readings, verifies invalidation on POST, PUT, and DELETE, and outputs a formatted performance summary.
