import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { DropHandler, getItemWithKind } from "components/Editor/util/dnd";
import useMutation from "util/useMutation";
import HoldEditorDropZone from "./HoldEditorDropZone";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import { HoldEditor_updateHoldMutation } from "./__generated__/HoldEditor_updateHoldMutation.graphql";
import HoldMark from "./HoldMark";

interface Props {
  problemKey: HoldEditor_problemNode$key;
}

/**
 * A smart component for editing holds in an image or problem.
 */
const HoldEditor: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment HoldEditor_problemNode on ProblemNode {
        id
        boulder {
          id
        }
        holds {
          __id
          edges {
            node {
              id
              ...HoldMark_holdNode
            }
          }
        }
      }
    `,
    problemKey
  );

  const { commit: updateHold, state: updateHoldState } =
    useMutation<HoldEditor_updateHoldMutation>(graphql`
      mutation HoldEditor_updateHoldMutation($input: UpdateHoldMutationInput!) {
        updateHold(input: $input) {
          hold {
            id # So relay knows how to update this node locally
            ...HoldMark_holdNode
          }
        }
      }
    `);

  /**
   * Callback when a dnd item is dropped on the drop zone (which covers the
   * whole image). The drop item can be a hold OR a move (in which case the move
   * is free).
   */
  const onDropZoneDrop: DropHandler<
    "overlayHold" | "overlayBetaMove",
    "dropZone"
  > = (_, result, monitor) => {
    const itemWithKind = getItemWithKind<"overlayHold" | "overlayBetaMove">(
      monitor
    );

    // Moves can also get dropped on the drop zone, but those get handled on
    // the drag side
    if (itemWithKind.kind === "overlayHold") {
      const item = itemWithKind.item;
      const position = result.position;
      // Apply mutation based on what type of hold was being dragged - existing or new?
      switch (item.action) {
        case "relocate":
          updateHold({
            variables: {
              input: { holdId: item.holdId, position },
            },
            optimisticResponse: {
              updateHold: { hold: { id: item.holdId, position } },
            },
          });
          break;
      }
    }
  };

  return (
    <>
      {/* Invisible layer to capture holds being dropped */}
      <HoldEditorDropZone onDrop={onDropZoneDrop} />

      {/* Holds goes on top of the drop zones so they're clickable */}
      {problem.holds.edges.map(({ node }) => (
        <HoldMark key={node.id} holdKey={node} />
      ))}

      <MutationErrorSnackbar
        message="Error moving hold"
        state={updateHoldState}
      />
    </>
  );
};

export default HoldEditor;
