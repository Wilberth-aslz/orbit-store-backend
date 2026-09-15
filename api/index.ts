// Punto de entrada para el runtime serverless de Vercel. La app de Express
// (definida en src/app.ts, usada tal cual en local con src/index.ts) es en
// si misma un manejador de requests compatible con (req, res), asi que
// basta con exportarla por default -- Vercel se encarga de invocarla.
import { app } from "../src/app";

export default app;
