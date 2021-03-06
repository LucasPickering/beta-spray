import React, { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import BetaDetailsMove from "./BetaDetailsMove";
import {
  BetaDetails_betaNode$data,
  BetaDetails_betaNode$key,
} from "./__generated__/BetaDetails_betaNode.graphql";
import { BetaDetails_deleteBetaMoveMutation } from "./__generated__/BetaDetails_deleteBetaMoveMutation.graphql";
import { FormLabel, List, Skeleton, Typography } from "@mui/material";
import { moveArrayElement } from "util/func";
import { BetaDetails_updateBetaMoveMutation } from "./__generated__/BetaDetails_updateBetaMoveMutation.graphql";
import { BetaContext } from "util/context";
import useMutation from "util/useMutation";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "../queries";
import withQuery from "util/withQuery";
import { getBetaMoveColors } from "util/svg";
import BetaDetailsDragLayer from "./BetaDetailsDragLayer";

interface Props {
  betaKey: BetaDetails_betaNode$key;
}

type BetaMove = BetaDetails_betaNode$data["moves"]["edges"][0]["node"];

const BetaDetails: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        id
        moves {
          ...BetaDetailsDragPreview_betaMoveNodeConnection
          edges {
            node {
              id
              order
              isStart
              ...BetaDetailsMove_betaMoveNode
            }
          }
        }
      }
    `,
    betaKey
  );

  // Track moves in internal state so we can reorder them without constantly
  // saving to the API. We'll reorder on hover, then persist on drop.
  const [moves, setMoves] = useState<BetaMove[]>(() =>
    beta.moves.edges.map(({ node }) => node)
  );

  // Whenever the beta updates from the API, refresh the local state to match
  useEffect(() => {
    setMoves(beta.moves.edges.map(({ node }) => node));
  }, [beta.moves.edges]);

  const betaContextValue = useMemo(
    () => ({
      // Calculate color for each move
      betaMoveColors: getBetaMoveColors(
        beta.moves.edges.map(({ node }) => node)
      ),
      // We don't need positions in this list, so leave this empty. If we try
      // to access it within this tree, it'll just trigger an error
      betaMoveVisualPositions: new Map(),
    }),
    [beta.moves.edges]
  );

  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaDetails_updateBetaMoveMutation>(graphql`
      mutation BetaDetails_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaEditor_betaNode
              ...BetaDetails_betaNode
            }
          }
        }
      }
    `);

  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaDetails_deleteBetaMoveMutation>(graphql`
      mutation BetaDetails_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaEditor_betaNode
              ...BetaDetails_betaNode
            }
          }
        }
      }
    `);

  return (
    <BetaContext.Provider value={betaContextValue}>
      <div>
        <FormLabel component="span">Moves</FormLabel>

        {moves.length === 0 && (
          <Typography variant="body2">
            Drag a move from the palette to add
          </Typography>
        )}

        <List component="ol">
          {moves.map((node, moveIndex) => (
            <BetaDetailsMove
              key={node.id}
              betaMoveKey={node}
              index={moveIndex}
              totalMoves={moves.length} // Needed to colorize moves
              onReorder={(dragItem, newIndex) => {
                // This is called on the *hovered* move, so the passed item is
                // the one being dragged
                // IMPORTANT: We need to store this value *outside* the lambda
                // below, because the caller of this function is going to mutate
                // the dragItem object to update the index value. This is an
                // unfortunate necessity to prevent flickering in the UI, but it
                // means that if we don't capture this value now, then by the
                // time the state setter executes, `dragItem` will be mutated
                // with the new index and we won't end up swapping anything.
                const oldIndex = dragItem.index;
                setMoves((oldMoves) =>
                  moveArrayElement(oldMoves, oldIndex, newIndex)
                );
              }}
              onDrop={(item) => {
                if (item) {
                  updateBetaMove({
                    variables: {
                      input: {
                        betaMoveId: item.betaMoveId,
                        // The index field was modified during dragging, but
                        // index is 0-based and order is 1-based, so we need to
                        // convert now. The API will take care of sliding the
                        // other moves up/down to fit this one in
                        order: item.index + 1,
                      },
                    },
                    // Punting on optimistic update because it's complicated
                  });
                }
              }}
              onDelete={() =>
                deleteBetaMove({
                  variables: {
                    input: { betaMoveId: node.id },
                  },
                  // Punting on optimistic update because it's complicated
                })
              }
            />
          ))}
        </List>
      </div>

      <BetaDetailsDragLayer betaMoveConnectionKey={beta.moves} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateState}
      />
      <MutationErrorSnackbar
        message="Error deleting move"
        state={deleteState}
      />
    </BetaContext.Provider>
  );
};

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: <Skeleton variant="rectangular" height={240} />,
})(BetaDetails);
