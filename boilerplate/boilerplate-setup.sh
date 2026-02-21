```bash
#!/bin/bash
# AI-Powered Development Boilerplate Bootstrap Script
# 用途：为 macOS/Linux 用户一键初始化新项目骨架
#
# 使用：
#   bash bootstrap-new-project.sh my-app react
#   bash bootstrap-new-project.sh my-api node
#
# 参数：
#   $1: 项目名称
#   $2: 框架类型 (react|vue|svelte|next|node) - 默认: react

set -e

PROJECT_NAME="${1:-}"
FRAMEWORK="${2:-react}"
VALID_FRAMEWORKS="react vue svelte next node"

if [ -z "$PROJECT_NAME" ]; then
    echo "❌ Usage: bash bootstrap-new-project.sh <project-name> [framework]"
    echo ""
    echo "Frameworks: react, vue, svelte, next, node"
    echo "Example: bash bootstrap-new-project.sh my-app react"
    exit 1
fi

if ! echo "$VALID_FRAMEWORKS" | grep -q "$FRAMEWORK"; then
    echo "❌ Invalid framework: $FRAMEWORK"
    echo "Valid options: $VALID_FRAMEWORKS"
    exit 1
fi

# 直接调用 Node.js 脚本
node boilerplate-setup.mjs "$PROJECT_NAME" --framework="$FRAMEWORK"

```
