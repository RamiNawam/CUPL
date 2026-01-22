'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl } from '@/lib/api';
import Button from './Button';
import styles from './SignInModal.module.css';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sign Up state
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    university: '',
    universityTeam: '',
    email: '',
    password: '',
    phone: '',
    medicalConditions: '',
    comments: '',
  });
  const [signUpErrors, setSignUpErrors] = useState<{ [key: string]: string }>({});

  const clubs = [
    'McGill Padel Club',
    'UofT Padel',
    'UTM Padel',
    'HEC Montreal Padel Club',
    'Polysports Padel',
    'Concordia Padel Club',
    'Other',
  ];

  if (!isOpen) return null;

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      onClose();
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (signUpErrors[name]) {
      setSignUpErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateSignUp = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!signUpData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!signUpData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!signUpData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(signUpData.dateOfBirth);
      const today = new Date();
      if (birthDate >= today) {
        newErrors.dateOfBirth = 'Date of birth must be in the past';
      }
    }
    if (!signUpData.university) {
      newErrors.university = 'Club is required';
    }
    if (!signUpData.universityTeam) {
      newErrors.universityTeam = 'University team is required';
    }
    if (!signUpData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!signUpData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setSignUpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateSignUp()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${getApiUrl()}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: signUpData.fullName,
          gender: signUpData.gender,
          dateOfBirth: signUpData.dateOfBirth,
          university: signUpData.university,
          teamLevel: signUpData.universityTeam,
          email: signUpData.email,
          password: signUpData.password,
          phone: signUpData.phone || null,
          medicalConditions: signUpData.medicalConditions || null,
          comments: signUpData.comments || null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Sign up failed. Please try again.';
        
        if (response.status === 409) {
          errorMessage = 'Email already exists. Please use a different email or sign in instead.';
          setSignUpErrors({ email: errorMessage });
        } else if (response.status === 400) {
          errorMessage = 'Invalid data. Please check your information.';
          try {
            const errorData = JSON.parse(errorText);
            const newErrors: { [key: string]: string } = {};
            if (errorData.message) {
              newErrors.email = errorData.message;
            }
            setSignUpErrors(newErrors);
          } catch {
            setSignUpErrors({ email: errorMessage });
          }
        } else {
          setSignUpErrors({ email: errorMessage });
        }
        setIsSubmitting(false);
        return;
      }

      // Registration successful - automatically sign the user in
      try {
        await login(signUpData.email, signUpData.password);
        onClose();
        // Reset form
        setSignUpData({
          fullName: '',
          gender: '',
          dateOfBirth: '',
          university: '',
          universityTeam: '',
          email: '',
          password: '',
          phone: '',
          medicalConditions: '',
          comments: '',
        });
        setMode('signin');
      } catch (loginError) {
        // Registration succeeded but auto-login failed
        setError('Account created but failed to sign in. Please sign in manually.');
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setError('');
      setEmail('');
      setPassword('');
      setSignUpData({
        fullName: '',
        gender: '',
        dateOfBirth: '',
        university: '',
        universityTeam: '',
        email: '',
        password: '',
        phone: '',
        medicalConditions: '',
        comments: '',
      });
      setSignUpErrors({});
      setMode('signin');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeButton}
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signin' ? styles.activeTab : ''}`}
            onClick={() => {
              setMode('signin');
              setError('');
              setSignUpErrors({});
            }}
            disabled={isSubmitting}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => {
              setMode('signup');
              setError('');
              setSignUpErrors({});
            }}
            disabled={isSubmitting}
          >
            Sign Up
          </button>
        </div>

        {mode === 'signin' ? (
          <>
            <h2>Sign In</h2>
            <p className={styles.subtitle}>Enter your credentials to access your account</p>

            <form onSubmit={handleSignIn} className={styles.form}>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>Sign Up</h2>
            <p className={styles.subtitle}>Create your account to join CUPL</p>

            <form onSubmit={handleSignUp} className={styles.signUpForm}>
              {(error || Object.keys(signUpErrors).length > 0) && (
                <div className={styles.errorMessage}>
                  {error || Object.values(signUpErrors)[0]}
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={signUpData.fullName}
                    onChange={handleSignUpChange}
                    className={signUpErrors.fullName ? styles.error : ''}
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                  />
                  {signUpErrors.fullName && (
                    <span className={styles.fieldError}>{signUpErrors.fullName}</span>
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
                    value={signUpData.gender}
                    onChange={handleSignUpChange}
                    className={signUpErrors.gender ? styles.error : ''}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {signUpErrors.gender && (
                    <span className={styles.fieldError}>{signUpErrors.gender}</span>
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
                    value={signUpData.dateOfBirth}
                    onChange={handleSignUpChange}
                    className={signUpErrors.dateOfBirth ? styles.error : ''}
                    max={new Date().toISOString().split('T')[0]}
                    required
                    disabled={isSubmitting}
                  />
                  {signUpErrors.dateOfBirth && (
                    <span className={styles.fieldError}>{signUpErrors.dateOfBirth}</span>
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
                    value={signUpData.university}
                    onChange={handleSignUpChange}
                    className={signUpErrors.university ? styles.error : ''}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select club</option>
                    {clubs.map((club) => (
                      <option key={club} value={club}>
                        {club}
                      </option>
                    ))}
                  </select>
                  {signUpErrors.university && (
                    <span className={styles.fieldError}>{signUpErrors.university}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="universityTeam">
                    University Team <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="universityTeam"
                    name="universityTeam"
                    value={signUpData.universityTeam}
                    onChange={handleSignUpChange}
                    className={signUpErrors.universityTeam ? styles.error : ''}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select team</option>
                    <option value="1st team">1st Team</option>
                    <option value="2nd team">2nd Team</option>
                    <option value="3rd team">3rd Team</option>
                    <option value="Other">Other</option>
                  </select>
                  {signUpErrors.universityTeam && (
                    <span className={styles.fieldError}>{signUpErrors.universityTeam}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="signupEmail">
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="signupEmail"
                    name="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    className={signUpErrors.email ? styles.error : ''}
                    placeholder="your.email@example.com"
                    required
                    disabled={isSubmitting}
                  />
                  {signUpErrors.email && (
                    <span className={styles.fieldError}>{signUpErrors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="signupPassword">
                    Password <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="password"
                    id="signupPassword"
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    className={signUpErrors.password ? styles.error : ''}
                    placeholder="Enter password"
                    required
                    disabled={isSubmitting}
                  />
                  {signUpErrors.password && (
                    <span className={styles.fieldError}>{signUpErrors.password}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={signUpData.phone}
                    onChange={handleSignUpChange}
                    placeholder="(555) 123-4567"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="medicalConditions">Medical Conditions</label>
                  <textarea
                    id="medicalConditions"
                    name="medicalConditions"
                    value={signUpData.medicalConditions}
                    onChange={handleSignUpChange}
                    rows={3}
                    placeholder="Please list any medical conditions or allergies..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label htmlFor="comments">Additional Comments</label>
                  <textarea
                    id="comments"
                    name="comments"
                    value={signUpData.comments}
                    onChange={handleSignUpChange}
                    rows={3}
                    placeholder="Any additional information you'd like to share..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
