import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Pencil,
  Save,
  Trash2,
  X,
} from "lucide-react";

import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";

import { workRestMockData } from "../data/workRestData";
import { getMyProfile } from "../api/profileApi";

import {
  getWorkRestDay,
  updateWorkRestSlots,
  deleteWorkRestSlot,
  updateWorkRestDayComment,
  deleteWorkRestDayComment,
  getActiveWorkSession,
  clockInToWork,
  clockOutOfWork,
  createManualWorkSession,
  updateExistingWorkSession,
  deleteExistingWorkSession,
  getWorkRestSummary,
  getWorkRestErrorMessage,
} from "../api/workRestApi";

import complianceRateIcon from "../assets/workrest/complaince rate.png";
import violationsIcon from "../assets/workrest/violations.png";
import hoursWorkedIcon from "../assets/workrest/hours worked.png";
import restRecordedIcon from "../assets/workrest/rest record.png";
import dateRangeIcon from "../assets/workrest/date_range.png";
import editIcon from "../assets/workrest/edit.png";

import avatar1 from "../assets/profile/avatar 1.png";
import avatar2 from "../assets/profile/avatar 2.png";
import avatar3 from "../assets/profile/avatar 3.png";
import avatar4 from "../assets/profile/avatar 4.png";
import avatar5 from "../assets/profile/avatar 5.png";
import avatar6 from "../assets/profile/avatar 6.png";
import avatar7 from "../assets/profile/avatar 7.png";
import avatar8 from "../assets/profile/avatar 8.png";
import avatar9 from "../assets/profile/avatar 9.png";
import avatar10 from "../assets/profile/avatar 10.png";

import "../styles/work-rest.css";

const EMPTY_BLOCKS = Array(48).fill("UNRECORDED");
const MINUTES_PER_SLOT = 30;
const SLOT_MS = MINUTES_PER_SLOT * 60 * 1000;

const PROFILE_AVATARS = {
  1: avatar1,
  2: avatar2,
  3: avatar3,
  4: avatar4,
  5: avatar5,
  6: avatar6,
  7: avatar7,
  8: avatar8,
  9: avatar9,
  10: avatar10,
};

const SHIP_LOCATIONS = [
  "Bridge (Navigation)",
  "Engine Room",
  "Main Deck",
  "Galley",
  "Cargo Hold",
  "Crew Quarters",
  "Medical Bay",
  "Accommodation",
];

const MLC_REQUIREMENTS = [
  "Minimum 10 hours rest in any 24-hour period",
  "Minimum 6 hours continuous rest period",
  "Maximum 14 hours work in any 24-hour period",
  "Maximum 72 hours work in any 7-day period",
];

const REMARKS = [
  "ILO Rest requirements strictly followed as per MLC 2.3",
  "All crew members briefed on work/rest hour regulations",
  "Emergency duties may require deviation from schedule - will be recorded separately",
  "Schedule reviewed and approved by Master",
];

const STATUS_META = {
  WORK: { letter: "W", label: "Work" },
  REST: { letter: "R", label: "Rest" },
  MEAL: { letter: "M", label: "Meal/Tea/Break" },
  UNRECORDED: { letter: "U", label: "Unrecorded" },
};

// Midnight-to-midnight display order.
const DAY_SECTIONS = [
  {
    title: "Night: 12:00 AM–06:00 AM",
    slots: Array.from({ length: 12 }, (_, index) => index),
  },
  {
    title: "Morning: 06:00 AM–12:00 PM",
    slots: Array.from({ length: 12 }, (_, index) => index + 12),
  },
  {
    title: "Afternoon: 12:00 PM–06:00 PM",
    slots: Array.from({ length: 12 }, (_, index) => index + 24),
  },
  {
    title: "Evening: 06:00 PM–12:00 AM",
    slots: Array.from({ length: 12 }, (_, index) => index + 36),
  },
];

function getInitials(fullName = "") {
  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getProfileAvatar(profile) {
  if (!profile || profile.avatarMode === "INITIALS") return null;

  const match = String(profile.avatarId ?? "").match(/\d+/);
  if (!match) return null;

  return PROFILE_AVATARS[Number(match[0])] || null;
}

function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length !== 48) {
    return [...EMPTY_BLOCKS];
  }

  return blocks.map((value) => {
    const status = String(value || "UNRECORDED").toUpperCase();
    return STATUS_META[status] ? status : "UNRECORDED";
  });
}

function formatSlotTime(slotIndex) {
  const totalMinutes = slotIndex * MINUTES_PER_SLOT;
  const hour24 = Math.floor(totalMinutes / 60) % 24;
  const minute = totalMinutes % 60;
  const hour12 = hour24 % 12 || 12;
  const period = hour24 < 12 ? "AM" : "PM";

  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

function formatEndTime(slotIndex) {
  return slotIndex === 48
    ? "12:00 AM (next day)"
    : formatSlotTime(slotIndex);
}

function ordinal(day) {
  const mod100 = day % 100;

  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  if (day % 10 === 1) return `${day}st`;
  if (day % 10 === 2) return `${day}nd`;
  if (day % 10 === 3) return `${day}rd`;

  return `${day}th`;
}

function formatDateButton(dateKey) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);

  return `${date.toLocaleDateString("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  })}, ${ordinal(date.getUTCDate())} ${date.toLocaleDateString("en-GB", {
    month: "long",
    timeZone: "UTC",
  })}`;
}

function formatRecordDate(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const CALENDAR_WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toUtcDate(dateKey) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function toDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function startOfUtcMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function shiftUtcMonth(date, amount) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

function buildCalendarDays(viewDate) {
  const monthStart = startOfUtcMonth(viewDate);
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const leadingDays = (monthStart.getUTCDay() + 6) % 7;
  const requiredCells = leadingDays + daysInMonth;
  const totalCells = requiredCells <= 35 ? 35 : 42;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - leadingDays;
    const date = new Date(Date.UTC(year, month, dayOffset + 1));

    return {
      key: toDateKey(date),
      date,
      day: date.getUTCDate(),
      inCurrentMonth: date.getUTCMonth() === month,
    };
  });
}

function FigmaDatePicker({ selectedDate, maxDate, onCancel, onChoose }) {
  const [draftDate, setDraftDate] = useState(selectedDate);
  const [viewDate, setViewDate] = useState(() =>
    startOfUtcMonth(toUtcDate(selectedDate))
  );

  const days = useMemo(() => buildCalendarDays(viewDate), [viewDate]);
  const maxUtcDate = toUtcDate(maxDate);
  const maxMonth = startOfUtcMonth(maxUtcDate);
  const canGoNext = shiftUtcMonth(viewDate, 1) <= maxMonth;

  const monthLabel = viewDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div
      className={`wr-figma-datepicker${days.length > 35 ? " has-six-weeks" : ""}`}
      role="dialog"
      aria-label="Choose work and rest record date"
    >
      <div className="wr-figma-datepicker__header">
        <button
          type="button"
          className="wr-figma-datepicker__month-nav"
          onClick={() => setViewDate((date) => shiftUtcMonth(date, -1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={14} strokeWidth={1.8} />
        </button>

        <strong>{monthLabel}</strong>

        <button
          type="button"
          className="wr-figma-datepicker__month-nav"
          onClick={() => {
            if (canGoNext) setViewDate((date) => shiftUtcMonth(date, 1));
          }}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <ChevronRight size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="wr-figma-datepicker__weekdays" aria-hidden="true">
        {CALENDAR_WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="wr-figma-datepicker__days" role="grid">
        {days.map((item) => {
          const disabled = item.date > maxUtcDate;
          const selected = item.key === draftDate;

          return (
            <button
              key={item.key}
              type="button"
              role="gridcell"
              className={`wr-figma-datepicker__day${
                item.inCurrentMonth ? "" : " is-outside"
              }${selected ? " is-selected" : ""}`}
              disabled={disabled}
              aria-selected={selected}
              onClick={() => {
                if (!disabled) setDraftDate(item.key);
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>

      <div className="wr-figma-datepicker__actions">
        <button
          type="button"
          className="wr-figma-datepicker__cancel"
          onClick={onCancel}
        >
          Cancel
        </button>

        <button
          type="button"
          className="wr-figma-datepicker__choose"
          onClick={() => onChoose(draftDate)}
        >
          Choose Date
        </button>
      </div>
    </div>
  );
}

function formatSessionTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildLocalSlotDate(dateKey, slotIndex) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    0,
    slotIndex * MINUTES_PER_SLOT,
    0,
    0
  );
}

function getCurrentSlotIndex(now = new Date()) {
  return (
    now.getHours() * 2 +
    (now.getMinutes() >= 30 ? 1 : 0)
  );
}

function getCompletedBoundaryIndex(now = new Date()) {
  return Math.floor((now.getHours() * 60 + now.getMinutes()) / 30);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getSessionSlotRangeForDate(session, dateKey) {
  if (!session?.startedAt) return null;

  const sessionStart = new Date(session.startedAt);
  const sessionEnd = new Date(session.endedAt || Date.now());
  const dayStart = buildLocalSlotDate(dateKey, 0);
  const dayEnd = buildLocalSlotDate(dateKey, 48);

  if (
    Number.isNaN(sessionStart.getTime()) ||
    Number.isNaN(sessionEnd.getTime()) ||
    sessionEnd <= dayStart ||
    sessionStart >= dayEnd
  ) {
    return null;
  }

  const overlapStart = sessionStart > dayStart ? sessionStart : dayStart;
  const overlapEnd = sessionEnd < dayEnd ? sessionEnd : dayEnd;

  const startIndex = clamp(
    Math.floor((overlapStart.getTime() - dayStart.getTime()) / SLOT_MS),
    0,
    47
  );

  const endIndex = clamp(
    Math.ceil((overlapEnd.getTime() - dayStart.getTime()) / SLOT_MS),
    1,
    48
  );

  if (endIndex <= startIndex) return null;

  return { startIndex, endIndex };
}

function findWorkSessionForSlot(sessions, dateKey, slotIndex) {
  if (!Array.isArray(sessions)) return null;

  return (
    sessions.find((session) => {
      const range = getSessionSlotRangeForDate(session, dateKey);
      return (
        range &&
        slotIndex >= range.startIndex &&
        slotIndex < range.endIndex
      );
    }) || null
  );
}

function splitLocation(value) {
  const location = String(value || "").trim();

  if (!location) {
    return { choice: "", custom: "" };
  }

  if (SHIP_LOCATIONS.includes(location)) {
    return { choice: location, custom: "" };
  }

  return { choice: "Other", custom: location };
}

function resolveWorkLocation(choice, custom) {
  if (choice === "Other") return String(custom || "").trim();
  return String(choice || "").trim();
}

function firstNumber(source, keys) {
  for (const key of keys) {
    const value = source?.[key];

    if (Array.isArray(value)) return value.length;

    if (value !== undefined && value !== null && value !== "") {
      const numeric = Number(value);
      if (Number.isFinite(numeric)) return numeric;
    }
  }

  return null;
}

function normalizeSummary(summary, blocks) {
  const safeSummary = summary || {};
  const safeBlocks = normalizeBlocks(blocks);

  const derivedWorkHours =
    safeBlocks.filter((status) => status === "WORK").length * 0.5;

  const derivedRestHours =
    safeBlocks.filter((status) => status === "REST").length * 0.5;

  const compliance = safeSummary?.compliance || safeSummary;

  const violations = firstNumber(compliance, [
    "violationCount",
    "violations",
    "totalViolations",
  ]);

  let complianceRate = firstNumber(compliance, [
    "complianceRate",
    "compliancePercentage",
    "compliancePercent",
  ]);

  if (
    complianceRate === null &&
    typeof compliance.isCompliant === "boolean"
  ) {
    complianceRate = compliance.isCompliant ? 100 : 0;
  }

  return {
    complianceRate,
    violations,
    hoursWorked:
      firstNumber(safeSummary, [
        "hoursWorked",
        "workHours",
        "totalWorkHours",
        "totalWork",
      ]) ?? derivedWorkHours,
    restRecorded:
      firstNumber(safeSummary, [
        "restRecorded",
        "restHours",
        "totalRestHours",
        "totalRest",
      ]) ?? derivedRestHours,
  };
}

function formatMetric(value) {
  if (value === null || value === undefined) return "—";

  return Number.isInteger(value)
    ? String(value)
    : Number(value).toFixed(1).replace(/\.0$/, "");
}

function Accordion({ title, items, open, onToggle }) {
  return (
    <section className={`wr-accordion${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="wr-accordion__button"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown
          size={24}
          strokeWidth={1.5}
          className="wr-accordion__chevron"
        />
      </button>

      {open && (
        <div className="wr-accordion__content">
          {items.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({ icon, tone, label, value, suffix = "" }) {
  return (
    <article className="wr-stat-card">
      <div className="wr-stat-card__top">
        <span
          className={`wr-stat-icon wr-stat-icon--${tone}`}
          aria-hidden="true"
        >
          <img src={icon} alt="" />
        </span>
        <span>{label}</span>
      </div>

      <strong>
        {formatMetric(value)}
        {value !== null && value !== undefined ? suffix : ""}
      </strong>
    </article>
  );
}

function LocationFields({
  workLocation,
  setWorkLocation,
  customWorkLocation,
  setCustomWorkLocation,
}) {
  return (
    <>
      <label className="wr-popover-field">
        <span>Work location</span>

        <select
          value={workLocation}
          onChange={(event) => {
            const value = event.target.value;
            setWorkLocation(value);
            if (value !== "Other") setCustomWorkLocation("");
          }}
        >
          <option value="">Choose work location</option>

          {SHIP_LOCATIONS.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}

          <option value="Other">Other</option>
        </select>
      </label>

      {workLocation === "Other" && (
        <label className="wr-popover-field">
          <span>Other location</span>
          <input
            type="text"
            value={customWorkLocation}
            onChange={(event) => setCustomWorkLocation(event.target.value)}
            placeholder="e.g. Port office, shipyard, training centre"
            maxLength={100}
            autoFocus
          />
        </label>
      )}
    </>
  );
}

function AddSlotEditor({
  manualMode,
  startLabel,
  workLocation,
  setWorkLocation,
  customWorkLocation,
  setCustomWorkLocation,
  manualEndIndex,
  setManualEndIndex,
  manualEndOptions,
  saving,
  activeSession,
  onDirectStatus,
  onClockIn,
  onSaveManual,
  onClose,
  onOpenWork,
  workOpen,
  alignRight,
}) {
  const resolvedLocation = resolveWorkLocation(
    workLocation,
    customWorkLocation
  );

  const canClockIn =
    Boolean(resolvedLocation) &&
    !saving &&
    !activeSession;

  const canSaveManual =
    Boolean(resolvedLocation) &&
    manualEndIndex !== "" &&
    !saving;

  return (
    <div
      className={`wr-slot-popover${alignRight ? " is-right" : ""}${
        workOpen ? " has-work-panel" : ""
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="wr-slot-popover__menu">
        <p className="wr-slot-popover__title">Add to selected time</p>

        <button
          type="button"
          className="wr-slot-action"
          onClick={onOpenWork}
          disabled={Boolean(activeSession) && !manualMode}
        >
          <span className="wr-slot-action__left">
            <span className="wr-status-square is-work" />
            Work
          </span>
          <ChevronRight size={14} />
        </button>

        <button
          type="button"
          className="wr-slot-action"
          onClick={() => onDirectStatus("REST")}
          disabled={saving}
        >
          <span className="wr-slot-action__left">
            <span className="wr-status-square is-rest" />
            Rest
          </span>
        </button>

        <button
          type="button"
          className="wr-slot-action"
          onClick={() => onDirectStatus("MEAL")}
          disabled={saving}
        >
          <span className="wr-slot-action__left">
            <span className="wr-status-square is-meal" />
            Meal/Tea/Break
          </span>
        </button>

        <button
          type="button"
          className="wr-slot-action wr-slot-action--cancel"
          onClick={onClose}
        >
          <span className="wr-slot-action__left">
            <X size={14} />
            Cancel
          </span>
        </button>
      </div>

      {workOpen && (
        <div className="wr-slot-popover__work">
          <p className="wr-slot-popover__title">
            {manualMode ? "Add missed work session" : "Start work session"}
          </p>

          {!manualMode && (
            <div className="wr-popover-info-row">
              <span>Start time</span>
              <strong>{startLabel}</strong>
            </div>
          )}

          {manualMode && (
            <label className="wr-popover-field">
              <span>End time</span>
              <select
                value={manualEndIndex}
                onChange={(event) => setManualEndIndex(event.target.value)}
              >
                <option value="">Select end time</option>
                {manualEndOptions.map((slotIndex) => (
                  <option key={slotIndex} value={slotIndex}>
                    {formatEndTime(slotIndex)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <LocationFields
            workLocation={workLocation}
            setWorkLocation={setWorkLocation}
            customWorkLocation={customWorkLocation}
            setCustomWorkLocation={setCustomWorkLocation}
          />

          <button
            type="button"
            className="wr-popover-submit"
            onClick={manualMode ? onSaveManual : onClockIn}
            disabled={manualMode ? !canSaveManual : !canClockIn}
          >
            <Clock3 size={14} />
            {manualMode ? "Save work session" : "Clock in"}
          </button>
        </div>
      )}
    </div>
  );
}

function RecordedSlotEditor({
  status,
  slotLabel,
  saving,
  editing,
  setEditing,
  deleteConfirm,
  setDeleteConfirm,
  onDirectStatus,
  onDelete,
  onClose,
  alignRight,
}) {
  const label = STATUS_META[status]?.label || "Recorded time";

  return (
    <div
      className={`wr-slot-popover wr-slot-popover--manage${
        alignRight ? " is-right" : ""
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="wr-slot-popover__menu wr-slot-popover__menu--manage">
        <p className="wr-slot-popover__title">{label} · {slotLabel}</p>

        {!editing && !deleteConfirm && (
          <>
            <button
              type="button"
              className="wr-slot-action"
              onClick={() => setEditing(true)}
              disabled={saving}
            >
              <span className="wr-slot-action__left">
                <Pencil size={14} />
                Edit
              </span>
            </button>

            <button
              type="button"
              className="wr-slot-action wr-slot-action--delete"
              onClick={() => setDeleteConfirm(true)}
              disabled={saving}
            >
              <span className="wr-slot-action__left">
                <Trash2 size={14} />
                Delete
              </span>
            </button>
          </>
        )}

        {editing && (
          <>
            <p className="wr-slot-popover__hint">Change this 30-minute slot to:</p>

            <button
              type="button"
              className="wr-slot-action"
              onClick={() => onDirectStatus("REST")}
              disabled={saving || status === "REST"}
            >
              <span className="wr-slot-action__left">
                <span className="wr-status-square is-rest" />
                Rest
              </span>
            </button>

            <button
              type="button"
              className="wr-slot-action"
              onClick={() => onDirectStatus("MEAL")}
              disabled={saving || status === "MEAL"}
            >
              <span className="wr-slot-action__left">
                <span className="wr-status-square is-meal" />
                Meal/Tea/Break
              </span>
            </button>

            <p className="wr-slot-popover__hint is-muted">
              To record Work here, delete this Rest/Meal slot first.
            </p>

            <button
              type="button"
              className="wr-slot-action wr-slot-action--cancel"
              onClick={() => setEditing(false)}
            >
              <span className="wr-slot-action__left">
                <X size={14} />
                Cancel edit
              </span>
            </button>
          </>
        )}

        {deleteConfirm && (
          <div className="wr-inline-confirm">
            <strong>Delete this {label.toLowerCase()} entry?</strong>
            <span>{slotLabel} will become unrecorded.</span>

            <div className="wr-inline-confirm__actions">
              <button
                type="button"
                className="wr-mini-button is-secondary"
                onClick={() => setDeleteConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wr-mini-button is-danger"
                onClick={onDelete}
                disabled={saving}
              >
                Delete
              </button>
            </div>
          </div>
        )}

        {!deleteConfirm && !editing && (
          <button
            type="button"
            className="wr-slot-action wr-slot-action--cancel"
            onClick={onClose}
          >
            <span className="wr-slot-action__left">
              <X size={14} />
              Close
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function WorkSessionEditor({
  session,
  range,
  editStartIndex,
  setEditStartIndex,
  editEndIndex,
  setEditEndIndex,
  startOptions,
  endOptions,
  workLocation,
  setWorkLocation,
  customWorkLocation,
  setCustomWorkLocation,
  saving,
  editing,
  setEditing,
  deleteConfirm,
  setDeleteConfirm,
  onSave,
  onDelete,
  onClose,
  alignRight,
}) {
  const resolvedLocation = resolveWorkLocation(
    workLocation,
    customWorkLocation
  );

  const canSave =
    Boolean(resolvedLocation) &&
    editStartIndex !== "" &&
    editEndIndex !== "" &&
    Number(editEndIndex) > Number(editStartIndex) &&
    !saving;

  return (
    <div
      className={`wr-slot-popover wr-slot-popover--work-session${
        alignRight ? " is-right" : ""
      }`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="wr-work-session-editor">
        <div className="wr-work-session-editor__heading">
          <div>
            <p className="wr-slot-popover__title">Work session</p>
            <span>
              {formatSlotTime(range.startIndex)} – {formatEndTime(range.endIndex)}
            </span>
          </div>

          <button
            type="button"
            className="wr-icon-button"
            onClick={onClose}
            aria-label="Close work session editor"
          >
            <X size={15} />
          </button>
        </div>

        {!editing && !deleteConfirm && (
          <>
            <div className="wr-work-session-summary">
              <span>Location</span>
              <strong>{session.shipLocation || "—"}</strong>
            </div>

            <div className="wr-manage-actions">
              <button
                type="button"
                className="wr-manage-button"
                onClick={() => setEditing(true)}
                disabled={saving}
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                className="wr-manage-button is-danger"
                onClick={() => setDeleteConfirm(true)}
                disabled={saving}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </>
        )}

        {editing && (
          <>
            <label className="wr-popover-field">
              <span>Start time</span>
              <select
                value={editStartIndex}
                onChange={(event) => setEditStartIndex(event.target.value)}
              >
                {startOptions.map((slotIndex) => (
                  <option key={slotIndex} value={slotIndex}>
                    {formatSlotTime(slotIndex)}
                  </option>
                ))}
              </select>
            </label>

            <label className="wr-popover-field">
              <span>End time</span>
              <select
                value={editEndIndex}
                onChange={(event) => setEditEndIndex(event.target.value)}
              >
                {endOptions.map((slotIndex) => (
                  <option key={slotIndex} value={slotIndex}>
                    {formatEndTime(slotIndex)}
                  </option>
                ))}
              </select>
            </label>

            <LocationFields
              workLocation={workLocation}
              setWorkLocation={setWorkLocation}
              customWorkLocation={customWorkLocation}
              setCustomWorkLocation={setCustomWorkLocation}
            />

            <div className="wr-work-session-editor__footer">
              <button
                type="button"
                className="wr-mini-button is-secondary"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="wr-mini-button is-primary"
                onClick={onSave}
                disabled={!canSave}
              >
                <Save size={13} />
                Save changes
              </button>
            </div>
          </>
        )}

        {deleteConfirm && (
          <div className="wr-inline-confirm wr-inline-confirm--work">
            <strong>Delete this work session?</strong>
            <span>
              {formatSlotTime(range.startIndex)} – {formatEndTime(range.endIndex)} will become unrecorded.
            </span>

            <div className="wr-inline-confirm__actions">
              <button
                type="button"
                className="wr-mini-button is-secondary"
                onClick={() => setDeleteConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wr-mini-button is-danger"
                onClick={onDelete}
                disabled={saving}
              >
                Delete session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DayNote({
  comment,
  draft,
  setDraft,
  editing,
  setEditing,
  deleteConfirm,
  setDeleteConfirm,
  saving,
  onSave,
  onDelete,
}) {
  const hasComment = Boolean(String(comment || "").trim());

  return (
    <section className="wr-day-note">
      <div className="wr-day-note__header">
        <div>
          <h3>Note for the day</h3>
          <p>Add information relevant to this day&apos;s work and rest record.</p>
        </div>

        {hasComment && !editing && !deleteConfirm && (
          <div className="wr-day-note__header-actions">
            <button
              type="button"
              className="wr-note-action"
              onClick={() => {
                setDraft(comment || "");
                setEditing(true);
              }}
              disabled={saving}
            >
              <Pencil size={14} />
              Edit
            </button>

            <button
              type="button"
              className="wr-note-action is-danger"
              onClick={() => setDeleteConfirm(true)}
              disabled={saving}
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {!hasComment && !editing && !deleteConfirm && (
        <div className="wr-day-note__empty">
          <span>No note has been added for this date.</span>
          <button
            type="button"
            className="wr-note-add"
            onClick={() => {
              setDraft("");
              setEditing(true);
            }}
          >
            Add note
          </button>
        </div>
      )}

      {hasComment && !editing && !deleteConfirm && (
        <div className="wr-day-note__saved">{comment}</div>
      )}

      {editing && (
        <div className="wr-day-note__editor">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value.slice(0, 1000))}
            placeholder="Write a note about work, rest, schedule changes, or anything important from this day..."
            maxLength={1000}
            rows={4}
            autoFocus
          />

          <div className="wr-day-note__editor-footer">
            <span>{draft.length}/1000</span>

            <div>
              <button
                type="button"
                className="wr-mini-button is-secondary"
                onClick={() => {
                  setDraft(comment || "");
                  setEditing(false);
                }}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="wr-mini-button is-primary"
                onClick={onSave}
                disabled={!draft.trim() || saving}
              >
                <Save size={13} />
                {hasComment ? "Update note" : "Save note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="wr-day-note__confirm">
          <div>
            <strong>Delete this note?</strong>
            <span>This removes the note for the selected date.</span>
          </div>

          <div>
            <button
              type="button"
              className="wr-mini-button is-secondary"
              onClick={() => setDeleteConfirm(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="wr-mini-button is-danger"
              onClick={onDelete}
              disabled={saving}
            >
              Delete note
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function WorkRestPage() {
  const datePickerRef = useRef(null);

  const [localNow, setLocalNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setLocalNow(new Date());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const todayKey = getLocalDateKey(localNow);
  const [selectedDate, setSelectedDate] = useState(() =>
    getLocalDateKey(new Date())
  );
  const [profile, setProfile] = useState(null);

  const [dayData, setDayData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [mlcOpen, setMlcOpen] = useState(false);
  const [remarksOpen, setRemarksOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState(null);
  const [workOpen, setWorkOpen] = useState(false);
  const [workLocation, setWorkLocation] = useState("");
  const [customWorkLocation, setCustomWorkLocation] = useState("");
  const [manualEndIndex, setManualEndIndex] = useState("");

  const [slotStatusEditOpen, setSlotStatusEditOpen] = useState(false);
  const [slotDeleteConfirm, setSlotDeleteConfirm] = useState(false);

  const [selectedWorkSession, setSelectedWorkSession] = useState(null);
  const [selectedWorkRange, setSelectedWorkRange] = useState(null);
  const [workSessionEditing, setWorkSessionEditing] = useState(false);
  const [workSessionDeleteConfirm, setWorkSessionDeleteConfirm] = useState(false);
  const [workEditStartIndex, setWorkEditStartIndex] = useState("");
  const [workEditEndIndex, setWorkEditEndIndex] = useState("");

  const [commentDraft, setCommentDraft] = useState("");
  const [commentEditing, setCommentEditing] = useState(false);
  const [commentDeleteConfirm, setCommentDeleteConfirm] = useState(false);

  const baseHeader = workRestMockData?.header || {};
  const navigation = workRestMockData?.navigation || [];

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await getMyProfile();
        if (!cancelled) setProfile(data);
      } catch (profileError) {
        console.error("Failed to load profile:", profileError);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDateData = useCallback(
    async (showLoader = false) => {
      if (showLoader) setLoading(true);

      setError("");

      try {
        const [day, summary, active] = await Promise.all([
          getWorkRestDay(selectedDate),
          getWorkRestSummary(selectedDate),
          getActiveWorkSession(),
        ]);

        setDayData(day);
        setSummaryData(summary);
        setActiveSession(active || null);
      } catch (loadError) {
        console.error("Failed to load work/rest page:", loadError);
        setError(getWorkRestErrorMessage(loadError, "load"));
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [selectedDate]
  );

  function resetLocationFields() {
    setWorkLocation("");
    setCustomWorkLocation("");
  }

  function closeSlotEditor() {
    setSelectedSlot(null);
    setWorkOpen(false);
    resetLocationFields();
    setManualEndIndex("");
    setSlotStatusEditOpen(false);
    setSlotDeleteConfirm(false);
    setSelectedWorkSession(null);
    setSelectedWorkRange(null);
    setWorkSessionEditing(false);
    setWorkSessionDeleteConfirm(false);
    setWorkEditStartIndex("");
    setWorkEditEndIndex("");
  }

  useEffect(() => {
    closeSlotEditor();
    setNotice("");
    setCommentEditing(false);
    setCommentDeleteConfirm(false);
    refreshDateData(true);
    // closeSlotEditor intentionally uses state setters only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, refreshDateData]);

  useEffect(() => {
    setCommentDraft(dayData?.commentOfDay || "");
    setCommentEditing(false);
    setCommentDeleteConfirm(false);
  }, [selectedDate, dayData?.commentOfDay]);

  useEffect(() => {
    if (!activeSession?.id) return undefined;

    const intervalId = window.setInterval(() => {
      refreshDateData(false);
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [activeSession?.id, refreshDateData]);

  useEffect(() => {
    if (!datePickerOpen) return undefined;

    function handlePointerDown(event) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDatePickerOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setDatePickerOpen(false);
        closeSlotEditor();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [datePickerOpen]);

  const blocks = useMemo(
    () => normalizeBlocks(dayData?.statusBlocks),
    [dayData?.statusBlocks]
  );

  const stats = useMemo(
    () => normalizeSummary(summaryData || dayData?.summary, blocks),
    [summaryData, dayData?.summary, blocks]
  );

  const avatarImage = useMemo(
    () => getProfileAvatar(profile),
    [profile]
  );

  const mergedHeader = useMemo(
    () => ({
      ...baseHeader,
      fullName: profile?.fullName || baseHeader.fullName,
      email: profile?.email || baseHeader.email,
      userInitials: getInitials(profile?.fullName || baseHeader.fullName),
    }),
    [baseHeader, profile]
  );

  const currentSlotIndex = getCurrentSlotIndex(localNow);
  const isToday = selectedDate === todayKey;
  const selectedStatus =
    selectedSlot === null ? null : blocks[selectedSlot];

  const manualMode =
    selectedSlot !== null &&
    (!isToday || editMode || selectedSlot !== currentSlotIndex);

  const manualEndOptions = useMemo(() => {
    if (selectedSlot === null) return [];

    let lastPossibleEnd = 48;

    if (isToday) {
      lastPossibleEnd = getCompletedBoundaryIndex(localNow);
    }

    if (lastPossibleEnd <= selectedSlot) return [];

    return Array.from(
      { length: lastPossibleEnd - selectedSlot },
      (_, index) => selectedSlot + index + 1
    );
  }, [selectedSlot, isToday, localNow]);

  const workStartOptions = useMemo(() => {
    if (!selectedWorkRange) return [];

    const endIndex = Number(workEditEndIndex || selectedWorkRange.endIndex);
    const maxStartToday = isToday
      ? Math.min(currentSlotIndex, 47)
      : 47;

    const allowed = new Set();

    for (let index = 0; index <= maxStartToday; index += 1) {
      if (index < endIndex) allowed.add(index);
    }

    allowed.add(selectedWorkRange.startIndex);

    return [...allowed]
      .filter((index) => index < endIndex)
      .sort((a, b) => a - b);
  }, [selectedWorkRange, workEditEndIndex, isToday, currentSlotIndex]);

  const workEndOptions = useMemo(() => {
    if (!selectedWorkRange) return [];

    const startIndex = Number(
      workEditStartIndex === ""
        ? selectedWorkRange.startIndex
        : workEditStartIndex
    );

    const maxCompletedEnd = isToday
      ? getCompletedBoundaryIndex(localNow)
      : 48;

    const allowed = new Set();

    for (let index = startIndex + 1; index <= maxCompletedEnd; index += 1) {
      allowed.add(index);
    }

    // Preserve the current inferred range even when a live session ended inside
    // the current half-hour (for example 09:40 maps visually through 10:00).
    allowed.add(selectedWorkRange.endIndex);

    return [...allowed]
      .filter((index) => index > startIndex && index <= 48)
      .sort((a, b) => a - b);
  }, [
    selectedWorkRange,
    workEditStartIndex,
    isToday,
    localNow,
  ]);

  async function applyDayMutation(updatedDay) {
    if (!updatedDay) {
      await refreshDateData(false);
      return;
    }

    setDayData(updatedDay);

    if (updatedDay.summary) {
      setSummaryData(updatedDay.summary);
    } else {
      setSummaryData(await getWorkRestSummary(selectedDate));
    }
  }

  function openDatePicker() {
    setDatePickerOpen((value) => !value);
    closeSlotEditor();
  }

  function prepareWorkSessionForEditing(session, range) {
    const location = splitLocation(session?.shipLocation);

    setSelectedWorkSession(session);
    setSelectedWorkRange(range);
    setWorkEditStartIndex(String(range.startIndex));
    setWorkEditEndIndex(String(range.endIndex));
    setWorkLocation(location.choice);
    setCustomWorkLocation(location.custom);
    setWorkSessionEditing(false);
    setWorkSessionDeleteConfirm(false);
  }

  function handleSlotClick(slotIndex, status) {
    if (saving) return;

    const isFuture = isToday && slotIndex > currentSlotIndex;
    if (isFuture) return;

    if (!isToday && !editMode) return;

    if (status === "WORK") {
      if (!editMode) return;

      const session = findWorkSessionForSlot(
        dayData?.sessions,
        selectedDate,
        slotIndex
      );

      if (!session) {
        setError(
          "This Work block could not be matched to its work session. Refresh the page and try again."
        );
        return;
      }

      if (session.status === "ACTIVE" || !session.endedAt) {
        setError("Clock out of the active work session before editing or deleting it.");
        return;
      }

      const range = getSessionSlotRangeForDate(session, selectedDate);

      if (!range) {
        setError("This work session could not be mapped to the selected day.");
        return;
      }

      setSelectedSlot(slotIndex);
      setWorkOpen(false);
      setManualEndIndex("");
      setSlotStatusEditOpen(false);
      setSlotDeleteConfirm(false);
      setError("");
      setNotice("");
      prepareWorkSessionForEditing(session, range);
      return;
    }

    if (status !== "UNRECORDED" && !editMode) return;

    setSelectedSlot(slotIndex);
    setSelectedWorkSession(null);
    setSelectedWorkRange(null);
    setWorkSessionEditing(false);
    setWorkSessionDeleteConfirm(false);
    setWorkOpen(false);
    resetLocationFields();
    setManualEndIndex("");
    setSlotStatusEditOpen(false);
    setSlotDeleteConfirm(false);
    setError("");
    setNotice("");
  }

  async function handleDirectStatus(status) {
    if (selectedSlot === null || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updatedDay = await updateWorkRestSlots(
        selectedDate,
        [{ slotIndex: selectedSlot, status }]
      );

      await applyDayMutation(updatedDay);
      setNotice(
        status === "REST"
          ? "Rest time updated."
          : "Meal/Tea/Break updated."
      );
      closeSlotEditor();
    } catch (updateError) {
      console.error("Slot update failed:", updateError);
      setError(getWorkRestErrorMessage(updateError, "slot"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSlot() {
    if (selectedSlot === null || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updatedDay = await deleteWorkRestSlot(selectedDate, selectedSlot);
      await applyDayMutation(updatedDay);
      setNotice("Recorded time deleted.");
      closeSlotEditor();
    } catch (deleteError) {
      console.error("Slot delete failed:", deleteError);
      setError(getWorkRestErrorMessage(deleteError, "slot-delete"));
    } finally {
      setSaving(false);
    }
  }

  async function handleClockIn() {
    const location = resolveWorkLocation(workLocation, customWorkLocation);

    if (!location || activeSession || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const session = await clockInToWork(location);
      setActiveSession(session);
      setNotice("Clocked in successfully.");
      closeSlotEditor();
      await refreshDateData(false);
    } catch (clockInError) {
      console.error("Clock in failed:", clockInError);
      setError(getWorkRestErrorMessage(clockInError, "clock-in"));
    } finally {
      setSaving(false);
    }
  }

  async function handleManualWork() {
    const location = resolveWorkLocation(workLocation, customWorkLocation);

    if (
      selectedSlot === null ||
      manualEndIndex === "" ||
      !location ||
      saving
    ) {
      return;
    }

    const startedAt = buildLocalSlotDate(selectedDate, selectedSlot);
    const endedAt = buildLocalSlotDate(selectedDate, Number(manualEndIndex));

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await createManualWorkSession({
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        shipLocation: location,
        selectedDate,
        startSlotIndex: selectedSlot,
        endSlotIndex: Number(manualEndIndex),
        timezoneOffsetMinutes: startedAt.getTimezoneOffset(),
      });

      setNotice(result?.message || "Missed work session saved.");
      closeSlotEditor();

      if (result?.day) {
        await applyDayMutation(result.day);
      } else {
        await refreshDateData(false);
      }
    } catch (manualError) {
      console.error("Manual work save failed:", manualError);
      setError(getWorkRestErrorMessage(manualError, "manual"));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateWorkSession() {
    if (!selectedWorkSession || !selectedWorkRange || saving) return;

    const location = resolveWorkLocation(workLocation, customWorkLocation);
    const newStart = Number(workEditStartIndex);
    const newEnd = Number(workEditEndIndex);

    if (!location || !Number.isInteger(newStart) || !Number.isInteger(newEnd)) {
      return;
    }

    if (newEnd <= newStart) {
      setError("The end time must be later than the start time.");
      return;
    }

    const startedAt =
      newStart === selectedWorkRange.startIndex
        ? new Date(selectedWorkSession.startedAt)
        : buildLocalSlotDate(selectedDate, newStart);

    const endedAt =
      newEnd === selectedWorkRange.endIndex
        ? new Date(selectedWorkSession.endedAt)
        : buildLocalSlotDate(selectedDate, newEnd);

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await updateExistingWorkSession(
        selectedWorkSession.id,
        {
          startedAt: startedAt.toISOString(),
          endedAt: endedAt.toISOString(),
          shipLocation: location,
          selectedDate,
          oldStartSlotIndex: selectedWorkRange.startIndex,
          oldEndSlotIndex: selectedWorkRange.endIndex,
          startSlotIndex: newStart,
          endSlotIndex: newEnd,
        }
      );

      await applyDayMutation(result.day);
      setNotice(result.message || "Work session updated successfully.");
      closeSlotEditor();
    } catch (updateError) {
      console.error("Work session update failed:", updateError);
      setError(getWorkRestErrorMessage(updateError, "work-edit"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteWorkSession() {
    if (!selectedWorkSession || !selectedWorkRange || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await deleteExistingWorkSession(
        selectedWorkSession.id,
        {
          selectedDate,
          startSlotIndex: selectedWorkRange.startIndex,
          endSlotIndex: selectedWorkRange.endIndex,
        }
      );

      await applyDayMutation(result.day);
      setNotice(result.message || "Work session deleted successfully.");
      closeSlotEditor();
    } catch (deleteError) {
      console.error("Work session delete failed:", deleteError);
      setError(getWorkRestErrorMessage(deleteError, "work-delete"));
    } finally {
      setSaving(false);
    }
  }

  async function handleClockOut() {
    if (!activeSession || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await clockOutOfWork();
      setActiveSession(null);
      setNotice("Clocked out successfully.");
      await refreshDateData(false);
    } catch (clockOutError) {
      console.error("Clock out failed:", clockOutError);
      setError(getWorkRestErrorMessage(clockOutError, "clock-out"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveComment() {
    const comment = commentDraft.trim();

    if (!comment || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updatedDay = await updateWorkRestDayComment(selectedDate, comment);
      await applyDayMutation(updatedDay);
      setCommentEditing(false);
      setNotice("Note for the day saved.");
    } catch (commentError) {
      console.error("Comment save failed:", commentError);
      setError(getWorkRestErrorMessage(commentError, "comment"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteComment() {
    if (saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const updatedDay = await deleteWorkRestDayComment(selectedDate);
      await applyDayMutation(updatedDay);
      setCommentDraft("");
      setCommentEditing(false);
      setCommentDeleteConfirm(false);
      setNotice("Note for the day deleted.");
    } catch (commentError) {
      console.error("Comment delete failed:", commentError);
      setError(getWorkRestErrorMessage(commentError, "comment-delete"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell">
      <AppHeader header={mergedHeader} />

      <main className="work-rest-page">
        <div className="work-rest-container">
          <section className="wr-profile-strip">
            <div className="wr-profile-avatar">
              {avatarImage ? (
                <img src={avatarImage} alt="" />
              ) : (
                <span>{getInitials(profile?.fullName)}</span>
              )}
            </div>

            <div className="wr-profile-copy">
              <strong>{profile?.fullName || "Crew Member"}</strong>

              <div>
                <span>Vessel - {profile?.vessel || "—"}</span>
                <span className="wr-profile-divider">·</span>
                <span>Location - {profile?.vessel || "—"}</span>
              </div>
            </div>
          </section>

          <section className="wr-compliance-section">
            <div className="wr-section-heading">
              <h1>MLC 2.3 Compliance Summary</h1>
              <p>Track your work/rest compliance and review the selected day.</p>
            </div>

            <div className="wr-stat-grid">
              <StatCard
                icon={complianceRateIcon}
                tone="compliance"
                label="Compliance rate"
                value={stats.complianceRate}
                suffix="%"
              />
              <StatCard
                icon={violationsIcon}
                tone="violations"
                label="Violations"
                value={stats.violations}
              />
              <StatCard
                icon={hoursWorkedIcon}
                tone="hours"
                label="Hours worked"
                value={stats.hoursWorked}
              />
              <StatCard
                icon={restRecordedIcon}
                tone="rest"
                label="Rest recorded"
                value={stats.restRecorded}
              />
            </div>

            <div className="wr-accordion-stack">
              <Accordion
                title="MLC Requirement"
                items={MLC_REQUIREMENTS}
                open={mlcOpen}
                onToggle={() => setMlcOpen((value) => !value)}
              />

              <Accordion
                title="Remarks"
                items={REMARKS}
                open={remarksOpen}
                onToggle={() => setRemarksOpen((value) => !value)}
              />
            </div>
          </section>

          <section className="wr-record-card">
            <div className="wr-record-header">
              <div>
                <h2>
                  Daily Work &amp; Rest Record – {formatRecordDate(selectedDate)}
                </h2>
                <p>Review or update your Work and Rest hours for the selected date.</p>
              </div>

              <div className="wr-record-controls">
                <div className="wr-date-picker-shell" ref={datePickerRef}>
                  <button
                    type="button"
                    className={`wr-date-control${datePickerOpen ? " is-open" : ""}`}
                    onClick={openDatePicker}
                    aria-expanded={datePickerOpen}
                    aria-haspopup="dialog"
                    aria-label={`Select work/rest date. Current date ${formatDateButton(
                      selectedDate
                    )}`}
                  >
                    <span>{formatDateButton(selectedDate)}</span>
                    <img
                      src={dateRangeIcon}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                    />
                  </button>

                  {datePickerOpen ? (
                    <FigmaDatePicker
                      selectedDate={selectedDate}
                      maxDate={todayKey}
                      onCancel={() => setDatePickerOpen(false)}
                      onChoose={(dateKey) => {
                        setSelectedDate(dateKey);
                        setEditMode(false);
                        setDatePickerOpen(false);
                        closeSlotEditor();
                      }}
                    />
                  ) : null}
                </div>

                <button
                  type="button"
                  className={`wr-edit-button${editMode ? " is-active" : ""}`}
                  aria-pressed={editMode}
                  title={
                    editMode
                      ? "Finish editing the selected date"
                      : "Edit recorded Work, Rest or Meal entries"
                  }
                  onClick={() => {
                    setDatePickerOpen(false);
                    setEditMode((value) => !value);
                    closeSlotEditor();
                  }}
                >
                  <img
                    src={editIcon}
                    alt=""
                    aria-hidden="true"
                    draggable="false"
                  />
                  <span>{editMode ? "Done" : "Edit"}</span>
                </button>
              </div>
            </div>

            <div className="wr-status-legend">
              {Object.entries(STATUS_META).map(([status, meta]) => (
                <span key={status}>
                  <i
                    className={`wr-legend-dot wr-legend-dot--${status.toLowerCase()}`}
                  />
                  {meta.label}
                </span>
              ))}
            </div>

            {editMode && (
              <div className="wr-edit-mode-note">
                Edit mode is on. Select any recorded Work, Rest or Meal block to edit or delete it.
              </div>
            )}

            {activeSession && selectedDate === todayKey && (
              <div className="wr-active-banner">
                <div>
                  <strong>Currently working at {activeSession.shipLocation}</strong>
                  <span>Started at {formatSessionTime(activeSession.startedAt)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleClockOut}
                  disabled={saving}
                >
                  <Clock3 size={14} />
                  Clock out
                </button>
              </div>
            )}

            {error && <div className="wr-message is-error">{error}</div>}
            {notice && <div className="wr-message is-success">{notice}</div>}

            {loading ? (
              <div className="wr-loading">Loading work/rest record...</div>
            ) : (
              <>
                <div className="wr-day-sections">
                  {DAY_SECTIONS.map((section) => (
                    <div key={section.title} className="wr-day-section">
                      <h3>{section.title}</h3>

                      <div className="wr-time-grid">
                        {section.slots.map((slotIndex, sectionSlotIndex) => {
                          const status = blocks[slotIndex];
                          const meta = STATUS_META[status] || STATUS_META.UNRECORDED;
                          const selected = selectedSlot === slotIndex;
                          const isFuture = isToday && slotIndex > currentSlotIndex;
                          const pastLocked = !isToday && !editMode;
                          const recordedLocked = status !== "UNRECORDED" && !editMode;

                          const disabled =
                            saving ||
                            isFuture ||
                            pastLocked ||
                            recordedLocked;

                          return (
                            <div key={slotIndex} className="wr-slot-anchor">
                              <button
                                type="button"
                                className={`wr-time-slot wr-time-slot--${status.toLowerCase()}${
                                  selected ? " is-selected" : ""
                                }${editMode && status !== "UNRECORDED" ? " is-editable" : ""}`}
                                onClick={() => handleSlotClick(slotIndex, status)}
                                disabled={disabled}
                                title={
                                  isFuture
                                    ? "Future time cannot be updated yet."
                                    : pastLocked
                                    ? "Click Edit to update a previous date."
                                    : recordedLocked
                                    ? "Click Edit to manage this recorded time."
                                    : editMode && status !== "UNRECORDED"
                                    ? `Edit or delete ${meta.label}`
                                    : meta.label
                                }
                              >
                                {meta.letter}
                              </button>

                              <span className="wr-time-label">
                                {formatSlotTime(slotIndex)}
                              </span>

                              {selected && selectedStatus === "UNRECORDED" && (
                                <AddSlotEditor
                                  manualMode={manualMode}
                                  startLabel={
                                    manualMode
                                      ? formatSlotTime(slotIndex)
                                      : formatSessionTime(new Date())
                                  }
                                  workLocation={workLocation}
                                  setWorkLocation={setWorkLocation}
                                  customWorkLocation={customWorkLocation}
                                  setCustomWorkLocation={setCustomWorkLocation}
                                  manualEndIndex={manualEndIndex}
                                  setManualEndIndex={setManualEndIndex}
                                  manualEndOptions={manualEndOptions}
                                  saving={saving}
                                  activeSession={activeSession}
                                  onDirectStatus={handleDirectStatus}
                                  onClockIn={handleClockIn}
                                  onSaveManual={handleManualWork}
                                  onClose={closeSlotEditor}
                                  onOpenWork={() => {
                                    setWorkOpen(true);
                                    setManualEndIndex("");
                                  }}
                                  workOpen={workOpen}
                                  alignRight={sectionSlotIndex >= 8}
                                />
                              )}

                              {selected &&
                                (selectedStatus === "REST" || selectedStatus === "MEAL") && (
                                  <RecordedSlotEditor
                                    status={selectedStatus}
                                    slotLabel={formatSlotTime(slotIndex)}
                                    saving={saving}
                                    editing={slotStatusEditOpen}
                                    setEditing={setSlotStatusEditOpen}
                                    deleteConfirm={slotDeleteConfirm}
                                    setDeleteConfirm={setSlotDeleteConfirm}
                                    onDirectStatus={handleDirectStatus}
                                    onDelete={handleDeleteSlot}
                                    onClose={closeSlotEditor}
                                    alignRight={sectionSlotIndex >= 8}
                                  />
                                )}

                              {selected &&
                                selectedStatus === "WORK" &&
                                selectedWorkSession &&
                                selectedWorkRange && (
                                  <WorkSessionEditor
                                    session={selectedWorkSession}
                                    range={selectedWorkRange}
                                    editStartIndex={workEditStartIndex}
                                    setEditStartIndex={setWorkEditStartIndex}
                                    editEndIndex={workEditEndIndex}
                                    setEditEndIndex={setWorkEditEndIndex}
                                    startOptions={workStartOptions}
                                    endOptions={workEndOptions}
                                    workLocation={workLocation}
                                    setWorkLocation={setWorkLocation}
                                    customWorkLocation={customWorkLocation}
                                    setCustomWorkLocation={setCustomWorkLocation}
                                    saving={saving}
                                    editing={workSessionEditing}
                                    setEditing={setWorkSessionEditing}
                                    deleteConfirm={workSessionDeleteConfirm}
                                    setDeleteConfirm={setWorkSessionDeleteConfirm}
                                    onSave={handleUpdateWorkSession}
                                    onDelete={handleDeleteWorkSession}
                                    onClose={closeSlotEditor}
                                    alignRight={sectionSlotIndex >= 8}
                                  />
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <DayNote
                  comment={dayData?.commentOfDay || ""}
                  draft={commentDraft}
                  setDraft={setCommentDraft}
                  editing={commentEditing}
                  setEditing={setCommentEditing}
                  deleteConfirm={commentDeleteConfirm}
                  setDeleteConfirm={setCommentDeleteConfirm}
                  saving={saving}
                  onSave={handleSaveComment}
                  onDelete={handleDeleteComment}
                />
              </>
            )}
          </section>
        </div>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default WorkRestPage;
