import styles from './Solutions.module.css';
import { Sparkles, ListTodo, UserCheck } from 'lucide-react';

export default function Solutions() {
  return (
    <section id="product" className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.pill}>Solutions</div>
          <h2 className={styles.title}>Everything your team needs to <br />smoother workflows</h2>
        </div>

        <div className={styles.grid}>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <Sparkles size={24} color="#FFBA00" />
            </div>
            <p className={styles.text}>
              Keep everyone aligned with seamless task sharing and transparent progress tracking.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <ListTodo size={24} color="#FFBA00" />
            </div>
            <p className={styles.text}>
              Track billable hours, manage projects, and send invoices — all in one place.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.iconWrapper}>
              <UserCheck size={24} color="#FFBA00" />
            </div>
            <p className={styles.text}>
              Automate follow-ups and get paid faster with automated reminders and payment tracking.
            </p>
          </div>
        </div>

        <div className={styles.imageContainer}>
          <img
            src="/solutions.jpeg"
            alt="User Dashboard"
            className={styles.dashboardImage}
          />
        </div>
      </div>
    </section>
  );
}
