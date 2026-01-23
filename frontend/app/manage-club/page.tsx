'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Section from '@/components/Section';
import Button from '@/components/Button';
import { fetchWithAuth } from '@/lib/api';
import styles from './page.module.css';

interface Player {
  id: string;
  fullName: string;
  gender: string;
  email: string;
  university: string;
  teamLevel: string;
}

interface Team {
  id: string;
  type: 'MEN' | 'WOMEN';
  teamNumber: number;
}

interface Club {
  id: string;
  name: string;
  email: string;
}

interface PlayersPage {
  content: Player[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export default function ManageClubPage() {
  const { user, isClub } = useAuth();
  const router = useRouter();
  const [club, setClub] = useState<Club | null>(null);
  const [clubPlayers, setClubPlayers] = useState<Player[]>([]);
  const [playersPage, setPlayersPage] = useState<PlayersPage | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<{ [teamId: string]: Player[] }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [selectedTeamForPlayer, setSelectedTeamForPlayer] = useState<{ [playerId: string]: string }>({});

  useEffect(() => {
    if (!isChecking && !isClub) {
      router.push('/');
    } else if (isClub && user) {
      fetchClubData();
      setIsChecking(false);
    }
  }, [isClub, isChecking, user, router]);

  useEffect(() => {
    if (club && activeTab === 'players') {
      fetchClubPlayers(currentPage);
    }
  }, [club, currentPage, activeTab]);

  const fetchClubData = async () => {
    if (!user?.email) return;

    try {
      // Get club by email
      const clubResponse = await fetchWithAuth(`/api/clubs/by-email?email=${encodeURIComponent(user.email)}`, {}, user?.token);
      if (clubResponse.ok) {
        const clubData = await clubResponse.json();
        setClub(clubData);

        // Fetch teams
        const teamsResponse = await fetchWithAuth(`/api/clubs/${clubData.id}/teams`, {}, user?.token);
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
          
          // Fetch players for each team
          const teamPlayersMap: { [teamId: string]: Player[] } = {};
          for (const team of teamsData) {
            const teamPlayersResponse = await fetchWithAuth(`/api/clubs/teams/${team.id}/players`, {}, user?.token);
            if (teamPlayersResponse.ok) {
              const players = await teamPlayersResponse.json();
              teamPlayersMap[team.id] = players;
            }
          }
          setTeamPlayers(teamPlayersMap);
        }
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClubPlayers = async (page: number) => {
    if (!club) return;

    try {
      const response = await fetchWithAuth(`/api/clubs/${club.id}/players?page=${page}&size=10`, {}, user?.token);
      if (response.ok) {
        const data = await response.json();
        // Handle both Page object and plain array responses (fallback for compatibility)
        if (Array.isArray(data)) {
          // If it's a plain array, create a mock page object
          setClubPlayers(data);
          setPlayersPage({
            content: data,
            totalElements: data.length,
            totalPages: Math.ceil(data.length / 10),
            number: page,
            size: 10
          });
        } else if (data.content) {
          // It's a Page object with content
          setPlayersPage(data);
          setClubPlayers(data.content || []);
        } else {
          // Fallback: treat as empty
          setClubPlayers([]);
          setPlayersPage(null);
        }
      }
    } catch (error) {
      console.error('Error fetching club players:', error);
    }
  };

  const handleAddPlayerToTeam = async (playerId: string, teamId: string) => {
    if (!club) return;

    try {
      const response = await fetchWithAuth(`/api/clubs/${club.id}/teams/players`, {
        method: 'POST',
        body: JSON.stringify({ playerId, teamId }),
      }, user?.token);

      if (response.ok) {
        // Refresh team players
        const teamPlayersResponse = await fetchWithAuth(`/api/clubs/teams/${teamId}/players`, {}, user?.token);
        if (teamPlayersResponse.ok) {
          const players = await teamPlayersResponse.json();
          setTeamPlayers(prev => ({
            ...prev,
            [teamId]: players
          }));
        }
        setSelectedTeamForPlayer(prev => {
          const newState = { ...prev };
          delete newState[playerId];
          return newState;
        });
      }
    } catch (error) {
      console.error('Error adding player to team:', error);
      alert('Failed to add player to team. They may already be in this team.');
    }
  };

  const handleRemovePlayerFromTeam = async (playerId: string, teamId: string) => {
    if (!club) return;

    try {
      const response = await fetchWithAuth(`/api/clubs/${club.id}/teams/${teamId}/players/${playerId}`, {
        method: 'DELETE',
      }, user?.token);

      if (response.ok) {
        // Refresh team players
        const teamPlayersResponse = await fetchWithAuth(`/api/clubs/teams/${teamId}/players`, {}, user?.token);
        if (teamPlayersResponse.ok) {
          const players = await teamPlayersResponse.json();
          setTeamPlayers(prev => ({
            ...prev,
            [teamId]: players
          }));
        }
      }
    } catch (error) {
      console.error('Error removing player from team:', error);
    }
  };

  const isPlayerInTeam = (playerId: string, teamId: string): boolean => {
    return teamPlayers[teamId]?.some(p => p.id === playerId) || false;
  };

  const getPlayersInTeam = (teamId: string): Player[] => {
    return teamPlayers[teamId] || [];
  };

  const getAvailablePlayersForTeam = (team: Team): Player[] => {
    const teamGender = team.type === 'MEN' ? 'Male' : 'Female';
    return clubPlayers.filter(p => 
      p.gender === teamGender && 
      !isPlayerInTeam(p.id, team.id)
    );
  };

  if (isChecking || !isClub) {
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

  return (
    <div className={styles.page}>
      <Navbar />
      
      <Section className={styles.heroSection}>
        <h1>Manage Club</h1>
        <p className={styles.subtitle}>
          {club?.name || 'Club Management'}
        </p>
      </Section>

      <Section className={styles.contentSection}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'players' ? styles.active : ''}`}
            onClick={() => setActiveTab('players')}
          >
            Players
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'teams' ? styles.active : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </button>
        </div>

        {activeTab === 'players' && (
          <div className={styles.playersTab}>
            <div className={styles.clubPlayersSection}>
              <h2>Club Players {playersPage ? `(${playersPage.totalElements})` : clubPlayers.length > 0 ? `(${clubPlayers.length})` : ''}</h2>
              {clubPlayers.length === 0 ? (
                <p className={styles.emptyMessage}>No players in the club yet. Players who sign up with your university will automatically appear here.</p>
              ) : (
                <>
                  <div className={styles.playerList}>
                    {clubPlayers.map((player) => (
                      <div key={player.id} className={styles.playerCard}>
                        <div className={styles.playerInfo}>
                          <h4>{player.fullName}</h4>
                          <p>{player.email}</p>
                          <p>{player.university} • {player.gender} • {player.teamLevel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {playersPage && playersPage.totalPages > 1 && (
                    <div className={styles.pagination}>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        variant="outline"
                        size="small"
                        disabled={currentPage === 0}
                      >
                        Previous
                      </Button>
                      <span className={styles.pageInfo}>
                        Page {currentPage + 1} of {playersPage.totalPages}
                      </span>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(playersPage.totalPages - 1, prev + 1))}
                        variant="outline"
                        size="small"
                        disabled={currentPage >= playersPage.totalPages - 1}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className={styles.teamsTab}>
            <h2>Club Teams</h2>
            <div className={styles.teamsGrid}>
              {teams.map((team) => {
                const playersInTeam = getPlayersInTeam(team.id);
                const availablePlayers = getAvailablePlayersForTeam(team);
                
                return (
                  <div key={team.id} className={styles.teamCard}>
                    <h3>
                      {team.type === 'MEN' ? "Men's" : "Women's"} Team {team.teamNumber}
                    </h3>
                    
                    <div className={styles.teamSection}>
                      <h4>Players in Team ({playersInTeam.length})</h4>
                      {playersInTeam.length === 0 ? (
                        <p className={styles.emptyTeamMessage}>No players in this team yet.</p>
                      ) : (
                        <div className={styles.teamPlayersList}>
                          {playersInTeam.map((player) => (
                            <div key={player.id} className={styles.teamPlayer}>
                              <span>{player.fullName}</span>
                              <Button
                                onClick={() => handleRemovePlayerFromTeam(player.id, team.id)}
                                variant="outline"
                                size="small"
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.teamSection}>
                      <h4>Add Players</h4>
                      {availablePlayers.length === 0 ? (
                        <p className={styles.emptyTeamMessage}>No available players for this team.</p>
                      ) : (
                        <div className={styles.availablePlayersList}>
                          {availablePlayers.map((player) => (
                            <div key={player.id} className={styles.teamPlayer}>
                              <span>{player.fullName}</span>
                              <Button
                                onClick={() => handleAddPlayerToTeam(player.id, team.id)}
                                variant="primary"
                                size="small"
                              >
                                Add to Team
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Section>

      <Footer />
    </div>
  );
}
