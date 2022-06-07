import React from "react";
import { useDrag } from "util/dnd";
import { styleDraggable, styleDragging } from "styles/svg";
import { graphql } from "relay-runtime";
import { useFragment } from "react-relay";
import { BetaChainLine_startBetaMoveNode$key } from "./__generated__/BetaChainLine_startBetaMoveNode.graphql";
import { BetaChainLine_endBetaMoveNode$key } from "./__generated__/BetaChainLine_endBetaMoveNode.graphql";
import MutationError from "components/common/MutationError";
import { BetaChainLine_insertBetaMoveMutation } from "./__generated__/BetaChainLine_insertBetaMoveMutation.graphql";
import { isDefined } from "util/func";
import useMutation from "util/useMutation";
import { useBetaMoveColors, useBetaMoveVisualPosition } from "util/svg";

interface Props {
  startMoveKey: BetaChainLine_startBetaMoveNode$key;
  endMoveKey: BetaChainLine_endBetaMoveNode$key;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainLine: React.FC<Props> = ({ startMoveKey, endMoveKey }) => {
  const startMove = useFragment(
    graphql`
      fragment BetaChainLine_startBetaMoveNode on BetaMoveNode {
        id
        bodyPart
      }
    `,
    startMoveKey
  );
  const endMove = useFragment(
    graphql`
      fragment BetaChainLine_endBetaMoveNode on BetaMoveNode {
        id
      }
    `,
    endMoveKey
  );

  const { commit: insertBetaMove, state: insertState } =
    useMutation<BetaChainLine_insertBetaMoveMutation>(graphql`
      mutation BetaChainLine_insertBetaMoveMutation(
        $input: InsertBetaMoveMutationInput!
      ) {
        insertBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);

  const [{ isDragging }, drag] = useDrag<
    "betaMoveOverlay",
    { isDragging: boolean }
  >({
    type: "betaMoveOverlay",
    item: {
      kind: "line",
      startMoveId: startMove.id,
      bodyPart: startMove.bodyPart,
    },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (isDefined(result)) {
        insertBetaMove({
          variables: {
            input: {
              previousBetaMoveId: startMove.id,
              holdId: result.holdId,
            },
          },
          // Punting on optimistic update because ordering is hard
        });
      }
    },
  });

  // Color is based on the end move
  const colors = useBetaMoveColors()(endMove.id);
  const getPosition = useBetaMoveVisualPosition();
  const startPos = getPosition(startMove.id);
  const endPos = getPosition(endMove.id);

  return (
    <>
      <line
        ref={drag}
        css={[
          { strokeWidth: 1.5 },
          styleDraggable,
          isDragging && styleDragging,
        ]}
        stroke={colors.primary}
        x1={startPos.x}
        y1={startPos.y}
        x2={endPos.x}
        y2={endPos.y}
      />
      <MutationError message="Error adding move" state={insertState} />
    </>
  );
};

export default BetaChainLine;
