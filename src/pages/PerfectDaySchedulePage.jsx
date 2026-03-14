// src/pages/PerfectDaySchedulePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Target, Calendar, Clock, CheckCircle2, Award, Star,
  Anchor, Heart, Utensils, BookOpen, Phone, Waves, Dumbbell,
  Bell, House, Activity, TriangleAlert, Zap, TrendingUp,
  Shield, Plus, Waves as WavesIcon, ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPerfectDaySchedule, getPerfectDayAnalytics, getPerfectDayHabits } from "../api/perfectDayApi";
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
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef(null);

  // Load habits from API on mount
  useEffect(() => {
    getPerfectDayHabits().then(setHabits).catch(console.error);
  }, []);

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

// ─── Templates Tab Data ───────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "port",
    name: "Perfect Port Day",
    description: "Optimized for days in port with shore activities",
    activities: [
      { time: "07:00", title: "Port Morning Routine",         icon: "heart",    category: null     },
      { time: "08:00", title: "Shore Breakfast",              icon: "utensils", category: null     },
      { time: "09:00", title: "Port Exploration Walking Tour",icon: "dumbbell", category: "Fitness"},
      { time: "12:00", title: "Local Cuisine Experience",     icon: "utensils", category: null     },
      { time: "14:00", title: "Cultural Learning",            icon: "book",     category: null     },
      { time: "16:00", title: "Port Shopping Walk",           icon: "dumbbell", category: "Fitness"},
    ],
    extraCount: 2,
  },
  {
    id: "sea",
    name: "Perfect Sea Day",
    description: "Ideal routine for days at sea with long voyages",
    activities: [
      { time: "06:00", title: "Morning Watch Duties",         icon: "anchor",   category: null  },
      { time: "06:30", title: "Ocean Sunrise Meditation",     icon: "heart",    category: null  },
      { time: "07:30", title: "Maritime Breakfast",           icon: "utensils", category: null  },
      { time: "08:30", title: "Navigation & Weather Check",   icon: "anchor",   category: null  },
      { time: "10:00", title: "Equipment Maintenance",        icon: "anchor",   category: null  },
      { time: "12:00", title: "Midday Meal",                  icon: "utensils", category: null  },
    ],
    extraCount: 6,
  },
  {
    id: "wellness",
    name: "Perfect Wellness Day",
    description: "Focus on mental and physical health recovery",
    activities: [
      { time: "07:00", title: "Gentle Morning Stretching",    icon: "dumbbell", category: "Fitness"},
      { time: "07:30", title: "Nutritious Breakfast",         icon: "utensils", category: null    },
      { time: "08:30", title: "Mindfulness & Breathing",      icon: "heart",    category: null    },
      { time: "09:30", title: "Light Duty Work",              icon: "anchor",   category: null    },
      { time: "12:30", title: "Healthy Lunch & Rest",         icon: "utensils", category: null    },
      { time: "14:00", title: "Creative Activities",          icon: "heart",    category: null    },
    ],
    extraCount: 6,
  },
  {
    id: "fitness",
    name: "Perfect Fitness Day",
    description: "Maritime fitness and physical wellness focused routine",
    activities: [
      { time: "06:00", title: "Morning Warm-up & Stretching", icon: "dumbbell", category: "Fitness"},
      { time: "06:30", title: "Protein-Rich Breakfast",       icon: "utensils", category: null    },
      { time: "07:30", title: "Deck Cardio Workout",          icon: "dumbbell", category: "Fitness"},
      { time: "09:00", title: "Work Duties",                  icon: "anchor",   category: null    },
      { time: "12:00", title: "Post-Workout Meal",            icon: "utensils", category: null    },
      { time: "13:30", title: "Active Recovery Walk",         icon: "dumbbell", category: "Fitness"},
    ],
    extraCount: 6,
  },
];

// icon renderer for template activity rows
function getTplIcon(icon) {
  const map = {
    heart: Heart, utensils: Utensils, dumbbell: Dumbbell,
    anchor: Anchor, book: BookOpen, phone: Phone, waves: Waves,
  };
  const Icon = map[icon] || Calendar;
  return <Icon size={14} strokeWidth={2} className="tpl-act-icon" />;
}

// ─── Templates Tab ────────────────────────────────────────────────────────────
function TemplatesTab() {
  const [selected, setSelected] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [applied, setApplied] = useState(null);

  const dropOptions = [
    { value: "", label: "Select a perfect day template" },
    ...TEMPLATES.map((t) => ({ value: t.id, label: t.name })),
  ];

  function handleApply(templateId) {
    setApplied(templateId);
    setTimeout(() => setApplied(null), 3000);
  }

  // Left/right split: first 3 go left col, next 3 go right col (2-col grid)
  function splitActivities(acts) {
    const left = [];
    const right = [];
    acts.forEach((a, i) => (i % 2 === 0 ? left : right).push(a));
    return { left, right };
  }

  return (
    <section className="pd-card">
      {/* Header */}
      <div className="pd-card-header">
        <div className="pd-card-title-row">
          <WavesIcon className="pd-card-title-icon" size={20} strokeWidth={2} />
          <span className="pd-card-title">Perfect Day Templates</span>
        </div>
        <p className="pd-card-subtitle">Pre-designed routines for different maritime scenarios</p>
      </div>

      <div className="pd-card-body">

        {/* ── Dropdown ── */}
        <div className="tpl-field-group">
          <label className="pd-label">Choose a Template</label>
          <div className="tpl-dropdown" onClick={() => setDropOpen((p) => !p)}>
            <span className={`tpl-dropdown-value ${!selected ? "placeholder" : ""}`}>
              {selected ? TEMPLATES.find((t) => t.id === selected)?.name : "Select a perfect day template"}
            </span>
            <ChevronDown size={16} strokeWidth={2} className={`tpl-dropdown-chevron ${dropOpen ? "open" : ""}`} />
            {dropOpen && (
              <div className="tpl-dropdown-menu">
                {dropOptions.map((o) => (
                  <button key={o.value} type="button"
                    className={`tpl-dropdown-item ${selected === o.value ? "active" : ""}`}
                    onClick={(e) => { e.stopPropagation(); setSelected(o.value); setDropOpen(false); }}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Fitness Integration banner ── */}
        <div className="tpl-fitness-banner">
          <div className="tpl-fitness-banner-title">
            <Activity size={16} strokeWidth={2} className="tpl-fitness-banner-icon" />
            <span>Fitness Integration</span>
          </div>
          <div className="tpl-fitness-chips">
            <span className="tpl-chip">
              <Dumbbell size={13} strokeWidth={2} />
              Physical Fitness
            </span>
            <span className="tpl-chip">
              <Heart size={13} strokeWidth={2} />
              Yoga &amp; Stretching
            </span>
          </div>
          <p className="tpl-fitness-note">
            Use the "Perfect Fitness Day" template to integrate comprehensive maritime fitness routines.
          </p>
        </div>

        {/* ── Template cards ── */}
        <div className="tpl-card-list">
          {TEMPLATES.map((tpl) => {
            const { left, right } = splitActivities(tpl.activities);
            const isApplied = applied === tpl.id;
            return (
              <div key={tpl.id} className="tpl-card">
                <div className="tpl-card-top">
                  <div>
                    <p className="tpl-card-name">{tpl.name}</p>
                    <p className="tpl-card-desc">{tpl.description}</p>
                  </div>
                  <button
                    type="button"
                    className={`tpl-apply-btn ${isApplied ? "applied" : ""}`}
                    onClick={() => handleApply(tpl.id)}
                  >
                    {isApplied ? "Applied!" : "Apply Template"}
                  </button>
                </div>

                {/* 2-col activity grid */}
                <div className="tpl-act-grid">
                  <div className="tpl-act-col">
                    {left.map((act, i) => (
                      <div key={i} className="tpl-act-row">
                        {getTplIcon(act.icon)}
                        <span className="tpl-act-text">
                          <span className="tpl-act-time">{act.time}</span>
                          {" - "}
                          {act.title}
                          {act.category && (
                            <span className="tpl-act-badge">{act.category}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="tpl-act-col">
                    {right.map((act, i) => (
                      <div key={i} className="tpl-act-row">
                        {getTplIcon(act.icon)}
                        <span className="tpl-act-text">
                          <span className="tpl-act-time">{act.time}</span>
                          {" - "}
                          {act.title}
                          {act.category && (
                            <span className="tpl-act-badge">{act.category}</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {tpl.extraCount > 0 && (
                  <p className="tpl-more">+{tpl.extraCount} more activities...</p>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
// Icon map for activity category cards
function getCatIcon(icon) {
  const map = {
    heart: Heart, utensils: Utensils, dumbbell: Dumbbell,
    book: BookOpen, phone: Phone, anchor: Anchor, waves: Waves,
  };
  const Icon = map[icon] || Activity;
  return <Icon size={22} strokeWidth={1.8} className="anl-cat-icon" />;
}

function AnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPerfectDayAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="pd-card pd-tab-placeholder">
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="pd-card pd-tab-placeholder">
        <p>Unable to load analytics.</p>
      </div>
    );
  }

  const { dailyProgress, habitStreaks, activityCategories, fitnessIntegration, insight } = data;

  // Progress bar transform for daily activities
  const dailyPct = dailyProgress.total > 0
    ? Math.round((dailyProgress.completed / dailyProgress.total) * 100)
    : 0;

  return (
    <section className="pd-card">
      {/* ── Card header ── */}
      <div className="pd-card-header">
        <div className="pd-card-title-row">
          <TrendingUp className="pd-card-title-icon" size={20} strokeWidth={2} />
          <span className="pd-card-title">Perfect Day Analytics</span>
        </div>
        <p className="pd-card-subtitle">Track your progress toward maritime wellness excellence</p>
      </div>

      <div className="pd-card-body">

        {/* ── Top 2-col panel row ── */}
        <div className="anl-top-panels">

          {/* Daily Progress */}
          <div className="anl-panel blue">
            <div className="anl-panel-title-row">
              <Calendar size={16} strokeWidth={2} className="anl-panel-icon blue" />
              <span className="anl-panel-title">Daily Progress</span>
            </div>
            <div className="anl-panel-row">
              <span className="anl-panel-label">Activities</span>
              <span className="anl-panel-value">{dailyProgress.completed}/{dailyProgress.total}</span>
            </div>
            <div className="anl-bar-wrap">
              <div className="anl-bar">
                <div className="anl-bar-fill" style={{ transform: `translateX(${dailyPct - 100}%)` }} />
              </div>
            </div>
            <p className="anl-panel-note">{dailyProgress.motivationText}</p>
          </div>

          {/* Habit Streaks */}
          <div className="anl-panel green">
            <div className="anl-panel-title-row">
              <Zap size={16} strokeWidth={2} className="anl-panel-icon green" />
              <span className="anl-panel-title">Habit Streaks</span>
            </div>
            <div className="anl-panel-row">
              <span className="anl-panel-label">Completed</span>
              <span className="anl-panel-value">{habitStreaks.completed}/{habitStreaks.total}</span>
            </div>
            <div className="anl-bar-wrap">
              <div className="anl-bar">
                <div className="anl-bar-fill" style={{ transform: `translateX(${habitStreaks.progressPct - 100}%)` }} />
              </div>
            </div>
            <p className="anl-panel-note">Average streak: {habitStreaks.averageStreakDays} days</p>
          </div>

        </div>

        {/* ── Activity Categories ── */}
        <div className="anl-section">
          <h4 className="anl-section-title">Activity Categories</h4>
          <div className="anl-cat-grid">
            {activityCategories.map((cat) => (
              <div key={cat.id} className="anl-cat-card">
                {getCatIcon(cat.icon)}
                <p className="anl-cat-label">{cat.label}</p>
                <p className="anl-cat-count">{cat.count}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fitness Integration panel ── */}
        <div className="anl-fitness-panel">
          <div className="anl-fitness-top">
            <div className="anl-fitness-title-row">
              <Dumbbell size={16} strokeWidth={2} className="anl-fitness-icon" />
              <span className="anl-fitness-title">Fitness Integration</span>
            </div>
            <button type="button" className="anl-fitness-btn">
              <Activity size={14} strokeWidth={2} />
              Open Fitness Hub
            </button>
          </div>
          <div className="anl-fitness-stats">
            <span className="anl-fitness-stat">
              <span className="anl-dot green" />
              Daily fitness activities: {fitnessIntegration.dailyFitnessActivities}
            </span>
            <span className="anl-fitness-stat">
              <span className="anl-dot blue" />
              Fitness habits: {fitnessIntegration.fitnessHabits}
            </span>
          </div>
        </div>

        {/* ── Perfect Day Insights ── */}
        <div className="anl-insight-panel">
          <div className="anl-insight-title-row">
            <Star size={16} strokeWidth={2} className="anl-insight-icon" />
            <span className="anl-insight-title">Perfect Day Insights</span>
          </div>
          <p className="anl-insight-text">{insight.text}</p>
        </div>

      </div>
    </section>
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
    activeTab: "calendar",
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

          {/* ── Templates tab ── */}
          {activeTab === "templates" && <TemplatesTab />}

          {/* ── Analytics tab ── */}
          {activeTab === "analytics" && <AnalyticsTab />}

        </div>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default PerfectDaySchedulePage;