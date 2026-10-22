import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoLobby from "../components/videocall/VideoLobby";
import {
  createVideoCallToken,
  getVideoAppointmentDetails,
  getVideoCallStatus,
} from "../api/videoCallApi";
import "../styles/video-call.css";

export default function VideoCallLobbyPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [appointmentData, statusData] = await Promise.all([
          getVideoAppointmentDetails(appointmentId),
          getVideoCallStatus(appointmentId),
        ]);
        if (!active) return;
        setAppointment(appointmentData?.appointment || null);
        setStatus(statusData);
      } catch (err) {
        if (active) setError(err?.data?.message || err?.message || "Unable to load session.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    const timer = window.setInterval(() => {
      getVideoCallStatus(appointmentId)
        .then((data) => active && setStatus(data))
        .catch(() => {});
    }, 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [appointmentId]);

  async function join({ micOn, cameraOn }) {
    try {
      setJoining(true);
      setError("");
      const access = await createVideoCallToken(appointmentId);
      navigate(`/marketplace/appointments/${appointmentId}/call`, {
        state: { access, micOn, cameraOn, appointment },
      });
    } catch (err) {
      setError(err?.data?.message || err?.message || "Unable to join this session.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) return <div className="vc-loading">Preparing your session…</div>;
  if (!appointment) return <div className="vc-loading">{error || "Session not found."}</div>;

  return (
    <VideoLobby
      appointment={appointment}
      practitioner={appointment.practitioner}
      status={status}
      onJoin={join}
      joining={joining}
      error={error}
    />
  );
}
