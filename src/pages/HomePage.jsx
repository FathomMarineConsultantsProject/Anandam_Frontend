import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';

function HomePage() {
  return (
    <div className="app-shell">
      <AppHeader />

      <main className="page-content">
        {/* 
          Step by step we will add all sections here.
          Right now only blank content area is shown after header.
        */}
      </main>

      <BottomNav />
    </div>
  );
}

export default HomePage;