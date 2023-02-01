import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { DragFinishHandler } from "components/Editor/util/dnd";
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
            position {
              x
              y
            }
          }
        }
      }
    `);

  const onHoldDragFinish: DragFinishHandler<"overlayHold", "dropZone"> = (
    item,
    result
  ) => {
    const position = result.position;
    updateHold({
      variables: {
        input: { holdId: item.holdId, position },
      },
      optimisticResponse: {
        updateHold: { hold: { id: item.holdId, position } },
      },
    });
  };

  return (
    <>
      {/* Invisible layer to capture holds/moves being dropped */}
      <HoldEditorDropZone />

      {/* Holds goes on top of the drop zones so they're clickable */}
      {problem.holds.edges.map(({ node }) => (
        <HoldMark
          key={node.id}
          holdKey={node}
          onDragFinish={onHoldDragFinish}
        />
      ))}

      <MutationErrorSnackbar
        message="Error moving hold"
        state={updateHoldState}
      />
    </>
  );
};

export default HoldEditor;
