import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import VideoRoom from "../components/videocall/VideoRoom";
import {
  createVideoCallToken,
  endVideoCall,
  getVideoAppointmentDetails,
} from "../api/videoCallApi";
import "../styles/video-call.css";

export default function VideoCallRoomPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [access, setAccess] = useState(location.state?.access || null);
  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [loading, setLoading] = useState(!access || !appointment);
  const [error, setError] = useState("");
  const micOn = location.state?.micOn ?? true;
  const cameraOn = location.state?.cameraOn ?? true;

  useEffect(() => {
    if (access && appointment) return undefined;
    let active = true;

    async function recover() {
      try {
        const [accessData, appointmentData] = await Promise.all([
          createVideoCallToken(appointmentId),
          getVideoAppointmentDetails(appointmentId),
        ]);
        if (!active) return;
        setAccess(accessData);
        setAppointment(appointmentData?.appointment || null);
      } catch (err) {
        if (active) setError(err?.data?.message || err?.message || "Unable to connect to the session.");
      } finally {
        if (active) setLoading(false);
      }
    }

    recover();
    return () => { active = false; };
  }, [appointmentId, access, appointment]);

  async function endSession() {
    const confirmed = window.confirm("End this session for everyone?");
    if (!confirmed) return;

    try {
      await endVideoCall(appointmentId);
      const destination = access?.participant?.role === "PRACTITIONER"
        ? "/marketplace/practitioner/sessions?tab=history"
        : "/marketplace/appointments";
      navigate(destination, { replace: true, state: { sessionEnded: true } });
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to end session.");
    }
  }

  if (loading) return <div className="vc-loading">Connecting…</div>;
  if (!access?.token || !access?.livekitUrl) return <div className="vc-loading">{error || "Call access is unavailable."}</div>;

  return (
    <LiveKitRoom
      serverUrl={access.livekitUrl}
      token={access.token}
      connect
      audio={micOn}
      video={cameraOn}
      onError={(err) => setError(err?.message || "LiveKit connection failed.")}
      onDisconnected={() => {}}
    >
      {error && <div className="vc-floating-error">{error}</div>}
      <VideoRoom appointment={appointment} onEndSession={endSession} />
    </LiveKitRoom>
  );
}
