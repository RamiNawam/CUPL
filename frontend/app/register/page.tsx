'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api';
import { parseErrorResponse, isErrorCode, ErrorCode } from '@/lib/errors';
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
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  photoConsent: boolean;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const defaultTeamLevel = 'Intermediate';
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    university: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    photoConsent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clubs = [
    'McGill Padel Club',
    'UofT Padel',
    'UTM Padel',
    'HEC Montreal Padel Club',
    'Polysports Padel',
    'Concordia Padel Club',
    'Other',
  ];

  const formatDob = (digits: string) => {
    const template = 'yyyymmdd';
    const padded = `${digits}${template.slice(digits.length)}`.slice(0, 8);
    return `${padded.slice(0, 4)}-${padded.slice(4, 6)}-${padded.slice(6, 8)}`;
  };

  const getIsoDob = (digits: string) => {
    if (digits.length !== 8) return null;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    const field = name as keyof FormData;
    if (name === 'dateOfBirth') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 8);
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: digitsOnly,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
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

    if (!formData.dateOfBirth || formData.dateOfBirth.length !== 8) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const isoDob = getIsoDob(formData.dateOfBirth);
      const birthDate = isoDob ? new Date(isoDob) : null;
      const today = new Date();
      if (!birthDate || Number.isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = 'Please enter a valid date';
      } else if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }

    if (!formData.university) {
      newErrors.university = 'University is required';
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
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please retype your password';
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.photoConsent) {
      newErrors.photoConsent = 'Please accept photo consent';
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
    setErrors({});

    try {
      const response = await fetch(`${getApiUrl()}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          gender: formData.gender,
          dateOfBirth: getIsoDob(formData.dateOfBirth),
          university: formData.university,
          teamLevel: defaultTeamLevel,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || null,
          medicalConditions: null,
          comments: null,
        }),
      });

      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        
        if (errorData && isErrorCode(errorData, ErrorCode.EMAIL_ALREADY_EXISTS)) {
          // Show email-specific error
          setErrors({ 
            email: 'This email is already registered. Try signing in instead.' 
          });
        } else {
          // Handle other validation errors
          const newErrors: FormErrors = {};
          if (errorData?.message) {
            if (errorData.message.toLowerCase().includes('email')) {
              newErrors.email = errorData.message;
            } else {
              newErrors.email = errorData.message;
            }
          } else {
            newErrors.email = 'Sign up failed. Please check your information and try again.';
          }
          setErrors(newErrors);
        }
        setIsSubmitting(false);
        return;
      }

      // Registration successful - automatically sign the user in
      try {
        await login(formData.email, formData.password);
        setIsSubmitting(false);
        setIsSuccess(true);
        // Redirect to home after a brief delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (loginError) {
        // Registration succeeded but auto-login failed
        setIsSubmitting(false);
        setIsSuccess(true);
        // Still show success, user can sign in manually
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setErrors({ email: 'Failed to connect to server. Please try again later.' });
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className={styles.page}>
        <Navbar />
        <Section className={styles.successSection}>
          <div className={styles.successContent}>
            <h2>Sign Up Successful!</h2>
            <p>Your account has been created and you've been signed in automatically.</p>
            <p className={styles.successNote}>
              Redirecting to home page...
            </p>
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
        <h1>Sign Up</h1>
        <p className={styles.intro}>
          Join the Canadian Universities Padel League. Create your account to get started.
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
                <>
                  <span className={styles.errorMessage}>{errors.email}</span>
                  {(errors.email.includes('already registered') || 
                    errors.email.includes('already exists')) && (
                    <Link 
                      href="/" 
                      className={styles.linkButton}
                      style={{ marginTop: '4px', fontSize: '0.875rem', display: 'inline-block' }}
                    >
                      Sign in instead
                    </Link>
                  )}
                </>
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
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="dateOfBirth">
                Date of Birth <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formatDob(formData.dateOfBirth)}
                onChange={handleChange}
                className={`${styles.dateInput} ${errors.dateOfBirth ? styles.error : ''}`}
                inputMode="numeric"
                placeholder="yyyy-mm-dd"
              />
              {errors.dateOfBirth && (
                <span className={styles.errorMessage}>{errors.dateOfBirth}</span>
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
            <div className={styles.formGroup}>
              <label htmlFor="password">
                Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordField}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? styles.error : ''}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">
                Retype Password <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordField}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? styles.error : ''}
                  placeholder="Retype password"
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  disabled={isSubmitting}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className={styles.errorMessage}>{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <div className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  name="photoConsent"
                  checked={formData.photoConsent}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label className={styles.checkboxLabel}>
                  I consent to CUPL using my photos for promotional purposes
                  <span className={styles.required}>*</span>
                </label>
              </div>
              {errors.photoConsent && (
                <span className={styles.errorMessage}>{errors.photoConsent}</span>
              )}
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              variant="primary"
              size="large"
              className={styles.submitButton}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </div>
        </form>
      </Section>
      <Footer />
    </div>
  );
}
