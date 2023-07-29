import { OverlayPosition } from "components/Editor/util/svg";
import { graphql } from "relay-runtime";
import { readFragment } from "relay-runtime/lib/store/ResolverFragments";
import { BetaMovePositionResolver$key } from "./__generated__/BetaMovePositionResolver.graphql";

/**
 * @RelayResolver
 *
 * @onType BetaMoveNode
 * @fieldName position
 * @rootFragment BetaMovePositionResolver
 *
 * Client-side resolver for BetaMove.position
 * https://relay.dev/docs/guides/relay-resolvers/
 */
export default function betaMovePositionResolver(
  betaMoveKey: BetaMovePositionResolver$key
): OverlayPosition {
  const betaMove = readFragment(
    graphql`
      fragment BetaMovePositionResolver on BetaMoveNode {
        target {
          __typename
          ... on HoldNode {
            id
            position {
              x
              y
            }
          }
          ... on SVGPosition {
            x
            y
          }
        }
      }
    `,
    betaMoveKey
  );

  switch (betaMove.target.__typename) {
    case "HoldNode":
      return betaMove.target.position;
    case "SVGPosition":
      return betaMove.target;
    case "%other":
      throw new Error("Unreachable");
  }
}
