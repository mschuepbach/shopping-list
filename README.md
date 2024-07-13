# Shopping List

A self-hostable, realtime shopping list.

## Installation

### Docker Compose

```yml
services:
  shopping-list:
    image: mschuepbach/shopping-list
    container_name: shopping-list
    restart: unless-stopped
    ports:
      - 3000:3000
    environment:
      - PORT=3000
      - ORIGIN=https://example.com
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=adminpassword
      - DB_URL=postgresql://postgres:postgrespassword@shopping-list-db:5432
    depends_on:
      - shopping-list-db

  shopping-list-db:
    image: postgres:15-alpine
    container_name: shopping-list-db
    restart: unless-stopped
    environment:
      - POSTGRES_PASSWORD=postgrespassword
```

## Developing

### Prerequesites

- [Node](https://nodejs.org/) & [pnpm](https://pnpm.io/)
- [Postgresql](https://www.postgresql.org/) database

### Get Started

1. Copy-paste `.env.example` and rename it to `.env`
1. Edit the values in `.env`
1. Install dependencies with `pnpm install`
1. Start the development server with `pnpm dev`