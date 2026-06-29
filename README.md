# Realtime Fraud Detection

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Realtime Fraud Detection is a production-grade, enterprise-scale transaction monitoring system designed specifically to protect modern financial institutions and fintech platforms from sophisticated malicious actors. Built entirely as a strictly typed TypeScript monorepo, it provides a seamless, unified, and highly performant pipeline capable of securely ingesting, analyzing, and flagging millions of concurrent financial transactions for suspicious activity. The architecture is explicitly designed for horizontal scalability, ensuring zero downtime even during peak trading hours.

The system's backend infrastructure leverages the sheer speed of Redis for real-time WebSocket streaming, pub/sub messaging, and high-speed caching of transactional states. This is combined with the immense reliability and flexible document architecture of MongoDB, which acts as the persistent storage layer for user profiles, transaction histories, and complex audit logs. Complex rule engines run asynchronously to evaluate transaction velocity, geolocation anomalies, and behavioral deviations in milliseconds, instantly blocking or flagging high-risk transactions before they can settle.

On the frontend, risk management and compliance officers are equipped with a powerful, comprehensive React-based administrative dashboard. This interface offers live, real-time transaction monitoring through interactive graphs and heatmaps, alongside automated generation of regulatory Suspicious Activity Reports (SAR). It features deep-dive investigative tools, visual link analysis of account interactions, and case management workflows, allowing fraud teams to quickly identify, isolate, and mitigate potential fraud vectors with unprecedented efficiency.

---

## ✨ Features

- **🔍 Real-Time Transaction Monitoring** — WebSocket-powered live feed with sub-second latency for streaming transaction data
- **🧠 Intelligent Fraud Engine** — Rule-based detection engine with configurable thresholds, velocity checks, and anomaly scoring
- **📊 Analytics Dashboard** — Interactive charts and heatmaps for fraud pattern visualization and trend analysis
- **🚨 Alert Management** — Tiered alert system with priority queuing, case assignment, and resolution tracking
- **📋 SAR Reporting** — Suspicious Activity Report generation compliant with regulatory filing standards
- **👤 Case Investigation** — Collaborative investigation workspace with evidence linking and audit trails
- **🏪 Merchant Profiling** — Risk scoring and monitoring at the merchant level
- **📈 Model Performance** — ML model accuracy tracking, precision/recall metrics, and drift detection

### ⚙️ Fraud Detection Rule Schemes

| Rule Identifier | Trigger Parameter | Threshold | Mitigation Action | Risk Level |
| :--- | :--- | :--- | :--- | :--- |
| **VEL-001** | Multi-transaction velocity | > 5 trans / 10s | Temporary Account Hold | High |
| **GEO-002** | Geolocation travel deviation | > 500 miles / hr | Multi-Factor Authentication | Medium |
| **AMT-003** | Single transaction value | > $10,000 USD | Manual Compliance Hold & SAR | High |
| **MER-004** | Flagged merchant interaction | Direct match | Automated Transaction Decline | Critical |
| **DEV-005** | Device fingerprint anomaly | > 3 new devices | Email Verification Alert | Low |

---

## 🏗️ Architecture

```
realtime-fraud-detection/
├── artifacts/
│   ├── api-server/          # Express.js REST API + WebSocket Server
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── fraud-engine.ts       # Core detection algorithms
│   │   │   │   ├── mongo.ts              # MongoDB connection layer
│   │   │   │   ├── redis.ts              # Redis caching & pub/sub
│   │   │   │   ├── transaction-simulator.ts  # Test data generator
│   │   │   │   └── ws-server.ts          # WebSocket streaming server
│   │   │   └── routes/
│   │   │       ├── alerts.ts             # Alert CRUD & escalation
│   │   │       ├── analytics.ts          # Aggregation pipelines
│   │   │       ├── cases.ts              # Investigation cases
│   │   │       ├── dashboard.ts          # Summary statistics
│   │   │       ├── merchants.ts          # Merchant risk profiles
│   │   │       ├── rules.ts              # Detection rule management
│   │   │       ├── sar.ts                # SAR filing endpoints
│   │   │       ├── transactions.ts       # Transaction queries
│   │   │       └── users.ts              # User management
│   │   └── package.json
│   │
│   ├── fraud-detection/     # React + Vite Frontend Dashboard
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── dashboard.tsx         # Main overview
│   │   │   │   ├── transactions.tsx      # Transaction explorer
│   │   │   │   ├── alerts.tsx            # Alert queue
│   │   │   │   ├── cases.tsx             # Case manager
│   │   │   │   ├── analytics.tsx         # Data visualization
│   │   │   │   ├── investigation.tsx     # Deep-dive view
│   │   │   │   ├── model-performance.tsx # ML metrics
│   │   │   │   └── sar.tsx               # SAR workflow
│   │   │   └── hooks/
│   │   │       └── useTransactionStream.ts  # WebSocket hook
│   │   └── package.json
│   │
│   └── mockup-sandbox/      # UI Component Sandbox
│
├── lib/                     # Shared Packages
│   ├── api-client-react/    # Auto-generated React query hooks
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Zod validation schemas
│   └── db/                  # Database models & migrations
│
├── scripts/                 # Build & deployment scripts
├── pnpm-workspace.yaml      # Monorepo workspace config
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **pnpm** 8+
- **MongoDB** 7+ (local or Atlas)
- **Redis** 7+ (local or cloud)

### Installation

```bash
# Clone the repository
git clone https://github.com/vemana4/realtime-fraud-detection.git
cd realtime-fraud-detection

# Install all workspace dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI, Redis URL, and other secrets
```

### Development

```bash
# Start the API server (with hot reload)
pnpm --filter api-server dev

# Start the fraud detection dashboard
pnpm --filter fraud-detection dev

# Run both concurrently
pnpm dev
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.x |
| **Frontend** | React 18, Vite, Recharts, Shadcn/UI |
| **Backend** | Express.js, WebSocket (ws) |
| **Database** | MongoDB (Mongoose ODM) |
| **Cache/PubSub** | Redis |
| **Validation** | Zod |
| **Package Manager** | pnpm (workspaces) |
| **Build** | esbuild, Vite |

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/vemana4">Vemana Hemanth Babu</a>
</p>
