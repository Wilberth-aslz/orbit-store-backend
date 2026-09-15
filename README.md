# ORBIT Store — Backend

API REST construida con **Node.js + Express + TypeScript + Prisma**, para el reto de
periodo de prueba de Desarrollo de Software (Turing Inteligencia Artificial).

## Stack

- **Runtime:** Node.js 22 + TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 6
- **Base de datos:** PostgreSQL, provisionado con [Neon](https://neon.tech) (integracion de
  Vercel Marketplace). Produccion y desarrollo usan **bases separadas** (mismo motor,
  distinto `DATABASE_URL`) -- nunca se desarrolla/prueba contra los datos reales.
- **Despliegue:** Vercel (funcion serverless, ver `api/index.ts` y `vercel.json`)
- **Auth:** JWT (jsonwebtoken) + bcryptjs para hash de contrasenas
- **Validacion:** Zod
- **Seguridad:** helmet, cors, express-rate-limit
- **Pruebas:** Vitest (unitarias) + Postman/Newman (integracion, ver `postman/`)

## Requisitos

- Node.js 20+ (probado con Node 22)
- npm
- Una base de datos PostgreSQL para desarrollo. Lo mas rapido es crear un proyecto
  gratis en [neon.tech](https://neon.tech) (2 minutos, sin tarjeta) -- **no uses la
  base de produccion para desarrollar**, crea la tuya propia.

## Instalacion y ejecucion local

```bash
cd backend
npm install

# Variables de entorno -- pon tu propio DATABASE_URL/DATABASE_URL_UNPOOLED
# de PostgreSQL (Neon u otro), nunca el de produccion
cp .env.example .env

# Aplica el esquema a tu base
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

Estas son las credenciales que crea el seed **en tu base de datos local** (las que
tu propio `npm run seed` genera al correr este repo). Son publicas a proposito,
para que cualquiera que clone el proyecto pueda probarlo de inmediato.

> **Nota de seguridad:** la contrasena del usuario ADMIN en el despliegue de
> produccion (Neon) fue rotada a un valor distinto y **no esta publicada en este
> repositorio** -- publicar aqui la contrasena real de un admin le daria a
> cualquiera con acceso al repo publico control de escritura sobre la base de
> datos en vivo. Si necesitas entrar como admin a la demo desplegada, pide la
> contrasena por un canal privado. El usuario USER si comparte la misma
> contrasena en local y produccion, porque su rol no tiene permisos
> destructivos (solo puede gestionar sus propios favoritos).

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

### Dashboard (panel de control)

| Metodo | Ruta         | Auth       | Descripcion                                                        |
| ------ | ------------- | ---------- | --------------------------------------------------------------------- |
| GET    | `/dashboard`  | Si (ADMIN) | Totales (productos/categorias/usuarios/valor de inventario), valor de inventario por categoria y alertas de stock bajo (`stock <= 5`) |

Todas las respuestas siguen el formato `{ success: boolean, data?, message?, meta? }`.

## Decisiones tecnicas

- **PostgreSQL (Neon) en vez de SQLite:** el proyecto empezo con SQLite (cero
  configuracion), pero se migro a Postgres real porque el despliegue serverless de
  Vercel no tiene disco persistente para un archivo SQLite. Produccion y desarrollo
  usan **proyectos/bases separadas** del mismo Neon (nunca se desarrolla contra datos
  reales) -- ver `.env.example`.
- **JWT + roles:** el login devuelve un JWT con `sub`, `email` y `role`. Los
  middlewares `requireAuth` y `requireRole("ADMIN")` protegen las rutas de escritura.
- **Zod + middleware `validate`:** cada ruta valida su `body`/`query`/`params` antes de
  llegar al controlador. Nota: Express 5 hace `req.query`/`req.params` de solo lectura,
  asi que el resultado validado se guarda en `req.validated` en vez de sobreescribirlos.
- **Manejo de errores centralizado:** `ApiError` + middleware `errorHandler` traducen
  errores conocidos de Prisma (violacion de unicidad, registro no encontrado) a
  respuestas HTTP consistentes.
- **Panel de control con datos reales, no solo CRUD:** `/dashboard` agrega metricas
  de negocio (valor de inventario, alertas de stock) pensando en que Turing-IA
  trabaja con analitica (Tableau, People Analytics) -- el admin no solo edita filas,
  tiene una vista ejecutiva del catalogo.
