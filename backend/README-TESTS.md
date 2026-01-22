# CUPL Backend Test Suite

This directory contains comprehensive tests for all functionality in the CUPL application.

## Test Structure

```
src/test/java/com/cupl/backend/
├── BaseTest.java                    # Base test class
├── controller/
│   ├── AuthControllerTest.java      # Authentication API tests
│   ├── EventControllerTest.java     # Event API tests
│   ├── PlayerControllerTest.java    # Player registration API tests
│   └── ClubControllerTest.java      # Club management API tests
└── service/
    ├── AuthServiceTest.java         # Authentication service tests
    ├── PlayerServiceTest.java       # Player service tests
    ├── EventServiceTest.java        # Event service tests
    └── ClubServiceTest.java         # Club service tests
```

## Running Tests

### Option 1: Using the Test Runner Script (Recommended)

```bash
cd backend
./run-tests.sh
```

This script will:
- Run all tests
- Display a clear summary with colors
- Show which tests passed/failed
- Display error details if any tests fail

### Option 2: Using Maven Directly

```bash
cd backend
mvn test
```

### Option 3: Run Specific Test Class

```bash
cd backend
mvn test -Dtest=AuthControllerTest
```

## Test Coverage

### Authentication Tests
- ✅ Successful login with valid credentials
- ✅ Login with invalid email
- ✅ Login with invalid password
- ✅ Login with different user roles (USER, ADMIN, CLUB)
- ✅ Case-insensitive email matching

### Event Tests
- ✅ Create event successfully
- ✅ Create event with image
- ✅ Get all events
- ✅ Events ordered by creation date (newest first)
- ✅ Validation for required fields

### Player Registration Tests
- ✅ Create player successfully
- ✅ Auto-create user account for player
- ✅ Prevent duplicate email registration
- ✅ Auto-assignment to club based on university
- ✅ Validation for required fields

### Club Management Tests
- ✅ Create club successfully
- ✅ Auto-create teams (3 men's + 1 women's)
- ✅ Prevent duplicate club email
- ✅ Get club by email
- ✅ Get club players with pagination
- ✅ Get club teams
- ✅ Add player to team
- ✅ Remove player from team

## Test Configuration

Tests use an in-memory H2 database (configured in `application-test.yml`) to ensure:
- Fast test execution
- No interference with production data
- Isolated test environment

## Adding New Tests

1. Create test class in appropriate package (`controller/` or `service/`)
2. Extend `BaseTest` class
3. Use `@DisplayName` annotation for clear test descriptions
4. Follow existing test patterns

## Test Best Practices

- Each test should be independent
- Use `@BeforeEach` to set up test data
- Clean up after tests (handled by `@Transactional` in `BaseTest`)
- Use descriptive test names with `@DisplayName`
- Test both success and failure scenarios
