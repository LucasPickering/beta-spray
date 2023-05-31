import { isDefined } from "util/func";
import React from "react";
import { BodyPart } from "components/Editor/util/svg";
import {
  styleDraggable,
  styleHighlight,
  styleDragging,
  styleClickable,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { SvgIcon, SvgIconProps } from "@mui/material";
import EmbeddedIcon from "components/common/EmbeddedIcon";
import { getEditableFilterUrl } from "../EditableFilter";

interface Props {
  bodyPart: BodyPart;
  order?: number;
  color?: string;
  icon?: React.ReactElement;
  size?: "small" | "large";
  isFree?: boolean;
  isStart?: boolean;
  clickable?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isHighlighted?: boolean;
  css?: Interpolation<Theme>;
}

/**
 * Dumb component representing a beta move. This is a "raw" icon, meaning it's
 * just the inline SVG element, *without* the wrapping SVG.
 *
 * @param bodyPart Body part associated with the move
 * @param order Cardinal ordering of the move within the beta
 * @param color Color of the icon fill
 * @param icon Icon to render in place of move order (large size only)
 * @param size Large or small? Large size shows more info
 * @param isFree Is the move *not* attached to a hold?
 * @param isStart Is the move the first of its body part in the beta?
 * @param clickable Can the icon be clicked?
 * @param draggable Can the icon be dragged?
 * @param isDragging Is the icon actively being dragged?
 * @param isHighlighted Is the icon in "highlight" mode?
 * @param css Additional CSS rules
 */
const BetaMoveIcon = React.forwardRef<
  SVGGElement,
  Props & React.SVGProps<SVGGElement>
>(
  (
    {
      bodyPart,
      order,
      color,
      size = "large",
      icon,
      isFree = false,
      isStart = false,
      clickable = false,
      draggable = false,
      isDragging = false,
      isHighlighted = false,
      css: parentCss,
      ...rest
    },
    ref
  ) => (
    <g
      ref={ref}
      css={[
        { stroke: "#00000000" },
        // Draggable should override clickable
        clickable && styleClickable,
        draggable && styleDraggable,
        isDragging && styleDragging,
        isHighlighted && styleHighlight,
        parentCss,
      ]}
      {...rest}
    >
      {/* We need this wrapper so we don't fuck up the transform that the
            icon does on itself.*/}
      <g
        filter={getEditableFilterUrl("beta")} // Color based on editability
        css={{ transform: `scale(${size === "large" ? 1.5 : 0.75})` }}
      >
        <IconBodyPartRaw
          bodyPart={bodyPart}
          css={({ palette }) => [
            color && { fill: color },
            // Free moves get a dotted outline. This has to go *before* the
            // isStart rule, because that one should always take priority
            // for stroke color
            isFree && { stroke: "white", strokeDasharray: "1,0.5" },
            isStart && { stroke: palette.editor.betaMoves.start.main },
          ]}
        />
      </g>

      {/* Icon takes priority over order */}
      {size === "large" &&
        (isDefined(icon) ? (
          <EmbeddedIcon
            css={({ palette }) => ({
              color: color ? palette.getContrastText(color) : "black",
            })}
          >
            {icon}
          </EmbeddedIcon>
        ) : (
          isDefined(order) && (
            <text
              css={({ palette }) => ({
                fontSize: 4,
                userSelect: "none",
                pointerEvents: "none",
                color: color ? palette.getContrastText(color) : "black",
              })}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {order}
            </text>
          )
        ))}
    </g>
  )
);

BetaMoveIcon.displayName = "BetaMoveIcon";

/**
 * A standalone version of a beta move icon, which can be used in standard
 * HTML context (i.e. outside of an SVG).
 */
export const BetaMoveIconWrapped: React.FC<
  Props & Pick<SvgIconProps, "fontSize" | "children">
> = ({ fontSize, children, ...rest }) => (
  // View box was determined experimentally, so it's slightly off but close enough
  <SvgIcon viewBox="-4.5 -4.5 9 9" fontSize={fontSize}>
    <BetaMoveIcon {...rest} />
    {children}
  </SvgIcon>
);

// Below are the "raw" icons that we piece together to make the final icon.

/**
 * Get the basic icon for a move, based on its body part. This defines the
 * shape of the final move.
 */
const IconBodyPartRaw: React.FC<
  { bodyPart: BodyPart } & React.SVGProps<SVGPathElement>
> = ({ bodyPart, ...rest }) => {
  switch (bodyPart) {
    case "LEFT_HAND":
      return <IconTriangleRaw transform="rotate(-45)" {...rest} />;
    case "RIGHT_HAND":
      return <IconTriangleRaw transform="rotate(45)" {...rest} />;
    case "LEFT_FOOT":
      return <IconOvalRaw transform="rotate(45)" {...rest} />;
    case "RIGHT_FOOT":
      return <IconOvalRaw transform="rotate(-45)" {...rest} />;
  }
};

const IconTriangleRaw: React.FC<React.SVGProps<SVGPathElement>> = (props) => (
  // Generated by polygons.py
  <path
    d="M-0.866,-2.25 A1,1,0,0,1,0.866,-2.25 L2.38,0.376 A1,1,0,0,1,1.52,1.88
      L-1.52,1.88 A1,1,0,0,1,-2.38,0.376 Z"
    strokeWidth={0.5}
    {...props}
  />
);

const IconOvalRaw: React.FC<React.SVGProps<SVGPathElement>> = (props) => (
  // Generated by polygons.py
  <path
    d="M-1.75,-1.25 A1,1,0,0,1,1.75,-1.25 L1.75,1.25 A1,1,0,0,1,-1.75,1.25 Z"
    strokeWidth={0.5}
    {...props}
  />
);

export default BetaMoveIcon;
