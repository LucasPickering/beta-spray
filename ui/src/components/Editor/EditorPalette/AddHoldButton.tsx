import HoldIcon, { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { AddHoldButton_createHoldMutation } from "./__generated__/AddHoldButton_createHoldMutation.graphql";
import { graphql, useFragment } from "react-relay";
import useMutation from "util/useMutation";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { AddHoldButton_problemNode$key } from "./__generated__/AddHoldButton_problemNode.graphql";
import { problemQuery } from "../../../util/queries";
import { useHighlight } from "../util/highlight";
import { isDefined } from "util/func";
import { useTheme } from "@mui/material";
import { EditorVisibilityContext } from "../util/context";
import { useContext } from "react";

interface Props {
  problemKey: AddHoldButton_problemNode$key;
}

/**
 * A button to add a hold to a random location on the boulder.
 */
const AddHoldButton: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment AddHoldButton_problemNode on ProblemNode {
        id
        permissions {
          canEdit
        }
        boulder {
          id
        }
        holds {
          __id
        }
      }
    `,
    problemKey
  );

  const { commit: createHold, state: createHoldState } =
    useMutation<AddHoldButton_createHoldMutation>(graphql`
      mutation AddHoldButton_createHoldMutation(
        $input: CreateHoldInput!
        $connections: [ID!]!
      ) {
        createHold(input: $input)
          @appendNode(connections: $connections, edgeTypeName: "HoldNodeEdge") {
          id
          ...HoldMark_holdNode
        }
      }
    `);

  const [visibility] = useContext(EditorVisibilityContext);
  const [, highlightHold] = useHighlight("hold");
  const hasPermission = problem.permissions.canEdit;

  return (
    <>
      <AddHoldButtonContent
        disabled={!visibility || !hasPermission}
        disabledTitle={
          !hasPermission
            ? "You don't have permission to edit this problem"
            : "You can't add holds while the overlay is disabled"
        }
        onClick={() => {
          createHold({
            variables: {
              // Let the API pick a random position
              input: { problem: problem.id },
              // We only need to add to the problem holds here, because the
              // boulder holds aren't accessed directly in the UI
              connections: [problem.holds.__id],
            },
            // Can't do an optimistic response here since the position will be
            // random
            onCompleted(result) {
              // Highlight the new hold
              if (isDefined(result.createHold)) {
                highlightHold(result.createHold.id);
              }
            },
          });
        }}
      />

      <MutationErrorSnackbar
        message="Error creating hold"
        state={createHoldState}
      />
    </>
  );
};

/**
 * Inner component, for live and fallback purposes
 */
const AddHoldButtonContent: React.FC<
  Omit<React.ComponentProps<typeof TooltipIconButton>, "title">
> = (props) => (
  <TooltipIconButton title="Add Hold" {...props}>
    <AddHoldIcon />
  </TooltipIconButton>
);

/**
 * Hold icon with a friendly little "+"
 */
const AddHoldIcon: React.FC<React.ComponentProps<typeof HoldIcon>> = (
  props
) => {
  const { palette } = useTheme();
  const lineProps = { stroke: palette.success.main, strokeWidth: 0.2 };
  const x = 0.5;
  const y = -0.5;
  const size = 0.7;
  return (
    <HoldIconWrapped {...props}>
      <line x1={x - size} y1={y} x2={x + size} y2={y} {...lineProps} />
      <line x1={x} y1={y - size} x2={x} y2={y + size} {...lineProps} />
    </HoldIconWrapped>
  );
};

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <AddHoldButtonContent disabled />,
})(AddHoldButton);
