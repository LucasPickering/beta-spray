import React from "react";
import {
  BetaOverlayMove,
  BodyPart,
  DndDragItem,
  DndDropResult,
  OverlayPosition,
} from "./types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";
import BetaPrototypeCircle from "./BetaPrototypeCircle";

interface Props {
  bodyPart: BodyPart;
  prototypePosition: OverlayPosition;
  moves: BetaOverlayMove[];
  onDrop?: (item: DndDragItem, dropResult: DndDropResult) => void;
  onDoubleClick?: (move: BetaOverlayMove) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({
  bodyPart,
  prototypePosition,
  moves,
  onDrop,
  onDoubleClick,
}) => (
  <>
    <BetaPrototypeCircle
      key={bodyPart}
      bodyPart={bodyPart}
      position={prototypePosition}
      onDrop={onDrop}
    />

    {/* Draw a line from the last move to this one. Draw these *first* so they
    go on the bottom */}
    {moves.map(
      (move) =>
        move.prev && (
          <BetaChainLine startMove={move.prev} endMove={move} onDrop={onDrop} />
        )
    )}
    {moves.map((move) => (
      <React.Fragment key={move.id}>
        <BetaChainCircle
          move={move}
          onDrop={onDrop}
          onDoubleClick={onDoubleClick}
        />
      </React.Fragment>
    ))}
  </>
);

export default BetaChain;
