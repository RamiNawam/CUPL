'use client';

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import styles from './page.module.css';

interface SponsorFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
}

export default function SponsorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<SponsorFormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<SponsorFormData>>({});

  const sponsors = [
    {
      name: 'Sponsor 1',
      description: 'Supporting student athletes and the growth of padel in Canada.',
    },
    {
      name: 'Sponsor 2',
      description: 'Committed to excellence in university sports.',
    },
    {
      name: 'Sponsor 3',
      description: 'Proud partner of CUPL and student athletics.',
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof SponsorFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof SponsorFormData];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<SponsorFormData> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // TODO: Connect to backend API
    // POST /api/sponsors
    // The backend will send an email to sponsors@cupl.ca with this information

    // For now, log the data and simulate API call
    console.log('Sponsor form submitted:', formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Reset form after showing success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          message: '',
        });
        setIsModalOpen(false);
      }, 2000);
    }, 1500);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setIsSuccess(false);
      setErrors({});
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <h1>Our Sponsors</h1>
        <p className={styles.subtitle}>
          Thank you to our partners who make CUPL possible
        </p>
      </Section>

      <Section className={styles.sponsorsSection}>
        <div className={styles.sponsorsGrid}>
          {sponsors.map((sponsor, index) => (
            <div key={index} className={styles.sponsorCard}>
              <div className={styles.sponsorLogo}>
                {sponsor.name}
              </div>
              <p className={styles.sponsorDescription}>{sponsor.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className={styles.ctaSection}>
        <h2>Become a Sponsor</h2>
        <p>
          Interested in supporting CUPL and reaching university students across Canada? 
          Get in touch with us to learn about sponsorship opportunities.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="large"
          className={styles.ctaButton}
        >
          Become a Sponsor Now!
        </Button>
      </Section>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={closeModal}
              disabled={isSubmitting}
              aria-label="Close modal"
            >
              ×
            </button>

            {isSuccess ? (
              <div className={styles.successMessage}>
                <h3>Thank You!</h3>
                <p>We've received your information and will contact you soon.</p>
              </div>
            ) : (
              <>
                <h2>Become a Sponsor</h2>
                <p className={styles.modalSubtitle}>
                  Fill out the form below and we'll get in touch with you.
                </p>

                <form onSubmit={handleSubmit} className={styles.sponsorForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="companyName">
                      Company/Organization Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={errors.companyName ? styles.error : ''}
                      placeholder="Enter company name"
                      disabled={isSubmitting}
                    />
                    {errors.companyName && (
                      <span className={styles.errorMessage}>{errors.companyName}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="contactName">
                      Contact Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      className={errors.contactName ? styles.error : ''}
                      placeholder="Enter your name"
                      disabled={isSubmitting}
                    />
                    {errors.contactName && (
                      <span className={styles.errorMessage}>{errors.contactName}</span>
                    )}
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">
                        Email <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? styles.error : ''}
                        placeholder="your.email@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <span className={styles.errorMessage}>{errors.email}</span>
                      )}
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(555) 123-4567"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="message">
                      Message <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={errors.message ? styles.error : ''}
                      rows={5}
                      placeholder="Tell us about your interest in sponsoring CUPL..."
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <span className={styles.errorMessage}>{errors.message}</span>
                    )}
                  </div>

                  <div className={styles.formActions}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
