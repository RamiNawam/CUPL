'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function CreateEventPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image: null as string | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Redirect if not admin (using useEffect to avoid render-time redirect)
  useEffect(() => {
    if (!isChecking && !isAdmin) {
      router.push('/');
    } else {
      setIsChecking(false);
    }
  }, [isAdmin, isChecking, router]);

  // Show loading state while checking
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: 'Please select a valid image file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size must be less than 5MB',
        }));
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({
          ...prev,
          image: result,
        }));
      };
      reader.readAsDataURL(file);

      // Clear error
      if (errors.image) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    // Clear file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Event title is required';
    }

    if (!formData.date.trim()) {
      newErrors.date = 'Event date is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
    // POST /api/events
    // The backend will save the event to the database

    setTimeout(() => {
      console.log('Event created:', {
        ...formData,
        image: formData.image ? 'Image uploaded (base64)' : 'No image',
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setFormData({
          title: '',
          date: '',
          location: '',
          description: '',
          image: null,
        });
        setImageFile(null);
        setImagePreview(null);
        setIsSuccess(false);
        // Clear file input
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }, 2000);
    }, 1500);
  };

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <h1>Create Event</h1>
        <p className={styles.subtitle}>
          Add a new event to the CUPL calendar
        </p>
      </Section>

      <Section className={styles.formSection}>
        {isSuccess ? (
          <div className={styles.successMessage}>
            <h3>Event Created Successfully!</h3>
            <p>The event has been added to the calendar.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">
                Event Title <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={errors.title ? styles.error : ''}
                placeholder="Enter event title"
                disabled={isSubmitting}
              />
              {errors.title && (
                <span className={styles.errorMessage}>{errors.title}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="date">
                  Date <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={errors.date ? styles.error : ''}
                  placeholder="e.g., March 15-17, 2024"
                  disabled={isSubmitting}
                />
                {errors.date && (
                  <span className={styles.errorMessage}>{errors.date}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="location">
                  Location <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={errors.location ? styles.error : ''}
                  placeholder="e.g., Montreal, QC"
                  disabled={isSubmitting}
                />
                {errors.location && (
                  <span className={styles.errorMessage}>{errors.location}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? styles.error : ''}
                rows={6}
                placeholder="Enter event description..."
                disabled={isSubmitting}
              />
              {errors.description && (
                <span className={styles.errorMessage}>{errors.description}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">
                Event Photo
              </label>
              <div className={styles.imageUploadSection}>
                {imagePreview ? (
                  <div className={styles.imagePreviewContainer}>
                    <img src={imagePreview} alt="Event preview" className={styles.imagePreview} />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className={styles.removeImageButton}
                      disabled={isSubmitting}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <div className={styles.imageUploadArea}>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="image" className={styles.fileInputLabel}>
                      <span className={styles.uploadIcon}>📷</span>
                      <span>Click to upload or drag and drop</span>
                      <span className={styles.fileHint}>PNG, JPG, GIF up to 5MB</span>
                    </label>
                  </div>
                )}
              </div>
              {errors.image && (
                <span className={styles.errorMessage}>{errors.image}</span>
              )}
            </div>

            <div className={styles.formActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/events')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        )}
      </Section>

      <Footer />
    </div>
  );
}
