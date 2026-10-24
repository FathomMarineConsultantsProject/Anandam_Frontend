import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import EnquiryStatusCard from "../components/marketplace/EnquiryStatusCard";
import RescheduleModal from "../components/marketplace/RescheduleModal";

import {
  acceptProposal,
  declineProposal,
  getMyEnquiryById,
  requestAnotherTime,
  rescheduleConfirmedAppointment,
} from "../api/marketplaceApi";

import "../styles/marketplace.css";


function zonedDateTimeToUtc(
  dateString,
  timeString,
  timeZone
) {
  const [
    year,
    month,
    day,
  ] =
    dateString
      .split("-")
      .map(Number);

  const [
    hour,
    minute,
  ] =
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

  let guess =
    target;

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
            new Date(
              guess
            )
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
      target -
      shown;
  }

  return new Date(
    guess
  ).toISOString();
}


export default function EnquiryDetailsPage() {
  const {
    enquiryId,
  } =
    useParams();

  const navigate =
    useNavigate();

  const [
    enquiry,
    setEnquiry,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    processing,
    setProcessing,
  ] =
    useState(false);

  /*
    null

    OR

    {
      type: "proposal",
      proposal: ...
    }

    OR

    {
      type: "appointment"
    }
  */
  const [
    rescheduling,
    setRescheduling,
  ] =
    useState(null);

  const [
    error,
    setError,
  ] =
    useState("");


  async function load() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getMyEnquiryById(
          enquiryId
        );

      setEnquiry(
        data?.enquiry ||
        null
      );
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to load enquiry."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    load();
  }, [enquiryId]);


  const activeProposal =
    useMemo(
      () =>
        enquiry
          ?.proposals
          ?.find(
            (
              proposal
            ) =>
              proposal.status ===
                "PENDING" &&
              proposal.proposedBy ===
                "PRACTITIONER"
          ) ||
        null,
      [
        enquiry,
      ]
    );


  const appointmentEnded =
    [
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ].includes(
      enquiry
        ?.appointment
        ?.status
    );


  async function confirm(
    proposal
  ) {
    if (!proposal) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await acceptProposal(
        enquiryId,
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
      setProcessing(false);
    }
  }


  async function sendNewTime(
    values
  ) {
    try {
      setProcessing(true);
      setError("");

      const proposedStart =
        zonedDateTimeToUtc(
          values.date,
          values.time,
          values.timeZone
        );


      /*
        USER is asking for another time
        against practitioner proposal.
      */
      if (
        rescheduling?.type ===
        "proposal"
      ) {
        const proposal =
          rescheduling.proposal;

        await requestAnotherTime(
          enquiryId,
          proposal.id,
          {
            proposedStart,

            durationMinutes:
              values.durationMinutes,

            timeZone:
              values.timeZone,

            sessionType:
              proposal
                .sessionType ||
              "VIDEO",

            message:
              values.reason,
          }
        );
      }


      /*
        USER is rescheduling an already
        confirmed appointment.
      */
      if (
        rescheduling?.type ===
        "appointment"
      ) {
        await rescheduleConfirmedAppointment(
          enquiryId,
          {
            proposedStart,

            durationMinutes:
              values.durationMinutes,

            timeZone:
              values.timeZone,

            sessionType:
              enquiry
                ?.appointment
                ?.sessionType ||
              "VIDEO",

            message:
              values.reason,
          }
        );
      }


      setRescheduling(
        null
      );

      await load();
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to request another time."
      );
    } finally {
      setProcessing(false);
    }
  }


  async function decline() {
    if (
      !activeProposal
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Decline this proposed time?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setProcessing(true);
      setError("");

      await declineProposal(
        enquiryId,
        activeProposal.id
      );

      await load();
    } catch (err) {
      setError(
        err?.data?.message ||
        err?.message ||
        "Unable to decline proposal."
      );
    } finally {
      setProcessing(false);
    }
  }


  if (loading) {
    return (
      <div className="mk-loading">
        Loading enquiry…
      </div>
    );
  }


  if (!enquiry) {
    return (
      <div className="mk-loading">
        {error ||
          "Enquiry not found."}
      </div>
    );
  }


  return (
    <main className="marketplace-page">

      <button
        type="button"
        className="mk-page-back-button"
        onClick={() =>
          navigate(
            "/marketplace/enquiries"
          )
        }
      >
        <span aria-hidden="true">
          ←
        </span>

        Back
      </button>


      <header className="mk-page-heading">
        <div>
          <h1>
            Marketplace
          </h1>

          <p>
            Your enquiry and
            session status
          </p>
        </div>
      </header>


      {error && (
        <div className="mk-error-banner">
          {error}
        </div>
      )}


      {!appointmentEnded && (
        <EnquiryStatusCard
          enquiry={
            enquiry
          }

          onOpen={() =>
            navigate(
              "/marketplace/enquiries"
            )
          }

          onConfirm={
            confirm
          }

          onAskNewTime={(
            proposal
          ) =>
            setRescheduling({
              type:
                "proposal",

              proposal,
            })
          }

          onReschedule={() =>
            setRescheduling({
              type:
                "appointment",
            })
          }

          onJoin={() =>
            navigate(
              `/marketplace/appointments/${enquiry.appointment.id}/join`
            )
          }

          confirming={
            processing
          }
        />
      )}


      {appointmentEnded && (
        <section className="mk-completed-session-card">
          <div>
            <h2>
              Session completed
            </h2>

            <p>
              This session has moved
              to your session history.
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
            View session history
          </button>
        </section>
      )}


      {activeProposal &&
        enquiry.status ===
          "TIME_PROPOSED" && (
          <div className="mk-inline-actions">
            <button
              type="button"
              className="mk-outline-button"
              onClick={
                decline
              }
              disabled={
                processing
              }
            >
              Decline proposed time
            </button>
          </div>
        )}


      {rescheduling && (
        <RescheduleModal
          title={
            rescheduling
              .type ===
            "appointment"
              ? "Reschedule Session"
              : "Ask for new time"
          }

          currentText={
            rescheduling
              .type ===
            "appointment"
              ? new Date(
                  enquiry
                    .appointment
                    .scheduledStart
                ).toLocaleString()
              : new Date(
                  rescheduling
                    .proposal
                    .proposedStart
                ).toLocaleString()
          }

          defaultDuration={
            rescheduling
              .type ===
            "appointment"
              ? Math.max(
                  1,
                  Math.round(
                    (
                      new Date(
                        enquiry
                          .appointment
                          .scheduledEnd
                      ) -
                      new Date(
                        enquiry
                          .appointment
                          .scheduledStart
                      )
                    ) /
                      60000
                  )
                )
              : rescheduling
                  .proposal
                  .durationMinutes ||
                40
          }

          timeZone={
            rescheduling
              .type ===
            "appointment"
              ? enquiry
                  .appointment
                  .timeZone ||
                enquiry
                  .timeZone ||
                "Asia/Kolkata"
              : rescheduling
                  .proposal
                  .timeZone ||
                enquiry
                  .timeZone ||
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
            processing
          }

          error={
            error
          }
        />
      )}

    </main>
  );
}