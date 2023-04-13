import {
  styleClickable,
  styleDraggable,
  styleDragging,
  styleDropHover,
  styleHighlight,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { SvgIcon, SvgIconProps, useTheme } from "@mui/material";

interface Props extends React.SVGProps<SVGCircleElement> {
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
  clickable = false,
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
      css={[
        parentCss,
        {
          r: 3,
          strokeWidth: 0.5,
          stroke: palette.grey[300],
          // We want the fill to be present so it captures events, but invisible
          fillOpacity: 0,
        },
        clickable && styleClickable,
        draggable && { stroke: palette.primary.main },
        draggable && styleDraggable,
        isDragging && styleDragging,
        isHighlighted && styleHighlight,
        isOver && styleDropHover,
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
  // Center and viewbox need to account for the radius *and* stroke width
  <SvgIcon viewBox="-1.25 -1.25 2.5 2.5">
    {/* Normalize scale for generic contexts*/}
    <HoldIcon css={{ transform: "scale(0.333)" }} {...rest} />
    {children}
  </SvgIcon>
);

export default HoldIcon;
