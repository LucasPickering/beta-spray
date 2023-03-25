import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";

type Props = IconButtonProps &
  Pick<TooltipProps, "title" | "placement"> & {
    disabledTitle?: React.ReactNode;
  };

/**
 * Convenience component for a icon button with a hover tooltip
 */
const TooltipIconButton: React.FC<Props> = ({
  title,
  disabledTitle,
  placement,
  disabled,
  ...rest
}) => (
  // <span> wrapper is needed so Tooltip can track cursor events while button
  // is disabled
  <Tooltip
    // If button is disabled, and we've been given different text to show while
    // disabled, render that instead
    title={disabledTitle && disabled ? disabledTitle : title}
    placement={placement}
  >
    <span>
      <IconButton disabled={disabled} {...rest} />
    </span>
  </Tooltip>
);

export default TooltipIconButton;
