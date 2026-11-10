#!/usr/bin/env bash
# Controlled lint-failure demo. Usage: scripts/lint-demo.sh break|fix
# Refuses to run on main so main is never broken on purpose.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" == "main" || "$branch" == "HEAD" ]]; then
  echo "Refusing to run on '$branch'. Create a feature branch first, e.g.: git switch -c demo/lint-failure" >&2
  exit 1
fi
file=src/lint-demo.ts
case "${1:-}" in
  break)
    # `debugger` violates oxlint's no-debugger rule (an error), so `npm run lint` fails.
    printf '%s\n' 'export function lintDemo(): number {' '  debugger' '  return 1' '}' > "$file"
    echo "Added $file with a deliberate lint error. Commit and push to see CI fail." ;;
  fix)
    rm -f "$file"
    echo "Removed $file. Commit and push to see CI pass." ;;
  *) echo "Usage: $0 break|fix" >&2; exit 2 ;;
esac
