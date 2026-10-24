import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  LiveKitRoom,
} from "@livekit/components-react";

import "@livekit/components-styles";

import VideoRoom from "../components/videocall/VideoRoom";

import {
  createVideoCallToken,
  endVideoCall,
  getVideoAppointmentDetails,
  markVideoCallConnected,
} from "../api/videoCallApi";

import "../styles/video-call.css";

export default function VideoCallRoomPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [access, setAccess] =
    useState(
      location.state?.access || null
    );

  const [appointment, setAppointment] =
    useState(
      location.state?.appointment || null
    );

  const [loading, setLoading] =
    useState(
      !access || !appointment
    );

  const [error, setError] =
    useState("");

  const [ending, setEnding] =
    useState(false);

  const connectedReportedRef =
    useRef(false);

  const leavingRef =
    useRef(false);

  const micOn =
    location.state?.micOn ?? true;

  const cameraOn =
    location.state?.cameraOn ?? true;

  const destinationForRole =
    useCallback(
      (role) =>
        role === "PRACTITIONER"
          ? "/marketplace/practitioner/sessions?tab=history"
          : "/marketplace/appointments",
      []
    );

  /*
    If user refreshes the call page,
    React Router state is lost.

    Recover the token and appointment
    from the backend.
  */
  useEffect(() => {
    if (
      access &&
      appointment
    ) {
      return undefined;
    }

    let active = true;

    const recover =
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            accessData,
            appointmentData,
          ] =
            await Promise.all([
              createVideoCallToken(
                appointmentId
              ),

              getVideoAppointmentDetails(
                appointmentId
              ),
            ]);

          if (!active) {
            return;
          }

          setAccess(
            accessData || null
          );

          setAppointment(
            appointmentData
              ?.appointment ||
              null
          );
        } catch (err) {
          if (!active) {
            return;
          }

          setError(
            err?.data?.message ||
              err?.message ||
              "Unable to connect to the session."
          );
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      };

    recover();

    return () => {
      active = false;
    };
  }, [
    appointmentId,
    access,
    appointment,
  ]);

  /*
    IMPORTANT:
    This is called ONLY after LiveKit
    confirms the browser is actually
    connected to the room.

    It tells the backend to set:
    - callStartedAt
    - userJoinedAt OR practitionerJoinedAt
  */
  const reportConnected =
    useCallback(
      async () => {
        if (
          connectedReportedRef.current
        ) {
          return;
        }

        connectedReportedRef.current =
          true;

        try {
          await markVideoCallConnected(
            appointmentId
          );
        } catch (err) {
          /*
            LiveKit may already be connected.

            Do not throw the user out of
            the call just because the
            status-reporting API failed.
          */
          connectedReportedRef.current =
            false;

          setError(
            err?.data?.message ||
              err?.message ||
              "Connected to the call, but session status could not be updated."
          );
        }
      },
      [appointmentId]
    );

  const goAfterCall =
    useCallback(() => {
      const role =
        access?.participant?.role;

      navigate(
        destinationForRole(
          role
        ),
        {
          replace: true,

          state: {
            sessionEnded: true,
          },
        }
      );
    }, [
      access?.participant?.role,
      destinationForRole,
      navigate,
    ]);

  /*
    End session for BOTH people.

    This calls backend /end,
    which closes the LiveKit room
    and marks appointment COMPLETED.
  */
  const endSession =
    useCallback(
      async () => {
        if (ending) {
          return;
        }

        const confirmed =
          window.confirm(
            "End this session for everyone?"
          );

        if (!confirmed) {
          return;
        }

        try {
          setEnding(true);
          setError("");

          /*
            /end will delete the LiveKit room,
            which fires onDisconnected.
            Prevent duplicate navigation.
          */
          leavingRef.current =
            true;

          await endVideoCall(
            appointmentId
          );

          goAfterCall();
        } catch (err) {
          leavingRef.current =
            false;

          setError(
            err?.data?.message ||
              err?.message ||
              "Unable to end this session."
          );
        } finally {
          setEnding(false);
        }
      },
      [
        appointmentId,
        ending,
        goAfterCall,
      ]
    );

  /*
    Leave only this browser.

    Appointment stays active.
    Other participant remains in room.
  */
  const leaveWithoutCompleting =
    useCallback(() => {
      leavingRef.current =
        true;

      navigate(
        destinationForRole(
          access?.participant?.role
        ),
        {
          replace: true,
        }
      );
    }, [
      access?.participant?.role,
      destinationForRole,
      navigate,
    ]);

  /*
    If the other participant ends the
    session, LiveKit disconnects us.

    Return to session/history page.
  */
  const handleDisconnected =
    useCallback(() => {
      if (
        leavingRef.current
      ) {
        return;
      }

      goAfterCall();
    }, [
      goAfterCall,
    ]);

  if (loading) {
    return (
      <div className="vc-loading">
        Connecting…
      </div>
    );
  }

  if (
    !access?.token ||
    !access?.livekitUrl
  ) {
    return (
      <div className="vc-loading">
        {error ||
          "Call access is unavailable."}
      </div>
    );
  }

  return (
    <LiveKitRoom
      serverUrl={
        access.livekitUrl
      }
      token={
        access.token
      }
      connect={true}
      audio={micOn}
      video={cameraOn}

      onConnected={
        reportConnected
      }

      onDisconnected={
        handleDisconnected
      }

      onError={(err) =>
        setError(
          err?.message ||
            "LiveKit connection failed."
        )
      }
    >
      {error && (
        <div className="vc-floating-error">
          {error}
        </div>
      )}

      <VideoRoom
        appointment={
          appointment
        }
        ending={
          ending
        }
        onEndSession={
          endSession
        }
        onLeave={
          leaveWithoutCompleting
        }
      />
    </LiveKitRoom>
  );
}
