# Retro Records API

Retro Records is a backend REST API for managing a physical music store selling vinyl records, CDs and cassettes.

The project demonstrates a modular Node.js backend using:

- Node.js
- Express
- PostgreSQL
- RabbitMQ
- JWT authentication
- Role-based authorization
- Discogs external API integration
- Swagger / OpenAPI
- Jest
- Supertest
- Docker
- Docker Compose

---

# Features

## Product Management

The API supports full CRUD operations for products:

- Get all products
- Get one product
- Create a product
- Replace a product
- Partially update a product
- Delete a product

Product write operations are protected using JWT authentication.

Only users with the following roles can create, update or delete products:

- `staff`
- `admin`

Customers receive a `403 Forbidden` response.

---

## User Management

The API supports CRUD operations for users.

Each user has one of three roles:

- `customer`
- `staff`
- `admin`

Passwords are stored as password hashes in PostgreSQL.

---

## Order Management

The API supports CRUD operations for orders.

When a new order is created:

1. The order is saved in PostgreSQL.
2. The API publishes an `order.created` event to RabbitMQ.
3. An independent worker consumes the message.
4. The worker asynchronously processes the order event.

This demonstrates event-driven asynchronous processing.

---

## JWT Authentication

Users can authenticate using:

```http
POST /api/auth/login
```

A successful login returns a JWT access token.

The token contains:

- `user_id`
- `email`
- `role`

The token can then be supplied using:

```text
Authorization: Bearer <token>
```

Protected product write routes use role-based authorization.

---

## Discogs API Integration

Retro Records integrates with the external Discogs API.

Search endpoint:

```http
GET /api/discogs/search?q=nirvana
```

Discogs provides music metadata including:

- Release ID
- Title
- Year
- Country
- Format
- Genre
- Style
- Cover image
- Resource URL

The Discogs client includes:

- HTTPS API requests
- Request timeout
- Retry behaviour
- Fallback response if Discogs is unavailable

If the external API cannot be reached, Retro Records returns a controlled fallback response instead of crashing.

---

# Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express | REST API framework |
| PostgreSQL | Relational database |
| RabbitMQ | Message broker |
| JWT | Authentication |
| bcryptjs | Password verification |
| Zod | Request validation |
| Discogs API | External music metadata |
| Swagger / OpenAPI | API documentation |
| Jest | Testing framework |
| Supertest | HTTP integration testing |
| Docker | Application containers |
| Docker Compose | Multi-container orchestration |

---

# Architecture

```text
                       ┌─────────────────────┐
                       │       Client        │
                       │ Swagger / API User  │
                       └──────────┬──────────┘
                                  │
                                  ▼
                       ┌─────────────────────┐
                       │   Express REST API  │
                       │    Retro Records    │
                       └──────┬───────┬──────┘
                              │       │
                    SQL       │       │ HTTPS
                              │       │
                              ▼       ▼
                  ┌──────────────┐  ┌──────────────┐
                  │ PostgreSQL   │  │ Discogs API  │
                  │   Database   │  │              │
                  └──────────────┘  └──────────────┘

                              │
                       order.created
                              │
                              ▼
                     ┌─────────────────┐
                     │    RabbitMQ     │
                     │ Message Broker  │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  Order Worker   │
                     │ Async Consumer  │
                     └─────────────────┘
```

---

# Database Design

Retro Records V1 uses three main tables.

## Users

```text
users
-----
user_id
name
email
phone
password_hash
role
```

Roles:

```text
customer
staff
admin
```

---

## Products

```text
products
--------
product_id
discogs_release_id
album_name
artist
format
price
stock_quantity
```

---

## Orders

```text
orders
------
order_id
customer_id
created_by
product_id
quantity
status
created_at
total_amount
```

Relationships:

```text
users.user_id
      │
      ├──── customer_id ────► orders
      │
      └──── created_by ─────► orders

products.product_id
      │
      └──── product_id ─────► orders
```

For V1, one order row represents one product.

A future version could introduce an `order_items` table to support multiple products in one order.

---

# Quick Start with Docker

## 1. Clone or download the project

Open a terminal inside the project directory.

Example:

```powershell
cd retro-records
```

---

## 2. Create the environment file

Copy:

```text
.env.example
```

and rename the copy to:

```text
.env
```

Example values are provided in `.env.example`.

The following variables are required:

```env
POSTGRES_USER=retro_user
POSTGRES_PASSWORD=change_me
POSTGRES_DB=retro_records
POSTGRES_PORT=5433

DATABASE_URL=postgresql://retro_user:change_me@localhost:5433/retro_records

JWT_SECRET=change_me

DISCOGS_TOKEN=change_me

RABBITMQ_USER=retro_user
RABBITMQ_PASSWORD=change_me
RABBITMQ_URL=amqp://retro_user:change_me@localhost:5672
```

For live Discogs results, replace:

```text
DISCOGS_TOKEN=change_me
```

with a valid Discogs personal access token.

Do not commit the real `.env` file to GitHub.

---

## 3. Start the complete application

Make sure Docker Desktop is running.

Run:

```powershell
docker compose up --build -d
```

Docker Compose starts:

- PostgreSQL
- RabbitMQ
- Retro Records API
- Order Worker

The database schema and demo data are automatically created on the first startup.

---

## 4. Check container status

Run:

```powershell
docker compose ps
```

Expected services:

```text
retro-records-api
retro-records-db
retro-records-rabbitmq
retro-records-worker
```

The API, PostgreSQL and RabbitMQ should report healthy status.

---

# Application URLs

## Swagger API Documentation

Open:

```text
http://localhost:3000/api-docs
```

Swagger can be used to inspect and execute API requests.

---

## Health Check

```text
http://localhost:3000/health
```

Alternative API route:

```text
http://localhost:3000/api/health
```

Example response:

```json
{
  "status": "healthy",
  "service": "retro-records-api",
  "timestamp": "2026-09-01T07:23:00.315Z",
  "dependencies": {
    "postgresql": "up",
    "rabbitmq": "up"
  }
}
```

The health endpoint reports the status of:

- PostgreSQL
- RabbitMQ

If a required dependency is unavailable, the API returns:

```text
503 Service Unavailable
```

with:

```json
{
  "status": "degraded"
}
```

---

## RabbitMQ Management UI

Open:

```text
http://localhost:15672
```

Login using the values configured in:

```env
RABBITMQ_USER
RABBITMQ_PASSWORD
```

The order event queue is:

```text
order.created
```

---

# Demo Accounts

The fresh Docker database contains demo users.

## Customer

```text
Email: john@example.com
Password: password123
Role: customer
```

## Staff

```text
Email: sarah@example.com
Password: password123
Role: staff
```

## Admin

```text
Email: alex@example.com
Password: password123
Role: admin
```

The staff account can be used to test protected product routes.

---

# Authentication Example

Login:

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "sarah@example.com",
  "password": "password123"
}
```

Successful response:

```json
{
  "token": "<JWT_TOKEN>",
  "user": {
    "user_id": 2,
    "name": "Sarah Staff",
    "email": "sarah@example.com",
    "role": "staff"
  }
}
```

Use the returned token:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# Main API Endpoints

## Authentication

```text
POST   /api/auth/login
```

---

## Health

```text
GET    /health
GET    /api/health
```

---

## Discogs

```text
GET    /api/discogs/search?q=nirvana
```

---

## Products

```text
GET     /api/products
GET     /api/products/:id
POST    /api/products
PUT     /api/products/:id
PATCH   /api/products/:id
DELETE  /api/products/:id
```

Product write operations require a staff or admin JWT.

---

## Users

```text
GET     /api/users
GET     /api/users/:id
POST    /api/users
PUT     /api/users/:id
PATCH   /api/users/:id
DELETE  /api/users/:id
```

---

## Orders

```text
GET     /api/orders
GET     /api/orders/:id
POST    /api/orders
PUT     /api/orders/:id
PATCH   /api/orders/:id
DELETE  /api/orders/:id
```

Creating an order also publishes an asynchronous RabbitMQ event.

---

# HTTP Status Codes

The API uses standard HTTP status codes.

| Status | Meaning |
|---|---|
| 200 | Request successful |
| 201 | Resource created |
| 204 | Resource deleted successfully |
| 400 | Invalid request |
| 401 | Authentication required or token invalid |
| 403 | Authenticated but not authorized |
| 404 | Resource not found |
| 503 | Required service unavailable |

---

# Error Response Format

Errors use a consistent JSON response format:

```json
{
  "error": "ValidationError",
  "message": "Invalid request data"
}
```

Example not-found response:

```json
{
  "error": "NotFound",
  "message": "Product not found"
}
```

---

# Testing

The project uses:

- Jest
- Supertest

The test suite includes:

- Product route integration tests
- Product service unit tests
- User route integration tests
- User service unit tests
- Order route integration tests
- Order service unit tests
- Authentication tests
- CORS tests
- Discogs integration-layer tests
- Health endpoint tests

Current test suite:

```text
10 test suites
56 tests
```

To run the tests:

```powershell
npm test
```

If Windows PowerShell blocks `npm.ps1`, use:

```powershell
npm.cmd test
```

Tests run sequentially using Jest `--runInBand` because the integration tests share the same PostgreSQL test database.

RabbitMQ publishing is skipped during automated tests so that the test suite does not depend on a running RabbitMQ broker.

---

# Test Environment

Tests use:

```text
.env.test
```

and a separate PostgreSQL database:

```text
retro_records_test
```

This keeps automated test data separate from development data.

The `.env.test` file is excluded from Git.

---

# Request Validation

Request validation is implemented using Zod.

Invalid request bodies return:

```text
400 Bad Request
```

Validation is performed before data reaches the repository layer.

---

# Application Structure

The application follows a modular architecture.

```text
retro-records/
│
├── database/
│   ├── init.sql
│   └── seed.sql
│
├── docs/
│   └── openapi.yaml
│
├── src/
│   │
│   ├── auth/
│   │
│   ├── discogs/
│   │
│   ├── health/
│   │
│   ├── integrations/
│   │
│   ├── messaging/
│   │
│   ├── middleware/
│   │
│   ├── orders/
│   │
│   ├── products/
│   │
│   ├── users/
│   │
│   ├── workers/
│   │
│   ├── app.js
│   ├── db.js
│   ├── server.js
│   └── swagger.js
│
├── tests/
│
├── .dockerignore
├── .env.example
├── .gitignore
├── compose.yaml
├── Dockerfile
├── package.json
├── package-lock.json
└── README.md
```

---

# Layered Architecture

The main domain modules follow this structure:

```text
Route
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
PostgreSQL
```

Responsibilities are separated:

### Route

Defines HTTP endpoints and middleware.

### Controller

Handles HTTP request and response behaviour.

### Service

Contains application and business logic.

### Repository

Handles PostgreSQL queries.

This keeps controllers thin and makes business logic easier to test.

---

# RabbitMQ Event Flow

Creating an order follows this workflow:

```text
Client
  ↓
POST /api/orders
  ↓
Order Service
  ↓
PostgreSQL
  ↓
order.created event
  ↓
RabbitMQ
  ↓
Independent Order Worker
  ↓
Async processing
```

Example event:

```json
{
  "event_id": "uuid",
  "event_type": "order.created",
  "occurred_at": "2026-09-01T07:41:11.547Z",
  "data": {
    "order_id": 3,
    "customer_id": 1,
    "created_by": 2,
    "product_id": 1,
    "quantity": 1,
    "status": "pending",
    "total_amount": "49.95"
  }
}
```

The RabbitMQ queue is durable and messages are published as persistent messages.

---

# CORS

CORS middleware is enabled for the API.

The API supports browser pre-flight `OPTIONS` requests and common HTTP methods including:

```text
GET
POST
PUT
PATCH
DELETE
```

---

# Docker Services

Docker Compose defines four services.

## `db`

PostgreSQL database.

Internal Docker address:

```text
db:5432
```

Host port:

```text
localhost:5433
```

---

## `rabbitmq`

RabbitMQ broker and management interface.

Internal Docker address:

```text
rabbitmq:5672
```

Management UI:

```text
localhost:15672
```

---

## `api`

Retro Records Express API.

Port:

```text
localhost:3000
```

The API waits for PostgreSQL and RabbitMQ health checks before starting.

---

## `worker`

Independent RabbitMQ consumer.

The worker listens for:

```text
order.created
```

events.

---

# Stopping the Application

To stop the containers without deleting persistent data:

```powershell
docker compose down
```

To start them again:

```powershell
docker compose up -d
```

Do not use `-v` unless you intentionally want to delete PostgreSQL and RabbitMQ Docker volumes.

---

# Rebuilding After Source Code Changes

Run:

```powershell
docker compose up --build -d
```

This rebuilds the API and worker images using the latest source code.

---

# Project Scope

Retro Records V1 focuses on demonstrating:

- RESTful CRUD endpoints
- PostgreSQL relational data
- External API integration
- Authentication
- Authorization
- Request validation
- Error handling
- Automated testing
- Event-driven messaging
- Docker deployment
- Health monitoring
- Interactive API documentation

---

# Current V1 Limitation

The current Orders schema stores one product per order.

For example:

```text
Order 10
→ Product 3
→ Quantity 2
```

A future production version could introduce:

```text
orders
order_items
```

allowing a single order to contain multiple products.

---

# Security Notes

- Secrets are stored using environment variables.
- `.env` is excluded from Git.
- `.env.test` is excluded from Git.
- `.env.example` contains placeholders only.
- Password verification uses bcrypt.
- Protected endpoints use JWT authentication.
- Product write operations use role-based authorization.
- Discogs credentials are not stored directly in source code.

---

# API Documentation

Interactive OpenAPI documentation is available at:

```text
http://localhost:3000/api-docs
```

Swagger documents:

- Health
- Authentication
- Discogs
- Products
- Users
- Orders

---

# Retro Records V1

This project was developed as a backend application demonstrating a complete service architecture using PostgreSQL, RabbitMQ, authentication, external API integration, automated testing and containerization.