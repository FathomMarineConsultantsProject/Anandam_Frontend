// src/data/fullMoodData.js

// ======================================================
// MOOD FACES - FROM assets/moodpage
// ======================================================

import moodVeryLow from "../assets/moodpage/Group 81.png";
import moodLow from "../assets/moodpage/Group 82.png";
import moodOkay from "../assets/moodpage/Group 83.png";
import moodGood from "../assets/moodpage/Group 85.png";
import moodGreat from "../assets/moodpage/Group 86.png";

// ======================================================
// ENERGY - FROM assets/mood
// ======================================================

import energyVeryLow from "../assets/mood/low1.png";
import energyLow from "../assets/mood/low2.png";
import energyModerate from "../assets/mood/medium3.png";
import energyEnergized from "../assets/mood/high4.png";
import energyFull from "../assets/mood/high5.png";

// ======================================================
// STRESS - THESE ARE THE SQUIGGLE ASSETS
// ======================================================

import stressOverwhelmed from "../assets/mood/mood1.png";
import stressVeryStressed from "../assets/mood/mood2.png";
import stressModerate from "../assets/mood/mood3.png";
import stressSlight from "../assets/mood/od4.png";
import stressCalm from "../assets/mood/mood5.png";

// ======================================================
// FEELINGS ICONS
// ======================================================

import adventurousIcon from "../assets/mood/Group 1597885692.png";
import homesickIcon from "../assets/mood/Group 1597885693.png";
import excitedIcon from "../assets/mood/Group 1597885695.png";
import calmIcon from "../assets/mood/Group 1597885697.png";
import gratefulIcon from "../assets/mood/Group 1597885698.png";
import peacefulIcon from "../assets/mood/Group 1597885700.png";
import frustratedIcon from "../assets/mood/Group 1597885702.png";

import proudIcon from "../assets/mood/Group 1597885709.png";
import anxiousIcon from "../assets/mood/Group 1597885710.png";
import hopefulIcon from "../assets/mood/Group 1597885711.png";
import lonelyIcon from "../assets/mood/Group 1597885712.png";
import determinedIcon from "../assets/mood/Group 1597885713.png";


// ======================================================
// MOOD
// ======================================================

export const MOOD_OPTIONS = [
  {
    value: 1,
    label: "Very low",
    image: moodVeryLow,
  },
  {
    value: 2,
    label: "Low",
    image: moodLow,
  },
  {
    value: 3,
    label: "Okay",
    image: moodOkay,
  },
  {
    value: 4,
    label: "Good",
    image: moodGood,
  },
  {
    value: 5,
    label: "Great",
    image: moodGreat,
  },
];


// ======================================================
// ENERGY
// ======================================================

export const ENERGY_OPTIONS = [
  {
    value: 1,
    label: "Very low",
    image: energyVeryLow,
  },
  {
    value: 2,
    label: "Low",
    image: energyLow,
  },
  {
    value: 3,
    label: "Moderate",
    image: energyModerate,
  },
  {
    value: 4,
    label: "Energized",
    image: energyEnergized,
  },
  {
    value: 5,
    label: "Full of energy",
    image: energyFull,
  },
];


// ======================================================
// STRESS
//
// IMPORTANT:
// Backend value is reversed:
//
// 5 = Overwhelmed
// 1 = Calm
// ======================================================

export const STRESS_OPTIONS = [
  {
    value: 5,
    label: "Overwhelmed",
    image: stressOverwhelmed,
  },
  {
    value: 4,
    label: "Very stressed",
    image: stressVeryStressed,
  },
  {
    value: 3,
    label: "Moderately stressed",
    image: stressModerate,
  },
  {
    value: 2,
    label: "Slightly stressed",
    image: stressSlight,
  },
  {
    value: 1,
    label: "Calm",
    image: stressCalm,
  },
];


// ======================================================
// WORKLOAD
// ======================================================

export const WORKLOAD_OPTIONS = [
  {
    id: "light",
    label: "Light",
    description: "Easy to manage",
  },
  {
    id: "balanced",
    label: "Balanced",
    description: "Comfortable & manageable",
  },
  {
    id: "heavy",
    label: "Heavy",
    description: "Challenging but manageable",
  },
  {
    id: "overwhelming",
    label: "Overwhelming",
    description: "Difficult to cope with",
  },
];


// ======================================================
// FEELINGS
//
// bg = circle behind the small icon.
// ======================================================

export const FEELING_OPTIONS = [
  {
    id: "adventurous",
    label: "Adventurous",
    icon: adventurousIcon,
    bg: "#EAF4F8",
  },
  {
    id: "homesick",
    label: "Homesick",
    icon: homesickIcon,
    bg: "#FBECE6",
  },
  {
    id: "proud",
    label: "Proud",
    icon: proudIcon,
    bg: "#FFF3D6",
  },
  {
    id: "lonely",
    label: "Lonely",
    icon: lonelyIcon,
    bg: "#EEF0FA",
  },

  {
    id: "excited",
    label: "Excited",
    icon: excitedIcon,
    bg: "#FFF0E3",
  },
  {
    id: "calm",
    label: "Calm",
    icon: calmIcon,
    bg: "#E7F4F0",
  },
  {
    id: "anxious",
    label: "Anxious",
    icon: anxiousIcon,
    bg: "#F5ECF3",
  },
  {
    id: "grateful",
    label: "Grateful",
    icon: gratefulIcon,
    bg: "#FBECEF",
  },

  {
    id: "peaceful",
    label: "Peaceful",
    icon: peacefulIcon,
    bg: "#EDF5E9",
  },
  {
    id: "frustrated",
    label: "Frustrated",
    icon: frustratedIcon,
    bg: "#FBE9E6",
  },
  {
    id: "hopeful",
    label: "Hopeful",
    icon: hopefulIcon,
    bg: "#FFF5D9",
  },
  {
    id: "determined",
    label: "Determined",
    icon: determinedIcon,
    bg: "#F5ECE6",
  },
];


// ======================================================
// HELPERS
// ======================================================

export function getMoodLabel(value) {
  return (
    MOOD_OPTIONS.find(
      (item) => item.value === Number(value)
    )?.label || "-"
  );
}

export function getEnergyLabel(value) {
  return (
    ENERGY_OPTIONS.find(
      (item) => item.value === Number(value)
    )?.label || "-"
  );
}

export function getStressLabel(value) {
  return (
    STRESS_OPTIONS.find(
      (item) => item.value === Number(value)
    )?.label || "-"
  );
}

export function getWorkloadLabel(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  const map = {
    light: "Light",
    balanced: "Balanced",
    normal: "Balanced",
    moderate: "Balanced",
    heavy: "Heavy",
    overwhelming: "Overwhelming",
  };

  return map[normalized] || "-";
}

export function getSleepLabel(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "-";
  }

  const number = Number(value);

  return `${number} ${number === 1 ? "hour" : "hours"}`;
}

export function normalizeFeelingId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function getEntryFeelings(entry) {
  let source =
    entry?.feelings ??
    entry?.feeling ??
    [];

  if (typeof source === "string") {
    try {
      const parsed = JSON.parse(source);

      if (Array.isArray(parsed)) {
        source = parsed;
      } else {
        source = source.split(",");
      }
    } catch {
      source = source.split(",");
    }
  }

  if (!Array.isArray(source)) {
    return [];
  }

  return source
    .map((value) => normalizeFeelingId(value))
    .filter(Boolean);
}

export function getFeelingOption(value) {
  const id = normalizeFeelingId(value);

  return (
    FEELING_OPTIONS.find(
      (item) => item.id === id
    ) || {
      id,
      label: id
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      icon: null,
      bg: "#F4F4F4",
    }
  );
}

export function formatCheckinDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatCheckinTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}