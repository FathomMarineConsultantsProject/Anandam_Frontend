// src/pages/PerfectDaySchedulePage.jsx
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  Edit3,
  Eye,
  Flame,
  Layers3,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import AppLayout from "../components/layout/AppLayout";

import emptyActivitiesIllustration from "../assets/dayplanner/image 175.png";
import emptyTemplatesIllustration from "../assets/dayplanner/Group 1597885718.png";
import {
  applyDailyTemplate,
  createDailyActivity,
  createMyDayTemplate,
  deleteDailyActivity,
  deleteMyDayTemplate,
  getDailyPlan,
  getDailyTemplates,
  getLocalDateKey,
  getMyDayTemplates,
  toggleDailyActivityStatus,
  updateDailyActivity,
  updateMyDayTemplate,

  // Google Calendar
  getGoogleCalendarStatus,
  getGoogleCalendarConnectUrl,
  disconnectGoogleCalendar,
  syncGoogleCalendarActivity,
  getBrowserTimeZone,
} from "../api/perfectDayApi";
import { getUserFriendlyError } from "../api/client";
import "../styles/perfect-day-schedule.css";

const CATEGORY_OPTIONS = [
  "Work",
  "Fitness",
  "Wellbeing",
  "Social",
  "Learning",
  "Nutrition",
  "Safety",
  "Mindfulness",
  "Training",
  "Health",
  "Professional",
];

const DURATION_OPTIONS = [
  { value: 5, label: "5 minutes" },
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 20, label: "20 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 40, label: "40 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1 hour 30 minutes" },
  { value: 120, label: "2 hours" },
  { value: 150, label: "2 hours 30 minutes" },
  { value: 180, label: "3 hours" },
  { value: 240, label: "4 hours" },
];

const EMPTY_ACTIVITY = {
  title: "",
  category: "",
  date: getLocalDateKey(),
  time: "06:00",
  durationMinutes: 15,
  note: "",
};

const EMPTY_TEMPLATE_ACTIVITY = {
  title: "",
  category: "",
  time: "06:00",
  durationMinutes: 15,
  note: "",
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTimeLabel(time) {
  if (!time) return "—";

  const [hourValue, minuteValue] = String(time).split(":");
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return time;

  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${pad(minute)} ${meridiem}`;
}

function durationLabel(minutes) {
  const value = Number(minutes) || 0;
  if (value < 60) return `${value} Min`;

  const hours = Math.floor(value / 60);
  const remainder = value % 60;

  if (!remainder) return `${hours} ${hours === 1 ? "Hour" : "Hours"}`;
  return `${hours}h ${remainder}m`;
}

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getCategoryDotClass(category) {
  return `dp-category-dot dp-category-dot--${normalizeCategory(category)}`;
}

function toTemplatePayloadActivity(activity, index) {
  return {
    title: String(activity.title || "").trim(),
    category: String(activity.category || "Wellbeing").trim(),
    time: activity.time || "06:00",
    durationMinutes: Number(activity.durationMinutes) || 15,
    note: activity.note ? String(activity.note).trim() : null,
    order: Number.isInteger(Number(activity.order))
      ? Number(activity.order)
      : index,
  };
}

function friendlyError(error, fallback) {
  return getUserFriendlyError(error, fallback);
}

function GoogleCalendarMark() {
  return (
    <span
      className="dp-google-calendar-mark"
      aria-hidden="true"
    >
      <i className="is-blue" />
      <i className="is-red" />
      <i className="is-yellow" />
      <i className="is-green" />
    </span>
  );
}

function PlannerToast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <div
      className={`dp-toast dp-toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
    >
      <div className="dp-toast__body">
        <strong>{toast.title}</strong>
        <span>{toast.message}</span>
      </div>

      <button
        type="button"
        className="dp-toast__close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  danger = true,
  onCancel,
  onConfirm,
  busy,
}) {
  if (!open) return null;

  return (
    <div className="dp-modal-layer">
      <button
        type="button"
        className="dp-modal-backdrop"
        aria-label="Close dialog"
        onClick={busy ? undefined : onCancel}
      />

      <div
        className="dp-confirm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dp-confirm-title"
      >
        <h3 id="dp-confirm-title">{title}</h3>
        <p>{message}</p>

        <div className="dp-confirm__actions">
          <button
            type="button"
            className="dp-btn dp-btn--secondary"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>

          <button
            type="button"
            className={danger ? "dp-btn dp-btn--danger" : "dp-btn dp-btn--primary"}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function split24HourTime(time) {
  const [hourString, minuteString] = String(time || "06:00").split(":");
  const hour24 = Math.min(23, Math.max(0, Number(hourString) || 0));
  const minute = Math.min(59, Math.max(0, Number(minuteString) || 0));

  return {
    hour: hour24 % 12 || 12,
    minute,
    meridiem: hour24 >= 12 ? "PM" : "AM",
  };
}

function to24HourTime({ hour, minute, meridiem }) {
  let hour24 = Number(hour) || 12;

  if (meridiem === "AM" && hour24 === 12) hour24 = 0;
  if (meridiem === "PM" && hour24 !== 12) hour24 += 12;

  return `${pad(hour24)}:${pad(Number(minute) || 0)}`;
}

function TimePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => split24HourTime(value));
  const pickerRef = useRef(null);

  useEffect(() => {
    setDraft(split24HourTime(value));
  }, [value]);

  useEffect(() => {
    if (!open) return;

    function handleOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function setTime() {
    onChange(to24HourTime(draft));
    setOpen(false);
  }

  return (
    <div className="dp-time-picker" ref={pickerRef}>
      <button
        type="button"
        className="dp-input-button"
        onClick={() => setOpen((current) => !current)}
      >
        <span>{formatTimeLabel(value)}</span>
        <Clock3 size={16} strokeWidth={1.6} />
      </button>

      {open && (
        <div className="dp-time-popover">
          <p className="dp-time-popover__label">Enter Time</p>

          <div className="dp-time-popover__controls">
            <div className="dp-time-unit">
              <input
                type="number"
                min="1"
                max="12"
                value={draft.hour}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    hour: Math.min(
                      12,
                      Math.max(1, Number(event.target.value) || 1)
                    ),
                  }))
                }
              />
              <span>Hour</span>
            </div>

            <span className="dp-time-colon">:</span>

            <div className="dp-time-unit">
              <input
                type="number"
                min="0"
                max="59"
                value={pad(draft.minute)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    minute: Math.min(
                      59,
                      Math.max(0, Number(event.target.value) || 0)
                    ),
                  }))
                }
              />
              <span>Minute</span>
            </div>

            <div className="dp-meridiem">
              {["AM", "PM"].map((item) => (
                <button
                  type="button"
                  key={item}
                  className={draft.meridiem === item ? "is-active" : ""}
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      meridiem: item,
                    }))
                  }
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="dp-time-popover__actions">
            <button
              type="button"
              className="dp-time-cancel"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button type="button" className="dp-time-set" onClick={setTime}>
              Set time
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DurationField({ value, onChange }) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customHours, setCustomHours] = useState(1);
  const [customMinutes, setCustomMinutes] = useState(0);

  const standard = DURATION_OPTIONS.some(
    (option) => option.value === Number(value)
  );

  function handleSelect(event) {
    const selected = event.target.value;

    if (selected === "custom") {
      setCustomOpen(true);
      return;
    }

    setCustomOpen(false);
    onChange(Number(selected));
  }

  function applyCustom() {
    const total =
      Math.max(0, Number(customHours) || 0) * 60 +
      Math.max(0, Number(customMinutes) || 0);

    if (total > 0) {
      onChange(Math.min(1440, total));
      setCustomOpen(false);
    }
  }

  return (
    <div className="dp-duration-field">
      <div className="dp-select-wrap">
        <select
          className="dp-input"
          value={standard ? Number(value) : "custom"}
          onChange={handleSelect}
        >
          {DURATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
        <ChevronDown size={16} className="dp-select-chevron" />
      </div>

      {customOpen && (
        <div className="dp-custom-duration">
          <div className="dp-custom-duration__unit">
            <input
              type="number"
              min="0"
              max="24"
              value={customHours}
              onChange={(event) => setCustomHours(event.target.value)}
            />
            <span>Hours</span>
          </div>

          <span>:</span>

          <div className="dp-custom-duration__unit">
            <input
              type="number"
              min="0"
              max="59"
              value={customMinutes}
              onChange={(event) => setCustomMinutes(event.target.value)}
            />
            <span>Minutes</span>
          </div>

          <button
            type="button"
            className="dp-custom-duration__set"
            onClick={applyCustom}
          >
            Set time
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityForm({ form, setForm, rescheduleOnly = false }) {
  function change(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="dp-drawer-form">
      {!rescheduleOnly && (
        <>
          <label className="dp-field">
            <span>Activity name</span>
            <input
              className="dp-input"
              value={form.title}
              onChange={(event) => change("title", event.target.value)}
              placeholder="e.g. Morning stretching"
            />
          </label>

          <label className="dp-field">
            <span>Category</span>
            <div className="dp-select-wrap">
              <select
                className="dp-input"
                value={form.category}
                onChange={(event) => change("category", event.target.value)}
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="dp-select-chevron" />
            </div>
          </label>
        </>
      )}

      <label className="dp-field">
        <span>Date</span>
        <div className="dp-native-date-wrap">
          <input
            className="dp-input dp-date-input"
            type="date"
            value={form.date}
            onChange={(event) => change("date", event.target.value)}
          />
          <CalendarDays size={18} className="dp-field-icon" />
        </div>
      </label>

      <div className="dp-field">
        <span>Time</span>
        <TimePicker
          value={form.time}
          onChange={(value) => change("time", value)}
        />
      </div>

      {!rescheduleOnly && (
        <>
          <div className="dp-field">
            <span>Duration</span>
            <DurationField
              value={form.durationMinutes}
              onChange={(value) => change("durationMinutes", value)}
            />
          </div>

          <label className="dp-field dp-field--note">
            <span>Note</span>
            <textarea
              className="dp-textarea"
              value={form.note || ""}
              onChange={(event) => change("note", event.target.value)}
              placeholder="Anything you would like to remember about this activity..."
            />
          </label>
        </>
      )}
    </div>
  );
}

function ActivityDrawer({
  open,
  mode,
  initialActivity,
  selectedDate,
  onClose,
  onSaved,
  setToast,
  googleConnected = false,
}) {
  const [form, setForm] = useState(EMPTY_ACTIVITY);
  const [saving, setSaving] = useState(false);

  const title =
    mode === "edit"
      ? "Edit Activity"
      : mode === "reschedule"
      ? "Reschedule Activity"
      : "Add Activity";

  const subtitle =
    mode === "reschedule"
      ? "Choose a new date or time"
      : "Take a moment for yourself today";

  useEffect(() => {
    if (!open) return;

    if (initialActivity) {
      setForm({
        title: initialActivity.title || "",
        category: initialActivity.category || "",
        date: initialActivity.date || selectedDate,
        time: initialActivity.time || "06:00",
        durationMinutes: Number(initialActivity.durationMinutes) || 15,
        note: initialActivity.note || "",
      });
    } else {
      setForm({
        ...EMPTY_ACTIVITY,
        date: selectedDate || getLocalDateKey(),
      });
    }
  }, [open, initialActivity, selectedDate]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    if (mode !== "reschedule" && !form.title.trim()) {
      setToast({
        type: "error",
        title: "Activity name required",
        message: "Enter a name for the activity before saving.",
      });
      return;
    }

    if (mode !== "reschedule" && !form.category) {
      setToast({
        type: "error",
        title: "Category required",
        message: "Choose a category for this activity.",
      });
      return;
    }

    try {
  setSaving(true);

  let savedActivity = null;

  if (mode === "edit") {
    savedActivity = await updateDailyActivity(
      initialActivity.id,
      {
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        time: form.time,
        durationMinutes: Number(
          form.durationMinutes
        ),
        note:
          form.note.trim() || null,
      }
    );
  } else if (mode === "reschedule") {
    savedActivity = await updateDailyActivity(
      initialActivity.id,
      {
        date: form.date,
        time: form.time,
      }
    );
  } else {
    savedActivity = await createDailyActivity({
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      time: form.time,
      durationMinutes: Number(
        form.durationMinutes
      ),
      note:
        form.note.trim() || null,
    });
  }

  // -----------------------------------------
  // GOOGLE CALENDAR AUTO SYNC
  // -----------------------------------------

  let calendarSynced = false;
  let calendarSyncFailed = false;

  if (
    googleConnected &&
    savedActivity?.id
  ) {
    try {
      const syncResult =
        await syncGoogleCalendarActivity(
          savedActivity.id
        );

      calendarSynced =
        Boolean(syncResult?.synced);
    } catch (calendarError) {
      console.error(
        "Google Calendar sync failed:",
        calendarError
      );

      calendarSyncFailed = true;
    }
  }

  setToast({
    type:
      calendarSyncFailed
        ? "warning"
        : "success",

    title:
      mode === "edit"
        ? "Activity updated"
        : mode === "reschedule"
        ? "Activity rescheduled"
        : "Activity added",

    message:
      calendarSyncFailed
        ? "The activity was saved in Anandam, but Google Calendar could not be updated."
        : calendarSynced
        ? "Saved in Anandam and synced to Google Calendar."
        : mode === "add"
        ? "The activity has been added to your day."
        : "Your changes have been saved.",
  });

  await onSaved(form.date);

  onClose();
} catch (error) {
  setToast({
    type: "error",
    title: "Unable to save activity",
    message: friendlyError(
      error,
      "We couldn't save this activity. Please check the details and try again."
    ),
  });
} finally {
      setSaving(false);
    }
  }

  return (
    <div className="dp-drawer-layer">
      <button
        type="button"
        className="dp-drawer-backdrop"
        onClick={saving ? undefined : onClose}
        aria-label="Close drawer"
      />

      <aside className="dp-drawer" role="dialog" aria-modal="true">
        <div className="dp-drawer__header">
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button
            type="button"
            className="dp-icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="dp-drawer__divider" />

        <form className="dp-drawer__body" onSubmit={submit}>
          <ActivityForm
            form={form}
            setForm={setForm}
            rescheduleOnly={mode === "reschedule"}
          />

          <div className="dp-drawer__footer">
            <button
              type="submit"
              className="dp-drawer-submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : mode === "edit"
                ? "Save changes"
                : mode === "reschedule"
                ? "Reschedule activity"
                : "Add to my day"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function ActivityMenu({ activity, onEdit, onReschedule, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;

    function outside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  return (
    <div className="dp-row-menu" ref={ref}>
      <button
        type="button"
        className="dp-row-menu__trigger"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Options for ${activity.title}`}
      >
        <MoreVertical size={18} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="dp-row-menu__panel">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit(activity);
            }}
          >
            <Edit3 size={21} />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onReschedule(activity);
            }}
          >
            <CalendarDays size={21} />
            <span>Reschedule</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onDelete(activity);
            }}
          >
            <Trash2 size={21} />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  activity,
  onToggle,
  onEdit,
  onReschedule,
  onDelete,
}) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;

    try {
      setBusy(true);
      await onToggle(activity, !activity.isCompleted);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`dp-activity-row ${activity.isCompleted ? "is-complete" : ""}`}>
      <div className="dp-activity-row__inner">
        <div className="dp-activity-row__left">
          <button
            type="button"
            className={`dp-activity-check ${activity.isCompleted ? "is-checked" : ""}`}
            onClick={toggle}
            disabled={busy}
          >
            {activity.isCompleted && <Check size={13} strokeWidth={2.5} />}
          </button>

          <span className="dp-activity-time">{formatTimeLabel(activity.time)}</span>

          <div className="dp-activity-copy">
            <strong>{activity.title}</strong>

            <div className="dp-activity-meta">
              <span>
                <i className={getCategoryDotClass(activity.category)} />
                {activity.category}
              </span>

              <span>
                <Clock3 size={14} />
                {durationLabel(activity.durationMinutes)}
              </span>
            </div>
          </div>
        </div>

        <ActivityMenu
          activity={activity}
          onEdit={onEdit}
          onReschedule={onReschedule}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}

function SummaryCards({ summary }) {
  const cards = [
    {
      key: "total",
      label: "Total Activities",
      value: summary.totalActivities,
      icon: ClipboardList,
    },
    {
      key: "completed",
      label: "Completed",
      value: summary.completed,
      icon: CheckCircle2,
    },
    {
      key: "remaining",
      label: "Remaining",
      value: summary.remaining,
      icon: Layers3,
    },
    {
      key: "streak",
      label: "Habit streak",
      value: summary.habitStreak,
      icon: Flame,
    },
  ];

  return (
    <div className="dp-summary-grid">
      {cards.map(({ key, label, value, icon: Icon }) => (
        <article key={key} className={`dp-summary-card dp-summary-card--${key}`}>
          <div className="dp-summary-card__top">
            <span className="dp-summary-card__icon">
              <Icon size={21} strokeWidth={1.6} />
            </span>
            <span className="dp-summary-card__label">{label}</span>
          </div>
          <strong className="dp-summary-card__value">{value ?? 0}</strong>
        </article>
      ))}
    </div>
  );
}

function EmptySchedule() {
  return (
    <div className="dp-empty-schedule">
      <div className="dp-empty-illustration dp-empty-illustration--activities">
        <img
          src={emptyActivitiesIllustration}
          alt=""
          aria-hidden="true"
          draggable="false"
          className="dp-empty-illustration__image dp-empty-illustration__image--activities"
        />
      </div>

      <div className="dp-empty-copy">
        <h3>No activities planned yet</h3>
        <p>Add your first activity or use a template to plan your day.</p>
      </div>
    </div>
  );
}

function TemplateActivityEditor({ activity, index, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="dp-template-preview-row">
        <div className="dp-template-preview-row__time">
          {formatTimeLabel(activity.time)}
        </div>

        <div className="dp-template-preview-row__copy">
          <strong>{activity.title}</strong>
          <span>
            {activity.category} · {durationLabel(activity.durationMinutes)}
          </span>
        </div>

        <div className="dp-template-preview-row__actions">
          <button type="button" onClick={() => setEditing(true)} title="Edit activity">
            <Pencil size={15} />
          </button>
          <button type="button" onClick={() => onDelete(index)} title="Remove activity">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dp-template-inline-edit">
      <input
        className="dp-input"
        value={activity.title}
        onChange={(event) =>
          onChange(index, {
            ...activity,
            title: event.target.value,
          })
        }
      />

      <div className="dp-template-inline-edit__row">
        <TimePicker
          value={activity.time}
          onChange={(value) => onChange(index, { ...activity, time: value })}
        />

        <div className="dp-select-wrap">
          <select
            className="dp-input"
            value={activity.category}
            onChange={(event) =>
              onChange(index, {
                ...activity,
                category: event.target.value,
              })
            }
          >
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="dp-select-chevron" />
        </div>
      </div>

      <div className="dp-template-inline-edit__row">
        <DurationField
          value={activity.durationMinutes}
          onChange={(value) =>
            onChange(index, {
              ...activity,
              durationMinutes: value,
            })
          }
        />
        <button type="button" className="dp-inline-save" onClick={() => setEditing(false)}>
          Done
        </button>
      </div>
    </div>
  );
}

function UseTemplateDrawer({
  open,
  selectedDate,
  initialTemplateId,
  onClose,
  onApplied,
  setToast,
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [targetDate, setTargetDate] = useState(selectedDate);
  const [draftActivities, setDraftActivities] = useState([]);
  const [applying, setApplying] = useState(false);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        const data = await getDailyTemplates();
        if (!mounted) return;

        setTemplates(data);

        if (initialTemplateId) {
          const initial = data.find(
            (template) => String(template.id) === String(initialTemplateId)
          );
          if (initial) chooseTemplate(initial, false);
        }
      } catch (error) {
        if (!mounted) return;

        setToast({
          type: "error",
          title: "Unable to load templates",
          message: friendlyError(
            error,
            "We couldn't load the available templates. Please try again."
          ),
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setTargetDate(selectedDate);
    setSelectedId("");
    setDraftActivities([]);
    setConflict(null);
    load();

    return () => {
      mounted = false;
    };
  }, [open, selectedDate, initialTemplateId]);

  function chooseTemplate(template, clearConflict = true) {
    setSelectedId(String(template.id));
    setDraftActivities(
      (template.activities || []).map((activity, index) => ({
        id: activity.id || `draft-${index}`,
        title: activity.title || "",
        category: activity.category || "Wellbeing",
        time: activity.time || "06:00",
        durationMinutes: Number(activity.durationMinutes) || 15,
        note: activity.note || "",
        order: Number.isInteger(Number(activity.order))
          ? Number(activity.order)
          : index,
      }))
    );
    if (clearConflict) setConflict(null);
  }

  function updateDraft(index, next) {
    setDraftActivities((current) =>
      current.map((activity, itemIndex) =>
        itemIndex === index ? next : activity
      )
    );
  }

  function removeDraft(index) {
    setDraftActivities((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  const selectedTemplate = templates.find(
    (template) => String(template.id) === String(selectedId)
  );

  async function apply(mode) {
    if (!selectedTemplate) {
      setToast({
        type: "error",
        title: "Choose a template",
        message: "Select a template before applying it to your day.",
      });
      return;
    }

    if (draftActivities.length === 0) {
      setToast({
        type: "error",
        title: "Template is empty",
        message: "This template has no activities to apply.",
      });
      return;
    }

    try {
      setApplying(true);

      const result = await applyDailyTemplate({
        templateId: selectedTemplate.id,
        templateType: selectedTemplate.templateType || "SYSTEM",
        targetDate,
        mode,
        activities: draftActivities.map(toTemplatePayloadActivity),
      });

      setConflict(null);
      setToast({
        type: "success",
        title: "Template applied",
        message:
          mode === "REPLACE"
            ? "The current schedule was replaced with this template."
            : "The template activities were added to your schedule.",
      });

      await onApplied(targetDate, result);
      onClose();
    } catch (error) {
      if (
        Number(error?.status) === 409 &&
        error?.data?.code === "SCHEDULE_ALREADY_EXISTS"
      ) {
        setConflict(error.data);
        return;
      }

      setToast({
        type: "error",
        title: "Unable to apply template",
        message: friendlyError(
          error,
          "We couldn't apply this template. Please try again."
        ),
      });
    } finally {
      setApplying(false);
    }
  }

  if (!open) return null;

  return (
    <div className="dp-drawer-layer">
      <button
        type="button"
        className="dp-drawer-backdrop"
        onClick={applying ? undefined : onClose}
        aria-label="Close drawer"
      />

      <aside className="dp-drawer dp-drawer--template" role="dialog" aria-modal="true">
        <div className="dp-drawer__header">
          <div>
            <h2>Use a Template</h2>
            <p>Choose a routine and tailor it before adding it to your day</p>
          </div>

          <button
            type="button"
            className="dp-icon-button"
            onClick={onClose}
            disabled={applying}
          >
            <X size={20} />
          </button>
        </div>

        <div className="dp-drawer__divider" />

        <div className="dp-template-drawer-body">
          <label className="dp-field">
            <span>Date</span>
            <input
              type="date"
              className="dp-input"
              value={targetDate}
              onChange={(event) => setTargetDate(event.target.value)}
            />
          </label>

          <div className="dp-template-section">
            <h3>Available templates</h3>

            {loading ? (
              <div className="dp-inline-loading">Loading templates...</div>
            ) : (
              <div className="dp-template-choice-list">
                {templates.map((template) => (
                  <button
                    type="button"
                    key={`${template.templateType}-${template.id}`}
                    className={`dp-template-choice ${
                      String(selectedId) === String(template.id)
                        ? "is-selected"
                        : ""
                    }`}
                    onClick={() => chooseTemplate(template)}
                  >
                    <div>
                      <strong>{template.name || template.title}</strong>
                      <span>
                        {template.activityCount ?? template.activities?.length ?? 0}{" "}
                        activities
                      </span>
                    </div>

                    <span className="dp-template-type">
                      {template.templateType === "USER" ? "My template" : "Built-in"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedTemplate && (
            <div className="dp-template-section">
              <div className="dp-template-section__heading">
                <div>
                  <h3>Preview activities</h3>
                  <p>
                    Changes here affect this one application only. Your saved
                    template stays unchanged.
                  </p>
                </div>
                <span>{draftActivities.length}</span>
              </div>

              <div className="dp-template-preview-list">
                {draftActivities.map((activity, index) => (
                  <TemplateActivityEditor
                    key={activity.id || index}
                    activity={activity}
                    index={index}
                    onChange={updateDraft}
                    onDelete={removeDraft}
                  />
                ))}
              </div>
            </div>
          )}

          {conflict && (
            <div className="dp-template-conflict">
              <strong>This day already has activities</strong>
              <p>
                Choose whether to keep the existing activities and add this
                template, or replace the current schedule.
              </p>

              <div className="dp-template-conflict__actions">
                <button
                  type="button"
                  className="dp-btn dp-btn--secondary"
                  onClick={() => apply("ADD")}
                  disabled={applying}
                >
                  Add to schedule
                </button>

                <button
                  type="button"
                  className="dp-btn dp-btn--primary"
                  onClick={() => apply("REPLACE")}
                  disabled={applying}
                >
                  Replace schedule
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="dp-template-drawer-footer">
          <button
            type="button"
            className="dp-drawer-submit"
            onClick={() => apply(undefined)}
            disabled={applying || !selectedTemplate}
          >
            {applying ? "Applying..." : "Apply template"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function TemplateBuilderDrawer({
  open,
  mode = "create",
  template,
  onClose,
  onSaved,
  setToast,
}) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [activities, setActivities] = useState([]);
  const [draftActivity, setDraftActivity] = useState(EMPTY_TEMPLATE_ACTIVITY);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setStep(mode === "edit" ? 2 : 1);
    setName(template?.name || template?.title || "");
    setCategory(template?.category || "");
    setActivities(
      (template?.activities || []).map((activity, index) => ({
        id: activity.id,
        title: activity.title || "",
        category: activity.category || "Wellbeing",
        time: activity.time || "06:00",
        durationMinutes: Number(activity.durationMinutes) || 15,
        note: activity.note || "",
        order: Number.isInteger(Number(activity.order))
          ? Number(activity.order)
          : index,
      }))
    );
    setDraftActivity({ ...EMPTY_TEMPLATE_ACTIVITY });
    setEditingIndex(null);
  }, [open, mode, template]);

  if (!open) return null;

  function saveDraftActivity() {
    if (!draftActivity.title.trim()) {
      setToast({
        type: "error",
        title: "Activity name required",
        message: "Enter a name before adding this activity to the template.",
      });
      return;
    }

    if (!draftActivity.category) {
      setToast({
        type: "error",
        title: "Category required",
        message: "Choose a category for the template activity.",
      });
      return;
    }

    if (editingIndex !== null) {
      setActivities((current) =>
        current.map((activity, index) =>
          index === editingIndex
            ? { ...draftActivity, order: index }
            : activity
        )
      );
    } else {
      setActivities((current) => [
        ...current,
        { ...draftActivity, order: current.length },
      ]);
    }

    setDraftActivity({ ...EMPTY_TEMPLATE_ACTIVITY });
    setEditingIndex(null);
  }

  function editActivity(index) {
    setDraftActivity({ ...activities[index] });
    setEditingIndex(index);
  }

  function deleteActivity(index) {
    setActivities((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((activity, itemIndex) => ({
          ...activity,
          order: itemIndex,
        }))
    );
  }

  async function saveTemplate() {
    if (!name.trim()) {
      setStep(1);
      setToast({
        type: "error",
        title: "Template name required",
        message: "Give this template a name before saving it.",
      });
      return;
    }

    if (activities.length === 0) {
      setToast({
        type: "error",
        title: "Add at least one activity",
        message: "Create one or more activities for this template before saving it.",
      });
      return;
    }

    const payload = {
      name: name.trim(),
      category: category || null,
      activities: activities.map(toTemplatePayloadActivity),
    };

    try {
      setSaving(true);

      if (mode === "edit" && template?.id) {
        await updateMyDayTemplate(template.id, payload);
      } else {
        await createMyDayTemplate(payload);
      }

      setToast({
        type: "success",
        title: mode === "edit" ? "Template updated" : "Template created",
        message: "Your template is ready to use.",
      });

      await onSaved();
      onClose();
    } catch (error) {
      setToast({
        type: "error",
        title: "Unable to save template",
        message: friendlyError(
          error,
          "We couldn't save this template. Please try again."
        ),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dp-drawer-layer">
      <button
        type="button"
        className="dp-drawer-backdrop"
        onClick={saving ? undefined : onClose}
        aria-label="Close drawer"
      />

      <aside className="dp-drawer" role="dialog" aria-modal="true">
        <div className="dp-drawer__header">
          <div>
            <h2>{mode === "edit" ? "Edit Template" : "Create Template"}</h2>
            <p>Save a routine you can reuse any day</p>
          </div>

          <button
            type="button"
            className="dp-icon-button"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <div className="dp-drawer__divider" />

        <div className="dp-template-builder">
          <div className="dp-template-steps">
            <span className={step >= 1 ? "is-active" : ""}>1</span>
            <i />
            <span className={step >= 2 ? "is-active" : ""}>2</span>
          </div>

          {step === 1 ? (
            <div className="dp-template-builder__step">
              <label className="dp-field">
                <span>Template name</span>
                <input
                  className="dp-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Port Day Routine"
                />
              </label>

              <label className="dp-field">
                <span>Category</span>
                <div className="dp-select-wrap">
                  <select
                    className="dp-input"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="">Select category</option>
                    {CATEGORY_OPTIONS.map((categoryName) => (
                      <option key={categoryName} value={categoryName}>
                        {categoryName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="dp-select-chevron" />
                </div>
              </label>

              <button
                type="button"
                className="dp-drawer-submit"
                onClick={() => {
                  if (!name.trim()) {
                    setToast({
                      type: "error",
                      title: "Template name required",
                      message: "Enter a name before continuing.",
                    });
                    return;
                  }
                  setStep(2);
                }}
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="dp-template-builder__step">
              <div className="dp-template-builder__heading">
                <div>
                  <h3>Activities</h3>
                  <p>Add the activities that make up this routine.</p>
                </div>

                {mode !== "edit" && (
                  <button
                    type="button"
                    className="dp-link-button"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </button>
                )}
              </div>

              <div className="dp-template-activity-form">
                <label className="dp-field">
                  <span>Activity name</span>
                  <input
                    className="dp-input"
                    value={draftActivity.title}
                    onChange={(event) =>
                      setDraftActivity((current) => ({
                        ...current,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Morning stretching"
                  />
                </label>

                <div className="dp-template-activity-form__two">
                  <label className="dp-field">
                    <span>Category</span>
                    <div className="dp-select-wrap">
                      <select
                        className="dp-input"
                        value={draftActivity.category}
                        onChange={(event) =>
                          setDraftActivity((current) => ({
                            ...current,
                            category: event.target.value,
                          }))
                        }
                      >
                        <option value="">Select</option>
                        {CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={15} className="dp-select-chevron" />
                    </div>
                  </label>

                  <div className="dp-field">
                    <span>Time</span>
                    <TimePicker
                      value={draftActivity.time}
                      onChange={(value) =>
                        setDraftActivity((current) => ({
                          ...current,
                          time: value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="dp-field">
                  <span>Duration</span>
                  <DurationField
                    value={draftActivity.durationMinutes}
                    onChange={(value) =>
                      setDraftActivity((current) => ({
                        ...current,
                        durationMinutes: value,
                      }))
                    }
                  />
                </div>

                <label className="dp-field">
                  <span>Note</span>
                  <textarea
                    className="dp-textarea"
                    value={draftActivity.note}
                    onChange={(event) =>
                      setDraftActivity((current) => ({
                        ...current,
                        note: event.target.value,
                      }))
                    }
                    placeholder="Optional note"
                  />
                </label>

                <button
                  type="button"
                  className="dp-btn dp-btn--secondary dp-template-add-activity"
                  onClick={saveDraftActivity}
                >
                  {editingIndex !== null ? "Update activity" : "Add activity"}
                  <Plus size={17} />
                </button>
              </div>

              <div className="dp-template-builder-list">
                {activities.length === 0 ? (
                  <div className="dp-template-builder-list__empty">
                    No activities added yet.
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div
                      className="dp-template-builder-row"
                      key={`${activity.id || "new"}-${index}`}
                    >
                      <div>
                        <strong>{activity.title}</strong>
                        <span>
                          {formatTimeLabel(activity.time)} · {activity.category} ·{" "}
                          {durationLabel(activity.durationMinutes)}
                        </span>
                      </div>

                      <div className="dp-template-builder-row__actions">
                        <button type="button" title="Preview Template">
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          title="Edit Template"
                          onClick={() => editActivity(index)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          title="Delete Template"
                          onClick={() => deleteActivity(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button
                type="button"
                className="dp-drawer-submit"
                onClick={saveTemplate}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : mode === "edit"
                  ? "Save template"
                  : "Create template"}
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function MyTemplatesTab({
  templates,
  loading,
  onCreate,
  onEdit,
  onDelete,
  onUse,
}) {
  return (
    <section className="dp-template-page-card">
      <div className="dp-template-page-card__header">
        <div>
          <h2>My Templates</h2>
          <p>Create and manage reusable routines for your day.</p>
        </div>

        <button type="button" className="dp-btn dp-btn--primary" onClick={onCreate}>
          Create Template
          <Plus size={18} />
        </button>
      </div>

      {loading ? (
        <div className="dp-inline-loading dp-inline-loading--large">
          Loading your templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="dp-my-templates-empty">
          <div className="dp-empty-illustration dp-empty-illustration--templates">
            <img
              src={emptyTemplatesIllustration}
              alt=""
              aria-hidden="true"
              draggable="false"
              className="dp-empty-illustration__image dp-empty-illustration__image--templates"
            />
          </div>

          <h3>No templates yet</h3>
          <p>Create a reusable plan with your preferred activities, times, and routines.</p>
        </div>
      ) : (
        <div className="dp-my-template-grid">
          {templates.map((template) => (
            <article className="dp-my-template-card" key={template.id}>
              <div className="dp-my-template-card__top">
                <div>
                  <span className="dp-my-template-card__category">
                    {template.category || "Custom"}
                  </span>
                  <h3>{template.name || template.title}</h3>
                </div>

                <span className="dp-my-template-card__count">
                  {template.activityCount ?? template.activities?.length ?? 0}{" "}
                  activities
                </span>
              </div>

              <div className="dp-my-template-card__preview">
                {(template.activities || []).slice(0, 4).map((activity, index) => (
                  <div key={activity.id || index}>
                    <span>{formatTimeLabel(activity.time)}</span>
                    <strong>{activity.title}</strong>
                  </div>
                ))}

                {(template.activities || []).length > 4 && (
                  <p>+{(template.activities || []).length - 4} more activities</p>
                )}
              </div>

              <div className="dp-my-template-card__actions">
                <button
                  type="button"
                  className="dp-template-use"
                  onClick={() => onUse(template)}
                >
                  Use Template
                </button>
                <button type="button" title="Preview Template" onClick={() => onUse(template)}>
                  <Eye size={17} />
                </button>
                <button type="button" title="Edit Template" onClick={() => onEdit(template)}>
                  <Pencil size={17} />
                </button>
                <button
                  type="button"
                  title="Delete Template"
                  onClick={() => onDelete(template)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PerfectDaySchedulePage() {
  const [activeTab, setActiveTab] = useState("my-day");
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey());
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [activityDrawer, setActivityDrawer] = useState(null);
  const [templateDrawer, setTemplateDrawer] = useState(null);
  const [builderDrawer, setBuilderDrawer] = useState(null);
  const [deleteActivityTarget, setDeleteActivityTarget] = useState(null);
  const [deleteTemplateTarget, setDeleteTemplateTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [googleCalendar, setGoogleCalendar] =
  useState({
    loading: true,
    connected: false,
    connection: null,
  });

const [
  googleCalendarBusy,
  setGoogleCalendarBusy,
] = useState(false);

  const googlePopupRef = useRef(null);
  const googlePollTimerRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function stopGoogleCalendarPolling() {
    if (googlePollTimerRef.current) {
      window.clearInterval(googlePollTimerRef.current);
      googlePollTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      stopGoogleCalendarPolling();

      try {
        if (
          googlePopupRef.current &&
          !googlePopupRef.current.closed
        ) {
          googlePopupRef.current.close();
        }
      } catch {
        // Ignore popup cleanup errors.
      }
    };
  }, []);

  async function loadGoogleCalendarStatus(
  options = {}
) {
  const {
    quiet = false,
  } = options;

  try {
    if (!quiet) {
      setGoogleCalendar(
        (current) => ({
          ...current,
          loading: true,
        })
      );
    }

    const data =
      await getGoogleCalendarStatus();

    setGoogleCalendar({
      loading: false,
      connected:
        Boolean(data?.connected),
      connection:
        data?.connection || null,
    });

    return data;
  } catch (error) {
    console.error(
      "Google Calendar status check failed:",
      error
    );

    setGoogleCalendar(
      (current) => ({
        ...current,
        loading: false,
      })
    );

    return null;
  }
}

async function handleGoogleCalendarConnect() {
  if (
    googleCalendarBusy ||
    googleCalendar.connected
  ) {
    return;
  }

  let popup = null;

  try {
    setGoogleCalendarBusy(true);

    /*
      Open a blank popup immediately from the click event so
      browsers do not block it while we wait for the API.
    */
    popup = window.open(
      "",
      "anandam-google-calendar",
      "popup=yes,width=620,height=760,left=200,top=80"
    );

    googlePopupRef.current = popup;

    const data =
      await getGoogleCalendarConnectUrl(
        getBrowserTimeZone()
      );

    if (!data?.authUrl) {
      throw new Error(
        "Google authorization URL was not returned."
      );
    }

    /*
      If popups are blocked, fall back to the normal
      same-tab Google authorization flow.
    */
    if (!popup) {
      window.location.assign(data.authUrl);
      return;
    }

    popup.location.href = data.authUrl;
    popup.focus();

    stopGoogleCalendarPolling();

    /*
      The backend callback may redirect the popup to the
      frontend home page. That is okay.

      The main Day Planner tab stays open and checks
      /google-calendar/status until the backend reports
      connected:true.
    */
    googlePollTimerRef.current =
      window.setInterval(async () => {
        try {
          if (popup.closed) {
            stopGoogleCalendarPolling();
            setGoogleCalendarBusy(false);

            await loadGoogleCalendarStatus({
              quiet: true,
            });

            return;
          }

          const status =
            await getGoogleCalendarStatus();

          if (status?.connected) {
            setGoogleCalendar({
              loading: false,
              connected: true,
              connection:
                status?.connection || null,
            });

            stopGoogleCalendarPolling();
            setGoogleCalendarBusy(false);

            try {
              popup.close();
            } catch {
              // Ignore popup close errors.
            }

            setToast({
              type: "success",
              title:
                "Google Calendar connected",
              message:
                status?.connection?.googleEmail
                  ? `Connected to ${status.connection.googleEmail}. New Day Planner activities will sync to Google Calendar.`
                  : "Google Calendar is connected. New Day Planner activities will sync automatically.",
            });
          }
        } catch (pollError) {
          /*
            Do not fail the whole connect flow because one
            polling request temporarily failed.
          */
          console.warn(
            "Google Calendar connection check failed:",
            pollError
          );
        }
      }, 1500);

  } catch (error) {
    stopGoogleCalendarPolling();
    setGoogleCalendarBusy(false);

    try {
      if (popup && !popup.closed) {
        popup.close();
      }
    } catch {
      // Ignore popup close errors.
    }

    setToast({
      type: "error",
      title:
        "Unable to connect Google Calendar",
      message: friendlyError(
        error,
        "We couldn't start the Google Calendar connection. Please try again."
      ),
    });
  }
}

async function handleGoogleCalendarDisconnect() {
  if (
    googleCalendarBusy ||
    !googleCalendar.connected
  ) {
    return;
  }

  try {
    setGoogleCalendarBusy(true);
    stopGoogleCalendarPolling();

    await disconnectGoogleCalendar();

    setGoogleCalendar({
      loading: false,
      connected: false,
      connection: null,
    });

    setToast({
      type: "success",
      title:
        "Google Calendar disconnected",
      message:
        "New Day Planner activities will no longer sync to Google Calendar.",
    });
  } catch (error) {
    setToast({
      type: "error",
      title:
        "Unable to disconnect Google Calendar",
      message: friendlyError(
        error,
        "We couldn't disconnect Google Calendar. Please try again."
      ),
    });
  } finally {
    setGoogleCalendarBusy(false);
  }
}

  async function loadDay(date = selectedDate, options = {}) {
    const { quiet = false } = options;

    try {
      if (!quiet) setLoading(true);

      const data = await getDailyPlan(date);
      setDay(data);
      setSelectedDate(data?.date || date);
      return data;
    } catch (error) {
      setToast({
        type: "error",
        title: "Unable to load day planner",
        message: friendlyError(
          error,
          "We couldn't load your day plan. Please refresh and try again."
        ),
      });
      throw error;
    } finally {
      if (!quiet) setLoading(false);
    }
  }

  async function loadMyTemplates() {
    try {
      setTemplatesLoading(true);
      const data = await getMyDayTemplates();
      setTemplates(data);
    } catch (error) {
      setToast({
        type: "error",
        title: "Unable to load templates",
        message: friendlyError(
          error,
          "We couldn't load your templates. Please try again."
        ),
      });
    } finally {
      setTemplatesLoading(false);
    }
  }

  useEffect(() => {
    loadDay(
      getLocalDateKey()
    ).catch(() => {});

    /*
      If this Anandam account was already connected in
      Postman or during an earlier browser session, this
      immediately changes the button to "Calendar Connected".
    */
    loadGoogleCalendarStatus();
  }, []);

  useEffect(() => {
    function refreshGoogleStatusOnFocus() {
      loadGoogleCalendarStatus({
        quiet: true,
      });
    }

    window.addEventListener(
      "focus",
      refreshGoogleStatusOnFocus
    );

    return () =>
      window.removeEventListener(
        "focus",
        refreshGoogleStatusOnFocus
      );
  }, []);

  useEffect(() => {
    if (activeTab === "my-templates") {
      loadMyTemplates();
    }
  }, [activeTab]);

  const summary = day?.summary || {
    totalActivities: 0,
    completed: 0,
    remaining: 0,
    completionRate: 0,
    habitStreak: 0,
  };

  const activities = Array.isArray(day?.activities) ? day.activities : [];

  async function handleToggle(activity, nextCompleted) {
    const previous = day;

    setDay((current) => {
      if (!current) return current;

      const nextActivities = current.activities.map((item) =>
        item.id === activity.id
          ? { ...item, isCompleted: nextCompleted }
          : item
      );

      const completed = nextActivities.filter((item) => item.isCompleted).length;
      const total = nextActivities.length;

      return {
        ...current,
        activities: nextActivities,
        summary: {
          ...current.summary,
          totalActivities: total,
          completed,
          remaining: total - completed,
          completionRate:
            total === 0 ? 0 : Math.round((completed / total) * 100),
        },
      };
    });

    try {
      await toggleDailyActivityStatus(activity.id, nextCompleted);
      await loadDay(selectedDate, { quiet: true });
    } catch (error) {
      setDay(previous);
      setToast({
        type: "error",
        title: "Unable to update activity",
        message: friendlyError(
          error,
          "We couldn't update this activity. Please try again."
        ),
      });
    }
  }

  async function confirmDeleteActivity() {
    if (!deleteActivityTarget || deleting) return;

    try {
      setDeleting(true);
      await deleteDailyActivity(deleteActivityTarget.id);
      setDeleteActivityTarget(null);
      setToast({
        type: "success",
        title: "Activity deleted",
        message: "The activity was removed from your schedule.",
      });
      await loadDay(selectedDate, { quiet: true });
    } catch (error) {
      setToast({
        type: "error",
        title: "Unable to delete activity",
        message: friendlyError(
          error,
          "We couldn't delete this activity. Please try again."
        ),
      });
    } finally {
      setDeleting(false);
    }
  }

  async function confirmDeleteTemplate() {
    if (!deleteTemplateTarget || deleting) return;

    try {
      setDeleting(true);
      await deleteMyDayTemplate(deleteTemplateTarget.id);
      setDeleteTemplateTarget(null);
      setToast({
        type: "success",
        title: "Template deleted",
        message: "The template was removed.",
      });
      await loadMyTemplates();
    } catch (error) {
      setToast({
        type: "error",
        title: "Unable to delete template",
        message: friendlyError(
          error,
          "We couldn't delete this template. Please try again."
        ),
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppLayout>
      <div className="day-planner-page">
        <PlannerToast toast={toast} onClose={() => setToast(null)} />

        <header className="dp-page-heading">
          <h1>Day Planner</h1>
          <p>Plan and manage your activities, routines and progress</p>
        </header>

        <div className="dp-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "my-day"}
            className={activeTab === "my-day" ? "is-active" : ""}
            onClick={() => setActiveTab("my-day")}
          >
            My Day
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "my-templates"}
            className={activeTab === "my-templates" ? "is-active" : ""}
            onClick={() => setActiveTab("my-templates")}
          >
            My Templates
          </button>
        </div>

        {activeTab === "my-day" ? (
          <div className="dp-my-day">
            {loading ? (
              <div className="dp-page-loading">Loading your day...</div>
            ) : (
              <>
                <SummaryCards summary={summary} />

                <section className="dp-schedule-card">
                  <div className="dp-schedule-card__header">
                    <div>
                      <h2>Today’s Schedule</h2>
                      <p>Everything you have planned for today.</p>
                    </div>

                  <div className="dp-schedule-actions">
  {/* ADD ACTIVITY */}
  <button
    type="button"
    className="dp-btn dp-btn--primary"
    onClick={() =>
      setActivityDrawer({
        mode: "add",
        activity: null,
      })
    }
  >
    Add Activity

    <Plus size={18} />
  </button>

  {/* GOOGLE CALENDAR */}
  <button
    type="button"
    className={`dp-btn dp-google-calendar-btn ${
      googleCalendar.connected
        ? "is-connected"
        : ""
    }`}
    onClick={
      googleCalendar.connected
        ? handleGoogleCalendarDisconnect
        : handleGoogleCalendarConnect
    }
    disabled={
      googleCalendar.loading ||
      googleCalendarBusy
    }
    title={
      googleCalendar.connected
        ? `Connected to ${
            googleCalendar
              .connection
              ?.googleEmail ||
            "Google Calendar"
          }. Click to disconnect.`
        : "Connect your Google Calendar"
    }
  >
    <GoogleCalendarMark />

    <span>
      {googleCalendar.loading
        ? "Checking Calendar..."
        : googleCalendarBusy
        ? googleCalendar.connected
          ? "Disconnecting..."
          : "Connecting..."
        : googleCalendar.connected
        ? "Calendar Connected"
        : "Connect Google Calendar"}
    </span>

    {googleCalendar.connected && (
      <Check
        size={15}
        strokeWidth={2.2}
      />
    )}
  </button>

  {/* TEMPLATE */}
  <button
    type="button"
    className="dp-btn dp-btn--secondary"
    onClick={() =>
      setTemplateDrawer({
        templateId: null,
      })
    }
  >
    Use a Template
  </button>
</div>
                  </div>

                  {activities.length === 0 ? (
                    <EmptySchedule
                      onAdd={() =>
                        setActivityDrawer({ mode: "add", activity: null })
                      }
                      onTemplate={() =>
                        setTemplateDrawer({ templateId: null })
                      }
                    />
                  ) : (
                    <div className="dp-schedule-list">
                      {activities.map((activity) => (
                        <ActivityRow
                          key={activity.id}
                          activity={activity}
                          onToggle={handleToggle}
                          onEdit={(item) =>
                            setActivityDrawer({ mode: "edit", activity: item })
                          }
                          onReschedule={(item) =>
                            setActivityDrawer({
                              mode: "reschedule",
                              activity: item,
                            })
                          }
                          onDelete={setDeleteActivityTarget}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        ) : (
          <MyTemplatesTab
            templates={templates}
            loading={templatesLoading}
            onCreate={() =>
              setBuilderDrawer({ mode: "create", template: null })
            }
            onEdit={(template) =>
              setBuilderDrawer({ mode: "edit", template })
            }
            onDelete={setDeleteTemplateTarget}
            onUse={(template) =>
              setTemplateDrawer({ templateId: template.id })
            }
          />
        )}

        <ActivityDrawer
  open={Boolean(activityDrawer)}
  mode={
    activityDrawer?.mode ||
    "add"
  }
  initialActivity={
    activityDrawer?.activity ||
    null
  }
  selectedDate={
    selectedDate
  }
  onClose={() =>
    setActivityDrawer(null)
  }
  onSaved={async (date) => {
    await loadDay(date, {
      quiet: true,
    });
  }}
  setToast={setToast}
  googleConnected={
    googleCalendar.connected
  }
/>

        <UseTemplateDrawer
          open={Boolean(templateDrawer)}
          selectedDate={selectedDate}
          initialTemplateId={templateDrawer?.templateId || null}
          onClose={() => setTemplateDrawer(null)}
          onApplied={async (targetDate) => {
            setActiveTab("my-day");
            await loadDay(targetDate, { quiet: true });
          }}
          setToast={setToast}
        />

        <TemplateBuilderDrawer
          open={Boolean(builderDrawer)}
          mode={builderDrawer?.mode || "create"}
          template={builderDrawer?.template || null}
          onClose={() => setBuilderDrawer(null)}
          onSaved={loadMyTemplates}
          setToast={setToast}
        />

        <ConfirmDialog
          open={Boolean(deleteActivityTarget)}
          title="Delete activity?"
          message={
            deleteActivityTarget
              ? `Are you sure you want to delete “${deleteActivityTarget.title}”?`
              : ""
          }
          onCancel={() => setDeleteActivityTarget(null)}
          onConfirm={confirmDeleteActivity}
          busy={deleting}
        />

        <ConfirmDialog
          open={Boolean(deleteTemplateTarget)}
          title="Delete template?"
          message={
            deleteTemplateTarget
              ? `Are you sure you want to delete “${
                  deleteTemplateTarget.name || deleteTemplateTarget.title
                }”?`
              : ""
          }
          onCancel={() => setDeleteTemplateTarget(null)}
          onConfirm={confirmDeleteTemplate}
          busy={deleting}
        />
      </div>
    </AppLayout>
  );
}

export default PerfectDaySchedulePage;
