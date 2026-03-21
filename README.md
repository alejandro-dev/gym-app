# Gym App

Monorepo para una aplicacion de gimnasio con varias apps y paquetes compartidos.

## Estructura

```text
apps/
  api/       Backend con NestJS + Prisma
  mobile/    App movil
  web/       App web
packages/    Codigo compartido
```

## Requisitos

- Node.js 20+
- pnpm 10+

## Instalacion

```bash
pnpm install
```

## Desarrollo

API:

```bash
pnpm --filter api start:dev
```

Build de la API:

```bash
pnpm --filter api build
```

Tests de la API:

```bash
pnpm --filter api test
```

## Documentacion

Cuando la API este corriendo, Swagger estara disponible en:

```text
http://localhost:3000/docs
```

## Estado actual

- CRUD de usuarios
- Autenticacion JWT con access token y refresh token
- Swagger
- GitHub Actions basica para CI
