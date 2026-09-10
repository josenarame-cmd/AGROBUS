# AGROBUS — Agricultural Input Credit Platform

## Overview

AGROBUS is a full-stack web application that digitises the lifecycle of **agricultural input credit** for smallholder farmers. It targets regions like Rwanda where access to seeds, fertilisers, and pesticides on credit is a key driver of food security and farm productivity. The platform connects three roles — **Admins**, **Field Agents**, and **Farmers** — through a single secured web interface.

---

## Purpose

Smallholder farmers often cannot afford agricultural inputs (seeds, fertiliser, pesticides) upfront at the start of a growing season. AGROBUS allows:

1. A **Farmer** to request inputs on credit (a "loan").
2. A **Field Agent** to review, approve, and track delivery of those inputs.
3. An **Admin** to oversee all operations, manage stock, manage agents, and view system-wide analytics.
4. **Repayments** to be recorded as farmers sell their harvest, with automatic loan closure when the balance reaches zero.

The system also tracks agricultural input stock levels, fires low-stock alerts, and maintains a running credit score per farmer.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + Recharts│
│  Port: 5173 (dev) — proxied to backend via /api             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON (Axios)
                         │ JWT Bearer token
┌────────────────────────▼────────────────────────────────────┐
│                     BACKEND (Spring Boot)                    │
│  Java 21 · Spring Boot 3.5 · Spring Security 6              │
│  Spring Data JPA · JJWT 0.12.6 · Bean Validation            │
│  Port: 8080                                                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │Controllers│  │ Services │  │   Repos  │  │  Security  │  │
│  │ (REST)   │→ │(Business │→ │  (JPA)   │→ │ JWT + OAuth│  │
│  │          │  │  Logic)  │  │          │  │  (Google)  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ JPA / JDBC
┌────────────────────────▼────────────────────────────────────┐
│                      DATABASE                                │
│  H2 (in-memory, dev) — drop-in replaceable with MySQL       │
└─────────────────────────────────────────────────────────────┘
```

---

## Domain Model

### Entities and Relationships

```
User (id, email, password, fullName, phone, pictureUrl,
      authProvider[LOCAL|GOOGLE], role[ADMIN|AGENT|FARMER], active)
  │
  ├── 1:1 ──► Agent (id, fullName, phone, assignedDistrict, status)
  │                └── 1:N ──► Farmer (id, fullName, nationalId, phone,
  │                                    gender, district, sector, farmSize,
  │                                    cropType, creditScore, status,
  │                                    userId FK → User)
  │                                    └── 1:N ──► Loan (id, cropType,
  │                                    │               requestedInputs,
  │                                    │               estimatedCost,
  │                                    │               status[PENDING|APPROVED|
  │                                    │                      REJECTED|DELIVERED|REPAID],
  │                                    │               amountRepaid,
  │                                    │               remainingBalance)
  │                                    │               └── 1:N ──► Repayment
  │                                    │                          (amountPaid,
  │                                    │                           paymentMethod,
  │                                    │                           transactionRef)
  │                                    └── 1:N ──► Farm (name, district,
  │                                                      sector, sizeHectares,
  │                                                      primaryCrop)
  │
  └── (Notification — recipientId links to User.id, no FK by design
       to allow role-broadcast notifications)

AgriculturalInput (inputName, category[SEEDS|FERTILIZERS|PESTICIDES],
                   quantityAvailable, quantityDistributed,
                   unitPrice, expirationDate, lowStockThreshold)
    └── M:1 ──► Supplier (name, contactPerson, phone, email, address)
```

### Credit Score Rules
- Default score on registration: **500**
- On-time repayment (loan fully repaid): **+10**
- Loan rejected: **−20**
- Minimum score: **300** | Maximum score: **850**

---

## Roles & Permissions

| Feature | ADMIN | AGENT | FARMER |
|---------|:-----:|:------:|:------:|
| Manage Farmers | ✅ | ✅ | ❌ |
| Manage Agents | ✅ | ✅ | ❌ |
| Manage Loans | ✅ | ✅ | ❌ |
| Approve / Reject Loans | ✅ | ✅ | ❌ |
| Manage Inputs & Stock | ✅ | ✅ | ❌ |
| Manage Suppliers | ✅ | ✅ | ❌ |
| View Dashboard Analytics | ✅ | ✅ | ❌ |
| View Own Loans | ❌ | ❌ | ✅ |
| View Own Repayments | ❌ | ❌ | ✅ |
| Manage Own Farms | ❌ | ❌ | ✅ |
| View Own Notifications | ❌ | ❌ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |

---

## REST API Summary

All endpoints are prefixed with `/api`. Endpoints marked 🔒 require a valid JWT Bearer token.

### Authentication
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | Public | Email + password login |
| POST | `/auth/register` | Public | Register new FARMER account |
| GET | `/auth/me` | 🔒 Any | Get current user profile |
| PUT | `/auth/profile` | 🔒 Any | Update fullName / phone |
| GET | `/oauth2/authorization/google` | Public | Start Google OAuth2 flow |

### Farmers (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/farmers` | Paginated search (search, district, cropType params) |
| GET | `/farmers/all` | All farmers (no pagination) |
| POST | `/farmers` | Create farmer |
| PUT | `/farmers/{id}` | Update farmer |
| DELETE | `/farmers/{id}` | Delete farmer |
| GET | `/farmers/{id}` | Get farmer by ID |
| GET | `/farmers/districts` | Distinct districts |
| GET | `/farmers/crop-types` | Distinct crop types |
| GET | `/farmers/unassigned` | Farmers with no assigned agent |

### Farmer Self-Service (FARMER only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/farmer/farms` | List own farms |
| POST | `/farmer/farms` | Create farm |
| PUT | `/farmer/farms/{id}` | Update own farm |
| DELETE | `/farmer/farms/{id}` | Delete own farm |
| GET | `/farmer/loans` | View own loans |
| GET | `/farmer/repayments` | View own repayments |
| GET | `/farmer/notifications` | View own notifications |
| GET | `/farmer/dashboard` | Personal financial summary |

### Loans (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/loans` | Paginated list |
| POST | `/loans` | Create loan request |
| PUT | `/loans/{id}/approve` | Approve loan |
| PUT | `/loans/{id}/reject` | Reject loan (body: `{reason}`) |
| PUT | `/loans/{id}/deliver` | Mark inputs as delivered |
| GET | `/loans/{id}` | Get loan by ID |
| GET | `/loans/status/{status}` | Filter by status |
| GET | `/loans/farmer/{farmerId}` | Loans for a farmer |
| GET | `/loans/recent` | Most recent loans |

### Agricultural Inputs (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/inputs` | All inputs |
| POST | `/inputs` | Create input item |
| PUT | `/inputs/{id}` | Update input |
| DELETE | `/inputs/{id}` | Delete input |
| GET | `/inputs/{id}` | Get by ID |
| GET | `/inputs/category/{category}` | Filter by category |
| GET | `/inputs/low-stock` | Items below threshold |
| POST | `/inputs/{id}/distribute` | Distribute stock (reduce quantity) |

### Agents (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/agents` | All agents |
| POST | `/agents` | Create agent |
| PUT | `/agents/{id}` | Update agent |
| DELETE | `/agents/{id}` | Delete agent |
| POST | `/agents/{id}/assign-farmer` | Assign farmer to agent |
| GET | `/agents/{id}/farmers` | Get agent's farmers |

### Repayments (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/repayments` | All repayments |
| POST | `/repayments` | Record repayment |
| GET | `/repayments/loan/{loanId}` | Repayments for a loan |
| GET | `/repayments/farmer/{farmerId}` | Repayments for a farmer |
| GET | `/repayments/total` | Total amount repaid |

### Suppliers (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/suppliers` | All suppliers |
| POST | `/suppliers` | Create supplier |
| PUT | `/suppliers/{id}` | Update supplier |
| DELETE | `/suppliers/{id}` | Delete supplier |
| GET | `/suppliers/{id}` | Get supplier by ID |
| GET | `/suppliers/active` | Active suppliers only |

### Notifications (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/notifications` | All notifications (paginated) |
| GET | `/notifications/unread/{userId}` | Unread for user |
| GET | `/notifications/unread-count/{userId}` | Unread count |
| PUT | `/notifications/{id}/read` | Mark as read |

### Dashboard (ADMIN / AGENT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Full analytics: counts, totals, trend charts, activity feed |

---

## Security

- **JWT**: HMAC-SHA256, 24-hour expiry, secret via `JWT_SECRET` env var.
- **Google OAuth2**: Registered app on Google Cloud. Redirect URI: `http://localhost:8080/login/oauth2/code/google`. On success, JWT is returned in the URL fragment to `{frontend}/oauth/callback`.
- **Session policy**: `IF_REQUIRED` (stateful for OAuth2 flow; stateless for API calls via JWT filter).
- **CORS**: Allowed for `http://localhost:5173` and `http://localhost:3000`.

---

## Seeded Test Users

On application startup, the following users are automatically created if they do not exist:

| Role | Email | Password |
|------|-------|----------|
| ADMIN | `admin@agrobus.rw` | `Admin@1234` |
| AGENT | `agent@agrobus.rw` | `Agent@1234` |

Farmers self-register or are created by agents/admins.

---

## Running Locally

### Backend
```bash
cd backend
./mvnw spring-boot:run
# API available at http://localhost:8080
# H2 console at http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Environment Variables (Backend)
| Variable | Default | Purpose |
|----------|---------|---------|
| `JWT_SECRET` | (hardcoded fallback) | JWT signing secret — **change in production** |
| `JWT_EXPIRATION` | `86400000` (24h) | Token TTL in milliseconds |
| `FRONTEND_URL` | `http://localhost:5173` | OAuth2 redirect base URL |

---

## Project Status

### Implemented ✅
- User authentication (local + Google OAuth2)
- Farmer CRUD with search, filtering, and pagination
- Agent management and farmer assignment
- Agricultural input stock management with low-stock alerts
- Full loan lifecycle (PENDING → APPROVED → DELIVERED → REPAID)
- Repayment recording with automatic balance tracking
- Notification system (created by services, polled by frontend)
- Dashboard aggregation with trend charts
- Farmer farm management (own farms)
- Farmer self-service endpoints (own loans, repayments, notifications)
- Supplier management (CRUD)
- Credit score updates on repayment and rejection
- Startup data seeding for ADMIN and AGENT users
- Role-based access control (ADMIN / AGENT / FARMER)
- Global exception handling with structured JSON error responses

### Planned / Future Work 🔜
- MySQL/PostgreSQL for production persistence
- Real-time notifications via WebSocket / SSE
- USSD gateway integration (*810#)
- Crop, harvest, and produce sale tracking
- Expert advisory messaging system
- IoT / smart farm device telemetry
- Email / SMS notification delivery
- Multi-tenancy / organisation support
- Automated tests (unit + integration)
- Docker Compose deployment manifest

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 21 |
| Framework | Spring Boot 3.5 |
| Security | Spring Security 6 + JJWT 0.12.6 |
| ORM | Spring Data JPA + Hibernate |
| Database (dev) | H2 in-memory |
| Frontend | React 19 + TypeScript + Vite 6 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| HTTP client | Axios |
| UI icons | Lucide React |
| Build | Maven (backend), npm (frontend) |
