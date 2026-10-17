import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  createEnquiry,
  getPractitionerBySlug,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";

const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const TIMES = [
  {
    value: "MORNING",
    label: "Morning",
  },
  {
    value: "AFTERNOON",
    label: "Afternoon",
  },
  {
    value: "EVENING",
    label: "Evening",
  },
];

export default function SendEnquiryPage() {
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
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    form,
    setForm,
  ] = useState({
    supportTopic: "",
    message: "",
    preferredDays: [],
    preferredTimes: [],
    timeZone:
      Intl.DateTimeFormat()
        .resolvedOptions()
        .timeZone || "",
  });


  // ======================================================
  // LOAD PRACTITIONER
  // ======================================================

  useEffect(() => {
    const loadPractitioner =
      async () => {
        try {
          setLoading(true);

          const data =
            await getPractitionerBySlug(
              slug
            );

          setPractitioner(
            data.practitioner
          );
        } catch (err) {
          console.error(err);

          setError(
            "Unable to load practitioner."
          );
        } finally {
          setLoading(false);
        }
      };

    loadPractitioner();
  }, [slug]);


  // ======================================================
  // FORM HELPERS
  // ======================================================

  const toggleDay = (day) => {
    setForm((current) => {
      const exists =
        current.preferredDays.includes(
          day
        );

      return {
        ...current,

        preferredDays:
          exists
            ? current.preferredDays.filter(
                (item) =>
                  item !== day
              )
            : [
                ...current.preferredDays,
                day,
              ],
      };
    });
  };


  const toggleTime = (time) => {
    setForm((current) => {
      const exists =
        current.preferredTimes.includes(
          time
        );

      return {
        ...current,

        preferredTimes:
          exists
            ? current.preferredTimes.filter(
                (item) =>
                  item !== time
              )
            : [
                ...current.preferredTimes,
                time,
              ],
      };
    });
  };


  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (
        !practitioner?.id
      ) {
        return;
      }

      try {
        setSubmitting(true);
        setError("");

        await createEnquiry({
          practitionerId:
            practitioner.id,

          supportTopic:
            form.supportTopic,

          message:
            form.message,

          preferredDays:
            form.preferredDays,

          preferredTimes:
            form.preferredTimes,

          timeZone:
            form.timeZone,
        });

        navigate(
          "/marketplace/enquiries",
          {
            state: {
              enquirySent:
                true,
            },
          }
        );
      } catch (err) {
        console.error(err);

        setError(
          err?.response?.data?.message ||
            "Unable to send enquiry."
        );
      } finally {
        setSubmitting(false);
      }
    };


  if (loading) {
    return (
      <div className="marketplace-page">
        Loading...
      </div>
    );
  }

  if (
    error &&
    !practitioner
  ) {
    return (
      <div className="marketplace-page">
        {error}
      </div>
    );
  }


  return (
    <div className="marketplace-page">
      <div className="enquiry-page-container">

        <button
          className="marketplace-back-button"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <div className="enquiry-layout">

          <div className="enquiry-form-card">

            <div className="enquiry-heading">
              <h1>
                Send an enquiry
              </h1>

              <p>
                Share what you’re
                looking for and your
                preferred availability.
              </p>
            </div>


            <div className="enquiry-practitioner-summary">
              <div className="enquiry-avatar">
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
                <strong>
                  {
                    practitioner
                      ?.user
                      ?.fullName
                  }
                </strong>

                <span>
                  {
                    practitioner
                      ?.professionalTitle
                  }
                </span>
              </div>
            </div>


            <form
              onSubmit={
                handleSubmit
              }
            >

              <div className="marketplace-form-group">
                <label>
                  What would you like
                  support with?
                </label>

                <select
                  value={
                    form.supportTopic
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      supportTopic:
                        e.target.value,
                    })
                  }
                  required
                >
                  <option value="">
                    Select a topic
                  </option>

                  {practitioner?.specialties?.map(
                    (item) => (
                      <option
                        key={
                          item
                            .specialty
                            .id
                        }
                        value={
                          item
                            .specialty
                            .name
                        }
                      >
                        {
                          item
                            .specialty
                            .name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>


              <div className="marketplace-form-group">
                <label>
                  Tell the practitioner
                  a little more
                </label>

                <textarea
                  rows="5"
                  placeholder="Share anything that may help the practitioner understand what support you're looking for."
                  value={
                    form.message
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,

                      message:
                        e.target.value,
                    })
                  }
                />
              </div>


              <div className="marketplace-form-group">
                <label>
                  Preferred days
                </label>

                <div className="choice-grid">
                  {DAYS.map(
                    (day) => (
                      <button
                        type="button"
                        key={day}
                        className={
                          form.preferredDays.includes(
                            day
                          )
                            ? "choice-chip active"
                            : "choice-chip"
                        }
                        onClick={() =>
                          toggleDay(
                            day
                          )
                        }
                      >
                        {day
                          .slice(
                            0,
                            3
                          )
                          .toLowerCase()}
                      </button>
                    )
                  )}
                </div>
              </div>


              <div className="marketplace-form-group">
                <label>
                  Preferred time
                </label>

                <div className="choice-grid">
                  {TIMES.map(
                    (time) => (
                      <button
                        type="button"
                        key={
                          time.value
                        }
                        className={
                          form.preferredTimes.includes(
                            time.value
                          )
                            ? "choice-chip active"
                            : "choice-chip"
                        }
                        onClick={() =>
                          toggleTime(
                            time.value
                          )
                        }
                      >
                        {
                          time.label
                        }
                      </button>
                    )
                  )}
                </div>
              </div>


              <div className="marketplace-form-group">
                <label>
                  Time zone
                </label>

                <input
                  type="text"
                  value={
                    form.timeZone
                  }
                  readOnly
                />

                <small>
                  We use your current
                  device time zone.
                </small>
              </div>


              {error && (
                <div className="marketplace-error">
                  {error}
                </div>
              )}


              <button
                type="submit"
                className="marketplace-primary-button marketplace-full-button"
                disabled={
                  submitting
                }
              >
                {submitting
                  ? "Sending..."
                  : "Send enquiry"}
              </button>

              <p className="enquiry-note">
                Sending an enquiry does
                not confirm a booking.
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}