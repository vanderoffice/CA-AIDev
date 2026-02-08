#!/usr/bin/env bash
set -euo pipefail

# deploy-bot.sh — Deploy a bot-track project (vanderdev-website SPA page) to VPS
# Usage: deploy-bot.sh --name <slug> [--host <vps-host>] [--website-dir <path>] [--dry-run]

CURRENT_STEP=""
trap 'if [[ -n "$CURRENT_STEP" ]]; then echo "Error: Deploy failed at step: $CURRENT_STEP" >&2; fi' ERR

# --- Usage ----------------------------------------------------------------

usage() {
  cat <<'USAGE'
Usage: deploy-bot.sh --name <slug> [--host <vps-host>] [--website-dir <path>] [--dry-run]

Required flags:
  --name          Bot slug (e.g. waterbot, water-bot)

Optional flags:
  --host          VPS hostname (default: $VPS_HOST env var)
  --website-dir   Path to vanderdev-website repo
                  (default: $HOME/Documents/GitHub/vanderdev-website)
  --dry-run       Print commands without executing

Steps performed:
  1. Verify bot page exists in vanderdev-website
  2. npm run build in vanderdev-website
  3. rsync dist/ to VPS
  4. Verify deployment via curl
  5. Print success + reminders

Examples:
  deploy-bot.sh --name waterbot
  deploy-bot.sh --name water-bot --dry-run
  deploy-bot.sh --name kiddosbot --host 100.74.27.128
USAGE
}

# --- Helpers --------------------------------------------------------------

slug_to_pascal() {
  # Convert slug to PascalCase: water-bot → WaterBot, waterbot → Waterbot
  local slug="$1"
  local result=""
  local IFS='-'
  for segment in $slug; do
    result+="$(echo "${segment:0:1}" | tr '[:lower:]' '[:upper:]')${segment:1}"
  done
  echo "$result"
}

# --- Parse flags ----------------------------------------------------------

NAME=""
VPS="${VPS_HOST:-}"
WEBSITE_DIR="$HOME/Documents/GitHub/vanderdev-website"
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name)
      NAME="$2"
      shift 2
      ;;
    --host)
      VPS="$2"
      shift 2
      ;;
    --website-dir)
      WEBSITE_DIR="$2"
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

# Validate VPS host (not needed for dry-run)
if [[ "$DRY_RUN" == false && -z "$VPS" ]]; then
  echo "Error: --host is required (or set \$VPS_HOST env var)" >&2
  exit 1
fi

PASCAL_NAME=$(slug_to_pascal "$NAME")

# --- Dry-run mode ---------------------------------------------------------

if [[ "$DRY_RUN" == true ]]; then
  echo "--- DRY RUN: Commands that would execute ---"
  echo ""
  echo "1. Check page exists: ${WEBSITE_DIR}/src/pages/${PASCAL_NAME}.jsx"
  echo "2. Build:  cd ${WEBSITE_DIR} && npm run build"
  echo "3. Deploy: rsync -avz --delete ${WEBSITE_DIR}/dist/ ${VPS:-\$VPS_HOST}:/root/vanderdev-website/dist/"
  echo "4. Verify: ssh ${VPS:-\$VPS_HOST} \"curl -sf http://localhost/ | head -1\""
  echo ""
  echo "--- Bot URL: https://vanderdev.net/${NAME} ---"
  exit 0
fi

# --- Pre-flight checks ----------------------------------------------------

CURRENT_STEP="Pre-flight: check npm"
command -v npm >/dev/null 2>&1 || { echo "Error: npm not found" >&2; exit 1; }

CURRENT_STEP="Pre-flight: check rsync"
command -v rsync >/dev/null 2>&1 || { echo "Error: rsync not found" >&2; exit 1; }

CURRENT_STEP="Pre-flight: check SSH connectivity"
ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS}" "echo ok" >/dev/null 2>&1 || {
  echo "Error: Cannot connect to ${VPS} via SSH" >&2
  exit 1
}

# --- Step 1: Verify bot page exists ---------------------------------------

CURRENT_STEP="Verify bot page exists"
PAGE_FILE="${WEBSITE_DIR}/src/pages/${PASCAL_NAME}.jsx"

if [[ ! -f "$PAGE_FILE" ]]; then
  echo "Error: Bot page not found: ${PAGE_FILE}" >&2
  echo "  Create src/pages/${PASCAL_NAME}.jsx in vanderdev-website first." >&2
  echo "  Use factory bot page template as starting point." >&2
  exit 1
fi

echo "✓ Found page: src/pages/${PASCAL_NAME}.jsx"

# --- Step 2: Build --------------------------------------------------------

CURRENT_STEP="npm run build"
echo "Building vanderdev-website..."
(cd "$WEBSITE_DIR" && npm run build)
echo "✓ Build complete"

# --- Step 3: rsync to VPS ------------------------------------------------

CURRENT_STEP="rsync dist/ to VPS"
echo "Deploying dist/ to ${VPS}..."
rsync -avz --delete "${WEBSITE_DIR}/dist/" "${VPS}:/root/vanderdev-website/dist/"
echo "✓ Files synced"

# --- Step 4: Verify deployment --------------------------------------------

CURRENT_STEP="Verify deployment"
echo "Verifying deployment..."
RESULT=$(ssh "${VPS}" "curl -sf http://localhost/ | head -1" 2>/dev/null || true)

if [[ -z "$RESULT" ]]; then
  echo "Warning: Could not verify deployment via curl (may need nginx restart)" >&2
else
  echo "✓ Deployment verified (nginx serving content)"
fi

# --- Step 5: Success ------------------------------------------------------

CURRENT_STEP=""
echo ""
echo "✓ Deployed. Bot available at https://vanderdev.net/${NAME}"
echo ""
echo "Reminders:"
echo "  - Ensure App.jsx has route for /${NAME}"
echo "  - Ensure n8n webhooks are configured"
echo "  - Ensure Supabase schema exists (run setup-supabase-schema.sh if not)"
