import {
  useEffect,
  useMemo,
  useState,
} from "react";

import MarketplaceDatePicker from "./MarketplaceDatePicker";
import TimeDropdown from "./TimeDropdown";

const TIMEZONES = [
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Paris",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Singapore",
  "Asia/Dubai",
  "Australia/Sydney",
];

function browserTimeZone() {
  return (
    Intl.DateTimeFormat()
      .resolvedOptions()
      .timeZone ||
    "Asia/Kolkata"
  );
}

function timeZoneLabel(
  zone
) {
  try {
    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {
          timeZone: zone,
          timeZoneName:
            "shortOffset",
        }
      ).formatToParts(
        new Date()
      );

    const offset =
      parts.find(
        (part) =>
          part.type ===
          "timeZoneName"
      )?.value || "";

    return `${zone}${
      offset
        ? ` (${offset})`
        : ""
    }`;
  } catch {
    return zone;
  }
}

function todayValue() {
  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      now.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

export default function SendEnquiryModal({
  practitioner,
  onClose,
  onSubmit,
  submitting = false,
  error = "",
}) {
  const defaultZone =
    useMemo(
      () =>
        browserTimeZone(),
      []
    );

  const languages =
    practitioner
      ?.languages
      ?.length
      ? practitioner.languages
      : ["English"];

  const specialties =
    practitioner
      ?.specialties
      ?.map(
        (item) =>
          item
            ?.specialty
            ?.name ||
          item?.name
      )
      .filter(Boolean) ||
    [];

  const [
    form,
    setForm,
  ] =
    useState({
      supportTopic:
        specialties[0] ||
        "",

      date:
        "",

      from:
        "",

      to:
        "",

      timeZone:
        defaultZone,

      preferredLanguage:
        languages[0] ||
        "English",

      message:
        "",
    });

  useEffect(() => {
    setForm(
      (current) => ({
        ...current,

        supportTopic:
          current
            .supportTopic ||
          specialties[0] ||
          "",

        preferredLanguage:
          current
            .preferredLanguage ||
          languages[0] ||
          "English",
      })
    );
  }, [
    practitioner,
  ]);

  function update(
    name,
    value
  ) {
    setForm(
      (current) => ({
        ...current,
        [name]:
          value,
      })
    );
  }

  function handleSubmit(
    event
  ) {
    event.preventDefault();

    onSubmit(
      form
    );
  }

  const valid =
    Boolean(
      form.supportTopic &&
      form.date &&
      form.from &&
      form.to &&
      form.timeZone &&
      form.preferredLanguage
    );

  return (
    <div
      className="mk-modal-backdrop"
      role="presentation"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <form
        className="mk-enquiry-modal"
        onSubmit={
          handleSubmit
        }
      >
        <div className="mk-modal-heading-row">
          <h2>
            Send an enquiry
          </h2>

          <button
            type="button"
            className="mk-icon-button"
            onClick={
              onClose
            }
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <label className="mk-field">
          <span>
            What Would You Like
            Support With?
          </span>

          <div className="mk-select-control">
            <select
              value={
                form.supportTopic
              }
              onChange={(
                event
              ) =>
                update(
                  "supportTopic",
                  event.target
                    .value
                )
              }
              required
            >
              <option value="">
                Select a Service
              </option>

              {specialties.length
                ? specialties.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )
                : (
                  <>
                    <option value="General wellbeing">
                      General wellbeing
                    </option>

                    <option value="Stress">
                      Stress
                    </option>

                    <option value="Anxiety">
                      Anxiety
                    </option>

                    <option value="Sleep">
                      Sleep
                    </option>
                  </>
                )}
            </select>
          </div>
        </label>

        <div className="mk-section-label">
          When Are You Available?
        </div>

        <div className="mk-three-fields">

          {/* DATE = CALENDAR ONLY */}
          <label className="mk-field">
            <span>
              Preferred date
            </span>

            <MarketplaceDatePicker
              value={
                form.date
              }
              onChange={(
                value
              ) =>
                update(
                  "date",
                  value
                )
              }
              minDate={
                todayValue()
              }
              placeholder="Select date"
              required
            />
          </label>

          {/* FROM = TIME DROPDOWN */}
          <label className="mk-field">
            <span>
              From
            </span>

            <TimeDropdown
              value={
                form.from
              }
              onChange={(
                value
              ) => {
                update(
                  "from",
                  value
                );

                if (
                  form.to &&
                  form.to <=
                    value
                ) {
                  update(
                    "to",
                    ""
                  );
                }
              }}
              placeholder="Select time"
              required
            />
          </label>

          {/* TO = TIME DROPDOWN */}
          <label className="mk-field">
            <span>
              To
            </span>

            <TimeDropdown
              value={
                form.to
              }
              onChange={(
                value
              ) =>
                update(
                  "to",
                  value
                )
              }
              minTime={
                form.from
              }
              placeholder="Select time"
              required
            />
          </label>

        </div>

        <label className="mk-field">
          <span>
            Your timezone
          </span>

          <div className="mk-select-control">
            <select
              value={
                form.timeZone
              }
              onChange={(
                event
              ) =>
                update(
                  "timeZone",
                  event.target
                    .value
                )
              }
              required
            >
              {[
                defaultZone,
                ...TIMEZONES.filter(
                  (
                    zone
                  ) =>
                    zone !==
                    defaultZone
                ),
              ].map(
                (
                  zone
                ) => (
                  <option
                    key={
                      zone
                    }
                    value={
                      zone
                    }
                  >
                    {timeZoneLabel(
                      zone
                    )}
                  </option>
                )
              )}
            </select>
          </div>
        </label>

        <label className="mk-field">
          <span>
            Preferred language
          </span>

          <div className="mk-select-control">
            <select
              value={
                form.preferredLanguage
              }
              onChange={(
                event
              ) =>
                update(
                  "preferredLanguage",
                  event.target
                    .value
                )
              }
              required
            >
              {languages.map(
                (
                  language
                ) => (
                  <option
                    key={
                      language
                    }
                    value={
                      language
                    }
                  >
                    {language}
                  </option>
                )
              )}
            </select>
          </div>
        </label>

        <label className="mk-field">
          <span>
            Anything you’d like
            to share? (Optional)
          </span>

          <textarea
            value={
              form.message
            }
            onChange={(
              event
            ) =>
              update(
                "message",
                event.target
                  .value
              )
            }
            placeholder="What would you like to discuss"
            rows={
              4
            }
          />
        </label>

        {error && (
          <div className="mk-form-error">
            {error}
          </div>
        )}

        <button
          className="mk-primary-button mk-full-button"
          type="submit"
          disabled={
            !valid ||
            submitting
          }
        >
          {submitting
            ? "Sending..."
            : "Send Enquiry"}
        </button>
      </form>
    </div>
  );
}