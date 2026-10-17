import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getMyAppointments,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


export default function MyAppointmentsPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {
    const loadAppointments =
      async () => {
        try {
          const data =
            await getMyAppointments();

          setAppointments(
            data.appointments || []
          );
        } catch (err) {
          console.error(err);

          setError(
            "Unable to load appointments."
          );
        } finally {
          setLoading(false);
        }
      };

    loadAppointments();
  }, []);


  return (
    <div className="marketplace-page">

      <div className="marketplace-content">

        <div className="marketplace-page-header">

          <div>
            <h1>
              My appointments
            </h1>

            <p>
              View your confirmed and
              upcoming sessions.
            </p>
          </div>

        </div>


        <div className="marketplace-tabs">

          <button
            className="marketplace-tab"
            onClick={() =>
              navigate(
                "/marketplace/enquiries"
              )
            }
          >
            My enquiries
          </button>

          <button className="marketplace-tab active">
            My appointments
          </button>

        </div>


        {location.state
          ?.appointmentConfirmed && (
          <div className="marketplace-success-banner">
            <strong>
              Session booked
            </strong>

            <span>
              Your appointment has been
              confirmed.
            </span>
          </div>
        )}


        {loading && (
          <p>
            Loading appointments...
          </p>
        )}


        {error && (
          <div className="marketplace-error">
            {error}
          </div>
        )}


        {!loading &&
          appointments.length ===
            0 && (
            <div className="marketplace-empty-state">

              <h3>
                No appointments yet
              </h3>

              <p>
                Confirm a proposed
                session time and it will
                appear here.
              </p>

            </div>
          )}


        <div className="appointment-list">

          {appointments.map(
            (appointment) => (
              <div
                className="appointment-card"
                key={
                  appointment.id
                }
              >

                <div className="appointment-date">

                  <strong>
                    {new Date(
                      appointment.scheduledStart
                    ).toLocaleDateString(
                      undefined,
                      {
                        month:
                          "short",

                        day:
                          "numeric",
                      }
                    )}
                  </strong>

                  <span>
                    {new Date(
                      appointment.scheduledStart
                    ).toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",

                        minute:
                          "2-digit",
                      }
                    )}
                  </span>

                </div>


                <div className="appointment-practitioner">

                  <h3>
                    {
                      appointment
                        .practitioner
                        ?.user
                        ?.fullName
                    }
                  </h3>

                  <p>
                    {
                      appointment
                        .practitioner
                        ?.professionalTitle
                    }
                  </p>

                  <span>
                    {
                      appointment.sessionType
                    }
                    {" • "}
                    {
                      appointment.status
                    }
                  </span>

                </div>


                <button
                  className="marketplace-secondary-button"
                  onClick={() =>
                    navigate(
                      `/marketplace/appointments/${appointment.id}`
                    )
                  }
                >
                  View details
                </button>

              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}