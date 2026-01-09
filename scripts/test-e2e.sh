#!/bin/bash

# E2E Test Execution Script for DevTutorials
# This script sets up the environment and runs Playwright E2E tests

set -e  # Exit on error

echo "🎭 DevTutorials E2E Test Runner"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ .env.local not found${NC}"
  echo "Please create .env.local from .env.example:"
  echo "  cp .env.example .env.local"
  echo "Then configure the required environment variables."
  exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
  echo -e "${YELLOW}⚠️  DATABASE_URL not configured in .env.local${NC}"
  echo "Please set DATABASE_URL in .env.local"
  exit 1
fi

echo -e "${GREEN}✅ Environment check passed${NC}"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo -e "${YELLOW}📦 Installing dependencies...${NC}"
  npm install
  echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# Check if Playwright is installed
if ! npx playwright --version &> /dev/null; then
  echo -e "${YELLOW}🎭 Installing Playwright browsers...${NC}"
  npx playwright install --with-deps
  echo -e "${GREEN}✅ Playwright installed${NC}"
fi

echo ""
echo "Running E2E tests..."
echo "===================="
echo ""

# Check for flags
HEADLESS="--headless"
UI_MODE=""
DEBUG_MODE=""
REPORTER="html"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --headed)
      HEADLESS=""
      shift
      ;;
    --ui)
      UI_MODE="--ui"
      shift
      ;;
    --debug)
      DEBUG_MODE="--debug"
      shift
      ;;
    --reporter=*)
      REPORTER="${1#*=}"
      shift
      ;;
    *)
      TEST_PATTERN="$1"
      shift
      ;;
  esac
done

# Build test command
TEST_CMD="npx playwright test"

if [ -n "$HEADLESS" ]; then
  TEST_CMD="$TEST_CMD $HEADLESS"
fi

if [ -n "$UI_MODE" ]; then
  TEST_CMD="$TEST_CMD $UI_MODE"
fi

if [ -n "$DEBUG_MODE" ]; then
  TEST_CMD="$TEST_CMD $DEBUG_MODE"
fi

if [ -n "$REPORTER" ]; then
  TEST_CMD="$TEST_CMD --reporter=$REPORTER"
fi

if [ -n "$TEST_PATTERN" ]; then
  TEST_CMD="$TEST_CMD $TEST_PATTERN"
fi

echo "Command: $TEST_CMD"
echo ""

# Run tests
eval $TEST_CMD
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "View HTML report:"
  echo "  open playwright-report/index.html"
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "View failures:"
  echo "  open playwright-report/index.html"
  echo ""
  echo "View traces:"
  echo "  npx playwright show-trace tests/e2e/.traces/"
fi

exit $TEST_EXIT_CODE
