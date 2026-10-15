# Task Management Application - Automated CI/CD Pipeline

![CI/CD Pipeline](https://github.com/Vaghasiya-Jemit-kanaiyalal/Lab_Work/actions/workflows/ci.yml/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue.svg)
![Backend](https://img.shields.io/badge/Backend-Express.js-black.svg)
![Tests](https://img.shields.io/badge/Tests-Passing%20(9%2F9)-brightgreen.svg)

An automated Continuous Integration and Continuous Deployment (CI/CD) pipeline built with **GitHub Actions** for the full-stack Task Management application.

---

## 🚀 Features

- **Automated Workflow on Push**: GitHub Actions triggers automatically on every push to the `main` branch.
- **Dependency Installation**: Defined `npm install` steps for both Backend and Frontend.
- **Automated Unit Testing**: Runs automated unit tests via `npm test` (`node:test`) covering:
  - Task input validation middleware
  - Authentication validation middleware
  - In-memory caching system (`node-cache`)
- **Automated Frontend Build**: Compiles Vite + React production bundle (`npm run build`).
- **Continuous Deployment (CD)**: Automatically deploys application only if all tests and builds pass.
- **Demonstrated Failure & Recovery**: Complete live demonstration of pipeline breaking on faulty code and recovering when corrected.

---

## 📊 CI/CD Workflow Summary

| Workflow Step | Command | Status |
| :--- | :--- | :--- |
| **1. Checkout Repository** | `actions/checkout@v4` | ✅ Automated |
| **2. Node.js Setup** | `actions/setup-node@v4 (v20)` | ✅ Automated |
| **3. Install Backend Dependencies** | `npm install` | ✅ Passed |
| **4. Run Automated Backend Tests** | `npm test` | ✅ Passed (9/9) |
| **5. Install Frontend Dependencies** | `npm install` | ✅ Passed |
| **6. Build Production Frontend** | `npm run build` | ✅ Passed |
| **7. Continuous Deployment (CD)** | Automated deployment stage | 🚀 Executed |

---

## 🧪 Live Demonstrations

Detailed documentation and test logs: **[CI_CD_DOCUMENTATION.md](./CI_CD_DOCUMENTATION.md)**

1. **Deliberately Broken Test (Failed Pipeline)**:
   - **Commit**: `a959016`
   - **GitHub Actions Run**: [View Failed Run #38688670220](https://github.com/Vaghasiya-Jemit-kanaiyalal/Lab_Work/actions/runs/38688670220)
   - **Result**: Pipeline halted at test step with clear failure report; deployment blocked.

2. **Corrected Test (Passing Pipeline)**:
   - **Commit**: `186207f`
   - **GitHub Actions Run**: [View Passing Run #38688815914](https://github.com/Vaghasiya-Jemit-kanaiyalal/Lab_Work/actions/runs/38688815914)
   - **Result**: All 9 unit tests passed; frontend built; automated deployment completed successfully.

---

## 🛠️ Local Development & Testing

### Running Tests Locally
```bash
cd backend
npm install
npm test
```

### Building Frontend Locally
```bash
cd frontend
npm install
npm run build
```