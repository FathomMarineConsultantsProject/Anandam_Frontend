import {
  House,
  CalendarDays,
  Heart,
  Clock3,
  Activity,
  TriangleAlert,
} from 'lucide-react';

const navItems = [
  { id: 1, label: 'Home', icon: House, active: true },
  { id: 2, label: 'Perfect Day', icon: CalendarDays, active: false },
  { id: 3, label: 'Mood', icon: Heart, active: false },
  { id: 4, label: 'Work/Rest', icon: Clock3, active: false },
  { id: 5, label: 'Fitness', icon: Activity, active: false },
  { id: 6, label: 'Emergency', icon: TriangleAlert, active: false },
];

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${item.active ? 'active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;