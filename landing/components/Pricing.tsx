import styles from './Pricing.module.css';
import { Check, Zap, X } from 'lucide-react';

export default function Pricing() {
  return (
    <section id="pricing" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.pill}>Pricing</div>
          <h2 className={styles.title}>Simple pricing plans</h2>
        </div>

        <div className={styles.grid}>
          {/* Basic Plan */}
          <div className={styles.card}>
            <div className={styles.planHeader}>
              <div className={styles.planName}>Basic plan</div>
              <div className={styles.planDesc}>Perfect for getting started.</div>
            </div>
            <div className={styles.price}>
              <span className={styles.currency}>₦</span>
              <span className={styles.amount}>900</span>
              <span className={styles.period}>/mo</span>
            </div>
            <button className={styles.buttonOutline}>Get started</button>
            <ul className={styles.features}>
              <li><Check size={16} /> Tasks & Time Tracking</li>
              <li><Check size={16} /> Basic Invoicing</li>
              <li><Check size={16} /> Includes Watermark & Ads</li>
              <li style={{ opacity: 0.5 }}><X size={16} /> No AI or Proposals</li>
              <li style={{ opacity: 0.5 }}><X size={16} /> No Project Page or Schedule</li>
            </ul>
            <div className={styles.learnMoreWrapper}>
              <a href="#" className={styles.learnMore}>Learn more</a>
            </div>
          </div>

          {/* Pro Plan */}
          <div className={`${styles.card} ${styles.cardPro}`}>
            <div className={styles.floatingZap}>
              <Zap size={24} fill="#eab308" color="#eab308" />
            </div>
            <div className={styles.planHeader}>
              <div className={styles.planName}>Pro plan</div>
              <div className={styles.planDesc}>Ideal for growing freelancers.</div>
            </div>
            <div className={styles.price}>
              <span className={styles.currency}>₦</span>
              <span className={styles.amount}>3,500</span>
              <span className={styles.period}>/mo</span>
            </div>
            <div className={styles.bestChoice}>Best choice</div>
            <button className={styles.buttonSolid}>Get started</button>
            <ul className={styles.features}>
              <li><Check size={16} /> Everything in Basic</li>
              <li><Check size={16} /> AI Proposals & Quotations</li>
              <li><Check size={16} /> Full Project Page & Schedule</li>
              <li><Check size={16} /> Channels & Company Management</li>
              <li><Check size={16} /> No Watermarks or Ads</li>
            </ul>
            <div className={styles.learnMoreWrapper}>
              <a href="#" className={styles.learnMore}>Learn more</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
