import { betaQuery } from "util/queries";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import React from "react";
import { ToggleButtonProps } from "@mui/material";
import HelpAnnotated from "components/common/HelpAnnotated";
import { BetaEditorModeLabel_betaNode$key } from "./__generated__/BetaEditorModeLabel_betaNode.graphql";

interface Props extends ToggleButtonProps {
  betaKey: BetaEditorModeLabel_betaNode$key;
}

/**
 * Label declaring if we're in View or Edit mode for the beta. Should only be
 * rendered in beta mode.
 */
const BetaEditorModeLabel: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaEditorModeLabel_betaNode on BetaNode {
        permissions {
          canEdit
        }
      }
    `,
    betaKey
  );

  if (beta.permissions.canEdit) {
    return <>Editing Beta</>;
  }

  return (
    <HelpAnnotated helpText="You don't have permission to edit this beta">
      Viewing Beta
    </HelpAnnotated>
  );
};

export default withQuery<queriesBetaQuery, Props, "betaKey">({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: <>...</>,
})(BetaEditorModeLabel);
