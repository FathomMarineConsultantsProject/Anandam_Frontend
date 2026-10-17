import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getPractitionerBySlug,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


// ======================================================
// HELPERS
// ======================================================

const formatCurrency = (
  value,
  currency = "INR"
) => {
  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(Number(value));
  } catch {
    return `${currency} ${value}`;
  }
};


const formatPractitionerType = (
  value
) => {
  if (!value) {
    return "Session";
  }

  return value
    .toLowerCase()
    .split("_")
    .map(
      (word) =>
        word.charAt(0)
          .toUpperCase() +
        word.slice(1)
    )
    .join(" ");
};


export default function PractitionerProfilePage() {
  const {
    slug,
  } = useParams();

  const navigate =
    useNavigate();


  const [
    practitioner,
    setPractitioner,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  // ======================================================
  // LOAD PRACTITIONER
  // ======================================================

  useEffect(() => {
    const loadPractitioner =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getPractitionerBySlug(
              slug
            );

          setPractitioner(
            data.practitioner
          );
        } catch (err) {
          console.error(
            "loadPractitioner:",
            err
          );

          setError(
            err?.response?.data?.message ||
              "Unable to load practitioner."
          );
        } finally {
          setLoading(false);
        }
      };

    loadPractitioner();
  }, [slug]);


  // ======================================================
  // STATES
  // ======================================================

  if (loading) {
    return (
      <div className="marketplace-page">

        <div className="marketplace-content">

          <div className="marketplace-profile-skeleton">
            Loading practitioner...
          </div>

        </div>

      </div>
    );
  }


  if (
    error ||
    !practitioner
  ) {
    return (
      <div className="marketplace-page">

        <div className="marketplace-content">

          <button
            className="marketplace-back-button"
            onClick={() =>
              navigate(
                "/marketplace"
              )
            }
          >
            ← Back
          </button>

          <div className="marketplace-error">
            {error ||
              "Practitioner not found."}
          </div>

        </div>

      </div>
    );
  }


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="marketplace-page">

      <div className="marketplace-content">

        {/* ===============================================
            BACK
        =============================================== */}

        <button
          className="marketplace-back-button"
          onClick={() =>
            navigate(
              "/marketplace"
            )
          }
        >
          ← Back
        </button>


        <div className="practitioner-profile-layout">


          {/* =============================================
              MAIN PROFILE
          ============================================= */}

          <main className="practitioner-profile-main">


            {/* PROFILE HEADER */}

            <section className="practitioner-profile-header">

              <div className="practitioner-profile-avatar">

                {practitioner
                  .profileImageUrl ? (

                  <img
                    src={
                      practitioner.profileImageUrl
                    }
                    alt={
                      practitioner.user
                        ?.fullName ||
                      "Practitioner"
                    }
                  />

                ) : (

                  <span>
                    {
                      practitioner
                        .user
                        ?.fullName?.[0] ||
                      "P"
                    }
                  </span>

                )}

              </div>


              <div className="practitioner-profile-title">

                <h1>
                  {
                    practitioner
                      .user
                      ?.fullName
                  }
                </h1>

                <p>
                  {
                    practitioner
                      .professionalTitle ||
                    formatPractitionerType(
                      practitioner.practitionerType
                    )
                  }
                </p>

              </div>

            </section>


            {/* ABOUT */}

            <section className="practitioner-profile-section">

              <h2>
                About
              </h2>

              <p className="practitioner-about-text">
                {practitioner.about ||
                  practitioner.shortBio ||
                  "No additional information has been added yet."}
              </p>

            </section>


            {/* SESSION DETAILS */}

            <section className="practitioner-profile-section">

              <h2>
                Session details
              </h2>

              <div className="practitioner-session-box">


                <div className="practitioner-session-item">

                  <span>
                    Session type
                  </span>

                  <strong>
                    {formatPractitionerType(
                      practitioner.practitionerType
                    )}
                  </strong>

                </div>


                <div className="practitioner-session-item">

                  <span>
                    Duration
                  </span>

                  <strong>
                    {
                      practitioner.sessionDurationMinutes
                    }{" "}
                    minutes
                  </strong>

                </div>


                <div className="practitioner-session-item">

                  <span>
                    Session fee
                  </span>

                  <strong>
                    {formatCurrency(
                      practitioner.sessionPrice,
                      practitioner.currency
                    )}{" "}
                    / session
                  </strong>

                </div>

              </div>

            </section>


            {/* SPECIALTIES */}

            <section className="practitioner-profile-section">

              <h2>
                Specialties
              </h2>

              {practitioner
                .specialties
                ?.length >
              0 ? (

                <div className="practitioner-profile-specialties">

                  {practitioner.specialties.map(
                    (
                      item
                    ) => (

                      <span
                        className="practitioner-specialty-chip"
                        key={
                          item
                            .specialty
                            .id
                        }
                      >
                        {
                          item
                            .specialty
                            .name
                        }
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p className="practitioner-muted-text">
                  No specialties
                  listed.
                </p>

              )}

            </section>


            {/* QUALIFICATIONS */}

            <section className="practitioner-profile-section">

              <h2>
                Qualifications
              </h2>

              {practitioner
                .qualificationSummary ? (

                <div className="practitioner-info-row">

                  <span className="practitioner-info-bullet" />

                  <p>
                    {
                      practitioner.qualificationSummary
                    }
                  </p>

                </div>

              ) : (

                <p className="practitioner-muted-text">
                  Qualification details
                  have not been added.
                </p>

              )}

            </section>


            {/* EXPERIENCE */}

            <section className="practitioner-profile-section">

              <h2>
                Professional experience
              </h2>

              {practitioner
                .experienceYears ? (

                <div className="practitioner-info-row">

                  <span className="practitioner-info-bullet" />

                  <p>
                    {
                      practitioner.experienceYears
                    }{" "}
                    years of
                    professional
                    experience
                  </p>

                </div>

              ) : (

                <p className="practitioner-muted-text">
                  Experience details
                  have not been added.
                </p>

              )}

            </section>


            {/* LANGUAGES */}

            <section className="practitioner-profile-section">

              <h2>
                Languages
              </h2>

              {practitioner
                .languages
                ?.length >
              0 ? (

                <div className="practitioner-info-row">

                  <span className="practitioner-info-bullet" />

                  <p>
                    {practitioner.languages.join(
                      ", "
                    )}
                  </p>

                </div>

              ) : (

                <p className="practitioner-muted-text">
                  No languages listed.
                </p>

              )}

            </section>

          </main>


          {/* =============================================
              ENQUIRY CTA
          ============================================= */}

          <aside className="practitioner-enquiry-sidebar">

            <div className="practitioner-enquiry-card">

              <h2>
                Enquire with{" "}
                {
                  practitioner
                    .user
                    ?.fullName
                }
              </h2>

              <p>
                Tell us what you need
                support with and when
                you're available for a
                session.
              </p>


              {practitioner
                .acceptingNewClients ? (

                <button
                  className="marketplace-primary-button marketplace-full-button"
                  onClick={() =>
                    navigate(
                      `/marketplace/practitioners/${practitioner.slug}/enquire`
                    )
                  }
                >
                  Send enquiry
                </button>

              ) : (

                <button
                  className="marketplace-primary-button marketplace-full-button"
                  disabled
                >
                  Currently unavailable
                </button>

              )}


              <small>
                Sending an enquiry does
                not confirm a booking.
              </small>

            </div>

          </aside>


        </div>

      </div>
    </div>
  );
}