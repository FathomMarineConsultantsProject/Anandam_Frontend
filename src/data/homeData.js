export const homePageMockData = {
  hero: {
    name: 'Nipun Chatrath',
    role: 'Chief Officer',
    ship: 'MV Ocean Pioneer',
    nextPort: 'Singapore',
    eta: '2025-07-05',
    daysAtSea: 45,
    contractProgress: 25,
    message: 'Calm seas ahead. Take a moment to breathe.',
  },

  featureSections: {
    topFeatureRows: [
      [
        {
          id: 'mood-check',
          title: 'Mood Check',
          subtitle: 'How are you feeling?',
          icon: 'heart',
          accent: 'red',
          bg: 'blue-soft',
        },
        {
          id: 'breathing-calm',
          title: 'Breathing',
          subtitle: 'Calm your mind',
          icon: 'wind',
          accent: 'purple',
          bg: 'purple-soft',
        },
      ],
      [
        {
          id: 'sleep-stories',
          title: 'Sleep Stories',
          subtitle: 'Drift off peacefully',
          icon: 'moon',
          accent: 'teal',
          bg: 'green-soft',
        },
        {
          id: 'daily-wisdom',
          title: 'Daily Wisdom',
          subtitle: 'Ancient insights',
          icon: 'quote',
          accent: 'orange',
          bg: 'yellow-soft',
        },
      ],
      [
        {
          id: 'affirmations',
          title: 'Affirmations',
          subtitle: 'Positive mantras',
          icon: 'heartShield',
          accent: 'green',
          bg: 'green-soft-2',
        },
        {
          id: 'masterclasses',
          title: 'Masterclasses',
          subtitle: 'Expert guidance',
          icon: 'graduation',
          accent: 'purple',
          bg: 'purple-soft',
        },
      ],
    ],

    fullWidthCards: [
      {
        id: 'work-rest-hours',
        title: 'Work Rest Hours',
        subtitle: 'MLC compliance tracking',
        icon: 'shield',
        accent: 'blue',
        bg: 'blue-soft',
      },
      {
        id: 'emergency-support',
        title: 'Emergency Support',
        subtitle: 'Crisis intervention & help',
        icon: 'alert',
        accent: 'red',
        bg: 'red-soft',
      },
    ],

    bottomFeatureRow: [
      {
        id: 'emergency',
        title: 'Emergency',
        subtitle: '24/7 Crisis Support',
        icon: 'shieldAlert',
        accent: 'red',
        bg: 'red-soft',
      },
      {
        id: 'brain-training',
        title: 'Brain Training',
        subtitle: 'Cognitive exercises',
        icon: 'brain',
        accent: 'indigo',
        bg: 'blue-soft-2',
      },
    ],

    healthCards: [
      {
        id: 'health-monitoring',
        title: 'Health Monitoring',
        subtitle: 'Vital signs & biometric tracking',
        icon: 'heartShield',
        accent: 'green',
        bg: 'green-soft-2',
        full: true,
      },
      {
        id: 'analytics',
        title: 'Analytics',
        subtitle: 'Mental health insights',
        icon: 'chart',
        accent: 'blue',
        bg: 'blue-soft',
      },
      {
        id: 'breathing-relax',
        title: 'Breathing',
        subtitle: 'Relaxation exercises',
        icon: 'wind',
        accent: 'sky',
        bg: 'cyan-soft',
      },
    ],
  },

  wellness: {
    title: "Today's Wellness",
    stats: [
      {
        id: 'mood-score',
        label: 'Mood Score',
        value: '7.5',
        colorClass: 'stat-green',
      },
      {
        id: 'energy-level',
        label: 'Energy Level',
        value: '85%',
        colorClass: 'stat-blue',
      },
      {
        id: 'activities',
        label: 'Activities',
        value: '3',
        colorClass: 'stat-purple',
      },
    ],
  },

  assistant: {
    title: 'Anandam AI - Your Wellness Companion',
    profileTitle: 'AI Companion - Marina',
    subtitle: 'Available 24/7 • Specialized in maritime wellness',
    introMessage:
      "Good morning! I noticed you've been doing well with your meditation practice. How are you feeling about today's workload?",
    helpHeading: 'Marina can help with:',
    helpList: [
      'Stress management and coping strategies',
      'Maritime-specific wellness advice',
      'Crisis support and intervention',
      'Daily motivation and encouragement',
      'Professional resource recommendations',
    ],
    inputPlaceholder: 'Message Marina...',
    quickChatLabel: 'Quick Chat',
    noticeTitle: 'Crisis Detection Active:',
    notice:
      'Marina monitors conversations for mental health concerns and can connect you with immediate professional support if needed.',
  },

  navigation: {
    activeTab: 'home',
    items: [
      { id: 'home', label: 'Home', icon: 'home' },
      { id: 'perfect-day', label: 'Perfect Day', icon: 'calendar' },
      { id: 'mood', label: 'Mood', icon: 'heart' },
      { id: 'work-rest', label: 'Work/Rest', icon: 'clock' },
      { id: 'fitness', label: 'Fitness', icon: 'activity' },
      { id: 'emergency', label: 'Emergency', icon: 'alert-triangle' },
    ],
  },

  header: {
    appName: 'Anandam by Fathom',
    appSubtitle: 'Wellness for Seafarers',
    userInitials: 'NC',
  },
};