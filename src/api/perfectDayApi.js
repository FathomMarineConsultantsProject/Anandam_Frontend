// src/api/perfectDayApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the Perfect Day page.
// Analytics are DERIVED from the schedule items and habits data —
// no duplication. When a real backend exists, replace the return
// value of getPerfectDaySchedule() with a fetch() call and keep
// the same shape. getAnalytics() can also become a separate endpoint.
// ─────────────────────────────────────────────────────────────────────────────

const SCHEDULE_ITEMS = [
  { id: "1", icon: "heart",    title: "Port Morning Routine",          time: "07:00", duration: "60 minutes",  category: "wellness",  completed: false },
  { id: "2", icon: "utensils", title: "Shore Breakfast",               time: "08:00", duration: "45 minutes",  category: "nutrition", completed: false },
  { id: "3", icon: "dumbbell", title: "Port Exploration Walking Tour", time: "09:00", duration: "180 minutes", category: "fitness",   completed: false },
  { id: "4", icon: "utensils", title: "Local Cuisine Experience",      time: "12:00", duration: "90 minutes",  category: "nutrition", completed: false },
  { id: "5", icon: "book",     title: "Cultural Learning",             time: "14:00", duration: "120 minutes", category: "learning",  completed: false },
  { id: "6", icon: "dumbbell", title: "Port Shopping Walk",            time: "16:00", duration: "60 minutes",  category: "fitness",   completed: false },
  { id: "7", icon: "dumbbell", title: "Harbor Sunset Yoga",            time: "18:00", duration: "45 minutes",  category: "fitness",   completed: false },
  { id: "8", icon: "phone",    title: "Social Dinner with Crew",       time: "20:00", duration: "90 minutes",  category: "social",    completed: false },
];

const HABITS_DATA = [
  { id: "h1", icon: "shield",       title: "Daily Sea Safety Check",           doneCount: 15, targetCount: 21, category: "safety",       completed: true  },
  { id: "h2", icon: "target",       title: "Bridge Communication Log",         doneCount: 12, targetCount: 30, category: "professional", completed: true  },
  { id: "h3", icon: "target",       title: "Weather Observation Notes",        doneCount:  8, targetCount: 14, category: "professional", completed: false },
  { id: "h4", icon: "heart",        title: "Physical Fitness - Maritime Yoga", doneCount:  6, targetCount: 10, category: "wellness",     completed: false },
  { id: "h5", icon: "phone",        title: "Family Video Call",                doneCount: 20, targetCount: 30, category: "social",       completed: true  },
  { id: "h6", icon: "heart",        title: "Mindful Ocean Watching",           doneCount:  4, targetCount:  7, category: "mindfulness",  completed: false },
  { id: "h7", icon: "trending-up",  title: "Navigation Skills Practice",       doneCount:  9, targetCount: 21, category: "skills",       completed: false },
  { id: "h8", icon: "utensils",     title: "Healthy Maritime Meals",           doneCount: 11, targetCount: 14, category: "nutrition",    completed: true  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Count items by category */
function countByCategory(items) {
  return items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
}

/** Average doneCount across all habits */
function averageStreak(habits) {
  if (!habits.length) return 0;
  const total = habits.reduce((sum, h) => sum + h.doneCount, 0);
  return Math.round(total / habits.length);
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getPerfectDaySchedule() {
  // TODO: replace with → const res = await fetch("/api/perfect-day/schedule");
  //                       return res.json();
  return {
    header: {
      appName: "Anandam by Fathom",
      appSubtitle: "Wellness for Seafarers",
      userInitials: "NC",
      progressBadge: "0% Complete",
    },

    planner: {
      title: "Perfect Day Planner",
      subtitle: "Design your ideal maritime day with balanced wellness and productivity",
      tabs: [
        { id: "day-planner", label: "Day Planner"     },
        { id: "habits",      label: "Maritime Habits" },
        { id: "templates",   label: "Templates"       },
        { id: "analytics",   label: "Analytics"       },
      ],
      activeTab: "day-planner",
      focusTitle:          "Today's Focus",
      focusSubtitle:       "Set your main intention for the day",
      dailyGoalLabel:      "Daily Goal",
      dailyGoalPlaceholder: "e.g., Maintain calm seas mindset during navigation",
      summaryCards: [
        { type: "total",     title: "Total Activities", value: String(SCHEDULE_ITEMS.length) },
        { type: "completed", title: "Completed",         value: "0"  },
        { type: "progress",  title: "Progress",          value: "0%" },
      ],
    },

    scheduleSection: {
      title:            "Daily Schedule",
      subtitle:         "Your perfectly planned maritime day",
      progressPercent:  0,
      completedText:    `0 of ${SCHEDULE_ITEMS.length} activities completed`,
      items:            SCHEDULE_ITEMS,
    },
  };
}

export async function getPerfectDayHabits() {
  // TODO: replace with → const res = await fetch("/api/perfect-day/habits");
  //                       return res.json();
  return HABITS_DATA;
}

export async function getPerfectDayAnalytics() {
  // TODO: replace with → const res = await fetch("/api/perfect-day/analytics");
  //                       return res.json();
  //
  // For now we derive everything from local data so there is no duplication.
  // The returned shape is the single contract the AnalyticsTab component reads.

  const completedItems   = SCHEDULE_ITEMS.filter((i) => i.completed);
  const completedHabits  = HABITS_DATA.filter((h) => h.completed);
  const categoryCounts   = countByCategory(SCHEDULE_ITEMS);
  const fitnessItems     = SCHEDULE_ITEMS.filter((i) => i.category === "fitness");
  const fitnessHabitCount = HABITS_DATA.filter((h) =>
    ["wellness", "mindfulness", "skills"].includes(h.category)
  ).length;

  // Category display order + icons
  const CATEGORY_META = [
    { id: "wellness",  icon: "heart",    label: "Wellness"  },
    { id: "nutrition", icon: "utensils", label: "Nutrition" },
    { id: "fitness",   icon: "dumbbell", label: "Fitness"   },
    { id: "learning",  icon: "book",     label: "Learning"  },
    { id: "social",    icon: "phone",    label: "Social"    },
  ];

  return {
    dailyProgress: {
      completed:       completedItems.length,
      total:           SCHEDULE_ITEMS.length,
      motivationText:  completedItems.length === 0
        ? "Keep going!"
        : completedItems.length === SCHEDULE_ITEMS.length
          ? "Perfect day achieved! 🎉"
          : `${SCHEDULE_ITEMS.length - completedItems.length} activities left — you've got this!`,
    },

    habitStreaks: {
      completed:        completedHabits.length,
      total:            HABITS_DATA.length,
      progressPct:      HABITS_DATA.length > 0
        ? Math.round((completedHabits.length / HABITS_DATA.length) * 100)
        : 0,
      averageStreakDays: averageStreak(HABITS_DATA),
    },

    activityCategories: CATEGORY_META
      .filter((m) => categoryCounts[m.id] > 0)
      .map((m) => ({ ...m, count: categoryCounts[m.id] })),

    fitnessIntegration: {
      dailyFitnessActivities: fitnessItems.length,
      fitnessHabits:          fitnessHabitCount,
    },

    insight: {
      text: completedItems.length === 0
        ? "Every perfect day starts with one completed activity. Focus on small wins and build momentum gradually."
        : `Great work! You've completed ${completedItems.length} of ${SCHEDULE_ITEMS.length} activities today.`,
    },
  };
}