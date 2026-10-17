import {
  useEffect,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  getMyEnquiries,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


const STATUS_LABELS = {
  PENDING:
    "Awaiting response",

  TIME_PROPOSED:
    "Time proposed",

  RESCHEDULE_REQUESTED:
    "Another time requested",

  CONFIRMED:
    "Confirmed",

  DECLINED:
    "Declined",

  CLOSED:
    "Closed",
};


export default function MyEnquiriesPage() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    enquiries,
    setEnquiries,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const loadEnquiries =
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getMyEnquiries();

        setEnquiries(
          data.enquiries || []
        );
      } catch (err) {
        console.error(err);

        setError(
          "Unable to load enquiries."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadEnquiries();
  }, []);


  return (
    <div className="marketplace-page">

      <div className="marketplace-content">

        <div className="marketplace-page-header">
          <div>
            <h1>
              My enquiries
            </h1>

            <p>
              Review your practitioner
              enquiries and proposed
              session times.
            </p>
          </div>

          <button
            className="marketplace-secondary-button"
            onClick={() =>
              navigate(
                "/marketplace"
              )
            }
          >
            Browse practitioners
          </button>
        </div>


        <div className="marketplace-tabs">

          <button className="marketplace-tab active">
            My enquiries
          </button>

          <button
            className="marketplace-tab"
            onClick={() =>
              navigate(
                "/marketplace/appointments"
              )
            }
          >
            My appointments
          </button>

        </div>


        {location.state
          ?.enquirySent && (
          <div className="marketplace-success-banner">
            <strong>
              Enquiry sent
            </strong>

            <span>
              The practitioner will
              review your enquiry. If
              accepted, they’ll suggest
              a time for your call.
            </span>
          </div>
        )}


        {loading && (
          <p>
            Loading enquiries...
          </p>
        )}


        {error && (
          <div className="marketplace-error">
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          enquiries.length ===
            0 && (
            <div className="marketplace-empty-state">
              <h3>
                No enquiries yet
              </h3>

              <p>
                Find a practitioner and
                send your first enquiry.
              </p>

              <button
                className="marketplace-primary-button"
                onClick={() =>
                  navigate(
                    "/marketplace"
                  )
                }
              >
                Browse practitioners
              </button>
            </div>
          )}


        <div className="enquiry-list">

          {enquiries.map(
            (enquiry) => {
              const practitioner =
                enquiry.practitioner;

              const latestProposal =
                enquiry.proposals?.[0];

              return (
                <div
                  className="enquiry-card"
                  key={
                    enquiry.id
                  }
                >

                  <div className="enquiry-card-top">

                    <div className="enquiry-card-person">

                      <div className="small-practitioner-avatar">
                        {practitioner
                          ?.profileImageUrl ? (
                          <img
                            src={
                              practitioner.profileImageUrl
                            }
                            alt=""
                          />
                        ) : (
                          practitioner
                            ?.user
                            ?.fullName?.[0] ||
                          "P"
                        )}
                      </div>

                      <div>
                        <h3>
                          {
                            practitioner
                              ?.user
                              ?.fullName
                          }
                        </h3>

                        <p>
                          {
                            practitioner
                              ?.professionalTitle
                          }
                        </p>
                      </div>
                    </div>


                    <span
                      className={`marketplace-status status-${enquiry.status.toLowerCase()}`}
                    >
                      {
                        STATUS_LABELS[
                          enquiry
                            .status
                        ]
                      }
                    </span>

                  </div>


                  <div className="enquiry-card-info">

                    {enquiry.supportTopic && (
                      <div>
                        <span>
                          Support
                        </span>

                        <strong>
                          {
                            enquiry.supportTopic
                          }
                        </strong>
                      </div>
                    )}


                    {latestProposal && (
                      <div>
                        <span>
                          Proposed time
                        </span>

                        <strong>
                          {new Date(
                            latestProposal.proposedStart
                          ).toLocaleString()}
                        </strong>
                      </div>
                    )}

                  </div>


                  <div className="enquiry-card-actions">

                    <button
                      className="marketplace-primary-button"
                      onClick={() =>
                        navigate(
                          `/marketplace/enquiries/${enquiry.id}`
                        )
                      }
                    >
                      {enquiry.status ===
                      "TIME_PROPOSED"
                        ? "Review time"
                        : "View enquiry"}
                    </button>

                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>
    </div>
  );
}