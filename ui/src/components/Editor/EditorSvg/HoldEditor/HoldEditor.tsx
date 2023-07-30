import useMutation from "util/useMutation";
import { assertIsDefined, findNode } from "util/func";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useFragment } from "react-relay";
import { generateUniqueClientID, graphql } from "relay-runtime";
import { DragFinishHandler } from "components/Editor/util/dnd";
import { useContext, useEffect, useState } from "react";
import {
  HoldKind,
  OverlayPosition,
  allHoldKinds,
  formatHoldKind,
  useDOMToSVGPosition,
} from "components/Editor/util/svg";
import { EditorModeContext } from "components/Editor/util/context";
import { ClickAwayListener, useTheme } from "@mui/material";
import PanZone from "../PanZone";
import EditableFilter from "../EditableFilter";
import ActionOrbs from "../common/ActionOrbs";
import ActionOrb from "../common/ActionOrb";
import Positioned from "../common/Positioned";
import EditHoldDialog from "../EditHoldDialog";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import HoldMark from "./HoldMark";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_updateHoldPositionMutation } from "./__generated__/HoldEditor_updateHoldPositionMutation.graphql";
import { HoldEditor_updateMetadataMutation } from "./__generated__/HoldEditor_updateMetadataMutation.graphql";
import { HoldIconWrapped } from "./HoldIcon";

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
              ...HoldMark_holdNode
              ...EditHoldDialog_holdNode
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
  const { commit: updateMetadata, state: updateMetadataState } =
    useMutation<HoldEditor_updateMetadataMutation>(graphql`
      mutation HoldEditor_updateMetadataMutation($input: UpdateHoldInput!)
      @raw_response_type {
        updateHold(input: $input) {
          id
          kind
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

  const { palette } = useTheme();
  const domToSVGPosition = useDOMToSVGPosition();

  // The ID of the hold whose annotation is being edited
  const [editingHoldId, setEditingHoldId] = useState<string>();
  // Track when the user clicks, to show the "Add Hold" interaction
  const [addingHoldPosition, setAddingHoldPosition] =
    useState<OverlayPosition>();

  // This implicitly works as a permission check, since we can't enter editor
  // mode without permission
  const [editorMode] = useContext(EditorModeContext);
  const isEditing = editorMode === "holds" && problem.permissions.canEdit;

  // Stop adding a hold if we change modes
  useEffect(() => {
    if (!isEditing) {
      setAddingHoldPosition(undefined);
    }
  }, [isEditing]);

  const createHoldWithKind = (kind: HoldKind): void => {
    const position = addingHoldPosition;
    // This shouldn't be callable if click position isn't defined
    assertIsDefined(position);
    createHold({
      variables: {
        input: { problem: problem.id, position, kind },
        connections: [problem.holds.__id],
      },
      optimisticResponse: {
        createHold: {
          id: generateUniqueClientID(),
          kind,
          annotation: "",
          position,
        },
      },
    });
    setAddingHoldPosition(undefined);
  };
  const onClickZone = isEditing
    ? (e: React.MouseEvent) =>
        setAddingHoldPosition(domToSVGPosition({ x: e.clientX, y: e.clientY }))
    : undefined;
  const onDragFinish: DragFinishHandler<"overlayHold"> = (item, result) => {
    const position = result.position;
    updateHoldPosition({
      variables: { input: { id: item.holdId, position } },
      optimisticResponse: { updateHold: { id: item.holdId, position } },
    });
  };

  return (
    <>
      <EditableFilter kind="hold" isEditing={isEditing} />
      {/* Invisible layer to capture SVG panning, as well as holds/moves
          being dropped and clicks for adding holds. This has to be a child
          here so we can pass the onClick. */}
      <PanZone onClick={onClickZone} />

      {/* Holds goes on top of the drop zones so they're clickable */}
      {problem.holds.edges.map(({ node }) => (
        <HoldMark
          key={node.id}
          holdKey={node}
          editable={isEditing}
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

      {addingHoldPosition && (
        <ClickAwayListener onClickAway={() => setAddingHoldPosition(undefined)}>
          <Positioned position={addingHoldPosition}>
            {/* TODO add icon in the center here */}
            <ActionOrbs open>
              {allHoldKinds.map((kind) => (
                <ActionOrb
                  key={kind}
                  color={palette.editor.actions.create.main}
                  title={formatHoldKind(kind)}
                  onClick={() => createHoldWithKind(kind)}
                >
                  <HoldIconWrapped kind={kind} />
                </ActionOrb>
              ))}
            </ActionOrbs>
          </Positioned>
        </ClickAwayListener>
      )}

      <EditHoldDialog
        holdKey={
          (editingHoldId && findNode(problem.holds, editingHoldId)) || null
        }
        open={Boolean(editingHoldId)}
        mutationState={updateMetadataState}
        onSave={({ kind, annotation }) => {
          // This shouldn't be callable while no hold is being edited
          assertIsDefined(editingHoldId);
          updateMetadata({
            variables: { input: { id: editingHoldId, kind, annotation } },
            optimisticResponse: {
              updateHold: { id: editingHoldId, kind, annotation },
            },
          });
        }}
        onClose={() => setEditingHoldId(undefined)}
      />

      <MutationErrorSnackbar message="Error adding hold" state={createState} />
      <MutationErrorSnackbar
        message="Error updating hold"
        state={updateMetadataState}
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
