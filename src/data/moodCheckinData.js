export const moodCheckinMockData = {
  header: {
    title: 'Daily Mood Check',
    subtitle: "Take a moment to reflect on how you're feeling today",
  },

  step1: {
    moodQuestion: 'How is your mood today?',
    energyQuestion: 'Energy Level',
    stressQuestion: 'Stress Level',
    moodMinLabel: 'Very Low',
    moodMaxLabel: 'Excellent',
    energyMinLabel: 'Exhausted',
    energyMaxLabel: 'Energized',
    stressMinLabel: 'Very Calm',
    stressMaxLabel: 'Very Stressed',
    continueLabel: 'Continue',
  },

  step2: {
    title: 'Sleep & Work Assessment',
    sleepQuestion: 'Hours of sleep last night',
    sleepMinLabel: '0 hours',
    sleepMidLabel: '7 hours',
    sleepMaxLabel: '12 hours',
    workloadQuestion: 'How would you describe your current workload?',
    workloadOptions: [
      { id: 'light', label: 'Light - Easy to manage' },
      { id: 'normal', label: 'Normal - Typical workload' },
      { id: 'heavy', label: 'Heavy - Challenging but manageable' },
      { id: 'overwhelming', label: 'Overwhelming - Difficult to cope' },
    ],
    notesQuestion: 'Any additional thoughts or concerns?',
    notesPlaceholder: "Share anything that's on your mind...",
    backLabel: 'Back',
    continueLabel: 'Continue',
  },

  step3: {
    title: 'Emotions & Journal',
    subtitle: 'Express your emotions and record your thoughts',
    emotionQuestion: 'How are you feeling? (Select all that apply)',
    emotions: [
      { id: 'adventurous', label: 'Adventurous', emoji: '🌊' },
      { id: 'homesick', label: 'Homesick', emoji: '🏠' },
      { id: 'proud', label: 'Proud', emoji: '⚓' },
      { id: 'lonely', label: 'Lonely', emoji: '🌙' },
      { id: 'excited', label: 'Excited', emoji: '🛳️' },
      { id: 'calm', label: 'Calm', emoji: '🌅' },
      { id: 'anxious', label: 'Anxious', emoji: '🌧️' },
      { id: 'grateful', label: 'Grateful', emoji: '🙏' },
      { id: 'determined', label: 'Determined', emoji: '💪' },
      { id: 'peaceful', label: 'Peaceful', emoji: '🕊️' },
      { id: 'frustrated', label: 'Frustrated', emoji: '🤗' },
      { id: 'hopeful', label: 'Hopeful', emoji: '☀️' },
    ],
    journalTitle: 'Journal Entry',
    journalSubtitle:
      "Write about your day, thoughts, experiences, or anything you'd like to remember",
    journalPlaceholder: 'Dear Journal, today I...',
    backLabel: 'Back',
    submitLabel: 'Complete Check-in',
  },

  ui: {
    successMessage: 'Mood entry saved successfully.',
    errorMessage: 'Failed to save mood entry. Please try again.',
  },
};