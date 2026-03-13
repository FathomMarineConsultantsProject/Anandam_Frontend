// src/pages/PerfectDaySchedulePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Target, Calendar, Clock, CheckCircle2, Award, Star,
  Anchor, Heart, Utensils, BookOpen, Phone, Waves, Dumbbell,
  Bell, House, Activity, TriangleAlert, Zap, TrendingUp,
  Shield, Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPerfectDaySchedule } from "../api/perfectDayApi";
import { homePageMockData } from "../data/homeData";
import "../styles/perfect-day-schedule.css";

// ─── AppHeader ────────────────────────────────────────────────────────────────
function AppHeader({ header }) {
  if (!header) return null;
  return (
    <header className="pd-app-header">
      <div className="pd-app-header-inner">
        <div className="pd-brand">
          <div className="pd-brand-logo">
            <div className="pd-brand-logo-outer" />
            <div className="pd-brand-logo-inner" />
            <div className="pd-brand-logo-person">
              <div className="pd-brand-logo-head" />
              <div className="pd-brand-logo-body">
                <div className="pd-brand-logo-arm pd-brand-logo-arm-left" />
                <div className="pd-brand-logo-arm pd-brand-logo-arm-right" />
              </div>
              <div className="pd-brand-logo-base" />
            </div>
            <div className="pd-brand-logo-dot" />
          </div>
          <div className="pd-brand-text">
            <h1>{header.appName}</h1>
            <p>{header.appSubtitle}</p>
          </div>
        </div>
        <div className="pd-header-actions">
          <button className="pd-header-icon-btn" type="button" aria-label="Notifications">
            <Bell size={16} strokeWidth={2} />
          </button>
          <div className="pd-user-badge">{header.userInitials}</div>
        </div>
      </div>
    </header>
  );
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
const navIconMap = {
  home: House, calendar: Calendar, heart: Heart,
  clock: Clock, activity: Activity, "alert-triangle": TriangleAlert,
};

function BottomNav({ navigation }) {
  const navigate = useNavigate();
  if (!navigation) return null;
  const { items = [], activeTab = "" } = navigation;
  return (
    <nav className="pd-bottom-nav">
      <div className="pd-bottom-nav-grid">
        {items.map((item) => {
          const Icon = navIconMap[item.icon];
          const isActive = activeTab === item.id;
          return (
            <button key={item.id} type="button"
              className={`pd-bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => item.path && navigate(item.path)}>
              {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ─── PlannerTabs ──────────────────────────────────────────────────────────────
function PlannerTabs({ tabs = [], activeTab, onTabChange }) {
  return (
    <div className="pd-tabs-shell">
      <div className="pd-tabs" role="tablist">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab"
            aria-selected={activeTab === tab.id}
            className={`pd-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange && onTabChange(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SummaryCards (Day Planner) ───────────────────────────────────────────────
function SummaryCards({ cards = [] }) {
  const iconMap = { total: Clock, completed: CheckCircle2, progress: Award };
  return (
    <div className="pd-summary-grid">
      {cards.map((card) => {
        const Icon = iconMap[card.type] || Clock;
        return (
          <div key={card.title} className={`pd-summary-card ${card.type}`}>
            <Icon className="pd-summary-icon" size={24} strokeWidth={2} />
            <p className="pd-summary-title">{card.title}</p>
            <p className="pd-summary-value">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Activity row icon map ────────────────────────────────────────────────────
function getActivityIcon(icon) {
  const map = {
    anchor: Anchor, heart: Heart, utensils: Utensils,
    book: BookOpen, phone: Phone, waves: Waves, dumbbell: Dumbbell,
  };
  return map[icon] || Calendar;
}

function getCategoryClass(cat) {
  const map = {
    work: "work", wellness: "wellness", nutrition: "nutrition",
    learning: "learning", social: "social", fitness: "fitness",
  };
  return map[cat] || "";
}

// ─── Schedule Section (Day Planner tab) ──────────────────────────────────────
function ScheduleSection({ scheduleSection, onToggle }) {
  const total = scheduleSection.items.length;
  const completedCount = scheduleSection.items.filter((i) => i.completed).length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <section className="pd-card">
      <div className="pd-card-header">
        <div className="pd-card-title-row">
          <Calendar className="pd-card-title-icon" size={20} strokeWidth={2} />
          <span className="pd-card-title">{scheduleSection.title}</span>
        </div>
        <p className="pd-card-subtitle">{scheduleSection.subtitle}</p>
      </div>
      <div className="pd-card-body pd-schedule-body">
        <div className="pd-progress-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div className="pd-progress-bar-fill" style={{ transform: `translateX(${pct - 100}%)` }} />
        </div>
        <p className="pd-progress-caption">{completedCount} of {total} activities completed</p>
        <div className="pd-activity-list">
          {scheduleSection.items.map((item) => {
            const Icon = getActivityIcon(item.icon);
            return (
              <div key={item.id} className={`pd-activity-row ${item.completed ? "completed" : ""}`}>
                <div className="pd-activity-main">
                  <button type="button" role="checkbox" aria-checked={item.completed}
                    className={`pd-check ${item.completed ? "checked" : ""}`}
                    onClick={() => onToggle && onToggle(item.id)} />
                  <div className="pd-activity-meta-wrap">
                    <div className="pd-activity-title-wrap">
                      <Icon className="pd-activity-icon" size={16} strokeWidth={2} />
                      <div>
                        <p className={`pd-activity-title${item.completed ? " line-through" : ""}`}>{item.title}</p>
                        <div className="pd-activity-meta">
                          <span>{item.time}</span>
                          <span className="pd-meta-dot">•</span>
                          <span>{item.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`pd-badge ${getCategoryClass(item.category)}`}>{item.category}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Habit icon map ───────────────────────────────────────────────────────────
function getHabitIcon(icon) {
  const map = {
    shield: Shield, target: Target, heart: Heart, phone: Phone,
    "trending-up": TrendingUp, utensils: Utensils,
  };
  return map[icon] || Target;
}

// Habit category badge colours
function getHabitBadgeClass(cat) {
  const map = {
    safety: "habit-safety", professional: "habit-professional",
    wellness: "habit-wellness", social: "habit-social",
    mindfulness: "habit-mindfulness", skills: "habit-skills",
    nutrition: "habit-nutrition",
  };
  return map[cat] || "";
}

// ─── Maritime Habits Tab ──────────────────────────────────────────────────────
// doneCount / targetCount drive the progress bar dynamically.
// Checking a habit adds 1 to doneCount; unchecking subtracts 1.
const HABITS_DATA = [
  { id: "h1", icon: "shield",      title: "Daily Sea Safety Check",           doneCount: 15, targetCount: 21, category: "safety",       completed: true  },
  { id: "h2", icon: "target",      title: "Bridge Communication Log",         doneCount: 12, targetCount: 30, category: "professional", completed: true  },
  { id: "h3", icon: "target",      title: "Weather Observation Notes",        doneCount:  8, targetCount: 14, category: "professional", completed: false },
  { id: "h4", icon: "heart",       title: "Physical Fitness - Maritime Yoga", doneCount:  6, targetCount: 10, category: "wellness",     completed: false },
  { id: "h5", icon: "phone",       title: "Family Video Call",                doneCount: 20, targetCount: 30, category: "social",       completed: true  },
  { id: "h6", icon: "heart",       title: "Mindful Ocean Watching",           doneCount:  4, targetCount:  7, category: "mindfulness",  completed: false },
  { id: "h7", icon: "trending-up", title: "Navigation Skills Practice",       doneCount:  9, targetCount: 21, category: "skills",       completed: false },
  { id: "h8", icon: "utensils",    title: "Healthy Maritime Meals",           doneCount: 11, targetCount: 14, category: "nutrition",    completed: true  },
];

// ─── Toast component ──────────────────────────────────────────────────────────
function HabitToast({ visible }) {
  return (
    <div className={`pd-toast ${visible ? "visible" : ""}`}>
      <div className="pd-toast-inner">
        <span className="pd-toast-title">Habit Completed!</span>
        <span className="pd-toast-body">Great job maintaining your maritime wellness routine</span>
      </div>
    </div>
  );
}

function MaritimeHabitsTab() {
  const [habits, setHabits] = useState(HABITS_DATA);
  const [newHabit, setNewHabit] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  function toggleHabit(id) {
    let nowCompleted = false;
    setHabits((prev) => prev.map((h) => {
      if (h.id !== id) return h;
      nowCompleted = !h.completed;
      const newDone = nowCompleted
        ? h.doneCount + 1
        : Math.max(0, h.doneCount - 1);
      return { ...h, completed: nowCompleted, doneCount: newDone };
    }));

    // Read the toggled state directly from habits to decide toast
    const habit = habits.find((h) => h.id === id);
    const willBeCompleted = habit ? !habit.completed : false;
    if (willBeCompleted) {
      setToastVisible(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToastVisible(false), 5000);
    } else {
      // Unchecking — hide toast immediately if showing
      setToastVisible(false);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    }
  }

  function addHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) return;
    setHabits((prev) => [...prev, {
      id: `h${Date.now()}`, icon: "target", title: trimmed,
      doneCount: 0, targetCount: 30, category: "professional", completed: false,
    }]);
    setNewHabit("");
  }

  const activeCount = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const successPct = activeCount > 0 ? Math.round((completedToday / activeCount) * 100) : 0;

  return (
    <>
      {/* Toast — rendered outside card so it floats bottom-right */}
      <HabitToast visible={toastVisible} />

      <section className="pd-card">
        {/* Header */}
        <div className="pd-card-header">
          <div className="pd-card-title-row">
            <Zap className="pd-card-title-icon" size={20} strokeWidth={2} />
            <span className="pd-card-title">Maritime Habit Builder</span>
          </div>
          <p className="pd-card-subtitle">Build lasting habits for maritime wellness and professional excellence</p>
        </div>

        <div className="pd-card-body">
          {/* Stats grid — 2 cols */}
          <div className="pd-habit-stats">
            <div className="pd-habit-stat green">
              <TrendingUp size={24} strokeWidth={2} className="pd-habit-stat-icon" />
              <p className="pd-habit-stat-label">Active Habits</p>
              <p className="pd-habit-stat-value green">{activeCount}</p>
            </div>
            <div className="pd-habit-stat blue">
              <Star size={24} strokeWidth={2} className="pd-habit-stat-icon" />
              <p className="pd-habit-stat-label">Today's Success</p>
              <p className="pd-habit-stat-value blue">{successPct}%</p>
            </div>
          </div>

          {/* Habit list */}
          <div className="pd-habit-list">
            {habits.map((habit) => {
              const Icon = getHabitIcon(habit.icon);
              // Dynamic pct from doneCount / targetCount
              const pct = habit.targetCount > 0
                ? Math.min(100, Math.round((habit.doneCount / habit.targetCount) * 100))
                : 0;
              const daysLabel = `${habit.doneCount}/${habit.targetCount} days`;

              return (
                <div key={habit.id} className={`pd-habit-row ${habit.completed ? "completed" : ""}`}>
                  <div className="pd-habit-top">
                    <div className="pd-habit-left">
                      <button type="button" role="checkbox" aria-checked={habit.completed}
                        className={`pd-check ${habit.completed ? "checked" : ""}`}
                        onClick={() => toggleHabit(habit.id)} />
                      <Icon className="pd-habit-icon" size={20} strokeWidth={2} />
                      <div>
                        <p className={`pd-habit-title${habit.completed ? " green" : ""}`}>{habit.title}</p>
                        <div className="pd-habit-meta">
                          <span>{daysLabel}</span>
                          <span className={`pd-habit-badge ${getHabitBadgeClass(habit.category)}`}>
                            {habit.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="pd-habit-right">
                      <p className="pd-habit-pct">{pct}%</p>
                      <p className="pd-habit-pct-label">Target Progress</p>
                    </div>
                  </div>
                  {/* Dynamic progress bar */}
                  <div className="pd-habit-bar">
                    <div className="pd-habit-bar-fill" style={{ transform: `translateX(${pct - 100}%)` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add custom habit */}
          <div className="pd-habit-add-section">
            <h4 className="pd-habit-add-title">Add Custom Maritime Habit</h4>
            <div className="pd-habit-add-row">
              <input
                className="pd-input pd-habit-add-input"
                placeholder="e.g., Daily Equipment Safety Check"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
              />
              <button type="button" className="pd-habit-add-btn" onClick={addHabit} aria-label="Add habit">
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PerfectDaySchedulePage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("day-planner");

const navigation = useMemo(() => ({
  ...homePageMockData.navigation,
  activeTab: "perfect-day",
}), []);

  useEffect(() => {
    async function loadPage() {
      try {
        const data = await getPerfectDaySchedule();
        setPageData(data);
        setItems(data.scheduleSection.items);
        setActiveTab(data.planner.activeTab);
      } catch (err) {
        console.error("Failed to load perfect day schedule", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  function handleToggle(id) {
    setItems((prev) => prev.map((it) => it.id === id ? { ...it, completed: !it.completed } : it));
  }

  const headerData = pageData?.header || homePageMockData?.header;

  if (loading) {
    return (
      <div className="app-shell pd-shell">
        <AppHeader header={headerData} />
        <main className="pd-page"><div className="pd-loading">Loading...</div></main>
        <BottomNav navigation={navigation} />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="app-shell pd-shell">
        <AppHeader header={headerData} />
        <main className="pd-page"><div className="pd-loading">Unable to load page.</div></main>
        <BottomNav navigation={navigation} />
      </div>
    );
  }

  const total = items.length;
  const completedCount = items.filter((i) => i.completed).length;
  const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const liveSummaryCards = [
    { type: "total",     title: "Total Activities", value: String(total) },
    { type: "completed", title: "Completed",         value: String(completedCount) },
    { type: "progress",  title: "Progress",          value: `${pct}%` },
  ];

  return (
    <div className="app-shell pd-shell">
      <AppHeader header={{ ...pageData.header, progressBadge: `${pct}% Complete` }} />

      <main className="pd-page">
        <div className="pd-page-inner">

          {/* Hero row */}
          <section className="pd-hero">
            <div className="pd-hero-head">
              <div>
                <h2 className="pd-page-title">{pageData.planner.title}</h2>
                <p className="pd-page-subtitle">{pageData.planner.subtitle}</p>
              </div>
              <div className="pd-top-badge">
                <Star size={12} strokeWidth={2.2} />
                <span>{pct}% Complete</span>
              </div>
            </div>
            <PlannerTabs
              tabs={pageData.planner.tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </section>

          {/* ── Day Planner tab ── */}
          {activeTab === "day-planner" && (
            <>
              <section className="pd-card">
                <div className="pd-card-header">
                  <div className="pd-card-title-row">
                    <Target className="pd-card-title-icon" size={20} strokeWidth={2} />
                    <span className="pd-card-title">{pageData.planner.focusTitle}</span>
                  </div>
                  <p className="pd-card-subtitle">{pageData.planner.focusSubtitle}</p>
                </div>
                <div className="pd-card-body">
                  <div className="pd-field-group">
                    <label className="pd-label" htmlFor="daily-goal">{pageData.planner.dailyGoalLabel}</label>
                    <input id="daily-goal" className="pd-input" placeholder={pageData.planner.dailyGoalPlaceholder} />
                  </div>
                  <SummaryCards cards={liveSummaryCards} />
                </div>
              </section>

              <ScheduleSection
                scheduleSection={{ ...pageData.scheduleSection, items }}
                onToggle={handleToggle}
              />
            </>
          )}

          {/* ── Maritime Habits tab ── */}
          {activeTab === "habits" && <MaritimeHabitsTab />}

          {/* ── Templates tab placeholder ── */}
          {activeTab === "templates" && (
            <div className="pd-card pd-tab-placeholder">
              <p>Templates coming soon.</p>
            </div>
          )}

          {/* ── Analytics tab placeholder ── */}
          {activeTab === "analytics" && (
            <div className="pd-card pd-tab-placeholder">
              <p>Analytics coming soon.</p>
            </div>
          )}

        </div>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default PerfectDaySchedulePage;