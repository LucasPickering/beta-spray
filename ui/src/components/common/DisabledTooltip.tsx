import { Tooltip, TooltipProps } from "@mui/material";
import React from "react";

type Props = TooltipProps & {
  children?: React.ReactElement<{ disabled?: boolean }>;
};

/**
 * A tooltip that only renders if the child is disabled. This just looks for a
 * `disabled` prop on the child, it *doesn't* check if the underlying DOM
 * element is disabled.
 */
const DisabledTooltip: React.FC<Props> = ({ children, ...rest }) =>
  children?.props.disabled ? (
    <Tooltip {...rest}>
      <span>{children}</span>
    </Tooltip>
  ) : (
    children
  );

export default DisabledTooltip;
