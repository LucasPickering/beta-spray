import React from "react";
import { graphql, useFragment } from "react-relay";
import { DragItemWithKind } from "util/dnd";
import { assertIsDefined } from "util/func";
import BetaMoveListItem from "./BetaMoveListItem";
import { BetaDetailsDragPreview_betaMoveNodeConnection$key } from "./__generated__/BetaDetailsDragPreview_betaMoveNodeConnection.graphql";

interface Props {
  betaMoveConnectionKey: BetaDetailsDragPreview_betaMoveNodeConnection$key;
  itemWithKind: DragItemWithKind;
}

/**
 * Drag-and-drop preview specific to the beta move list.
 */
const BetaDetailsDragPreview: React.FC<Props> = ({
  betaMoveConnectionKey,
  itemWithKind,
}) => {
  const betaMoveConnection = useFragment(
    graphql`
      fragment BetaDetailsDragPreview_betaMoveNodeConnection on BetaMoveNodeConnection {
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
    case "betaMoveList": {
      const betaMoveEdge = betaMoveConnection.edges.find(
        ({ node }) => node.id === itemWithKind.item.betaMoveId
      );
      // If the user is dragging the move, it had better fucking be defined
      assertIsDefined(betaMoveEdge);
      return (
        <BetaMoveListItem
          betaMoveKey={betaMoveEdge.node}
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

export default BetaDetailsDragPreview;
