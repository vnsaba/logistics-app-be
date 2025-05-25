import { app } from "./app";
import redisClient from "./shared/infraestructure/redis";

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);

redisClient.connect()