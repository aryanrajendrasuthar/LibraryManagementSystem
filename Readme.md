# Library Management System

A full-stack library management application built with Spring Boot and React.

## Tech Stack

**Backend**
- Java 17, Spring Boot 3.2.5
- Spring Security + JWT (stateless RBAC: ADMIN / LIBRARIAN / MEMBER)
- Spring Data JPA + PostgreSQL + Flyway migrations
- Spring Mail (async overdue notifications via `@Scheduled` daily cron)
- Spring WebFlux WebClient — Open Library ISBN auto-fill
- Fine calculation: $0.25/day overdue, 14-day loan duration

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS v4
- React Router DOM v6, Axios, Recharts, Lucide React

## Features

| Feature | Description |
|---|---|
| Book catalog | Search by title/author/ISBN, filter by category & availability |
| Borrow & return | One-click borrow; fines calculated on return |
| Reservations | FIFO waitlist; member auto-notified when book becomes available |
| Member dashboard | Active loans with due-date countdown, fines owed, reservation queue |
| Admin dashboard | Recharts PieChart (books by category) + BarChart (loans per month) |
| Book management | Full CRUD with ISBN auto-fill from Open Library API |
| Loan management | Admin return with fine display, overdue highlighting |
| Member management | Role assignment (ADMIN / LIBRARIAN / MEMBER), suspend/activate |
| Email notifications | Borrow confirmation, overdue reminders (8 AM daily), reservation fulfilled |

## Quick Start (Docker)

```bash
cp .env.example .env
# Edit .env with your secrets
docker compose up --build
```

- Frontend: http://localhost:80
- Backend API: http://localhost:8080
- Default admin: `admin@library.com` / `Admin@123`

## Local Development

### Prerequisites
- Java 17+, Maven 3.9+
- Node 20+, npm
- PostgreSQL 15+ running on port 5432

### Backend

```bash
cd backend

# Create database
psql -U postgres -c "CREATE DATABASE library_db;"

# Run with dev defaults (no email required)
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`. Flyway auto-runs migrations and seeds the admin account.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite dev server starts on `http://localhost:5173` with `/api` proxied to the backend.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/library_db` | JDBC connection URL |
| `DB_USERNAME` | `postgres` | Database user |
| `DB_PASSWORD` | — | Database password |
| `JWT_SECRET` | dev default | HMAC-SHA256 signing key (min 32 chars) |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP host |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | — | Sender email address |
| `MAIL_PASSWORD` | — | App password |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

## Project Structure

```
Library Management System/
├── backend/
│   ├── src/main/java/com/library/
│   │   ├── entity/          # JPA entities
│   │   ├── repository/      # Spring Data repositories + JPQL
│   │   ├── service/         # Business logic, email, analytics
│   │   ├── controller/      # REST controllers
│   │   ├── security/        # JWT filter, UserDetailsService
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── config/          # SecurityConfig, WebClientConfig
│   │   └── exception/       # GlobalExceptionHandler (ProblemDetail)
│   └── src/main/resources/
│       ├── db/migration/    # Flyway SQL migrations
│       └── application.properties
├── frontend/
│   └── src/
│       ├── api/             # Axios API modules
│       ├── components/      # Navbar, BookCard, ProtectedRoute
│       ├── context/         # AuthContext (JWT + localStorage)
│       ├── pages/           # Route pages (catalog, dashboard, admin)
│       └── types/           # TypeScript interfaces
├── docker-compose.yml
└── .env.example
```

## API Overview

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/books?query=&category=&available=&page=&size=
GET    /api/books/{id}
GET    /api/books/categories
GET    /api/books/isbn-lookup/{isbn}
POST   /api/books                    [LIBRARIAN+]
PUT    /api/books/{id}               [LIBRARIAN+]
DELETE /api/books/{id}               [ADMIN]

POST   /api/loans/borrow/{bookId}    [MEMBER+]
PATCH  /api/loans/{id}/return        [MEMBER+]
GET    /api/loans/my                 [MEMBER+]
GET    /api/loans                    [LIBRARIAN+]
PATCH  /api/loans/{id}/admin-return  [LIBRARIAN+]

POST   /api/reservations/books/{bookId}  [MEMBER+]
PATCH  /api/reservations/{id}/cancel     [MEMBER+]
GET    /api/reservations/my              [MEMBER+]
GET    /api/reservations                 [LIBRARIAN+]

GET    /api/members/me               [MEMBER+]
GET    /api/members                  [ADMIN]
PATCH  /api/members/{id}/role        [ADMIN]
PATCH  /api/members/{id}/toggle-active [ADMIN]

GET    /api/analytics/dashboard      [LIBRARIAN+]
```
