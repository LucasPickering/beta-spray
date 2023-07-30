import {
  styleClickable,
  styleDraggable,
  styleDragging,
  styleDropHover,
  styleHighlight,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { SvgIcon, SvgIconProps, useTheme } from "@mui/material";
import { HoldKind } from "components/Editor/util/svg";
import { getEditableFilterUrl } from "../EditableFilter";

interface Props extends React.SVGProps<SVGCircleElement> {
  kind?: HoldKind;
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
  kind = "JUG", // Optimism!
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
    <IconHoldRaw
      kind={kind}
      filter={getEditableFilterUrl("hold")} // Color based on editability
      css={[
        {
          strokeWidth: 0.5,
          stroke: palette.editor.holds.primary.main,
          // We want the fill to be present so it captures events, but invisible
          fillOpacity: 0,
        },
        parentCss,
        clickable && styleClickable,
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
 * Basic icon for a hold, based on its kind.
 */
const IconHoldRaw: React.FC<
  { kind: HoldKind } & Omit<React.SVGProps<SVGElement>, "ref">
> = ({ kind, ...rest }) => {
  switch (kind) {
    case "JUG":
      return (
        <path
          d="M-2.5,-3 L-2.5,2.5 A0.5,0.5,0,0,0,-2,3 L2,3 A0.5,0.5,0,0,0,2.5,2.5 L2.5,-3"
          {...rest}
        />
      );
    case "CRIMP":
      return (
        <path
          d="M-2.5,0.875 L-2.5,-0.375 A0.5,0.5,0,0,1,-2,-0.875 L2,-0.875 A0.5,0.5,0,0,1,2.5,-0.375 L2.5,0.875"
          {...rest}
        />
      );
    case "PINCH":
      return (
        <path
          d="M-1.5,-2.25 A1,1,0,0,1,-0.5,-3.25 L0.5,-3.25 A1,1,0,0,1,1.5,-2.25 L1.5,2.25 A1,1,0,0,1,0.5,3.25 L-0.5,3.25 A1,1,0,0,1,-1.5,2.25 Z"
          {...rest}
        />
      );
    case "SLOPER":
      return <path d="M-2.5,1.25 A2.5,2.5,0,0,1,2.5,1.25 Z" {...rest} />;
    case "POCKET":
      return <circle r={2.5} {...rest} />;
    case "CHIP":
      return (
        <path
          d="M-0.433,-1.56 A0.5,0.5,0,0,1,0.433,-1.56 L1.57,0.405 A0.5,0.5,0,0,1,1.13,1.15 L-1.13,1.15 A0.5,0.5,0,0,1,-1.57,0.405 Z"
          {...rest}
        />
      );
  }
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
    <HoldIcon
      css={{ transform: "scale(0.333)", stroke: "currentColor" }}
      {...rest}
    />
    {children}
  </SvgIcon>
);

export default HoldIcon;
