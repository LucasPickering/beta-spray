import { useContext, useEffect } from "react";
import { EditorModeContext } from "../util/context";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import { Sync as IconSync } from "@mui/icons-material";
import EmbeddedIcon from "components/common/EmbeddedIcon";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { graphql, useFragment } from "react-relay";
import { ToggleEditorModeButton_problemNode$key } from "./__generated__/ToggleEditorModeButton_problemNode.graphql";
import { problemQuery } from "util/queries";

interface Props {
  problemKey: ToggleEditorModeButton_problemNode$key;
}

const ToggleEditorModeButton: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ToggleEditorModeButton_problemNode on ProblemNode {
        permissions {
          canEdit
        }
      }
    `,
    problemKey
  );
  const [editorMode, setEditorMode] = useContext(EditorModeContext);

  const canEditHolds = problem.permissions.canEdit;
  useEffect(() => {
    if (!canEditHolds) {
      setEditorMode("betaMove");
    }
  }, [canEditHolds, setEditorMode]);

  // This is a toggle button, so the button represents whichever mode we're *not* in
  switch (editorMode) {
    case "hold":
      return (
        // This button is always enabled, because anyone can create their own
        // beta and edit it
        <TooltipIconButton
          title="Edit Beta"
          onClick={() => setEditorMode("betaMove")}
        >
          {/* TODO better icon */}
          <IconEditorModeBetaMove />
        </TooltipIconButton>
      );
    case "betaMove":
      return (
        // Disable this if the user doesn't have permission to change holds
        <TooltipIconButton
          title="Edit Holds"
          disabledTitle="You don't have permission to edit holds on this problem"
          disabled={!canEditHolds}
          onClick={() => setEditorMode("hold")}
        >
          {/* TODO better icon */}
          <IconEditorModeHold />
        </TooltipIconButton>
      );
  }
};

// TODO make these icons less janky

/**
 * Icon for swapping to hold mode
 */
const IconEditorModeHold: React.FC<
  React.ComponentProps<typeof HoldIconWrapped>
> = (props) => (
  <HoldIconWrapped {...props}>
    <EmbeddedIcon size={1.5} x={6} y={-6}>
      <IconSync color="error" />
    </EmbeddedIcon>
  </HoldIconWrapped>
);

/**
 * Icon for swapping to hold mode
 */
const IconEditorModeBetaMove: React.FC<
  Omit<React.ComponentProps<typeof BetaMoveIconWrapped>, "bodyPart">
> = (props) => (
  <BetaMoveIconWrapped bodyPart="LEFT_HAND" {...props}>
    <EmbeddedIcon size={1.5} x={6} y={-6}>
      <IconSync color="error" />
    </EmbeddedIcon>
  </BetaMoveIconWrapped>
);

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  // TODO
  fallbackElement: null,
  noDataElement: null,
})(ToggleEditorModeButton);
