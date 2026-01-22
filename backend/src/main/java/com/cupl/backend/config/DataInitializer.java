package com.cupl.backend.config;

import com.cupl.backend.model.Club;
import com.cupl.backend.model.Event;
import com.cupl.backend.model.Player;
import com.cupl.backend.model.Team;
import com.cupl.backend.model.User;
import com.cupl.backend.model.User.UserRole;
import com.cupl.backend.repository.ClubRepository;
import com.cupl.backend.repository.EventRepository;
import com.cupl.backend.repository.PlayerRepository;
import com.cupl.backend.repository.TeamRepository;
import com.cupl.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            EventRepository eventRepository,
            ClubRepository clubRepository,
            PlayerRepository playerRepository,
            TeamRepository teamRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.clubRepository = clubRepository;
        this.playerRepository = playerRepository;
        this.teamRepository = teamRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Initialize default users (case-insensitive, ensure credentials)
        ensureUser("RamiUser@gmail.com", "Rami2004", UserRole.USER);
        ensureUser("RamiAdmin@gmail.com", "Rami2004", UserRole.ADMIN);

        // Initialize Events
        if (eventRepository.count() == 0) {
            // Event 1: Concordia vs McGill
            Event event1 = new Event();
            event1.setTitle("Concordia vs McGill");
            event1.setDate("March 20, 2024");
            event1.setLocation("Montreal, QC");
            event1.setDescription("An exciting match between two of Montreal's top university padel teams. Watch as Concordia and McGill battle it out on the court in this highly anticipated inter-university competition. Both teams have been training hard and are ready to showcase their skills in what promises to be an intense and competitive match.");
            event1.setImage(null);
            eventRepository.save(event1);
            System.out.println("Initialized event: Concordia vs McGill");

            // Event 2: McGill vs HEC
            Event event2 = new Event();
            event2.setTitle("McGill vs HEC");
            event2.setDate("March 25, 2024");
            event2.setLocation("Montreal, QC");
            event2.setDescription("A thrilling showdown between McGill University and HEC Montreal. These two prestigious institutions will compete in a friendly yet competitive padel match. Expect to see excellent teamwork, strategic plays, and impressive athleticism from both sides. Don't miss this opportunity to support your favorite team!");
            event2.setImage(null);
            eventRepository.save(event2);
            System.out.println("Initialized event: McGill vs HEC");
        } else {
            System.out.println("Events already initialized");
        }

        // Initialize McGill Club
        String mcgillClubEmail = "mcgill@gmail.com";
        Club mcgillClub = null;
        if (!clubRepository.existsByEmail(mcgillClubEmail)) {
            if (!userRepository.existsByEmail(mcgillClubEmail)) {
                mcgillClub = new Club();
                mcgillClub.setName("McGill Padel Club");
                mcgillClub.setEmail(mcgillClubEmail);
                mcgillClub = clubRepository.save(mcgillClub);
                System.out.println("Initialized club: " + mcgillClub.getName());

                // Create User account for McGill club
                User clubUser = new User();
                clubUser.setEmail(mcgillClubEmail);
                clubUser.setPassword(passwordEncoder.encode("mcgill"));
                clubUser.setRole(UserRole.CLUB);
                userRepository.save(clubUser);
                System.out.println("Initialized club user: " + mcgillClubEmail);

                // Create default teams for McGill
                for (int i = 1; i <= 3; i++) {
                    Team menTeam = new Team();
                    menTeam.setClubId(mcgillClub.getId());
                    menTeam.setType(Team.TeamType.MEN);
                    menTeam.setTeamNumber(i);
                    teamRepository.save(menTeam);
                }

                Team womenTeam = new Team();
                womenTeam.setClubId(mcgillClub.getId());
                womenTeam.setType(Team.TeamType.WOMEN);
                womenTeam.setTeamNumber(1);
                teamRepository.save(womenTeam);
                System.out.println("Initialized teams for McGill club");
            }
        } else {
            mcgillClub = clubRepository.findByEmail(mcgillClubEmail).orElse(null);
            System.out.println("McGill club already exists");
            
            // Ensure user account exists even if club already exists
            if (mcgillClub != null && !userRepository.existsByEmail(mcgillClubEmail)) {
                User clubUser = new User();
                clubUser.setEmail(mcgillClubEmail);
                clubUser.setPassword(passwordEncoder.encode("mcgill"));
                clubUser.setRole(UserRole.CLUB);
                userRepository.save(clubUser);
                System.out.println("Initialized club user: " + mcgillClubEmail);
            }
            
            // Ensure teams exist
            if (mcgillClub != null && teamRepository.findByClubId(mcgillClub.getId()).isEmpty()) {
                for (int i = 1; i <= 3; i++) {
                    Team menTeam = new Team();
                    menTeam.setClubId(mcgillClub.getId());
                    menTeam.setType(Team.TeamType.MEN);
                    menTeam.setTeamNumber(i);
                    teamRepository.save(menTeam);
                }

                Team womenTeam = new Team();
                womenTeam.setClubId(mcgillClub.getId());
                womenTeam.setType(Team.TeamType.WOMEN);
                womenTeam.setTeamNumber(1);
                teamRepository.save(womenTeam);
                System.out.println("Initialized teams for McGill club");
            }
        }

        // Initialize 5 McGill players
        if (mcgillClub != null && playerRepository.findByUniversity("McGill").isEmpty()) {
            String[] playerNames = {
                "Alexandre Tremblay",
                "Sophie Martin",
                "Lucas Dubois",
                "Emma Chen",
                "Thomas Wilson"
            };
            String[] playerGenders = {"Male", "Female", "Male", "Female", "Male"};
            LocalDate[] birthDates = {
                LocalDate.of(2002, 5, 15),
                LocalDate.of(2003, 8, 22),
                LocalDate.of(2001, 3, 10),
                LocalDate.of(2004, 11, 5),
                LocalDate.of(2002, 7, 18)
            };
            String[] playerEmails = {
                "alexandre.tremblay@mail.mcgill.ca",
                "sophie.martin@mail.mcgill.ca",
                "lucas.dubois@mail.mcgill.ca",
                "emma.chen@mail.mcgill.ca",
                "thomas.wilson@mail.mcgill.ca"
            };

            for (int i = 0; i < 5; i++) {
                if (!playerRepository.existsByEmail(playerEmails[i]) && !userRepository.existsByEmail(playerEmails[i])) {
                    Player player = new Player();
                    player.setFullName(playerNames[i]);
                    player.setGender(playerGenders[i]);
                    player.setDateOfBirth(birthDates[i]);
                    player.setUniversity("McGill");
                    player.setTeamLevel("Intermediate");
                    player.setEmail(playerEmails[i]);
                    player.setPassword(passwordEncoder.encode("mcgill123"));
                    player.setClubId(mcgillClub.getId());
                    playerRepository.save(player);
                    System.out.println("Initialized player: " + playerNames[i]);

                    // Create User account for player
                    User playerUser = new User();
                    playerUser.setEmail(playerEmails[i]);
                    playerUser.setPassword(passwordEncoder.encode("mcgill123"));
                    playerUser.setRole(UserRole.USER);
                    userRepository.save(playerUser);
                }
            }
            System.out.println("Initialized 5 McGill players");
        } else {
            System.out.println("McGill players already initialized or club not found");
        }
    }

    private void ensureUser(String email, String rawPassword, UserRole role) {
        String normalizedEmail = email.toLowerCase().trim();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null) {
            User newUser = new User();
            newUser.setEmail(normalizedEmail);
            newUser.setPassword(passwordEncoder.encode(rawPassword));
            newUser.setRole(role);
            userRepository.save(newUser);
            System.out.println("Initialized user: " + normalizedEmail);
            return;
        }

        boolean updated = false;
        if (!normalizedEmail.equals(user.getEmail())) {
            user.setEmail(normalizedEmail);
            updated = true;
        }
        if (user.getRole() != role) {
            user.setRole(role);
            updated = true;
        }
        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
            System.out.println("Updated user: " + normalizedEmail);
        } else {
            System.out.println("User already exists: " + normalizedEmail);
        }
    }
}
