import { useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import VideoControlIcon from "./VideoControlIcon";

export default function CallControls({ onEndSession }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();
  const [busy, setBusy] = useState(false);

  async function toggleMic() {
    setBusy(true);
    try { await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled); } finally { setBusy(false); }
  }

  async function toggleCamera() {
    setBusy(true);
    try { await localParticipant.setCameraEnabled(!isCameraEnabled); } finally { setBusy(false); }
  }

  async function leave() {
    await room.disconnect();
    window.history.back();
  }

  return (
    <div className="vc-controls">
      <button className={!isMicrophoneEnabled ? "is-off" : ""} onClick={toggleMic} disabled={busy} aria-label="Toggle microphone">
        <VideoControlIcon name={isMicrophoneEnabled ? "mic" : "micOff"} />
      </button>
      <button className={!isCameraEnabled ? "is-off" : ""} onClick={toggleCamera} disabled={busy} aria-label="Toggle camera">
        <VideoControlIcon name={isCameraEnabled ? "camera" : "cameraOff"} />
      </button>
      <button className="vc-leave-button" onClick={leave} aria-label="Leave call">
        <VideoControlIcon name="leave" />
      </button>
      <button className="vc-end-button" onClick={onEndSession} aria-label="End session for everyone">
        <VideoControlIcon name="end" />
      </button>
    </div>
  );
}
