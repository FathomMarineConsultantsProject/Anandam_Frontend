export const FITNESS_TABS = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "guided",
    label: "Guided Workout",
  },
  {
    id: "vr",
    label: "VR Workouts",
  },
  {
    id: "history",
    label: "Activity History",
  },
];

export const FITNESS_OVERVIEW = {
  stats: [
    {
      id: "workouts",
      label: "Workouts completed",
      value: 8,
      tone: "blue",
    },
    {
      id: "sleep",
      label: "Sleep hours",
      value: 6,
      tone: "green",
    },
    {
      id: "vr",
      label: "VR Sessions",
      value: 2,
      tone: "purple",
    },
  ],

  breakdown: {
    guidedPercent: 72,
    vrPercent: 35,
  },

  continueWorkoutId:
    "guided-deck-strength",
};

export const GUIDED_CATEGORIES = [
  "All",
  "Strength",
  "Mobility",
  "Cardio",
  "Balance",
  "Yoga",
  "Recovery",
];

export const GUIDED_WORKOUTS = [
  {
    id: "guided-deck-strength",

    title:
      "Deck Strength Training",

    shortTitle:
      "Deck Training",

    category:
      "Strength",

    duration: 30,

    difficulty:
      "Advanced",

    progress: 75,

    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=85",

    description:
      "Build functional strength with controlled movements designed for limited spaces and everyday shipboard mobility.",

    about:
      "This full-body session combines controlled strength, stability and mobility work that can be completed in a compact exercise space. Move at a steady pace, focus on form and stop if any movement causes discomfort.",

    benefits: [
      "Supports full-body strength and control.",
      "Improves balance during changing vessel conditions.",
      "Builds core stability for everyday movement.",
      "Encourages joint mobility and range of motion.",
      "Can be completed in a compact training area.",
    ],

    videoUrl: "",
  },

  // add more guided workouts here
];

export const VR_WORKOUTS = [
  {
    id: "vr-cricket",

    title:
      "VR Cricket Challenge",

    duration: 25,

    difficulty:
      "Beginner",

    image:
      "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=85",

    description:
      "Test your batting timing, accuracy and reflexes on a virtual cricket pitch.",

    about:
      "Face virtual bowlers in an immersive cricket environment and respond to different deliveries using controlled batting movements. Watch the ball carefully, time each shot and aim for open areas of the field.",

    equipment: [
      "VR Headset",
      "Motion Controllers",
      "VR Cricket bat",
    ],

    safety: [
      "Clear at least 2 m × 2 m of space around you.",
      "Make sure the headset fits securely and comfortably.",
      "Attach the controller wrist straps before starting.",
      "Keep other people and objects outside your play area.",
      "Stop immediately if you feel dizzy or uncomfortable.",
    ],
  },

  // add other VR experiences here
];

export const FITNESS_CHALLENGES = [
  {
    id: "movement",
    title: "Monthly Movement",
    description:
      "Complete 12 guided workouts this month",
    complete: 8,
    target: 12,
    tone: "gold",
  },

  {
    id: "mobility",
    title: "Monthly Mobility",
    description:
      "Complete 12 mobility sessions this month",
    complete: 8,
    target: 12,
    tone: "green",
  },

  {
    id: "balance",
    title: "Monthly Balance",
    description:
      "Complete 12 balance or VR sessions this month",
    complete: 9,
    target: 12,
    tone: "purple",
  },
];

export const FITNESS_ACTIVITY_HISTORY = [
  {
    id: 1,
    activity:
      "Ocean Calm Movement",
    activityType:
      "Guided Workout",
    duration: 20,
    completedOn:
      "17 Sep 2026",
    difficulty:
      "Advanced",
  },

  {
    id: 2,
    activity:
      "Deck Strength Training",
    activityType:
      "Guided Workout",
    duration: 30,
    completedOn:
      "16 Sep 2026",
    difficulty:
      "Intermediate",
  },

  {
    id: 3,
    activity:
      "High Intensity Bootcamp",
    activityType:
      "Guided Workout",
    duration: 20,
    completedOn:
      "15 Sep 2026",
    difficulty:
      "Advanced",
  },

  // continue with all activity history...
];