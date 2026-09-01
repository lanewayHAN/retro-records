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
| Postman | API request collection and manual testing |

---

# Architecture

```text
                       ┌─────────────────────┐
                       │       Client        │
                       │ Swagger / Postman   │
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

Retro Records V1 uses three main application tables.

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

Example configuration:

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

Replace the `change_me` values with your own local values.

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

On the first startup, PostgreSQL automatically creates:

- the application database schema
- demo application data
- the separate automated test database

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

Primary health endpoint:

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

with a degraded health status.

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

A fresh Docker database contains the following demo users.

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

Login endpoint:

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

Use the returned token in protected requests:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# Main API Endpoints

## Authentication

```text
POST   /api/auth/login
```

## Health

```text
GET    /health
GET    /api/health
```

## Discogs

```text
GET    /api/discogs/search?q=nirvana
```

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

## Users

```text
GET     /api/users
GET     /api/users/:id
POST    /api/users
PUT     /api/users/:id
PATCH   /api/users/:id
DELETE  /api/users/:id
```

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

# Request Validation

Request validation is implemented using Zod.

Invalid request bodies return:

```text
400 Bad Request
```

Validation is performed before data reaches the repository layer.

Example:

```json
{
  "error": "ValidationError",
  "message": "quantity must be greater than 0"
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

Tests run sequentially using Jest `--runInBand` because integration tests share the same PostgreSQL test database.

RabbitMQ publishing is skipped during automated tests so the test suite does not depend on a live RabbitMQ broker.

---

# Test Environment

Automated tests use a separate PostgreSQL database:

```text
retro_records_test
```

The test database is automatically created on the first fresh Docker startup by:

```text
database/init-test.sql
```

Before running tests for the first time, copy:

```text
.env.test.example
```

to:

```text
.env.test
```

Then update the PostgreSQL password in `.env.test` so it matches the password configured in `.env`.

Example:

```env
DATABASE_URL=postgresql://retro_user:YOUR_PASSWORD@localhost:5433/retro_records_test
NODE_ENV=test
JWT_SECRET=test_secret_key
DISCOGS_TOKEN=test_discogs_token
```

The `.env.test` file is excluded from Git and should not be committed.

Install project dependencies if required:

```powershell
npm ci
```

Then run:

```powershell
npm.cmd test
```

The test suite creates and resets its own fixtures, keeping automated test data separate from the normal development database.

---

# Test Coverage

Jest automatically collects coverage when the normal test command runs.

Current overall coverage:

```text
Statements : 84.41%
Branches   : 67.32%
Functions  : 93.02%
Lines      : 84.33%
```

The project has a global coverage gate configured in:

```text
jest.config.js
```

Minimum required coverage:

```text
Statements >= 80%
Branches   >= 60%
Functions  >= 90%
Lines      >= 80%
```

If coverage drops below these thresholds, the test command fails.

Generated coverage reports are excluded from Git using:

```text
coverage/
```

in `.gitignore`.

---

# Postman Collection

An importable Postman collection is included at:

```text
postman/Retro-Records.postman_collection.json
```

To use it:

1. Open Postman.
2. Click **Import**.
3. Select `Retro-Records.postman_collection.json`.
4. Import the collection.
5. Start the Docker application.
6. Run the requests against `http://localhost:3000`.

The collection includes requests for:

- Health
- Authentication
- Discogs
- Products
- Users
- Orders

It also includes examples for:

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`

The staff and customer login requests automatically store JWT tokens as Postman collection variables for protected endpoint testing.

---

# Application Structure

```text
retro-records/
│
├── database/
│   ├── init.sql
│   ├── seed.sql
│   └── init-test.sql
│
├── docs/
│   └── openapi.yaml
│
├── postman/
│   └── Retro-Records.postman_collection.json
│
├── src/
│   ├── auth/
│   ├── discogs/
│   ├── health/
│   ├── integrations/
│   ├── messaging/
│   ├── middleware/
│   ├── orders/
│   ├── products/
│   ├── users/
│   ├── workers/
│   ├── app.js
│   ├── db.js
│   ├── server.js
│   └── swagger.js
│
├── tests/
│
├── .dockerignore
├── .env.example
├── .env.test.example
├── .gitignore
├── compose.yaml
├── Dockerfile
├── jest.config.js
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

Responsibilities are separated as follows.

## Route

Defines HTTP endpoints and middleware.

## Controller

Handles HTTP request and response behaviour.

## Service

Contains application and business logic.

## Repository

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

On a fresh volume, PostgreSQL executes:

```text
database/init.sql
database/seed.sql
database/init-test.sql
```

These create the application schema, demo data and separate test database.

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

The API container also has its own Docker health check using:

```text
GET /health
```

---

## `worker`

Independent RabbitMQ consumer.

The worker listens for:

```text
order.created
```

events.

---

# Docker Health Checks

Docker Compose includes health checks for:

- PostgreSQL
- RabbitMQ
- Retro Records API

Run:

```powershell
docker compose ps
```

A healthy environment should show the main services running, with PostgreSQL, RabbitMQ and the API reporting:

```text
healthy
```

---

# Stopping the Application

To stop containers without deleting persistent data:

```powershell
docker compose down
```

To start them again:

```powershell
docker compose up -d
```

Do not use:

```powershell
docker compose down -v
```

unless you intentionally want to delete PostgreSQL and RabbitMQ Docker volumes.

---

# Rebuilding After Source Code Changes

Run:

```powershell
docker compose up --build -d
```

This rebuilds the API and worker images using the latest source code.

---

# Fresh Installation Behaviour

On a completely fresh Docker volume, the project automatically:

1. Creates the `retro_records` PostgreSQL database.
2. Creates the application tables.
3. Loads demo users, products and orders.
4. Creates the separate `retro_records_test` database.
5. Creates the test tables.
6. Starts RabbitMQ.
7. Starts the API after dependencies are healthy.
8. Starts the independent order worker.

This allows the application infrastructure to be reproduced from the repository using Docker Compose.

---

# Project Scope

Retro Records V1 focuses on demonstrating:

- RESTful CRUD endpoints
- PostgreSQL relational data
- External API integration
- Authentication
- Authorization
- Request validation
- Centralised error handling
- Automated testing
- Test coverage thresholds
- Event-driven messaging
- Docker deployment
- Health monitoring
- Interactive API documentation
- Postman API collection

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
- `.env.test.example` contains test placeholders only.
- Password verification uses bcrypt.
- Protected endpoints use JWT authentication.
- Product write operations use role-based authorization.
- Discogs credentials are not stored directly in source code.
- Real JWT tokens should not be committed or included in screenshots.

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

This project was developed as a backend application demonstrating a complete service architecture using PostgreSQL, RabbitMQ, JWT authentication, role-based authorization, external API integration, automated testing, test coverage, API documentation and Docker containerization.