import {
  RoomAudioRenderer,
  useParticipants,
  useTracks,
} from "@livekit/components-react";

import {
  Track,
} from "livekit-client";

import ParticipantTile from "./ParticipantTile";
import CallControls from "./CallControls";


function formatSessionDate(
  value
) {
  if (!value) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric",
    }
  ).format(
    new Date(
      value
    )
  );
}


export default function VideoRoom({
  appointment,
  ending,
  onEndSession,
}) {
  const participants =
    useParticipants();


  const cameraTracks =
    useTracks(
      [
        Track.Source.Camera,
      ],
      {
        onlySubscribed:
          false,
      }
    );


  const localParticipant =
    participants.find(
      (
        participant
      ) =>
        participant.isLocal
    );


  const remoteParticipant =
    participants.find(
      (
        participant
      ) =>
        !participant.isLocal
    );


  function getCameraTrack(
    participant
  ) {
    if (
      !participant
    ) {
      return undefined;
    }


    return cameraTracks.find(
      (
        trackRef
      ) =>
        trackRef
          .participant
          .identity ===
        participant
          .identity
    );
  }


  const localTrack =
    getCameraTrack(
      localParticipant
    );


  const remoteTrack =
    getCameraTrack(
      remoteParticipant
    );


  const remoteName =
    appointment
      ?.practitioner
      ?.user
      ?.fullName ||
    appointment
      ?.user
      ?.fullName ||
    "Participant";


  const sessionTitle =
    appointment
      ?.enquiry
      ?.supportTopic
      ? `${appointment.enquiry.supportTopic} session`
      : "Wellbeing session";


  return (
    <main
      className="vc-room-page"
    >

      <RoomAudioRenderer />


      <header
        className="vc-room-heading"
      >

        <h1>
          {sessionTitle}
        </h1>


        <p>
          {formatSessionDate(
            appointment
              ?.scheduledStart
          )}
        </p>

      </header>


      <div
        className="vc-room-stage-wrap"
      >

        <section
          className="vc-stage"
        >

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
                remoteName
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

              isLocal
            />

          ) : (

            <div
              className="vc-empty-stage"
            >
              Connecting to session…
            </div>

          )}


          {remoteParticipant &&
            localParticipant && (

              <div
                className="vc-pip-stack"
              >

                <ParticipantTile
                  participant={
                    localParticipant
                  }

                  trackRef={
                    localTrack
                  }

                  className="vc-pip-tile"

                  fallbackName="You"

                  isLocal
                />

              </div>

            )}


          {!remoteParticipant && (

            <div
              className="vc-waiting-badge"
            >
              Waiting for the other participant
            </div>

          )}

        </section>


        <CallControls
          ending={
            ending
          }

          onEndSession={
            onEndSession
          }
        />

      </div>

    </main>
  );
}