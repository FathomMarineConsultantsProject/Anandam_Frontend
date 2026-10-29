/*
  ============================================================
  WORD SEARCH WORD LIBRARY
  ============================================================

  Used by the Word Search brain game.

  The game can randomly select 15–20 words from this collection
  and then generate a matching letter grid containing those
  exact words.

  IMPORTANT:
  - Keep words as single words.
  - Avoid spaces and special characters.
  - Uppercase is used for easier grid generation.
  - Both named + default exports are provided.
*/


export const WORD_SEARCH_WORDS = [
  // =========================================================
  // MARITIME
  // =========================================================

  "ANCHOR",
  "OCEAN",
  "SHIP",
  "CREW",
  "PORT",
  "SAIL",
  "DECK",
  "WAVE",
  "ROPE",
  "COMPASS",
  "LIGHTHOUSE",
  "HARBOR",
  "ISLAND",
  "TIDE",
  "BEACH",
  "BOAT",
  "CAPTAIN",
  "STORM",
  "VESSEL",
  "BRIDGE",
  "ENGINE",
  "RUDDER",
  "BOW",
  "STERN",
  "CABIN",
  "MAST",
  "RADAR",
  "SONAR",
  "DOCK",
  "MARINA",
  "FERRY",
  "TANKER",
  "CARGO",
  "SEAFARER",
  "NAVIGATION",
  "VOYAGE",
  "CHANNEL",
  "HORIZON",
  "CURRENT",
  "COAST",
  "COASTAL",
  "SEAWAY",
  "SAILOR",
  "PILOT",
  "HELMSMAN",
  "OFFICER",
  "GALLEY",
  "MOORING",
  "BERTH",
  "BUOY",
  "BEACON",
  "CHART",
  "WINCH",
  "HATCH",
  "HULL",
  "PROPELLER",
  "LADDER",
  "LIFeboat".toUpperCase(),
  "LIFERAFT",
  "LIFEJACKET",
  "SIGNAL",
  "WATCH",
  "GANGWAY",
  "MANIFOLD",
  "PIPELINE",
  "BALLAST",
  "DRAUGHT",
  "FREEBOARD",
  "TERMINAL",
  "CONTAINER",
  "BULKHEAD",
  "OVERBOARD",
  "SEASIDE",
  "SEABED",
  "OFFSHORE",
  "ONSHORE",
  "SEAWATER",
  "SEASPRAY",
  "MARINER",
  "MARITIME",
  "SHIPYARD",
  "TUGBOAT",
  "BARGE",
  "FREIGHT",
  "CRANE",
  "JETTY",
  "PIER",
  "WHARF",
  "DOCKYARD",
  "SEAFOAM",
  "SEABIRD",
  "SEASHELL",
  "REEF",
  "CORAL",
  "STRAIT",
  "BAY",
  "GULF",
  "LAGOON",
  "ESTUARY",
  "ANCHORAGE",

  // =========================================================
  // WEATHER + NATURE
  // =========================================================

  "SUNRISE",
  "SUNSET",
  "CLOUD",
  "RAIN",
  "BREEZE",
  "WIND",
  "THUNDER",
  "LIGHTNING",
  "MIST",
  "FOG",
  "SKY",
  "MOON",
  "STAR",
  "SUN",
  "RAINBOW",
  "WEATHER",
  "CALM",
  "TEMPEST",
  "DRIZZLE",
  "SHOWER",
  "CLOUDY",
  "SUNNY",
  "WINDY",
  "HUMID",
  "FROST",
  "DEW",
  "TWILIGHT",
  "DAWN",
  "DUSK",
  "NIGHT",
  "DAYLIGHT",
  "SHADOW",
  "FOREST",
  "TREE",
  "LEAF",
  "FLOWER",
  "GARDEN",
  "GRASS",
  "PLANT",
  "BLOSSOM",
  "MEADOW",
  "RIVER",
  "STREAM",
  "LAKE",
  "WATER",
  "WATERFALL",
  "MOUNTAIN",
  "VALLEY",
  "CLIFF",
  "CAVE",
  "SAND",
  "STONE",
  "ROCK",
  "EARTH",
  "NATURE",
  "GREEN",
  "WOODLAND",
  "JUNGLE",
  "DESERT",
  "FIELD",
  "TRAIL",

  // =========================================================
  // WELLBEING
  // =========================================================

  "BALANCE",
  "CALMNESS",
  "PEACE",
  "REST",
  "RELAX",
  "BREATHE",
  "BREATH",
  "MINDFUL",
  "FOCUS",
  "ENERGY",
  "SLEEP",
  "HEALTH",
  "WELLNESS",
  "COMFORT",
  "HOPE",
  "JOY",
  "SMILE",
  "HAPPY",
  "KINDNESS",
  "PATIENCE",
  "COURAGE",
  "CONFIDENCE",
  "GRATITUDE",
  "POSITIVITY",
  "RESILIENCE",
  "SUPPORT",
  "TRUST",
  "CARE",
  "FRIENDSHIP",
  "CONNECTION",
  "LISTEN",
  "REFLECT",
  "PAUSE",
  "RESET",
  "RECOVER",
  "RECHARGE",
  "REFRESH",
  "STRETCH",
  "WALK",
  "MOVEMENT",
  "FITNESS",
  "STRENGTH",
  "ROUTINE",
  "HABIT",
  "PROGRESS",
  "PURPOSE",
  "MOTIVATION",
  "AWARENESS",
  "ACCEPTANCE",
  "EMPATHY",
  "COMPASSION",
  "RESPECT",
  "SELFCARE",
  "WELLBEING",
  "SERENITY",
  "HARMONY",
  "RELIEF",
  "QUIET",
  "STILLNESS",
  "GROUNDING",
  "PRESENT",
  "MOMENT",
  "THOUGHT",
  "FEELING",
  "EMOTION",
  "MINDSET",
  "CLARITY",
  "CHOICE",
  "GROWTH",
  "RECOVERY",

  // =========================================================
  // DAILY LIFE
  // =========================================================

  "MORNING",
  "EVENING",
  "TODAY",
  "TOMORROW",
  "JOURNEY",
  "ADVENTURE",
  "MEMORY",
  "DREAM",
  "HOME",
  "FAMILY",
  "FRIEND",
  "TEAM",
  "WORK",
  "BREAK",
  "COFFEE",
  "TEA",
  "BOOK",
  "MUSIC",
  "STORY",
  "READING",
  "WRITING",
  "JOURNAL",
  "LETTER",
  "MESSAGE",
  "PHONE",
  "CLOCK",
  "TIME",
  "PLAN",
  "GOAL",
  "TASK",
  "START",
  "FINISH",
  "CREATE",
  "LEARN",
  "DISCOVER",
  "EXPLORE",
  "THINK",
  "NOTICE",
  "CHOOSE",
  "SHARE",
  "HELP",
  "TALK",
  "LAUGH",
  "PLAY",
  "GAME",
  "PUZZLE",
  "COLOUR",
  "DRAW",
  "DESIGN",
  "IDEA",
  "ACTION",
  "CHANGE",
  "BEGIN",
  "RETURN",
  "RESTORE",

  // =========================================================
  // TRAVEL + EXPLORATION
  // =========================================================

  "TRAVEL",
  "ROUTE",
  "MAP",
  "JOURNEY",
  "DESTINATION",
  "DIRECTION",
  "NORTH",
  "SOUTH",
  "EAST",
  "WEST",
  "PATH",
  "ROAD",
  "TRIP",
  "EXPEDITION",
  "PASSAGE",
  "CROSSING",
  "DISTANCE",
  "ARRIVAL",
  "DEPARTURE",
  "LOCATION",
  "LANDMARK",
  "VIEW",
  "SCENERY",
  "LANDSCAPE",
  "OUTDOOR",
  "DISCOVERY",
  "EXPLORER",

  // =========================================================
  // SAFETY + SHIPBOARD LIFE
  // =========================================================

  "SAFETY",
  "ALARM",
  "RESCUE",
  "EMERGENCY",
  "HELMET",
  "GLOVES",
  "BOOTS",
  "HARNESS",
  "RADIO",
  "CHECKLIST",
  "INSPECTION",
  "TRAINING",
  "DRILL",
  "MUSTER",
  "ESCAPE",
  "CAUTION",
  "WARNING",
  "SECURE",
  "PROTECT",
  "PREPARE",
  "MONITOR",
  "CONTROL",
  "VERIFY",
  "REPORT",
  "TEAMWORK",
  "PROCEDURE",
  "EQUIPMENT",
  "ACCESS",
  "ENTRY",
  "VENTILATE",
  "OXYGEN",
  "PRESSURE",
  "TEMPERATURE",
  "FIRE",
  "SMOKE",
  "PUMP",
  "VALVE",
  "HOSE",
  "GENERATOR",
  "STEERING",
  "POWER",
  "BATTERY",

  // =========================================================
  // POSITIVE WORDS
  // =========================================================

  "BRAVE",
  "STRONG",
  "STEADY",
  "GENTLE",
  "BRIGHT",
  "WARM",
  "FRESH",
  "OPEN",
  "READY",
  "ACTIVE",
  "CREATIVE",
  "CURIOUS",
  "HELPFUL",
  "HONEST",
  "CARING",
  "FRIENDLY",
  "PATIENT",
  "CAPABLE",
  "POSITIVE",
  "PEACEFUL",
  "RELAXED",
  "FOCUSED",
  "THANKFUL",
  "MINDFUL",
  "HOPEFUL",
  "CONFIDENT",
  "SUPPORTED",
  "CONNECTED",
  "INSPIRED",
  "MOTIVATED",
];


// ============================================================
// REMOVE ACCIDENTAL DUPLICATES
// ============================================================

const UNIQUE_WORD_SEARCH_WORDS = [
  ...new Set(
    WORD_SEARCH_WORDS.map((word) =>
      String(word)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z]/g, "")
    ).filter(Boolean)
  ),
];


// ============================================================
// OPTIONAL HELPER
// Randomly select words for one puzzle
// ============================================================

export function getRandomWordSearchWords(
  minimum = 15,
  maximum = 20
) {
  const min = Math.max(
    1,
    Math.min(minimum, UNIQUE_WORD_SEARCH_WORDS.length)
  );

  const max = Math.max(
    min,
    Math.min(maximum, UNIQUE_WORD_SEARCH_WORDS.length)
  );

  const amount =
    Math.floor(
      Math.random() * (max - min + 1)
    ) + min;

  const shuffled = [
    ...UNIQUE_WORD_SEARCH_WORDS,
  ];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (index + 1)
      );

    [
      shuffled[index],
      shuffled[randomIndex],
    ] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled.slice(
    0,
    amount
  );
}


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default UNIQUE_WORD_SEARCH_WORDS;