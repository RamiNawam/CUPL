'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import { getApiUrl, getImageUrl } from '@/lib/api';
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

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
        <h1>CUPL Events</h1>
        <p className={styles.subtitle}>
          Join us for exciting padel tournaments, clinics, and competitions throughout the year
        </p>
      </Section>

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
