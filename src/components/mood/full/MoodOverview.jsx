import {
  ArrowLeft,
  Brain,
  Flame,
  Plus,
  Smile,
} from "lucide-react";

import smilePlusIcon from "../../../assets/mood/Group smile plus.png";

import sleepIcon from "../../../assets/mood/icon-park-outline_sleep.png";
import workloadIcon from "../../../assets/mood/ic_baseline-assured-workload.png";

import {
  FEELING_OPTIONS,
  formatCheckinDate,
  formatCheckinTime,
  getEnergyLabel,
  getEntryFeelings,
  getFeelingOption,
  getMoodLabel,
  getSleepLabel,
  getStressLabel,
  getWorkloadLabel,
} from "../../../data/fullMoodData";

/* =====================================================
   COMMON METRIC
   ===================================================== */

function Metric({
  icon,
  label,
  value,
}) {
  return (
    <div className="full-mood-metric">
      <div className="full-mood-metric__label">
        {icon}
        <span>{label}</span>
      </div>

      <strong>
        {value || "-"}
      </strong>
    </div>
  );
}

/* =====================================================
   PAGE HEADER
   ===================================================== */

function MoodPageHeading({
  action,
}) {
  return (
    <div className="full-mood-page-heading">
      <div>
        <h1>
          Wellbeing Check-in
        </h1>

        <p>
          Track how you're feeling and review your
          previous check-ins.
        </p>
      </div>

      {action}
    </div>
  );
}

/* =====================================================
   EMPTY STATE
   ===================================================== */

function EmptyMoodState({
  onStart,
}) {
  return (
    <>
      <MoodPageHeading />

      <section className="full-mood-empty-card">
        <div className="full-mood-empty-card__icon">
  <img
    src={smilePlusIcon}
    alt=""
    aria-hidden="true"
  />
</div>

        <h2>
          No Check-Ins Yet
        </h2>

        <p>
          Complete your first check-in to begin tracking
          <br />
          how you feel.
        </p>

        <button
          type="button"
          className="full-mood-primary-button full-mood-start-button"
          onClick={onStart}
        >
          <Plus size={18} />
          <span>
            Start new checking
          </span>
        </button>
      </section>
    </>
  );
}

/* =====================================================
   HISTORY CARD
   ===================================================== */

function MoodHistoryCard({
  entry,
  onView,
}) {
  const feelings =
    getEntryFeelings(entry);

  const primaryFeeling =
    feelings.length > 0
      ? getFeelingOption(feelings[0])
      : null;

  return (
    <article className="full-mood-history-card">
      <div className="full-mood-history-card__top">
        <div className="full-mood-history-card__date">
          <strong>
            {formatCheckinDate(
              entry.loggedAt
            )}
          </strong>

          <span>
            {formatCheckinTime(
              entry.loggedAt
            )}
          </span>
        </div>

        <button
          type="button"
          className="full-mood-view-details"
          onClick={() =>
            onView(entry)
          }
        >
          View details
        </button>
      </div>

      <div className="full-mood-history-card__body">
        <Metric
          label="Mood"
          value={getMoodLabel(
            entry.moodScore
          )}
          icon={
            <Smile
              size={18}
              strokeWidth={1.5}
            />
          }
        />

        <Metric
          label="Energy"
          value={getEnergyLabel(
            entry.energyLevel
          )}
          icon={
            <Flame
              size={18}
              strokeWidth={1.5}
            />
          }
        />

        <Metric
          label="Stress"
          value={getStressLabel(
            entry.stressLevel
          )}
          icon={
            <Brain
              size={18}
              strokeWidth={1.5}
            />
          }
        />

        <Metric
          label="Sleep"
          value={getSleepLabel(
            entry.hoursOfSleep
          )}
          icon={
            <img
              src={sleepIcon}
              alt=""
            />
          }
        />

        <Metric
          label="Workload"
          value={getWorkloadLabel(
            entry.currentWorkload
          )}
          icon={
            <img
              src={workloadIcon}
              alt=""
            />
          }
        />

        <div className="full-mood-history-card__feeling">
          {primaryFeeling && (
            <span>
              {primaryFeeling.label}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* =====================================================
   OVERVIEW
   ===================================================== */

export function MoodOverview({
  history,
  loading,
  onStart,
  onViewDetails,
}) {
  if (loading) {
    return (
      <>
        <MoodPageHeading />

        <section className="full-mood-loading-card">
          Loading your check-ins...
        </section>
      </>
    );
  }

  if (!history.length) {
    return (
      <EmptyMoodState
        onStart={onStart}
      />
    );
  }

  return (
    <>
      <MoodPageHeading
        action={
          <button
            type="button"
            className="full-mood-primary-button full-mood-top-start"
            onClick={onStart}
          >
            <Plus size={18} />
            Start new checking
          </button>
        }
      />

      <div className="full-mood-history-list">
        {history.map((entry) => (
          <MoodHistoryCard
            key={entry.id}
            entry={entry}
            onView={onViewDetails}
          />
        ))}
      </div>
    </>
  );
}

/* =====================================================
   DETAIL PAGE
   ===================================================== */

export function MoodDetails({
  entry,
  onBack,
}) {
  if (!entry) {
    return null;
  }

  const feelings =
    getEntryFeelings(entry);

  return (
    <>
      <header className="full-mood-detail-heading">
        <button
          type="button"
          className="full-mood-back-icon"
          onClick={onBack}
          aria-label="Back"
        >
          <ArrowLeft
            size={22}
          />
        </button>

        <div>
          <h1>
            Checkin details
          </h1>

          <p>
            Submitted on{" "}
            {formatCheckinDate(
              entry.loggedAt
            )}{" "}
            at{" "}
            {formatCheckinTime(
              entry.loggedAt
            )}
          </p>
        </div>
      </header>

      <section className="full-mood-details-card">
        <div className="full-mood-details-summary">
          <Metric
            label="Mood"
            value={getMoodLabel(
              entry.moodScore
            )}
            icon={
              <Smile
                size={18}
              />
            }
          />

          <Metric
            label="Energy"
            value={getEnergyLabel(
              entry.energyLevel
            )}
            icon={
              <Flame
                size={18}
              />
            }
          />

          <Metric
            label="Stress"
            value={getStressLabel(
              entry.stressLevel
            )}
            icon={
              <Brain
                size={18}
              />
            }
          />

          <Metric
            label="Hours of sleep"
            value={getSleepLabel(
              entry.hoursOfSleep
            )}
            icon={
              <img
                src={sleepIcon}
                alt=""
              />
            }
          />

          <Metric
            label="Current workload?"
            value={getWorkloadLabel(
              entry.currentWorkload
            )}
            icon={
              <img
                src={workloadIcon}
                alt=""
              />
            }
          />
        </div>

        <div className="full-mood-details-divider" />

        <div className="full-mood-details-section">
          <h3>
            Anything else you would like to share?
          </h3>

          <p>
            {entry.additionalThoughts ||
              "No additional thoughts were added."}
          </p>
        </div>

        <div className="full-mood-details-divider" />

        <div className="full-mood-details-section">
          <h3>
            How are you feeling?
          </h3>

          {feelings.length ? (
            <div className="full-mood-detail-feelings">
              {feelings.map(
                (feeling) => {
                  const option =
                    getFeelingOption(
                      feeling
                    );

                  return (
                    <div
  key={feeling}
  className="full-mood-detail-feeling"
>
  {option.icon && (
    <span
      className="full-mood-detail-feeling__icon"
      style={{
        "--feeling-bg": option.bg,
      }}
    >
      <img
        src={option.icon}
        alt=""
        aria-hidden="true"
      />
    </span>
  )}

  <span>
    {option.label}
  </span>
</div>
                  );
                }
              )}
            </div>
          ) : (
            <p>
              No feelings selected.
            </p>
          )}
        </div>

        <div className="full-mood-details-divider" />

        <div className="full-mood-details-section">
          <h3>
            Journal Entry
          </h3>

          <p>
            {entry.journalEntry ||
              "No journal entry was added."}
          </p>
        </div>
      </section>
    </>
  );
}