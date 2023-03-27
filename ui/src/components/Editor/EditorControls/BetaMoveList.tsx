import { List, Typography } from "@mui/material";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useState, useMemo, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { isDefined, findNodeIndex, moveArrayElement } from "util/func";
import useMutation from "util/useMutation";
import { deleteBetaMoveLocal, reorderBetaMoveLocal } from "../util/moves";
import {
  useStance,
  useStickFigureColor as useStanceColor,
} from "../util/stance";
import BetaDetailsDragLayer from "./BetaDetailsDragLayer";
import BetaMoveListItemSmart from "./BetaMoveListItemSmart";
import { BetaMoveList_betaNode$key } from "./__generated__/BetaMoveList_betaNode.graphql";
import { BetaMoveList_deleteBetaMoveMutation } from "./__generated__/BetaMoveList_deleteBetaMoveMutation.graphql";
import { BetaMoveList_updateBetaMoveMutation } from "./__generated__/BetaMoveList_updateBetaMoveMutation.graphql";
import { DragItem } from "../util/dnd";

interface Props {
  betaKey: BetaMoveList_betaNode$key;
}

/**
 * A list of all moves in a beta, to be shown in the sidebar. This needs to be
 * a child of BetaDetails so we can access the BetaContext here.
 */
const BetaMoveList: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaMoveList_betaNode on BetaNode {
        id
        permissions {
          canEdit
        }
        moves {
          ...BetaDetailsDragPreview_betaMoveNodeConnection
          ...stance_betaMoveNodeConnection
          edges {
            node {
              id
              order
              isStart
              bodyPart
              ...BetaMoveListItemSmart_betaMoveNode
            }
          }
        }
      }
    `,
    betaKey
  );

  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaMoveList_updateBetaMoveMutation>(graphql`
      mutation BetaMoveList_updateBetaMoveMutation($input: UpdateBetaMoveInput!)
      @raw_response_type {
        updateBetaMove(input: $input) {
          beta {
            # Refetch all moves to get the new ordering
            moves {
              edges {
                node {
                  id
                  order
                  isStart
                }
              }
            }
          }
        }
      }
    `);
  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaMoveList_deleteBetaMoveMutation>(graphql`
      mutation BetaMoveList_deleteBetaMoveMutation($input: NodeInput!)
      @raw_response_type {
        deleteBetaMove(input: $input) {
          beta {
            # Refetch all moves to get the new ordering
            moves {
              edges {
                node {
                  id
                  order
                  isStart
                }
              }
            }
          }
        }
      }
    `);

  // When reordering moves, we need to track temporary state of where the
  // dragged move is. We'll use this to reorder the moves locally. Once the
  // move is dropped, we'll persist changes to the DB
  const [draggingMove, setDraggingMove] = useState<{
    // Move being dragged
    id: string;
    // *Current* index, which changes as we drag around
    index: number;
  }>();

  // Whenever the beta updates from the API, clear dragging state
  useEffect(() => {
    setDraggingMove(undefined);
  }, [beta.moves.edges]);

  // Calculate a local copy of the moves. This only differs if we're dragging,
  // in which case we'll reorder the moves to match the current drag state
  const moves = useMemo(() => {
    const moves = beta.moves.edges.map(({ node }) => node);
    if (isDefined(draggingMove)) {
      const oldIndex = findNodeIndex(beta.moves, draggingMove.id);
      if (oldIndex >= 0) {
        moveArrayElement(moves, oldIndex, draggingMove.index);
      }
    }
    return moves;
  }, [beta.moves, draggingMove]);

  const stance = useStance(beta.moves);
  // Calculate this here, otherwise each move would have to re-calculate the stance
  const stickFigureColor = useStanceColor(stance);

  const onReorder = (
    dragItem: DragItem<"listBetaMove">,
    newIndex: number
  ): void => {
    // This is called on the *hovered* move, so the passed item is
    // the one being dragged
    setDraggingMove({ id: dragItem.betaMoveId, index: newIndex });
  };
  const onDrop = (item: DragItem<"listBetaMove">): void => {
    if (item) {
      // The index field was modified during dragging, but
      // index is 0-based and order is 1-based, so we need to
      // convert now. The API will take care of sliding the
      // other moves up/down to fit this one in
      const newOrder = item.index + 1;
      updateBetaMove({
        variables: {
          input: {
            id: item.betaMoveId,
            order: newOrder,
          },
        },
        optimisticResponse: {
          updateBetaMove: {
            id: item.betaMoveId,
            beta: {
              id: beta.id,
              moves: reorderBetaMoveLocal(
                beta.moves,
                item.betaMoveId,
                newOrder
              ),
            },
          },
        },
      });
    }
    setDraggingMove(undefined);
  };
  const onDelete = (betaMoveId: string): void => {
    deleteBetaMove({
      variables: {
        input: { id: betaMoveId },
      },
      optimisticResponse: {
        deleteBetaMove: {
          id: betaMoveId,
          beta: {
            id: beta.id,
            moves: deleteBetaMoveLocal(beta.moves, betaMoveId),
          },
        },
      },
    });
  };

  const {
    permissions: { canEdit },
  } = beta;
  return (
    <List component="ol">
      {!canEdit && (
        <Typography variant="body2" paddingBottom={1}>
          You cannot edit this beta. To share your own, make a copy.
        </Typography>
      )}

      {canEdit && moves.length === 0 && (
        <Typography variant="body2">
          Drag a hand or foot to add a move
        </Typography>
      )}

      {moves.map((node, moveIndex) => (
        <BetaMoveListItemSmart
          key={node.id}
          betaMoveKey={node}
          index={moveIndex}
          stanceColor={
            stance[node.bodyPart] === node.id ? stickFigureColor : undefined
          }
          // We need to disable both onReorder and onDrop to get the child to
          // hide its drag handle
          onReorder={canEdit ? onReorder : undefined}
          onDrop={canEdit ? onDrop : undefined}
          onDelete={canEdit ? () => onDelete(node.id) : undefined}
        />
      ))}

      <BetaDetailsDragLayer betaMoveConnectionKey={beta.moves} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateState}
      />
      <MutationErrorSnackbar
        message="Error deleting move"
        state={deleteState}
      />
    </List>
  );
};

export default BetaMoveList;
