#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
ALL_PASSED=1

check_path() {
  local rel_path="$1"
  local kind="$2"
  local full_path="${REPO_ROOT}/${rel_path}"

  if [[ ! -e "${full_path}" ]]; then
    echo "❌ ${rel_path}"
    ALL_PASSED=0
    return
  fi

  if [[ "${kind}" == "file" && ! -f "${full_path}" ]]; then
    echo "❌ ${rel_path}"
    ALL_PASSED=0
    return
  fi

  if [[ "${kind}" == "dir" && ! -d "${full_path}" ]]; then
    echo "❌ ${rel_path}"
    ALL_PASSED=0
    return
  fi

  echo "✅ ${rel_path}"
}

check_path ".ai/manifest.json" "file"
check_path ".ai/mcp/servers.json" "file"
check_path ".ai/skills/index.md" "file"
check_path ".cursor/rules/PROJECT_RULES.md" "file"
check_path ".vscode/settings.json" "file"
check_path "node_modules" "dir"

if [[ "${ALL_PASSED}" -ne 1 ]]; then
  exit 1
fi
