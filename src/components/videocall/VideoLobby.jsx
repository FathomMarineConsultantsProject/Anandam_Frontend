import {
  useEffect,
  useRef,
  useState,
} from "react";

import micOnIcon from "../../assets/videocall/mic-on.png";
import micOffIcon from "../../assets/videocall/mic-off.png";
import cameraOnIcon from "../../assets/videocall/camera-on.png";
import cameraOffIcon from "../../assets/videocall/camera-off.png";


function formatSessionDate(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}


function getStatusCopy(status) {
  if (!status) {
    return {
      title:
        "Preparing session",

      body:
        "Checking whether the session is ready.",
    };
  }


  if (
    status.callStatus ===
    "ENDED"
  ) {
    return {
      title:
        "Session ended",

      body:
        "This video session has already finished.",
    };
  }


  if (
    !status.joinAllowed
  ) {
    return {
      title:
        "Not ready yet",

      body:
        status.joinOpensAt
          ? `You can join from ${new Intl.DateTimeFormat(
              "en-GB",
              {
                hour:
                  "2-digit",

                minute:
                  "2-digit",
              }
            ).format(
              new Date(
                status.joinOpensAt
              )
            )}.`
          : "The join window is not open yet.",
    };
  }


  return {
    title:
      "Ready to Join?",

    body:
      status.participantCount >
      0
        ? "The other participant is already here."
        : "No one else is here",
  };
}


export default function VideoLobby({
  appointment,
  status,
  onJoin,
  joining,
  error,
}) {
  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);


  const [
    micOn,
    setMicOn,
  ] =
    useState(true);


  const [
    cameraOn,
    setCameraOn,
  ] =
    useState(true);


  const [
    permissionMessage,
    setPermissionMessage,
  ] =
    useState("");


  useEffect(() => {
    let cancelled =
      false;


    async function preparePreview() {
      try {
        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio:
                true,

              video:
                true,
            });


        if (
          cancelled
        ) {
          stream
            .getTracks()
            .forEach(
              (
                track
              ) =>
                track.stop()
            );

          return;
        }


        streamRef.current =
          stream;


        if (
          videoRef.current
        ) {
          videoRef.current.srcObject =
            stream;
        }

      } catch {
        setMicOn(
          false
        );

        setCameraOn(
          false
        );


        setPermissionMessage(
          "Camera and microphone access is off. Enable permission in your browser to use them."
        );
      }
    }


    preparePreview();


    return () => {
      cancelled =
        true;


      streamRef.current
        ?.getTracks()
        .forEach(
          (
            track
          ) =>
            track.stop()
        );


      streamRef.current =
        null;
    };
  }, []);


  useEffect(() => {
    streamRef.current
      ?.getAudioTracks()
      .forEach(
        (
          track
        ) => {
          track.enabled =
            micOn;
        }
      );
  }, [
    micOn,
  ]);


  useEffect(() => {
    streamRef.current
      ?.getVideoTracks()
      .forEach(
        (
          track
        ) => {
          track.enabled =
            cameraOn;
        }
      );
  }, [
    cameraOn,
  ]);


  const sessionTitle =
    appointment
      ?.enquiry
      ?.supportTopic
      ? `${appointment.enquiry.supportTopic} session`
      : "Wellbeing session";


  const copy =
    getStatusCopy(
      status
    );


  return (
    <main
      className="vc-lobby"
    >

      <header
        className="vc-lobby-heading"
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


      <section
        className="vc-lobby-grid"
      >

        <div
          className="vc-preview"
        >

          <video
            ref={
              videoRef
            }
            autoPlay
            playsInline
            muted
          />


          {!cameraOn && (
            <div
              className="vc-video-placeholder"
            >
              Camera is off
            </div>
          )}


          <div
            className="vc-preview-controls"
          >

            <button
              type="button"

              onClick={() =>
                setMicOn(
                  (
                    value
                  ) =>
                    !value
                )
              }

              aria-label={
                micOn
                  ? "Mute microphone"
                  : "Unmute microphone"
              }
            >
              <img
                src={
                  micOn
                    ? micOnIcon
                    : micOffIcon
                }
                alt=""
              />
            </button>


            <button
              type="button"

              onClick={() =>
                setCameraOn(
                  (
                    value
                  ) =>
                    !value
                )
              }

              aria-label={
                cameraOn
                  ? "Turn camera off"
                  : "Turn camera on"
              }
            >
              <img
                src={
                  cameraOn
                    ? cameraOnIcon
                    : cameraOffIcon
                }
                alt=""
              />
            </button>

          </div>

        </div>


        <aside
          className="vc-ready-panel"
        >

          <h2>
            {copy.title}
          </h2>


          <p>
            {copy.body}
          </p>


          {permissionMessage && (
            <small>
              {
                permissionMessage
              }
            </small>
          )}


          <button
            type="button"

            className="vc-join-button"

            disabled={
              joining ||
              !status
                ?.joinAllowed ||
              status
                ?.callStatus ===
                "ENDED"
            }

            onClick={() =>
              onJoin({
                micOn,
                cameraOn,
              })
            }
          >
            {joining
              ? "Joining…"
              : "Join call"}
          </button>


          {error && (
            <div
              className="vc-error"
            >
              {error}
            </div>
          )}

        </aside>

      </section>

    </main>
  );
}