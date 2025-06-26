#!/bin/bash

#### DELETE once finished... ####

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

RANDOM_DIGITS=0074
ENVIRONMENT_NAME="${RANDOM_DIGITS}flaky"
TOTAL_RUNS=1
DESTROY_ONLY=false
SKIP_APPLY=false
export CI=1
export SKIP_SANDBOX_INSTALL=1


print_status "Starting automated E2E test suite - $TOTAL_RUNS iterations"
echo "========================================================"

for i in $(seq 1 $TOTAL_RUNS); do
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  RUN_DIR="test-runs/$TIMESTAMP"

  # Create run directory
  mkdir -p "$RUN_DIR"

  print_status "Generated environment name: $ENVIRONMENT_NAME"

  if [ $DESTROY_ONLY != "true" ]; then
    if [ $SKIP_APPLY != "true" ]; then
      # Create backend sandbox
      print_status "Creating backend sandbox environment..."
      if ./scripts/create_backend_sandbox.sh "$ENVIRONMENT_NAME"; then
          print_status "Backend sandbox created successfully"
      else
          print_error "Failed to create backend sandbox"
          exit 1
      fi
    fi

    # Run E2E tests
    print_status "Running E2E tests..."
    if npm run test:e2e --workspace tests/test-team; then
        print_status "E2E tests completed successfuly"
    else
        print_error "E2E tests failed"
        print_warning "Environment '$ENVIRONMENT_NAME' may still be running"
    fi

    print_status "Moving test-report to test runs"
    if [ -d "tests/test-team/playwright-report" ]; then
        print_status "Copying Playwright report files..."
        cp -r tests/test-team/playwright-report/* "$RUN_DIR/" 2>/dev/null || true
    fi
  fi

  echo
  while true; do
      read -p "Do you want to destroy the environment '$ENVIRONMENT_NAME'? [Y/n]: " choice

      case $choice in
          [Yy]* | "" )  # Default to Yes if user just presses Enter
              print_status "Destorying environment '$ENVIRONMENT_NAME'..."
              if ./scripts/destroy_backend_sandbox.sh "$ENVIRONMENT_NAME"; then
                  print_status "Environment destroyed successfully"
              else
                  print_warning "Could not automaically destroy environment. You may need to clean up manually."
                  print_warning "Environment name: $ENVIRONMENT_NAME"
              fi
              break
              ;;
          [Nn]* )
              print_warning "Environment '$ENVIRONMENT_NAME' left running"
              print_status "Remember to clean it up later to avoid unnecessary costs"
              break
              ;;
          * )
              echo "Please answer Y (yes) or n (no)"
              ;;
      esac
  done
done

print_status "Script completed"