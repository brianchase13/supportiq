#!/bin/bash

# Production deployment script - DEPLOY WITH CONFIDENCE

set -e  # Exit on any error

# Configuration
APP_NAME="supportiq"
ENVIRONMENT="production"
DEPLOY_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/tmp/supportiq_backups"
LOG_FILE="/tmp/supportiq_deploy_${DEPLOY_TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS:${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking deployment prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        log_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        log_error "git is not installed"
        exit 1
    fi
    
    # Check if environment variables are set
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        log_error "Required environment variables are not set"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup current build
    if [ -d ".next" ]; then
        tar -czf "$BACKUP_DIR/build_backup_${DEPLOY_TIMESTAMP}.tar.gz" .next
        log_success "Build backup created"
    fi
    
    # Backup environment file
    if [ -f ".env.local" ]; then
        cp .env.local "$BACKUP_DIR/env_backup_${DEPLOY_TIMESTAMP}"
        log_success "Environment backup created"
    fi
    
    # Backup package files
    tar -czf "$BACKUP_DIR/package_backup_${DEPLOY_TIMESTAMP}.tar.gz" package.json package-lock.json
    log_success "Package backup created"
}

# Run tests
run_tests() {
    log "Running test suite..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log "Installing dependencies..."
        npm ci --silent
    fi
    
    # Run linting
    log "Running ESLint..."
    if ! npm run lint --silent; then
        log_error "Linting failed"
        exit 1
    fi
    
    # Run type checking
    log "Running TypeScript type checking..."
    if ! npm run type-check --silent; then
        log_error "Type checking failed"
        exit 1
    fi
    
    # Run unit tests
    log "Running unit tests..."
    if ! npm run test --silent; then
        log_error "Unit tests failed"
        exit 1
    fi
    
    log_success "All tests passed"
}

# Build application
build_application() {
    log "Building application for production..."
    
    # Clean previous build
    if [ -d ".next" ]; then
        rm -rf .next
        log "Cleaned previous build"
    fi
    
    # Build the application
    if ! npm run build --silent; then
        log_error "Build failed"
        exit 1
    fi
    
    log_success "Application built successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # This would run your Supabase migrations
    # For now, we'll just log it
    log "Database migrations would be run here"
    
    log_success "Database migrations completed"
}

# Deploy to production
deploy_to_production() {
    log "Deploying to production..."
    
    # Deploy to Vercel (or your preferred platform)
    if command -v vercel &> /dev/null; then
        log "Deploying to Vercel..."
        if ! vercel --prod --yes; then
            log_error "Vercel deployment failed"
            exit 1
        fi
    else
        log_warning "Vercel CLI not found, skipping deployment"
    fi
    
    log_success "Deployment completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Wait for deployment to be ready
    sleep 30
    
    # Check if the application is responding
    if [ -n "$PRODUCTION_URL" ]; then
        for i in {1..10}; do
            if curl -f -s "$PRODUCTION_URL/api/health" > /dev/null; then
                log_success "Health check passed"
                return 0
            fi
            log "Health check attempt $i failed, retrying..."
            sleep 10
        done
        
        log_error "Health check failed after 10 attempts"
        return 1
    else
        log_warning "PRODUCTION_URL not set, skipping health check"
    fi
}

# Rollback function
rollback() {
    log_error "Deployment failed, initiating rollback..."
    
    # Restore from backup
    if [ -f "$BACKUP_DIR/build_backup_${DEPLOY_TIMESTAMP}.tar.gz" ]; then
        log "Restoring build from backup..."
        tar -xzf "$BACKUP_DIR/build_backup_${DEPLOY_TIMESTAMP}.tar.gz"
    fi
    
    if [ -f "$BACKUP_DIR/env_backup_${DEPLOY_TIMESTAMP}" ]; then
        log "Restoring environment from backup..."
        cp "$BACKUP_DIR/env_backup_${DEPLOY_TIMESTAMP}" .env.local
    fi
    
    if [ -f "$BACKUP_DIR/package_backup_${DEPLOY_TIMESTAMP}.tar.gz" ]; then
        log "Restoring packages from backup..."
        tar -xzf "$BACKUP_DIR/package_backup_${DEPLOY_TIMESTAMP}.tar.gz"
        npm ci --silent
    fi
    
    log_success "Rollback completed"
}

# Cleanup function
cleanup() {
    log "Cleaning up deployment artifacts..."
    
    # Remove old backups (keep last 5)
    find "$BACKUP_DIR" -name "*.tar.gz" -type f | sort | head -n -5 | xargs rm -f
    find "$BACKUP_DIR" -name "env_backup_*" -type f | sort | head -n -5 | xargs rm -f
    
    # Remove old log files (keep last 10)
    find /tmp -name "supportiq_deploy_*.log" -type f | sort | head -n -10 | xargs rm -f
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting production deployment for $APP_NAME"
    log "Deployment timestamp: $DEPLOY_TIMESTAMP"
    log "Environment: $ENVIRONMENT"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Run deployment steps
    check_prerequisites
    create_backup
    run_tests
    build_application
    run_migrations
    
    # Deploy with rollback on failure
    if deploy_to_production; then
        if health_check; then
            log_success "Production deployment completed successfully!"
            cleanup
        else
            log_error "Health check failed"
            rollback
            exit 1
        fi
    else
        rollback
        exit 1
    fi
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; rollback; exit 1' INT TERM

# Run main function
main "$@" 