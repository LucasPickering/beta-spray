import React, { useContext } from "react";
import { EditorModeContext } from "../util/context";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import { betaQuery } from "util/queries";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { BetaMoveEditorModeButton_betaNode$key } from "./__generated__/BetaMoveEditorModeButton_betaNode.graphql";
import SaveEditorModeButton from "./SaveEditorModeButton";

interface Props {
  betaKey: BetaMoveEditorModeButton_betaNode$key;
}

/**
 * Button to enter editBetaMoves editor mode.
 */
const BetaMoveEditorModeButton: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaMoveEditorModeButton_betaNode on BetaNode {
        permissions {
          canEdit
        }
      }
    `,
    betaKey
  );
  const [editorMode, setEditorMode] = useContext(EditorModeContext);

  return editorMode === "editBetaMoves" ? (
    <SaveEditorModeButton />
  ) : (
    <TooltipIconButton
      title="Edit Beta"
      disabled={!beta.permissions.canEdit}
      disabledTitle="You don't have permission to edit this beta"
      onClick={() => setEditorMode("editBetaMoves")}
    >
      <BetaMoveIconWrapped bodyPart="LEFT_HAND" />
    </TooltipIconButton>
  );
};

const loadingElement = (
  <TooltipIconButton title="Loading..." disabled>
    <BetaMoveIconWrapped bodyPart="LEFT_HAND" />
  </TooltipIconButton>
);

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: loadingElement,
  noDataElement: loadingElement,
})(BetaMoveEditorModeButton);
