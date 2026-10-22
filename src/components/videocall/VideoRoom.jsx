import { useMemo } from "react";
import { RoomAudioRenderer, useTracks } from "@livekit/components-react";
import { Track } from "livekit-client";
import ParticipantTile from "./ParticipantTile";
import CallControls from "./CallControls";

export default function VideoRoom({ appointment, onEndSession }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const localTrack = useMemo(() => tracks.find((item) => item.participant?.isLocal), [tracks]);
  const remoteTracks = useMemo(() => tracks.filter((item) => !item.participant?.isLocal), [tracks]);
  const mainTrack = remoteTracks[0] || localTrack;
  const remainingRemote = remoteTracks.slice(1);

  return (
    <div className="vc-room-page">
      <div className="vc-room-heading"><h1>{appointment?.enquiry?.supportTopic || "Video session"}</h1><p>{appointment?.scheduledStart ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(appointment.scheduledStart)) : ""}</p></div>
      <div className="vc-stage">
        {mainTrack ? <ParticipantTile trackRef={mainTrack} className="vc-main-tile" /> : <div className="vc-empty-stage">Waiting for participant…</div>}
        <div className="vc-pip-stack">
          {localTrack && mainTrack !== localTrack && <ParticipantTile trackRef={localTrack} className="vc-pip-tile" label="You" />}
          {remainingRemote.map((trackRef) => <ParticipantTile key={trackRef.participant?.identity || trackRef.publication?.trackSid} trackRef={trackRef} className="vc-pip-tile" />)}
        </div>
      </div>
      <RoomAudioRenderer />
      <CallControls onEndSession={onEndSession} />
    </div>
  );
}
