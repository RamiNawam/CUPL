import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import styles from './page.module.css';

export default function EventsPage() {
  const events = [
    {
      id: 1,
      title: 'CUPL Championship 2024',
      date: 'March 15-17, 2024',
      location: 'Montreal, QC',
      description: 'Join us for the inaugural CUPL Championship featuring teams from universities across Canada. Watch the best student padel players compete for the championship title. This three-day event will showcase the top talent in Canadian university padel.',
      image: null, // Add image path when available
    },
    {
      id: 2,
      title: 'Regional Qualifiers',
      date: 'February 10-11, 2024',
      location: 'Toronto, ON',
      description: 'Regional qualifiers to determine which teams will advance to the national championship. Open to all registered CUPL member clubs. Teams will compete in a round-robin format followed by knockout stages.',
      image: null, // Add image path when available
    },
    {
      id: 3,
      title: 'Padel Clinic & Training',
      date: 'January 20, 2024',
      location: 'Vancouver, BC',
      description: 'Free padel clinic for students interested in learning the sport or improving their skills. Professional coaches will be on hand to provide guidance. Open to all skill levels, from beginners to advanced players.',
      image: null, // Add image path when available
    },
    {
      id: 4,
      title: 'Winter Tournament',
      date: 'December 5-6, 2024',
      location: 'Ottawa, ON',
      description: 'A friendly tournament to keep players active during the winter season. This event is open to all CUPL members and serves as a great opportunity to practice and network with other players.',
      image: null, // Add image path when available
    },
    {
      id: 5,
      title: 'Fall League Kickoff',
      date: 'September 20, 2024',
      location: 'Calgary, AB',
      description: 'The official start of the CUPL fall season. Join us for opening ceremonies, team introductions, and the first matches of the season. A great opportunity to meet players from across the country.',
      image: null, // Add image path when available
    },
    {
      id: 6,
      title: 'Summer Padel Camp',
      date: 'July 15-19, 2024',
      location: 'Halifax, NS',
      description: 'An intensive five-day padel camp for students looking to take their game to the next level. Includes training sessions, strategy workshops, and competitive matches. Limited spots available.',
      image: null, // Add image path when available
    },
  ];

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
                {event.location && (
                  <p className={styles.eventLocation}>📍 {event.location}</p>
                )}
                <p className={styles.eventDescription}>{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Footer />
    </div>
  );
}
