import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useFragment } from "react-relay";
import { generateUniqueClientID, graphql } from "relay-runtime";
import useMutation from "util/useMutation";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import HoldMark from "./HoldMark";
import { useEditorMode } from "components/Editor/util/mode";
import PanZone from "../PanZone";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { DragFinishHandler } from "components/Editor/util/dnd";
import { useState } from "react";
import EditAnnotationDialog from "../EditAnnotationDialog";
import { assertIsDefined, findNode } from "util/func";
import { HoldEditor_updateHoldPositionMutation } from "./__generated__/HoldEditor_updateHoldPositionMutation.graphql";
import { HoldEditor_updateHoldAnnotationMutation } from "./__generated__/HoldEditor_updateHoldAnnotationMutation.graphql";
import { useDOMToSVGPosition } from "components/Editor/util/svg";

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
        permissions {
          canEdit
        }
        boulder {
          id
        }
        holds {
          __id
          edges {
            node {
              id
              annotation
              ...HoldMark_holdNode
            }
          }
        }
      }
    `,
    problemKey
  );

  const { commit: createHold, state: createState } =
    useMutation<HoldEditor_createHoldMutation>(graphql`
      mutation HoldEditor_createHoldMutation(
        $input: CreateHoldInput!
        $connections: [ID!]!
      ) @raw_response_type {
        createHold(input: $input)
          @appendNode(connections: $connections, edgeTypeName: "HoldNodeEdge") {
          id
          ...HoldMark_holdNode
        }
      }
    `);
  // Two different update mutations, to simplify optimistic responses
  const { commit: updateHoldAnnotation, state: updateAnnotationState } =
    useMutation<HoldEditor_updateHoldAnnotationMutation>(graphql`
      mutation HoldEditor_updateHoldAnnotationMutation($input: UpdateHoldInput!)
      @raw_response_type {
        updateHold(input: $input) {
          id
          annotation
        }
      }
    `);
  const { commit: updateHoldPosition, state: updatePositionState } =
    useMutation<HoldEditor_updateHoldPositionMutation>(graphql`
      mutation HoldEditor_updateHoldPositionMutation($input: UpdateHoldInput!)
      @raw_response_type {
        updateHold(input: $input) {
          id
          position {
            x
            y
          }
        }
      }
    `);
  const { commit: deleteHold, state: deleteState } =
    useMutation<HoldEditor_deleteHoldMutation>(graphql`
      mutation HoldEditor_deleteHoldMutation(
        $input: NodeInput!
        $connections: [ID!]!
      ) @raw_response_type {
        deleteHold(input: $input) {
          id @deleteEdge(connections: $connections) @deleteRecord
        }
      }
    `);

  // The ID of the hold whose annotation is being edited
  const [editingHoldId, setEditingHoldId] = useState<string>();
  const { editorMode } = useEditorMode();
  const domToSVGPosition = useDOMToSVGPosition();

  // Each of these callbacks will only be defined if it's actually applicable.
  // This allows the consumer to show proper visual feedback based on the
  // available actions.
  const onClickZone = (() => {
    if (problem.permissions.canEdit && editorMode === "hold") {
      return (e: React.MouseEvent) => {
        // Create a new hold at the clicked location
        const position = domToSVGPosition({ x: e.clientX, y: e.clientY });
        createHold({
          variables: {
            input: { problem: problem.id, position },
            connections: [problem.holds.__id],
          },
          optimisticResponse: {
            createHold: {
              id: generateUniqueClientID(),
              annotation: "",
              position,
            },
          },
        });
      };
    }
    return undefined;
  })();
  const onDragFinish = ((): DragFinishHandler<"overlayHold"> | undefined => {
    if (problem.permissions.canEdit && editorMode === "hold") {
      return (item, result) => {
        const position = result.position;
        updateHoldPosition({
          variables: { input: { id: item.holdId, position } },
          optimisticResponse: { updateHold: { id: item.holdId, position } },
        });
      };
    }
    return undefined;
  })();

  return (
    <>
      {/* Invisible layer to capture SVG panning, as well as holds/moves
          being dropped and clicks for adding holds */}
      {/* TODO explain why this is here */}
      <PanZone onClick={onClickZone} />

      {/* Holds goes on top of the drop zones so they're clickable */}
      {problem.holds.edges.map(({ node }) => (
        <HoldMark
          key={node.id}
          holdKey={node}
          editable={editorMode === "hold"}
          onEditAnnotation={(holdId) => setEditingHoldId(holdId)}
          onDelete={(holdId) =>
            deleteHold({
              variables: {
                input: { id: holdId },
                connections: [problem.holds.__id],
              },
              optimisticResponse: {
                deleteHold: { id: holdId },
              },
            })
          }
          onDragFinish={onDragFinish}
        />
      ))}

      <EditAnnotationDialog
        title="Edit Notes for Hold"
        open={Boolean(editingHoldId)}
        annotation={
          editingHoldId && findNode(problem.holds, editingHoldId)?.annotation
        }
        onSave={(annotation) => {
          // This shouldn't be callable while no hold is being edited
          assertIsDefined(editingHoldId);
          updateHoldAnnotation({
            variables: { input: { id: editingHoldId, annotation } },
            optimisticResponse: {
              updateHold: { id: editingHoldId, annotation },
            },
          });
        }}
        onClose={() => setEditingHoldId(undefined)}
      />

      <MutationErrorSnackbar message="Error adding hold" state={createState} />
      <MutationErrorSnackbar
        message="Error updating hold"
        state={updateAnnotationState}
      />
      <MutationErrorSnackbar
        message="Error updating hold"
        state={updatePositionState}
      />
      <MutationErrorSnackbar
        message="Error deleting hold"
        state={deleteState}
      />
    </>
  );
};

export default HoldEditor;
