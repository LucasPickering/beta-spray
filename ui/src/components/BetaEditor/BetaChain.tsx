import React from "react";
import { BodyPart } from "util/api";
import { D3Position } from "util/d3";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";
import classes from "./d3.scss";

interface Props {
  bodyPart: BodyPart;
  // TODO type alias (or fragment)
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
    {moves.map((move, i) => {
      const isLastMove = i === moves.length - 1;
      const prevMove = i >= 1 ? moves[i - 1] : undefined;

      return (
        <React.Fragment key={move.betaMoveId}>
          {/* Draw a line from the last move to this one */}
          {prevMove && <BetaChainLine startMove={prevMove} endMove={move} />}

          <BetaChainCircle
            position={move.position}
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
