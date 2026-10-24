import {
  VideoTrack,
} from "@livekit/components-react";


export default function ParticipantTile({
  participant,
  trackRef,
  className = "",
  fallbackName =
    "Participant",
  isLocal =
    false,
}) {
  const name =
    isLocal
      ? "You"
      : participant
          ?.name ||
        fallbackName;


  const hasVideo =
    Boolean(
      trackRef
        ?.publication
        ?.track
    ) &&
    !trackRef
      ?.publication
      ?.isMuted;


  const initial =
    String(
      name ||
      "P"
    )
      .trim()
      .charAt(0)
      .toUpperCase();


  return (
    <div
      className={
        `vc-participant-tile ${className}`
      }
    >

      {hasVideo ? (
        <VideoTrack
          trackRef={
            trackRef
          }
        />
      ) : (
        <div
          className="vc-participant-placeholder"
        >
          <div>
            {initial}
          </div>

          <span>
            Camera is off
          </span>
        </div>
      )}


      <span
        className="vc-participant-name"
      >
        {name}
      </span>

    </div>
  );
}