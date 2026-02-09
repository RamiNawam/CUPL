'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import SignInModal from '@/components/SignInModal';
import { getApiUrl, getImageUrl } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from './page.module.css';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string | null;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const clubsByRegion = {
    montreal: [
      { name: 'McGill Padel Club', logo: '/club-logos/mcgill.png' },
      { name: 'HEC Montreal Padel Club', logo: '/club-logos/HEC Montreal PAEDL CLUB.png' },
      { name: 'Concordia Padel Club', logo: '/club-logos/Concordia.png' },
    ],
    ontario: [
      { name: 'UofT Padel', logo: '/club-logos/UofT PADEL.png' },
      { name: 'UTM Padel', logo: '/club-logos/UTM PADEL.png' },
      { name: 'TMU Padel', logo: '/club-logos/tmu.png' },
      { name: 'McMaster Padel', logo: '/club-logos/mcmaster.png' },
      { name: 'Polysports Padel', logo: '/club-logos/polysports.png' },
    ],
  };

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

  return (
    <div className={styles.page}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <img 
              src="/cupl-logo.png" 
              alt="CUPL Logo" 
              className={styles.cuplLogo}
            />
          </div>
          <h1>Canadian Universities Padel League</h1>
          <p className={styles.tagline}>
            For students, by students. Join the premier padel competition across Canadian universities.
          </p>
          {!isAuthenticated && (
            <Button 
              onClick={() => setIsSignInOpen(true)}
              variant="primary" 
              size="large"
            >
              Sign Up Now
            </Button>
          )}
        </div>
      </section>

      {/* Participating Clubs */}
      <Section className={styles.universitiesSection}>
        <h2 className={styles.sectionTitle}>Participating Clubs</h2>
        
        <div className={styles.regionsContainer}>
          {/* Montreal Section */}
          <div className={styles.regionSection}>
            <h3 className={styles.regionTitle}>Montreal</h3>
            <div className={styles.universitiesGrid}>
              {clubsByRegion.montreal.map((club) => (
                <div key={club.name} className={styles.universityCard}>
                  <div className={styles.logoContainer}>
                    {club.logo ? (
                      <img 
                        src={club.logo} 
                        alt={club.name} 
                        className={styles.clubLogo}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        {club.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className={styles.clubName}>{club.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ontario Section */}
          <div className={styles.regionSection}>
            <h3 className={styles.regionTitle}>Ontario</h3>
            <div className={styles.universitiesGrid}>
              {clubsByRegion.ontario.map((club) => (
                <div key={club.name} className={styles.universityCard}>
                  <div className={styles.logoContainer}>
                    {club.logo ? (
                      <img 
                        src={club.logo} 
                        alt={club.name} 
                        className={styles.clubLogo}
                      />
                    ) : (
                      <div className={styles.logoPlaceholder}>
                        {club.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className={styles.clubName}>{club.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Events Section */}
      <Section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Upcoming Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p>No events scheduled at this time.</p>
        ) : (
          <div className={styles.eventsGrid}>
            {events.map((event) => (
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
                  <p className={styles.eventDate}>{event.date}</p>
                  <p className={styles.eventDescription}>{event.description}</p>
                  {event.location && (
                    <p className={styles.eventLocation}>📍 {event.location}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Sponsors Preview */}
      <Section className={styles.sponsorsPreview}>
        <h2 className={styles.sectionTitle}>Our Sponsors</h2>
        <div className={styles.sponsorStrip}>
          <img src="/sponsors/PadelGo.png" alt="PadelGo" className={styles.sponsorLogoPreview} />
          <img src="/sponsors/PadelFVR.png" alt="PadelFVR" className={styles.sponsorLogoPreview} />
          <img src="/sponsors/Padel22.png" alt="Padel22" className={styles.sponsorLogoPreview} />
          <img src="/sponsors/SchoolYardSocial.png" alt="SchoolYardSocial" className={styles.sponsorLogoPreview} />
          <div className={styles.sponsorPlaceholder}>Bounce</div>
        </div>
        <Button href="/sponsors" variant="outline" size="medium" className={styles.viewAllButton}>
          View All Sponsors
        </Button>
      </Section>

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          * The clubs listed are not official university clubs and are for demonstration purposes only.
        </p>
      </div>

      <Footer />
      <SignInModal isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
}
