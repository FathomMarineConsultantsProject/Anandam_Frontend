import { useMemo } from "react";
import {
  Heart,
  AlertTriangle,
  Waves,
  Shield,
  Radio,
  Bell,
  Anchor,
} from "lucide-react";
import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import { homePageMockData } from "../data/homeData";
import "../styles/emergency.css";

function EmergencyPage() {
  const navigation = useMemo(() => {
    return {
      ...homePageMockData.navigation,
      activeTab: "emergency",
    };
  }, []);

  return (
    <div className="app-shell">
      <AppHeader header={homePageMockData.header} />

      <main className="page-content emergency-page">
        {/* A. Emergency Response Hub */}
        <section className="panel-section">
          <div className="section-heading-block">
            <h2 className="section-title-with-icon">
              <span>Emergency Response Hub</span>
            </h2>
            <p className="section-subtitle">
              Comprehensive crisis management and emergency communication system
            </p>
          </div>
        </section>

        {/* B. Emergency Quick Response */}
        <section className="panel-section">
          <div className="section-heading-block">
            <h2 className="section-title-with-icon">
              <span>Emergency Quick Response</span>
            </h2>
          </div>

          <div className="emergency-quick-grid">
            <button className="emergency-quick-btn" type="button">
              <div className="flex flex-col items-center justify-center gap-1">
                <Heart className="w-5 h-5 text-white" strokeWidth={1.8} />
                <span className="text-sm font-medium">Medical Emergency</span>
              </div>
            </button>
            <button className="emergency-quick-btn" type="button">
              <div className="flex flex-col items-center justify-center gap-1">
                <AlertTriangle className="w-5 h-5 text-white" strokeWidth={1.8} />
                <span className="text-sm font-medium">Mental Health Crisis</span>
              </div>
            </button>
            <button className="emergency-quick-btn" type="button">
              <div className="flex flex-col items-center justify-center gap-1">
                <Waves className="w-5 h-5 text-white" strokeWidth={1.8} />
                <span className="text-sm font-medium">Maritime Emergency</span>
              </div>
            </button>
            <button className="emergency-quick-btn" type="button">
              <div className="flex flex-col items-center justify-center gap-1">
                <Shield className="w-5 h-5 text-white" strokeWidth={1.8} />
                <span className="text-sm font-medium">Security Alert</span>
              </div>
            </button>
          </div>
        </section>

        {/* C. Satellite Emergency Communication */}
        <section className="panel-section">
          <div className="section-heading-block">
            <h2 className="section-title-with-icon">
              <span className="emergency-section-icon">
                <Radio className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
              </span>
              <span>Satellite Emergency Communication</span>
            </h2>
          </div>

          <div className="emergency-status-row flex justify-between items-center">
            <span className="emergency-status-label">Connection Status</span>
            <span className="emergency-status-right">
              <span className="emergency-red-dot" aria-hidden="true" />
              <span>Checking...</span>
            </span>
          </div>
        </section>

        {/* D. Active Emergency Alerts */}
        <section className="panel-section">
          <div className="section-heading-block">
            <h2 className="section-title-with-icon">
              <span className="emergency-section-icon">
                <Bell className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
              </span>
              <span>Active Emergency Alerts</span>
            </h2>
          </div>

          <div className="emergency-empty">
            <span>No active emergency alerts</span>
          </div>
        </section>

        {/* E. Marine Emergency Services */}
        <section className="panel-section">
          <div className="section-heading-block">
            <h2 className="section-title-with-icon">
              <span className="emergency-section-icon">
                <Anchor className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
              </span>
              <span>Marine Emergency Services</span>
            </h2>
          </div>
          <div className="emergency-placeholder" />
        </section>
      </main>

      <BottomNav navigation={navigation} />
    </div>
  );
}

export default EmergencyPage;

