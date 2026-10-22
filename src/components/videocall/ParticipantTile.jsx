import { VideoTrack } from "@livekit/components-react";

export default function ParticipantTile({ trackRef, className = "", label }) {
  const participant = trackRef?.participant;
  const name = label || participant?.name || participant?.identity || "Participant";
  const hasVideo = Boolean(trackRef?.publication?.track) && !trackRef?.publication?.isMuted;

  return (
    <div className={`vc-participant-tile ${className}`}>
      {hasVideo ? <VideoTrack trackRef={trackRef} /> : <div className="vc-participant-placeholder"><div>{name?.[0]?.toUpperCase() || "P"}</div><span>Camera off</span></div>}
      <span className="vc-participant-name">{name}</span>
    </div>
  );
}
