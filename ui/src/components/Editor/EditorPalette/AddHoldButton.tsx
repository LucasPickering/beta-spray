import HoldIcon, { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { AddHoldButton_createHoldMutation } from "./__generated__/AddHoldButton_createHoldMutation.graphql";
import { graphql, useFragment } from "react-relay";
import useMutation from "util/useMutation";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { AddHoldButton_problemNode$key } from "./__generated__/AddHoldButton_problemNode.graphql";
import { problemQuery } from "../queries";
import { useHighlight } from "../util/highlight";
import { isDefined } from "util/func";
import { IconButtonProps, useTheme } from "@mui/material";

interface Props {
  problemKey: AddHoldButton_problemNode$key;
  disabled?: boolean;
}

/**
 * A button to add a hold to a random location on the boulder.
 */
const AddHoldButton: React.FC<Props> = ({ problemKey, disabled = false }) => {
  const problem = useFragment(
    graphql`
      fragment AddHoldButton_problemNode on ProblemNode {
        id
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
        $input: CreateHoldMutationInput!
        $connections: [ID!]!
      ) {
        createHold(input: $input) {
          hold
            @appendNode(
              connections: $connections
              edgeTypeName: "HoldNodeEdge"
            ) {
            id
            ...HoldMark_holdNode
          }
        }
      }
    `);

  const [, highlightHold] = useHighlight("hold");

  return (
    <>
      <AddHoldButtonContent
        disabled={disabled}
        onClick={() => {
          createHold({
            variables: {
              input: {
                boulderId: problem.boulder.id,
                problemId: problem.id,
                // Let the API pick a random position
              },
              // We only need to add to the problem holds here, because the
              // boulder holds aren't accessed directly in the UI
              connections: [problem.holds.__id],
            },
            // Can't do an optimistic response here since the position will be
            // random
            onCompleted(result) {
              // Highlight the new hold
              if (isDefined(result.createHold)) {
                highlightHold(result.createHold.hold.id);
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
const AddHoldButtonContent: React.FC<IconButtonProps> = (props) => (
  // TODO fix disabled styles
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
  return (
    <HoldIconWrapped {...props}>
      <text
        fill={palette.success.main}
        strokeWidth={0}
        fontSize={14}
        x={-1}
        y={1}
      >
        +
      </text>
    </HoldIconWrapped>
  );
};

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <AddHoldButtonContent disabled />,
})(AddHoldButton);
