import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import VideoLobby from "../components/videocall/VideoLobby";

import {
  createVideoCallToken,
  getVideoAppointmentDetails,
  getVideoCallStatus,
} from "../api/videoCallApi";

import "../styles/video-call.css";

const STATUS_POLL_MS = 15000;

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
    let timer = null;

    const loadInitial = async () => {
      try {
        setLoading(true);
        setError("");

        const [appointmentData, statusData] =
          await Promise.all([
            getVideoAppointmentDetails(appointmentId),
            getVideoCallStatus(appointmentId),
          ]);

        if (!active) return;

        setAppointment(
          appointmentData?.appointment || null
        );

        setStatus(
          statusData || null
        );
      } catch (err) {
        if (!active) return;

        setError(
          err?.data?.message ||
            err?.message ||
            "Unable to load this session."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const refreshStatus = async () => {
      try {
        const statusData =
          await getVideoCallStatus(
            appointmentId
          );

        if (active) {
          setStatus(
            statusData || null
          );
        }
      } catch {
        // Keep lobby usable if one polling request fails.
      }
    };

    loadInitial();

    timer = window.setInterval(
      refreshStatus,
      STATUS_POLL_MS
    );

    return () => {
      active = false;

      if (timer) {
        window.clearInterval(timer);
      }
    };
  }, [appointmentId]);

  const join = async ({
    micOn,
    cameraOn,
  }) => {
    if (!status?.joinAllowed) {
      setError(
        status?.callStatus === "ENDED"
          ? "This session has already ended."
          : "The join window is not open yet."
      );

      return;
    }

    try {
      setJoining(true);
      setError("");

      const access =
        await createVideoCallToken(
          appointmentId
        );

      navigate(
        `/marketplace/appointments/${appointmentId}/call`,
        {
          state: {
            access,
            appointment,
            micOn,
            cameraOn,
          },
        }
      );
    } catch (err) {
      setError(
        err?.data?.message ||
          err?.message ||
          "Unable to join this session."
      );
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="vc-loading">
        Preparing your session…
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="vc-loading">
        {error || "Session not found."}
      </div>
    );
  }

  return (
    <VideoLobby
      appointment={appointment}
      status={status}
      onJoin={join}
      joining={joining}
      error={error}
    />
  );
}