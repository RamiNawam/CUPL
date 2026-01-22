'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { fetchWithAuth } from '@/lib/api';
import styles from './page.module.css';

export default function CreateClubPage() {
  const { isAdmin, user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push('/');
    } else {
      setIsChecking(false);
    }
  }, [isAdmin, isChecking, router]);

  if (isChecking || !isAdmin) {
    return (
      <div className={styles.page}>
        <Navbar />
        <Section className={styles.heroSection}>
          <h1>Loading...</h1>
        </Section>
        <Footer />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Club name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

    try {
      const response = await fetchWithAuth('/api/clubs', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      }, user?.token);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create club account');
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
        });
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating club:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create club account. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <h1>Create Club Account</h1>
        <p className={styles.subtitle}>
          Create a new club account for university padel clubs
        </p>
      </Section>

      <Section className={styles.formSection}>
        {isSuccess ? (
          <div className={styles.successMessage}>
            <h3>Club Account Created Successfully!</h3>
            <p>The club account has been created and teams have been initialized.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">
                Club Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? styles.error : ''}
                placeholder="e.g., McGill Padel Club"
                disabled={isSubmitting}
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
            </div>

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
                placeholder="e.g., club@university.edu"
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">
                Password <span className={styles.required}>*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? styles.error : ''}
                placeholder="Enter password (min 6 characters)"
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            {errors.submit && (
              <div className={styles.errorMessage}>{errors.submit}</div>
            )}

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Club Account'}
              </Button>
            </div>
          </form>
        )}
      </Section>

      <Footer />
    </div>
  );
}
