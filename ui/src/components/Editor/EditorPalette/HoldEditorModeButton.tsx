import { useContext } from "react";
import { EditorModeContext } from "../util/context";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import { problemQuery } from "util/queries";
import SaveEditorModeButton from "./SaveEditorModeButton";
import { HoldEditorModeButton_problemNode$key } from "./__generated__/HoldEditorModeButton_problemNode.graphql";

interface Props {
  problemKey: HoldEditorModeButton_problemNode$key;
}

/**
 * Button to enter editHolds editor mode.
 */
const HoldEditorModeButton: React.FC<Props> = ({ problemKey }) => {
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
  const [editorMode, setEditorMode] = useContext(EditorModeContext);

  return editorMode === "editHolds" ? (
    <SaveEditorModeButton />
  ) : (
    <TooltipIconButton
      title="Edit Holds"
      disabled={editorMode !== "view" || !problem.permissions.canEdit}
      disabledTitle={
        problem.permissions.canEdit
          ? "Finish editing beta"
          : "You don't have permission to edit holds on this problem"
      }
      onClick={() => setEditorMode("editHolds")}
    >
      <HoldIconWrapped />
    </TooltipIconButton>
  );
};

const loadingElement = (
  <TooltipIconButton title="Loading..." disabled>
    <HoldIconWrapped />
  </TooltipIconButton>
);

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: loadingElement,
  noDataElement: loadingElement,
})(HoldEditorModeButton);
