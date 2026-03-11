import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  if (!navigation) return null;

  const { items = [], activeTab = '' } = navigation;

  function handleNavClick(item) {
    if (!item.path) return;
    navigate(item.path);
  }

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = navIconMap[item.icon];

        return (
          <button
            key={item.id}
            type="button"
            className={`bottom-nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
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