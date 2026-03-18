import { apiRequest } from "./client";

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

function formatTimeFromISO(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getIconFromCategory(category) {
  const normalized = String(category || "").toLowerCase();

  const map = {
    work: "anchor",
    wellness: "heart",
    nutrition: "utensils",
    learning: "book",
    social: "phone",
    fitness: "dumbbell",
    safety: "shield",
    professional: "target",
    mindfulness: "heart",
    skills: "trending-up",
    training: "target",
    health: "heart",
  };

  return map[normalized] || "target";
}

function getHabitCategoryClass(category) {
  const normalized = String(category || "").toLowerCase();
  const known = [
    "safety",
    "professional",
    "wellness",
    "social",
    "mindfulness",
    "skills",
    "nutrition",
  ];
  return known.includes(normalized) ? normalized : "professional";
}

function prettifyCategory(category) {
  if (!category) return "Professional";
  const normalized = String(category).toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function mapPlanActivity(activity) {
  return {
    id: activity.id,
    icon: getIconFromCategory(activity.category),
    title: activity.title,
    time: formatTimeFromISO(activity.startTime),
    duration: `${activity.durationMinutes} minutes`,
    category: String(activity.category || "").toLowerCase(),
    completed: !!activity.isCompleted,
  };
}

function mapTemplateActivity(activity, index) {
  return {
    id: `${activity.title}-${index}`,
    time: activity.time,
    title: activity.title,
    icon: getIconFromCategory(activity.category),
    category: activity.category
      ? activity.category.charAt(0).toUpperCase() + activity.category.slice(1)
      : null,
  };
}

function buildPlannerPayload(items = []) {
  const completedCount = items.filter((item) => item.completed).length;
  const total = items.length;
  const progressPercent =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return {
    header: {
      appName: "Anandüm by Fathom",
      appSubtitle: "Wellness for Seafarers",
      userInitials: "NC",
      progressBadge: `${progressPercent}% Complete`,
    },
    planner: {
      title: "Perfect Day Planner",
      subtitle:
        "Design your ideal maritime day with balanced wellness and productivity",
      tabs: [
        { id: "day-planner", label: "Day Planner" },
        { id: "habits", label: "Maritime Habits" },
        { id: "templates", label: "Templates" },
        { id: "analytics", label: "Analytics" },
      ],
      activeTab: "day-planner",
      focusTitle: "Today's Focus",
      focusSubtitle: "Set your main intention for the day",
      dailyGoalLabel: "Daily Goal",
      dailyGoalPlaceholder:
        "e.g., Maintain calm seas mindset during navigation",
    },
    scheduleSection: {
      title: "Daily Schedule",
      subtitle: "Your perfectly planned maritime day",
      progressPercent,
      completedText: `${completedCount} of ${total} activities completed`,
      items,
    },
  };
}

export async function getPerfectDayTemplates() {
  const response = await apiRequest("/daily-plan/templates", {
    method: "GET",
  });

  return (response?.data || []).map((template) => ({
    id: template.id,
    name: template.title,
    description: template.description,
    activities: (template.activities || []).map(mapTemplateActivity),
    extraCount: 0,
  }));
}

export async function applyPerfectDayTemplate(templateId, targetDate) {
  return apiRequest("/daily-plan/apply", {
    method: "POST",
    body: JSON.stringify({ templateId, targetDate }),
  });
}

export async function getPerfectDaySchedule(targetDate = DEFAULT_DATE) {
  const response = await apiRequest(`/daily-plan/${targetDate}`, {
    method: "GET",
  });

  const plan = response?.data;
  const items = (plan?.activities || []).map(mapPlanActivity);

  return {
    ...buildPlannerPayload(items),
    selectedDate: targetDate,
    mainFocus: plan?.mainFocus || "",
    dailyPlanId: plan?.id || null,
  };
}

export async function togglePerfectDayActivity(activityId, isCompleted) {
  const response = await apiRequest(`/daily-plan/activity/${activityId}`, {
    method: "PATCH",
    body: JSON.stringify({ isCompleted }),
  });

  return response?.data;
}

export async function getPerfectDayHabits(targetDate = DEFAULT_DATE) {
  const response = await apiRequest(`/habits/${targetDate}`, {
    method: "GET",
  });

  const payload = response?.data || {};

  return {
    percentageCompleted: payload.percentageCompleted || 0,
    totalHabits: payload.totalHabits || 0,
    completedCount: payload.completedCount || 0,
    habits: (payload.habits || []).map((habit) => ({
      id: habit.id,
      icon: "target",
      title: habit.title,
      doneCount: habit.isCompleted ? 1 : 0,
      targetCount: 1,
      category: getHabitCategoryClass(habit.category),
      categoryLabel: prettifyCategory(habit.category),
      completed: !!habit.isCompleted,
    })),
  };
}

export async function createPerfectDayHabit({ title, category }) {
  const response = await apiRequest("/habits", {
    method: "POST",
    body: JSON.stringify({ title, category }),
  });

  return response?.data;
}

export async function togglePerfectDayHabit(habitId, targetDate = DEFAULT_DATE) {
  return apiRequest(`/habits/${habitId}/toggle`, {
    method: "POST",
    body: JSON.stringify({ targetDate }),
  });
}

export async function deletePerfectDayHabit(habitId) {
  return apiRequest(`/habits/${habitId}`, {
    method: "DELETE",
  });
}

export async function getPerfectDayAnalytics() {
  return {
    dailyProgress: {
      completed: 0,
      total: 0,
      motivationText: "Apply a template to start building your perfect day.",
    },
    habitStreaks: {
      completed: 0,
      total: 0,
      progressPct: 0,
      averageStreakDays: 0,
    },
    activityCategories: [],
    fitnessIntegration: {
      dailyFitnessActivities: 0,
      fitnessHabits: 0,
    },
    insight: {
      text: "Your analytics will appear after you apply a template and start completing activities.",
    },
  };
}