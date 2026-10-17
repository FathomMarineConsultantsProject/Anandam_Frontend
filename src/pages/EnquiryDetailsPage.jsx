import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  acceptProposal,
  getMyEnquiryById,
  requestAnotherTime,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


export default function EnquiryDetailsPage() {
  const { enquiryId } = useParams();

  const navigate = useNavigate();

  const [enquiry, setEnquiry] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [processing, setProcessing] =
    useState(false);

  const [showReschedule, setShowReschedule] =
    useState(false);

  const [rescheduleMessage, setRescheduleMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ======================================================
  // LOAD ENQUIRY
  // ======================================================

  const loadEnquiry = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyEnquiryById(
          enquiryId
        );

      setEnquiry(
        data.enquiry
      );
    } catch (err) {
      console.error(
        "loadEnquiry:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load enquiry."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadEnquiry();
  }, [enquiryId]);


  // ======================================================
  // ACTIVE PROPOSAL
  // ======================================================

  const activeProposal =
    enquiry?.proposals?.find(
      (proposal) =>
        proposal.status ===
        "PENDING"
    );


  // ======================================================
  // CONFIRM PROPOSAL
  // ======================================================

  const handleConfirm = async () => {
    if (!activeProposal) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await acceptProposal(
        enquiryId,
        activeProposal.id
      );

      navigate(
        "/marketplace/appointments",
        {
          state: {
            appointmentConfirmed:
              true,
          },
        }
      );
    } catch (err) {
      console.error(
        "handleConfirm:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to confirm appointment."
      );
    } finally {
      setProcessing(false);
    }
  };


  // ======================================================
  // REQUEST ANOTHER TIME
  // ======================================================

  const handleRequestAnotherTime =
    async () => {
      if (!activeProposal) {
        return;
      }

      try {
        setProcessing(true);
        setError("");

        await requestAnotherTime(
          enquiryId,
          activeProposal.id,
          rescheduleMessage
        );

        await loadEnquiry();

        setShowReschedule(false);
        setRescheduleMessage("");
      } catch (err) {
        console.error(
          "handleRequestAnotherTime:",
          err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to request another time."
        );
      } finally {
        setProcessing(false);
      }
    };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-content">
          Loading enquiry...
        </div>
      </div>
    );
  }


  // ======================================================
  // NOT FOUND
  // ======================================================

  if (!enquiry) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-content">

          <button
            className="marketplace-back-button"
            onClick={() =>
              navigate(
                "/marketplace/enquiries"
              )
            }
          >
            ← Back to enquiries
          </button>

          <div className="marketplace-error">
            {error ||
              "Enquiry not found."}
          </div>

        </div>
      </div>
    );
  }


  const practitioner =
    enquiry.practitioner;


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="marketplace-page">

      <div className="marketplace-content enquiry-detail-container">

        {/* BACK */}

        <button
          className="marketplace-back-button"
          onClick={() =>
            navigate(
              "/marketplace/enquiries"
            )
          }
        >
          ← Back to enquiries
        </button>


        <div className="enquiry-detail-card">

          {/* PRACTITIONER */}

          <div className="enquiry-card-person">

            <div className="profile-avatar-medium">

              {practitioner?.profileImageUrl ? (
                <img
                  src={
                    practitioner.profileImageUrl
                  }
                  alt={
                    practitioner?.user
                      ?.fullName ||
                    "Practitioner"
                  }
                />
              ) : (
                practitioner?.user
                  ?.fullName?.[0] ||
                "P"
              )}

            </div>


            <div>

              <h1>
                {
                  practitioner?.user
                    ?.fullName
                }
              </h1>

              <p>
                {
                  practitioner
                    ?.professionalTitle
                }
              </p>

            </div>

          </div>


          {/* USER ENQUIRY */}

          <div className="enquiry-detail-section">

            <h3>
              Your enquiry
            </h3>


            <div className="enquiry-detail-grid">

              <div>

                <span>
                  Support topic
                </span>

                <strong>
                  {
                    enquiry.supportTopic ||
                    "—"
                  }
                </strong>

              </div>


              <div>

                <span>
                  Status
                </span>

                <strong>
                  {
                    enquiry.status
                  }
                </strong>

              </div>

            </div>


            {enquiry.message && (

              <p className="enquiry-user-message">
                {
                  enquiry.message
                }
              </p>

            )}

          </div>


          {/* PENDING */}

          {enquiry.status ===
            "PENDING" && (

            <div className="waiting-card">

              <h3>
                Waiting for the practitioner
              </h3>

              <p>
                Your enquiry has been sent.
                If the practitioner accepts,
                they’ll suggest a time for
                your session.
              </p>

            </div>

          )}


          {/* RESCHEDULE REQUESTED */}

          {enquiry.status ===
            "RESCHEDULE_REQUESTED" && (

            <div className="waiting-card">

              <h3>
                Another time requested
              </h3>

              <p>
                The practitioner will review
                your request and send a
                revised proposal.
              </p>

            </div>

          )}


          {/* PRACTITIONER DECLINED */}

          {enquiry.status ===
            "DECLINED" && (

            <div className="declined-card">

              <h3>
                Enquiry declined
              </h3>

              <p>
                The practitioner did not
                accept your session request.
              </p>


              {enquiry.declinedReason && (

                <p>
                  {
                    enquiry.declinedReason
                  }
                </p>

              )}


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


          {/* USER DECLINED PROPOSAL / CLOSED */}

          {enquiry.status ===
            "CLOSED" && (

            <div className="declined-card">

              <h3>
                Enquiry closed
              </h3>

              <p>
                This enquiry is no longer
                active.
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


          {/* CONFIRMED */}

          {enquiry.status ===
            "CONFIRMED" &&
            enquiry.appointment && (

            <div className="waiting-card">

              <h3>
                Session confirmed
              </h3>

              <p>
                Your appointment has been
                booked successfully.
              </p>

              <button
                className="marketplace-primary-button"
                onClick={() =>
                  navigate(
                    "/marketplace/appointments"
                  )
                }
              >
                View appointments
              </button>

            </div>

          )}


          {/* ACTIVE PROPOSAL */}

          {activeProposal &&
            enquiry.status ===
              "TIME_PROPOSED" && (

            <div className="proposal-card">

              <span className="proposal-label">
                Proposed session
              </span>


              <h2>
                {new Date(
                  activeProposal.proposedStart
                ).toLocaleString()}
              </h2>


              <div className="proposal-detail-grid">

                <div>

                  <span>
                    Duration
                  </span>

                  <strong>
                    {
                      activeProposal.durationMinutes
                    }{" "}
                    minutes
                  </strong>

                </div>


                <div>

                  <span>
                    Call type
                  </span>

                  <strong>
                    {
                      activeProposal.sessionType
                    }
                  </strong>

                </div>


                <div>

                  <span>
                    Time zone
                  </span>

                  <strong>
                    {
                      activeProposal.timeZone
                    }
                  </strong>

                </div>

              </div>


              {activeProposal.practitionerMessage && (

                <p>
                  {
                    activeProposal.practitionerMessage
                  }
                </p>

              )}


              <div className="proposal-question">

                <h3>
                  Does this time work for you?
                </h3>


                <div className="proposal-actions">

                  <button
                    className="marketplace-primary-button"
                    disabled={
                      processing
                    }
                    onClick={
                      handleConfirm
                    }
                  >
                    {processing
                      ? "Confirming..."
                      : "Confirm time"}
                  </button>


                  <button
                    className="marketplace-secondary-button"
                    disabled={
                      processing
                    }
                    onClick={() =>
                      setShowReschedule(
                        true
                      )
                    }
                  >
                    Request another time
                  </button>

                </div>

              </div>

            </div>

          )}


          {/* ERROR */}

          {error && (

            <div className="marketplace-error">
              {error}
            </div>

          )}

        </div>


        {/* ===============================================
            RESCHEDULE MODAL
        =============================================== */}

        {showReschedule && (

          <div className="marketplace-modal-backdrop">

            <div className="marketplace-modal">

              <h2>
                Request another time
              </h2>

              <p>
                Let the practitioner know
                what would work better for
                you.
              </p>


              <textarea
                rows="5"
                placeholder="For example: Evenings after 6 PM work better for me."
                value={
                  rescheduleMessage
                }
                onChange={(event) =>
                  setRescheduleMessage(
                    event.target.value
                  )
                }
              />


              <div className="marketplace-modal-actions">

                <button
                  className="marketplace-secondary-button"
                  disabled={
                    processing
                  }
                  onClick={() =>
                    setShowReschedule(
                      false
                    )
                  }
                >
                  Cancel
                </button>


                <button
                  className="marketplace-primary-button"
                  disabled={
                    processing
                  }
                  onClick={
                    handleRequestAnotherTime
                  }
                >
                  {processing
                    ? "Sending..."
                    : "Send request"}
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}