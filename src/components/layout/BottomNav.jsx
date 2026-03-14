// components/layout/BottomNav.jsx
// ---------------------------------------------------------------------------
// Auto-detects the active tab from the current URL using useLocation,
// so the blue highlight always reflects where you are — no matter which
// page you navigate to. The activeTab prop is used as a fallback only.
// ---------------------------------------------------------------------------

import { useNavigate, useLocation } from "react-router-dom";
import {
  House,
  Calendar,
  Heart,
  Clock,
  Activity,
  TriangleAlert,
} from "lucide-react";

const navIconMap = {
  home:            House,
  calendar:        Calendar,
  heart:           Heart,
  clock:           Clock,
  activity:        Activity,
  "alert-triangle": TriangleAlert,
};

function BottomNav({ navigation }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!navigation) return null;

  const { items = [], activeTab = "" } = navigation;

  // Derive active tab from the current URL path.
  // Falls back to the prop value if no item path matches.
  function getActiveId() {
    const currentPath = location.pathname;

    // Exact or prefix match — longest match wins
    let matched = null;
    let matchLen = 0;
    for (const item of items) {
      if (!item.path) continue;
      if (
        (currentPath === item.path || currentPath.startsWith(item.path + "/")) &&
        item.path.length > matchLen
      ) {
        matched = item.id;
        matchLen = item.path.length;
      }
    }
    return matched ?? activeTab;
  }

  const activeId = getActiveId();

  function handleNavClick(item) {
    if (!item.path) return;
    navigate(item.path);
  }

  return (
    <nav className="pd-bottom-nav">
      <div className="pd-bottom-nav-grid">
        {items.map((item) => {
          const Icon    = navIconMap[item.icon];
          const isActive = activeId === item.id;

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