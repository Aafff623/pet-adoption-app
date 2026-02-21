#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MANIFEST_PATH="${REPO_ROOT}/.ai/manifest.json"

if [[ ! -f "${MANIFEST_PATH}" ]]; then
  echo "❌ 缺少文件: .ai/manifest.json"
  exit 1
fi

python3 - "${REPO_ROOT}" <<'PY'
from __future__ import annotations

import datetime
import json
import sys
from pathlib import Path

repo_root = Path(sys.argv[1]).resolve()
manifest_path = repo_root / ".ai" / "manifest.json"

try:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
except Exception as exc:
    print(f"❌ manifest 解析失败: {exc}")
    raise SystemExit(1)

cursor_target = (manifest.get("targets") or {}).get("cursor")
if not cursor_target:
    print("❌ manifest 中缺少 targets.cursor")
    raise SystemExit(1)

ruleset_name = (cursor_target.get("ruleset") or "").strip()
if not ruleset_name:
    print("❌ manifest 中 targets.cursor.ruleset 为空")
    raise SystemExit(1)

rulesets = manifest.get("rulesets") or {}
rule_files = rulesets.get(ruleset_name)
if not isinstance(rule_files, list):
    print(f"❌ manifest 中未找到 ruleset: {ruleset_name}")
    raise SystemExit(1)

rules_dir_rel = (cursor_target.get("rulesDir") or ".cursor/rules").strip()
output_file_name = (cursor_target.get("outputFile") or "PROJECT_RULES.md").strip()
output_path = (repo_root / rules_dir_rel / output_file_name).resolve()
output_path.parent.mkdir(parents=True, exist_ok=True)

lines: list[str] = []
lines.append("# Project Rules (generated)")
lines.append("")
lines.append(f"Generated at: {datetime.datetime.now().astimezone().strftime('%Y-%m-%d %H:%M:%S %z')}")
lines.append("")

for rule_rel in rule_files:
    rule_rel_text = str(rule_rel)
    lines.append(f"## Source: {rule_rel_text}")
    lines.append("")
    rule_path = (repo_root / rule_rel_text).resolve()

    if rule_path.exists() and rule_path.is_file():
      content = rule_path.read_text(encoding="utf-8")
      if content.strip():
          lines.append(content.rstrip())
    else:
      lines.append(f"- Missing rule file: {rule_rel_text}")

    lines.append("")

skills_root = repo_root / ".cursor" / "skills"
lines.append("## Skills Index")
lines.append("")

if skills_root.exists() and skills_root.is_dir():
    skills = sorted([p.name for p in skills_root.iterdir() if p.is_dir()])
    if skills:
        lines.extend([f"- {name}" for name in skills])
    else:
        lines.append("- (none)")
else:
    lines.append("- (none)")

output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

output_rel = output_path.relative_to(repo_root).as_posix()
print(f"✅ 已生成: {output_rel}")
print("提示：不修改 .github/copilot-instructions.md（如需覆盖需显式启用）")
PY
