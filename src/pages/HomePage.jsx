import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import HeroCard from '../components/home/HeroCard';
import FeatureGrid from '../components/home/FeatureGrid';
import StatsSection from '../components/home/StatsSection';
import AssistantSection from '../components/home/AssistantSection';
import { homePageMockData } from '../data/homeData';

function HomePage() {
  const pageData = homePageMockData;

  return (
    <div className="app-shell">
      <AppHeader header={pageData.header} />

      <main className="page-content">
        <HeroCard hero={pageData.hero} />
        <FeatureGrid featureSections={pageData.featureSections} />
        <StatsSection wellness={pageData.wellness} />
        <AssistantSection assistant={pageData.assistant} />
      </main>

      <BottomNav navigation={pageData.navigation} />
    </div>
  );
}

export default HomePage;