import {
  styleDraggable,
  styleDragging,
  styleDropHover,
  styleHighlight,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { SvgIcon, SvgIconProps, useTheme } from "@mui/material";

interface Props {
  clickable?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isHighlighted?: boolean;
  isOver?: boolean;
  css?: Interpolation<Theme>;
}

/**
 * Dumb component for rendering a hold. This is a "raw" icon, meaning it's
 * just the inline SVG element, *without* the wrapping SVG.
 */
const HoldIcon: React.FC<Props> = ({
  draggable = false,
  isDragging = false,
  isHighlighted = false,
  isOver = false,
  css: parentCss,
  ...rest
}) => {
  const { palette } = useTheme();
  return (
    <circle
      css={(theme) => [
        parentCss,
        {
          r: 6,
          opacity: 0.6,
          strokeWidth: 0.5,
          fill: "white",
          stroke: palette.primary.main,
        },
        draggable && styleDraggable,
        isDragging && styleDragging(theme),
        isHighlighted && styleHighlight(theme),
        isOver && styleDropHover(theme),
      ]}
      {...rest}
    />
  );
};

/**
 * A standalone version of a hold icon, which can be used in standard HTML
 * context (i.e. outside of an SVG).
 */
export const HoldIconWrapped: React.FC<
  Props & Pick<SvgIconProps, "children">
> = ({ children, ...rest }) => (
  <SvgIcon viewBox="-6.5 -6.5 13 13">
    {/* The low opacity looks wonky in other contexts */}
    <HoldIcon css={{ opacity: 1 }} {...rest} />
    {children}
  </SvgIcon>
);

export default HoldIcon;
