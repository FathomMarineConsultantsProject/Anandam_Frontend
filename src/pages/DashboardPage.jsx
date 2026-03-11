import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import HeroCard from '../components/home/HeroCard';
import FeatureGrid from '../components/home/FeatureGrid';
import StatsSection from '../components/home/StatsSection';
import AssistantSection from '../components/home/AssistantSection';
import CardGridSection from '../components/home/CardGridSection';
import { homePageMockData } from '../data/homeData';

function DashboardPage() {
  const navigate = useNavigate();
  const pageData = homePageMockData;

  function handleFeatureSelect(card) {
    if (!card?.route) return;
    navigate(card.route);
  }

  return (
    <div className="app-shell">
      <AppHeader header={pageData.header} />

      <main className="page-content">
        <HeroCard hero={pageData.hero} />
        <FeatureGrid
          featureSections={pageData.featureSections}
          onFeatureSelect={handleFeatureSelect}
        />
        <StatsSection wellness={pageData.wellness} />
        <AssistantSection assistant={pageData.assistant} />
        <CardGridSection
          section={pageData.emergencyResponse}
          variant="emergency"
        />
        <CardGridSection
          section={pageData.communicationHub}
          variant="communication"
        />
      </main>

      <BottomNav navigation={pageData.navigation} />
    </div>
  );
}

export default DashboardPage;