// src/data/fitnessData.js
export const fitnessPageMockData = {
  dashboard: {
    dailyActivity: {
      rings: [
        { id: 'move',  label: 'MOVE',  value: 67,    goal: 100, color: '#ef4444' },
        { id: 'steps', label: 'STEPS', value: 82.47, goal: 100, color: '#22c55e' },
        { id: 'cal',   label: 'CAL',   value: 18,    goal: 100, color: '#3b82f6' },
      ],
      stats: [
        { id: 'active-minutes', label: 'Active Minutes', value: 67,   goal: 'Goal: 60 min',  color: 'red'   },
        { id: 'steps',          label: 'Steps',           value: 8247, goal: 'Goal: 10,000',  color: 'green' },
        { id: 'calories',       label: 'Calories',        value: 1842, goal: 'Goal: 2,000',   color: 'blue'  },
      ],
    },
    vitals: [
      { id: 'bpm',      label: 'BPM',         value: 72,     icon: 'heart',    color: 'red'    },
      { id: 'sleep',    label: 'Sleep Hours',  value: 7.2,    icon: 'clock',    color: 'blue'   },
      { id: 'streak',   label: 'Day Streak',   value: 5,      icon: 'flame',    color: 'orange' },
      { id: 'thisWeek', label: 'This Week',    value: '+12%', icon: 'trending', color: 'green'  },
    ],
    recentWorkouts: [
      { id: 'vr-ocean-gym',    name: 'VR Ocean Gym',                duration: 30, calories: 300, intensity: 'medium', icon: 'vr'     },
      { id: 'deck-strength',   name: 'Deck Strength Training',       duration: 25, calories: 200, intensity: 'medium', icon: 'zap'    },
      { id: 'vr-combat',       name: 'VR Maritime Combat Training',  duration: 25, calories: 375, intensity: 'high',   icon: 'vr'     },
      { id: 'sea-legs-cardio', name: 'Sea Legs Cardio',              duration: 20, calories: 240, intensity: 'high',   icon: 'heart'  },
      { id: 'cabin-yoga',      name: 'Cabin Yoga Flow',              duration: 30, calories: 120, intensity: 'low',    icon: 'target' },
    ],
  },

  workouts: [
    {
      id: 'deck-strength', name: 'Deck Strength Training',
      description: 'Build functional strength for maritime work',
      duration: 25, calories: 200, intensity: 'medium', icon: 'zap',
      exercises: ['Rope climbing simulation','Anchor lifting squats','Deck swabbing lunges','Mooring line pulls','Hatch cover deadlifts'],
    },
    {
      id: 'sea-legs-cardio', name: 'Sea Legs Cardio',
      description: 'Improve balance and endurance at sea',
      duration: 20, calories: 240, intensity: 'high', icon: 'heart',
      exercises: ['Ship motion simulation','Deck running intervals','Balance board training','Wave-response agility','Gangway sprint drills'],
    },
    {
      id: 'cabin-yoga', name: 'Cabin Yoga Flow',
      description: 'Relaxing yoga for small spaces',
      duration: 30, calories: 120, intensity: 'low', icon: 'target',
      exercises: ['Ship pose sequence','Horizon breathing','Cabin wall stretches','Seated meditation flow','Supine restoration'],
    },
    {
      id: 'maritime-functional', name: 'Maritime Functional Training',
      description: 'Job-specific movement patterns',
      duration: 35, calories: 350, intensity: 'medium', icon: 'activity',
      exercises: ['Knot tying with resistance','Ladder climbing intervals','Heavy lifting simulation','Emergency evacuation drills','Watch-keeping stance holds'],
    },
  ],

  vrWorkouts: [
    {
      id: 'vr-ocean-gym', name: 'VR Ocean Gym',
      description: 'Immersive virtual reality fitness in underwater environments',
      duration: 30, calories: 300, intensity: 'medium', icon: 'vr', isVR: true,
      vrEnvironment: 'Deep Ocean', requiredEquipment: 'VR Headset Required',
      exercises: ['Underwater swimming simulation','Deep sea exploration cardio','Coral reef obstacle course','Submarine sprint circuits','Tide resistance training'],
    },
    {
      id: 'vr-combat', name: 'VR Maritime Combat Training',
      description: 'High-intensity VR combat training for maritime security',
      duration: 25, calories: 375, intensity: 'high', icon: 'vr', isVR: true,
      vrEnvironment: 'Pirate Ship Deck', requiredEquipment: 'VR Headset + Controllers',
      exercises: ['Pirate ship boarding simulation','Deck combat training','Emergency response scenarios','Tactical navigation drills','Hostile boarding defense'],
    },
    {
      id: 'vr-storm', name: 'VR Storm Survival',
      description: 'Experience extreme weather conditions in virtual reality',
      duration: 20, calories: 280, intensity: 'high', icon: 'vr', isVR: true,
      vrEnvironment: 'Storm at Sea', requiredEquipment: 'VR Headset + Motion Controllers',
      exercises: ['Hurricane deck navigation','Rough sea balance training','Emergency equipment handling','Storm lashing techniques','High-wind movement drills'],
    },
    {
      id: 'vr-port', name: 'VR Port Adventure',
      description: 'Explore different ports around the world in virtual reality',
      duration: 35, calories: 245, intensity: 'low', icon: 'vr', isVR: true,
      vrEnvironment: 'Global Ports', requiredEquipment: 'VR Headset',
      exercises: ['Port city exploration runs','Cultural fitness challenges','Harbor swimming sessions','Dockside HIIT circuits','Local landmark trekking'],
    },
  ],

  vrGym: {
    featured: {
      id: 'vr-ocean-gym', name: 'VR Ocean Gym',
      tagline: 'Dive into a world beneath the waves',
      stats: { users: '1.2K', rating: 4.8, sessions: '3.4K' },
    },
    environments: [
      { id: 'ocean-floor',   name: 'Ocean Floor',   icon: '🌊', active: true  },
      { id: 'storm-deck',    name: 'Storm Deck',    icon: '⛈️', active: false },
      { id: 'port-city',     name: 'Port City',     icon: '🏙️', active: false },
      { id: 'arctic-voyage', name: 'Arctic Voyage', icon: '🧊', active: false },
      { id: 'reef-swim',     name: 'Reef Swim',     icon: '🐠', active: false },
      { id: 'combat-bay',    name: 'Combat Bay',    icon: '⚓', active: false },
    ],
  },

  progress: {
    weeklyStats: { label: 'This Week', change: '+12%', workouts: 5, totalMinutes: 145, totalCalories: 1235, avgHeartRate: 76 },
    weeklyChart: [
      { day: 'Mon', minutes: 30, calories: 240 },
      { day: 'Tue', minutes: 25, calories: 200 },
      { day: 'Wed', minutes: 0,  calories: 0   },
      { day: 'Thu', minutes: 35, calories: 280 },
      { day: 'Fri', minutes: 20, calories: 200 },
      { day: 'Sat', minutes: 25, calories: 195 },
      { day: 'Sun', minutes: 10, calories: 120 },
    ],
    monthlyGoals: [
      { id: 'active-days',   label: 'Active Days',     current: 18,   target: 22,   unit: 'days', color: 'blue'   },
      { id: 'total-minutes', label: 'Total Minutes',   current: 420,  target: 600,  unit: 'min',  color: 'green'  },
      { id: 'calories',      label: 'Calories Burned', current: 5200, target: 8000, unit: 'cal',  color: 'orange' },
      { id: 'streak',        label: 'Best Streak',     current: 5,    target: 10,   unit: 'days', color: 'purple' },
    ],
    personalBests: [
      { id: 'longest-session', label: 'Longest Session', value: '45 min',  icon: 'clock'    },
      { id: 'most-calories',   label: 'Most Calories',   value: '480 cal', icon: 'flame'    },
      { id: 'best-streak',     label: 'Best Streak',     value: '12 days', icon: 'trending' },
      { id: 'vr-sessions',     label: 'VR Sessions',     value: '14',      icon: 'vr'       },
    ],
  },

  challenges: {
    active: [
      { id: 'sea-warrior',    name: '30-Day Sea Warrior',  description: 'Complete 30 workouts in 30 days', progress: 18,   target: 30,    daysLeft: 12, reward: '500 pts', badge: '⚔️', color: 'blue'   },
      { id: 'calorie-crusher',name: 'Calorie Crusher',     description: 'Burn 10,000 calories this month', progress: 5200, target: 10000, daysLeft: 14, reward: '750 pts', badge: '🔥', color: 'orange' },
    ],
    available: [
      { id: 'vr-explorer',  name: 'VR Explorer',         description: 'Complete all 6 VR environments',         duration: '14 days', reward: '300 pts', badge: '🥽', difficulty: 'medium' },
      { id: 'early-bird',   name: 'Early Bird Mariner',  description: 'Work out before 0700 for 7 days',         duration: '7 days',  reward: '200 pts', badge: '🌅', difficulty: 'medium' },
      { id: 'iron-sailor',  name: 'Iron Sailor',         description: 'Complete 5 high-intensity workouts',      duration: '10 days', reward: '400 pts', badge: '⚓', difficulty: 'hard'   },
      { id: 'zen-master',   name: 'Zen Master',          description: 'Complete 10 yoga or breathing sessions',  duration: '21 days', reward: '250 pts', badge: '🧘', difficulty: 'easy'   },
    ],
    leaderboard: [
      { rank: 1, name: 'Capt. Rajesh', points: 4850, ship: 'MV Star Phoenix',  initials: 'RK'                },
      { rank: 2, name: 'Elena V.',     points: 4210, ship: 'MV Ocean Pioneer', initials: 'EV'                },
      { rank: 3, name: 'Nipun C.',     points: 3980, ship: 'MV Ocean Pioneer', initials: 'NC', isUser: true  },
      { rank: 4, name: 'Ahmed M.',     points: 3540, ship: 'MV Blue Horizon',  initials: 'AM'                },
      { rank: 5, name: 'Lars H.',      points: 3120, ship: 'MV Nordic Star',   initials: 'LH'                },
    ],
  },
};