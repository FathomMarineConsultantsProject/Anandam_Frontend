import { useNavigate } from "react-router-dom";
import {
  House,
  Calendar,
  Heart,
  Clock,
  Activity,
  TriangleAlert,    
} from "lucide-react";

const navIconMap = {
  home: House,
  calendar: Calendar,
  heart: Heart,
  clock: Clock,
  activity: Activity,
  "alert-triangle": TriangleAlert,
};

function BottomNav({ navigation }) {
  const navigate = useNavigate();

  if (!navigation) return null;

  const { items = [], activeTab = "" } = navigation;

  function handleNavClick(item) {
    if (!item.path) return;
    navigate(item.path);
  }

  return (
    <nav className="pd-bottom-nav">
      <div className="pd-bottom-nav-grid">
        {items.map((item) => {
          const Icon = navIconMap[item.icon];
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`pd-bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
            >
              {Icon ? <Icon size={20} strokeWidth={2} /> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;