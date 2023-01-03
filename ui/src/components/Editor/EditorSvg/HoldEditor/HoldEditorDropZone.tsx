import { DropHandler, useDrop } from "components/Editor/util/dnd";
import { assertIsDefined } from "util/func";
import { useDOMToSVGPosition } from "components/Editor/util/svg";
import PanZone from "../PanZone";

interface Props extends Omit<React.ComponentProps<typeof PanZone>, "onDrop"> {
  onDrop?: DropHandler<"overlayHold" | "overlayBetaMove", "dropZone">;
}

/**
 * A layer to catch holds being dropped onto the editor. Uses PanZone underneath
 * to support panning in addition to the drops, since the two need to
 * coordinate on cursor events.
 */
const HoldEditorDropZone: React.FC<Props> = ({ onDrop, ...rest }) => {
  const domToSVGPosition = useDOMToSVGPosition();

  // Listen for holds being dropped
  const [, drop] = useDrop({
    accept: ["overlayHold", "overlayBetaMove"],
    // Tell the dragger where they airdropped to
    drop(item, monitor) {
      const mousePos = monitor.getClientOffset();
      assertIsDefined(mousePos);

      // Call provided drop handler, if given
      const result = {
        kind: "dropZone" as const,
        position: domToSVGPosition(mousePos),
      };
      if (onDrop) {
        onDrop(item, result, monitor);
      }

      return result;
    },
  });

  // We need to rely on the standard pan zone because we can't have more than
  // one element trying to capture clicks/drags across the entire screen. So
  // it will handle both sets of logic for us.
  return <PanZone ref={drop} {...rest} />;
};

export default HoldEditorDropZone;
