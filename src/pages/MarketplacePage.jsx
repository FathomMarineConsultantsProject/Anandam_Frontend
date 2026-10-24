import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  acceptProposal,
  getMyAppointments,
  getMyEnquiries,
  getPractitioners,
  requestAnotherTime,
} from "../api/marketplaceApi";

import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import MarketplaceIcon from "../components/marketplace/MarketplaceIcon";
import SessionCard from "../components/marketplace/SessionCard";
import RescheduleModal from "../components/marketplace/RescheduleModal";

import "../styles/marketplace.css";

const CATEGORIES = [
  "All",
  "Mental Health",
  "Counselling",
  "Physical Wellness",
  "Nutrition",
  "Yoga & Mindfulness",
];

function zonedDateTimeToUtc(
  dateString,
  timeString,
  timeZone
) {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  const [hour, minute] =
    timeString
      .split(":")
      .map(Number);

  const target =
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      0
    );

  let guess = target;

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      }
    );

  for (
    let i = 0;
    i < 2;
    i += 1
  ) {
    const parts =
      Object.fromEntries(
        formatter
          .formatToParts(
            new Date(guess)
          )
          .filter(
            (part) =>
              part.type !==
              "literal"
          )
          .map(
            (part) => [
              part.type,
              Number(
                part.value
              ),
            ]
          )
      );

    const shown =
      Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second || 0
      );

    guess +=
      target - shown;
  }

  return new Date(
    guess
  ).toISOString();
}

export default function MarketplacePage() {
  const navigate = useNavigate();

  const [practitioners, setPractitioners] =
    useState([]);

  const [enquiries, setEnquiries] =
    useState([]);

  const [confirming, setConfirming] =
    useState(false);

  const [rescheduling, setRescheduling] =
    useState(null);
  const [appointments, setAppointments] =
    useState([]);

  const [category, setCategory] =
    useState("All");

  const [language, setLanguage] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        practitionerData,
        enquiryData,
        appointmentData,
      ] = await Promise.all([
        getPractitioners(),

        getMyEnquiries()
          .catch(() => ({
            enquiries: [],
          })),

        getMyAppointments()
          .catch(() => ({
            appointments: [],
          })),
      ]);

      setPractitioners(
        practitionerData?.practitioners ||
        []
      );

      setEnquiries(
        enquiryData?.enquiries ||
        []
      );

      setAppointments(
        appointmentData?.appointments ||
        []
      );
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to load marketplace."
      );
    } finally {
      setLoading(false);
    }
  };

  async function confirmProposal(
    proposal
  ) {
    if (
      !activeEnquiry ||
      !proposal
    ) {
      return;
    }

    try {
      setConfirming(true);
      setError("");

      await acceptProposal(
        activeEnquiry.id,
        proposal.id
      );

      await load();
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to confirm session."
      );
    } finally {
      setConfirming(false);
    }
  };

  async function sendNewTime(
    values
  ) {
    if (
      !activeEnquiry ||
      !rescheduling
    ) {
      return;
    }

    try {
      setConfirming(true);
      setError("");

      const proposedStart =
        zonedDateTimeToUtc(
          values.date,
          values.time,
          values.timeZone
        );

      await requestAnotherTime(
        activeEnquiry.id,
        rescheduling.id,
        {
          proposedStart,

          durationMinutes:
            values.durationMinutes,

          timeZone:
            values.timeZone,

          sessionType:
            rescheduling
              .sessionType ||
            "VIDEO",

          message:
            values.reason,
        }
      );

      setRescheduling(null);

      await load();
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to request another time."
      );
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          practitionerData,
          enquiryData,
          appointmentData,
        ] = await Promise.all([
          getPractitioners(),

          getMyEnquiries()
            .catch(() => ({
              enquiries: [],
            })),

          getMyAppointments()
            .catch(() => ({
              appointments: [],
            })),
        ]);

        if (!active) return;

        setPractitioners(
          practitionerData?.practitioners ||
          []
        );

        setEnquiries(
          enquiryData?.enquiries ||
          []
        );

        setAppointments(
          appointmentData?.appointments ||
          []
        );
      } catch (err) {
        if (!active) return;

        setError(
          err?.data?.message ||
          err?.message ||
          "Unable to load marketplace."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      active = false;
    };
  }, []);

  /*
    Once an appointment exists, the marketplace
    should show the booked session card instead
    of continuing to show a CONFIRMED enquiry.
  */
  const upcomingAppointment =
    useMemo(() => {
      return appointments
        .filter(
          (item) =>
            item.status ===
            "CONFIRMED"
        )
        .sort(
          (a, b) =>
            new Date(
              a.scheduledStart
            ) -
            new Date(
              b.scheduledStart
            )
        )[0] || null;
    }, [appointments]);

  const activeEnquiries =
  useMemo(
    () =>
      enquiries.filter(
        (
          enquiry
        ) => {
          const appointmentStatus =
            enquiry
              ?.appointment
              ?.status;

          const ended =
            [
              "COMPLETED",
              "CANCELLED",
              "NO_SHOW",
            ].includes(
              appointmentStatus
            );

          if (ended) {
            return false;
          }

          return [
            "PENDING",
            "TIME_PROPOSED",
            "RESCHEDULE_REQUESTED",
          ].includes(
            enquiry.status
          );
        }
      ),
    [enquiries]
  );

const activeEnquiry =
  activeEnquiries[0] ||
  null;

  const languages =
    useMemo(
      () =>
        Array.from(
          new Set(
            practitioners.flatMap(
              (p) =>
                p.languages || []
            )
          )
        ).sort(),
      [practitioners]
    );

  const locations =
    useMemo(
      () =>
        Array.from(
          new Set(
            practitioners
              .map(
                (p) =>
                  p.location ||
                  p.country ||
                  p.user
                    ?.homeCountry
              )
              .filter(Boolean)
          )
        ).sort(),
      [practitioners]
    );

  const filtered =
    useMemo(
      () =>
        practitioners.filter(
          (p) => {
            const typeText =
              `${p.practitionerType || ""} ${p.professionalTitle || ""}`.toLowerCase();

            const categoryOk =
              category === "All" ||
              typeText.includes(
                category
                  .toLowerCase()
                  .split(" ")[0]
              );

            const languageOk =
              !language ||
              (
                p.languages ||
                []
              ).includes(
                language
              );

            const pLocation =
              p.location ||
              p.country ||
              p.user
                ?.homeCountry ||
              "";

            const locationOk =
              !location ||
              pLocation ===
              location;

            return (
              categoryOk &&
              languageOk &&
              locationOk
            );
          }
        ),
      [
        practitioners,
        category,
        language,
        location,
      ]
    );

  const enquiryCount =
    enquiries.filter(
      (item) =>
        ![
          "DECLINED",
          "CLOSED",
        ].includes(
          item.status
        )
    ).length;

  return (
    <main className="marketplace-page">
      <header className="mk-page-heading">
        <div>
          <h1>
            Marketplace
          </h1>

          <p>
            Explore wellness stays and find practitioners who support your wellbeing
          </p>
        </div>

        <button
  type="button"
  className="mk-primary-button"
  onClick={() =>
    navigate(
      "/marketplace/enquiries"
    )
  }
>
  View Enquiries
  {activeEnquiries.length
    ? ` (${activeEnquiries.length})`
    : ""}
</button>
      </header>

      <div className="mk-filter-row">
        <div className="mk-category-tabs">
          {CATEGORIES.map(
            (item) => (
              <button
                key={item}
                type="button"
                className={
                  category === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategory(
                    item
                  )
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="mk-select-filters">
          <div className="mk-select-wrap">
            <select
              value={language}
              onChange={(e) =>
                setLanguage(
                  e.target.value
                )
              }
            >
              <option value="">
                Language
              </option>

              {languages.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="mk-select-wrap">
            <select
              value={location}
              onChange={(e) =>
                setLocation(
                  e.target.value
                )
              }
            >
              <option value="">
                Location
              </option>

              {locations.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>

      {upcomingAppointment ? (
        <div className="mk-session-list">
          <SessionCard
            appointment={
              upcomingAppointment
            }
            onChanged={
              load
            }
          />
        </div>
      ) : activeEnquiry ? (
        <EnquiryStatusCard
          enquiry={activeEnquiry}

          onOpen={() =>
            navigate(
              `/marketplace/enquiries/${activeEnquiry.id}`
            )
          }

          onConfirm={
            confirmProposal
          }

          onAskNewTime={
            (proposal) =>
              setRescheduling(
                proposal
              )
          }

          confirming={
            confirming
          }
        />

      ) : null}

      {rescheduling && (
        <RescheduleModal
          title="Ask for new time"

          currentText={
            new Date(
              rescheduling
                .proposedStart
            ).toLocaleString()
          }

          defaultDuration={
            rescheduling
              .durationMinutes ||
            40
          }

          timeZone={
            rescheduling
              .timeZone ||
            activeEnquiry
              ?.timeZone ||
            "Asia/Kolkata"
          }

          onClose={() =>
            setRescheduling(
              null
            )
          }

          onSubmit={
            sendNewTime
          }

          submitting={
            confirming
          }

          error={
            error
          }
        />
      )}

      {error && (
        <div className="mk-error-banner">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mk-loading">
          Loading practitioners…
        </div>
      ) : (
        <div className="mk-practitioner-grid">
          {filtered.map(
            (practitioner) => (
              <PractitionerCard
                key={
                  practitioner.id
                }
                practitioner={
                  practitioner
                }
                onOpen={() =>
                  navigate(
                    `/marketplace/practitioners/${practitioner.slug}`
                  )
                }
              />
            )
          )}

          {!filtered.length && (
            <div className="mk-empty-state">
              No practitioners match these filters.
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function PractitionerCard({
  practitioner,
  onOpen,
}) {
  const name =
    practitioner.user
      ?.fullName ||
    "Practitioner";

  const specialties =
    (
      practitioner.specialties ||
      []
    )
      .map(
        (item) =>
          item.specialty?.name ||
          item.name
      )
      .filter(Boolean)
      .slice(0, 3);

  const location =
    practitioner.location ||
    practitioner.country ||
    practitioner.user
      ?.homeCountry ||
    "—";

  const price =
    practitioner.sessionPrice !=
      null
      ? `₹${Number(
        practitioner.sessionPrice
      ).toLocaleString(
        "en-IN"
      )} / session`
      : "Contact for fee";

  return (
    <article className="mk-practitioner-card">
      <div className="mk-card-head">
        <div className="mk-avatar-lg">
          {practitioner.profileImageUrl ? (
            <img
              src={
                practitioner.profileImageUrl
              }
              alt={name}
            />
          ) : (
            name[0]
          )}
        </div>

        <div className="mk-card-identity">
          <h2>
            {name}
          </h2>

          <p>
            {practitioner.professionalTitle ||
              practitioner.practitionerType}
          </p>

          <div className="mk-rating">
            <span className="mk-stars">
              ★★★★★
            </span>

            <span className="mk-rating-value">
              4.5
            </span>
          </div>
        </div>
      </div>

      <div className="mk-card-meta">
        <div className="mk-card-meta-item">
          <MarketplaceIcon name="location" />

          <span>
            Location:{" "}
            <strong>
              {location}
            </strong>
          </span>
        </div>

        <div className="mk-card-meta-item">
          <MarketplaceIcon name="speak" />

          <span>
            Speaks:{" "}
            <strong>
              {(practitioner.languages ||
                []).join(
                  ", "
                ) || "—"}
            </strong>
          </span>
        </div>
      </div>

      <div className="mk-expertise">
        <div className="mk-expertise-label">
          <MarketplaceIcon name="expertise" />
          <span>
            Expertise:
          </span>
        </div>

        <div className="mk-specialty-row">
          {specialties.length ? (
            specialties.map(
              (
                item,
                index
              ) => (
                <span
                  className={`mk-tag mk-tag-${index + 1}`}
                  key={item}
                >
                  {item}
                </span>
              )
            )
          ) : (
            <span className="mk-tag mk-tag-1">
              General wellbeing
            </span>
          )}
        </div>
      </div>

      <div className="mk-card-footer">
        <strong>
          {price}
        </strong>

        <button
          type="button"
          className="mk-primary-button mk-view-profile-button"
          onClick={onOpen}
        >
          View profile
        </button>
      </div>
    </article>
  );
}
