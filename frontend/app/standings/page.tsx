'use client';

import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import styles from './page.module.css';

interface StandingTeam {
  position: number;
  team: string;
  logo: string;
  whiteLogoBackground?: boolean;
  wins: number;
  losses: number;
  points: number;
}

const quebecStandings: StandingTeam[] = [
  { position: 1, team: 'McGill', logo: '/club-logos/mcgill.png', whiteLogoBackground: true, wins: 5, losses: 0, points: 15 },
  { position: 2, team: 'HEC Montreal', logo: '/club-logos/HEC Montreal PAEDL CLUB.png', wins: 3, losses: 2, points: 9 },
  { position: 3, team: 'Concordia', logo: '/club-logos/Conc.jpeg', wins: 1, losses: 4, points: 3 },
  { position: 4, team: 'Polysports', logo: '/club-logos/polysports.png', wins: 2, losses: 3, points: 6 },
];

const ontarioStandings: StandingTeam[] = [
  { position: 1, team: 'UofT', logo: '/club-logos/UofT PADEL.png', whiteLogoBackground: true, wins: 4, losses: 1, points: 12 },
  { position: 2, team: 'UTM', logo: '/club-logos/UTM PADEL.png', wins: 3, losses: 2, points: 9 },
  { position: 3, team: 'TMU', logo: '/club-logos/TMU Padel copy.png', wins: 3, losses: 2, points: 9 },
  { position: 4, team: 'McMaster', logo: '/club-logos/Mac Padel.png', wins: 2, losses: 3, points: 6 },

];

export default function StandingsPage() {
  const renderTable = (title: string, data: StandingTeam[]) => (
      <div className={styles.tableSection}>
        <h2 className={styles.regionTitle}>{title}</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.standingsTable}>
            <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
              <th>Pts</th>
            </tr>
            </thead>
            <tbody>
            {data.map((team) => (
                <tr key={team.team} className={team.position === 1 ? styles.firstPlace : ''}>
                  <td className={styles.position}>{team.position}</td>
                  <td className={styles.teamCell}>
                    <div className={styles.teamInfo}>
                      <div
                        className={`${styles.logoWrapper} ${team.whiteLogoBackground ? styles.logoWrapperLight : ''}`}
                      >
                        <Image
                            src={team.logo}
                            alt={`${team.team} logo`}
                            width={30}
                            height={30}
                            className={`${styles.teamLogo} ${team.whiteLogoBackground ? styles.teamLogoFramed : ''}`}
                        />
                      </div>
                      <span className={styles.teamName}>{team.team}</span>
                    </div>
                  </td>
                  <td>{team.wins}</td>
                  <td>{team.losses}</td>
                  <td className={styles.points}>{team.points}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );

  return (
      <div className={styles.page}>
        <Navbar />

        <Section className={styles.heroSection} style={{ position: 'relative', overflow: 'hidden' }}>
          {/* --- BLURRY BACKGROUND LAYER --- */}
          <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: "url('/images/DSC03507.jpeg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                filter: 'blur(1px) brightness(70%)',
                transform: 'scale(1.1)',
                zIndex: 1,
              }}
          />

          {/* Add this wrapper to lift the text above the background */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h1>League Standings</h1>
            <p className={styles.subtitle}>
              Current rankings for all participating clubs
            </p>
          </div>
        </Section>

        <Section className={styles.howItWorksSection}>
          <h2 className={styles.howItWorksTitle}>How the League Works</h2>
          <p className={styles.howItWorksText}>
            Teams compete in regional divisions (Quebec and Ontario) throughout the season.
            <br />
            Points are awarded for wins, and the top teams advance to the playoffs.
          </p>
        </Section>

        <Section className={styles.standingsSection}>
          <div className={styles.standingsContainer}>
            {renderTable('Quebec', quebecStandings)}
            {renderTable('Ontario', ontarioStandings)}
          </div>
        </Section>

        <div className={styles.disclaimer}>
          <p className={styles.disclaimerText}>
            * The clubs listed are not official university clubs and are for demonstration purposes only.
          </p>
        </div>

        <Footer />
      </div>
  );
}
// 'use client';
//
// import Navbar from '@/components/Navbar';
// import Footer from '@/components/Footer';
// import Section from '@/components/Section';
// import styles from './page.module.css';
//
// // Sample standings data - replace with API data later
// const quebecStandings = [
//   { position: 1, team: 'McGill Padel Club', wins: 5, losses: 0, points: 15 },
//   { position: 2, team: 'HEC Montreal Padel Club', wins: 3, losses: 2, points: 9 },
//   { position: 3, team: 'Concordia Padel Club', wins: 1, losses: 4, points: 3 },
// ];
//
// const ontarioStandings = [
//   { position: 1, team: 'UofT Padel', wins: 4, losses: 1, points: 12 },
//   { position: 2, team: 'UTM Padel', wins: 3, losses: 2, points: 9 },
//   { position: 3, team: 'TMU Padel', wins: 3, losses: 2, points: 9 },
//   { position: 4, team: 'McMaster Padel', wins: 2, losses: 3, points: 6 },
//   { position: 5, team: 'Polysports Padel', wins: 2, losses: 3, points: 6 },
// ];
//
// export default function StandingsPage() {
//   return (
//     <div className={styles.page}>
//       <Navbar />
//
//       <Section className={styles.heroSection}>
//         <h1>League Standings</h1>
//         <p className={styles.subtitle}>
//           Current rankings for all participating clubs
//         </p>
//       </Section>
//
//       <Section className={styles.howItWorksSection}>
//         <h2 className={styles.howItWorksTitle}>How the League Works</h2>
//         <p className={styles.howItWorksText}>
//           Teams compete in regional divisions (Quebec and Ontario) throughout the season.
//           <br />
//           Points are awarded for wins, and the top teams advance to the playoffs.
//         </p>
//       </Section>
//
//       <Section className={styles.standingsSection}>
//         <div className={styles.standingsContainer}>
//           {/* Quebec Table */}
//           <div className={styles.tableSection}>
//             <h2 className={styles.regionTitle}>Quebec</h2>
//             <div className={styles.tableWrapper}>
//               <table className={styles.standingsTable}>
//                 <thead>
//                   <tr>
//                     <th>Pos</th>
//                     <th>Team</th>
//                     <th>W</th>
//                     <th>L</th>
//                     <th>Pts</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {quebecStandings.map((team) => (
//                     <tr key={team.team} className={team.position === 1 ? styles.firstPlace : ''}>
//                       <td className={styles.position}>{team.position}</td>
//                       <td className={styles.teamName}>{team.team}</td>
//                       <td>{team.wins}</td>
//                       <td>{team.losses}</td>
//                       <td className={styles.points}>{team.points}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//
//           {/* Ontario Table */}
//           <div className={styles.tableSection}>
//             <h2 className={styles.regionTitle}>Ontario</h2>
//             <div className={styles.tableWrapper}>
//               <table className={styles.standingsTable}>
//                 <thead>
//                   <tr>
//                     <th>Pos</th>
//                     <th>Team</th>
//                     <th>W</th>
//                     <th>L</th>
//                     <th>Pts</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {ontarioStandings.map((team) => (
//                     <tr key={team.team} className={team.position === 1 ? styles.firstPlace : ''}>
//                       <td className={styles.position}>{team.position}</td>
//                       <td className={styles.teamName}>{team.team}</td>
//                       <td>{team.wins}</td>
//                       <td>{team.losses}</td>
//                       <td className={styles.points}>{team.points}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </Section>
//
//       <div className={styles.disclaimer}>
//         <p className={styles.disclaimerText}>
//           * The clubs listed are not official university clubs and are for demonstration purposes only.
//         </p>
//       </div>
//
//       <Footer />
//     </div>
//   );
// }
