import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import logoMark from '../assets/landing/anandam-logo-mark.png';
import logoFull from '../assets/landing/anandam-logo-full.png';
import meditationIcon from '../assets/landing/anandam-meditation.png';
import aboutWave from '../assets/landing/about-wave.png';
import heroPoster from '../assets/landing/anandam-hero-poster.png';
import benefitsPoster from '../assets/landing/anandam-benefits-poster.png';
import heroVideo from '../assets/landing/anandam-hero.mp4';
import benefitsVideo from '../assets/landing/anandam-benefits.mp4';
import footerBackground from '../assets/landing/footer-background.png';
import unifiedIllustration from '../assets/landing/service-unified.png';
import brainIllustration from '../assets/landing/service-brain.png';
import communityIllustration from '../assets/landing/service-community.png';
import sireIllustration from '../assets/landing/service-sire.png';
import aiIllustration from '../assets/landing/service-ai.png';
import maritimeIllustration from '../assets/landing/service-maritime.png';

import '../styles/landing.css';


const benefitCards = [
  {
    id: 'focus',
    area: 'focus',
    activeMarks: 1,
    title: 'Focus Becomes Clearer',
    description:
      'A calmer mind supports better concentration, awareness and decision-making.',
  },
  {
    id: 'rest',
    area: 'rest',
    activeMarks: 2,
    title: 'Rest Comes More Easily',
    description:
      'Slowing down helps your body unwind and prepare for more restful sleep.',
  },
  {
    id: 'emotional-balance',
    area: 'emotional',
    activeMarks: 3,
    title: 'Emotional Balance',
    description:
      'A pause creates space to understand and respond to difficult feelings.',
  },
  {
    id: 'connections',
    area: 'connections',
    activeMarks: 4,
    title: 'Stronger Connections',
    description:
      'Being present makes it easier to connect with crew and loved ones.',
  },
];

const aboutCards = [
  {
    id: 'early-support',
    activeMarks: 1,
    title: 'Early Support and Intervention',
    description:
      'Identifies wellbeing concerns early and connects crew with timely support.',
  },
  {
    id: 'professional-care',
    activeMarks: 2,
    title: 'Professional Maritime Care',
    description:
      'Confidential access to wellness professionals who understand life at sea.',
  },
  {
    id: 'ai-powered-wellness',
    activeMarks: 3,
    title: 'AI-Powered Wellness',
    description:
      'Tracks wellbeing and provides personalised support for healthier daily habits.',
  },
];

const serviceCards = [
  {
    id: 'unified-communications',
    title: 'Unified Communications',
    description:
      'Connect with family and support through Email, WhatsApp, Telegram, Botim, and Instagram in one place.',
    image: unifiedIllustration,
    background: '#F3EADF',
  },
  {
    id: 'brain-training',
    title: 'Brain Training Games',
    description:
      'Over 50 cognitive exercises targeting memory, attention, problem-solving, and processing speed.',
    image: brainIllustration,
    background: '#ECF2E9',
  },
  {
    id: 'community-blogging',
    title: 'Community Blogging',
    description:
      'Share experiences and learn from fellow seafarers in our supportive wellness community.',
    image: communityIllustration,
    background: '#F2ECE9',
  },
  {
    id: 'sire-integration',
    title: 'SIRE 2.0 Integration',
    description:
      'Performance Influencing Factors tracking for comprehensive maritime wellness compliance.',
    image: sireIllustration,
    background: '#EEF3DF',
  },
  {
    id: 'ai-monitoring',
    title: 'AI Mental Health Monitoring',
    description:
      'Advanced NLP analysis of communications and journals for early crisis detection and intervention.',
    image: aiIllustration,
    background: '#E9EBF2',
  },
  {
    id: 'maritime-support',
    title: 'Maritime-Specific Support',
    description:
      'Wellness programs designed for the unique challenges of life at sea and maritime work environments.',
    image: maritimeIllustration,
    background: '#F2ECE9',
  },
];

function SectionBadge({ children, wide = false }) {
  return (
    <div
      className={`anandam-section-badge${wide ? ' anandam-section-badge--wide' : ''}`}
    >
      <span className="anandam-section-badge__dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function ProgressMarks({ active, total, variant = 'benefits' }) {
  return (
    <div
      className={`anandam-progress anandam-progress--${variant}`}
      aria-hidden="true"
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`anandam-progress__mark${
            index < active ? ' anandam-progress__mark--active' : ''
          }`}
        />
      ))}
    </div>
  );
}

function BackgroundVideo({ className, src, poster, preload = 'metadata' }) {
  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      poster={poster}
      controls={false}
      controlsList="nodownload nofullscreen noremoteplayback"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let animationFrame = 0;

    const updateNavbar = () => {
      if (animationFrame) return;

      animationFrame = window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 28);
        animationFrame = 0;
      });
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateNavbar);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  const scrollToSection = (sectionId) => {
    setIsMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const openLogin = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const openSignup = () => {
    setIsMenuOpen(false);
    navigate('/signup');
  };

  return (
    <div className="anandam-landing-page">
      <header
        className={`anandam-floating-nav${
          isScrolled ? ' anandam-floating-nav--scrolled' : ''
        }${isMenuOpen ? ' anandam-floating-nav--menu-open' : ''}`}
      >
        <div className="anandam-floating-nav__inner">
          <button
            type="button"
            className="anandam-floating-nav__logo-button"
            onClick={() => scrollToSection('home')}
            aria-label="Go to the top of the Anandam page"
          >
            <img src={logoMark} alt="Anandam" />
          </button>

          <nav
            id="anandam-primary-navigation"
            className="anandam-floating-nav__links"
            aria-label="Primary navigation"
          >
            <button type="button" onClick={() => scrollToSection('about')}>
              About
            </button>
            <button type="button" onClick={() => scrollToSection('services')}>
              Service
            </button>
            <button type="button" onClick={() => scrollToSection('contact')}>
              Contact
            </button>
            <button
              type="button"
              className="anandam-floating-nav__login"
              onClick={openLogin}
            >
              Login
            </button>
          </nav>

          <button
            type="button"
            className="anandam-floating-nav__menu-button"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="anandam-primary-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="anandam-hero" aria-labelledby="hero-title">
          <BackgroundVideo
            className="anandam-hero__video"
            src={heroVideo}
            poster={heroPoster}
            preload="auto"
          />
          <div className="anandam-hero__colour-overlay" aria-hidden="true" />
          <div className="anandam-hero__gradient" aria-hidden="true" />

          <div className="anandam-hero__content">
            <h1 id="hero-title">
              <span>Breathe and</span>
              <span>live with</span>
              <span>balance</span>
            </h1>

            <div className="anandam-hero__aside">
              <p>
                Make space for calm, clarity and healthier habits with thoughtful
                tools and support designed for everyday wellbeing.
              </p>

              <button
                type="button"
                className="anandam-button anandam-button--hero"
                onClick={() => scrollToSection('about')}
              >
                Explore Anandam
              </button>
            </div>
          </div>
        </section>

        <section
          id="benefits"
          className="anandam-lined-section anandam-benefits"
          aria-labelledby="benefits-title"
        >
          <div className="anandam-section-inner anandam-benefits__inner">
            <div className="anandam-benefits__heading">
              <SectionBadge>Benefits</SectionBadge>

              <div className="anandam-centred-copy anandam-centred-copy--benefits">
                <h2 id="benefits-title">
                  <span>What happens when</span>
                  <span>you slow down</span>
                </h2>
                <p>
                  The answers were always there. You just needed the stillness to
                  hear them.
                </p>
              </div>
            </div>

            <div className="anandam-benefits__grid">
              <article className="anandam-benefits__visual-card">
                <BackgroundVideo
                  className="anandam-benefits__video"
                  src={benefitsVideo}
                  poster={benefitsPoster}
                />
                <div
                  className="anandam-benefits__visual-gradient"
                  aria-hidden="true"
                />
                <div className="anandam-benefits__visual-copy">
                  <h3>Stress melts away</h3>
                  <p>
                    Your nervous system finally gets to rest. Everything else
                    follows.
                  </p>
                </div>
              </article>

              {benefitCards.map((card) => (
                <article
                  key={card.id}
                  className="anandam-benefit-card"
                  style={{ gridArea: card.area }}
                >
                  <ProgressMarks active={card.activeMarks} total={4} />
                  <div className="anandam-benefit-card__copy">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="about"
          className="anandam-lined-section anandam-about"
          aria-labelledby="about-title"
        >
          <img
            src={aboutWave}
            alt=""
            className="anandam-about__wave"
            aria-hidden="true"
          />

          <div className="anandam-section-inner anandam-about__inner">
            <div className="anandam-about__heading">
              <SectionBadge>About Anandum</SectionBadge>

              <div className="anandam-about__intro">
                <img
                  src={meditationIcon}
                  alt=""
                  className="anandam-meditation-icon"
                  aria-hidden="true"
                />

                <div className="anandam-about__content">
                  <div className="anandam-centred-copy anandam-centred-copy--about">
                    <h2 id="about-title">
                      <span>Wellbeing Support</span>
                      <span>Built for Life at Sea</span>
                    </h2>
                    <p>
                      Anandam by Fathom supports seafarer wellbeing through early
                      risk detection, confidential professional care and AI-powered
                      wellness tools.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="anandam-button anandam-button--primary"
                    onClick={openSignup}
                  >
                    Start Your Wellness Journey
                  </button>
                </div>
              </div>
            </div>

            <div className="anandam-about__cards">
              {aboutCards.map((card) => (
                <article key={card.id} className="anandam-about-card">
                  <ProgressMarks
                    active={card.activeMarks}
                    total={3}
                    variant="about"
                  />
                  <div className="anandam-about-card__copy">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="services"
          className="anandam-lined-section anandam-services"
          aria-labelledby="services-title"
        >
          <div className="anandam-section-inner anandam-services__inner">
            <div className="anandam-services__heading">
              <SectionBadge wide>HOW ANANDAM SUPPORTS YOUR CREW</SectionBadge>

              <div className="anandam-services__intro">
                <img
                  src={meditationIcon}
                  alt=""
                  className="anandam-meditation-icon"
                  aria-hidden="true"
                />

                <div className="anandam-centred-copy anandam-centred-copy--services">
                  <h2 id="services-title">
                    <span>Complete Wellbeing</span>
                    <span>Support in One Platform</span>
                  </h2>
                  <p>
                    From communication and cognitive training to AI-powered
                    monitoring, Anandam provides practical tools designed for the
                    realities of life at sea.
                  </p>
                </div>
              </div>
            </div>

            <div className="anandam-services__grid">
              {serviceCards.map((card) => (
                <article
                  key={card.id}
                  className="anandam-service-card"
                  style={{ '--anandam-card-bg': card.background }}
                >
                  <img
                    src={card.image}
                    alt=""
                    className="anandam-service-card__illustration"
                    aria-hidden="true"
                  />
                  <div className="anandam-service-card__copy">
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="anandam-footer">
        <img
          src={footerBackground}
          alt=""
          className="anandam-footer__background"
          aria-hidden="true"
        />
        <div className="anandam-footer__shade" aria-hidden="true" />

        <div className="anandam-footer__inner">
          <div className="anandam-footer__cta">
            <div className="anandam-centred-copy anandam-centred-copy--footer">
              <h2>
                <span>Ready to Prioritize Your</span>
                <span>Mental Wellness?</span>
              </h2>
              <p>
                Join thousands of seafarers who have transformed their mental
                health journey with our comprehensive platform.
              </p>
            </div>

            <button
              type="button"
              className="anandam-button anandam-button--light"
              onClick={openSignup}
            >
              Get Started Today
            </button>
          </div>

          <div className="anandam-footer__details">
            <div className="anandam-footer__logo-column">
              <button
                type="button"
                className="anandam-footer__logo-button"
                onClick={() => scrollToSection('home')}
                aria-label="Go to the top of the Anandam page"
              >
                <img src={logoFull} alt="Anandam" />
              </button>
            </div>

            <nav className="anandam-footer__column" aria-label="Footer navigation">
              <h3>Links</h3>
              <div className="anandam-footer__links">
                <button type="button" onClick={() => scrollToSection('home')}>
                  Home
                </button>
                <button type="button" onClick={() => scrollToSection('about')}>
                  About us
                </button>
                <button type="button" onClick={() => scrollToSection('services')}>
                  Service
                </button>
                <button type="button" onClick={() => scrollToSection('contact')}>
                  Contact
                </button>
              </div>
            </nav>

            <div className="anandam-footer__column">
              <h3>Contact us</h3>
              <div className="anandam-footer__links">
                <a href="tel:+447473819363">+44 7473 819363</a>
                <a href="mailto:contact@fathommarineconsultants.com">
                  contact@fathommarineconsultants.com
                </a>
              </div>
            </div>

            <div className="anandam-footer__column">
              <h3>Find us</h3>
              <address>
                15 Maritime Chambers St. Katharine&apos;s Way London E1W 1AA UK
              </address>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
