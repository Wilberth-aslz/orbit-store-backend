# Coleccion de Postman — ORBIT Store API

Importa `ORBIT-Store.postman_collection.json` (y opcionalmente el environment
`ORBIT-Store-Local.postman_environment.json`) en Postman, o corre todo desde la
terminal con [Newman](https://www.npmjs.com/package/newman):

```bash
# con el backend corriendo en http://localhost:4000
npx newman run postman/ORBIT-Store.postman_collection.json
```

## Que cubre

- **Health**: healthcheck del servidor.
- **Auth**: registro, login (admin y user — guardan el token automaticamente en
  las variables `adminToken`/`userToken`), `/auth/me`, login con credenciales
  invalidas (401).
- **Categorias / Productos**: CRUD completo, filtros de productos (categoria,
  busqueda, paginacion), y casos negativos (sin token -> 401, datos invalidos -> 400,
  rol incorrecto -> 403).
- **Favoritos**: agregar/listar/quitar favoritos del usuario autenticado.
- **Usuarios**: listado solo-ADMIN.

El flujo esta pensado para correrse de arriba a abajo (carpeta por carpeta): los
requests de login guardan el JWT en variables de coleccion que reutilizan los
requests protegidos de las carpetas siguientes.

Ultima corrida verificada: **26 requests, 0 fallidos, 10/10 aserciones OK**.
