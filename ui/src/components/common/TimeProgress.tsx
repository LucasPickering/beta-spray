import { clamp } from "util/func";
import { CircularProgress, CircularProgressProps } from "@mui/material";
import { useEffect, useState } from "react";

interface Props extends CircularProgressProps {
  duration: number;
  decay?: boolean;
}

/**
 * A progress indicator based on a fixed time period. From first render, this
 * progress will advance until it hits the given duration.
 *
 * @param duration Duration of the period of progress, in milliseconds
 * @param decay If true, reverse progress so it starts at 100 and ticks down to 0
 */
const TimeProgress: React.FC<Props> = ({
  duration,
  decay = false,
  ...rest
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const newElapsed = Date.now() - startTime;
      setElapsed(newElapsed);

      // Cancel the interval when we hit the duration
      if (newElapsed >= duration) {
        clearInterval(intervalId);
      }
      // TODO clear interval after finishing
    }, 100);

    return () => clearInterval(intervalId);
  }, [duration]);

  // Progress from 0 to 100
  const progress = clamp(elapsed / duration, 0, 1) * 100;
  return (
    <CircularProgress
      variant="determinate"
      // Reverse progress in decay mode
      value={decay ? 100 - progress : progress}
      {...rest}
    />
  );
};

export default TimeProgress;
