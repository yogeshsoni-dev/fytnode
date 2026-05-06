# Database Schema

Canonical schema: `backend/prisma/schema.prisma`

## Core Entities

| Model | Purpose | Key Relations |
|---|---|---|
| `Gym` | Tenant scope | has many users/members/trainers/notifications |
| `User` | Identity + role | optional `gymId`, one member/trainer profile |
| `RefreshToken` | Session token persistence | belongs to user |
| `Member` | Member profile | belongs to user + gym, optional trainer |
| `Trainer` | Trainer profile | belongs to user + gym |
| `SubscriptionPlan` | Global plans | has many subscriptions |
| `Subscription` | Member subscription state | belongs to member + plan |
| `Attendance` | Daily check-in/out | unique `(memberId, date)` |
| `Product` | Shop item | has order items |
| `Order` / `OrderItem` | Purchase lifecycle | belongs to user and products |
| `Notification` | User/gym notifications | scoped by `userId` and/or `gymId` |

## Important Constraints
- `User.email` unique
- `Member.userId` unique
- `Trainer.userId` unique
- `Attendance` unique index on `(memberId, date)`

## Migration Safety Rules
- Never change enum values without client compatibility checks.
- Additive schema changes preferred over destructive changes.
- Validate implications for Prisma code paths in all controllers before migration.
