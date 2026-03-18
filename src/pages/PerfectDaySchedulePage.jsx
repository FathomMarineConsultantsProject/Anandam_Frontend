// src/pages/PerfectDaySchedulePage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Target, Calendar, Clock, CheckCircle2, Award, Star,
  Anchor, Heart, Utensils, BookOpen, Phone, Waves, Dumbbell,
  Bell, Activity, TriangleAlert, Zap, TrendingUp,
  Shield, Plus, Waves as WavesIcon, ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getPerfectDaySchedule,
  getPerfectDayAnalytics,
  getPerfectDayHabits,
  getPerfectDayTemplates,
  applyPerfectDayTemplate,
  togglePerfectDayActivity,
  createPerfectDayHabit,
  togglePerfectDayHabit,
  deletePerfectDayHabit,
} from "../api/perfectDayApi";
import { homePageMockData } from "../data/homeData";
// ── Use the shared BottomNav (auto-highlights from URL via useLocation) ──
import BottomNav from "../components/layout/BottomNav";
import AppHeader from "../components/layout/AppHeader";
import "../styles/perfect-day-schedule.css";

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

function getHabitBadgeClass(cat) {
  const map = {
    safety: "habit-safety", professional: "habit-professional",
    wellness: "habit-wellness", social: "habit-social",
    mindfulness: "habit-mindfulness", skills: "habit-skills",
    nutrition: "habit-nutrition",
  };
  return map[cat] || "";
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef(null);

  const targetDate = new Date().toISOString().slice(0, 10);

  async function loadHabits() {
    try {
      setLoading(true);
      const response = await getPerfectDayHabits(targetDate);
      setHabits(response.habits || []);
    } catch (error) {
      console.error("Failed to load habits", error);
      setHabits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  async function toggleHabit(id) {
    const currentHabit = habits.find((h) => h.id === id);
    if (!currentHabit) return;

    const nextCompleted = !currentHabit.completed;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completed: nextCompleted,
              doneCount: nextCompleted ? 1 : 0,
            }
          : h
      )
    );

    try {
      const response = await togglePerfectDayHabit(id, targetDate);
      const isCompleted = !!response?.isCompleted;

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                completed: isCompleted,
                doneCount: isCompleted ? 1 : 0,
              }
            : h
        )
      );

      if (isCompleted) {
        setToastVisible(true);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastVisible(false), 5000);
      } else {
        setToastVisible(false);
        if (toastTimer.current) clearTimeout(toastTimer.current);
      }
    } catch (error) {
      console.error("Failed to toggle habit", error);

      setHabits((prev) =>
        prev.map((h) =>
          h.id === id
            ? {
                ...h,
                completed: currentHabit.completed,
                doneCount: currentHabit.completed ? 1 : 0,
              }
            : h
        )
      );

      alert(error.message || "Failed to update habit");
    }
  }

  async function addHabit() {
    const trimmed = newHabit.trim();
    if (!trimmed) return;

    try {
      await createPerfectDayHabit({
        title: trimmed,
        category: "Training",
      });

      setNewHabit("");
      await loadHabits();
    } catch (error) {
      console.error("Failed to create habit", error);
      alert(error.message || "Failed to create habit");
    }
  }

  async function removeHabit(id) {
    try {
      await deletePerfectDayHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (error) {
      console.error("Failed to delete habit", error);
      alert(error.message || "Failed to delete habit");
    }
  }

  const activeCount = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const successPct = activeCount > 0 ? Math.round((completedToday / activeCount) * 100) : 0;

  if (loading) {
    return (
      <div className="pd-card pd-tab-placeholder">
        <p>Loading habits...</p>
      </div>
    );
  }

  return (
    <>
      <HabitToast visible={toastVisible} />

      <section className="pd-card">
        <div className="pd-card-header">
          <div className="pd-card-title-row">
            <Zap className="pd-card-title-icon" size={20} strokeWidth={2} />
            <span className="pd-card-title">Maritime Habit Builder</span>
          </div>
          <p className="pd-card-subtitle">Build lasting habits for maritime wellness and professional excellence</p>
        </div>

        <div className="pd-card-body">
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

          <div className="pd-habit-list">
            {habits.map((habit) => {
              const Icon = getHabitIcon(habit.icon);
              const pct = habit.targetCount > 0
                ? Math.min(100, Math.round((habit.doneCount / habit.targetCount) * 100))
                : 0;
              const daysLabel = `${habit.doneCount}/${habit.targetCount} days`;

              return (
                <div key={habit.id} className={`pd-habit-row ${habit.completed ? "completed" : ""}`}>
                  <div className="pd-habit-top">
                    <div className="pd-habit-left">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={habit.completed}
                        className={`pd-check ${habit.completed ? "checked" : ""}`}
                        onClick={() => toggleHabit(habit.id)}
                      />
                      <Icon className="pd-habit-icon" size={20} strokeWidth={2} />
                      <div>
                        <p className={`pd-habit-title${habit.completed ? " green" : ""}`}>
                          {habit.title}
                        </p>
                        <div className="pd-habit-meta">
                          <span>{daysLabel}</span>
                          <span className={`pd-habit-badge ${getHabitBadgeClass(habit.category)}`}>
                            {habit.categoryLabel || habit.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="pd-habit-right"
                      style={{ display: "flex", alignItems: "center", gap: "10px" }}
                    >
                      <div>
                        <p className="pd-habit-pct">{pct}%</p>
                        <p className="pd-habit-pct-label">Target Progress</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeHabit(habit.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "18px",
                          lineHeight: 1,
                        }}
                        aria-label="Delete habit"
                        title="Delete habit"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="pd-habit-bar">
                    <div
                      className="pd-habit-bar-fill"
                      style={{ transform: `translateX(${pct - 100}%)` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

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
              <button
                type="button"
                className="pd-habit-add-btn"
                onClick={addHabit}
                aria-label="Add habit"
              >
                <Plus size={18} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


function getTplIcon(icon) {
  const map = {
    heart: Heart, utensils: Utensils, dumbbell: Dumbbell,
    anchor: Anchor, book: BookOpen, phone: Phone, waves: Waves,
  };
  const Icon = map[icon] || Calendar;
  return <Icon size={14} strokeWidth={2} className="tpl-act-icon" />;
}

function TemplatesTab({ onTemplateApplied }) {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [applied, setApplied] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const data = await getPerfectDayTemplates();
        setTemplates(data);
      } catch (error) {
        console.error("Failed to load templates", error);
      } finally {
        setLoading(false);
      }
    }

    loadTemplates();
  }, []);

  const dropOptions = [
    { value: "", label: "Select a perfect day template" },
    ...templates.map((t) => ({ value: t.id, label: t.name })),
  ];

  async function handleApply(templateId) {
    try {
      const targetDate = new Date().toISOString().slice(0, 10);
      await applyPerfectDayTemplate(templateId, targetDate);
      setApplied(templateId);
      if (onTemplateApplied) {
        await onTemplateApplied(targetDate);
      }
      setTimeout(() => setApplied(null), 3000);
    } catch (error) {
      console.error("Failed to apply template", error);
      alert(error.message || "Failed to apply template");
    }
  }

  function splitActivities(acts) {
    const left = [];
    const right = [];
    acts.forEach((a, i) => (i % 2 === 0 ? left : right).push(a));
    return { left, right };
  }

  if (loading) {
    return (
      <div className="pd-card pd-tab-placeholder">
        <p>Loading templates...</p>
      </div>
    );
  }

  return (
    <section className="pd-card">
      <div className="pd-card-header">
        <div className="pd-card-title-row">
          <WavesIcon className="pd-card-title-icon" size={20} strokeWidth={2} />
          <span className="pd-card-title">Perfect Day Templates</span>
        </div>
        <p className="pd-card-subtitle">Pre-designed routines for different maritime scenarios</p>
      </div>

      <div className="pd-card-body">
        <div className="tpl-field-group">
          <label className="pd-label">Choose a Template</label>
          <div className="tpl-dropdown" onClick={() => setDropOpen((p) => !p)}>
            <span className={`tpl-dropdown-value ${!selected ? "placeholder" : ""}`}>
              {selected ? templates.find((t) => t.id === selected)?.name : "Select a perfect day template"}
            </span>
            <ChevronDown size={16} strokeWidth={2} className={`tpl-dropdown-chevron ${dropOpen ? "open" : ""}`} />
            {dropOpen && (
              <div className="tpl-dropdown-menu">
                {dropOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    className={`tpl-dropdown-item ${selected === o.value ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(o.value);
                      setDropOpen(false);
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="tpl-fitness-banner">
          <div className="tpl-fitness-banner-title">
            <Activity size={16} strokeWidth={2} className="tpl-fitness-banner-icon" />
            <span>Fitness Integration</span>
          </div>
          <div className="tpl-fitness-chips">
            <span className="tpl-chip"><Dumbbell size={13} strokeWidth={2} /> Physical Fitness</span>
            <span
              className="tpl-chip"
              style={{ cursor: "pointer" }}
              onClick={() =>
                window.open(
                  "https://web.monkify.app/category?id=10&name=Meditations",
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <Heart size={13} strokeWidth={2} /> Yoga &amp; Stretching
            </span>
          </div>
          <p className="tpl-fitness-note">
            Use the template that best matches your maritime schedule for the day.
          </p>
        </div>

        <div className="tpl-card-list">
          {templates.map((tpl) => {
            const { left, right } = splitActivities(tpl.activities || []);
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

                <div className="tpl-act-grid">
                  <div className="tpl-act-col">
                    {left.map((act, i) => (
                      <div key={i} className="tpl-act-row">
                        {getTplIcon(act.icon)}
                        <span className="tpl-act-text">
                          <span className="tpl-act-time">{act.time}</span>{" - "}{act.title}
                          {act.category && <span className="tpl-act-badge">{act.category}</span>}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="tpl-act-col">
                    {right.map((act, i) => (
                      <div key={i} className="tpl-act-row">
                        {getTplIcon(act.icon)}
                        <span className="tpl-act-text">
                          <span className="tpl-act-time">{act.time}</span>{" - "}{act.title}
                          {act.category && <span className="tpl-act-badge">{act.category}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {tpl.extraCount > 0 && <p className="tpl-more">+{tpl.extraCount} more activities...</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
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
    getPerfectDayAnalytics().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="pd-card pd-tab-placeholder"><p>Loading analytics...</p></div>;
  if (!data) return <div className="pd-card pd-tab-placeholder"><p>Unable to load analytics.</p></div>;

  const { dailyProgress, habitStreaks, activityCategories, fitnessIntegration, insight } = data;
  const dailyPct = dailyProgress.total > 0
    ? Math.round((dailyProgress.completed / dailyProgress.total) * 100)
    : 0;

  return (
    <section className="pd-card">
      <div className="pd-card-header">
        <div className="pd-card-title-row">
          <TrendingUp className="pd-card-title-icon" size={20} strokeWidth={2} />
          <span className="pd-card-title">Perfect Day Analytics</span>
        </div>
        <p className="pd-card-subtitle">Track your progress toward maritime wellness excellence</p>
      </div>
      <div className="pd-card-body">
        <div className="anl-top-panels">
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

        <div className="anl-fitness-panel">
          <div className="anl-fitness-top">
            <div className="anl-fitness-title-row">
              <Dumbbell size={16} strokeWidth={2} className="anl-fitness-icon" />
              <span className="anl-fitness-title">Fitness Integration</span>
            </div>
            <button type="button" className="anl-fitness-btn">
              <Activity size={14} strokeWidth={2} /> Open Fitness Hub
            </button>
          </div>
          <div className="anl-fitness-stats">
            <span className="anl-fitness-stat">
              <span className="anl-dot green" /> Daily fitness activities: {fitnessIntegration.dailyFitnessActivities}
            </span>
            <span className="anl-fitness-stat">
              <span className="anl-dot blue" /> Fitness habits: {fitnessIntegration.fitnessHabits}
            </span>
          </div>
        </div>

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

  // Navigation – pass items so BottomNav knows all routes.
  // Active highlight is derived from the URL inside BottomNav automatically.
  const navigation = useMemo(() => ({
    ...homePageMockData.navigation,
    // activeTab prop is ignored by the updated BottomNav (it uses useLocation),
    // but we keep it here as a safe fallback value.
    activeTab: "perfect-day",
  }), []);

  useEffect(() => {
    async function loadPage() {
      try {
        await reloadSchedule();
      } catch (err) {
        console.error("Failed to load perfect day schedule", err);
      } finally {
        setLoading(false);
      }
    }
    loadPage();
  }, []);

  async function reloadSchedule(targetDate = new Date().toISOString().slice(0, 10)) {
    try {
      const data = await getPerfectDaySchedule(targetDate);
      setPageData(data);
      setItems(data.scheduleSection.items || []);
      setActiveTab("day-planner");
    } catch (error) {
      console.error("Failed to reload schedule", error);
    }
  }

  async function handleToggle(id) {
    const currentItem = items.find((it) => it.id === id);
    if (!currentItem) return;

    const nextCompleted = !currentItem.completed;

    // optimistic UI
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, completed: nextCompleted } : it
      )
    );

    try {
      await togglePerfectDayActivity(id, nextCompleted);
    } catch (error) {
      console.error("Failed to update activity", error);

      // rollback
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, completed: currentItem.completed } : it
        )
      );

      alert(error.message || "Failed to update activity");
    }
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
    { type: "total", title: "Total Activities", value: String(total) },
    { type: "completed", title: "Completed", value: String(completedCount) },
    { type: "progress", title: "Progress", value: `${pct}%` },
  ];

  return (
    <div className="app-shell pd-shell">
      <AppHeader header={{ ...pageData.header, progressBadge: `${pct}% Complete` }} />

      <main className="pd-page">
        <div className="pd-page-inner">
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

          {activeTab === "habits" && <MaritimeHabitsTab />}
          {activeTab === "templates" && <TemplatesTab onTemplateApplied={reloadSchedule} />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default PerfectDaySchedulePage;