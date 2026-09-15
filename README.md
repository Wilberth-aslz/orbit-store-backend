# ORBIT Store — Backend

API REST construida con **Node.js + Express + TypeScript + Prisma**, para el reto de
periodo de prueba de Desarrollo de Software (Turing Inteligencia Artificial).

## Stack

- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 6
- **Base de datos:** SQLite por defecto (archivo local, cero configuracion). Compatible con
  PostgreSQL/MySQL cambiando solo `provider` + `DATABASE_URL` (ver `prisma/schema.prisma`).
- **Auth:** JWT (jsonwebtoken) + bcryptjs para hash de contrasenas
- **Validacion:** Zod
- **Seguridad:** helmet, cors, express-rate-limit

## Requisitos

- Node.js 20+ (probado con Node 22)
- npm

## Instalacion y ejecucion local

```bash
cd backend
npm install

# Variables de entorno (ya trae valores por defecto que funcionan tal cual)
cp .env.example .env

# Crea la base de datos SQLite y aplica el esquema
npm run prisma:migrate

# Llena la base de datos con categorias, productos y usuarios de prueba
npm run seed

# Levanta el servidor en modo desarrollo (hot reload)
npm run dev
```

El servidor queda escuchando en `http://localhost:4000`. Healthcheck: `GET /api/health`.

### Scripts disponibles

| Script                  | Descripcion                                          |
| ------------------------ | ----------------------------------------------------- |
| `npm run dev`            | Servidor en modo desarrollo (ts-node-dev, hot reload) |
| `npm run build`          | Compila TypeScript a `dist/`                          |
| `npm start`               | Corre el build compilado (`dist/index.js`)             |
| `npm run prisma:migrate` | Crea/aplica migraciones de Prisma                      |
| `npm run prisma:studio`  | Abre Prisma Studio (explorador visual de la BD)        |
| `npm run seed`            | Pobla la base de datos con datos de ejemplo            |

### Credenciales de prueba (creadas por el seed)

| Rol   | Correo             | Contrasena  |
| ----- | ------------------- | ----------- |
| ADMIN | admin@orbit.com     | Admin123!   |
| USER  | user@orbit.com      | User123!    |

## Modelo de datos (ERD)

```
 ┌───────────────┐        ┌────────────────┐        ┌───────────────┐
 │   Category     │        │    Product      │        │   Favorite    │
 ├───────────────┤        ├────────────────┤        ├───────────────┤
 │ id  PK         │───┐    │ id  PK          │   ┌───│ id  PK        │
 │ name  (unique) │   └──►│ categoryId  FK  │   │    │ userId  FK    │──┐
 │ slug  (unique) │        │ name  (unique)  │◄──┘    │ productId FK  │  │
 └───────────────┘        │ description     │        │ (userId,       │  │
                            │ price           │        │  productId)   │  │
                            │ stock           │        │  unique        │  │
                            │ imageUrl        │        └───────────────┘  │
                            │ createdAt       │                            │
                            │ updatedAt       │        ┌───────────────┐  │
                            └────────────────┘        │     User       │◄─┘
                                                        ├───────────────┤
                                                        │ id  PK         │
                                                        │ name           │
                                                        │ email (unique) │
                                                        │ password (hash)│
                                                        │ role ADMIN|USER│
                                                        │ createdAt       │
                                                        └───────────────┘
```

**Normalizacion (3FN):**

- `Category` esta separada de `Product` para no repetir el nombre de categoria en cada
  fila de producto (evita redundancia y anomalias de actualizacion).
- `Favorite` es una tabla intermedia que modela la relacion muchos-a-muchos entre
  `User` y `Product`, con una restriccion `unique(userId, productId)` para que un
  usuario no pueda duplicar el mismo favorito.
- Cada tabla tiene una clave primaria propia (`id`) y todos los atributos no clave
  dependen unicamente de esa clave (sin dependencias transitivas).

## Endpoints

Base URL: `http://localhost:4000/api`

### Auth

| Metodo | Ruta            | Auth | Descripcion                        |
| ------ | ---------------- | ---- | ----------------------------------- |
| POST   | `/auth/register` | No   | Crea una cuenta (rol `USER`)        |
| POST   | `/auth/login`    | No   | Login, devuelve `{ user, token }`   |
| GET    | `/auth/me`       | Si   | Datos del usuario autenticado        |

### Categorias

| Metodo | Ruta               | Auth        | Descripcion            |
| ------ | ------------------- | ----------- | ----------------------- |
| GET    | `/categories`       | No          | Lista categorias         |
| POST   | `/categories`       | Si (ADMIN)  | Crea categoria           |
| PUT    | `/categories/:id`   | Si (ADMIN)  | Actualiza categoria      |
| DELETE | `/categories/:id`   | Si (ADMIN)  | Elimina categoria (si no tiene productos) |

### Productos

| Metodo | Ruta            | Auth        | Descripcion                                              |
| ------ | ---------------- | ----------- | ---------------------------------------------------------- |
| GET    | `/products`      | No          | Lista con filtros `?category=slug&search=&page=&limit=`   |
| GET    | `/products/:id`  | No          | Detalle de un producto                                     |
| POST   | `/products`      | Si (ADMIN)  | Crea producto                                               |
| PUT    | `/products/:id`  | Si (ADMIN)  | Actualiza producto (parcial)                                |
| DELETE | `/products/:id`  | Si (ADMIN)  | Elimina producto                                             |

### Favoritos (requieren sesion)

| Metodo | Ruta                    | Descripcion                     |
| ------ | ------------------------ | --------------------------------- |
| GET    | `/favorites`             | Favoritos del usuario autenticado |
| POST   | `/favorites/:productId`  | Agrega un producto a favoritos     |
| DELETE | `/favorites/:productId`  | Quita un producto de favoritos     |

### Usuarios

| Metodo | Ruta      | Auth       | Descripcion                    |
| ------ | ---------- | ---------- | -------------------------------- |
| GET    | `/users`   | Si (ADMIN) | Lista de usuarios registrados    |

Todas las respuestas siguen el formato `{ success: boolean, data?, message?, meta? }`.

## Decisiones tecnicas

- **SQLite por defecto:** se eligio para que el proyecto corra "out of the box" sin
  instalar un motor de base de datos aparte. El esquema es 100% compatible con
  PostgreSQL/MySQL; para migrar solo hay que cambiar el `provider` en
  `prisma/schema.prisma` y el `DATABASE_URL` en `.env`.
- **JWT + roles:** el login devuelve un JWT con `sub`, `email` y `role`. Los
  middlewares `requireAuth` y `requireRole("ADMIN")` protegen las rutas de escritura.
- **Zod + middleware `validate`:** cada ruta valida su `body`/`query`/`params` antes de
  llegar al controlador. Nota: Express 5 hace `req.query`/`req.params` de solo lectura,
  asi que el resultado validado se guarda en `req.validated` en vez de sobreescribirlos.
- **Manejo de errores centralizado:** `ApiError` + middleware `errorHandler` traducen
  errores conocidos de Prisma (violacion de unicidad, registro no encontrado) a
  respuestas HTTP consistentes.
