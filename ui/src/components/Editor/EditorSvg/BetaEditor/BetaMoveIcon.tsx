import React from "react";
import { BodyPart } from "util/svg";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { IconBodyPartRaw, IconNotesRaw } from "components/common/icons";
import { isDefined } from "util/func";
import Positioned from "../Positioned";

interface Props extends React.SVGProps<SVGGElement> {
  bodyPart: BodyPart;
  order?: number;
  hasAnnotation?: boolean;
  primaryColor: string;
  secondaryColor?: string | null; // Allow null to match w/ the gql schema
  isDragging?: boolean;
  isHighlighted?: boolean;
  css?: Interpolation<Theme>;
}

/**
 * Dumb component representing a beta move.
 *
 * TODO rename this to something less confusing (remove the Icon word)
 */
const BetaMoveIcon = React.forwardRef<SVGGElement, Props>(
  (
    {
      bodyPart,
      primaryColor,
      secondaryColor,
      order,
      hasAnnotation,
      isDragging,
      isHighlighted,
      css: parentCss,
      ...rest
    },
    ref
  ) => (
    <g
      ref={ref}
      css={[
        styleDraggable,
        isDragging && styleDragging,
        isHighlighted && styleDraggableHighlight,
        parentCss,
      ]}
      {...rest}
    >
      {/* We need this wrapper so we don't fuck up the transform that the
            icon does on itself. Scaling improves touch interaction. */}
      <g css={{ transform: "scale(1.5)" }}>
        <IconBodyPartRaw
          bodyPart={bodyPart}
          css={[
            { fill: primaryColor },
            isDefined(secondaryColor) && { stroke: secondaryColor },
          ]}
        />
      </g>

      {isDefined(order) && (
        <text
          css={{
            fontSize: 4,
            userSelect: "none",
            pointerEvents: "none",
            // This should contrast all possible fill colors
            color: "black",
          }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {order}
        </text>
      )}

      {hasAnnotation && (
        <Positioned position={{ x: 2, y: -2 }}>
          <circle css={{ r: 1.5, fill: primaryColor }} />
          <IconNotesRaw />
        </Positioned>
      )}
    </g>
  )
);

BetaMoveIcon.displayName = "BetaMoveIcon";

export default BetaMoveIcon;
