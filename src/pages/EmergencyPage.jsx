import AppHeader from "../components/layout/AppHeader";
import BottomNav from "../components/layout/BottomNav";
import { emergencyPageData } from "../data/emergencyData";
import { AlertTriangle, Zap, Radio, Bell, Anchor } from "lucide-react";
import "../styles/global.css";
import "../styles/emergency.css";

function EmergencyPage() {
  const pageData = emergencyPageData;

  return (
    <div className="app-shell">
      <AppHeader header={pageData.header} />

      <main className="page-content">
        <div className="emergency-page">
          <section className="emergency-card">
            <div className="emergency-card-head">
              <div>
                <div className="emergency-card-title">
                  <span className="emergency-card-title-icon" aria-hidden="true">
                    <AlertTriangle className="emergency-icon" strokeWidth={1.6} />
                  </span>
                  <span className="emergency-card-title-text">Emergency Response Hub</span>
                </div>
                <p className="emergency-card-subtitle">
                  Comprehensive crisis management and emergency communication system
                </p>
              </div>
            </div>
          </section>

          <section className="emergency-card">
            <div className="emergency-card-head">
              <div className="emergency-card-title">
                <span className="emergency-card-title-icon" aria-hidden="true">
                  <Zap className="emergency-icon" strokeWidth={1.6} />
                </span>
                <span className="emergency-card-title-text">Emergency Quick Response</span>
              </div>
            </div>

            <div className="emergency-quick-grid">
              <button type="button" className="emergency-quick-btn">
                Medical Emergency
              </button>
              <button type="button" className="emergency-quick-btn">
                Mental Health Crisis
              </button>
              <button type="button" className="emergency-quick-btn">
                Maritime Emergency
              </button>
              <button type="button" className="emergency-quick-btn">
                Security Alert
              </button>
            </div>
          </section>

          <section className="emergency-card">
            <div className="emergency-card-head">
              <div className="emergency-card-title">
                <span className="emergency-card-title-icon" aria-hidden="true">
                  <Radio className="emergency-icon" strokeWidth={1.6} />
                </span>
                <span className="emergency-card-title-text">
                  Satellite Emergency Communication
                </span>
              </div>
            </div>

            <div className="emergency-status-row" aria-label="Connection status">
              <span className="emergency-status-left">Connection Status</span>
              <span className="emergency-status">
                <span className="emergency-status-dot" />
                <span>Checking...</span>
              </span>
            </div>
          </section>

          <section className="emergency-card">
            <div className="emergency-card-head">
              <div className="emergency-card-title">
                <span className="emergency-card-title-icon" aria-hidden="true">
                  <Bell className="emergency-icon" strokeWidth={1.6} />
                </span>
                <span className="emergency-card-title-text">Active Emergency Alerts</span>
              </div>
            </div>

            <div className="emergency-empty-state">No active emergency alerts</div>
          </section>

          <section className="emergency-card">
            <div className="emergency-card-head">
              <div className="emergency-card-title">
                <span className="emergency-card-title-icon" aria-hidden="true">
                  <Anchor className="emergency-icon" strokeWidth={1.6} />
                </span>
                <span className="emergency-card-title-text">Marine Emergency Services</span>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav navigation={pageData.navigation} />
    </div>
  );
}

export default EmergencyPage;

