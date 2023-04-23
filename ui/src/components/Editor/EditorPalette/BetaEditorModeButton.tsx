import React from "react";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import { betaQuery } from "util/queries";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { BetaEditorModeButton_betaNode$key } from "./__generated__/BetaEditorModeButton_betaNode.graphql";
import { ToggleButtonProps } from "@mui/material";
import { EditorMode } from "../util/context";
import TooltipToggleButton from "components/common/TooltipToggleButton";
import { editorTourTags } from "../EditorTour";

interface Props extends ToggleButtonProps {
  betaKey: BetaEditorModeButton_betaNode$key;
  // This has to be a prop so ToggleButtonGroup can access it
  value: EditorMode;
}

/**
 * Button to enter editBeta editor mode.
 */
const BetaEditorModeButton: React.FC<Props> = ({ betaKey, value, ...rest }) => {
  const beta = useFragment(
    graphql`
      fragment BetaEditorModeButton_betaNode on BetaNode {
        permissions {
          canEdit
        }
      }
    `,
    betaKey
  );

  return (
    <TooltipToggleButton
      value={value}
      aria-label="view beta"
      disabledTitle="You don't have permission to edit this beta"
      data-tour={editorTourTags.editBetaModeButton}
      {...rest}
      // This has to override the passed in prop in `rest`
      disabled={!beta.permissions.canEdit}
    >
      <BetaMoveIconWrapped bodyPart="LEFT_HAND" />
    </TooltipToggleButton>
  );
};

const loadingElement = (
  <TooltipIconButton
    title="Loading..."
    disabled
    data-tour={editorTourTags.editBetaModeButton}
  >
    <BetaMoveIconWrapped bodyPart="LEFT_HAND" />
  </TooltipIconButton>
);

export default withQuery<queriesBetaQuery, Props, "betaKey">({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: loadingElement,
  noDataElement: loadingElement,
})(BetaEditorModeButton);
