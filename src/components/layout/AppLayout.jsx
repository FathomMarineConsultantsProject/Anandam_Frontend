import AppHeader from "./AppHeader";
import BottomNav from "./BottomNav";

function AppLayout({ children }) {
  return (
    <div className="anandam-app-layout">
      <AppHeader />
      <BottomNav />

      <main className="anandam-app-layout__content">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;