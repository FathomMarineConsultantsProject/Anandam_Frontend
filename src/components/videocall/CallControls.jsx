import {
  useState,
} from "react";

import {
  useLocalParticipant,
} from "@livekit/components-react";

import VideoControlIcon from "./VideoControlIcon";


export default function CallControls({
  onEndSession,
  onLeave,
  ending = false,
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
    if (busy) {
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
    if (busy) {
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
    <div className="vc-controls">

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
        <VideoControlIcon
          name={
            isMicrophoneEnabled
              ? "mic"
              : "micOff"
          }
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
        <VideoControlIcon
          name={
            isCameraEnabled
              ? "camera"
              : "cameraOff"
          }
        />
      </button>


      <button
        type="button"
        className="vc-control-button"
        aria-label="Call settings"
      >
        <VideoControlIcon
          name="settings"
        />
      </button>


      <button
        type="button"
        className="vc-end-button"
        onClick={
          onEndSession
        }
        disabled={
          ending
        }
        aria-label="End session"
      >
        <span className="vc-end-phone">
          ☎
        </span>
      </button>

    </div>
  );
}