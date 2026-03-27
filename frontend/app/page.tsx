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
      { name: 'McGill Padel Club', logo: '/club-logos/mcgill.png',logoZoom: 1.5 },
      { name: 'HEC Montreal Padel Club', logo: '/club-logos/HEC Montreal PAEDL CLUB.png' },
      { name: 'Concordia Padel Club', logo: '/club-logos/Conc.jpeg', logoZoom: 1.3 },
      { name: 'Polysports Padel', logo: '/club-logos/polysports.png' },
    ],
    ontario: [
      { name: 'UofT Padel', logo: '/club-logos/UofT PADEL.png', logoZoom: 1.5 },
      { name: 'UTM Padel', logo: '/club-logos/UTM PADEL.png' },
      { name: 'TMU Padel', logo: '/club-logos/TMU Padel copy.png', logoZoom: 1.25 },
      { name: 'McMaster Padel', logo: '/club-logos/Mac Padel.png', logoZoom: 1.1 },
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
      <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        {/* --- BLURRY BACKGROUND LAYER --- */}
        <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: "url('/images/Pic1.jpeg')", // Update this path if needed
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(1px) brightness(80%)',
              transform: 'scale(1.1)',
              zIndex: 1,
            }}
        />

        {/* Content Wrapper lifted above the background */}
        <div className={styles.heroContent} style={{ position: 'relative', zIndex: 2 }}>
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
      {/*/!* Hero Section *!/*/}
      {/*<section className={styles.hero}>*/}
      {/*  <div className={styles.heroContent}>*/}
      {/*    <div className={styles.logoContainer}>*/}
      {/*      <img */}
      {/*        src="/cupl-logo.png" */}
      {/*        alt="CUPL Logo" */}
      {/*        className={styles.cuplLogo}*/}
      {/*      />*/}
      {/*    </div>*/}
      {/*    <h1>Canadian Universities Padel League</h1>*/}
      {/*    <p className={styles.tagline}>*/}
      {/*      For students, by students. Join the premier padel competition across Canadian universities.*/}
      {/*    </p>*/}
      {/*    {!isAuthenticated && (*/}
      {/*      <Button */}
      {/*        onClick={() => setIsSignInOpen(true)}*/}
      {/*        variant="primary" */}
      {/*        size="large"*/}
      {/*      >*/}
      {/*        Sign Up Now*/}
      {/*      </Button>*/}
      {/*    )}*/}
      {/*  </div>*/}
      {/*</section>*/}

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
                  <div className={styles.clubLogoContainer}>
                    {club.logo ? (
                      <img 
                        src={club.logo} 
                        alt={club.name} 
                        className={styles.clubLogo}
                        style={{ transform: `scale(${club.logoZoom ?? 1})` }}
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
                  <div className={styles.clubLogoContainer}>
                    {club.logo ? (
                      <img 
                        src={club.logo} 
                        alt={club.name} 
                        className={styles.clubLogo}
                        style={{ transform: `scale(${club.logoZoom ?? 1})` }}
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


      {/* Sponsors Section */}
      <section className={styles.sponsorsSection}>
        <div className={styles.sponsorsInner}>
          <h2 className={styles.sponsorsTitle}>Sponsors</h2>

          <div className={styles.marqueeWrapper}>
            <div className={styles.marqueeTrack}>
              {[
                { src: '/sponsors/ErnestLogoBR.png', alt: 'Ernest' },
                { src: '/sponsors/SYS_bdremoved.png', alt: 'SYS' },
                { src: '/sponsors/Padel22LogoBR.png', alt: 'Padel 22' },
                { src: '/sponsors/PadelGoLogoBR.png', alt: 'PadelGo' },
                { src: '/sponsors/PadelFVRLogoBR.png', alt: 'Padel FVR' },
                { src: '/sponsors/BlueZoneLogoBR.png', alt: 'BlueZone' },
                { src: '/sponsors/ErnestLogoBR.png', alt: 'Ernest' },
                { src: '/sponsors/SYS_bdremoved.png', alt: 'SYS' },
                { src: '/sponsors/Padel22LogoBR.png', alt: 'Padel 22' },
                { src: '/sponsors/PadelGoLogoBR.png', alt: 'PadelGo' },
                { src: '/sponsors/PadelFVRLogoBR.png', alt: 'Padel FVR' },
                { src: '/sponsors/BlueZoneLogoBR.png', alt: 'BlueZone' },
              ].map((logo, i) => (
                <img key={i} src={logo.src} alt={logo.alt} className={styles.marqueeLogo} />
              ))}
            </div>
          </div>

          <Button href="/sponsors" variant="outline" size="large">View Sponsors</Button>
        </div>
      </section>

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
