#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

step() { echo -e "\n${CYAN}${BOLD}[$1/$TOTAL] $2${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }
err()  { echo -e "${RED}  ✗ $1${NC}"; exit 1; }
warn() { echo -e "${YELLOW}  ⚠ $1${NC}"; }

# ---------- Usage ----------
usage() {
  echo -e "${BOLD}Usage:${NC}"
  echo "  ./scripts/publish.sh          Publish all packages"
  echo "  ./scripts/publish.sh main     Publish core + react + vue + svelte"
  echo "  ./scripts/publish.sh angular  Publish angular only"
  echo ""
  echo "Options:"
  echo "  --dry-run    Run npm publish with --dry-run (no actual publish)"
  echo "  --skip-build Skip the build step"
  exit 0
}

# ---------- Parse args ----------
MODE="all"
DRY_RUN=""
SKIP_BUILD=false

for arg in "$@"; do
  case "$arg" in
    main)      MODE="main" ;;
    angular)   MODE="angular" ;;
    all)       MODE="all" ;;
    --dry-run) DRY_RUN="--dry-run" ;;
    --skip-build) SKIP_BUILD=true ;;
    -h|--help) usage ;;
    *) echo -e "${RED}Unknown argument: $arg${NC}"; usage ;;
  esac
done

if [ -n "$DRY_RUN" ]; then
  warn "Dry-run mode — nothing will actually be published"
fi

# ---------- Pre-flight checks ----------
echo -e "${BOLD}Pre-flight checks${NC}"

# npm login
if ! npm whoami &>/dev/null; then
  err "Not logged in to npm. Run 'npm login' first."
fi
NPM_USER=$(npm whoami)
ok "Logged in as ${BOLD}$NPM_USER${NC}"

# Clean working tree
cd "$ROOT"
if [ -n "$(git status --porcelain)" ]; then
  warn "Working tree is not clean. Consider committing changes first."
fi

# ---------- Determine steps ----------
MAIN_PKGS=(core react vue svelte)

build_main() {
  for pkg in "${MAIN_PKGS[@]}"; do
    step "$STEP" "Building packages/$pkg"
    STEP=$((STEP + 1))
    if ! npm run build --workspace="packages/$pkg" 2>&1; then
      err "Build failed for packages/$pkg"
    fi
    ok "packages/$pkg built"
  done
}

build_angular() {
  step "$STEP" "Building packages/angular"
  STEP=$((STEP + 1))
  if ! npm run build --workspace="packages/angular" 2>&1; then
    err "Build failed for packages/angular"
  fi
  cp "$ROOT/packages/angular/README.md" "$ROOT/packages/angular/LICENSE" "$ROOT/packages/angular/dist/" 2>/dev/null || true
  ok "packages/angular built (dist/ ready)"
}

publish_pkg() {
  local name=$1
  local dir=$2
  step "$STEP" "Publishing $name"
  STEP=$((STEP + 1))

  # Show version
  local version
  version=$(node -e "console.log(require('$dir/package.json').version)")
  echo -e "  version: ${BOLD}$version${NC}"

  # Check if already published
  if npm view "$name@$version" version &>/dev/null && [ -z "$DRY_RUN" ]; then
    warn "$name@$version already exists on npm — skipping"
    return 0
  fi

  if ! (cd "$dir" && npm publish --access public $DRY_RUN 2>&1); then
    err "Failed to publish $name"
  fi
  ok "$name@$version published"
}

# ---------- Calculate total steps ----------
STEP=1
case "$MODE" in
  main)
    TOTAL=8  # 4 build + 4 publish
    echo -e "${BOLD}Publishing: core, react, vue, svelte${NC}"
    ;;
  angular)
    TOTAL=2  # 1 build + 1 publish
    echo -e "${BOLD}Publishing: angular${NC}"
    ;;
  all)
    TOTAL=10 # 5 build + 5 publish
    echo -e "${BOLD}Publishing: all packages${NC}"
    ;;
esac

# ---------- Build ----------
if [ "$SKIP_BUILD" = true ]; then
  warn "Skipping build (--skip-build)"
  # Adjust step counter
  case "$MODE" in
    main)    STEP=5 ;;
    angular) STEP=2 ;;
    all)     STEP=6 ;;
  esac
else
  case "$MODE" in
    main)    build_main ;;
    angular) build_angular ;;
    all)     build_main; build_angular ;;
  esac
fi

# ---------- Publish ----------
if [ "$MODE" = "main" ] || [ "$MODE" = "all" ]; then
  # Core must be first
  publish_pkg "@dayflow/blossom-color-picker"        "$ROOT/packages/core"
  publish_pkg "@dayflow/blossom-color-picker-react"   "$ROOT/packages/react"
  publish_pkg "@dayflow/blossom-color-picker-vue"     "$ROOT/packages/vue"
  publish_pkg "@dayflow/blossom-color-picker-svelte"  "$ROOT/packages/svelte"
fi

if [ "$MODE" = "angular" ] || [ "$MODE" = "all" ]; then
  publish_pkg "@dayflow/blossom-color-picker-angular" "$ROOT/packages/angular/dist"
fi

# ---------- Done ----------
echo -e "\n${GREEN}${BOLD}Done!${NC}"
if [ -n "$DRY_RUN" ]; then
  warn "This was a dry run. Re-run without --dry-run to actually publish."
fi
