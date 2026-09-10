import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Download,
} from "lucide-react";

import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";

import { getMyProfile } from "../api/profileApi";
import {
  getDashboardWellness,
} from "../api/moodCheckinApi";

/* =====================================================
   DASHBOARD ASSETS
   ===================================================== */

import activitiesIcon from "../assets/dashboard/activities.png";
import affirmationsIcon from "../assets/dashboard/affirmations.png";
import aiAnalyticsIcon from "../assets/dashboard/ai analytics.png";
import botimIcon from "../assets/dashboard/botim.png";
import brainTrainingIcon from "../assets/dashboard/brain training.png";
import breathingIcon from "../assets/dashboard/breathing.png";
import locationIcon from "../assets/dashboard/carbon_location.png";
import crisisSupportIcon from "../assets/dashboard/crisis support.png";
import dateRangeIcon from "../assets/dashboard/date_range.png";
import emailIcon from "../assets/dashboard/email.png";
import emergencyHubIcon from "../assets/dashboard/emergency hub.png";
import emergencyIcon from "../assets/dashboard/emergency.png";
import energyLevelIcon from "../assets/dashboard/energy level.png";
import healthIcon from "../assets/dashboard/heart.png";
import masterClassesIcon from "../assets/dashboard/master classes.png";
import moodCheckIcon from "../assets/dashboard/mood check.png";
import moodScoreIcon from "../assets/dashboard/mood score.png";
import scheduleIcon from "../assets/dashboard/schedule.png";
import sleepStoriesIcon from "../assets/dashboard/sleep stories.png";
import whatsappIcon from "../assets/dashboard/whatsapp.png";
import wisdomIcon from "../assets/dashboard/wisdom.png";

/* =====================================================
   PROFILE AVATARS
   ===================================================== */

import avatar1 from "../assets/profile/avatar 1.png";
import avatar2 from "../assets/profile/avatar 2.png";
import avatar3 from "../assets/profile/avatar 3.png";
import avatar4 from "../assets/profile/avatar 4.png";
import avatar5 from "../assets/profile/avatar 5.png";
import avatar6 from "../assets/profile/avatar 6.png";
import avatar7 from "../assets/profile/avatar 7.png";
import avatar8 from "../assets/profile/avatar 8.png";

import "../styles/dashboard.css";

const AVATAR_MAP = {
  1: avatar1,
  2: avatar2,
  3: avatar3,
  4: avatar4,
  5: avatar5,
  6: avatar6,
  7: avatar7,
  8: avatar8,
};

/* =====================================================
   TOOLKIT DATA
   ===================================================== */

const TOOLKIT_ITEMS = [
  {
    id: "mood",
    title: "Mood check",
    subtitle: "How are you feeling?",
    icon: moodCheckIcon,
    background: "#EDF5FF",
    route: "/mood",
  },
  {
    id: "breathing",
    title: "Breathing",
    subtitle: "4 guided exercises",
    icon: breathingIcon,
    background: "#F7EFFF",
    route: null,
  },
  {
    id: "sleep",
    title: "Sleep stories",
    subtitle: "Drift off peacefully",
    icon: sleepStoriesIcon,
    background: "#FCF5D8",
    route: "/app/work-rest",
  },
  {
    id: "affirmations",
    title: "Affirmations",
    subtitle: "Positive mantras",
    icon: affirmationsIcon,
    background: "#FFEBE2",
    route: null,
  },
  {
    id: "wisdom",
    title: "Daily wisdom",
    subtitle: "Ancient insights",
    icon: wisdomIcon,
    background: "#E7F8F2",
    route: null,
  },
  {
    id: "masterclasses",
    title: "Masterclasses",
    subtitle: "Expert-led guidance",
    icon: masterClassesIcon,
    background: "#F8EFE7",
    route: null,
  },
  {
    id: "brain-training",
    title: "Brain training",
    subtitle: "Cognitive exercises",
    icon: brainTrainingIcon,
    background: "#F6F8E7",
    route: null,
  },
  {
    id: "health",
    title: "Health monitoring",
    subtitle: "Vitals & biometrics",
    icon: healthIcon,
    background: "#EDEDFF",
    route: "/app/fitness",
  },
];

const EMERGENCY_ITEMS = [
  {
    id: "emergency-hubs",
    title: "Emergency hubs",
    subtitle: "All systems green",
    icon: emergencyHubIcon,
    route: "/app/emergency",
  },
  {
    id: "crisis-support",
    title: "Crisis Support",
    subtitle: "24/7 monitoring",
    icon: crisisSupportIcon,
    route: "/app/emergency",
  },
  {
    id: "ai-analytics",
    title: "AI Analytics",
    subtitle: "Risk monitoring",
    icon: aiAnalyticsIcon,
    route: null,
  },
];

const CONTACT_ITEMS = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    extra: "(3 unread)",
    icon: whatsappIcon,
  },
  {
    id: "email",
    title: "Email",
    extra: "(3 unread)",
    icon: emailIcon,
  },
  {
    id: "botim",
    title: "Botim",
    extra: "",
    icon: botimIcon,
  },
];

/* =====================================================
   HELPERS
   ===================================================== */

function getInitials(fullName = "") {
  const initials = String(fullName)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part.charAt(0).toUpperCase()
    )
    .join("");

  return initials || "U";
}

function getFirstName(fullName = "") {
  return (
    String(fullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] || "Captain"
  );
}

function resolveAvatar(profile) {
  if (
    profile?.avatarMode !== "AVATAR" ||
    !profile?.avatarId
  ) {
    return null;
  }

  const number = String(profile.avatarId).match(/\d+/)?.[0];

  return AVATAR_MAP[number] || null;
}

function calculateDaysAtSea(contractStart) {
  if (!contractStart) {
    return null;
  }

  const start = new Date(contractStart);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const now = new Date();

  const difference =
    now.getTime() - start.getTime();

  if (difference < 0) {
    return 0;
  }

  return Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );
}

function calculateContractProgress(
  contractStart,
  contractEnd
) {
  if (!contractStart || !contractEnd) {
    return 0;
  }

  const start = new Date(contractStart);
  const end = new Date(contractEnd);
  const now = new Date();

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  const total =
    end.getTime() - start.getTime();

  const elapsed =
    now.getTime() - start.getTime();

  const percentage =
    (elapsed / total) * 100;

  return Math.round(
    Math.max(0, Math.min(100, percentage))
  );
}

function formatMoodScore(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const score = Math.max(
    0,
    Math.min(5, Number(value))
  );

  const converted = score * 2;

  return Number.isInteger(converted)
    ? `${converted}/10`
    : `${converted.toFixed(1)}/10`;
}

function formatEnergyLevel(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "—";
  }

  const energy = Math.max(
    0,
    Math.min(5, Number(value))
  );

  return `${Math.round(
    (energy / 5) * 100
  )}%`;
}

/* =====================================================
   SMALL COMPONENTS
   ===================================================== */

function ToolkitCard({
  item,
  onClick,
}) {
  const clickable = Boolean(item.route);

  return (
    <button
      type="button"
      className={`dashboard-tool-card ${
        clickable
          ? "dashboard-tool-card--clickable"
          : ""
      }`}
      style={{
        background: item.background,
      }}
      onClick={() =>
        clickable && onClick(item.route)
      }
    >
      <span className="dashboard-tool-card__icon">
        <img
          src={item.icon}
          alt=""
          aria-hidden="true"
        />
      </span>

      <span className="dashboard-tool-card__bottom">
        <span className="dashboard-tool-card__text">
          <strong>{item.title}</strong>
          <span>{item.subtitle}</span>
        </span>

        <span className="dashboard-tool-card__arrow">
          <ArrowUpRight
            size={17}
            strokeWidth={1.6}
          />
        </span>
      </span>
    </button>
  );
}

function EmergencyCard({
  item,
  onClick,
}) {
  return (
    <button
      type="button"
      className="dashboard-emergency-card"
      onClick={() =>
        item.route && onClick(item.route)
      }
    >
      <span className="dashboard-emergency-card__top">
        <span className="dashboard-emergency-card__icon">
          <img
            src={item.icon}
            alt=""
            aria-hidden="true"
          />
        </span>
      </span>

      <span className="dashboard-emergency-card__bottom">
        <span className="dashboard-emergency-card__text">
          <strong>{item.title}</strong>
          <span>{item.subtitle}</span>
        </span>

        <span className="dashboard-emergency-card__arrow">
          <ArrowUpRight
            size={17}
            strokeWidth={1.6}
          />
        </span>
      </span>
    </button>
  );
}

function ContactCard({ item }) {
  return (
    <button
      type="button"
      className="dashboard-contact-card"
    >
      <span className="dashboard-contact-card__icon-wrap">
        <img
          src={item.icon}
          alt=""
          aria-hidden="true"
          className="dashboard-contact-card__icon"
        />

        {item.extra && (
          <span className="dashboard-contact-card__dot" />
        )}
      </span>

      <span className="dashboard-contact-card__content">
        <span className="dashboard-contact-card__name-row">
          <strong>{item.title}</strong>

          {item.extra && (
            <small>{item.extra}</small>
          )}
        </span>

        <span className="dashboard-contact-card__arrow">
          <ArrowUpRight
            size={16}
            strokeWidth={1.6}
          />
        </span>
      </span>
    </button>
  );
}

/* =====================================================
   DASHBOARD
   ===================================================== */

function DashboardPage() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState(null);

  const [wellness, setWellness] =
    useState({
      moodScore: null,
      energyLevel: null,
      activities: 0,
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const results =
          await Promise.allSettled([
            getMyProfile(),
            getDashboardWellness(),
          ]);

        if (cancelled) {
          return;
        }

        if (
          results[0].status ===
          "fulfilled"
        ) {
          setProfile(results[0].value);
        } else {
          console.error(
            "Failed to load profile:",
            results[0].reason
          );
        }

        if (
          results[1].status ===
          "fulfilled"
        ) {
          setWellness(results[1].value);
        } else {
          console.error(
            "Failed to load wellness:",
            results[1].reason
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  const dashboardData = useMemo(() => {
    const fullName =
      profile?.fullName || "Captain";

    return {
      fullName,
      firstName: getFirstName(fullName),
      initials: getInitials(fullName),

      vessel:
        profile?.vessel || "Not set",

      avatar: resolveAvatar(profile),

      contractProgress:
        calculateContractProgress(
          profile?.contractStart,
          profile?.contractEnd
        ),

      daysAtSea:
        calculateDaysAtSea(
          profile?.contractStart
        ),
    };
  }, [profile]);

  function handleNavigate(route) {
    if (!route) {
      return;
    }

    navigate(route);
  }

  function handleExportReport() {
    const rows = [
      ["Name", dashboardData.fullName],
      ["Vessel", dashboardData.vessel],
      [
        "Mood Score",
        formatMoodScore(
          wellness.moodScore
        ),
      ],
      [
        "Energy Level",
        formatEnergyLevel(
          wellness.energyLevel
        ),
      ],
      [
        "Activities Today",
        wellness.activities,
      ],
      [
        "Contract Progress",
        `${dashboardData.contractProgress}%`,
      ],
      [
        "Days at Sea",
        dashboardData.daysAtSea ?? "",
      ],
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const safe = String(
              value ?? ""
            ).replace(/"/g, '""');

            return `"${safe}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "anandam-wellness-report.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="dashboard-page">
      {/* Universal Header */}
      <AppHeader />

      {/* Universal Side Navigation */}
      <BottomNav />

      <main className="dashboard-main">
        {/* =============================================
            PROFILE / VOYAGE CARD
        ============================================== */}

        <section className="dashboard-voyage-card">
          <div className="dashboard-voyage-heading">
            <h1>
              Welcome back, Captain
            </h1>

            <div className="dashboard-connection">
              <span className="dashboard-connection__dot" />
              <span>
                Satellite Communication
              </span>
            </div>
          </div>

          <div className="dashboard-voyage-profile">
            <div className="dashboard-voyage-profile__avatar">
              {dashboardData.avatar ? (
                <img
                  src={
                    dashboardData.avatar
                  }
                  alt={
                    dashboardData.fullName
                  }
                />
              ) : (
                <span>
                  {dashboardData.initials}
                </span>
              )}
            </div>

            <div className="dashboard-voyage-profile__identity">
              <h2>
                {dashboardData.fullName}
              </h2>

              <p>
                Voyage -{" "}
                {dashboardData.vessel}
              </p>
            </div>
          </div>

          <div className="dashboard-voyage-information">
            <div className="dashboard-voyage-metrics">
              <div className="dashboard-voyage-metric">
                <div className="dashboard-voyage-metric__label">
                  <img
                    src={locationIcon}
                    alt=""
                  />
                  <span>Next port</span>
                </div>

                <strong>—</strong>
              </div>

              <span className="dashboard-voyage-divider" />

              <div className="dashboard-voyage-metric">
                <div className="dashboard-voyage-metric__label">
                  <img
                    src={scheduleIcon}
                    alt=""
                  />
                  <span>ETA</span>
                </div>

                <strong>—</strong>
              </div>

              <span className="dashboard-voyage-divider" />

              <div className="dashboard-voyage-metric">
                <div className="dashboard-voyage-metric__label">
                  <img
                    src={dateRangeIcon}
                    alt=""
                  />
                  <span>
                    Days at sea
                  </span>
                </div>

                <strong>
                  {dashboardData.daysAtSea ??
                    "—"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="dashboard-export-button"
              onClick={
                handleExportReport
              }
            >
              <Download
                size={22}
                strokeWidth={1.5}
              />

              <span>
                Export Report
              </span>
            </button>
          </div>

          <div className="dashboard-contract">
            <div className="dashboard-contract__header">
              <span>
                Contract Progress
              </span>

              <strong>
                {
                  dashboardData.contractProgress
                }
                %
              </strong>
            </div>

            <div className="dashboard-contract__track">
              <div
                className="dashboard-contract__fill"
                style={{
                  width: `${dashboardData.contractProgress}%`,
                }}
              />
            </div>
          </div>
        </section>

        {/* =============================================
            TODAY'S WELLNESS
        ============================================== */}

        <section className="dashboard-wellness">
          <h2 className="dashboard-section-title">
            Today's Wellness
          </h2>

          <div className="dashboard-wellness-grid">
            <article className="dashboard-wellness-card">
              <div className="dashboard-wellness-card__top">
                <span>
                  Mood Score
                </span>

                <span className="dashboard-wellness-card__icon">
                  <img
                    src={moodScoreIcon}
                    alt=""
                  />
                </span>
              </div>

              <strong>
                {loading
                  ? "—"
                  : formatMoodScore(
                      wellness.moodScore
                    )}
              </strong>
            </article>

            <article className="dashboard-wellness-card">
              <div className="dashboard-wellness-card__top">
                <span>
                  Energy Level
                </span>

                <span className="dashboard-wellness-card__icon">
                  <img
                    src={energyLevelIcon}
                    alt=""
                  />
                </span>
              </div>

              <strong>
                {loading
                  ? "—"
                  : formatEnergyLevel(
                      wellness.energyLevel
                    )}
              </strong>
            </article>

            <article className="dashboard-wellness-card">
              <div className="dashboard-wellness-card__top">
                <span>
                  Activities
                </span>

                <span className="dashboard-wellness-card__icon">
                  <img
                    src={activitiesIcon}
                    alt=""
                  />
                </span>
              </div>

              <strong>
                {loading
                  ? "—"
                  : wellness.activities}
              </strong>
            </article>
          </div>
        </section>

        {/* =============================================
            MIND & BODY TOOLKIT
        ============================================== */}

        <section className="dashboard-toolkit">
          <h2 className="dashboard-section-title">
            Mind & body toolkit
          </h2>

          <div className="dashboard-toolkit-grid">
            {TOOLKIT_ITEMS.map(
              (item) => (
                <ToolkitCard
                  key={item.id}
                  item={item}
                  onClick={
                    handleNavigate
                  }
                />
              )
            )}
          </div>

          {/* Emergency Support */}

          <div className="dashboard-emergency">
            <div className="dashboard-emergency__heading">
              <span className="dashboard-emergency__main-icon">
                <img
                  src={emergencyIcon}
                  alt=""
                />
              </span>

              <div>
                <h3>
                  Emergency support
                </h3>

                <p>
                  If you need immediate
                  help, everything you
                  need is right here —
                  always monitored,
                  always on.
                </p>
              </div>
            </div>

            <div className="dashboard-emergency-grid">
              {EMERGENCY_ITEMS.map(
                (item) => (
                  <EmergencyCard
                    key={item.id}
                    item={item}
                    onClick={
                      handleNavigate
                    }
                  />
                )
              )}
            </div>
          </div>
        </section>

        {/* =============================================
            STAY IN TOUCH
        ============================================== */}

        <section className="dashboard-contact">
          <h2 className="dashboard-section-title">
            Stay in touch
          </h2>

          <div className="dashboard-contact-grid">
            {CONTACT_ITEMS.map(
              (item) => (
                <ContactCard
                  key={item.id}
                  item={item}
                />
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;