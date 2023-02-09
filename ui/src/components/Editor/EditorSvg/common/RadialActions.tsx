import { polarToSvg } from "components/Editor/util/svg";
import React from "react";
import Positioned from "./Positioned";

interface Props {
  actions: Array<{
    key: string;
    element: React.ReactElement;
    visible?: boolean;
  }>;
  radius?: number;
  startAngle?: number;
  sliceSize?: number;
  reverse?: boolean;
}

/**
 * TODO
 */
const RadialActions: React.FC<Props> = ({
  actions,
  radius = 7,
  startAngle = 90,
  sliceSize = 45,
  reverse = false,
}) => {
  const slice = reverse ? -sliceSize : sliceSize;
  return (
    <>
      {actions.map(
        ({ key, element, visible = true }, i) =>
          visible && (
            <Positioned
              key={key}
              position={polarToSvg(radius, startAngle + slice * i)}
            >
              {element}
            </Positioned>
          )
      )}
    </>
  );
};

export default RadialActions;
