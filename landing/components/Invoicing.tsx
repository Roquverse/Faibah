"use client";

import { useState } from 'react';
import styles from './Invoicing.module.css';
import { CheckCheck, ChevronRight, Zap, Layers, Cpu } from 'lucide-react';

const invoiceData = [
  {
    title: "AI-generated invoices",
    category: "Smart Creation",
    desc: "Turn completed tasks and tracked time into invoice line items in seconds."
  },
  {
    title: "Client payment portal",
    category: "Hosted Invoice Page",
    desc: "A secure, branded portal for your clients to view and pay easily."
  },
  {
    title: "Automated follow-ups",
    category: "Smart Reminders",
    desc: "Let Faibah AI handle the awkward follow-ups for overdue payments."
  },
  {
    title: "Accept payments anywhere",
    category: "Multi-currency",
    desc: "Receive payments securely across borders in multiple currencies."
  },
  {
    title: "Instant reconciliation",
    category: "Financial Insights",
    desc: "Automatically match payments to invoices and track your outstanding balances."
  }
];

export default function Invoicing() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.darkText}>Automated</span> <span className={styles.lightText}>invoicing for</span><br />
            <span className={styles.lightText}>modern</span> <span className={styles.darkText}>professionals</span>
          </h2>
          
          <div className={styles.badges}>
            <div className={`${styles.badge} ${styles.badgePink}`}>
              <Zap size={14} /> Efficiency
            </div>
            <div className={`${styles.badge} ${styles.badgePurple}`}>
              <Layers size={14} /> Streamline
            </div>
            <div className={`${styles.badge} ${styles.badgeGreen}`}>
              <Cpu size={14} /> Automation
            </div>
          </div>
        </div>

        <div className={styles.list}>
          {invoiceData.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={index} 
                className={`${styles.row} ${isActive ? styles.rowActive : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={styles.rowLeft}>
                  <CheckCheck 
                    size={20} 
                    className={isActive ? styles.iconActive : styles.iconInactive} 
                  />
                  <span className={styles.rowTitle}>{item.title}</span>
                </div>
                
                <div className={styles.rowMiddle}>
                  {item.category}
                </div>
                
                <div className={styles.rowRight}>
                  <p className={styles.rowDesc}>{item.desc}</p>
                  <div className={styles.chevronWrapper}>
                    <ChevronRight size={18} className={styles.chevronIcon} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
