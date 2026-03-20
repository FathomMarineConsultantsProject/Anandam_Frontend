// data/workRestData.js
// ---------------------------------------------------------------------------
// Mock data for Work/Rest page.
// API_HOOK: Replace exports with real API calls returning the same shape.
// ---------------------------------------------------------------------------

function buildWork(ranges) {
  const arr = Array(48).fill(false);
  for (const [s, e] of ranges) {
    for (let i = s; i <= e; i++) arr[i] = true;
  }
  return arr;
}

export const workRestMockData = {
  // ── Schedule header ───────────────────────────────────────────────────────
  scheduleInfo: {
    title: "WORKING SCHEDULE - NOV 2025",
    vessel: "MV Ocean Pioneer",
    imoNo: "IMO 9876543",
    flag: "Marshall Islands",
    location: "Panama Canal Zone",
    date: "2026-03-14",
    scheduleType: "Planned Working Hours",
  },

  // ── Crew work periods ─────────────────────────────────────────────────────
  crew: [
    {
      id: "crew-1",
      name: "Nipun Chatrath",
      rank: "Chief Officer",
      workPeriods: buildWork([[12, 23]]),
    },
    {
      id: "crew-2",
      name: "James Wilson",
      rank: "2nd Officer",
      workPeriods: buildWork([[0, 11], [24, 29]]),
    },
    {
      id: "crew-3",
      name: "Carlos Rodriguez",
      rank: "Bosun",
      workPeriods: buildWork([[11, 23]]),
    },
    {
      id: "crew-4",
      name: "Ahmed Hassan",
      rank: "AB Seaman",
      workPeriods: buildWork([[0, 11], [24, 29]]),
    },
    {
      id: "crew-5",
      name: "Maria Santos",
      rank: "Cook",
      workPeriods: buildWork([[10, 21]]),
    },
    {
      id: "crew-6",
      name: "John Smith",
      rank: "Oiler",
      workPeriods: buildWork([[11, 23]]),
    },
  ],

  // ── MLC Compliance ────────────────────────────────────────────────────────
  compliance: {
    totalScheduled: 6,
    compliantCount: 6,
    violationCount: 0,
    complianceRate: 100,
    requirements: [
      "Minimum 10 hours rest in any 24-hour period",
      "Minimum 6 hours continuous rest period",
      "Maximum 14 hours work in any 24-hour period",
      "Maximum 72 hours work in any 7-day period",
    ],
    remarks: [
      "ILO Rest requirements strictly followed as per MLC 2.3",
      "All crew members briefed on work/rest hour regulations",
      "Emergency duties may require deviation from schedule - will be recorded separately",
      "Schedule reviewed and approved by Master",
    ],
  },

  // ── Face Recognition status ───────────────────────────────────────────────
  // API_HOOK: GET /api/face-recognition/status
  faceRecognition: {
    systemStatus: "inactive",
    accuracy: "95%",
    lastScan: "09:05 AM",
    successRate: "92%",
  },

  // ── Face Recognition activity log ─────────────────────────────────────────
  // API_HOOK: GET /api/face-recognition/activity?date=YYYY-MM-DD
  activityLog: [
    {
      type: "success",
      label: "Face Recognition Successful",
      location: "Bridge",
      time: "09:05 AM",
      badgeLabel: "Success",
    },
    {
      type: "backup",
      label: "PIN Backup Used",
      location: "Galley",
      time: "01:00 PM",
      badgeLabel: "Backup",
    },
    {
      type: "failed",
      label: "Recognition Failed",
      location: "Engine Room",
      time: "08:25 AM",
      badgeLabel: "Failed",
    },
  ],

  // ── Time Clock Records ────────────────────────────────────────────────────
  // API_HOOK: GET /api/time-clock/records?date=YYYY-MM-DD
  // dotType: "in" = green dot, "out" = red dot
  // authType: "face" | "pin"
  timeClockRecords: [
    {
      id: "tcr-1",
      name: "Nipun Chatrath",
      location: "Bridge",
      action: "Clock In",
      time: "06:00 AM",
      dotType: "in",
      authType: "face",
    },
    {
      id: "tcr-2",
      name: "Nipun Chatrath",
      location: "Engine Room",
      action: "Clock In",
      time: "08:30 AM",
      dotType: "in",
      authType: "face",
    },
    {
      id: "tcr-3",
      name: "Nipun Chatrath",
      location: "Bridge",
      action: "Clock Out",
      time: "12:00 PM",
      dotType: "out",
      authType: "face",
    },
    {
      id: "tcr-4",
      name: "Nipun Chatrath",
      location: "Galley",
      action: "Clock In",
      time: "01:00 PM",
      dotType: "in",
      authType: "pin",
    },
    {
      id: "tcr-5",
      name: "Nipun Chatrath",
      location: "Accommodation",
      action: "Clock Out",
      time: "06:00 PM",
      dotType: "out",
      authType: "face",
    },
  ],

  // ── Daily Time Summary ────────────────────────────────────────────────────
  // API_HOOK: GET /api/time-clock/summary?date=YYYY-MM-DD
  dailySummary: {
    hoursWorked: 8.5,
    locationChanges: 6,
    faceRecognitionRate: "92%",
  },

  // ── Shared shell ──────────────────────────────────────────────────────────
  header: {
    appName: "Anandüm by Fathom",
    appSubtitle: "Wellness for Seafarers",
    userInitials: "NC",
  },

  navigation: {
    activeTab: "work-rest",
    items: [
      { id: "home",        label: "Home",        icon: "home",           path: "/app/dashboard" },
      { id: "perfect-day", label: "Perfect Day", icon: "calendar",       path: "/app/perfect-day" },
      { id: "mood",        label: "Mood",        icon: "heart",          path: "/mood" },
      { id: "work-rest",   label: "Work/Rest",   icon: "clock",          path: "/app/work-rest" },
      { id: "fitness",     label: "Fitness",     icon: "activity",       path: "/app/fitness" },
      { id: "emergency",   label: "Emergency",   icon: "alert-triangle", path: "/app/emergency" },
    ],
  },
};