import { useContext } from "react";
import { EditorHighlightedItemContext } from "components/Editor/util/highlight";
import BetaMoveActions from "./BetaMoveActions";
import HoldActions from "./HoldActions";
import ActionButtons from "./ActionButtons";

// TODO delete this file

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
const HighlightActions: React.FC<Props> = ({
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
      return <ActionButtons disabled />;
  }
};

export default HighlightActions;
