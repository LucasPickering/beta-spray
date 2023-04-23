import { useContext } from "react";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { Visibility as IconVisibility } from "@mui/icons-material";
import { EditorMode, EditorModeContext } from "components/Editor/util/context";
import { PreloadedQuery } from "react-relay";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import HoldEditorModeButton from "./HoldEditorModeButton";
import BetaEditorModeButton from "./BetaEditorModeButton";
import { isDefined } from "util/func";

interface Props {
  problemQueryRef: PreloadedQuery<queriesProblemQuery> | null | undefined;
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
}

/**
 * A button group to select the editor mode.
 */
const EditorModeSelect: React.FC<Props> = ({
  problemQueryRef,
  betaQueryRef,
}) => {
  const [editorMode, setEditorMode] = useContext(EditorModeContext);

  return (
    <>
      <Typography
        component="div"
        variant="caption"
        margin={1}
        marginBottom={0}
        lineHeight={1}
      >
        Mode: {getLabel(editorMode)}
      </Typography>

      <ToggleButtonGroup
        value={editorMode}
        exclusive
        onChange={(e, value: EditorMode) => {
          // Don't allow untoggling a button
          if (isDefined(value)) {
            setEditorMode(value);
          }
        }}
      >
        <ToggleButton value="view" aria-label="view beta">
          <IconVisibility />
        </ToggleButton>
        {/* These need a `value` prop because ToggleButtonGroup accesses its
            children dynamically to know when they're selected. */}
        <HoldEditorModeButton queryRef={problemQueryRef} value="editHolds" />
        <BetaEditorModeButton queryRef={betaQueryRef} value="editBeta" />
      </ToggleButtonGroup>
    </>
  );
};

function getLabel(editorMode: EditorMode): string {
  switch (editorMode) {
    case "view":
      return "View Only";
    case "editHolds":
      return "Edit Holds";
    case "editBeta":
      return "Edit Beta";
  }
}

export default EditorModeSelect;
