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

interface Sponsor {
  name: string;
  logo: string | null;
  description: string;
  details: string;
}

const sponsors: Sponsor[] = [
  {
    name: 'PadelGo',
    logo: '/sponsors/PadelGo.png',
    description: '', // Will be shown in modal
    details: 'PadelGo is a leading padel facility and community hub dedicated to growing the sport across Canada. They provide world-class courts and training programs for players of all levels.',
  },
  {
    name: 'PadelFVR',
    logo: '/sponsors/PadelFVR.png',
    description: '', // Will be shown in modal
    details: 'PadelFVR brings the excitement of padel to communities nationwide, offering premium facilities and fostering a vibrant padel culture for enthusiasts and newcomers alike.',
  },
  {
    name: 'Padel22',
    logo: '/sponsors/Padel22.png',
    description: '', // Will be shown in modal
    details: 'Padel22 is committed to excellence in padel, providing top-tier facilities and supporting the development of competitive players and university teams.',
  },
  {
    name: 'SchoolYardSocial',
    logo: '/sponsors/SchoolYardSocial.png',
    description: '', // Will be shown in modal
    details: 'SchoolYardSocial empowers student communities through sports and social engagement, creating opportunities for students to connect, compete, and grow together.',
  },
  {
    name: 'Bounce',
    logo: null,
    description: '', // Will be shown in modal
    details: 'Bounce is dedicated to supporting the next generation of padel players, providing resources and opportunities for young athletes to excel in the sport.',
  },
];

export default function SponsorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
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
                {sponsor.logo ? (
                  <img 
                    src={sponsor.logo} 
                    alt={sponsor.name} 
                    className={styles.sponsorLogoImage}
                  />
                ) : (
                  <div className={styles.sponsorLogoPlaceholder}>
                    {sponsor.name}
                  </div>
                )}
              </div>
              <Button
                onClick={() => {
                  setSelectedSponsor(sponsor);
                  setIsSponsorModalOpen(true);
                }}
                variant="outline"
                size="small"
                className={styles.seeMoreButton}
              >
                See More
              </Button>
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

      {/* Sponsor Details Modal */}
      {isSponsorModalOpen && selectedSponsor && (
        <div className={styles.modalOverlay} onClick={() => setIsSponsorModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setIsSponsorModalOpen(false)}
              aria-label="Close modal"
            >
              ×
            </button>
            <div className={styles.sponsorModalContent}>
              <div className={styles.sponsorModalLogo}>
                {selectedSponsor.logo ? (
                  <img 
                    src={selectedSponsor.logo} 
                    alt={selectedSponsor.name} 
                    className={styles.sponsorModalLogoImage}
                  />
                ) : (
                  <div className={styles.sponsorModalLogoPlaceholder}>
                    {selectedSponsor.name}
                  </div>
                )}
              </div>
              <h2 className={styles.sponsorModalTitle}>{selectedSponsor.name}</h2>
              <p className={styles.sponsorModalDetails}>{selectedSponsor.details}</p>
            </div>
          </div>
        </div>
      )}

      {/* Become a Sponsor Modal */}
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
