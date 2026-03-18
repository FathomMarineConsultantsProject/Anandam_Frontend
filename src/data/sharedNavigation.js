// data/sharedNavigation.js
// ---------------------------------------------------------------------------
// Single source of truth for bottom nav items.
// Import this in homeData.js, workRestData.js, and any other page data file
// so the nav is always consistent and every path is always present.
//
// Usage:
//   import { sharedNavItems } from "./sharedNavigation";
//   navigation: { activeTab: "home", items: sharedNavItems }
// ---------------------------------------------------------------------------

export const sharedNavItems = [
  { id: "home",        label: "Home",        icon: "home",            path: "/dashboard" },
  { id: "perfect-day", label: "Perfect Day", icon: "calendar",        path: "/app/perfect-day" },
  { id: "mood",        label: "Mood",        icon: "heart",           path: "/mood" },
  { id: "work-rest",   label: "Work/Rest",   icon: "clock",           path: "/app/work-rest" },
  { id: "fitness",     label: "Fitness",     icon: "activity",        path: "/app/fitness" },
  { id: "emergency",   label: "Emergency",   icon: "alert-triangle",  path: "/emergency" },
];