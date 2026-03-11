export const moodPageMockData = {
  pageTitle: 'Mood Check-in',
  cardTitle: 'How are you feeling today?',
  cardSubtitle: 'Your daily mood tracking helps us provide better support',
  submitLabel: 'Submit Mood Check',
  tableHeaders: {
    date: 'Date',
    mood: 'Mood',
  },
  scale: [
    { value: 1, emoji: '😧' },
    { value: 2, emoji: '😟' },
    { value: 3, emoji: '😐' },
    { value: 4, emoji: '😊' },
    { value: 5, emoji: '😄' },
  ],
  historySeed: [
    { id: '1', createdAt: '2026-03-09T23:31:35', moodValue: 4, emoji: '😊' },
    { id: '2', createdAt: '2026-03-09T23:31:34', moodValue: 4, emoji: '😊' },
    { id: '3', createdAt: '2026-02-28T18:10:41', moodValue: 4, emoji: '😊' },
    { id: '4', createdAt: '2026-02-28T12:27:36', moodValue: 3, emoji: '😐' },
    { id: '5', createdAt: '2026-02-28T12:26:54', moodValue: 5, emoji: '😄' },
    { id: '6', createdAt: '2026-02-28T12:26:25', moodValue: 1, emoji: '😧' },
  ],
};