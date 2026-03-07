import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const primaryCards = [
  {
    icon: '🛡️',
    title: 'Crisis Intervention',
    description:
      '24/7 emergency support with AI-powered risk detection and immediate professional response.',
    iconClass: 'landing-card-icon-red',
  },
  {
    icon: '♡',
    title: 'Professional Care',
    description:
      'Access to licensed psychologists, nutritionists, and lifestyle coaches specializing in maritime wellness.',
    iconClass: 'landing-card-icon-blue',
  },
  {
    icon: '🧠',
    title: 'AI-Powered Support',
    description:
      'Advanced mental health monitoring with 50+ brain training games and personalized wellness recommendations.',
    iconClass: 'landing-card-icon-purple',
  },
];

const featureCards = [
  {
    icon: '💬',
    title: 'Unified Communications',
    description:
      'Connect with family and support through Email, WhatsApp, Telegram, Botim, and Instagram in one place.',
    iconClass: 'landing-feature-icon-green',
  },
  {
    icon: '🧠',
    title: 'Brain Training Games',
    description:
      'Over 50 cognitive exercises targeting memory, attention, problem-solving, and processing speed.',
    iconClass: 'landing-feature-icon-blue',
  },
  {
    icon: '👥',
    title: 'Community Blogging',
    description:
      'Share experiences and learn from fellow seafarers in our supportive wellness community.',
    iconClass: 'landing-feature-icon-purple',
  },
  {
    icon: '♡',
    title: 'SIRE 2.0 Integration',
    description:
      'Performance Influencing Factors tracking for comprehensive maritime wellness compliance.',
    iconClass: 'landing-feature-icon-red',
  },
  {
    icon: '🛡️',
    title: 'AI Mental Health Monitoring',
    description:
      'Advanced NLP analysis of communications and journals for early crisis detection and intervention.',
    iconClass: 'landing-feature-icon-orange',
  },
  {
    icon: '⚓',
    title: 'Maritime-Specific Support',
    description:
      'Wellness programs designed for the unique challenges of life at sea and maritime work environments.',
    iconClass: 'landing-feature-icon-teal',
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-root">
      <header className="landing-header">
        <div className="landing-header-inner">
          <div className="landing-brand">
            <div className="landing-brand-logo">
              <div className="landing-brand-logo-core">🧘</div>
              <span className="landing-brand-logo-dot" />
            </div>

            <div className="landing-brand-text">
              <h1>Anandam by Fathom</h1>
              <p>Wellness for Seafarers</p>
            </div>
          </div>

          <button
            type="button"
            className="landing-signin-btn"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-logo">
            <div className="landing-hero-logo-core">🧘</div>
            <span className="landing-hero-logo-dot" />
          </div>

          <h2 className="landing-hero-title">Anandam by Fathom</h2>
          <p className="landing-hero-subtitle">Wellness for Seafarers</p>

          <h3 className="landing-hero-tagline">
            Your Mental Wellness Journey <span>Starts Here</span>
          </h3>

          <p className="landing-hero-description">
            A comprehensive platform designed specifically for seafarers, combining
            crisis intervention, professional support, AI-powered wellness tracking,
            and unified communications to support your mental health journey at sea.
          </p>

          <div className="landing-primary-grid">
            {primaryCards.map((card) => (
              <article key={card.title} className="landing-primary-card">
                <div className={`landing-card-icon ${card.iconClass}`}>{card.icon}</div>
                <h4>{card.title}</h4>
                <p>{card.description}</p>
              </article>
            ))}
          </div>

          <button
            type="button"
            className="landing-primary-cta"
            onClick={() => navigate('/signup')}
          >
            Start Your Wellness Journey
          </button>
        </section>

        <section className="landing-features-section">
          <h3 className="landing-section-title">Comprehensive Wellness Features</h3>

          <div className="landing-features-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="landing-feature-card">
                <div className={`landing-feature-icon ${feature.iconClass}`}>{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-bottom-cta">
          <div className="landing-bottom-cta-box">
            <h3>Ready to Prioritize Your Mental Wellness?</h3>
            <p>
              Join thousands of seafarers who have transformed their mental health
              journey with our comprehensive platform.
            </p>
            <button type="button" onClick={() => navigate('/signup')}>
              Get Started Today
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>
          © 2024 Seafarer Wellness Hub. Comprehensive mental health support for
          maritime professionals.
        </p>

        <div className="landing-footer-links">
          <button type="button">Privacy Policy</button>
          <button type="button">Terms of Service</button>
          <button type="button">Emergency Support</button>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;