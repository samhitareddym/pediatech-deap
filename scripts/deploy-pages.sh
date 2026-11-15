#!/usr/bin/env bash
# Publish the current main to https://tburk0.github.io/pediatech-deap/ (gh-pages branch of TBURK0's copy).
# Run from the repo root in Git Bash: bash scripts/deploy-pages.sh
set -e
git fetch -q origin
T=$(mktemp -d)
git worktree add -q --detach "$T/src" origin/main
(cd "$T/src/app" && npm ci --silent && npx vite build --base=./)
cp -r "$T/src/app/dist" "$T/site" && cp -r "$T/src/presentation" "$T/site/presentation" && touch "$T/site/.nojekyll"
(cd "$T/site" && git init -q -b gh-pages && git add -A && git commit -q -m "Deploy $(git -C "$T/src" rev-parse --short HEAD)" && git push -q -f https://github.com/TBURK0/pediatech-deap.git gh-pages)
git worktree remove --force "$T/src"; rm -rf "$T"
echo "Deployed. Live in ~1 minute: https://tburk0.github.io/pediatech-deap/#demo"
