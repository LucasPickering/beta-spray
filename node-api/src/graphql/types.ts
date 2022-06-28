import { queryType, stringArg, objectType } from "nexus";
import { Boulder } from "nexus-prisma";

export const Query = queryType({
  definition(t) {
    t.string("hello", {
      args: { name: stringArg() },
      resolve: (parent, { name }) => `Hello ${name || "World"}!`,
    });
    t.field("boulder", {
      type: "Boulder",
    });
  },
});

export const BoulderNode = objectType({
  name: Boulder.$name,
  description: Boulder.$description,
  definition(t) {
    t.field(Boulder.name);
  },
});
