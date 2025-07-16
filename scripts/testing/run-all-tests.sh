#!/bin/bash

# SupportIQ Test Runner
# Runs all tests: linting, type checking, unit tests, integration tests, and E2E tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run command and handle errors
run_command() {
    local cmd="$1"
    local description="$2"
    
    print_status "Running: $description"
    
    if eval "$cmd"; then
        print_success "$description completed successfully"
    else
        print_error "$description failed"
        return 1
    fi
}

# Main test execution
main() {
    echo "🚀 SupportIQ Test Suite"
    echo "========================"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the project root."
        exit 1
    fi
    
    # Check Node.js version
    if ! command_exists node; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    NODE_VERSION=$(node --version)
    print_status "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_status "Installing dependencies..."
        npm install
    fi
    
    # Run tests in sequence
    local exit_code=0
    
    # 1. Linting
    print_status "Step 1/6: Running ESLint..."
    if run_command "npm run lint" "ESLint"; then
        print_success "Code style check passed"
    else
        print_error "Code style check failed"
        exit_code=1
    fi
    
    # 2. Type checking
    print_status "Step 2/6: Running TypeScript type checking..."
    if run_command "npm run type-check" "TypeScript type checking"; then
        print_success "Type checking passed"
    else
        print_error "Type checking failed"
        exit_code=1
    fi
    
    # 3. Unit tests
    print_status "Step 3/6: Running unit tests..."
    if run_command "npm run test:unit" "Unit tests"; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        exit_code=1
    fi
    
    # 4. Integration tests
    print_status "Step 4/6: Running integration tests..."
    if run_command "npm run test:integration" "Integration tests"; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        exit_code=1
    fi
    
    # 5. Test coverage
    print_status "Step 5/6: Generating test coverage report..."
    if run_command "npm run test:coverage" "Test coverage"; then
        print_success "Coverage report generated"
    else
        print_warning "Coverage report generation failed (continuing...)"
    fi
    
    # 6. E2E tests (optional - can be skipped)
    if [ "$1" != "--skip-e2e" ]; then
        print_status "Step 6/6: Running E2E tests..."
        if run_command "npm run test:e2e" "E2E tests"; then
            print_success "E2E tests passed"
        else
            print_warning "E2E tests failed (continuing...)"
        fi
    else
        print_warning "Skipping E2E tests (--skip-e2e flag provided)"
    fi
    
    # Summary
    echo ""
    echo "📊 Test Summary"
    echo "==============="
    
    if [ $exit_code -eq 0 ]; then
        print_success "All tests completed successfully! 🎉"
        echo ""
        echo "Next steps:"
        echo "  • Run 'npm run build' to build for production"
        echo "  • Run 'npm run deploy' to deploy to production"
        echo "  • Check coverage report in coverage/ directory"
    else
        print_error "Some tests failed. Please fix the issues above."
        echo ""
        echo "Common fixes:"
        echo "  • Run 'npm run lint:fix' to auto-fix linting issues"
        echo "  • Check TypeScript errors in the output above"
        echo "  • Review failing test cases"
    fi
    
    exit $exit_code
}

# Handle command line arguments
case "${1:-}" in
    --help|-h)
        echo "SupportIQ Test Runner"
        echo ""
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --skip-e2e    Skip E2E tests (useful for CI/CD)"
        echo "  --help, -h    Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0              # Run all tests"
        echo "  $0 --skip-e2e   # Run all tests except E2E"
        exit 0
        ;;
    --skip-e2e)
        main --skip-e2e
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac 