import { Portal } from "@mui/material";
import { getItemWithKind, useDragLayer } from "components/Editor/util/dnd";
import BetaDetailsDragPreview from "./BetaDetailsDragPreview";
import { BetaDetailsDragPreview_betaMoveNodeConnection$key } from "./__generated__/BetaDetailsDragPreview_betaMoveNodeConnection.graphql";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

interface Props {
  betaMoveConnectionKey: BetaDetailsDragPreview_betaMoveNodeConnection$key;
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

export default BetaDetailsDragLayer;
