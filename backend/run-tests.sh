#!/bin/bash

# CUPL Backend Test Runner Script
# This script runs all tests and displays results clearly

echo "=========================================="
echo "  CUPL Backend Test Suite"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Change to backend directory
cd "$(dirname "$0")" || exit 1

echo -e "${BLUE}Running Maven tests...${NC}"
echo ""

# Run tests and capture output
mvn test -q 2>&1 | tee /tmp/cupl-test-output.txt

# Check exit code
TEST_EXIT_CODE=${PIPESTATUS[0]}

echo ""
echo "=========================================="
echo "  Test Results Summary"
echo "=========================================="
echo ""

# Parse test results
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    
    # Extract test summary
    TEST_COUNT=$(grep -E 'Tests run: [0-9]+' /tmp/cupl-test-output.txt | tail -1 | sed -E 's/.*Tests run: ([0-9]+).*/\1/')
    FAILURES=$(grep -E 'Failures: [0-9]+' /tmp/cupl-test-output.txt | tail -1 | sed -E 's/.*Failures: ([0-9]+).*/\1/')
    ERRORS=$(grep -E 'Errors: [0-9]+' /tmp/cupl-test-output.txt | tail -1 | sed -E 's/.*Errors: ([0-9]+).*/\1/')
    SKIPPED=$(grep -E 'Skipped: [0-9]+' /tmp/cupl-test-output.txt | tail -1 | sed -E 's/.*Skipped: ([0-9]+).*/\1/')
    
    if [ ! -z "$TEST_COUNT" ]; then
        echo "Tests run: $TEST_COUNT"
        echo "Failures: $FAILURES"
        echo "Errors: $ERRORS"
        echo "Skipped: $SKIPPED"
        echo ""
    fi
    
    # List all test classes that ran
    echo -e "${BLUE}Test Classes Executed:${NC}"
    grep "\[INFO\] Tests run:" /tmp/cupl-test-output.txt | sed 's/.*-- in //' | awk '{print "  " $0}' | sort -u
    
else
    echo -e "${RED}✗ Some tests failed!${NC}"
    echo ""
    
    # Extract test summary
    TEST_COUNT=$(grep -oP 'Tests run: \K\d+' /tmp/cupl-test-output.txt | tail -1)
    FAILURES=$(grep -oP 'Failures: \K\d+' /tmp/cupl-test-output.txt | tail -1)
    ERRORS=$(grep -oP 'Errors: \K\d+' /tmp/cupl-test-output.txt | tail -1)
    
    if [ ! -z "$TEST_COUNT" ]; then
        echo "Tests run: $TEST_COUNT"
        echo -e "Failures: ${RED}$FAILURES${NC}"
        echo -e "Errors: ${RED}$ERRORS${NC}"
        echo ""
    fi
    
    # Show failed tests
    echo -e "${RED}Failed Tests:${NC}"
    grep -E "FAILURE|ERROR" /tmp/cupl-test-output.txt | head -20 | while read -r line; do
        echo -e "  ${RED}✗${NC} $line"
    done
    echo ""
    
    # Show error details
    echo -e "${YELLOW}Error Details:${NC}"
    grep -A 5 "FAILURE\|ERROR" /tmp/cupl-test-output.txt | head -30
fi

echo ""
echo "=========================================="
echo ""

# Clean up
rm -f /tmp/cupl-test-output.txt

# Exit with test exit code
exit $TEST_EXIT_CODE
