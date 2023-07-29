import { graphql } from "relay-runtime";
import { readFragment } from "relay-runtime/lib/store/ResolverFragments";
import { BetaMoveIsFreeResolver$key } from "./__generated__/BetaMoveIsFreeResolver.graphql";

/**
 * @RelayResolver
 *
 * @onType BetaMoveNode
 * @fieldName isFree
 * @rootFragment BetaMoveIsFreeResolver
 *
 * Client-side resolver for BetaMove.isFree
 * https://relay.dev/docs/guides/relay-resolvers/
 */
export default function betaMoveIsFreeResolver(
  betaMoveKey: BetaMoveIsFreeResolver$key
): boolean {
  const betaMove = readFragment(
    graphql`
      fragment BetaMoveIsFreeResolver on BetaMoveNode {
        target {
          __typename
          # Needed to get relay to type __typename
          ... on HoldNode {
            id
          }
        }
      }
    `,
    betaMoveKey
  );

  return betaMove.target.__typename !== "HoldNode";
}
