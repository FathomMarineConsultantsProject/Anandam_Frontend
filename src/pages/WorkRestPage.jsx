import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Clock3, X } from "lucide-react";

import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";

import { workRestMockData } from "../data/workRestData";
import { getMyProfile } from "../api/profileApi";

import {
  getWorkRestDay,
  updateWorkRestSlots,
  getActiveWorkSession,
  clockInToWork,
  clockOutOfWork,
  createManualWorkSession,
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

const DAY_SECTIONS = [
  {
    title: "Morning: 06:00–12:00",
    slots: Array.from({ length: 12 }, (_, index) => index + 12),
  },
  {
    title: "Afternoon: 12:00–18:00",
    slots: Array.from({ length: 12 }, (_, index) => index + 24),
  },
  {
    title: "Evening: 18:00–12:00",
    slots: Array.from({ length: 12 }, (_, index) => index + 36),
  },
  {
    title: "Night: 12:00–06:00",
    slots: Array.from({ length: 12 }, (_, index) => index),
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
  const totalMinutes = slotIndex * 30;
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

  // Monday = 0 ... Sunday = 6, matching the Figma calendar.
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
                if (disabled) return;
                setDraftDate(item.key);
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

/*
  The Work/Rest screen is displayed in the user's LOCAL/browser time.
  Build the selected slot as local wall-clock time first. Calling
  .toISOString() later converts that real local instant to UTC for the API.

  Example in India:
  09:00 local -> 03:30Z
  12:00 local -> 06:30Z
*/
function buildLocalSlotDate(dateKey, slotIndex) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    0,
    slotIndex * 30,
    0,
    0
  );
}

function getCurrentSlotIndex(now = new Date()) {

  // Use the device/browser local clock for the TODAY grid.
  // Example: at 5:23 PM, the 5:00 PM slot is current and
  // the 5:30 PM slot is still in the future.
  return (
    now.getHours() * 2 +
    (now.getMinutes() >= 30 ? 1 : 0)
  );
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

function SlotEditor({
  manualMode,
  startLabel,
  workLocation,
  setWorkLocation,
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
  const canClockIn =
    Boolean(workLocation) &&
    !saving &&
    !activeSession;

  const canSaveManual =
    Boolean(workLocation) &&
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
        <p className="wr-slot-popover__title">Update selected time</p>

        <button
          type="button"
          className="wr-slot-action"
          onClick={onOpenWork}
          disabled={Boolean(activeSession)}
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
                onChange={(event) =>
                  setManualEndIndex(event.target.value)
                }
              >
                <option value="">Select End time</option>

                {manualEndOptions.map((slotIndex) => (
                  <option key={slotIndex} value={slotIndex}>
                    {formatEndTime(slotIndex)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="wr-popover-field">
            <span>Work location</span>

            <select
              value={workLocation}
              onChange={(event) =>
                setWorkLocation(event.target.value)
              }
            >
              <option value="">Choose ship area</option>

              {SHIP_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

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

function WorkRestPage() {
  const datePickerRef = useRef(null);

  // Keep the TODAY restriction synced to the user's device/browser clock.
  // The device timezone therefore controls what counts as "future".
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
  const [manualEndIndex, setManualEndIndex] = useState("");

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

  useEffect(() => {
    setSelectedSlot(null);
    setWorkOpen(false);
    setWorkLocation("");
    setManualEndIndex("");
    setNotice("");

    refreshDateData(true);
  }, [selectedDate, refreshDateData]);

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
    () =>
      normalizeSummary(
        summaryData || dayData?.summary,
        blocks
      ),
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
      userInitials: getInitials(
        profile?.fullName || baseHeader.fullName
      ),
    }),
    [baseHeader, profile]
  );

  const currentSlotIndex = getCurrentSlotIndex(localNow);
  const isToday = selectedDate === todayKey;

  const manualMode =
    selectedSlot !== null &&
    (!isToday ||
      editMode ||
      selectedSlot !== currentSlotIndex);

  const manualEndOptions = useMemo(() => {
    if (selectedSlot === null) return [];

    let lastPossibleEnd = 48;

    if (isToday) {
      lastPossibleEnd = Math.floor(
        (localNow.getHours() * 60 + localNow.getMinutes()) / 30
      );
    }

    if (lastPossibleEnd <= selectedSlot) return [];

    return Array.from(
      { length: lastPossibleEnd - selectedSlot },
      (_, index) => selectedSlot + index + 1
    );
  }, [selectedSlot, isToday, localNow]);

  function closeSlotEditor() {
    setSelectedSlot(null);
    setWorkOpen(false);
    setWorkLocation("");
    setManualEndIndex("");
  }

  function openDatePicker() {
    setDatePickerOpen((value) => !value);
    closeSlotEditor();
  }

  function handleSlotClick(slotIndex, status) {
    if (saving || status === "WORK") return;
    if (!isToday && !editMode) return;
    if (isToday && slotIndex > currentSlotIndex) return;

    setSelectedSlot(slotIndex);
    setWorkOpen(false);
    setWorkLocation("");
    setManualEndIndex("");
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

      setDayData(updatedDay);

      if (updatedDay?.summary) {
        setSummaryData(updatedDay.summary);
      } else {
        setSummaryData(await getWorkRestSummary(selectedDate));
      }

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

  async function handleClockIn() {
    if (!workLocation || activeSession || saving) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const session = await clockInToWork(workLocation);

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
    if (
      selectedSlot === null ||
      manualEndIndex === "" ||
      !workLocation ||
      saving
    ) {
      return;
    }

    const startedAt = buildLocalSlotDate(
      selectedDate,
      selectedSlot
    );

    const endedAt = buildLocalSlotDate(
      selectedDate,
      Number(manualEndIndex)
    );

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const manualPayload = {
        // Real instants used by backend validation / overlap checks.
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        shipLocation: workLocation,

        // Local-grid metadata keeps the selected 30-minute blocks aligned
        // with what the user clicked on screen.
        selectedDate,
        startSlotIndex: selectedSlot,
        endSlotIndex: Number(manualEndIndex),
        timezoneOffsetMinutes: startedAt.getTimezoneOffset(),
      };

      console.log("Manual work session payload:", manualPayload);

      await createManualWorkSession(manualPayload);

      setNotice("Missed work session saved.");

      closeSlotEditor();
      await refreshDateData(false);
    } catch (manualError) {
      console.error("Manual work save failed:", manualError);

      setError(getWorkRestErrorMessage(manualError, "manual"));
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
              <p>
                Track your work/rest compliance and review the selected day.
              </p>
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
                onToggle={() =>
                  setRemarksOpen((value) => !value)
                }
              />
            </div>
          </section>

          <section className="wr-record-card">
            <div className="wr-record-header">
              <div>
                <h2>
                  Daily Work &amp; Rest Record –{" "}
                  {formatRecordDate(selectedDate)}
                </h2>

                <p>
                  Review or update your Work and Rest hours for the
                  selected date.
                </p>
              </div>

              <div className="wr-record-controls">
                <div
                  className="wr-date-picker-shell"
                  ref={datePickerRef}
                >
                  <button
                    type="button"
                    className={`wr-date-control${
                      datePickerOpen ? " is-open" : ""
                    }`}
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
                  className={`wr-edit-button${
                    editMode ? " is-active" : ""
                  }`}
                  aria-pressed={editMode}
                  title={
                    editMode
                      ? "Editing enabled for the selected date"
                      : "Enable editing for a previous date"
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
                  <span>Edit</span>
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

            {activeSession && selectedDate === todayKey && (
              <div className="wr-active-banner">
                <div>
                  <strong>
                    Currently working at {activeSession.shipLocation}
                  </strong>

                  <span>
                    Started at{" "}
                    {formatSessionTime(activeSession.startedAt)}
                  </span>
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

            {error && (
              <div className="wr-message is-error">{error}</div>
            )}

            {notice && (
              <div className="wr-message is-success">{notice}</div>
            )}

            {loading ? (
              <div className="wr-loading">
                Loading work/rest record...
              </div>
            ) : (
              <div className="wr-day-sections">
                {DAY_SECTIONS.map((section) => (
                  <div
                    key={section.title}
                    className="wr-day-section"
                  >
                    <h3>{section.title}</h3>

                    <div className="wr-time-grid">
                      {section.slots.map(
                        (slotIndex, sectionSlotIndex) => {
                          const status = blocks[slotIndex];
                          const meta =
                            STATUS_META[status] ||
                            STATUS_META.UNRECORDED;

                          const selected =
                            selectedSlot === slotIndex;

                          const isFuture =
                            isToday &&
                            slotIndex > currentSlotIndex;

                          const pastLocked =
                            !isToday && !editMode;

                          const disabled =
                            saving ||
                            status === "WORK" ||
                            isFuture ||
                            pastLocked;

                          return (
                            <div
                              key={slotIndex}
                              className="wr-slot-anchor"
                            >
                              <button
                                type="button"
                                className={`wr-time-slot wr-time-slot--${status.toLowerCase()}${
                                  selected ? " is-selected" : ""
                                }`}
                                onClick={() =>
                                  handleSlotClick(
                                    slotIndex,
                                    status
                                  )
                                }
                                disabled={disabled}
                                title={
                                  status === "WORK"
                                    ? "Work time comes from a work session."
                                    : pastLocked
                                    ? "Click Edit to update a previous date."
                                    : isFuture
                                    ? "Future time cannot be updated yet."
                                    : meta.label
                                }
                              >
                                {meta.letter}
                              </button>

                              <span className="wr-time-label">
                                {formatSlotTime(slotIndex)}
                              </span>

                              {selected && (
                                <SlotEditor
                                  manualMode={manualMode}
                                  startLabel={
                                    manualMode
                                      ? formatSlotTime(slotIndex)
                                      : formatSessionTime(
                                          new Date()
                                        )
                                  }
                                  workLocation={workLocation}
                                  setWorkLocation={setWorkLocation}
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
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default WorkRestPage;
