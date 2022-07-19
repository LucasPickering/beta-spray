import React, { useRef } from "react";
import { useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../Positioned";
import HoldIcon from "./HoldIcon";
import { HoldMark_insertBetaMoveMutation } from "./__generated__/HoldMark_insertBetaMoveMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { HoldMark_appendBetaMoveMutation } from "./__generated__/HoldMark_appendBetaMoveMutation.graphql";
import { HoldMark_updateBetaMoveMutation } from "./__generated__/HoldMark_updateBetaMoveMutation.graphql";
import useMutation from "util/useMutation";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
}

/**
 * An editable hold, in the context of the full interface editor.
 */
const HoldMark: React.FC<Props> = ({ holdKey, onClick, onDoubleClick }) => {
  const ref = useRef<SVGCircleElement | null>(null);
  const hold = useFragment(
    graphql`
      fragment HoldMark_holdNode on HoldNode {
        id
        position {
          x
          y
        }
      }
    `,
    holdKey
  );

  // These mutations are all for modifying moves, since they get called when
  // a move is dropped *onto* this hold. At some point we may need to rip this
  // logic out to support holdless moves, but this works for now.
  // Append new move to end of the beta
  const { commit: appendBetaMove, state: appendState } =
    useMutation<HoldMark_appendBetaMoveMutation>(graphql`
      mutation HoldMark_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
      ) {
        appendBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  // Insert a new move into the middle of the beta
  const { commit: insertBetaMove, state: insertState } =
    useMutation<HoldMark_insertBetaMoveMutation>(graphql`
      mutation HoldMark_insertBetaMoveMutation(
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
  // Relocate an existing move
  const { commit: updateBetaMove, state: updateState } =
    useMutation<HoldMark_updateBetaMoveMutation>(graphql`
      mutation HoldMark_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            id
            # These are the only fields we modify
            hold {
              id
            }
          }
        }
      }
    `);

  // Drag this hold around, while editing holds
  const [{ isDragging }, drag] = useDrag<
    "holdOverlay",
    { isDragging: boolean }
  >({
    type: "holdOverlay",
    item: { action: "relocate", holdId: hold.id },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
  });

  // Drop *moves* onto this hold
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    accept: "betaMoveOverlay",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Apply mutation based on exactly what was dropped
    drop(item) {
      const holdId = hold.id;
      switch (item.action) {
        // Dragged a body part from the palette
        case "create":
          appendBetaMove({
            variables: {
              input: {
                betaId: item.betaId,
                bodyPart: item.bodyPart,
                holdId,
              },
            },
            // Punting on optimistic update because ordering is hard
            // We could hypothetically add this, but we'd need to pipe down
            // the total number of moves so we can do n+1 here
          });
          break;
        // Dragged a line between two moves (insert after the starting move)
        case "insertAfter":
          insertBetaMove({
            variables: {
              input: {
                previousBetaMoveId: item.betaMoveId,
                holdId,
              },
            },
            // Punting on optimistic update because ordering is hard
          });
          break;
        // Dragged an existing move
        case "relocate":
          updateBetaMove({
            variables: {
              input: { betaMoveId: item.betaMoveId, holdId },
            },
            optimisticResponse: {
              updateBetaMove: {
                betaMove: { id: item.betaMoveId, hold: { id: holdId } },
              },
            },
          });
      }

      return { kind: "hold", holdId };
    },
  });

  drag(drop(ref));
  return (
    <Positioned
      ref={ref}
      position={hold.position}
      onClick={onClick && (() => onClick(hold.id))}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
    >
      <HoldIcon draggable isDragging={isDragging} isOver={isOver} />

      <MutationErrorSnackbar message="Error adding move" state={appendState} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateState}
      />
      <MutationErrorSnackbar message="Error adding move" state={insertState} />
    </Positioned>
  );
};

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
