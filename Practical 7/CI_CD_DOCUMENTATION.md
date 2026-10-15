# Automated CI/CD Pipeline Documentation

## 1. Objective & Overview

This document demonstrates the automated Continuous Integration and Continuous Deployment (CI/CD) pipeline implemented for the **Task Management Application** using **GitHub Actions**.

### Key Requirements Implemented:
1. **GitHub Actions Workflow**: Runs automatically on every push to the `main` branch.
2. **Dependency Installation**: Defined `npm install` steps for both backend and frontend environments.
3. **Automated Unit Testing**: Executes automated test suite via `npm test` reporting a clear pass/fail status.
4. **Demonstration of Pipeline Failure**: Demonstrates an intentional test break causing the GitHub Actions pipeline to fail and block deployment.
5. **Demonstration of Pipeline Success**: Demonstrates the resolved test allowing the pipeline to pass completely and trigger automated deployment.

---

## 2. CI/CD Architecture & Workflow

```mermaid
flowchart TD
    A[Push to main Branch] --> B[GitHub Actions Runner: ubuntu-latest]
    B --> C[Checkout Repository]
    C --> D[Setup Node.js 20.x]
    D --> E[Install Backend Dependencies: npm install]
    E --> F{Run Backend Automated Tests: npm test}
    F -- Fail (Broken Test) --> G[❌ Build and Test Fails]
    G --> H[🚫 Deployment Skipped (Production Protected)]
    F -- Pass (Corrected Test) --> I[Install Frontend Dependencies: npm install]
    I --> J[Build Frontend: npm run build]
    J --> K[✅ Build & Test Success]
    K --> L[🚀 Trigger Continuous Deployment (CD)]
    L --> M[🎉 Production Deployed]
```

---

## 3. GitHub Actions Workflow Configuration

Workflow File: `.github/workflows/ci.yml`

```yaml
name: Task Management CI/CD Pipeline

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  test-and-build:
    name: Build and Test Pipeline
    runs-on: ubuntu-latest

    steps:
      - name: 📥 Checkout Repository Code
        uses: actions/checkout@v4

      - name: ⚙️ Set up Node.js Environment (v20)
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: 📦 Install Backend Dependencies (npm install)
        run: |
          if [ -d "Practical 7/backend" ]; then
            cd "Practical 7/backend"
          else
            cd backend
          fi
          npm install

      - name: 🧪 Run Automated Backend Unit Tests (npm test)
        run: |
          if [ -d "Practical 7/backend" ]; then
            cd "Practical 7/backend"
          else
            cd backend
          fi
          npm test

      - name: 📦 Install Frontend Dependencies (npm install)
        run: |
          if [ -d "Practical 7/frontend" ]; then
            cd "Practical 7/frontend"
          else
            cd frontend
          fi
          npm install

      - name: 🏗️ Build Frontend Production Bundle (npm run build)
        run: |
          if [ -d "Practical 7/frontend" ]; then
            cd "Practical 7/frontend"
          else
            cd frontend
          fi
          npm run build

  deploy:
    name: Continuous Deployment (CD)
    needs: test-and-build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: 📥 Checkout Repository Code
        uses: actions/checkout@v4

      - name: 🚀 Simulate Automated Deployment
        run: |
          echo "=========================================================="
          echo "🚀 STEP 5: Automated Deployment Triggered"
          echo "=========================================================="
          echo "✅ All automated tests PASSED!"
          echo "✅ Frontend production build PASSED!"
          echo "🚀 Deploying Task Management Application to Production..."
          echo "🌐 Environment: Production (Dockerized Stack)"
          echo "🎉 Deployment completed successfully!"
```

---

## 4. Automated Test Suite Specification

Location: `backend/test/task.test.js`  
Runner: Built-in Node.js Test Runner (`node:test` and `node:assert/strict`)

The automated test suite tests essential application components without requiring external mocks:
- **Task Input Validation Middleware (`validateTask`)**:
  - Rejects task when `title` is missing (`HTTP 400`).
  - Rejects task when `desc` is missing (`HTTP 400`).
  - Rejects task with invalid priority (`HTTP 400`).
  - Passes valid task payload and calls `next()`.
- **Authentication Validation Middleware (`validateRegister`, `validateLogin`)**:
  - Rejects invalid email formats (`HTTP 400`).
  - Rejects password shorter than 6 characters (`HTTP 400`).
  - Approves valid user registration payload.
- **In-Memory Cache Subsystem (`node-cache`)**:
  - Verifies setting, retrieving, and deleting cached task records.
- **CI/CD Demonstration Test**:
  - Used to test pass/fail pipeline status.

---

## 5. Live Demonstration 1: Deliberately Broken Test (Failed Pipeline)

### Commit & Execution Details:
- **Commit SHA**: `a959016`
- **Commit Message**: `ci: add GitHub Actions workflow and deliberately broken test to demonstrate failure`
- **GitHub Actions Run ID**: `38688670220`
- **Workflow Status**: `completed`
- **Workflow Conclusion**: `failure` ❌
- **Live Run URL**: [View GitHub Actions Failed Run #38688670220](https://github.com/Vaghasiya-Jemit-kanaiyalal/Lab_Work/actions/runs/38688670220)

### Deliberately Broken Code:
```javascript
describe('CI/CD Pipeline Demonstration - Intentional Failure Mode', () => {
  it('DELIBERATELY BROKEN TEST: intentional failure to demonstrate CI/CD pipeline red status', () => {
    const expectedStatus = 200;
    const actualStatus = 500;
    // Intentionally invalid assertion
    assert.strictEqual(
      actualStatus,
      expectedStatus,
      'DELIBERATE CI/CD DEMO FAILURE: Server returned 500 but test expected 200. This deliberately breaks the pipeline.'
    );
  });
});
```

### GitHub Actions Execution Result:
```
Step 1: Set up job ............................................. [SUCCESS]
Step 2: Checkout Repository Code ............................... [SUCCESS]
Step 3: Set up Node.js Environment (v20) ....................... [SUCCESS]
Step 4: Install Backend Dependencies (npm install) ............. [SUCCESS]
Step 5: Run Automated Backend Unit Tests (npm test) ............ [FAILURE ❌]
Step 6: Install Frontend Dependencies (npm install) ............ [SKIPPED]
Step 7: Build Frontend Production Bundle (npm run build) ....... [SKIPPED]
Job: Continuous Deployment (CD) ................................ [SKIPPED 🚫]
```

### GitHub Actions Console Output:
```
✖ failing tests:

test at test/task.test.js:169:5
✖ DELIBERATELY BROKEN TEST: intentional failure to demonstrate CI/CD pipeline red status (1.0893ms)
  AssertionError [ERR_ASSERTION]: DELIBERATE CI/CD DEMO FAILURE: Server returned 500 but test expected 200. This deliberately breaks the pipeline.
  
  500 !== 200

Error: Process completed with exit code 1.
```

**Key Takeaway**: The failed test stopped the pipeline immediately. Frontend building and production deployment were **prevented**, preventing defective code from impacting users.

---

## 6. Live Demonstration 2: Corrected Test (Passing Pipeline)

### Commit & Execution Details:
- **Commit SHA**: `186207f`
- **Commit Message**: `ci: fix broken test to demonstrate passing CI/CD pipeline and deployment`
- **GitHub Actions Run ID**: `38688815914`
- **Workflow Status**: `completed`
- **Workflow Conclusion**: `success` ✅
- **Live Run URL**: [View GitHub Actions Passed Run #38688815914](https://github.com/Vaghasiya-Jemit-kanaiyalal/Lab_Work/actions/runs/38688815914)

### Corrected Code:
```javascript
describe('CI/CD Pipeline Demonstration - Fixed Test Mode', () => {
  it('FIXED TEST: asserts valid status code and confirms pipeline health', () => {
    const expectedStatus = 200;
    const actualStatus = 200;
    // Corrected assertion: 200 === 200
    assert.strictEqual(
      actualStatus,
      expectedStatus,
      'FIXED CI/CD DEMO TEST: Server returned expected status 200. Pipeline test passes!'
    );
  });
});
```

### GitHub Actions Execution Result:
```
Job 1: Build and Test Pipeline ................................. [SUCCESS ✅]
  Step 1: Set up job ........................................... [SUCCESS]
  Step 2: Checkout Repository Code ............................. [SUCCESS]
  Step 3: Set up Node.js Environment (v20) ..................... [SUCCESS]
  Step 4: Install Backend Dependencies (npm install) ........... [SUCCESS]
  Step 5: Run Automated Backend Unit Tests (npm test) .......... [SUCCESS ✅]
  Step 6: Install Frontend Dependencies (npm install) .......... [SUCCESS]
  Step 7: Build Frontend Production Bundle (npm run build) ..... [SUCCESS ✅]
  Step 8: Complete job ......................................... [SUCCESS]

Job 2: Continuous Deployment (CD) .............................. [SUCCESS 🚀]
  Step 1: Checkout Repository Code ............................. [SUCCESS]
  Step 2: Simulate Automated Deployment ........................ [SUCCESS 🎉]
  Step 3: Complete job ......................................... [SUCCESS]
```

### GitHub Actions Test Runner Console Output:
```
▶ Task Management Application - Automated Test Suite
  ▶ Task Input Validation Middleware
    ✔ should reject a task when title is missing (0.9076ms)
    ✔ should reject a task when description is missing (0.4271ms)
    ✔ should reject a task when priority is invalid (0.3781ms)
    ✔ should call next() when task payload is valid (0.2998ms)
  ✔ Task Input Validation Middleware (3.2177ms)
  ▶ User Authentication Validation
    ✔ should reject registration when email format is invalid (0.5316ms)
    ✔ should reject registration when password is under 6 characters (1.581ms)
    ✔ should approve valid user registration payload (0.2834ms)
  ✔ User Authentication Validation (2.7542ms)
  ▶ In-Memory Task Cache Subsystem
    ✔ should store, retrieve, and delete cached tasks correctly (0.9674ms)
  ✔ In-Memory Task Cache Subsystem (1.105ms)
  ▶ CI/CD Pipeline Demonstration - Fixed Test Mode
    ✔ FIXED TEST: asserts valid status code and confirms pipeline health (0.1586ms)
  ✔ CI/CD Pipeline Demonstration - Fixed Test Mode (0.2533ms)
✔ Task Management Application - Automated Test Suite (8.1624ms)
ℹ tests 9
ℹ suites 5
ℹ pass 9
ℹ fail 0
```

---

## 7. How to Run Locally

### 1. Run Automated Unit Tests:
```bash
cd backend
npm install
npm test
```

### 2. Build Frontend:
```bash
cd frontend
npm install
npm run build
```

---

## 8. Summary Comparison

| Metric / Step | Demonstration 1 (Broken Test) | Demonstration 2 (Fixed Test) |
| :--- | :--- | :--- |
| **Commit** | `a959016` | `186207f` |
| **Run ID** | `38688670220` | `38688815914` |
| **Status / Conclusion** | `completed` / `failure` ❌ | `completed` / `success` ✅ |
| **`npm install`** | ✅ Passed | ✅ Passed |
| **`npm test`** | ❌ Failed (1 test failed) | ✅ Passed (9/9 tests passed) |
| **Frontend Build** | 🚫 Skipped | ✅ Built in 1.45s |
| **CD Deployment** | 🚫 Blocked (Protected) | 🚀 Deployed Successfully |
