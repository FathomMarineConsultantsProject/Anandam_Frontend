// src/api/perfectDayApi.js

export async function getPerfectDaySchedule() {
  return {
    header: {
      appName: "Anandam by Fathom",
      appSubtitle: "Wellness for Seafarers",
      userInitials: "NC",
      progressBadge: "0% Complete",
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

      summaryCards: [
        { type: "total",     title: "Total Activities", value: "8" },
        { type: "completed", title: "Completed",         value: "0" },
        { type: "progress",  title: "Progress",          value: "0%" },
      ],
    },

    scheduleSection: {
      title: "Daily Schedule",
      subtitle: "Your perfectly planned maritime day",
      progressPercent: 0,
      completedText: "0 of 8 activities completed",
      items: [
        {
          id: "1",
          icon: "heart",
          title: "Port Morning Routine",
          time: "07:00",
          duration: "60 minutes",
          category: "wellness",
          completed: false,
        },
        {
          id: "2",
          icon: "utensils",
          title: "Shore Breakfast",
          time: "08:00",
          duration: "45 minutes",
          category: "nutrition",
          completed: false,
        },
        {
          id: "3",
          icon: "dumbbell",
          title: "Port Exploration Walking Tour",
          time: "09:00",
          duration: "180 minutes",
          category: "fitness",
          completed: false,
        },
        {
          id: "4",
          icon: "utensils",
          title: "Local Cuisine Experience",
          time: "12:00",
          duration: "90 minutes",
          category: "nutrition",
          completed: false,
        },
        {
          id: "5",
          icon: "book",
          title: "Cultural Learning",
          time: "14:00",
          duration: "120 minutes",
          category: "learning",
          completed: false,
        },
        {
          id: "6",
          icon: "dumbbell",
          title: "Port Shopping Walk",
          time: "16:00",
          duration: "60 minutes",
          category: "fitness",
          completed: false,
        },
        {
          id: "7",
          icon: "dumbbell",
          title: "Harbor Sunset Yoga",
          time: "18:00",
          duration: "45 minutes",
          category: "fitness",
          completed: false,
        },
        {
          id: "8",
          icon: "phone",
          title: "Social Dinner with Crew",
          time: "20:00",
          duration: "90 minutes",
          category: "social",
          completed: false,
        },
      ],
    },
  };
}