import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { isDefined } from "util/func";
import { useContext } from "react";
import { ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import {
  EditorMode,
  EditorModeContext,
  EditorSelectedBetaContext,
} from "components/Editor/util/context";
import { PreloadedQuery } from "react-relay";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import { editorTourTags } from "../EditorTour";
import HoldEditorModeLabel from "./HoldEditorModeLabel";
import BetaEditorModeLabel from "./BetaEditorModeLabel";

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
  const selectedBetaId = useContext(EditorSelectedBetaContext);

  return (
    <>
      <Typography component="div" variant="caption" margin={1} lineHeight={1}>
        {/* These are separate components so they can load permissions */}
        {editorMode === "holds" && (
          <HoldEditorModeLabel queryRef={problemQueryRef} />
        )}
        {editorMode === "beta" && (
          <BetaEditorModeLabel queryRef={betaQueryRef} />
        )}
      </Typography>

      <ToggleButtonGroup
        value={editorMode}
        exclusive
        color="primary"
        fullWidth
        onChange={(e, value: EditorMode) => {
          // Don't allow untoggling a button
          if (isDefined(value)) {
            setEditorMode(value);
          }
        }}
      >
        <ToggleButton
          value="holds"
          data-tour={editorTourTags.editHoldsModeButton}
        >
          <HoldIconWrapped />
        </ToggleButton>
        <ToggleButton
          value="beta"
          disabled={!isDefined(selectedBetaId)}
          data-tour={editorTourTags.editBetaModeButton}
        >
          <BetaMoveIconWrapped bodyPart="LEFT_HAND" />
        </ToggleButton>
      </ToggleButtonGroup>
    </>
  );
};

export default EditorModeSelect;
