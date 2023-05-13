import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { problemQuery } from "util/queries";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import TooltipIconButton from "components/common/TooltipIconButton";
import { ToggleButtonProps } from "@mui/material";
import TooltipToggleButton from "components/common/TooltipToggleButton";
import { EditorMode } from "../util/context";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import { editorTourTags } from "../EditorTour";
import { HoldEditorModeButton_problemNode$key } from "./__generated__/HoldEditorModeButton_problemNode.graphql";

interface Props extends ToggleButtonProps {
  problemKey: HoldEditorModeButton_problemNode$key;
  // This has to be a prop so ToggleButtonGroup can access it
  value: EditorMode;
}

/**
 * Button to enter editHolds editor mode.
 */
const HoldEditorModeButton: React.FC<Props> = ({
  problemKey,
  value,
  ...rest
}) => {
  const problem = useFragment(
    graphql`
      fragment HoldEditorModeButton_problemNode on ProblemNode {
        permissions {
          canEdit
        }
      }
    `,
    problemKey
  );

  return (
    <TooltipToggleButton
      value={value}
      aria-label="edit holds"
      disabledTitle="You don't have permission to edit holds on this problem"
      data-tour={editorTourTags.editHoldsModeButton}
      {...rest}
      // This has to override the passed in prop in `rest`
      disabled={!problem.permissions.canEdit}
    >
      <HoldIconWrapped />
    </TooltipToggleButton>
  );
};

const loadingElement = (
  <TooltipIconButton
    title="Loading..."
    disabled
    data-tour={editorTourTags.editHoldsModeButton}
  >
    <HoldIconWrapped />
  </TooltipIconButton>
);

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: loadingElement,
  noDataElement: loadingElement,
})(HoldEditorModeButton);
