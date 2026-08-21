import styles from './Hero.module.css';
import Link from 'next/link';
import { Check, Clock } from 'lucide-react';

export default function Hero() {
  return (
    <section className={styles.heroContainer}>
      {/* Background pattern */}
      <div className={styles.backgroundPattern} />


      {/* Floating Sticky Note - Top Left */}
      <div className={`${styles.floatingElement} ${styles.topLeft}`}>
        <div className={styles.stickyNote}>
          <div className={styles.pin}></div>
          Take notes to keep track of crucial details, and accomplish more tasks with ease.
        </div>
        <div className={styles.checkCard}>
          <div className={styles.checkWrapper}>
            <Check size={28} color="white" strokeWidth={3} />
          </div>
        </div>
      </div>

      {/* Floating Reminders - Top Right */}
      <div className={`${styles.floatingElement} ${styles.topRight}`}>
        <div className={styles.remindersCard}>
          <div className={styles.cardHeader}>Reminders</div>
          <div className={styles.meetingItem}>
            <div className={styles.meetingTitle}>Today's Meeting</div>
            <div className={styles.meetingDesc}>Call with marketing team</div>
            <div className={styles.meetingTime}>
              <Clock size={14} />
              13:00 - 13:45
            </div>
          </div>
        </div>
        <div className={styles.clockIconCard}>
          <Clock size={32} color="#111" strokeWidth={1.5} />
        </div>
      </div>

      {/* Floating Tasks - Bottom Left */}
      <div className={`${styles.floatingElement} ${styles.bottomLeft}`}>
        <div className={styles.tasksCard}>
          <div className={styles.cardHeader}>Today's tasks</div>

          <div className={styles.taskItem}>
            <div className={styles.taskHeader}>
              <div className={`${styles.taskIcon} ${styles.taskIconRed}`}>8</div>
              <div className={styles.taskTitle}>New Ideas for campaign</div>
              <div className={styles.taskAvatars}>
                <div className={styles.taskAvatar} style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=11)' }}></div>
                <div className={styles.taskAvatar} style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=12)' }}></div>
              </div>
            </div>
            <div className={styles.taskProgress}>
              <div className={styles.taskDate}>Sep 10</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFillBlue}></div>
              </div>
              <div className={styles.progressText}>60%</div>
            </div>
          </div>

          <div className={styles.taskItem}>
            <div className={styles.taskHeader}>
              <div className={`${styles.taskIcon} ${styles.taskIconGreen}`}>3</div>
              <div className={styles.taskTitle}>Design PPT #4</div>
              <div className={styles.taskAvatars}>
                <div className={styles.taskAvatar} style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=32)' }}></div>
                <div className={styles.taskAvatar} style={{ backgroundImage: 'url(https://i.pravatar.cc/150?img=44)' }}></div>
              </div>
            </div>
            <div className={styles.taskProgress}>
              <div className={styles.taskDate}>Sep 18</div>
              <div className={styles.progressBar}>
                <div className={styles.progressFillOrange}></div>
              </div>
              <div className={styles.progressText}>112%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Integrations - Bottom Right */}
      <div className={`${styles.floatingElement} ${styles.bottomRight}`}>
        <div className={styles.integrationsCard}>
          <div className={styles.cardHeader}>100+ Integrations</div>
          <div className={styles.integrationsIcons}>
            <div className={styles.integrationIcon}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail" width="36" height="36" />
            </div>
            <div className={styles.integrationIcon} style={{ transform: 'translateY(-12px)', zIndex: 10, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" alt="Slack" width="36" height="36" />
            </div>
            <div className={styles.integrationIcon}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" width="36" height="36" />
            </div>
          </div>
        </div>
      </div>

      {/* Center Text Container */}
      <div className={styles.textContainer}>
        <h1 className={styles.title}>
          <span className={styles.titleBlack}>Do the work. Track it.</span><br />
          <span className={styles.titleGray}>Get paid.</span>
        </h1>
        <p className={styles.subtitle}>
          Faibah brings your projects, tasks, time tracking and invoicing into one simple workspace — so you always know what has been done, what you've billed, and what you're still owed.
        </p>
        <div className={styles.buttonGroup}>
          <Link href={`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login`} className={styles.ctaButton}>
            Try Faibah free &rarr;
          </Link>
          <Link href="#how-it-works" className={styles.ctaButtonSecondary}>
            See how Faibah works
          </Link>
        </div>
        <p className={styles.smallText}>
          Built for freelancers, agencies and growing teams.
        </p>
      </div>
    </section>
  );
}
