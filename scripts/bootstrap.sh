#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

require_cmd() {
  local cmd="$1"
  if ! command -v "${cmd}" >/dev/null 2>&1; then
    echo "❌ 未检测到命令: ${cmd}"
    exit 1
  fi
  echo "✅ 已检测到命令: ${cmd}"
}

require_cmd node
require_cmd python3

bash "${SCRIPT_DIR}/sync-ai.sh"
node "${SCRIPT_DIR}/sync-skills.mjs"

if [[ ! -f "${REPO_ROOT}/.env.local" && -f "${REPO_ROOT}/.env.local.example" ]]; then
  echo "提示：检测到 .env.local.example，当前缺少 .env.local，请按需复制并填写配置。"
fi
