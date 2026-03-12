import { useEffect, useState } from "react";
import { getPerfectDaySchedule } from "../api/perfectDayApi";
import "../styles/perfect-day-schedule.css";

function Header({ header }) {
  return (
    <header className="pd-header">
      <div className="pd-brand">
        <div className="pd-logo-wrap">
          <div className="pd-logo-circle">🧘</div>
          <div className="pd-logo-dot" />
        </div>

        <div>
          <h1 className="pd-brand-title">{header.brandTitle}</h1>
          <p className="pd-brand-subtitle">{header.brandSubtitle}</p>
        </div>
      </div>

      <div className="pd-header-right">
        <button className="pd-bell-btn">🔔</button>
        <div className="pd-user-badge">{header.userInitials}</div>
      </div>
    </header>
  );
}

function PlannerTop({ planner, header }) {
  return (
    <section className="pd-page-section">
      <div className="pd-title-row">
        <div>
          <h2 className="pd-main-title">{planner.title}</h2>
          <p className="pd-main-subtitle">{planner.subtitle}</p>
        </div>

        <div className="pd-progress-badge">{header.progressBadge}</div>
      </div>

      <div className="pd-tabs">
        {planner.tabs.map((tab) => (
          <button
            key={tab}
            className={`pd-tab ${planner.activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="pd-focus-card">
        <h3 className="pd-focus-title">{planner.focusTitle}</h3>
        <p className="pd-focus-subtitle">{planner.focusSubtitle}</p>

        <label className="pd-goal-label">{planner.dailyGoalLabel}</label>
        <input
          className="pd-goal-input"
          placeholder={planner.dailyGoalPlaceholder}
          readOnly
        />

        <div className="pd-summary-grid">
          {planner.summaryCards.map((card) => (
            <div key={card.title} className={`pd-summary-card ${card.type}`}>
              <div className="pd-summary-icon">◌</div>
              <div className="pd-summary-title">{card.title}</div>
              <div className="pd-summary-value">{card.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function getCategoryClass(category) {
  if (category === "learning") return "learning";
  if (category === "work") return "work";
  if (category === "social") return "social";
  if (category === "wellness") return "wellness";
  return "";
}

function getIconSymbol(icon) {
  if (icon === "book") return "📖";
  if (icon === "anchor") return "⚓";
  if (icon === "phone") return "📞";
  if (icon === "heart") return "♡";
  if (icon === "home") return "⌂";
  if (icon === "calendar") return "🗓";
  if (icon === "clock") return "◷";
  if (icon === "pulse") return "⌁";
  if (icon === "warning") return "⚠";
  return "•";
}

function ScheduleSection({ scheduleSection }) {
  return (
    <section className="pd-page-section">
      <div className="pd-schedule-card">
        <h3 className="pd-schedule-title">🗓 {scheduleSection.title}</h3>
        <p className="pd-schedule-subtitle">{scheduleSection.subtitle}</p>

        <div className="pd-progress-track">
          <div
            className="pd-progress-fill"
            style={{ width: `${scheduleSection.progressPercent}%` }}
          />
        </div>

        <div className="pd-progress-text">{scheduleSection.completedText}</div>

        <div className="pd-activity-list">
          {scheduleSection.items.map((item) => (
            <div
              key={item.id}
              className={`pd-activity-row ${item.completed ? "completed" : ""}`}
            >
              <div className="pd-activity-left">
                <input
                  type="checkbox"
                  checked={item.completed}
                  readOnly
                  className="pd-checkbox"
                />

                <div className="pd-activity-icon">{getIconSymbol(item.icon)}</div>

                <div className="pd-activity-content">
                  <div className="pd-activity-title">{item.title}</div>
                  <div className="pd-activity-meta">
                    {item.time} • {item.duration}
                  </div>
                </div>
              </div>

              <div
                className={`pd-category-badge ${getCategoryClass(item.category)}`}
              >
                {item.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomNav({ bottomNav }) {
  return (
    <nav className="pd-bottom-nav">
      {bottomNav.map((item) => (
        <button
          key={item.label}
          className={`pd-bottom-nav-item ${item.active ? "active" : ""}`}
        >
          <span className="pd-bottom-nav-icon">{getIconSymbol(item.icon)}</span>
          <span className="pd-bottom-nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function PerfectDaySchedulePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await getPerfectDaySchedule();
        setPageData(data);
      } catch (error) {
        console.error("Failed to load perfect day schedule", error);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, []);

  if (loading) {
    return <div className="pd-loading">Loading...</div>;
  }

  if (!pageData) {
    return <div className="pd-loading">Unable to load page.</div>;
  }

  return (
    <div className="pd-page">
      <Header header={pageData.header} />
      <PlannerTop planner={pageData.planner} header={pageData.header} />
      <ScheduleSection scheduleSection={pageData.scheduleSection} />
      <BottomNav bottomNav={pageData.bottomNav} />
    </div>
  );
}

export default PerfectDaySchedulePage;