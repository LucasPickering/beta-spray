import React from "react";
import { BodyPart } from "util/api";
import { D3Position } from "util/d3";
import BetaMoveCircle from "./BetaMoveCircle";
import classes from "./d3.scss";

interface Props {
  bodyPart: BodyPart;
  moves: Array<{ betaMoveId: string; position: D3Position }>;
  // TODO type alias
  createBetaMove: ({ holdId }: { holdId: string }) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({ bodyPart, moves, createBetaMove }) => (
  <>
    {moves.map(({ betaMoveId, position }, i) => {
      const isLastMove = i === moves.length - 1;
      const prevMove = i >= 1 ? moves[i - 1] : undefined;

      return (
        <React.Fragment key={betaMoveId}>
          {/* Draw a line from the last move to this one */}
          {prevMove && (
            <line
              className={classes.betaMoveLine}
              x1={prevMove.position.x}
              y1={prevMove.position.y}
              x2={position.x}
              y2={position.y}
            />
          )}

          <BetaMoveCircle
            position={position}
            isLastMove={isLastMove}
            onDrop={createBetaMove}
          />

          {/* {isLastMove && (
                                  <text
                                    className={classes.betaMoveLabel}
                                    x={position.x}
                                    y={position.y}
                                    textAnchor="middle"
                                  >
                                    {bodyPart}
                                  </text>
                                )} */}
        </React.Fragment>
      );
    })}
  </>
);

export default BetaChain;
