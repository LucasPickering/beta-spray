import { Box } from "@mui/material";
import { useContext } from "react";
import { EditorHighlightedItemContext } from "components/Editor/util/highlight";
import BetaMoveActions from "./BetaMoveActions";
import HoldActions from "./HoldActions";

interface Props {
  problemQueryRef: React.ComponentProps<typeof HoldActions>["queryRef"];
  betaQueryRef: React.ComponentProps<typeof BetaMoveActions>["queryRef"];
}

/**
 * Show actions buttons at the bottom of the screen, which apply to the
 * item that is currently highlighted. This takes in the queries for all
 * possible children, then renders the appropriate one based on what's
 * currently highlighted (hold, move, etc.).
 */
const HighlightActions: React.FC<Props> = (props) => {
  return (
    <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>
      <HighlightActionsContent {...props} />
    </Box>
  );
};

const HighlightActionsContent: React.FC<Props> = ({
  problemQueryRef,
  betaQueryRef,
}) => {
  const [highlightedItem] = useContext(EditorHighlightedItemContext);
  switch (highlightedItem?.kind) {
    case "hold":
      return <HoldActions queryRef={problemQueryRef} />;
    case "move":
      return <BetaMoveActions queryRef={betaQueryRef} />;
    case undefined:
      return null;
  }
};

export default HighlightActions;
