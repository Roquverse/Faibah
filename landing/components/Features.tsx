import styles from './Features.module.css';
import { Sparkles, AlertCircle, Clock, DollarSign, ArrowRight } from 'lucide-react';

export default function Features() {
  return (
    <section id="features" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.pill}>Features</div>
          <h2 className={styles.title}>
            Let Faibah handle<br />the busywork.
          </h2>
        </div>

        <div className={styles.content}>
          <div className={styles.leftCol}>
            <div className={styles.imageCard}>
              <img src="/proposal.png" alt="Dashboard" className={styles.laptopImage} />

              <div className={styles.demoBadge}>
                <span className={styles.demoText}>Demo our dashboard.</span>
                <button className={styles.demoButton}>
                  <ArrowRight size={18} color="#111" />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.itemNumber}>01</div>
                <div className={styles.itemTitle}>AI Task Assistant</div>
                <div className={styles.itemDesc}>Turn messy notes into clear tasks.</div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.featureItem}>
                <div className={styles.itemNumber}>02</div>
                <div className={styles.itemTitle}>AI Invoice Assistant</div>
                <div className={styles.itemDesc}>Turn completed work and tracked time into invoice-ready line items.</div>
              </div>
              <div className={styles.divider}></div>
              <div className={styles.featureItem}>
                <div className={styles.itemNumber}>03</div>
                <div className={styles.itemTitle}>AI Project Assistant</div>
                <div className={styles.itemDesc}>Summarize project activity, identify delays and tell you what needs attention.</div>
              </div>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.aiVisualCard}>
                <div className={styles.aiHeader}>
                  <div className={styles.aiAvatarSmall}>
                    <Sparkles size={14} />
                  </div>
                  Faibah AI
                </div>
                <div className={styles.aiQuestion}>
                  "What needs my attention today?"
                </div>
                <div className={styles.aiInsights}>
                  <div className={styles.insightItem}>
                    <div className={`${styles.insightIcon} ${styles.iconRed}`}>
                      <AlertCircle size={14} />
                    </div>
                    <span><strong>3 tasks</strong> are overdue.</span>
                  </div>
                  <div className={styles.insightItem}>
                    <div className={`${styles.insightIcon} ${styles.iconOrange}`}>
                      <Clock size={14} />
                    </div>
                    <span><strong>2 invoices</strong> haven't been paid.</span>
                  </div>
                  <div className={styles.insightItem}>
                    <div className={`${styles.insightIcon} ${styles.iconGreen}`}>
                      <DollarSign size={14} />
                    </div>
                    <span><strong>₦850,000</strong> is outstanding.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
