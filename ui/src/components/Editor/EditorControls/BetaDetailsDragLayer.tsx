import { findNode, assertIsDefined } from "util/func";
import { Portal } from "@mui/material";
import {
  DragItemWithKind,
  getItemWithKind,
  useDragLayer,
} from "components/Editor/util/dnd";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaDetailsDragLayer_betaMoveNodeConnection$key } from "./__generated__/BetaDetailsDragLayer_betaMoveNodeConnection.graphql";
import BetaMoveListItem from "./BetaMoveListItem";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 1400, // Drawer has 1200, we need to beat that
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

interface Props {
  betaMoveConnectionKey: BetaDetailsDragLayer_betaMoveNodeConnection$key;
}

/**
 * Drag-and-drop preview layer specific to the beta details panel. We need this
 * to be narrow so that we know the proper Relay data is available here.
 */
const BetaDetailsDragLayer: React.FC<Props> = ({ betaMoveConnectionKey }) => {
  const { itemWithKind, initialOffset, offsetDifference } = useDragLayer(
    (monitor) => ({
      itemWithKind: getItemWithKind(monitor),
      initialOffset: monitor.getInitialSourceClientOffset(),
      offsetDifference: monitor.getDifferenceFromInitialOffset(),
    })
  );

  // Should be truthy iff dragging
  if (!initialOffset || !offsetDifference) {
    return null;
  }

  const offset = {
    x: initialOffset.x + offsetDifference.x,
    y: initialOffset.y + offsetDifference.y,
  };

  return (
    <Portal>
      <div style={layerStyles}>
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
          <BetaDetailsDragPreview
            betaMoveConnectionKey={betaMoveConnectionKey}
            itemWithKind={itemWithKind}
          />
        </div>
      </div>
    </Portal>
  );
};

/**
 * Drag-and-drop preview specific to the beta move list.
 */
const BetaDetailsDragPreview: React.FC<{
  betaMoveConnectionKey: BetaDetailsDragLayer_betaMoveNodeConnection$key;
  itemWithKind: DragItemWithKind;
}> = ({ betaMoveConnectionKey, itemWithKind }) => {
  const betaMoveConnection = useFragment(
    graphql`
      fragment BetaDetailsDragLayer_betaMoveNodeConnection on BetaMoveNodeConnection {
        edges {
          node {
            id
            ...BetaMoveListItem_betaMoveNode
          }
        }
      }
    `,
    betaMoveConnectionKey
  );

  switch (itemWithKind.kind) {
    case "listBetaMove": {
      const betaMove = findNode(
        betaMoveConnection,
        itemWithKind.item.betaMoveId
      );
      // If the user is dragging the move, it had better fucking be defined
      assertIsDefined(betaMove);
      return (
        <BetaMoveListItem
          betaMoveKey={betaMove}
          // Hacky translation: DnD uses the drag handle as the component
          // root, so the parent offset will align to that. We want to align
          // to the list item though (the parent of the drag handle), so we
          // need to apply a static offset to adjust. There's no way to attach
          // DnD to the list item itself, so this is the next best option.
          sx={{ transform: "translate(-16px, -12px)" }}
        />
      );
    }
    default:
      // Whatever item is being dragged, it isn't supported by this preview so
      // it's someone else's problem
      return null;
  }
};

export default BetaDetailsDragLayer;
