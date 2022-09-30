import React from "react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { SvgIcon, useTheme } from "@mui/material";

interface Props {
  clickable?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
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
          r: 7,
          opacity: 0.6,
          strokeWidth: 0.5,
          fill: "white",
          stroke: palette.primary.main,
        },
        clickable && styleAddObject,
        draggable && styleDraggable,
        isDragging && styleDragging,
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
export const HoldIconWrapped: React.FC<Props> = (props) => (
  <SvgIcon viewBox="-7.5 -7.5 15 15">
    {/* The low opacity looks wonky in other contexts */}
    <HoldIcon css={{ opacity: 1 }} {...props} />
  </SvgIcon>
);

export default HoldIcon;
