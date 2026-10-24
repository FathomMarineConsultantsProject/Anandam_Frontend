import {
  useState,
} from "react";

import {
  useLocalParticipant,
} from "@livekit/components-react";


import micOnIcon from "../../assets/videocall/mic-on.png";
import micOffIcon from "../../assets/videocall/mic-off.png";

import cameraOnIcon from "../../assets/videocall/camera-on.png";
import cameraOffIcon from "../../assets/videocall/camera-off.png";

import settingsIcon from "../../assets/videocall/settings.png";
import endCallIcon from "../../assets/videocall/end-call.png";


export default function CallControls({
  onEndSession,
  ending =
    false,
}) {
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
  } =
    useLocalParticipant();


  const [
    busy,
    setBusy,
  ] =
    useState(false);


  async function toggleMic() {
    if (
      busy
    ) {
      return;
    }


    try {
      setBusy(
        true
      );


      await localParticipant
        .setMicrophoneEnabled(
          !isMicrophoneEnabled
        );

    } finally {
      setBusy(
        false
      );
    }
  }


  async function toggleCamera() {
    if (
      busy
    ) {
      return;
    }


    try {
      setBusy(
        true
      );


      await localParticipant
        .setCameraEnabled(
          !isCameraEnabled
        );

    } finally {
      setBusy(
        false
      );
    }
  }


  return (
    <div
      className="vc-controls"
    >

      <button
        type="button"

        className="vc-control-button"

        onClick={
          toggleMic
        }

        disabled={
          busy
        }

        aria-label={
          isMicrophoneEnabled
            ? "Mute microphone"
            : "Unmute microphone"
        }
      >
        <img
          className="vc-control-image"

          src={
            isMicrophoneEnabled
              ? micOnIcon
              : micOffIcon
          }

          alt=""
        />
      </button>


      <button
        type="button"

        className="vc-control-button"

        onClick={
          toggleCamera
        }

        disabled={
          busy
        }

        aria-label={
          isCameraEnabled
            ? "Turn camera off"
            : "Turn camera on"
        }
      >
        <img
          className="vc-control-image"

          src={
            isCameraEnabled
              ? cameraOnIcon
              : cameraOffIcon
          }

          alt=""
        />
      </button>


      <button
        type="button"

        className="vc-control-button"

        aria-label="Call settings"
      >
        <img
          className="vc-control-image"

          src={
            settingsIcon
          }

          alt=""
        />
      </button>


      <button
        type="button"

        className="vc-control-button"

        onClick={
          onEndSession
        }

        disabled={
          ending
        }

        aria-label="End session"
      >
        <img
          className="vc-control-image"

          src={
            endCallIcon
          }

          alt=""
        />
      </button>

    </div>
  );
}