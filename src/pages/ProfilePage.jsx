import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import AppLayout from "../components/layout/AppLayout";

import {
  getProfile,
  updateProfile,
} from "../api/profileApi";

import { saveAuthSession } from "../utils/storage";

import backgroundWave from "../assets/landing/about-wave.png";

import arrowDownIcon from "../assets/profile/arrow down vector.png";
import dateRangeIcon from "../assets/profile/date_range.png";
import editIcon from "../assets/profile/edit.png";

import avatar1 from "../assets/profile/avatar 1.png";
import avatar2 from "../assets/profile/avatar 2.png";
import avatar3 from "../assets/profile/avatar 3.png";
import avatar4 from "../assets/profile/avatar 4.png";
import avatar5 from "../assets/profile/avatar 5.png";
import avatar6 from "../assets/profile/avatar 6.png";
import avatar7 from "../assets/profile/avatar 7.png";
import avatar8 from "../assets/profile/avatar 8.png";

import "../styles/profile.css";

/* =========================================================
   AVATARS
   These IDs are what we save to backend avatarId.
   ========================================================= */

const AVATARS = [
  { id: "1", src: avatar1 },
  { id: "2", src: avatar2 },
  { id: "3", src: avatar3 },
  { id: "4", src: avatar4 },
  { id: "5", src: avatar5 },
  { id: "6", src: avatar6 },
  { id: "7", src: avatar7 },
  { id: "8", src: avatar8 },
];

const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Partner",
  "Friend",
  "Relative",
];

const COUNTRY_OPTIONS = [
  "India",
  "United Kingdom",
  "United States",
  "United Arab Emirates",
  "Singapore",
  "Philippines",
  "Indonesia",
  "Malaysia",
  "Sri Lanka",
  "Bangladesh",
  "Australia",
  "New Zealand",
  "Canada",
  "Germany",
  "Netherlands",
  "Norway",
  "Greece",
  "Spain",
  "Italy",
  "France",
];

const WEEKDAYS = [
  "Mo",
  "Tu",
  "We",
  "Th",
  "Fr",
  "Sa",
  "Su",
];

/* =========================================================
   HELPERS
   ========================================================= */

function getInitials(fullName = "") {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0).toUpperCase()
      )
      .join("") || "U"
  );
}

function getAvatarById(avatarId) {
  return (
    AVATARS.find(
      (avatar) =>
        String(avatar.id) ===
        String(avatarId)
    )?.src || null
  );
}

function toDateInputValue(value) {
  if (!value) return "";

  return String(value).slice(0, 10);
}

function formatDate(value) {
  if (!value) return "-";

  const normalized =
    toDateInputValue(value);

  const [year, month, day] =
    normalized.split("-").map(Number);

  if (!year || !month || !day) {
    return normalized;
  }

  const date = new Date(
    year,
    month - 1,
    day
  );

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function localIsoDate(
  year,
  month,
  day
) {
  return `${year}-${String(
    month + 1
  ).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

function buildForm(profile) {
  return {
    fullName:
      profile?.fullName || "",

    email:
      profile?.email || "",

    contactNumber:
      profile?.contactNumber || "",

    emergencyContactName:
      profile?.emergencyContactName ||
      "",

    emergencyContactRelationship:
      profile?.emergencyContactRelationship ||
      "",

    emergencyContactNumber:
      profile?.emergencyContactNumber ||
      "",

    contractStart:
      toDateInputValue(
        profile?.contractStart
      ),

    contractEnd:
      toDateInputValue(
        profile?.contractEnd
      ),

    vessel:
      profile?.vessel || "",

    rank:
      profile?.rank || "",

    homeCountry:
      profile?.homeCountry || "",

    avatarMode:
      profile?.avatarMode === "AVATAR"
        ? "AVATAR"
        : "INITIALS",

    avatarId:
      profile?.avatarId
        ? String(profile.avatarId)
        : null,
  };
}

/* =========================================================
   TOAST
   ========================================================= */

function ProfileToast({
  type,
  onClose,
}) {
  if (!type) return null;

  const success =
    type === "success";

  return (
    <div
      className={`profile-toast ${
        success
          ? "is-success"
          : "is-error"
      }`}
      role={
        success
          ? "status"
          : "alert"
      }
    >
      <span className="profile-toast__icon">
        {success ? "✓" : "×"}
      </span>

      <div className="profile-toast__text">
        <strong>
          {success
            ? "Profile updated"
            : "Update failed"}
        </strong>

        <span>
          {success
            ? "Your changes have been saved successfully."
            : "We couldn’t save your changes. Please try again."}
        </span>
      </div>

      <button
        type="button"
        className="profile-toast__close"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

/* =========================================================
   DISPLAY FIELD
   ========================================================= */

function DisplayField({
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`profile-display-field ${
        fullWidth
          ? "is-full"
          : ""
      }`}
    >
      <span className="profile-field-label">
        {label}
      </span>

      <span className="profile-display-value">
        {value || "-"}
      </span>
    </div>
  );
}

/* =========================================================
   INPUT
   ========================================================= */

function ProfileInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  inputMode,
}) {
  return (
    <label className="profile-form-field">
      <span className="profile-field-label">
        {label}
      </span>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        inputMode={inputMode}
      />
    </label>
  );
}

/* =========================================================
   DROPDOWN
   ========================================================= */

function ProfileDropdown({
  label,
  value,
  options,
  onChange,
  fullWidth = false,
}) {
  const dropdownRef = useRef(null);

  const [open, setOpen] =
    useState(false);

  useEffect(() => {
    if (!open) return;

    function handleOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
  }, [open]);

  const actualOptions =
    useMemo(() => {
      return Array.from(
        new Set(
          [
            value,
            ...options,
          ].filter(Boolean)
        )
      );
    }, [value, options]);

  return (
    <div
      ref={dropdownRef}
      className={[
        "profile-form-field",
        "profile-dropdown-field",
        fullWidth
          ? "is-full"
          : "",
        open ? "is-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="profile-field-label">
        {label}
      </span>

      <button
        type="button"
        className={`profile-dropdown-trigger ${
          open ? "is-open" : ""
        }`}
        onClick={() =>
          setOpen((current) =>
            !current
          )
        }
      >
        <span>
          {value ||
            `Select ${label.toLowerCase()}`}
        </span>

        <img
          src={arrowDownIcon}
          alt=""
          className={
            open ? "is-open" : ""
          }
        />
      </button>

      {open && (
        <div className="profile-dropdown-menu">
          {actualOptions.map(
            (option) => (
              <button
                type="button"
                key={option}
                className={`profile-dropdown-option ${
                  option === value
                    ? "is-selected"
                    : ""
                }`}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
              >
                {option}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   COMPACT DATE PICKER
   ========================================================= */

function ProfileDatePicker({
  label,
  value,
  onChange,
  align = "left",
}) {
  const pickerRef = useRef(null);

  const [open, setOpen] =
    useState(false);

  const [
    temporaryValue,
    setTemporaryValue,
  ] = useState(value);

  const [visibleMonth, setVisibleMonth] =
    useState(() => {
      const date = value
        ? new Date(
            `${value}T00:00:00`
          )
        : new Date();

      return new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      );
    });

  useEffect(() => {
    if (!open) return;

    setTemporaryValue(value);

    const date = value
      ? new Date(
          `${value}T00:00:00`
        )
      : new Date();

    setVisibleMonth(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  }, [open, value]);

  useEffect(() => {
    if (!open) return;

    function handleOutside(event) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
  }, [open]);

  const calendarDays =
    useMemo(() => {
      const year =
        visibleMonth.getFullYear();

      const month =
        visibleMonth.getMonth();

      const firstDay =
        new Date(
          year,
          month,
          1
        ).getDay();

      const mondayOffset =
        (firstDay + 6) % 7;

      const daysCurrent =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      const daysPrevious =
        new Date(
          year,
          month,
          0
        ).getDate();

      return Array.from(
        { length: 42 },
        (_, index) => {
          const current =
            index -
            mondayOffset +
            1;

          if (current < 1) {
            const day =
              daysPrevious +
              current;

            const previous =
              new Date(
                year,
                month - 1,
                day
              );

            return {
              day,
              muted: true,
              iso: localIsoDate(
                previous.getFullYear(),
                previous.getMonth(),
                day
              ),
            };
          }

          if (
            current >
            daysCurrent
          ) {
            const day =
              current -
              daysCurrent;

            const next =
              new Date(
                year,
                month + 1,
                day
              );

            return {
              day,
              muted: true,
              iso: localIsoDate(
                next.getFullYear(),
                next.getMonth(),
                day
              ),
            };
          }

          return {
            day: current,
            muted: false,
            iso: localIsoDate(
              year,
              month,
              current
            ),
          };
        }
      );
    }, [visibleMonth]);

  function moveMonth(amount) {
    setVisibleMonth(
      (current) =>
        new Date(
          current.getFullYear(),
          current.getMonth() +
            amount,
          1
        )
    );
  }

  function chooseDate() {
    if (temporaryValue) {
      onChange(
        temporaryValue
      );
    }

    setOpen(false);
  }

  return (
    <div
      ref={pickerRef}
      className={`profile-form-field profile-date-field ${
        open ? "is-open" : ""
      }`}
    >
      <span className="profile-field-label">
        {label}
      </span>

      <button
        type="button"
        className="profile-date-trigger"
        onClick={() =>
          setOpen((current) =>
            !current
          )
        }
      >
        <span>
          {value
            ? formatDate(value)
            : "Select date"}
        </span>

        <img
          src={dateRangeIcon}
          alt=""
        />
      </button>

      {open && (
        <div
          className={`profile-calendar profile-calendar--${align}`}
        >
          <div className="profile-calendar__header">
            <button
              type="button"
              onClick={() =>
                moveMonth(-1)
              }
            >
              ‹
            </button>

            <strong>
              {new Intl.DateTimeFormat(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              ).format(
                visibleMonth
              )}
            </strong>

            <button
              type="button"
              onClick={() =>
                moveMonth(1)
              }
            >
              ›
            </button>
          </div>

          <div className="profile-calendar__weekdays">
            {WEEKDAYS.map(
              (day) => (
                <span key={day}>
                  {day}
                </span>
              )
            )}
          </div>

          <div className="profile-calendar__days">
            {calendarDays.map(
              (item, index) => (
                <button
                  key={`${item.iso}-${index}`}
                  type="button"
                  className={[
                    item.muted
                      ? "is-muted"
                      : "",
                    temporaryValue ===
                    item.iso
                      ? "is-selected"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() =>
                    setTemporaryValue(
                      item.iso
                    )
                  }
                >
                  {item.day}
                </button>
              )
            )}
          </div>

          <div className="profile-calendar__actions">
            <button
              type="button"
              className="calendar-cancel"
              onClick={() =>
                setOpen(false)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="calendar-choose"
              onClick={
                chooseDate
              }
            >
              Choose Date
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE PAGE
   ========================================================= */

function ProfilePage() {
  const [profile, setProfile] =
    useState(null);

  const [form, setForm] =
    useState(() =>
      buildForm(null)
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [
    avatarPickerOpen,
    setAvatarPickerOpen,
  ] = useState(false);

  const [toast, setToast] =
    useState(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

        const data =
          await getProfile();

        if (!mounted) return;

        setProfile(data);
        setForm(
          buildForm(data)
        );
      } catch (err) {
        if (!mounted) return;

        setError(
          err?.message ||
            "Failed to load profile."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer =
      window.setTimeout(
        () => setToast(null),
        4000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [toast]);

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    setForm(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  function startEditing() {
    setForm(
      buildForm(profile)
    );

    setEditing(true);
  }

  function cancelEditing() {
    setForm(
      buildForm(profile)
    );

    setAvatarPickerOpen(
      false
    );

    setEditing(false);
  }

  function chooseAvatar(id) {
    setForm(
      (current) => ({
        ...current,
        avatarMode:
          "AVATAR",
        avatarId:
          String(id),
      })
    );

    setAvatarPickerOpen(
      false
    );
  }

  function useInitials() {
    setForm(
      (current) => ({
        ...current,
        avatarMode:
          "INITIALS",
        avatarId: null,
      })
    );

    setAvatarPickerOpen(
      false
    );
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (saving) return;

    if (
      form.contractStart &&
      form.contractEnd &&
      form.contractEnd <
        form.contractStart
    ) {
      setToast("error");
      return;
    }

    try {
      setSaving(true);

      const updated =
        await updateProfile({
          fullName:
            form.fullName.trim(),

          email:
            form.email
              .trim()
              .toLowerCase(),

          rank:
            form.rank || null,

          vessel:
            form.vessel ||
            null,

          contractStart:
            form.contractStart ||
            null,

          contractEnd:
            form.contractEnd ||
            null,

          contactNumber:
            form.contactNumber ||
            null,

          emergencyContactName:
            form.emergencyContactName ||
            null,

          emergencyContactRelationship:
            form.emergencyContactRelationship ||
            null,

          emergencyContactNumber:
            form.emergencyContactNumber ||
            null,

          homeCountry:
            form.homeCountry ||
            null,

          avatarMode:
            form.avatarMode,

          avatarId:
            form.avatarMode ===
            "AVATAR"
              ? form.avatarId
              : null,
        });

      setProfile(updated);

      setForm(
        buildForm(updated)
      );

      /*
        Keep normal auth storage synced.
      */
      try {
        saveAuthSession({
          user: updated,
        });
      } catch {
        // Header still updates through event below.
      }

      /*
        IMPORTANT:
        AppHeader listens for this.
        Avatar/name/email update instantly without reload.
      */
      window.dispatchEvent(
        new CustomEvent(
          "anandam:profile-updated",
          {
            detail:
              updated,
          }
        )
      );

      setEditing(false);

      setToast(
        "success"
      );
    } catch (err) {
      console.error(
        "Profile update failed",
        err
      );

      setToast("error");
    } finally {
      setSaving(false);
    }
  }

  const displayAvatar =
    profile?.avatarMode ===
      "AVATAR" &&
    profile?.avatarId
      ? getAvatarById(
          profile.avatarId
        )
      : null;

  const editingAvatar =
    form.avatarMode ===
      "AVATAR" &&
    form.avatarId
      ? getAvatarById(
          form.avatarId
        )
      : null;

  const currentAvatar =
    editing
      ? editingAvatar
      : displayAvatar;

  const initials =
    getInitials(
      editing
        ? form.fullName
        : profile?.fullName
    );

  if (loading) {
    return (
      <AppLayout>
        <div className="profile-page">
          <div className="profile-loading">
            Loading profile...
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="profile-page">
        <img
          src={backgroundWave}
          alt=""
          className="profile-background-wave"
        />

        <ProfileToast
          type={toast}
          onClose={() =>
            setToast(null)
          }
        />

        <header className="profile-page-heading">
          <h1>Profile</h1>

          <p>
            Keep your maritime and
            contact details up to date.
          </p>
        </header>

        {error ? (
          <div className="profile-load-error">
            {error}
          </div>
        ) : (
          <section
            className={`profile-card ${
              editing
                ? "is-editing"
                : ""
            }`}
          >
            <div className="profile-card-top">
              <div className="profile-identity">
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar">
                    {currentAvatar ? (
                      <img
                        src={
                          currentAvatar
                        }
                        alt=""
                      />
                    ) : (
                      initials
                    )}
                  </div>

                  {editing && (
                    <>
                      <button
                        type="button"
                        className="profile-avatar-edit"
                        onClick={() =>
                          setAvatarPickerOpen(
                            (
                              current
                            ) =>
                              !current
                          )
                        }
                      >
                        <img
                          src={
                            editIcon
                          }
                          alt=""
                        />
                      </button>

                      {avatarPickerOpen && (
                        <div className="profile-avatar-picker">
                          <span>
                            Choose avatar
                          </span>

                          <div className="profile-avatar-picker-grid">
                            {AVATARS.map(
                              (
                                avatar
                              ) => (
                                <button
                                  type="button"
                                  key={
                                    avatar.id
                                  }
                                  className={
                                    form.avatarId ===
                                    avatar.id
                                      ? "is-selected"
                                      : ""
                                  }
                                  onClick={() =>
                                    chooseAvatar(
                                      avatar.id
                                    )
                                  }
                                >
                                  <img
                                    src={
                                      avatar.src
                                    }
                                    alt=""
                                  />
                                </button>
                              )
                            )}
                          </div>

                          <button
                            type="button"
                            className="profile-use-initials"
                            onClick={
                              useInitials
                            }
                          >
                            Use initials
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <h2>
                  {editing
                    ? form.fullName
                    : profile
                        ?.fullName}
                </h2>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="profile-edit-button"
                  onClick={
                    startEditing
                  }
                >
                  <img
                    src={editIcon}
                    alt=""
                  />

                  Edit
                </button>
              )}
            </div>

            {!editing ? (
              <div className="profile-display-grid">
                <DisplayField
                  label="Full name"
                  value={
                    profile?.fullName
                  }
                />

                <DisplayField
                  label="Email"
                  value={
                    profile?.email
                  }
                />

                <DisplayField
                  label="Contact number"
                  value={
                    profile?.contactNumber
                  }
                />

                <DisplayField
                  label="Emergency Contact Name"
                  value={
                    profile?.emergencyContactName
                  }
                />

                <DisplayField
                  label="Relationship with Contact"
                  value={
                    profile?.emergencyContactRelationship
                  }
                />

                <DisplayField
                  label="Emergency Contact number"
                  value={
                    profile?.emergencyContactNumber
                  }
                />

                <DisplayField
                  label="Contract start date"
                  value={formatDate(
                    profile?.contractStart
                  )}
                />

                <DisplayField
                  label="Contract End date"
                  value={formatDate(
                    profile?.contractEnd
                  )}
                />

                <DisplayField
                  label="Vessel"
                  value={
                    profile?.vessel
                  }
                />

                <DisplayField
                  label="Rank"
                  value={
                    profile?.rank
                  }
                />

                <DisplayField
                  label="Country"
                  value={
                    profile?.homeCountry
                  }
                  fullWidth
                />
              </div>
            ) : (
              <form
                className="profile-edit-form"
                onSubmit={
                  handleSubmit
                }
              >
                <div className="profile-edit-grid">
                  <ProfileInput
                    label="Full name"
                    name="fullName"
                    value={
                      form.fullName
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <ProfileInput
                    label="Email"
                    name="email"
                    type="email"
                    value={
                      form.email
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <ProfileInput
                    label="Contact number"
                    name="contactNumber"
                    value={
                      form.contactNumber
                    }
                    onChange={
                      handleChange
                    }
                    inputMode="tel"
                  />

                  <ProfileInput
                    label="Emergency Contact Name"
                    name="emergencyContactName"
                    value={
                      form.emergencyContactName
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <ProfileDropdown
                    label="Relationship with Contact"
                    value={
                      form.emergencyContactRelationship
                    }
                    options={
                      RELATIONSHIP_OPTIONS
                    }
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          emergencyContactRelationship:
                            value,
                        })
                      )
                    }
                  />

                  <ProfileInput
                    label="Emergency Contact number"
                    name="emergencyContactNumber"
                    value={
                      form.emergencyContactNumber
                    }
                    onChange={
                      handleChange
                    }
                    inputMode="tel"
                  />

                  <ProfileDatePicker
                    label="Contract start date"
                    value={
                      form.contractStart
                    }
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          contractStart:
                            value,
                        })
                      )
                    }
                  />

                  <ProfileDatePicker
                    label="Contract End date"
                    value={
                      form.contractEnd
                    }
                    align="right"
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          contractEnd:
                            value,
                        })
                      )
                    }
                  />

                  <ProfileInput
                    label="Vessel"
                    name="vessel"
                    value={
                      form.vessel
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <ProfileInput
                    label="Rank"
                    name="rank"
                    value={
                      form.rank
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <ProfileDropdown
                    label="Country"
                    value={
                      form.homeCountry
                    }
                    options={
                      COUNTRY_OPTIONS
                    }
                    fullWidth
                    onChange={(
                      value
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          homeCountry:
                            value,
                        })
                      )
                    }
                  />
                </div>

                <div className="profile-actions">
                  <button
                    type="button"
                    className="profile-cancel-button"
                    disabled={
                      saving
                    }
                    onClick={
                      cancelEditing
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={
                      saving
                    }
                  >
                    {saving
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </div>
    </AppLayout>
  );
}

export default ProfilePage;