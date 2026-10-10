const DAILY_WISDOM = [
  {
    id: "wisdom-01",
    quote:
      "You do not need to change everything today. One meaningful step is enough.",
    author: "Anandam",
    reflection:
      "Choose one small thing that would make today feel lighter, calmer, or more intentional. Give that one thing your attention.",
  },
  {
    id: "wisdom-02",
    quote:
      "Rest is not time lost. It is part of how you return with clarity.",
    author: "Anandam",
    reflection:
      "A short pause can help your mind reset. Give yourself permission to slow down before moving to the next task.",
  },
  {
    id: "wisdom-03",
    quote:
      "Some days progress looks like moving forward. Other days it looks like staying steady.",
    author: "Anandam",
    reflection:
      "Not every day needs a major achievement. Maintaining your balance can be progress too.",
  },
  {
    id: "wisdom-04",
    quote:
      "You can be grateful for where you are and still hope for something more.",
    author: "Anandam",
    reflection:
      "Appreciation and ambition can exist together. Notice something good around you while keeping space for what comes next.",
  },
  {
    id: "wisdom-05",
    quote:
      "A calm moment does not need to be perfect to be meaningful.",
    author: "Anandam",
    reflection:
      "Look for a small quiet moment today — a cup of tea, a view of the water, a conversation, or simply a few slow minutes.",
  },
  {
    id: "wisdom-06",
    quote:
      "Your attention is valuable. Spend a little of it on yourself today.",
    author: "Anandam",
    reflection:
      "Check in with yourself before the day becomes too busy. Notice what your body and mind may need.",
  },
  {
    id: "wisdom-07",
    quote:
      "You are allowed to move through the day at a pace that keeps you grounded.",
    author: "Anandam",
    reflection:
      "Being productive does not always mean moving quickly. A steady pace can help you make better decisions and feel more present.",
  },
  {
    id: "wisdom-08",
    quote:
      "Small routines can become quiet anchors in changing days.",
    author: "Anandam",
    reflection:
      "Think of one simple routine that helps you feel settled. Protect a few minutes for it today.",
  },
  {
    id: "wisdom-09",
    quote:
      "You do not have to carry every thought with you.",
    author: "Anandam",
    reflection:
      "Notice what is occupying your mind. Some thoughts need action; others can simply be acknowledged and allowed to pass.",
  },
  {
    id: "wisdom-10",
    quote:
      "A difficult moment is part of the day. It does not have to become the whole day.",
    author: "Anandam",
    reflection:
      "When something goes wrong, give yourself an opportunity to reset rather than carrying that moment into everything that follows.",
  },
  {
    id: "wisdom-11",
    quote:
      "Sometimes the most useful thing you can do is create a little space.",
    author: "Anandam",
    reflection:
      "Step away briefly if you can. Distance can make a problem feel clearer and give your mind room to settle.",
  },
  {
    id: "wisdom-12",
    quote:
      "Being present does not require silence. It only requires your attention.",
    author: "Anandam",
    reflection:
      "Whatever is happening around you, spend a moment noticing where you are instead of thinking only about what comes next.",
  },
  {
    id: "wisdom-13",
    quote:
      "You can begin again in the middle of the day.",
    author: "Anandam",
    reflection:
      "A difficult morning does not decide the afternoon. Treat the next hour as a fresh starting point.",
  },
  {
    id: "wisdom-14",
    quote:
      "Taking care of yourself can begin with something very ordinary.",
    author: "Anandam",
    reflection:
      "Drink some water, stretch, step outside, call someone, or sit quietly for a few minutes. Small actions matter.",
  },
  {
    id: "wisdom-15",
    quote:
      "Not every thought deserves an immediate answer.",
    author: "Anandam",
    reflection:
      "When your mind feels busy, allow yourself to leave some questions unresolved for now. Clarity often arrives with time.",
  },
  {
    id: "wisdom-16",
    quote:
      "The day feels different when you notice what is already going well.",
    author: "Anandam",
    reflection:
      "Find one ordinary thing that worked today. It may be small, but noticing it can shift how the rest of the day feels.",
  },
  {
    id: "wisdom-17",
    quote:
      "You can take your responsibilities seriously without forgetting yourself.",
    author: "Anandam",
    reflection:
      "While taking care of what needs to be done, remember to check what you need as well.",
  },
  {
    id: "wisdom-18",
    quote:
      "There is strength in knowing when to keep going and when to pause.",
    author: "Anandam",
    reflection:
      "Ask yourself which would help more right now: another effort, or a short reset.",
  },
  {
    id: "wisdom-19",
    quote:
      "A few quiet minutes can change the way you enter the next part of your day.",
    author: "Anandam",
    reflection:
      "Before moving to your next responsibility, give yourself a small transition instead of rushing directly into it.",
  },
  {
    id: "wisdom-20",
    quote:
      "You do not need a perfect plan to make a useful beginning.",
    author: "Anandam",
    reflection:
      "Start with what you know now. The next step often becomes clearer after you begin.",
  },
  {
    id: "wisdom-21",
    quote:
      "Your wellbeing belongs in your day, not outside of it.",
    author: "Anandam",
    reflection:
      "Wellbeing does not always require extra time. Look for one way to make something you already do a little calmer.",
  },
  {
    id: "wisdom-22",
    quote:
      "Connection can make a heavy day feel a little lighter.",
    author: "Anandam",
    reflection:
      "If someone comes to mind today, consider starting a conversation — even a short one.",
  },
  {
    id: "wisdom-23",
    quote:
      "You can acknowledge that today is difficult without deciding that tomorrow will be the same.",
    author: "Anandam",
    reflection:
      "Give today its own space. Difficult periods change, and each new day creates another opportunity to respond differently.",
  },
  {
    id: "wisdom-24",
    quote:
      "Peace is sometimes found in paying attention to something simple.",
    author: "Anandam",
    reflection:
      "Notice something nearby without trying to change it — the horizon, the weather, a sound, or your own breathing.",
  },
  {
    id: "wisdom-25",
    quote:
      "You are allowed to appreciate the distance you have already travelled.",
    author: "Anandam",
    reflection:
      "Progress can be difficult to notice while you are living through it. Think of something that feels easier now than it once did.",
  },
  {
    id: "wisdom-26",
    quote:
      "A slower response can sometimes be a wiser response.",
    author: "Anandam",
    reflection:
      "When possible, give yourself a moment before reacting. A small pause can create space for a clearer choice.",
  },
  {
    id: "wisdom-27",
    quote:
      "There is no requirement to solve tomorrow while you are still living today.",
    author: "Anandam",
    reflection:
      "Bring your attention back to what actually needs you now. The future can wait for its own moment.",
  },
  {
    id: "wisdom-28",
    quote:
      "Being kind to yourself can make it easier to be steady for everyone else.",
    author: "Anandam",
    reflection:
      "Notice the tone you use with yourself today. Try speaking to yourself with the same patience you would offer someone you care about.",
  },
  {
    id: "wisdom-29",
    quote:
      "You do not have to earn every moment of rest.",
    author: "Anandam",
    reflection:
      "Rest can be preventative, not only something you take after exhaustion. A short break now may help later.",
  },
  {
    id: "wisdom-30",
    quote:
      "What you repeat quietly often matters more than what you do occasionally.",
    author: "Anandam",
    reflection:
      "Choose one small habit worth repeating. Consistency can create change without needing dramatic effort.",
  },
  {
    id: "wisdom-31",
    quote:
      "Today does not have to be extraordinary to be worth remembering.",
    author: "Anandam",
    reflection:
      "Look for one ordinary moment you would like to remember from today. Giving it attention makes it easier to keep.",
  },
];

export default DAILY_WISDOM;