import { makeSchema } from "nexus";
import * as types from "./types";

export const schema = makeSchema({
  types,
  outputs: {
    schema: "./schema.graphql",
    typegen: __dirname + "/__generated__/typings.ts",
  },
});
