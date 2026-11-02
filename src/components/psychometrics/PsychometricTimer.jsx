import {
  Clock3,
} from "lucide-react";


function formatTime(
  totalSeconds
) {
  const safe =
    Math.max(
      0,
      Number(
        totalSeconds || 0
      )
    );

  const minutes =
    Math.floor(
      safe / 60
    );

  const seconds =
    safe % 60;

  return `${String(
    minutes
  ).padStart(
    2,
    "0"
  )}:${String(
    seconds
  ).padStart(
    2,
    "0"
  )}`;
}


export default function PsychometricTimer({
  secondsRemaining,
}) {
  return (
    <div className="psychometric-timer">
      <Clock3
        size={16}
        strokeWidth={1.5}
      />

      <span>
        {formatTime(
          secondsRemaining
        )}
      </span>
    </div>
  );
}