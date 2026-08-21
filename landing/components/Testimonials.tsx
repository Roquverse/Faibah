import styles from './Testimonials.module.css';
import { MessageSquareMore, Play } from 'lucide-react';

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.pill}>Testimonials</div>
          <h2 className={styles.title}>
            People just like you<br />
            are already using Faibah
          </h2>
        </div>

        <div className={styles.masonryGrid}>
          {/* Floating Accents */}
          <div className={styles.floatingSpeech}>
            <MessageSquareMore size={28} />
          </div>
          <div className={styles.floatingYoutube}>
            <Play size={36} color="#ef4444" fill="#ef4444" />
          </div>

          {/* Column 1 */}
          <div className={styles.column}>
            <div className={styles.card}>
              <p className={styles.quote}>"This task manager has completely transformed the way my team works. We now collaborate in real-time and always meet deadlines."</p>
              <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img src="https://i.pravatar.cc/150?u=1" alt="John D." />
                </div>
                <div>
                  <div className={styles.name}>John D.</div>
                  <div className={styles.role}>Marketing Lead</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <p className={styles.quote}>"I love how easy it is to create and assign tasks. The platform's interface makes work feel less overwhelming."</p>
              <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img src="https://i.pravatar.cc/150?u=2" alt="Daniela T." />
                </div>
                <div>
                  <div className={styles.name}>Daniela T.</div>
                  <div className={styles.role}>Operations Manager</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className={styles.column}>
            <div className={styles.card}>
              <p className={styles.quote}>"An essential tool for anyone looking to manage their tasks better."</p>
              <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img src="https://i.pravatar.cc/150?u=3" alt="Sarah W." />
                </div>
                <div>
                  <div className={styles.name}>Sarah W.</div>
                  <div className={styles.role}>Freelance Designer</div>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <p className={styles.quote}>"The time-tracking feature has been a game-changer for my freelance projects. It helps me stay organized and productive."</p>
              <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img src="https://i.pravatar.cc/150?u=4" alt="Alex M." />
                </div>
                <div>
                  <div className={styles.name}>Alex M.</div>
                  <div className={styles.role}>Freelance Developer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className={styles.column}>
            <div className={styles.card}>
              <p className={styles.quote}>"The built-in analytics give me a complete overview of our team's productivity."</p>
              <div className={styles.author}>
                <div className={styles.avatarWrapper}>
                  <img src="https://i.pravatar.cc/150?u=5" alt="Sam J." />
                </div>
                <div>
                  <div className={styles.name}>Sam J.</div>
                  <div className={styles.role}>Project Coordinator</div>
                </div>
              </div>
            </div>

            <div className={`${styles.card} ${styles.videoCard}`}>
              <img src="/mockups/video_review_1787055079833.png" alt="Video Review" className={styles.videoImage} />
              <div className={styles.videoOverlay}>
                <button className={styles.videoButton}>Watch video review</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
