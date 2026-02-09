# Edge Case Test Suite

This document describes the comprehensive edge case tests added to the CUPL backend test suite.

## Overview

We've added **4 new edge case test files** covering **80+ edge cases** across all major functionality:

1. **AuthControllerEdgeCaseTest** - 20+ authentication edge cases
2. **PlayerControllerEdgeCaseTest** - 25+ player registration edge cases  
3. **EventControllerEdgeCaseTest** - 20+ event management edge cases
4. **ClubControllerEdgeCaseTest** - 15+ club and team management edge cases

## Test Coverage

### Authentication Edge Cases (`AuthControllerEdgeCaseTest`)

#### Input Validation
- ✅ Empty email
- ✅ Empty password
- ✅ Null email
- ✅ Null password
- ✅ Invalid email format
- ✅ Very long email (250+ characters)
- ✅ Very long password (1000+ characters)
- ✅ Email with special characters (`test+tag@example.com`)
- ✅ Email with whitespace (leading/trailing)
- ✅ Case sensitivity in password
- ✅ Malformed JSON
- ✅ Missing Content-Type header
- ✅ Wrong HTTP method

#### Security
- ✅ SQL injection attempt in email
- ✅ XSS attempt in email
- ✅ Unicode characters in email
- ✅ Generic error message (doesn't reveal if email exists)
- ✅ Error response contains error code

#### Forgot Password
- ✅ Empty email
- ✅ Invalid email format
- ✅ Always returns success (prevents email enumeration)
- ✅ Success message for both existing and non-existing emails

### Player Registration Edge Cases (`PlayerControllerEdgeCaseTest`)

#### Duplicate Handling
- ✅ Duplicate email in Player table
- ✅ Duplicate email in User table
- ✅ Case-insensitive email duplicate check
- ✅ Whitespace in email (should be trimmed)

#### Input Validation
- ✅ Empty full name
- ✅ Null full name
- ✅ Very long full name (500+ characters)
- ✅ Invalid email format
- ✅ Empty email
- ✅ Future date of birth
- ✅ Very old date of birth (1900)
- ✅ Invalid date format
- ✅ Empty password
- ✅ Very short password (3 characters)
- ✅ Very long password (1000+ characters)
- ✅ Null gender
- ✅ Invalid gender value
- ✅ Very long phone number (100+ characters)
- ✅ Missing required fields
- ✅ Malformed JSON

#### Security
- ✅ Special characters in name (José María O'Connor-Smith)
- ✅ Unicode characters (测试玩家)
- ✅ SQL injection attempt in name
- ✅ XSS attempt in name

### Event Management Edge Cases (`EventControllerEdgeCaseTest`)

#### Input Validation
- ✅ Empty title
- ✅ Null title
- ✅ Very long title (1000+ characters)
- ✅ Very long description (10000+ characters)
- ✅ Empty date
- ✅ Empty location
- ✅ Empty description
- ✅ Special characters in title
- ✅ Malformed JSON

#### Security & Authorization
- ✅ SQL injection attempt in title
- ✅ XSS attempt in title
- ✅ Create event without authentication
- ✅ Create event with invalid token
- ✅ Create event with non-admin user
- ✅ Update event with non-existent ID
- ✅ Delete event with non-existent ID
- ✅ Delete event without authentication
- ✅ Update event with invalid UUID format
- ✅ Update event preserves existing image when no new image provided

### Club & Team Management Edge Cases (`ClubControllerEdgeCaseTest`)

#### Team Limits
- ✅ Add player to team when team is full (2 players)
- ✅ Add player with wrong gender to team
- ✅ Add same player to team twice

#### Authorization & Access Control
- ✅ Add player to team that doesn't belong to club
- ✅ Add player that doesn't belong to club
- ✅ Access club data with non-existent club ID
- ✅ Access with invalid token
- ✅ Access without authentication
- ✅ Regular user cannot access club endpoints

#### Club Creation
- ✅ Create club with duplicate email
- ✅ Create club with empty name
- ✅ Create club with invalid email format

#### Team Management
- ✅ Remove player from non-existent team
- ✅ Remove non-existent player from team
- ✅ Get club players with invalid pagination (negative page, zero size, very large size)

## Running the Tests

### Run All Tests
```bash
cd backend
./run-tests.sh
```

### Run Only Edge Case Tests
```bash
cd backend
mvn test -Dtest="*EdgeCaseTest"
```

### Run Specific Edge Case Test File
```bash
cd backend
mvn test -Dtest="AuthControllerEdgeCaseTest"
mvn test -Dtest="PlayerControllerEdgeCaseTest"
mvn test -Dtest="EventControllerEdgeCaseTest"
mvn test -Dtest="ClubControllerEdgeCaseTest"
```

## Test Statistics

- **Total Edge Case Test Files**: 4
- **Total Edge Case Tests**: 80+
- **Coverage Areas**:
  - Input validation
  - Security (SQL injection, XSS)
  - Authorization & access control
  - Boundary conditions
  - Error handling
  - Data integrity
  - Business rules (team limits, etc.)

## Key Testing Principles Applied

1. **Boundary Testing**: Very long/short inputs, edge values
2. **Security Testing**: SQL injection, XSS attempts, authentication bypass
3. **Error Handling**: Invalid inputs, missing fields, malformed data
4. **Authorization**: Role-based access, token validation
5. **Data Integrity**: Duplicate prevention, constraint validation
6. **Business Rules**: Team limits, gender matching, etc.

## Notes

- Some tests check for multiple possible status codes (e.g., 400 or 409) because validation may occur at different layers
- Security tests verify that malicious input is safely handled (stored/displayed without execution)
- All tests use proper authentication tokens where required
- Tests are isolated and clean up after themselves using `@Transactional` and `@BeforeEach`
