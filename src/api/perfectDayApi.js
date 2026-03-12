export async function getPerfectDaySchedule() {
  // Later replace this mock with real backend API call
  // Example:
  // const response = await fetch("/api/perfect-day/schedule");
  // if (!response.ok) throw new Error("Failed to fetch perfect day schedule");
  // return response.json();

  return Promise.resolve({
    header: {
      brandTitle: "Anandam by Fathom",
      brandSubtitle: "Wellness for Seafarers",
      userInitials: "NC",
      progressBadge: "0% Complete",
    },
    planner: {
      title: "Perfect Day Planner",
      subtitle: "Design your ideal maritime day with balanced wellness and productivity",
      tabs: ["Day Planner", "Maritime Habits", "Templates", "Analytics"],
      activeTab: "Day Planner",
      focusTitle: "Today's Focus",
      focusSubtitle: "Set your main intention for the day",
      dailyGoalLabel: "Daily Goal",
      dailyGoalPlaceholder: "e.g., Maintain calm seas mindset during navigation",
      summaryCards: [
        {
          title: "Total Activities",
          value: "13",
          type: "blue",
        },
        {
          title: "Completed",
          value: "0",
          type: "green",
        },
        {
          title: "Progress",
          value: "0%",
          type: "purple",
        },
      ],
    },
    scheduleSection: {
      title: "Daily Schedule",
      subtitle: "Your perfectly planned maritime day",
      completedText: "0 of 13 activities completed",
      progressPercent: 0,
      items: [
        {
          id: 1,
          title: "Professional Development Reading",
          time: "14:00",
          duration: "60 minutes",
          category: "learning",
          completed: false,
          icon: "book",
        },
        {
          id: 2,
          title: "Evening Watch",
          time: "18:00",
          duration: "240 minutes",
          category: "work",
          completed: false,
          icon: "anchor",
        },
        {
          id: 3,
          title: "Dinner with Crew",
          time: "19:00",
          duration: "60 minutes",
          category: "social",
          completed: false,
          icon: "phone",
        },
        {
          id: 4,
          title: "Personal Time - Journaling",
          time: "21:00",
          duration: "30 minutes",
          category: "wellness",
          completed: false,
          icon: "heart",
        },
      ],
    },
    bottomNav: [
      { label: "Home", active: false, icon: "home" },
      { label: "Perfect Day", active: true, icon: "calendar" },
      { label: "Mood", active: false, icon: "heart" },
      { label: "Work/Rest", active: false, icon: "clock" },
      { label: "Fitness", active: false, icon: "pulse" },
      { label: "Emergency", active: false, icon: "warning" },
    ],
  });
}