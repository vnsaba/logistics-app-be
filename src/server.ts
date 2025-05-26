import { app } from "./app";

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);


export const config = {
  app: {
    port: process.env.PORT || 3000,
  },

  server: {
    port: process.env.REDIS_URL || 'redis://localhost:6379',
  }
}

