import { createServer } from "@graphql-yoga/node";
import { schema } from "./graphql/schema";

const hostname = "localhost";
const port = 8000;

const server = createServer({
  schema,
  hostname,
  port,
});
server.start();
