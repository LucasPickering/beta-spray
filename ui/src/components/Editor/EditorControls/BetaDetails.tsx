import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { FormLabel, Skeleton } from "@mui/material";
import { BetaContext } from "components/Editor/util/context";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import { useBetaMoveColors } from "components/Editor/util/moves";
import { betaQuery } from "../../../util/queries";
import { BetaDetails_betaNode$key } from "./__generated__/BetaDetails_betaNode.graphql";
import BetaMoveList from "./BetaMoveList";

interface Props {
  betaKey: BetaDetails_betaNode$key;
}

/**
 * Detailed info for a beta in the sidebar. This is the top-level component
 * for the Beta section of the sidebar.
 */
const BetaDetails: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        ...BetaMoveList_betaNode
        moves {
          ...moves_colors_betaMoveNodeConnection
        }
      }
    `,
    betaKey
  );

  // We may want to memoize these together to prevent context-based rerenders:
  // Calculate color for each move
  const betaMoveColors = useBetaMoveColors(beta.moves);
  // We don't need positions in this list, so leave this empty. If we try
  // to access it within this tree, it'll just trigger an error
  const betaMoveVisualPositions = new Map();

  return (
    <BetaDetailsWrapper>
      <BetaContext.Provider value={{ betaMoveColors, betaMoveVisualPositions }}>
        <BetaMoveList betaKey={beta} />
      </BetaContext.Provider>
    </BetaDetailsWrapper>
  );
};

/**
 * Wrapper with static content that allows for a fleshed out loading state.
 */
const BetaDetailsWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <FormLabel component="span">Moves</FormLabel>
    {children}
  </div>
);

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: (
    <BetaDetailsWrapper>
      <Skeleton variant="rectangular" height={240} />
    </BetaDetailsWrapper>
  ),
})(BetaDetails);
