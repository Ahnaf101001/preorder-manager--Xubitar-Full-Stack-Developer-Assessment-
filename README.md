# Preorder Manager

A full-stack preorder management application built with Next.js 16 and SQLite via `@libsql/client`.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | SQLite (via `@libsql/client`) |
| Styling | Tailwind CSS v4 |
| Runtime | Node.js 18+ |

> **Note on Prisma:** The assessment specified Prisma + SQLite. Prisma requires downloading binary engine files from external servers — those were blocked in this build environment. `@libsql/client` is a zero-dependency SQLite client that provides identical functionality. The schema and queries are exactly what Prisma would generate. If you want to swap back to Prisma, `schema.prisma` is included in the `prisma/` folder.

---

## Features

- Preorder list with pagination (server-side)
- Filter tabs: All / Active / Inactive (server-side)
- Sort by Name, Created At, Starts At, Ends At — ascending/descending (server-side)
- Status toggle updates the database instantly with toast feedback
- Delete with confirmation modal
- Row checkboxes + select-all
- Create new preorder with validation
- Edit existing preorder (pre-filled form)
- Loading states on save button and page fetch
- Empty state when no results

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Create .env file

```env
DATABASE_URL="file:./dev.db"
```

### 3. Create the database table

```bash
npm run db:setup
```

### 4. Seed sample data

```bash
npm run db:seed
```

### 5. Start the dev server

```bash
npm run dev
```

Open http://localhost:3000 — redirects automatically to /preorders.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:setup` | Create the database and table |
| `npm run db:seed` | Seed 8 sample preorders |

---

## Project Structure

```
src/
  app/
    api/preorders/
      route.ts           GET list + POST create
      [id]/route.ts      GET + PUT + PATCH status + DELETE
    preorders/
      layout.tsx         Suspense wrapper
      page.tsx           List page
      create/page.tsx    Create page
      [id]/page.tsx      Edit page
    globals.css
    layout.tsx
    page.tsx             Redirects to /preorders
  components/
    PreorderForm.tsx     Shared form for create + edit
  lib/
    db.ts                SQLite client
  types/
    index.ts             TypeScript types
seed.js                  Seed script
setup-db.js              DB setup script
```

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/preorders | List (filter, sort, paginate) |
| POST | /api/preorders | Create |
| GET | /api/preorders/:id | Get one |
| PUT | /api/preorders/:id | Update all fields |
| PATCH | /api/preorders/:id | Update status only |
| DELETE | /api/preorders/:id | Delete |

### GET /api/preorders query params

| Param | Values | Default |
|---|---|---|
| filter | all, active, inactive | all |
| sortField | name, created_at, starts_at, ends_at | created_at |
| sortOrder | asc, desc | desc |
| page | integer | 1 |
| pageSize | integer | 8 |

---

## Database Schema

```sql
CREATE TABLE preorders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  products      INTEGER DEFAULT 1,
  preorder_when TEXT DEFAULT 'regardless-of-stock',
  starts_at     TEXT NOT NULL,
  ends_at       TEXT,
  status        INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);
```

---

## Submitted by

Ahnaf Khan Sadaf
Email: ahnaf10100@gmail.com
Phone: +880 1725-315443
LinkedIn: linkedin.com/in/ahnafkhansadaf
GitHub: github.com/Ahnaf101001
