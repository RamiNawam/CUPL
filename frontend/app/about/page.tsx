'use client';

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function AboutPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // TODO: Connect to backend or email service
    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    }, 1500);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <h1>About</h1>
        <p className={styles.subtitle}>
          Learn about CUPL and get in touch with us
        </p>
      </Section>

      {/* About Section */}
      <Section className={styles.aboutSection}>
        <div className={styles.content}>
          <h2>What is CUPL?</h2>
          <p>
            The Canadian Universities Padel League (CUPL) is a student-run organization 
            dedicated to bringing competitive padel to universities across Canada. 
            We believe in fostering both competition and community, creating opportunities 
            for students to compete at the highest level while building lasting connections.
          </p>
        </div>

        <div className={styles.content}>
          <h2>Our Origin Story</h2>
          <p>
            CUPL was founded by two McGill University students who saw the need for 
            a unified padel league across Canadian universities. What started as a 
            vision to bring students together through sport has grown into a thriving 
            community of athletes, supporters, and enthusiasts.
          </p>
        </div>

        <div className={styles.content}>
          <h2>Our Mission</h2>
          <p>
            Our mission is twofold: to provide a platform for competitive padel 
            competition among Canadian universities, and to build a strong, inclusive 
            community of players who share a passion for the sport. We're committed to 
            making padel accessible to students while maintaining the highest standards 
            of competition.
          </p>
        </div>
      </Section>

      <Footer />
    </div>
  );
}
