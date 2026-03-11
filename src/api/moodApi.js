import { moodPageMockData } from '../data/moodData';

const STORAGE_KEY = 'anandam_mood_history';

function readMoodHistory() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(moodPageMockData.historySeed)
    );
    return moodPageMockData.historySeed;
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(moodPageMockData.historySeed)
    );
    return moodPageMockData.historySeed;
  }
}

function writeMoodHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export async function getMoodPageData() {
  const history = readMoodHistory();

  return {
    ...moodPageMockData,
    history,
  };
}

export async function submitMoodCheck(moodValue) {
  const selectedMood = moodPageMockData.scale.find(
    (item) => item.value === moodValue
  );

  if (!selectedMood) {
    throw new Error('Invalid mood value');
  }

  const newEntry = {
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    moodValue: selectedMood.value,
    emoji: selectedMood.emoji,
  };

  const updatedHistory = [newEntry, ...readMoodHistory()];
  writeMoodHistory(updatedHistory);

  return {
    entry: newEntry,
    history: updatedHistory,
  };
}