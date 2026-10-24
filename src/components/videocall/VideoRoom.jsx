import {
  RoomAudioRenderer,
  TrackToggle,
  VideoTrack,
  useParticipants,
  useTracks,
} from "@livekit/components-react";

import {
  Track,
} from "livekit-client";

function initials(name) {
  return (
    String(name || "P")
      .trim()
      .charAt(0)
      .toUpperCase() || "P"
  );
}

function ParticipantTile({
  participant,
  trackRef,
  className = "",
  fallbackName,
}) {
  const name =
    participant?.name ||
    fallbackName ||
    "Participant";

  return (
    <div
      className={`vc-participant-tile ${className}`}
    >
      {trackRef ? (
        <VideoTrack
          trackRef={trackRef}
        />
      ) : (
        <div className="vc-participant-placeholder">
          <div>
            {initials(name)}
          </div>
          <span>
            Camera is off
          </span>
        </div>
      )}

      <span className="vc-participant-name">
        {name}
      </span>
    </div>
  );
}

export default function VideoRoom({
  appointment,
  ending,
  onEndSession,
  onLeave,
}) {
  const participants =
    useParticipants();

  const cameraTracks =
    useTracks(
      [Track.Source.Camera],
      {
        onlySubscribed: false,
      }
    );

  const localParticipant =
    participants.find(
      (participant) =>
        participant.isLocal
    );

  const remoteParticipant =
    participants.find(
      (participant) =>
        !participant.isLocal
    );

  const getCameraTrack =
    (participant) =>
      cameraTracks.find(
        (trackRef) =>
          trackRef.participant
            .identity ===
          participant?.identity
      );

  const localTrack =
    getCameraTrack(
      localParticipant
    );

  const remoteTrack =
    getCameraTrack(
      remoteParticipant
    );

  const remoteFallbackName =
    appointment?.practitioner?.user
      ?.fullName ||
    appointment?.user?.fullName ||
    "Participant";

  return (
    <main className="vc-room-page">
      <RoomAudioRenderer />

      <header className="vc-room-heading">
        <h1>
          {appointment?.enquiry
            ?.supportTopic ||
            "Wellbeing session"}
        </h1>
      </header>

      <section className="vc-stage">
        {remoteParticipant ? (
          <ParticipantTile
            participant={
              remoteParticipant
            }
            trackRef={
              remoteTrack
            }
            className="vc-main-tile"
            fallbackName={
              remoteFallbackName
            }
          />
        ) : localParticipant ? (
          <ParticipantTile
            participant={
              localParticipant
            }
            trackRef={
              localTrack
            }
            className="vc-main-tile"
            fallbackName="You"
          />
        ) : (
          <div className="vc-empty-stage">
            Connecting to session…
          </div>
        )}

        {remoteParticipant &&
          localParticipant && (
            <div className="vc-pip-stack">
              <ParticipantTile
                participant={
                  localParticipant
                }
                trackRef={
                  localTrack
                }
                className="vc-pip-tile"
                fallbackName="You"
              />
            </div>
          )}

        {!remoteParticipant && (
          <div className="vc-waiting-badge">
            Waiting for the other participant
          </div>
        )}
      </section>

      <div className="vc-controls">
        <TrackToggle
          source={
            Track.Source.Microphone
          }
          showIcon
        />

        <TrackToggle
          source={
            Track.Source.Camera
          }
          showIcon
        />

        <button
          type="button"
          className="vc-leave-button"
          onClick={onLeave}
          title="Leave call"
        >
          Leave
        </button>

        <button
          type="button"
          className="vc-end-button"
          onClick={onEndSession}
          disabled={ending}
          title="End session for everyone"
        >
          {ending ? "…" : "✕"}
        </button>
      </div>
    </main>
  );
}
