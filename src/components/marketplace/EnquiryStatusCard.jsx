import {
  useMemo,
} from "react";

import MarketplaceIcon from "./MarketplaceIcon";

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(
    new Date(
      value
    )
  );
}

function formatTime(
  value
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(
    new Date(
      value
    )
  );
}

function formatFee(
  value,
  currency = "INR"
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }
    ).format(
      Number(
        value
      )
    );
  } catch {
    return `${currency} ${value}`;
  }
}

export default function EnquiryStatusCard({
  enquiry,
  onOpen,
  onConfirm,
  onAskNewTime,
  onReschedule,
  onJoin,
  confirming = false,
}) {
  const pendingProposal =
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

  const acceptedProposal =
    useMemo(
      () =>
        enquiry
          ?.proposals
          ?.find(
            (
              proposal
            ) =>
              proposal.status ===
              "ACCEPTED"
          ) ||
        null,
      [
        enquiry,
      ]
    );

  const status =
    enquiry?.status;

  const practitioner =
    enquiry?.practitioner;

  const appointment =
    enquiry?.appointment;

  const person =
    practitioner
      ?.user
      ?.fullName ||
    "Practitioner";

  const appointmentEnded =
    [
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ].includes(
      appointment
        ?.status
    );

  if (
    appointmentEnded
  ) {
    return null;
  }

  if (
    status ===
      "TIME_PROPOSED" &&
    pendingProposal
  ) {
    const fee =
      pendingProposal
        ?.sessionFee ??
      practitioner
        ?.sessionPrice;

    const currency =
      pendingProposal
        ?.currency ||
      practitioner
        ?.currency ||
      "INR";

    return (
      <section className="mk-status-card mk-proposal-status-card">

        <div className="mk-status-person-block">
          <h2>
            Call Time Proposed
          </h2>

          <div className="mk-person-mini">
            <Avatar
              practitioner={
                practitioner
              }
            />

            <div>
              <strong>
                {person}
              </strong>

              <span>
                {practitioner
                  ?.professionalTitle ||
                  "Practitioner"}
              </span>
            </div>
          </div>
        </div>

        <Info
          icon="date"
          label="Date"
          value={
            formatDate(
              pendingProposal
                .proposedStart
            )
          }
        />

        <Info
          icon="time"
          label="Time"
          value={
            formatTime(
              pendingProposal
                .proposedStart
            )
          }
        />

        <Info
          icon="payment"
          label="Fees"
          value={
            formatFee(
              fee,
              currency
            )
          }
        />

        <div className="mk-status-actions">
          <span className="mk-pill mk-pill-warn">
            Awaiting your confirmation
          </span>

          <div className="mk-status-action-row">

            <button
              type="button"
              className="mk-link-button"
              onClick={() => {
                if (
                  onAskNewTime
                ) {
                  onAskNewTime(
                    pendingProposal
                  );
                } else {
                  onOpen?.();
                }
              }}
            >
              Ask for new time
            </button>

            <button
              type="button"
              className="mk-primary-button"
              disabled={
                confirming
              }
              onClick={() => {
                if (
                  onConfirm
                ) {
                  onConfirm(
                    pendingProposal
                  );
                } else {
                  onOpen?.();
                }
              }}
            >
              {confirming
                ? "Confirming..."
                : "Confirm Session"}
            </button>

          </div>
        </div>
      </section>
    );
  }

  if (
    status ===
      "CONFIRMED" &&
    appointment
  ) {
    const fee =
      appointment
        ?.sessionFee ??
      acceptedProposal
        ?.sessionFee ??
      practitioner
        ?.sessionPrice;

    const currency =
      appointment
        ?.currency ||
      acceptedProposal
        ?.currency ||
      practitioner
        ?.currency ||
      "INR";

    return (
      <section className="mk-status-card mk-booked-status-card">

        <div className="mk-status-person-block">
          <h2>
            Session Booked
          </h2>

          <div className="mk-person-mini">
            <Avatar
              practitioner={
                practitioner
              }
            />

            <div>
              <strong>
                {person}
              </strong>

              <span>
                {practitioner
                  ?.professionalTitle ||
                  "Practitioner"}
              </span>
            </div>
          </div>
        </div>

        <Info
          icon="date"
          label="Date"
          value={
            formatDate(
              appointment
                .scheduledStart
            )
          }
        />

        <Info
          icon="time"
          label="Time"
          value={
            formatTime(
              appointment
                .scheduledStart
            )
          }
        />

        <Info
          icon="payment"
          label="Fees"
          value={
            formatFee(
              fee,
              currency
            )
          }
        />

        <div className="mk-status-actions">
          <span className="mk-pill mk-pill-ok">
            Scheduled
          </span>

          <div className="mk-status-action-row">

            <button
              type="button"
              className="mk-link-button"
              onClick={() => {
                if (
                  onReschedule
                ) {
                  onReschedule();
                } else {
                  onOpen?.();
                }
              }}
            >
              Reschedule
            </button>

            <button
              type="button"
              className="mk-primary-button"
              onClick={() => {
                if (
                  onJoin
                ) {
                  onJoin();
                } else {
                  onOpen?.();
                }
              }}
            >
              <MarketplaceIcon
                name="video"
                className="mk-button-icon"
              />

              Join call
            </button>

          </div>
        </div>
      </section>
    );
  }

  const requested =
    enquiry
      ?.requestedStart;

  const declined =
    status ===
      "DECLINED" ||
    status ===
      "CLOSED";

  return (
    <section className="mk-status-card mk-enquiry-sent-card">

      <div className="mk-status-main-copy">
        <h2>
          {declined
            ? "Enquiry Declined"
            : "Enquiry Sent"}
        </h2>

        <div className="mk-request-grid">

          <Info
            icon="date"
            label="Preferred Date"
            value={
              formatDate(
                requested
              )
            }
          />

          <Info
            icon="time"
            label="Time"
            value={
              formatTime(
                requested
              )
            }
          />

          <Info
            icon="language"
            label="Language"
            value={
              enquiry
                ?.preferredLanguage ||
              "—"
            }
          />

        </div>

        <p>
          {declined
            ? "The practitioner did not accept your session request."
            : status ===
              "RESCHEDULE_REQUESTED"
            ? "Your new time request has been sent to the practitioner."
            : "Your enquiry has been sent to the practitioner. They will review it and respond with a session time."}
        </p>
      </div>

      <div className="mk-status-side">

        <span
          className={
            `mk-pill ${
              declined
                ? "mk-pill-declined"
                : "mk-pill-pending"
            }`
          }
        >
          {declined
            ? "Declined"
            : status ===
              "RESCHEDULE_REQUESTED"
            ? "Reschedule Requested"
            : "Session Requested"}
        </span>

        <button
          type="button"
          className="mk-dots-button"
          onClick={
            onOpen
          }
          aria-label="Open enquiry"
        >
          <MarketplaceIcon
            name="more"
          />
        </button>

      </div>
    </section>
  );
}

function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="mk-info">

      <div className="mk-info-label">
        <MarketplaceIcon
          name={
            icon
          }
        />

        <span>
          {label}
        </span>
      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}

function Avatar({
  practitioner,
}) {
  const name =
    practitioner
      ?.user
      ?.fullName ||
    "P";

  return (
    <div className="mk-mini-avatar">

      {practitioner
        ?.profileImageUrl ? (
        <img
          src={
            practitioner
              .profileImageUrl
          }
          alt={
            name
          }
        />
      ) : (
        name[0]
      )}

    </div>
  );
}