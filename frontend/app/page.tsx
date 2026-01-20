import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import styles from './page.module.css';

export default function Home() {
  const clubs = [
    'McGill Padel Club',
    'UofT Padel',
    'UTM Padel',
    'HEC Montreal Padel Club',
    'Polysports Padel',
    'Concordia Padel Club',
  ];

  const events = [
    {
      id: 1,
      title: 'CUPL Championship 2024',
      date: 'March 15-17, 2024',
      location: 'Montreal, QC',
      description: 'Join us for the inaugural CUPL Championship featuring teams from universities across Canada. Watch the best student padel players compete for the championship title.',
      image: null, // Add image path when available
    },
    {
      id: 2,
      title: 'Regional Qualifiers',
      date: 'February 10-11, 2024',
      location: 'Toronto, ON',
      description: 'Regional qualifiers to determine which teams will advance to the national championship. Open to all registered CUPL member clubs.',
      image: null, // Add image path when available
    },
    {
      id: 3,
      title: 'Padel Clinic & Training',
      date: 'January 20, 2024',
      location: 'Vancouver, BC',
      description: 'Free padel clinic for students interested in learning the sport or improving their skills. Professional coaches will be on hand to provide guidance.',
      image: null, // Add image path when available
    },
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Canadian Universities Padel League</h1>
          <p className={styles.tagline}>
            For students, by students. Join the premier padel competition across Canadian universities.
          </p>
          <Button href="/register" variant="primary" size="large">
            Register Now
          </Button>
        </div>
      </section>

      {/* Participating Clubs */}
      <Section className={styles.universitiesSection}>
        <h2 className={styles.sectionTitle}>Participating Clubs</h2>
        <div className={styles.universitiesGrid}>
          {clubs.map((club) => (
            <div key={club} className={styles.universityCard}>
              {club}
            </div>
          ))}
        </div>
      </Section>

      {/* Events Section */}
      <Section className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Upcoming Events</h2>
        <div className={styles.eventsGrid}>
          {events.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventImage}>
                {event.image ? (
                  <img src={event.image} alt={event.title} />
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
      </Section>

      {/* Sponsors Preview */}
      <Section className={styles.sponsorsPreview}>
        <h2 className={styles.sectionTitle}>Our Sponsors</h2>
        <div className={styles.sponsorStrip}>
          <div className={styles.sponsorPlaceholder}>Sponsor Logo 1</div>
          <div className={styles.sponsorPlaceholder}>Sponsor Logo 2</div>
          <div className={styles.sponsorPlaceholder}>Sponsor Logo 3</div>
        </div>
        <Button href="/sponsors" variant="outline" size="medium" className={styles.viewAllButton}>
          View All Sponsors
        </Button>
      </Section>

      <Footer />
    </div>
  );
}
