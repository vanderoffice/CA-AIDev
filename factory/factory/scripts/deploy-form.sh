#!/usr/bin/env bash
set -euo pipefail

# deploy-form.sh — Deploy a form-track project (Docker container) to VPS
# Usage: deploy-form.sh --name <slug> --path-prefix <url-path> [--host <vps-host>] [--dry-run]

CURRENT_STEP=""
trap 'if [[ -n "$CURRENT_STEP" ]]; then echo "Error: Deploy failed at step: $CURRENT_STEP" >&2; fi' ERR

# --- Usage ----------------------------------------------------------------

usage() {
  cat <<'USAGE'
Usage: deploy-form.sh --name <slug> --path-prefix <url-path> [--host <vps-host>] [--project-dir <path>] [--dry-run]

Required flags:
  --name          Project slug (e.g. ecos, calfire)
  --path-prefix   URL path prefix (e.g. /ecosform, /calfire)

Optional flags:
  --host          VPS hostname (default: $VPS_HOST env var)
  --project-dir   Local project directory
                  (default: $HOME/Documents/GitHub/Automation/<name>)
  --dry-run       Print commands without executing

Steps performed:
  1. Verify docker-compose.prod.yml exists locally
  2. rsync project files to VPS (excludes node_modules, .git, dist)
  3. docker-compose up --build -d on VPS
  4. Wait 5s, verify container is running
  5. Verify HTTP response via nginx-proxy
  6. Print success + URL

Note: Supabase URLs and anon keys are NOT in this script.
They live in the project's VPS .env file, read via docker-compose build args.

Examples:
  deploy-form.sh --name ecos --path-prefix /ecosform
  deploy-form.sh --name calfire --path-prefix /calfire --dry-run
  deploy-form.sh --name newform --path-prefix /newform --host 100.74.27.128
USAGE
}

# --- Parse flags ----------------------------------------------------------

NAME=""
PATH_PREFIX=""
VPS="${VPS_HOST:-}"
PROJECT_DIR=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      NAME="$2"
      shift 2
      ;;
    --path-prefix)
      PATH_PREFIX="$2"
      shift 2
      ;;
    --host)
      VPS="$2"
      shift 2
      ;;
    --project-dir)
      PROJECT_DIR="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Error: Unknown flag '$1'" >&2
      usage >&2
      exit 1
      ;;
  esac
done

# --- Validate flags -------------------------------------------------------

ERRORS=()

if [[ -z "$NAME" ]]; then
  ERRORS+=("--name is required")
fi

if [[ -z "$PATH_PREFIX" ]]; then
  ERRORS+=("--path-prefix is required")
fi

if [[ ${#ERRORS[@]} -gt 0 ]]; then
  for err in "${ERRORS[@]}"; do
    echo "Error: $err" >&2
  done
  echo "" >&2
  usage >&2
  exit 1
fi

# Validate --name
if ! [[ "$NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
  echo "Error: --name must be lowercase alphanumeric + hyphens, starting with a letter (got '$NAME')" >&2
  exit 1
fi

# Validate --path-prefix starts with /
if ! [[ "$PATH_PREFIX" =~ ^/ ]]; then
  echo "Error: --path-prefix must start with / (got '$PATH_PREFIX')" >&2
  exit 1
fi

# Set default project dir
if [[ -z "$PROJECT_DIR" ]]; then
  PROJECT_DIR="$HOME/Documents/GitHub/Automation/${NAME}"
fi

# Validate VPS host (not needed for dry-run)
if [[ "$DRY_RUN" == false && -z "$VPS" ]]; then
  echo "Error: --host is required (or set \$VPS_HOST env var)" >&2
  exit 1
fi

# --- Dry-run mode ---------------------------------------------------------

if [[ "$DRY_RUN" == true ]]; then
  echo "--- DRY RUN: Commands that would execute ---"
  echo ""
  echo "1. Check: ${PROJECT_DIR}/docker-compose.prod.yml exists"
  echo "2. Sync:  rsync -avz --exclude node_modules --exclude .git --exclude dist ${PROJECT_DIR}/ ${VPS:-\$VPS_HOST}:/root/Automation/${NAME}/"
  echo "3. Build: ssh ${VPS:-\$VPS_HOST} \"cd /root/Automation/${NAME} && docker-compose -f docker-compose.prod.yml up --build -d\""
  echo "4. Wait:  sleep 5"
  echo "5. Check: ssh ${VPS:-\$VPS_HOST} \"docker ps --filter name=${NAME} --format '{{.Status}}'\""
  echo "6. Curl:  ssh ${VPS:-\$VPS_HOST} \"curl -sf http://localhost${PATH_PREFIX}/ | head -1\""
  echo ""
  echo "--- Form URL: https://vanderdev.net${PATH_PREFIX} ---"
  exit 0
fi

# --- Pre-flight checks ----------------------------------------------------

CURRENT_STEP="Pre-flight: check SSH connectivity"
ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS}" "echo ok" >/dev/null 2>&1 || {
  echo "Error: Cannot connect to ${VPS} via SSH" >&2
  exit 1
}

# --- Step 1: Verify docker-compose.prod.yml exists -----------------------

CURRENT_STEP="Verify docker-compose.prod.yml"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.prod.yml"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: docker-compose.prod.yml not found at: ${COMPOSE_FILE}" >&2
  echo "  Create docker-compose.prod.yml in your project directory first." >&2
  echo "  See ECOS pattern: build args for VITE_SUPABASE_URL, nginx-proxy labels." >&2
  exit 1
fi

echo "✓ Found docker-compose.prod.yml"

# --- Step 2: rsync project files to VPS ----------------------------------

CURRENT_STEP="rsync project files to VPS"
echo "Syncing project files to ${VPS}:/root/Automation/${NAME}/..."
rsync -avz \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  "${PROJECT_DIR}/" "${VPS}:/root/Automation/${NAME}/"
echo "✓ Files synced"

# --- Step 3: docker-compose up --build ------------------------------------

CURRENT_STEP="docker-compose up --build"
echo "Building and starting container on VPS..."
ssh "${VPS}" "cd /root/Automation/${NAME} && docker-compose -f docker-compose.prod.yml up --build -d"
echo "✓ Container started"

# --- Step 4: Wait and verify container ------------------------------------

CURRENT_STEP="Verify container running"
echo "Waiting 5 seconds for container startup..."
sleep 5

CONTAINER_STATUS=$(ssh "${VPS}" "docker ps --filter name=${NAME} --format '{{.Status}}'" 2>/dev/null || true)

if [[ -z "$CONTAINER_STATUS" ]]; then
  echo "Warning: Container '${NAME}' not found in docker ps" >&2
  echo "  Check: ssh ${VPS} \"docker-compose -f /root/Automation/${NAME}/docker-compose.prod.yml logs\"" >&2
else
  echo "✓ Container status: ${CONTAINER_STATUS}"
fi

# --- Step 5: Verify HTTP response -----------------------------------------

CURRENT_STEP="Verify HTTP response"
echo "Verifying HTTP response..."
HTTP_RESULT=$(ssh "${VPS}" "curl -sf http://localhost${PATH_PREFIX}/ | head -1" 2>/dev/null || true)

if [[ -z "$HTTP_RESULT" ]]; then
  echo "Warning: No HTTP response at localhost${PATH_PREFIX}/ (nginx-proxy may need config)" >&2
else
  echo "✓ HTTP response received"
fi

# --- Step 6: Success ------------------------------------------------------

CURRENT_STEP=""
echo ""
echo "✓ Deployed. Form available at https://vanderdev.net${PATH_PREFIX}"
echo ""
echo "Reminders:"
echo "  - Verify .env on VPS has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
echo "  - Verify nginx-proxy labels in docker-compose.prod.yml"
echo "  - Verify Supabase schema exists (run setup-supabase-schema.sh if not)"
