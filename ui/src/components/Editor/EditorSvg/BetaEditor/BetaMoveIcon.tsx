import React from "react";
import { BodyPart, OverlayPosition } from "util/svg";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { IconBodyPartRaw, IconNotesRaw } from "components/common/icons";
import { assertUnreachable, isDefined } from "util/func";
import Positioned from "../Positioned";

interface Props extends React.SVGProps<SVGGElement> {
  bodyPart: BodyPart;
  order?: number;
  isFree?: boolean;
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
      isFree = false,
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
            // Free moves get a dotted outline. This has to go *before* the
            // secondaryColor rule, because that one should always take priority
            // for stroke color
            isFree && { stroke: "white", strokeDasharray: "1,0.5" },
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
        <Positioned position={getAnnotationPosition(bodyPart)}>
          <IconNotesRaw />
        </Positioned>
      )}
    </g>
  )
);

BetaMoveIcon.displayName = "BetaMoveIcon";

function getAnnotationPosition(bodyPart: BodyPart): OverlayPosition {
  switch (bodyPart) {
    case "LEFT_HAND":
      return { x: -0.2, y: 2.2 };
    case "RIGHT_HAND":
      return { x: 0.2, y: 2.2 };
    case "LEFT_FOOT":
      return { x: -2.2, y: 2.2 };
    case "RIGHT_FOOT":
      return { x: 2.2, y: 2.2 };
    // NOTE: Don't use default, to force a type error if a variant is added
    case "%future added value":
      assertUnreachable();
  }
}

export default BetaMoveIcon;
