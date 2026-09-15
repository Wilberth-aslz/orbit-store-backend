import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`ORBIT Store API escuchando en http://localhost:${env.port}`);
  console.log(`Healthcheck: http://localhost:${env.port}/api/health`);
});
