# Backend Overview

## Stack
- Node.js + Express (`backend/server.js`, `backend/src/app.js`)
- Prisma ORM + PostgreSQL (`backend/prisma/schema.prisma`)
- Auth/security: JWT, bcrypt, helmet, cors, rate limiting
- Storage: MinIO-compatible object storage for product images

## Entry and Composition
- Entrypoint: `backend/server.js`
- App wiring: `backend/src/app.js`
- Route aggregator: `backend/src/routes/index.js`

## Core API Domains
- Auth, Gyms, Users, Members, Trainers, Attendance, Subscriptions, Notifications, Products, Orders.

## Architecture Principle
Route-level composition (middleware + validation) and controller-level domain logic with Prisma-backed persistence.
