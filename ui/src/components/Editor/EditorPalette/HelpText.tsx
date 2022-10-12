import { Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Help as IconHelp } from "@mui/icons-material";
import { allBodyParts, formatBodyPart } from "util/svg";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC = () => (
  <Tooltip title={<HelpTextContent />} placement="right" describeChild>
    <IconButton>
      <IconHelp />
    </IconButton>
  </Tooltip>
);

const HelpTextContent: React.FC = () => {
  return (
    <>
      <div>
        <strong>Drag from the palette</strong> to create holds and moves
      </div>
      <div>
        <strong>Drag a move or hold</strong> to relocate
      </div>
      <div>
        <strong>Drag a line</strong> to add an intermediate move
      </div>
      <div>
        <strong>Drag a hold or move to the trash</strong> to delete
      </div>
      <div>
        <strong>Double click a move</strong> to edit
      </div>
      <div>
        <strong>Reorder moves</strong> in the list at right
      </div>

      <Divider
        orientation="horizontal"
        sx={{ marginTop: 1, marginBottom: 1 }}
      />

      <LegendIcon icon={<HoldIconWrapped />} label="Hold" />
      {allBodyParts.map((bodyPart) => (
        <LegendIcon
          key={bodyPart}
          icon={<BetaMoveIconWrapped bodyPart={bodyPart} />}
          label={formatBodyPart(bodyPart)}
        />
      ))}

      <LegendIcon
        icon={<BetaMoveIconWrapped bodyPart="LEFT_HAND" isStart />}
        label="Start Move"
      />
      <LegendIcon
        icon={<BetaMoveIconWrapped bodyPart="LEFT_HAND" isFree />}
        label="Free Move (smear, flag, etc.)"
      />
    </>
  );
};

const LegendIcon: React.FC<{ icon: React.ReactElement; label: string }> = ({
  icon,
  label,
}) => (
  <Stack key={label} direction="row" spacing={1}>
    {icon}
    <Typography variant="body2">{label}</Typography>
  </Stack>
);

export default HelpText;
