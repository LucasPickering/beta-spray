import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";

type Props = IconButtonProps & Pick<TooltipProps, "title" | "placement">;

/**
 * Convenience component for a icon button with a hover tooltip
 */
const TooltipIconButton: React.FC<Props> = ({ title, placement, ...rest }) => (
  // <span> wrapper is needed so Tooltip can track cursor events while button
  // is disabled
  <Tooltip title={title} placement={placement}>
    <span>
      <IconButton {...rest} />
    </span>
  </Tooltip>
);

export default TooltipIconButton;
