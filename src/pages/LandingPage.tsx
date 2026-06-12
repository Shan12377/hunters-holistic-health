import { Link } from 'react-router-dom'
import { Shield, Award, Users, BookOpen, Pill, Activity, Heart, ChevronRight, ExternalLink } from 'lucide-react'
import styles from './LandingPage.module.css'
import shared from '../styles/shared.module.css'

const FEATURES = [
  { icon: Heart, color: '#e05c5c', title: 'Blood Pressure Tracker', desc: 'Log readings and visualize trends with AHA-aligned zone color-coding.' },
  { icon: Shield, color: '#c8a74b', title: 'AI Meal Guard', desc: 'Get instant educational insights on food choices before you eat.' },
  { icon: Activity, color: '#0b9e8e', title: 'Daily Command Center', desc: 'Track fasting, meals, supplements, steps, and water in one place.' },
  { icon: Award, color: '#9b59b6', title: 'Weekly Report Card', desc: 'See your consistency score and grade across all wellness habits.' },
  { icon: Users, color: '#4be08a', title: 'Accountability Feed', desc: 'Share wins and encouragement with your private program group.' },
  { icon: BookOpen, color: '#c8a74b', title: 'ROOTS Protocol', desc: 'Follow the structured 30-day functional medicine education curriculum.' },
  { icon: Pill, color: '#9b59b6', title: 'Supplement Log', desc: 'Track your daily supplement protocol with one-tap check-offs.' },
  { icon: ExternalLink, color: '#0b9e8e', title: 'Progress Reports', desc: 'Download shareable HTML reports to review with your educator.' },
]

const TIERS = [
  { name: 'Free', price: '$0', period: '', color: '#91a0ac', features: ['Daily Log', 'BP Tracker (7 days)', 'Protocol Viewer', 'Community Feed'], cta: 'Get Started Free', ctaClass: 'secondary' },
  { name: 'Participant', price: '$19.99', period: '/mo', color: '#c8a74b', features: ['Everything in Free', 'Unlimited BP History', 'AI Meal Guard', 'Weekly Report Card', 'Supplement Log', 'Progress Reports'], cta: 'Start Program', ctaClass: 'primary', popular: true },
  { name: 'VIP', price: '$39.99', period: '/mo', color: '#0b9e8e', features: ['Everything in Participant', '1-on-1 Educator Sessions', 'Custom Protocol', 'Priority Support', 'Fullscript 25% Discount'], cta: 'Apply for VIP', ctaClass: 'teal' },
]

const CTA_CLASSES: Record<string, string> = {
  primary: shared.btnPrimary,
  secondary: shared.btnSecondary,
  teal: shared.btnTeal,
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.navBrand}>
          <img src="/logo.png" alt="Hunter's Holistic Health" className={styles.navLogoImg} />
        </Link>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <Link to="/signup" className={shared.btnPrimary}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          Functional Medicine Education Platform
        </div>
        <h1 className={styles.heroTitle}>
          Take Control of Your<br /><span className={styles.heroGold}>Holistic Health Journey</span>
        </h1>
        <p className={styles.heroSubtitle}>
          Dr. Shallanda Hunter, PharmD guides you through the ROOTS Framework, a structured functional medicine education program with daily tracking, AI-powered insights, and community accountability.
        </p>
        <div className={styles.heroActions}>
          <Link to="/signup" className={shared.btnPrimary}>
            Start Your Journey <ChevronRight size={18} />
          </Link>
          <a href="https://www.drshallandahunter.com" target="_blank" rel="noopener noreferrer" className={shared.btnGhost}>
            Learn More <ExternalLink size={16} />
          </a>
        </div>
        <p className={styles.heroNote}>
          Educational platform only. Not medical advice. Individual results vary.
        </p>
      </section>

      {/* Features */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Everything You Need to Track Your Progress</h2>
        <p className={styles.sectionSubtitle}>Built specifically for functional medicine education participants</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className={styles.featureCard}>
              {/* Icon tint is derived from per-feature data, so it stays inline */}
              <div className={styles.featureIcon} style={{ background: `${color}15`, borderColor: `${color}30` }}>
                <Icon size={20} color={color} />
              </div>
              <h3 className={styles.featureTitle}>{title}</h3>
              <p className={styles.featureDesc}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
        <p className={styles.sectionSubtitle}>Cancel anytime. No hidden fees.</p>
        <div className={styles.pricingGrid}>
          {TIERS.map(({ name, price, period, color, features, cta, ctaClass, popular }) => (
            <div key={name} className={popular ? styles.pricingCardFeatured : styles.pricingCard}>
              {popular && (
                <div className={styles.pricingBadge}>
                  Most Popular
                </div>
              )}
              {/* Tier accent color is data-driven, so it stays inline */}
              <div className={styles.pricingName} style={{ color }}>{name}</div>
              <div className={styles.pricingPrice}>{price}<span className={styles.pricingPeriod}>{period}</span></div>
              <ul className={styles.pricingFeatures}>
                {features.map(f => (
                  <li key={f}>
                    <span className={styles.pricingCheck} style={{ color }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={`${CTA_CLASSES[ctaClass]} ${shared.btnFull}`}>{cta}</Link>
            </div>
          ))}
        </div>
        <p className={styles.pricingNote}>
          Stripe-secured billing. Cancel anytime from your account settings.
          <br />Subscription billing coming soon; currently accepting applications.
        </p>
      </section>

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <div className={styles.disclaimerInner}>
          <div className={styles.disclaimerTitle}>Important Disclaimer</div>
          <p className={styles.disclaimerText}>
            Hunter's Holistic Health is an educational platform operated by Dr. Shallanda Hunter, PharmD in her capacity as a Functional Medicine Educator. Nothing on this platform constitutes medical advice, diagnosis, or treatment. Individual results vary. These statements have not been evaluated by the FDA. Always consult your licensed healthcare provider before making changes to your health regimen.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link to="/join" className={styles.footerLink}>Early Access</Link>
          <Link to="/support" className={styles.footerLink}>Support</Link>
          <Link to="/feature-request" className={styles.footerLink}>Request a Feature</Link>
          <Link to="/clinical-inquiry" className={styles.footerLink}>Clinical Inquiry</Link>
          <Link to="/terms" className={styles.footerLink}>Terms of Service</Link>
          <Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          <a href="https://www.drshallandahunter.com" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>drshallandahunter.com</a>
        </div>
        <p className={styles.footerCopy}>© {new Date().getFullYear()} Hunter's Holistic Health. Dr. Shallanda Hunter, PharmD. All rights reserved.</p>
        <p className={styles.footerAgency}>
          Interested in this system for your practice?{' '}
          <Link to="/support" className={styles.footerAgencyLink}>Contact us.</Link>
        </p>
      </footer>
    </div>
  )
}
