import { Portal } from "@mui/material";
import React from "react";
import { XYCoord } from "react-dnd";
import { DragItemWithKind, DragKind, useDragLayer } from "util/dnd";
import useOverlayUtils from "util/useOverlayUtils";
import DragPreview from "./DragPreview";
import Positioned from "./Positioned";

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
  mode: "html" | "svg";
}

const DragLayer: React.FC<Props> = ({ mode }) => {
  const {
    itemType,
    isDragging,
    item,
    initialOffset,
    currentOffset,
    offsetDifference,
  } = useDragLayer((monitor) => ({
    itemType: monitor.getItemType(),
    item: monitor.getItem(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getClientOffset(),
    offsetDifference: monitor.getDifferenceFromInitialOffset(),
    isDragging: monitor.isDragging(),
  }));

  // These should all be truthy at the same time, but check all 3 to convince TS
  if (
    !isDragging ||
    !itemType ||
    !initialOffset ||
    !currentOffset ||
    !offsetDifference
  ) {
    return null;
  }

  // Type hack here. *We* know that itemType corresponds to the `kind`
  // field of DragType, and the type of `item` will match the
  // corresponding kind, but there's no way to pass that info through
  // dnd. We *could* do a type guard here to safety check, but it's
  // easier just to trust that the data went in correctly.
  const itemWithKind = { kind: itemType as DragKind, item } as DragItemWithKind;

  if (mode === "html") {
    return (
      <HtmlDragLayer
        itemWithKind={itemWithKind}
        initialOffset={initialOffset}
        currentOffset={currentOffset}
        offsetDifference={offsetDifference}
      />
    );
  }

  return (
    <SvgDragLayer
      itemWithKind={itemWithKind}
      initialOffset={initialOffset}
      currentOffset={currentOffset}
      offsetDifference={offsetDifference}
    />
  );
};

// Use some internal components here so we can break out hook usage
interface InnerProps {
  itemWithKind: DragItemWithKind;
  initialOffset: XYCoord;
  currentOffset: XYCoord;
  offsetDifference: XYCoord;
}

const HtmlDragLayer: React.FC<InnerProps> = ({
  itemWithKind,
  initialOffset,
  offsetDifference,
}) => {
  const offset = {
    x: initialOffset.x + offsetDifference.x,
    y: initialOffset.y + offsetDifference.y,
  };
  return (
    <Portal>
      <div style={layerStyles}>
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
          <DragPreview mode="html" itemWithKind={itemWithKind} />
        </div>
      </div>
    </Portal>
  );
};

const SvgDragLayer: React.FC<InnerProps> = ({
  itemWithKind,
  currentOffset,
}) => {
  const { toSvgPosition } = useOverlayUtils();

  // Translate coords from DOM to SVG, then shift the preview
  return (
    <Positioned position={toSvgPosition(currentOffset)}>
      <DragPreview mode="svg" itemWithKind={itemWithKind} />;
    </Positioned>
  );
};

export default DragLayer;
