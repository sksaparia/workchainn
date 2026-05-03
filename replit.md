# WorkChain — Web3 Job Marketplace

## Overview

A decentralized job marketplace where clients can book local manual workers and remote online professionals, paying exclusively in cryptocurrency (ETH, MATIC, USDC).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui (dark cyberpunk theme)
- **Backend**: Express 5 (API Server artifact)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Web3**: Raw window.ethereum / MetaMask (no wagmi dependency)
- **Build**: esbuild (CJS bundle)

## Artifacts

- **web3-marketplace** (`/`) — React + Vite frontend. Dark neon cyberpunk theme with Space Grotesk + Space Mono fonts.
- **api-server** (`/api`) — Express 5 REST API
- **mockup-sandbox** (`/__mockup`) — Canvas/design sandbox

## Key Features

- 400 job categories seeded (200 manual, 200 online) across 11 industries
- User roles: Workers (create profile, set crypto rate) and Clients (browse, filter, book)
- Web3 wallet connect via MetaMask (window.ethereum)
- Crypto booking flow: ETH transaction on booking
- Search + filter: keyword, job type toggle (Local/Remote), location cascades (Country/State/City), pay level
- Pages: Home (`/`), Explore (`/explore`), Worker Profile (`/worker/:id`), Register (`/register`), My Bookings (`/bookings`)

## Database Schema

- `categories` — 400 job categories (name, type: manual|online, industry, pay_level)
- `workers` — Worker profiles (wallet_address unique, category_id, rate_amount, rate_currency: ETH|MATIC|USDC, rate_type: hourly|task, location fields)
- `bookings` — Bookings (worker_id, client_wallet, status: pending|confirmed|completed|cancelled, tx_hash)

## API Endpoints

- `GET /api/categories` — List/search categories (type, industry, search filters)
- `GET /api/categories/industries` — Distinct industries with counts
- `GET/POST /api/workers` — List workers (with full filters) / create worker
- `GET/PUT /api/workers/:id` — Get/update worker profile
- `GET/POST /api/bookings` — List/create bookings
- `GET/PATCH /api/bookings/:id` — Get/update booking status+txHash
- `GET /api/stats/overview` — Marketplace dashboard stats
- `GET /api/stats/top-categories` — Top categories by worker count
- `GET /api/stats/recent-bookings` — Recent booking feed

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
