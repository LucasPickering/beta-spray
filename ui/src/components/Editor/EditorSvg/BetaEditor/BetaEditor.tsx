import { assertIsDefined, findNode, groupBy, isDefined } from "util/func";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "util/queries";
import { withQuery } from "relay-query-wrapper";
import { graphql } from "relay-runtime";
import { useFragment } from "react-relay";
import { useContext, useMemo, useState } from "react";
import { BetaContext, EditorModeContext } from "components/Editor/util/context";
import { useLastMoveInStance, useStance } from "components/Editor/util/stance";
import { DragFinishHandler } from "components/Editor/util/dnd";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import {
  useBetaMoveColors,
  useBetaMoveVisualPositions,
} from "components/Editor/util/moves";
import useBetaMoveMutations from "components/Editor/util/useBetaMoveMutations";
import EditAnnotationDialog from "../EditAnnotationDialog";
import EditableFilter from "../EditableFilter";
import BetaMoveMark from "./BetaMoveMark";
import BetaChainLine from "./BetaChainLine";
import StickFigure from "./StickFigure";
import { BetaEditor_betaNode$key } from "./__generated__/BetaEditor_betaNode.graphql";

interface Props {
  betaKey: BetaEditor_betaNode$key;
}

/**
 * SVG overlay component for viewing and editing beta
 */
const BetaEditor: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaEditor_betaNode on BetaNode {
        permissions {
          canEdit
        }
        ...useBetaMoveMutations_betaNode
        moves {
          edges {
            node {
              id
              bodyPart
              annotation
              order
              ...BetaMoveMark_betaMoveNode
              ...BetaChainLine_startBetaMoveNode
              ...BetaChainLine_endBetaMoveNode
            }
          }
          ...moves_colors_betaMoveNodeConnection
          ...moves_visualPositions_betaMoveNodeConnection
          ...stance_betaMoveNodeConnection
        }
      }
    `,
    betaKey
  );

  // Just a little helper, since we access this a lot. Technically it's wasted
  // space since we never access this array directly, just map over it again,
  // but who cares code is for people.
  const moves = useMemo(
    () => beta.moves.edges.map((edge) => edge.node),
    [beta.moves.edges]
  );

  // Calculate some derived data based on the full list of moves.
  const movesByBodyPart = useMemo(
    // Group the moves by body part so we can draw chains. We assume the API
    // response is ordered by `order`, so these should naturally be as well.
    () => groupBy(moves, (move) => move.bodyPart),
    [moves]
  );

  // These are individually memoized. We may want to memoize them together too
  // to prevent re-renders in the context, requires profiling though
  const betaMoveColors = useBetaMoveColors(beta.moves);
  const betaMoveVisualPositions = useBetaMoveVisualPositions(beta.moves);

  const stance = useStance(beta.moves);
  const lastStanceMoveId = useLastMoveInStance();
  // The ID of the move whose annotation is being edited
  const [editingBetaMoveId, setEditingBetaMoveId] = useState<string>();
  const editingBetaMove = isDefined(editingBetaMoveId)
    ? findNode(beta.moves, editingBetaMoveId)
    : undefined;

  const [editorMode] = useContext(EditorModeContext);
  const isEditing = editorMode === "beta" && beta.permissions.canEdit;

  const {
    create: { callback: createBetaMove, state: createState },
    updateAnnotation: {
      callback: updateBetaMoveAnnotation,
      state: updateAnnotationState,
    },
    relocate: { callback: relocateBetaMove, state: relocateState },
    delete: { callback: deleteBetaMove, state: deleteState },
  } = useBetaMoveMutations(beta);

  const onDragFinish: DragFinishHandler<"overlayBetaMove"> = (
    item,
    dropResult
  ) => {
    switch (item.action) {
      // Insert the new move immediately after the current stance. If there
      // is no stance, that means this is the first move, so we'll just
      // insert anywhere
      case "create":
        return createBetaMove({
          previousBetaMoveId: lastStanceMoveId,
          bodyPart: item.bodyPart,
          dropResult,
        });
      case "relocate":
        // Relocate the dragged move
        return relocateBetaMove({
          betaMoveId: item.betaMoveId,
          dropResult,
        });
    }
  };

  return (
    <BetaContext.Provider value={{ betaMoveColors, betaMoveVisualPositions }}>
      {/* Draw lines to connect the moves. Do this *first* so they go on bottom */}
      {Array.from(movesByBodyPart.values(), (moveChain) =>
        moveChain.map((move, i) => {
          const prev = moveChain[i - 1];
          return prev ? (
            <BetaChainLine
              key={move.id}
              startMoveKey={prev}
              endMoveKey={move}
            />
          ) : null;
        })
      )}

      {/* This filter lets us easily modify the visuals of all beta editor
          components, based on current edit mode */}
      <EditableFilter kind="beta" isEditing={isEditing} />

      {/* Render body position. This will only show something if the user is
          hovering a move. We want this above the move lines, but below the
          move marks so it's not intrusive. */}
      <StickFigure
        betaMoveConnectionKey={beta.moves}
        editable={isEditing}
        onDragFinish={onDragFinish}
      />

      {/* Draw the actual move marks. We want to render the highlighted move
          on top, which we can only do in SVG via ordering, so we need to make
          sure that's rendered last */}
      {moves.map((move) => (
        <BetaMoveMark
          key={move.id}
          betaMoveKey={move}
          isInCurrentStance={stance[move.bodyPart] === move.id}
          editable={isEditing}
          onEditAnnotation={(betaMoveId) => setEditingBetaMoveId(betaMoveId)}
          onDelete={(betaMoveId) => deleteBetaMove({ betaMoveId })}
          onDragFinish={onDragFinish}
        />
      ))}

      <EditAnnotationDialog
        title={`Edit Notes for Move #${editingBetaMove?.order ?? ""}`}
        open={Boolean(editingBetaMoveId)}
        annotation={editingBetaMove?.annotation}
        mutationState={updateAnnotationState}
        onSave={(annotation) => {
          // This shouldn't be callable while no beta move is being edited
          assertIsDefined(editingBetaMoveId);
          updateBetaMoveAnnotation({
            betaMoveId: editingBetaMoveId,
            annotation,
          });
        }}
        onClose={() => setEditingBetaMoveId(undefined)}
      />

      <MutationErrorSnackbar message="Error adding move" state={createState} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateAnnotationState}
      />
      <MutationErrorSnackbar
        message="Error updating move"
        state={relocateState}
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
  // This is rendered on top of the existing editor, so we don't want to block
  // anything while beta is loading
  fallbackElement: null,
})(BetaEditor);
