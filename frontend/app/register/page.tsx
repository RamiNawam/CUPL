'use client';

import { useState, FormEvent } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import styles from './page.module.css';

interface FormData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  university: string;
  universityTeam: string;
  email: string;
  phone: string;
  medicalConditions: string;
  comments: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    university: '',
    universityTeam: '',
    email: '',
    phone: '',
    medicalConditions: '',
    comments: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const clubs = [
    'McGill Padel Club',
    'UofT Padel',
    'UTM Padel',
    'HEC Montreal Padel Club',
    'Polysports Padel',
    'Concordia Padel Club',
    'Other',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!formData.university) {
      newErrors.university = 'University is required';
    }

    if (!formData.universityTeam) {
      newErrors.universityTeam = 'University team is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
    // POST /api/players
    // Handle backend errors (409 for duplicate email, 400 for validation errors)

    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <Navbar />
        <Section className={styles.successSection}>
          <div className={styles.successContent}>
            <h2>Registration Successful!</h2>
            <p>Your player registration has been submitted successfully.</p>
            <p className={styles.successNote}>
              We'll be in touch soon with more details.
            </p>
            <Button href="/" variant="primary" size="medium">
              Return Home
            </Button>
          </div>
        </Section>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <Section className={styles.formSection}>
        <h1>Player Registration</h1>
        <p className={styles.intro}>
          Join the Canadian Universities Padel League. Fill out the form below to register.
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="fullName">
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={errors.fullName ? styles.error : ''}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <span className={styles.errorMessage}>{errors.fullName}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="gender">
                Gender <span className={styles.required}>*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={errors.gender ? styles.error : ''}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && (
                <span className={styles.errorMessage}>{errors.gender}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">
                Date of Birth <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={errors.dateOfBirth ? styles.error : ''}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.dateOfBirth && (
                <span className={styles.errorMessage}>{errors.dateOfBirth}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="university">
                Club <span className={styles.required}>*</span>
              </label>
              <select
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className={errors.university ? styles.error : ''}
              >
                <option value="">Select club</option>
                {clubs.map((club) => (
                  <option key={club} value={club}>
                    {club}
                  </option>
                ))}
              </select>
              {errors.university && (
                <span className={styles.errorMessage}>{errors.university}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="universityTeam">
                University Team <span className={styles.required}>*</span>
              </label>
              <select
                id="universityTeam"
                name="universityTeam"
                value={formData.universityTeam}
                onChange={handleChange}
                className={errors.universityTeam ? styles.error : ''}
              >
                <option value="">Select team</option>
                <option value="1st team">1st Team</option>
                <option value="2nd team">2nd Team</option>
                <option value="3rd team">3rd Team</option>
                <option value="Other">Other</option>
              </select>
              {errors.universityTeam && (
                <span className={styles.errorMessage}>{errors.universityTeam}</span>
              )}
            </div>
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
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="medicalConditions">Medical Conditions</label>
              <textarea
                id="medicalConditions"
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                rows={4}
                placeholder="Please list any medical conditions or allergies..."
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="comments">Additional Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional information you'd like to share..."
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Registration'}
            </Button>
          </div>
        </form>
      </Section>
      <Footer />
    </div>
  );
}
