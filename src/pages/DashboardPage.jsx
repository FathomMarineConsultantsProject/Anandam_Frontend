import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/layout/AppHeader';
import BottomNav from '../components/layout/BottomNav';
import HeroCard from '../components/home/HeroCard';
import FeatureGrid from '../components/home/FeatureGrid';
import StatsSection from '../components/home/StatsSection';
import AssistantSection from '../components/home/AssistantSection';
import CardGridSection from '../components/home/CardGridSection';
import { homePageMockData } from '../data/homeData';
import { getProfile } from '../api/profileApi';

function getInitials(fullName = '') {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';
}

function DashboardPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile', error);
      }
    }

    loadProfile();
  }, []);

  const pageData = useMemo(() => {
    const base = homePageMockData;

    if (!profile) return base;

    return {
      ...base,
      header: {
        ...base.header,
        userInitials: getInitials(profile.fullName),
        fullName: profile.fullName,
      },
      hero: {
        ...base.hero,
        name: profile.fullName || base.hero.name,
        role: profile.rank || base.hero.role,
        ship: profile.vessel || base.hero.ship,
      },
    };
  }, [profile]);

  function handleFeatureSelect(card) {
    if (!card?.route) return;

    if (card.route.startsWith('http')) {
      window.open(card.route, '_blank', 'noopener,noreferrer');
      return;
    }

    if (card.route.startsWith('tel:')) {
      window.location.href = card.route;
      return;
    }

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