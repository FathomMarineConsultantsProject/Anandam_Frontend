import { useEffect, useRef, useState } from "react";

export default function VideoLobby({ appointment, practitioner, status, onJoin, joining = false, error = "" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [permissionError, setPermissionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { stream.getTracks().forEach((track) => track.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setPermissionError("Allow camera and microphone access in your browser to preview the call.");
      }
    }
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  function toggleVideo() {
    const next = !cameraOn;
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setCameraOn(next);
  }
  function toggleMic() {
    const next = !micOn;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setMicOn(next);
  }

  const name = practitioner?.user?.fullName || "your practitioner";
  const joinAllowed = status?.joinAllowed !== false;

  return (
    <div className="vc-lobby">
      <div className="vc-lobby-heading"><h1>{appointment?.enquiry?.supportTopic || `Session with ${name}`}</h1><p>{appointment?.scheduledStart ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(appointment.scheduledStart)) : ""}</p></div>
      <div className="vc-lobby-grid">
        <div className={`vc-preview ${!cameraOn ? "vc-camera-off" : ""}`}>
          <video ref={videoRef} autoPlay muted playsInline />
          {!cameraOn && <div className="vc-video-placeholder">Camera off</div>}
          <div className="vc-preview-controls"><button onClick={toggleMic} className={!micOn ? "is-off" : ""} aria-label="Toggle microphone">{micOn ? "🎙" : "🔇"}</button><button onClick={toggleVideo} className={!cameraOn ? "is-off" : ""} aria-label="Toggle camera">{cameraOn ? "📹" : "🚫"}</button></div>
        </div>
        <div className="vc-ready-panel"><h2>Ready to Join ?</h2><p>{status?.participantCount > 0 ? `${status.participantCount} participant${status.participantCount === 1 ? "" : "s"} already here` : "No one else is here"}</p>{!joinAllowed && status?.joinOpensAt && <small>You can join when the session opens at {new Date(status.joinOpensAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.</small>}<button className="vc-join-button" onClick={() => onJoin({ micOn, cameraOn })} disabled={!joinAllowed || joining}>{joining ? "Joining..." : "Join call"}</button>{(error || permissionError) && <div className="vc-error">{error || permissionError}</div>}</div>
      </div>
    </div>
  );
}
