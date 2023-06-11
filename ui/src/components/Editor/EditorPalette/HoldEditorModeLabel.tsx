import { problemQuery } from "util/queries";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import React, { useContext } from "react";
import { ToggleButtonProps } from "@mui/material";
import HelpAnnotated from "components/common/HelpAnnotated";
import { EditorModeContext } from "../util/context";
import { HoldEditorModeLabel_problemNode$key } from "./__generated__/HoldEditorModeLabel_problemNode.graphql";

interface Props extends ToggleButtonProps {
  problemKey: HoldEditorModeLabel_problemNode$key;
}

/**
 * Label declaring if we're in View or Edit mode for the problem/holds. Should
 * only be rendered in holds mode.
 */
const BetaEditorModeLabel: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment HoldEditorModeLabel_problemNode on ProblemNode {
        permissions {
          canEdit
        }
      }
    `,
    problemKey
  );

  const [editorMode] = useContext(EditorModeContext);

  if (editorMode !== "holds") {
    return null;
  }

  if (problem.permissions.canEdit) {
    return <>Editing Holds</>;
  }

  return (
    <HelpAnnotated helpText="You don't have permission to edit this problem">
      Viewing Holds
    </HelpAnnotated>
  );
};

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <>…</>,
})(BetaEditorModeLabel);
