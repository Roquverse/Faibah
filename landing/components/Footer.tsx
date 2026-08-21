import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.logo}>
              <img src="/logo.png" alt="" width={200} />
            </div>
            <h3 className={styles.slogan}>
              Let AI handle the busywork<br />so you can focus on growing.
            </h3>
          </div>

          <div className={styles.linksCol}>
            <div className={styles.linkGroup}>
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">What's New</a>
              <a href="#">Careers</a>
            </div>
            <div className={styles.linkGroup}>
              <a href="#product">Product</a>
              <a href="#solutions">Solutions</a>
              <a href="#features">Integrations</a>
              <a href="#pricing">Price</a>
            </div>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <div className={styles.copyright}>© 2026 Faibah. All rights reserved.</div>
          <div className={styles.legalLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
