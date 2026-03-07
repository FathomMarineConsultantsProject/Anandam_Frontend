import {
  House,
  CalendarDays,
  Heart,
  Clock3,
  Activity,
  TriangleAlert,
} from 'lucide-react';

const navIconMap = {
  home: House,
  calendar: CalendarDays,
  heart: Heart,
  clock: Clock3,
  activity: Activity,
  'alert-triangle': TriangleAlert,
};

function BottomNav({ navigation }) {
  if (!navigation) return null;

  const { items = [], activeTab = '' } = navigation;

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = navIconMap[item.icon];

        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            {Icon ? <Icon size={20} strokeWidth={1.8} /> : null}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;