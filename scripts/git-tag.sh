#!/bin/bash
# Tag the current commit with the core package version (vX.Y.Z) and push the tag.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CORE_PKG_JSON="packages/core/package.json"
VERSION=$(node -p "require('./$CORE_PKG_JSON').version")
if [ -z "$VERSION" ]; then
  echo "Could not read the version from $CORE_PKG_JSON."
  exit 1
fi
TAG="v$VERSION"

if [ -n "$(git status --porcelain)" ]; then
  echo "Warning: the working tree has uncommitted changes; $TAG will point at the last commit."
fi

if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
  echo "Tag $TAG already exists locally."
else
  echo "Creating tag $TAG on $(git rev-parse --short HEAD)..."
  git tag "$TAG"
fi

if [ -n "$(git ls-remote --tags origin "refs/tags/$TAG")" ]; then
  echo "Tag $TAG already exists on origin."
else
  echo "Pushing $TAG to origin..."
  git push origin "refs/tags/$TAG"
  echo "Pushed $TAG."
fi
