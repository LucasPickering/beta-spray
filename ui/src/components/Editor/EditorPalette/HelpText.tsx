import { Divider, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Help as IconHelp } from "@mui/icons-material";
import { allBodyParts, formatBodyPart } from "components/Editor/util/svg";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC = () => (
  <Tooltip title={<HelpTextContent />} placement="bottom" describeChild>
    <IconButton>
      <IconHelp />
    </IconButton>
  </Tooltip>
);

const HelpTextContent: React.FC = () => (
  <>
    <div>
      <strong>Change the editor mode</strong> using the buttons below to modify
      holds and beta
    </div>

    <Typography variant="subtitle1">Edit Holds</Typography>
    <div>Only the uploader of the problem can edit holds.</div>
    <ul>
      <li>
        <strong>Click anywhere</strong> to add a hold
      </li>
      <li>
        <strong>Drag a hold</strong> to relocate
      </li>
      <li>
        <strong>Click a hold</strong> to edit notes or delete
      </li>
    </ul>

    <Typography variant="subtitle1">Edit Beta</Typography>
    <div>
      You can't edit other people's beta. To create your own, add a new entry
      (or copy and existing one) in the sidebar.
    </div>
    <ul>
      <li>
        <strong>Drag the + icon</strong> to add a move
      </li>
      <li>
        <strong>Drag a move</strong> to relocate
      </li>
      <li>
        <strong>Click a move</strong> to edit notes or delete
      </li>
      <li>
        <strong>Reorder moves</strong> in the sidebar
      </li>
    </ul>

    <Divider orientation="horizontal" sx={{ marginTop: 1, marginBottom: 1 }} />

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
