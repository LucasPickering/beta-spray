import { useContext, useEffect } from "react";
import {
  EditorHighlightedMoveContext,
  EditorPlayPauseContext,
} from "util/context";
import { isDefined } from "util/func";

function usePlayPause(moveIDs: string[]): void {
  const [highlightedMoveId, setHighlightedMoveId] = useContext(
    EditorHighlightedMoveContext
  );
  const [playPause, setPlayPause] = useContext(EditorPlayPauseContext);

  useEffect(() => {
    if (playPause === "play") {
      const intervalID = setInterval(() => {
        setHighlightedMoveId((prev) => {
          const nextHighlightedIndex = isDefined(prev)
            ? moveIDs.indexOf(prev) + 1
            : 0;
          return nextHighlightedIndex < moveIDs.length
            ? moveIDs[nextHighlightedIndex]
            : // We've reached the end, just leave the last move highlighted
              prev;
        });
      }, 1000);

      return () => clearInterval(intervalID);
    }
  }, [playPause, setHighlightedMoveId, moveIDs]);

  useEffect(() => {
    if (highlightedMoveId === moveIDs[moveIDs.length - 1]) {
      setPlayPause("pause");
    }
  }, [highlightedMoveId, moveIDs, setPlayPause]);
}

export default usePlayPause;
