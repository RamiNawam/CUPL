'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { getApiUrl, getImageUrl, fetchWithAuth } from '@/lib/api';
import styles from './page.module.css';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string | null;
}

interface GroupedEvent {
  dateKey: string;
  formattedDate: string;
  events: Event[];
}

export default function EventsPage() {
  const { isAdmin, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    image: null as string | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/events`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        console.error('Failed to fetch events:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, image: result }));
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAdmin) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const url = editingEvent ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = editingEvent ? 'PUT' : 'POST';

      // If editing and no new image uploaded, don't send image field (keep existing)
      const requestBody: any = {
        title: formData.title,
        date: formData.date,
        location: formData.location,
        description: formData.description,
      };
      
      // Only include image if it's a new upload or creating new event
      if (formData.image) {
        requestBody.image = formData.image;
      } else if (!editingEvent) {
        // For new events, image can be null
        requestBody.image = null;
      }

      const response = await fetchWithAuth(
        url,
        {
          method,
          body: JSON.stringify(requestBody),
        },
        user?.token
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to ${editingEvent ? 'update' : 'create'} event`);
      }

      setFormData({
        title: '',
        date: '',
        location: '',
        description: '',
        image: null,
      });
      setImagePreview(null);
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      let errorMessage = `Failed to ${editingEvent ? 'update' : 'create'} event`;
      if (error.message) {
        errorMessage = error.message;
      } else if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to server. Please make sure the backend is running.';
      }
      setFormError(errorMessage);
      console.error('Event error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      location: event.location,
      description: event.description,
      image: null, // Don't pre-fill image, user can upload new one
    });
    setImagePreview(event.image ? getImageUrl(event.image) : null);
    // Scroll to form
    document.getElementById('admin-tools')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      date: '',
      location: '',
      description: '',
      image: null,
    });
    setImagePreview(null);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!isAdmin) return;
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;

    try {
      const response = await fetchWithAuth(
        `/api/events/${eventId}`,
        { method: 'DELETE' },
        user?.token
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete event');
      }
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Parse date string and return Date object
  const parseDate = (dateString: string): Date | null => {
    try {
      // Handle formats like "March 20, 2024" or "March 20-22, 2024"
      // Extract the first date from the string
      const match = dateString.match(/(\w+)\s+(\d+)(?:-(\d+))?,\s*(\d{4})/);
      if (match) {
        const monthName = match[1];
        const day = parseInt(match[2]);
        const year = parseInt(match[4]);
        
        const monthMap: { [key: string]: number } = {
          january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
          july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
        };
        
        const month = monthMap[monthName.toLowerCase()];
        if (month !== undefined && !isNaN(day) && !isNaN(year)) {
          return new Date(year, month, day);
        }
      }
      
      // Fallback: try standard Date parsing
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    } catch {
      return null;
    }
  };

  // Format date with ordinal suffix (1st, 2nd, 3rd, etc.)
  const formatDateWithOrdinal = (date: Date): string => {
    const day = date.getDate();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const getOrdinalSuffix = (n: number): string => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${monthNames[date.getMonth()]} ${day}${getOrdinalSuffix(day)}`;
  };

  // Group events by date and sort chronologically
  const groupedEvents = useMemo(() => {
    const groups: Map<string, GroupedEvent> = new Map();
    
    events.forEach(event => {
      const parsedDate = parseDate(event.date);
      if (parsedDate) {
        // Use YYYY-MM-DD as key for sorting
        const dateKey = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
        const formattedDate = formatDateWithOrdinal(parsedDate);
        
        if (!groups.has(dateKey)) {
          groups.set(dateKey, {
            dateKey,
            formattedDate,
            events: []
          });
        }
        groups.get(dateKey)!.events.push(event);
      } else {
        // If we can't parse the date, use the original date string as key
        if (!groups.has(event.date)) {
          groups.set(event.date, {
            dateKey: event.date,
            formattedDate: event.date,
            events: []
          });
        }
        groups.get(event.date)!.events.push(event);
      }
    });
    
    // Sort by date key (chronological order)
    return Array.from(groups.values()).sort((a, b) => {
      // If dateKey is in YYYY-MM-DD format, use it for sorting
      if (a.dateKey.match(/^\d{4}-\d{2}-\d{2}$/) && b.dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return a.dateKey.localeCompare(b.dateKey);
      }
      // Otherwise, try to parse and compare
      const dateA = parseDate(a.dateKey);
      const dateB = parseDate(b.dateKey);
      if (dateA && dateB) {
        return dateA.getTime() - dateB.getTime();
      }
      return 0;
    });
  }, [events]);

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div>
            <h1>CUPL Events</h1>
            <p className={styles.subtitle}>
              Join us for exciting padel tournaments, clinics, and competitions throughout the year
            </p>
          </div>
          {isAdmin && (
            <Button href="#admin-tools" variant="primary" size="small">
              Create Event
            </Button>
          )}
        </div>
      </Section>

      {isAdmin && (
        <Section className={styles.adminSection} id="admin-tools">
          <div className={styles.adminHeader}>
            <h2>Admin Tools</h2>
            <p>{editingEvent ? `Editing: ${editingEvent.title}` : 'Create new events directly from this page.'}</p>
          </div>
          <form onSubmit={handleCreateEvent} className={styles.adminForm}>
            {formError && <p className={styles.formError}>{formError}</p>}
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  name="date"
                  type="text"
                  value={formData.date}
                  onChange={handleFormChange}
                  placeholder="March 20, 2024"
                  required
                />
              </div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className={styles.formField}>
                <label htmlFor="image">Event Image (optional)</label>
                <input id="image" name="image" type="file" onChange={handleImageChange} />
              </div>
            </div>
            {imagePreview && (
              <div className={styles.imagePreview}>
                <img src={imagePreview} alt="Event preview" />
              </div>
            )}
            <div className={styles.formField}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </div>
            <div className={styles.formActions}>
              <Button type="submit" variant="primary" size="small" disabled={isSubmitting}>
                {isSubmitting ? (editingEvent ? 'Updating...' : 'Creating...') : (editingEvent ? 'Update Event' : 'Create Event')}
              </Button>
              {editingEvent && (
                <Button type="button" variant="outline" size="small" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Section>
      )}

      <Section className={styles.eventsSection}>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events scheduled at this time.</p>
        ) : (
          <div className={styles.calendarContainer}>
            {groupedEvents.map((group, groupIndex) => (
              <div key={group.dateKey} className={styles.dateGroup}>
                <div className={styles.dateHeader}>
                  <div className={styles.dateLine}></div>
                  <h2 className={styles.dateLabel}>{group.formattedDate}</h2>
                  <div className={styles.dateLine}></div>
                </div>
                <div className={styles.eventsList}>
                  {group.events.map((event) => (
                    <div key={event.id} className={styles.eventCard}>
                <div className={styles.eventImage}>
                  {event.image ? (
                    <img 
                      src={getImageUrl(event.image) || ''} 
                      alt={event.title} 
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>
                      <span>Event Image</span>
                    </div>
                  )}
                </div>
                      <div className={styles.eventContent}>
                        <h3 className={styles.eventTitle}>{event.title}</h3>
                        {event.location && (
                          <p className={styles.eventLocation}>📍 {event.location}</p>
                        )}
                        <p className={styles.eventDescription}>{event.description}</p>
                        {isAdmin && (
                          <div className={styles.eventActions}>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleEditEvent(event)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
}
